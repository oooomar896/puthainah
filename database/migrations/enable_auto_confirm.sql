-- ==========================================================
-- ENABLE AUTO CONFIRMATION FOR NEW USERS
-- Run this in Supabase SQL Editor
-- ==========================================================

-- 1. Create or Replace the Auto Confirm Function
-- This function runs before a new user is inserted into auth.users
create or replace function public.auto_confirm_user()
returns trigger as $$
begin
  -- Automatically confirm the email address so they can login immediately
  -- Applied to 'Requester' role (and you can add others if needed)
  if (new.raw_user_meta_data->>'role')::text ilike 'Requester' then
    new.email_confirmed_at = now();
  end if;
  
  -- Uncomment the line below to apply to ALL users regardless of role (for testing/MVP)
  -- new.email_confirmed_at = now();
  
  return new;
end;
$$ language plpgsql security definer;

-- 2. Attach the Trigger
-- First, drop if exists to avoid errors
drop trigger if exists on_auth_user_created_auto_confirm on auth.users;

-- Then create it
create trigger on_auth_user_created_auto_confirm
  before insert on auth.users
  for each row execute function public.auto_confirm_user();

-- 3. Confirm success
SELECT 'Auto-confirmation trigger successfully enabled' as status;
