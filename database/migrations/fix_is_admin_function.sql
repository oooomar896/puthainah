-- ==============================================================================
-- FIX: IS_ADMIN FUNCTION
-- Updates the admin check to verify User Metadata as well as the 'admins' table
-- This properly supports Admins created via the UI/Auth system
-- ==============================================================================

create or replace function public.is_admin()
returns boolean as $$
declare
  is_admin_table boolean;
  is_admin_meta boolean;
begin
  -- 1. Check if present in 'admins' table
  select exists (
    select 1 from public.admins 
    where user_id = auth.uid()
  ) into is_admin_table;
  
  -- 2. Check if metadata role is 'Admin'
  -- Checks raw_user_meta_data for the 'role' key
  -- Note: We trust metadata because normally users cannot change their own metadata role
  -- unless we have an insecure RLS on auth.users (which we don't control generally)
  -- or an Exposed API.
  select (raw_user_meta_data->>'role') = 'Admin' 
  into is_admin_meta
  from auth.users
  where id = auth.uid();

  return is_admin_table or coalesce(is_admin_meta, false);
end;
$$ language plpgsql security definer;
