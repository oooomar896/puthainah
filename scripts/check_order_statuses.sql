-- First, check what order status IDs exist
SELECT id, code, name_ar, name_en
FROM lookup_values
WHERE lookup_type_id = 4  -- Order statuses
ORDER BY id;

-- Check current orders and their statuses
SELECT 
    o.id,
    o.order_status_id,
    lv.code,
    lv.name_ar
FROM orders o
LEFT JOIN lookup_values lv ON lv.id = o.order_status_id
WHERE o.provider_id IS NOT NULL;
