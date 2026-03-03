-- ==============================================================================
-- COMPLETE FIX: TICKET CHAT SYSTEM
-- Consolidates all fixes: Table Schema, Admin Check, RLS Policies
-- ==============================================================================

-- 1. FIX ADMIN CHECK (Make robust and case-insensitive)
create or replace function public.is_admin()
returns boolean as $$
declare
  is_admin_table boolean;
  is_admin_meta boolean;
begin
  -- Check 'admins' table
  select exists (
    select 1 from public.admins 
    where user_id = auth.uid()
  ) into is_admin_table;
  
  -- Check Metadata (Case Insensitive)
  select lower(coalesce(raw_user_meta_data->>'role', '')) = 'admin' 
  into is_admin_meta
  from auth.users
  where id = auth.uid();

  return is_admin_table or coalesce(is_admin_meta, false);
end;
$$ language plpgsql security definer;

-- 2. ENSURE TABLE EXISTS & SCHEMA IS CORRECT
-- We assume ticket_messages needs to reference public.users
create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz default now(),
  constraint message_length check (char_length(message) > 0)
);

-- Ensure indexes
create index if not exists idx_ticket_messages_ticket_id on public.ticket_messages(ticket_id);
create index if not exists idx_ticket_messages_created_at on public.ticket_messages(created_at);

-- 3. RESET & APPLY ROBUST RLS POLICIES
alter table public.ticket_messages enable row level security;

drop policy if exists "Users can view messages for their tickets" on public.ticket_messages;
drop policy if exists "Users can send messages to their tickets" on public.ticket_messages;

-- VIEW POLICY
create policy "Users can view messages for their tickets"
on public.ticket_messages for select
using (
  -- 1. Ticket Owner (Requester/Provider who created it)
  exists (
    select 1 from public.tickets t
    where t.id = ticket_messages.ticket_id
    and t.user_id = auth.uid()
  )
  or
  -- 2. Related Order Provider (Provider assigned to the order linked to ticket)
  exists (
    select 1 from public.tickets t
    join public.orders o on o.id = t.related_order_id
    where t.id = ticket_messages.ticket_id
    and o.provider_id in (select id from public.providers where user_id = auth.uid())
  )
  or
  -- 3. Admin
  public.is_admin()
);

-- INSERT POLICY
create policy "Users can send messages to their tickets"
on public.ticket_messages for insert
with check (
  -- 1. Ticket Owner
  exists (
    select 1 from public.tickets t
    where t.id = ticket_messages.ticket_id
    and t.user_id = auth.uid()
  )
  or
  -- 2. Related Order Provider
  exists (
    select 1 from public.tickets t
    join public.orders o on o.id = t.related_order_id
    where t.id = ticket_messages.ticket_id
    and o.provider_id in (select id from public.providers where user_id = auth.uid())
  )
  or
  -- 3. Admin
  public.is_admin()
);

-- 4. GRANT PERMISSIONS
grant all on public.ticket_messages to authenticated;
grant all on public.ticket_messages to service_role;
