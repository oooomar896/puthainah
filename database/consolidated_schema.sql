-- ==============================================================================
-- BACURA PLATFORM - CONSOLIDATED DATABASE SCHEMA
-- This file contains all the recent SQL migrations and table definitions
-- combined into a single executable script.
-- ==============================================================================

-- ==============================================================================
-- SECTION 1: CORE FIXES & AUTHENTICATION
-- (From fix_registration_login.sql)
-- ==============================================================================

-- 1.1 Auto-Confirm Email Trigger (Restricted to Requesters)
create or replace function public.auto_confirm_user()
returns trigger as $$
begin
  -- Only auto-confirm if the user role is 'Requester'
  -- We check raw_user_meta_data which contains the data sent during signUp
  if (new.raw_user_meta_data->>'role')::text ilike 'Requester' then
    new.email_confirmed_at = now();
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: Auto-Confirm User
drop trigger if exists on_auth_user_created_auto_confirm on auth.users;
create trigger on_auth_user_created_auto_confirm
  before insert on auth.users
  for each row execute function public.auto_confirm_user();

-- 1.2 Fix Tickets Table Schema
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status_id int,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  closed_at timestamptz
);

-- Ensure columns exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'tickets' and column_name = 'related_request_id') then
    alter table public.tickets add column related_request_id uuid null;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'tickets' and column_name = 'related_order_id') then
    alter table public.tickets add column related_order_id uuid null;
  end if;
end $$;


-- ==============================================================================
-- SECTION 2: NOTIFICATION PREFERENCES & LOGGING
-- (From mvp_notification_system.sql)
-- ==============================================================================

-- 2.1 Notification Preferences Table
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  order_updates boolean not null default true,
  billing_updates boolean not null default true,
  security_alerts boolean not null default true,
  marketing boolean not null default false,
  digest_mode text not null default 'immediate' check (digest_mode in ('immediate','daily','weekly')),
  quiet_hours_from time null,
  quiet_hours_to time null,
  updated_at timestamptz not null default now()
);

-- RLS for Notification Preferences
alter table public.notification_preferences enable row level security;
drop policy if exists "Users can view own preferences" on public.notification_preferences;
create policy "Users can view own preferences" on public.notification_preferences for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own preferences" on public.notification_preferences;
create policy "Users can insert own preferences" on public.notification_preferences for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own preferences" on public.notification_preferences;
create policy "Users can update own preferences" on public.notification_preferences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Function: Create default preferences
create or replace function public.create_default_notification_preferences()
returns trigger as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: Create default preferences on signup
drop trigger if exists on_auth_user_created_notification_prefs on auth.users;
create trigger on_auth_user_created_notification_prefs
  after insert on auth.users
  for each row execute function public.create_default_notification_preferences();

-- 2.2 Email Log Table
create table if not exists public.email_log (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  recipient_email text not null,
  type text not null check (type in ('order_updates', 'billing_updates', 'security_alerts', 'marketing')),
  subject text not null,
  status text not null default 'queued' check (status in ('queued','sent','failed','skipped')),
  error_text text null,
  attempts int not null default 0,
  provider text not null default 'zoho_smtp',
  provider_response text null,
  metadata jsonb null,
  created_at timestamptz not null default now(),
  sent_at timestamptz null
);

-- Indexes for Email Log
create index if not exists idx_email_log_user_id on public.email_log(user_id);
create index if not exists idx_email_log_status on public.email_log(status);
create index if not exists idx_email_log_created_at on public.email_log(created_at desc);
create index if not exists idx_email_log_type on public.email_log(type);

-- RLS for Email Log
alter table public.email_log enable row level security;
drop policy if exists "Service role can manage email logs" on public.email_log;
create policy "Service role can manage email logs" on public.email_log for all using (true);


-- ==============================================================================
-- SECTION 3: AUTOMATED NOTIFICATION TRIGGERS & QUEUE
-- (From auto_notification_triggers.sql)
-- ==============================================================================

-- 3.1 Notification Queue Table
create table if not exists public.notification_queue (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_type text not null check (notification_type in ('order_update', 'billing', 'security_alert', 'message', 'custom')),
  subject text not null,
  data jsonb not null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  attempts int not null default 0,
  max_attempts int not null default 3,
  error_message text null,
  sent_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for Queue
create index if not exists idx_notification_queue_status on public.notification_queue(status, priority, created_at);
create index if not exists idx_notification_queue_user_id on public.notification_queue(user_id);
create index if not exists idx_notification_queue_type on public.notification_queue(notification_type);

-- RLS for Queue
alter table public.notification_queue enable row level security;
drop policy if exists "Service role can manage notification queue" on public.notification_queue;
create policy "Service role can manage notification queue" on public.notification_queue for all using (true);

-- 3.2 Function: Trigger Order Status Notification
create or replace function public.trigger_order_status_notification()
returns trigger as $$
declare
  v_user_id uuid;
  v_status_message text;
begin
  if OLD.status is distinct from NEW.status then
    v_user_id := NEW.user_id;
    v_status_message := case NEW.status
      when 'pending' then 'طلبك قيد المراجعة'
      when 'in_progress' then 'جاري العمل على طلبك'
      when 'completed' then 'تم إكمال طلبك بنجاح!'
      when 'cancelled' then 'تم إلغاء الطلب'
      when 'paid' then 'تم استلام الدفعة بنجاح'
      else 'تم تحديث حالة طلبك'
    end;
    
    insert into public.notification_queue (
      user_id, notification_type, subject, data, priority, created_at
    ) values (
      v_user_id, 'order_update', 'تحديث الطلب #' || NEW.id,
      jsonb_build_object('order_id', NEW.id, 'status', NEW.status, 'message', v_status_message, 'old_status', OLD.status),
      case NEW.status when 'completed' then 'high' when 'cancelled' then 'high' else 'normal' end,
      now()
    );
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger on Orders
drop trigger if exists on_order_status_changed on public.orders;
create trigger on_order_status_changed
  after update on public.orders
  for each row execute function public.trigger_order_status_notification();

-- 3.3 Function: Trigger Message Notification
create or replace function public.trigger_message_notification()
returns trigger as $$
declare
  v_recipient_id uuid;
  v_sender_name text;
begin
  -- Resolve recipient
  if NEW.sender_id = (select user_id from public.orders where id = NEW.order_id) then
    select assigned_provider_id into v_recipient_id from public.orders where id = NEW.order_id;
  else
    select user_id into v_recipient_id from public.orders where id = NEW.order_id;
  end if;
  
  -- Resolve sender name
  select display_name into v_sender_name from public.profiles where id = NEW.sender_id;
  
  if v_recipient_id is not null then
    insert into public.notification_queue (
      user_id, notification_type, subject, data, priority
    ) values (
      v_recipient_id, 'message', 'رسالة جديدة من ' || coalesce(v_sender_name, 'مستخدم'),
      jsonb_build_object('message_id', NEW.id, 'order_id', NEW.order_id, 'sender_id', NEW.sender_id, 'sender_name', v_sender_name, 'message_preview', left(NEW.message, 100)),
      'normal'
    );
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger on Project Messages
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'project_messages') then
    drop trigger if exists on_message_created on public.project_messages;
    create trigger on_message_created
      after insert on public.project_messages
      for each row execute function public.trigger_message_notification();
  end if;
end $$;


-- ==============================================================================
-- SECTION 4: EDGE FUNCTIONS
-- (From edge_function_triggers.sql)
-- ==============================================================================

create or replace function public.notify_order_update_via_edge_function()
returns trigger as $$
declare
  v_supabase_url text := 'https://YOUR_PROJECT.supabase.co'; -- Replace with actual
  v_anon_key text := 'YOUR_ANON_KEY_HERE'; -- Replace with actual
begin
  if OLD.status is distinct from NEW.status then
    perform
      net.http_post(
        url := v_supabase_url || '/functions/v1/send-order-notification',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_anon_key),
        body := jsonb_build_object('record', jsonb_build_object('id', NEW.id, 'user_id', NEW.user_id, 'status', NEW.status, 'old_status', OLD.status))
      );
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger for Edge Functions
drop trigger if exists on_order_status_changed_edge on public.orders;
create trigger on_order_status_changed_edge
  after update on public.orders
  for each row execute function public.notify_order_update_via_edge_function();
