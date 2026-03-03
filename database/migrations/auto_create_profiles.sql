-- ==============================================================================
-- AUTO-CREATE PROFILES ON SIGNUP
-- Automatically creates a 'requester' or 'provider' profile row
-- based on the user's role metadata.
-- ==============================================================================

create or replace function public.handle_new_user_profile()
returns trigger as $$
declare
  v_role text;
  v_full_name text;
begin
  -- Extract role and name from metadata
  -- Keys might vary: 'role' vs 'user_role', 'full_name' vs 'fullName', etc.
  -- Adjust based on your SignupForm.jsx payload
  v_role := (new.raw_user_meta_data->>'role')::text; 
  v_full_name := (new.raw_user_meta_data->>'fullName')::text;
  
  if v_full_name is null then
     v_full_name := (new.raw_user_meta_data->>'name')::text;
  end if;
  
  -- Create REQUESTER profile
  if v_role ilike 'Requester' then
    insert into public.requesters (user_id, name, created_at)
    values (new.id, coalesce(v_full_name, 'New User'), now())
    on conflict (user_id) do nothing;
    
  -- Create PROVIDER profile
  elsif v_role ilike 'Provider' then
    insert into public.providers (user_id, name, created_at, profile_status_id)
    values (new.id, coalesce(v_full_name, 'New Provider'), now(), 201) -- 201 = Active? Check your status lookup
    on conflict (user_id) do nothing;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: After auth.users insert
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();


-- ==============================================================================
-- BACKFILL: Create profiles for existing users who missed the trigger
-- ==============================================================================

-- 1. Backfill Requesters
insert into public.requesters (user_id, name)
select 
  id, 
  coalesce(raw_user_meta_data->>'fullName', raw_user_meta_data->>'name', 'User')
from auth.users
where (raw_user_meta_data->>'role')::text ilike 'Requester'
and not exists (select 1 from public.requesters where user_id = auth.users.id);

-- 2. Backfill Providers
insert into public.providers (user_id, name)
select 
  id, 
  coalesce(raw_user_meta_data->>'fullName', raw_user_meta_data->>'name', 'Provider')
from auth.users
where (raw_user_meta_data->>'role')::text ilike 'Provider'
and not exists (select 1 from public.providers where user_id = auth.users.id);
