-- ============================================
-- Automatic Notification Triggers
-- File: database/migrations/auto_notification_triggers.sql
-- ============================================

-- ============================================
-- 1. Trigger لإرسال إشعار عند تحديث حالة الطلب
-- ============================================

create or replace function public.trigger_order_status_notification()
returns trigger as $$
declare
  v_user_id uuid;
  v_status_message text;
begin
  -- التحقق من تغيير الحالة فقط
  if OLD.status is distinct from NEW.status then
    
    -- جلب user_id من الطلب
    v_user_id := NEW.user_id;
    
    -- تحديد رسالة الحالة
    v_status_message := case NEW.status
      when 'pending' then 'طلبك قيد المراجعة'
      when 'in_progress' then 'جاري العمل على طلبك'
      when 'completed' then 'تم إكمال طلبك بنجاح!'
      when 'cancelled' then 'تم إلغاء الطلب'
      when 'paid' then 'تم استلام الدفعة بنجاح'
      else 'تم تحديث حالة طلبك'
    end;
    
    -- إدراج في جدول notification_queue للمعالجة
    insert into public.notification_queue (
      user_id,
      notification_type,
      subject,
      data,
      priority,
      created_at
    ) values (
      v_user_id,
      'order_update',
      'تحديث الطلب #' || NEW.id,
      jsonb_build_object(
        'order_id', NEW.id,
        'status', NEW.status,
        'message', v_status_message,
        'old_status', OLD.status
      ),
      case NEW.status
        when 'completed' then 'high'
        when 'cancelled' then 'high'
        else 'normal'
      end,
      now()
    );
    
    raise notice 'Notification queued for order % (status: % -> %)', NEW.id, OLD.status, NEW.status;
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

-- إنشاء الـ Trigger
drop trigger if exists on_order_status_changed on public.orders;
create trigger on_order_status_changed
  after update on public.orders
  for each row
  execute function public.trigger_order_status_notification();

comment on function public.trigger_order_status_notification is 'إرسال إشعار تلقائي عند تغيير حالة الطلب';

-- ============================================
-- 2. جدول طابور الإشعارات (Notification Queue)
-- ============================================

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

-- الفهارس
create index idx_notification_queue_status on public.notification_queue(status, priority, created_at);
create index idx_notification_queue_user_id on public.notification_queue(user_id);
create index idx_notification_queue_type on public.notification_queue(notification_type);

-- RLS
alter table public.notification_queue enable row level security;

create policy "Service role can manage notification queue"
on public.notification_queue
for all
using (true);

comment on table public.notification_queue is 'طابور الإشعارات للمعالجة التلقائية';

-- ============================================
-- 3. Trigger لإرسال إشعار عند إنشاء فاتورة
-- ============================================

create or replace function public.trigger_invoice_notification()
returns trigger as $$
begin
  insert into public.notification_queue (
    user_id,
    notification_type,
    subject,
    data,
    priority
  ) values (
    NEW.user_id,
    'billing',
    'فاتورة جديدة #' || NEW.id,
    jsonb_build_object(
      'invoice_id', NEW.id,
      'amount', NEW.amount,
      'due_date', NEW.due_date
    ),
    'high'
  );
  
  return NEW;
end;
$$ language plpgsql security definer;

-- تطبيق الـ Trigger (إذا كان جدول invoices موجود)
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'invoices') then
    drop trigger if exists on_invoice_created on public.invoices;
    create trigger on_invoice_created
      after insert on public.invoices
      for each row
      execute function public.trigger_invoice_notification();
  end if;
end $$;

-- ============================================
-- 4. Trigger لإرسال إشعار عند رسالة جديدة
-- ============================================

create or replace function public.trigger_message_notification()
returns trigger as $$
declare
  v_recipient_id uuid;
  v_sender_name text;
begin
  -- تحديد المستلم (ليس المرسل)
  if NEW.sender_id = (select user_id from public.orders where id = NEW.order_id) then
    -- المرسل هو العميل، المستلم هو المزود
    select assigned_provider_id into v_recipient_id
    from public.orders
    where id = NEW.order_id;
  else
    -- المرسل هو المزود، المستلم هو العميل
    select user_id into v_recipient_id
    from public.orders
    where id = NEW.order_id;
  end if;
  
  -- جلب اسم المرسل
  select display_name into v_sender_name
  from public.profiles
  where id = NEW.sender_id;
  
  -- إضافة للطابور
  if v_recipient_id is not null then
    insert into public.notification_queue (
      user_id,
      notification_type,
      subject,
      data,
      priority
    ) values (
      v_recipient_id,
      'message',
      'رسالة جديدة من ' || coalesce(v_sender_name, 'مستخدم'),
      jsonb_build_object(
        'message_id', NEW.id,
        'order_id', NEW.order_id,
        'sender_id', NEW.sender_id,
        'sender_name', v_sender_name,
        'message_preview', left(NEW.message, 100)
      ),
      'normal'
    );
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

-- تطبيق الـ Trigger (إذا كان جدول project_messages موجود)
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'project_messages') then
    drop trigger if exists on_message_created on public.project_messages;
    create trigger on_message_created
      after insert on public.project_messages
      for each row
      execute function public.trigger_message_notification();
  end if;
end $$;

-- ============================================
-- 5. دالة لمعالجة طابور الإشعارات
-- ============================================

create or replace function public.process_notification_queue(batch_size int default 10)
returns table (
  processed int,
  succeeded int,
  failed int
) as $$
declare
  v_processed int := 0;
  v_succeeded int := 0;
  v_failed int := 0;
  v_notification record;
begin
  -- جلب الإشعارات المعلقة
  for v_notification in
    select *
    from public.notification_queue
    where status = 'pending'
    and attempts < max_attempts
    order by priority desc, created_at asc
    limit batch_size
    for update skip locked
  loop
    v_processed := v_processed + 1;
    
    -- تحديث الحالة إلى "processing"
    update public.notification_queue
    set status = 'processing', updated_at = now()
    where id = v_notification.id;
    
    -- هنا سيتم الإرسال الفعلي عبر Worker
    -- الآن نضع علامة "sent" مؤقتاً
    -- Worker الخارجي سيقوم بالإرسال الفعلي
    
  end loop;
  
  return query select v_processed, v_succeeded, v_failed;
end;
$$ language plpgsql security definer;

comment on function public.process_notification_queue is 'معالجة دفعة من الإشعارات المعلقة';

-- ============================================
-- 6. دالة لإعادة محاولة الإشعارات الفاشلة
-- ============================================

create or replace function public.retry_failed_notifications()
returns int as $$
declare
  v_count int;
begin
  update public.notification_queue
  set 
    status = 'pending',
    attempts = attempts + 1,
    updated_at = now()
  where status = 'failed'
  and attempts < max_attempts
  and created_at > now() - interval '24 hours';
  
  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql security definer;

-- ============================================
-- 7. دالة لتنظيف الإشعارات القديمة
-- ============================================

create or replace function public.cleanup_old_notifications(days_to_keep int default 30)
returns int as $$
declare
  v_count int;
begin
  delete from public.notification_queue
  where status in ('sent', 'failed')
  and created_at < now() - (days_to_keep || ' days')::interval;
  
  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql security definer;

-- ============================================
-- ✅ تم! الآن الإشعارات ستُضاف تلقائياً للطابور
-- ============================================

-- للتحقق من عمل النظام:
-- select * from public.notification_queue order by created_at desc limit 10;
