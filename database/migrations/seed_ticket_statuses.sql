-- ==============================================================================
-- FIX: SEED TICKET STATUSES (Ensure Dependencies for Tickets)
-- 1. Insert 'ticket-status' type if missing
-- 2. Insert 'open', 'closed' values if missing
-- 3. Re-apply the default status trigger
-- ==============================================================================

do $$
declare
  v_type_id int;
begin
  -- 1. Create Lookup Type 'ticket-status'
  insert into public.lookup_types (code, name_ar, name_en)
  values ('ticket-status', 'حالة التذكرة', 'Ticket Status')
  on conflict (code) do nothing;
  
  -- Get Type ID
  select id into v_type_id from public.lookup_types where code = 'ticket-status';

  if v_type_id is not null then
      -- 2. Create Values
      insert into public.lookup_values (lookup_type_id, code, name_ar, name_en)
      values 
      (v_type_id, 'open', 'مفتوحة', 'Open'),
      (v_type_id, 'in-progress', 'قيد المعالجة', 'In Progress'),
      (v_type_id, 'closed', 'مغلقة', 'Closed')
      on conflict (lookup_type_id, code) do nothing;
  end if;
end $$;


-- 3. Re-Define Trigger (Ensures it finds the values we just created)
create or replace function public.set_default_ticket_status()
returns trigger as $$
declare
  v_status_id int;
begin
  if NEW.status_id is null then
    
    select lv.id into v_status_id
    from public.lookup_values lv
    join public.lookup_types lt on lt.id = lv.lookup_type_id
    where lt.code = 'ticket-status'
    and lv.code = 'open'
    limit 1;
    
    NEW.status_id := v_status_id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists before_insert_tickets_status on public.tickets;
create trigger before_insert_tickets_status
  before insert on public.tickets
  for each row
  execute function public.set_default_ticket_status();
