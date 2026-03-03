-- التحقق من وجود الـ Functions والـ Triggers
-- يمكن تشغيل هذا الملف في Supabase SQL Editor للتحقق

-- 1. التحقق من وجود الـ functions
SELECT 
    proname as function_name,
    pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE proname IN ('auto_create_order_on_payment', 'sync_order_status_with_request');

-- 2. التحقق من وجود الـ triggers
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgtype,
    tgenabled
FROM pg_trigger 
WHERE tgname IN ('trigger_auto_create_order_on_payment', 'trigger_sync_order_status');

-- 3. التحقق من الـ indexes على جدول orders
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'orders'
ORDER BY indexname;

-- 4. عرض الطلبات المدفوعة التي يجب تحويلها
SELECT 
    r.id,
    r.title,
    r.status_id,
    r.provider_id,
    r.created_at,
    s.name_ar as status_name
FROM requests r
LEFT JOIN lookup_values s ON s.id = r.status_id
WHERE r.status_id = 204
ORDER BY r.created_at DESC
LIMIT 10;

-- 5. التحقق من وجود مشاريع لهذه الطلبات
SELECT 
    r.id as request_id,
    r.title as request_title,
    o.id as order_id,
    o.order_title,
    o.order_status_id,
    os.name_ar as order_status
FROM requests r
LEFT JOIN orders o ON o.request_id = r.id
LEFT JOIN lookup_values os ON os.id = o.order_status_id
WHERE r.status_id = 204
ORDER BY r.created_at DESC
LIMIT 10;
