-- Backfill: Create orders for existing requests with assigned providers
-- This script creates orders for requests that have assigned_provider_id but no order yet

DO $$
DECLARE
    assigned_request RECORD;
    waiting_approval_status_id INT;
BEGIN
    -- Get "waiting-approval" status ID (600)
    SELECT id INTO waiting_approval_status_id 
    FROM lookup_values 
    WHERE lookup_type_id = 4 AND code = 'waiting-approval'
    LIMIT 1;
    
    -- If not found, use "in-progress"
    IF waiting_approval_status_id IS NULL THEN
        SELECT id INTO waiting_approval_status_id 
        FROM lookup_values 
        WHERE lookup_type_id = 4 AND code = 'in-progress'
        LIMIT 1;
    END IF;
    
    -- Create orders for all requests with assigned providers but no order
    IF waiting_approval_status_id IS NOT NULL THEN
        FOR assigned_request IN 
            SELECT r.* 
            FROM requests r
            LEFT JOIN orders o ON o.request_id = r.id
            WHERE r.assigned_provider_id IS NOT NULL
            AND o.id IS NULL
        LOOP
            INSERT INTO orders (
                request_id,
                provider_id,
                order_title,
                order_status_id,
                start_date,
                created_at
            ) VALUES (
                assigned_request.id,
                assigned_request.assigned_provider_id,
                COALESCE(assigned_request.title, 'مشروع جديد'),
                waiting_approval_status_id,
                NOW(),
                assigned_request.created_at
            );
            
            RAISE NOTICE 'Created order for request % with provider %', assigned_request.id, assigned_request.assigned_provider_id;
        END LOOP;
    END IF;
END $$;

-- Verify results
SELECT 
    r.id as request_id,
    r.title as request_title,
    r.assigned_provider_id,
    o.id as order_id,
    o.order_status_id,
    lv.name_ar as order_status
FROM requests r
LEFT JOIN orders o ON o.request_id = r.id
LEFT JOIN lookup_values lv ON lv.id = o.order_status_id
WHERE r.assigned_provider_id IS NOT NULL
ORDER BY r.created_at DESC;
