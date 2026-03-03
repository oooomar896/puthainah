-- ⚠️ CRITICAL: Delete non-admin users from Supabase Auth
-- This MUST be run AFTER cleanup_non_admin_data.sql
-- This requires ADMIN/SERVICE_ROLE privileges

-- Get admin user IDs
CREATE TEMP TABLE admin_auth_ids AS
SELECT u.id 
FROM auth.users au
JOIN public.users u ON au.id = u.id
WHERE LOWER(u.role) = 'admin';

-- Display which users will be deleted
SELECT 
  au.email,
  au.created_at,
  u.role
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.id NOT IN (SELECT id FROM admin_auth_ids)
ORDER BY au.created_at DESC;

-- ⚠️ UNCOMMENT THE FOLLOWING LINE TO ACTUALLY DELETE
-- WARNING: This cannot be undone!
-- DELETE FROM auth.users WHERE id NOT IN (SELECT id FROM admin_auth_ids);

-- Clean up
DROP TABLE admin_auth_ids;

-- Show remaining auth users
SELECT 
  au.email,
  u.role,
  au.created_at
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
ORDER BY au.created_at DESC;
