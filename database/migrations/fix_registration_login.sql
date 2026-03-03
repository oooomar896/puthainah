-- ==============================================================================
-- Fix Registration & Login Issues (Updated for Requesters Only)
-- 1. Auto-confirm email for Requesters ONLY
-- 2. Ensure Tickets table has the correct schema
-- ==============================================================================

-- 1. Auto-Confirm Email Trigger (Restricted to Requesters)
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

-- Re-create the trigger to ensure it's active
drop trigger if exists on_auth_user_created_auto_confirm on auth.users;

create trigger on_auth_user_created_auto_confirm
  before insert on auth.users
  for each row execute function public.auto_confirm_user();

-- Optional: Update existing Requesters who are not confirmed
-- This helps if you have previous test users capable of being fixed
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null
and raw_user_meta_data->>'role' ilike 'Requester';


-- 2. Fix Tickets Schema (Same as before)
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

-- Add related_request_id if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'tickets' and column_name = 'related_request_id') then
    alter table public.tickets add column related_request_id uuid null;
  end if;
end $$;

-- Add related_order_id if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'tickets' and column_name = 'related_order_id') then
    alter table public.tickets add column related_order_id uuid null;
  end if;
end $$;
