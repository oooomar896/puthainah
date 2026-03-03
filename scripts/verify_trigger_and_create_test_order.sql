-- Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_create_order_on_provider_assignment';

-- Check if the function exists
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'auto_create_order_on_provider_assignment';

-- Test: Manually trigger order creation for a request with assigned provider
DO $$
DECLARE
    test_request RECORD;
    waiting_approval_status_id INT;
BEGIN
    -- Get status ID
    SELECT id INTO waiting_approval_status_id 
    FROM lookup_values 
    WHERE lookup_type_id = 4 AND code = 'waiting_start'
    LIMIT 1;
    
    -- Find a request with assigned provider but no order
    SELECT r.* INTO test_request
    FROM requests r
    LEFT JOIN orders o ON o.request_id = r.id
    WHERE r.assigned_provider_id IS NOT NULL
    AND o.id IS NULL
    LIMIT 1;
    
    IF test_request.id IS NOT NULL AND waiting_approval_status_id IS NOT NULL THEN
        INSERT INTO orders (
            request_id,
            provider_id,
            order_title,
            order_status_id,
            start_date,
            created_at
        ) VALUES (
            test_request.id,
            test_request.assigned_provider_id,
            COALESCE(test_request.title, 'مشروع جديد'),
            waiting_approval_status_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created test order for request % with provider %', test_request.id, test_request.assigned_provider_id;
    ELSE
        RAISE NOTICE 'No eligible request found or status not found';
    END IF;
END $$;

-- Verify results
SELECT 
    r.id as request_id,
    r.title,
    r.assigned_provider_id,
    o.id as order_id,
    o.order_status_id,
    lv.name_ar as order_status
FROM requests r
LEFT JOIN orders o ON o.request_id = r.id
LEFT JOIN lookup_values lv ON lv.id = o.order_status_id
WHERE r.assigned_provider_id IS NOT NULL
ORDER BY r.created_at DESC
LIMIT 10;
