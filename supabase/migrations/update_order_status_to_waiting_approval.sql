-- Check and update order status to waiting-approval (600)
-- The backfill created orders with status 18, but OrdersTable filters by 600

UPDATE orders
SET order_status_id = 600
WHERE order_status_id = 18
AND provider_id IS NOT NULL;

-- Verify the update
SELECT 
    o.id,
    o.order_title,
    p.name as provider_name,
    lv.code as status_code,
    lv.name_ar as status_name
FROM orders o
JOIN providers p ON p.id = o.provider_id
JOIN lookup_values lv ON lv.id = o.order_status_id
WHERE o.provider_id IS NOT NULL
ORDER BY o.created_at DESC;
