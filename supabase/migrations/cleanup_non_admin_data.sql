-- ⚠️ WARNING: This script will DELETE ALL DATA except Admin users
-- Run this ONLY if you want to clean the database and start fresh
-- Make sure to backup your database before running this!

-- Step 1: Get list of admin user IDs to preserve
CREATE TEMP TABLE admin_user_ids AS
SELECT id FROM public.users WHERE LOWER(role) = 'admin';

-- Step 2: Delete all data related to non-admin users

-- Delete ticket messages for non-admin tickets
DELETE FROM public.ticket_messages
WHERE ticket_id IN (
  SELECT id FROM public.tickets 
  WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
);

-- Delete tickets for non-admin users
DELETE FROM public.tickets
WHERE user_id NOT IN (SELECT id FROM admin_user_ids);

-- Delete project messages for non-admin orders
DELETE FROM public.project_messages
WHERE order_id IN (
  SELECT o.id FROM public.orders o
  JOIN public.requests r ON o.request_id = r.id
  JOIN public.requesters req ON r.requester_id = req.id
  WHERE req.user_id NOT IN (SELECT id FROM admin_user_ids)
);

-- Delete project deliverables for non-admin orders
DELETE FROM public.project_deliverables
WHERE order_id IN (
  SELECT o.id FROM public.orders o
  JOIN public.requests r ON o.request_id = r.id
  JOIN public.requesters req ON r.requester_id = req.id
  WHERE req.user_id NOT IN (SELECT id FROM admin_user_ids)
);

-- Delete order ratings for non-admin orders
DELETE FROM public.order_ratings
WHERE order_id IN (
  SELECT o.id FROM public.orders o
  JOIN public.requests r ON o.request_id = r.id
  JOIN public.requesters req ON r.requester_id = req.id
  WHERE req.user_id NOT IN (SELECT id FROM admin_user_ids)
);

-- Delete orders for non-admin users
DELETE FROM public.orders
WHERE request_id IN (
    SELECT r.id FROM public.requests r
    JOIN public.requesters req ON r.requester_id = req.id
    WHERE req.user_id NOT IN (SELECT id FROM admin_user_ids)
)
OR provider_id IN (
    SELECT id FROM public.providers 
    WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
);

-- Delete attachments based on requester/provider ownership only
-- (Assuming request_id might not exist or be reliable on attachments table directly in this schema version)
DELETE FROM public.attachments
WHERE requester_id IN (
  SELECT id FROM public.requesters 
  WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
)
OR provider_id IN (
  SELECT id FROM public.providers 
  WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
);

-- Delete payments for non-admin requests
DELETE FROM public.payments
WHERE request_id IN (
  SELECT r.id FROM public.requests r
  JOIN public.requesters req ON r.requester_id = req.id
  WHERE req.user_id NOT IN (SELECT id FROM admin_user_ids)
);

-- Delete status history for non-admin requests
DELETE FROM public.status_history
WHERE request_id IN (
  SELECT r.id FROM public.requests r
  JOIN public.requesters req ON r.requester_id = req.id
  WHERE req.user_id NOT IN (SELECT id FROM admin_user_ids)
);

-- Delete requests for non-admin requesters
DELETE FROM public.requests
WHERE requester_id IN (
  SELECT id FROM public.requesters 
  WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
);

-- Delete notifications for non-admin users
DELETE FROM public.notifications
WHERE user_id NOT IN (SELECT id FROM admin_user_ids);

-- Delete profile_infos for non-admin users
DELETE FROM public.profile_infos
WHERE user_id NOT IN (SELECT id FROM admin_user_ids);

-- Delete providers (non-admin)
DELETE FROM public.providers
WHERE user_id NOT IN (SELECT id FROM admin_user_ids);

-- Delete requesters (non-admin)
DELETE FROM public.requesters
WHERE user_id NOT IN (SELECT id FROM admin_user_ids);

-- Delete users from public.users table (non-admin)
DELETE FROM public.users
WHERE id NOT IN (SELECT id FROM admin_user_ids);

-- Step 3: Clean up auth.users (Supabase Auth)
-- Note: This requires service role key and should be done carefully
-- You may need to run this separately using Supabase Dashboard or service account

-- Display summary
SELECT 
  'Admin users preserved: ' || COUNT(*) as summary
FROM admin_user_ids;

-- Clean up temp table
DROP TABLE admin_user_ids;

-- Display final counts
SELECT 'users' as table_name, COUNT(*) as remaining_count FROM public.users
UNION ALL
SELECT 'providers', COUNT(*) FROM public.providers
UNION ALL
SELECT 'requesters', COUNT(*) FROM public.requesters
UNION ALL
SELECT 'admins', COUNT(*) FROM public.admins
UNION ALL
SELECT 'requests', COUNT(*) FROM public.requests
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'tickets', COUNT(*) FROM public.tickets
UNION ALL
SELECT 'payments', COUNT(*) FROM public.payments
UNION ALL
SELECT 'attachments', COUNT(*) FROM public.attachments;
