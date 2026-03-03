-- ============================================
-- Database Trigger for Edge Function
-- File: database/migrations/edge_function_triggers.sql
-- ============================================

-- ⚠️ استبدل هذه القيم بقيمك الحقيقية قبل التنفيذ
-- احصل عليها من: Supabase Dashboard → Settings → API

-- دالة لاستدعاء Edge Function عند تحديث الطلب
create or replace function public.notify_order_update_via_edge_function()
returns trigger as $$
declare
  v_supabase_url text := 'https://YOUR_PROJECT.supabase.co'; -- ⚠️ غيّر هذا
  v_anon_key text := 'YOUR_ANON_KEY_HERE'; -- ⚠️ غيّر هذا
begin
  -- التحقق من تغيير الحالة فقط
  if OLD.status is distinct from NEW.status then
    
    -- استدعاء Edge Function
    perform
      net.http_post(
        url := v_supabase_url || '/functions/v1/send-order-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_anon_key
        ),
        body := jsonb_build_object(
          'record', jsonb_build_object(
            'id', NEW.id,
            'user_id', NEW.user_id,
            'status', NEW.status,
            'old_status', OLD.status
          )
        )
      );
    
    raise notice 'Edge Function called for order % (status: % -> %)', NEW.id, OLD.status, NEW.status;
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

-- إنشاء الـ Trigger
drop trigger if exists on_order_status_changed_edge on public.orders;
create trigger on_order_status_changed_edge
  after update on public.orders
  for each row
  execute function public.notify_order_update_via_edge_function();
