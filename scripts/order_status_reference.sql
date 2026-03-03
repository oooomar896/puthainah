-- Check available order status IDs for reference
SELECT id, code, name_ar, name_en
FROM lookup_values
WHERE lookup_type_id = 4  -- Order statuses
ORDER BY id;

-- Common status IDs:
-- 15 = completed (مكتمل)
-- 16 = rejected (مرفوض) - if exists
-- 17 = cancelled (ملغي) - if exists  
-- 18 = waiting_start (بانتظار البدء)
