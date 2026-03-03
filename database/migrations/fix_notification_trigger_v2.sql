-- ==============================================================================
-- FIX: NOTIFICATION TRIGGER (Fix Column Names)
-- Resolves 'record "old" has no field "status"' error by using correct columns
-- ==============================================================================

create or replace function public.trigger_order_status_notification()
returns trigger as $$
declare
  v_user_id uuid;
  v_status_message text;
  v_new_status_code text;
  v_old_status_code text;
begin
  -- Use actual columns: order_status_id (not status)
  if OLD.order_status_id is distinct from NEW.order_status_id then
    
    -- 1. Get Status Codes from lookup_values
    select code into v_new_status_code from public.lookup_values where id = NEW.order_status_id;
    select code into v_old_status_code from public.lookup_values where id = OLD.order_status_id;

    -- 2. Get Requester User ID (via Request -> Requester linkage)
    -- Orders table does NOT usually have user_id directly
    select req.user_id into v_user_id
    from public.requests r
    join public.requesters req on req.id = r.requester_id
    where r.id = NEW.request_id;
    
    -- If no user found (should affect valid orders), fallback or skip
    if v_user_id is null then
       -- Try finding if it's a direct user_id on order (backup)
       begin
         v_user_id := NEW.user_id;
       exception when others then
         v_user_id := null;
       end;
    end if;

    if v_user_id is not null then
        -- 3. Define Message
        v_status_message := case v_new_status_code
          when 'waiting_start' then 'تم قبول طلبك، بانتظار البدء'
          when 'in-progress' then 'جاري العمل على مشروعك' -- Note: code often uses hyphen or underscore
          when 'in_progress' then 'جاري العمل على مشروعك'
          when 'completed' then 'تم إكمال مشروعك بنجاح!'
          when 'cancelled' then 'تم إلغاء المشروع'
          else 'تم تحديث حالة المشروع'
        end;

        -- 4. Queue Notification
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
          'تحديث المشروع',
          jsonb_build_object(
            'order_id', NEW.id,
            'status', v_new_status_code,
            'message', v_status_message,
            'old_status', v_old_status_code
          ),
          case v_new_status_code
            when 'completed' then 'high'
            else 'normal'
          end,
          now()
        );
    end if;
    
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

-- Re-create Trigger to be sure
drop trigger if exists on_order_status_changed on public.orders;
create trigger on_order_status_changed
  after update on public.orders
  for each row
  execute function public.trigger_order_status_notification();
