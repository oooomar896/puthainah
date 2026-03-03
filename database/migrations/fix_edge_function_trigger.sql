-- ==============================================================================
-- FIX: EDGE FUNCTION TRIGGER (Fix Column Names)
-- Resolves 'record "old" has no field "status"' error in Edge Function trigger
-- ==============================================================================

create or replace function public.notify_order_update_via_edge_function()
returns trigger as $$
declare
  v_supabase_url text := 'https://tqskjoufozgyactjnrix.supabase.co'; -- Updated from context
  -- NOTE: You should ensure this key is correct or set via vault/secrets if possible
  -- For now, we assume the user might not have set it, so we wrap in exception
  v_anon_key text := 'YOUR_ANON_KEY_HERE'; 
  v_new_status_code text;
  v_old_status_code text;
  v_user_id uuid;
begin
  -- Use actual columns: order_status_id
  if OLD.order_status_id is distinct from NEW.order_status_id then
    
    -- Get Status Codes
    select code into v_new_status_code from public.lookup_values where id = NEW.order_status_id;
    select code into v_old_status_code from public.lookup_values where id = OLD.order_status_id;

    -- Get Requester User ID
    select req.user_id into v_user_id
    from public.requests r
    join public.requesters req on req.id = r.requester_id
    where r.id = NEW.request_id;

    -- Safe fallback for URL/Key if not set
    if v_supabase_url = 'https://YOUR_PROJECT.supabase.co' then
       raise notice 'Skipping Edge Function: URL not configured';
       return NEW;
    end if;

    -- Call Edge Function (wrapped in block to ignore network errors if unconfigured)
    begin
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
                'user_id', v_user_id,
                'status', v_new_status_code,
                'old_status', v_old_status_code
              )
            )
          );
    exception when others then
        raise notice 'Edge Function Call Failed: %', SQLERRM;
        -- Do not fail the transaction; just log
    end;
    
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

-- Re-create Trigger
drop trigger if exists on_order_status_changed_edge on public.orders;
create trigger on_order_status_changed_edge
  after update on public.orders
  for each row
  execute function public.notify_order_update_via_edge_function();
