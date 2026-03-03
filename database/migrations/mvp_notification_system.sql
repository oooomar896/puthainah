-- ============================================
-- MVP Notification System - Quick Setup
-- Estimated Time: 30 minutes
-- ============================================

-- ============================================
-- 1. جدول تفضيلات الإشعارات
-- ============================================

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

-- تفعيل RLS
alter table public.notification_preferences enable row level security;

-- السياسات الأمنية
create policy "Users can view own preferences"
on public.notification_preferences
for select
using (auth.uid() = user_id);

create policy "Users can insert own preferences"
on public.notification_preferences
for insert
with check (auth.uid() = user_id);

create policy "Users can update own preferences"
on public.notification_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- إنشاء تفضيلات افتراضية للمستخدمين الجدد
create or replace function public.create_default_notification_preferences()
returns trigger as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_notification_prefs
  after insert on auth.users
  for each row execute function public.create_default_notification_preferences();

-- ملء التفضيلات للمستخدمين الموجودين
insert into public.notification_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;

comment on table public.notification_preferences is 'تفضيلات الإشعارات لكل مستخدم';

-- ============================================
-- 2. جدول سجل إرسال البريد الإلكتروني
-- ============================================

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

-- الفهارس لتحسين الأداء
create index idx_email_log_user_id on public.email_log(user_id);
create index idx_email_log_status on public.email_log(status);
create index idx_email_log_created_at on public.email_log(created_at desc);
create index idx_email_log_type on public.email_log(type);

-- تفعيل RLS
alter table public.email_log enable row level security;

-- السياسات الأمنية
-- ملاحظة: email_log يُدار فقط من خلال service role (Backend)
-- المستخدمون العاديون لا يمكنهم الوصول مباشرة

create policy "Service role can manage email logs"
on public.email_log
for all
using (true);

comment on table public.email_log is 'سجل جميع محاولات إرسال البريد الإلكتروني';

-- ============================================
-- 3. دالة للتحقق من التكرار
-- ============================================

create or replace function public.is_duplicate_email(
  p_user_id uuid,
  p_type text,
  p_subject text,
  p_window_minutes int default 60
)
returns boolean as $$
begin
  return exists (
    select 1 from public.email_log
    where user_id = p_user_id
    and type = p_type
    and subject = p_subject
    and status in ('sent', 'queued')
    and created_at > now() - (p_window_minutes || ' minutes')::interval
  );
end;
$$ language plpgsql security definer;

comment on function public.is_duplicate_email is 'التحقق من عدم إرسال بريد مكرر خلال فترة زمنية محددة';

-- ============================================
-- 4. دالة للحصول على إحصائيات البريد
-- ============================================

create or replace function public.get_email_stats(
  p_user_id uuid default null,
  p_days int default 30
)
returns table (
  total_sent bigint,
  total_failed bigint,
  total_skipped bigint,
  success_rate numeric
) as $$
begin
  return query
  select
    count(*) filter (where status = 'sent') as total_sent,
    count(*) filter (where status = 'failed') as total_failed,
    count(*) filter (where status = 'skipped') as total_skipped,
    round(
      (count(*) filter (where status = 'sent')::numeric / 
       nullif(count(*) filter (where status in ('sent', 'failed'))::numeric, 0)) * 100,
      2
    ) as success_rate
  from public.email_log
  where (p_user_id is null or user_id = p_user_id)
  and created_at > now() - (p_days || ' days')::interval;
end;
$$ language plpgsql security definer;

comment on function public.get_email_stats is 'الحصول على إحصائيات إرسال البريد الإلكتروني';

-- ============================================
-- ✅ تم! الآن قاعدة البيانات جاهزة
-- ============================================

-- للتحقق من نجاح التنفيذ، قم بتشغيل:
-- select * from public.notification_preferences limit 5;
-- select * from public.email_log limit 5;
