-- Change order status from completed (15) to waiting_start (18)
-- This will make accept/reject buttons appear for providers

UPDATE orders
SET order_status_id = 18
WHERE id IN (
  SELECT id FROM orders
  WHERE order_status_id = 15
  AND provider_id IS NOT NULL
  LIMIT 5
);  -- Update only first 5 for testing

-- Verify the update
SELECT 
    o.id,
    o.order_title,
    o.order_status_id,
    lv.code,
    lv.name_ar
FROM orders o
JOIN lookup_values lv ON lv.id = o.order_status_id
WHERE o.provider_id IS NOT NULL
ORDER BY o.created_at DESC
LIMIT 10;
