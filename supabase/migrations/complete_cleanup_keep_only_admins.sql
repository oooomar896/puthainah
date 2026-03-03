-- ═══════════════════════════════════════════════════════════════════════════
-- ⚠️ WARNING: COMPLETE DATABASE CLEANUP - PRESERVES ONLY ADMIN USERS
-- ═══════════════════════════════════════════════════════════════════════════
-- This script will DELETE ALL DATA except Admin users and static data
-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 1: VERIFY ADMIN USERS
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count 
    FROM public.users 
    WHERE LOWER(role) = 'admin';
    
    RAISE NOTICE '════════════════════════════════════════════════════';
    RAISE NOTICE 'Total Admin Users Found: %', admin_count;
    RAISE NOTICE '════════════════════════════════════════════════════';
    
    IF admin_count = 0 THEN
        RAISE EXCEPTION 'NO ADMIN USERS FOUND! Aborting to prevent data loss.';
    END IF;
END $$;

-- Display admin users that will be preserved
SELECT 'ADMIN USERS TO PRESERVE:' as info;
SELECT id, email, role, created_at FROM public.users WHERE LOWER(role) = 'admin';

-- STEP 2: CREATE TEMP TABLE
CREATE TEMP TABLE admin_user_ids AS
SELECT id FROM public.users WHERE LOWER(role) = 'admin';

-- STEP 3: DELETE DATA (Starting from child tables to avoid FK constraints)

-- Delete ticket messages
DELETE FROM public.ticket_messages
WHERE ticket_id IN (
    SELECT id FROM public.tickets 
    WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
);

-- Delete tickets
DELETE FROM public.tickets
WHERE user_id NOT IN (SELECT id FROM admin_user_ids);

-- Delete project messages
DELETE FROM public.project_messages
WHERE order_id IN (
    SELECT id FROM public.orders 
    WHERE provider_id IN (
        SELECT id FROM public.providers 
        WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
    )
);

-- Delete project deliverables
DELETE FROM public.project_deliverables
WHERE order_id IN (
    SELECT id FROM public.orders 
    WHERE provider_id IN (
        SELECT id FROM public.providers 
        WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
    )
);

-- Delete order ratings
DELETE FROM public.order_ratings
WHERE order_id IN (
    SELECT id FROM public.orders 
    WHERE provider_id IN (
        SELECT id FROM public.providers 
        WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
    )
);

-- Delete orders (projects)
DELETE FROM public.orders
WHERE provider_id IN (
    SELECT id FROM public.providers 
    WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
)
OR request_id IN (
    SELECT id FROM public.requests
    WHERE requester_id IN (
        SELECT id FROM public.requesters 
        WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
    )
);

-- Delete attachments (all types)
DELETE FROM public.attachments
WHERE requester_id IN (
    SELECT id FROM public.requesters 
    WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
)
OR provider_id IN (
    SELECT id FROM public.providers 
    WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
);

-- Delete payments
DELETE FROM public.payments;

-- Delete status history
DELETE FROM public.status_history
WHERE request_id IN (
    SELECT id FROM public.requests
    WHERE requester_id IN (
        SELECT id FROM public.requesters 
        WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
    )
);

-- Delete requests
DELETE FROM public.requests
WHERE requester_id IN (
    SELECT id FROM public.requesters 
    WHERE user_id NOT IN (SELECT id FROM admin_user_ids)
);

-- Delete notifications
DELETE FROM public.notifications
WHERE user_id NOT IN (SELECT id FROM admin_user_ids);

-- Delete profile_infos
DELETE FROM public.profile_infos
WHERE user_id NOT IN (SELECT id FROM admin_user_ids);

-- Delete providers (non-admin)
DELETE FROM public.providers
WHERE user_id NOT IN (SELECT id FROM admin_user_ids);

-- Delete requesters (non-admin)
DELETE FROM public.requesters
WHERE user_id NOT IN (SELECT id FROM admin_user_ids);

-- Delete users from public.users (non-admin)
DELETE FROM public.users
WHERE id NOT IN (SELECT id FROM admin_user_ids);

-- Delete from auth.users (Supabase Auth)
DELETE FROM auth.users 
WHERE id NOT IN (SELECT id FROM admin_user_ids);

-- STEP 4: DISPLAY SUMMARY
DO $$
BEGIN
    RAISE NOTICE '════════════════════════════════════════════════════';
    RAISE NOTICE '✅ CLEANUP COMPLETED SUCCESSFULLY';
    RAISE NOTICE '════════════════════════════════════════════════════';
END $$;

-- Summary of preserved data
SELECT 'SUMMARY: Admin users preserved: ' || COUNT(*) as result FROM admin_user_ids;

-- Remaining counts
SELECT 
    'users' as table_name, 
    COUNT(*) as count
FROM public.users
UNION ALL SELECT 'providers', COUNT(*) FROM public.providers
UNION ALL SELECT 'requesters', COUNT(*) FROM public.requesters
UNION ALL SELECT 'admins', COUNT(*) FROM public.admins
UNION ALL SELECT 'requests', COUNT(*) FROM public.requests
UNION ALL SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL SELECT 'tickets', COUNT(*) FROM public.tickets
UNION ALL SELECT 'payments', COUNT(*) FROM public.payments
UNION ALL SELECT 'attachments', COUNT(*) FROM public.attachments
UNION ALL SELECT 'notifications', COUNT(*) FROM public.notifications
ORDER BY table_name;

-- Remaining auth users
SELECT 'REMAINING USERS:' as info;
SELECT au.id, au.email, u.role, au.created_at
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
ORDER BY au.created_at DESC;

-- Cleanup
DROP TABLE IF EXISTS admin_user_ids;

SELECT '✅ Database cleaned successfully. Only admin users remain.' as final_status;
