-- ==============================================================================
-- FIX: TICKET CREATION (Auto-set Status)
-- Resolves 'null value in column "status_id" ... violates not-null constraint'
-- Automatically sets status to 'open' if not provided
-- ==============================================================================

create or replace function public.set_default_ticket_status()
returns trigger as $$
declare
  v_status_id int;
begin
  -- Only if status_id is missing
  if NEW.status_id is null then
    
    -- Find 'open' status ID
    select lv.id into v_status_id
    from public.lookup_values lv
    join public.lookup_types lt on lt.id = lv.lookup_type_id
    where lt.code = 'ticket-status'
    and lv.code = 'open'
    limit 1;
    
    -- Fallback to first available status if 'open' not found (sanity check)
    if v_status_id is null then
       select lv.id into v_status_id
       from public.lookup_values lv
       join public.lookup_types lt on lt.id = lv.lookup_type_id
       where lt.code = 'ticket-status'
       limit 1;
    end if;

    NEW.status_id := v_status_id;
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

-- Create Trigger
drop trigger if exists before_insert_tickets_status on public.tickets;
create trigger before_insert_tickets_status
  before insert on public.tickets
  for each row
  execute function public.set_default_ticket_status();
