# خطوات تطبيق الـ Trigger

## المشكلة
عند تعيين مزود من لوحة الأدمن، المزود لا يستقبل العرض.

## السبب
الـ trigger `auto_create_order_on_provider_assignment` لم يتم تطبيقه في قاعدة البيانات.

## الحل

### الخطوة 1: تطبيق الـ Migrations بالترتيب

1. **إصلاح Foreign Key:**
```sql
-- افتح Supabase SQL Editor
-- انسخ محتوى: supabase/migrations/fix_assigned_provider_constraint.sql
-- شغّل الـ script
```

2. **إنشاء الـ Trigger:**
```sql
-- انسخ محتوى: supabase/migrations/create_order_on_provider_assignment.sql
-- شغّل الـ script
```

3. **Backfill للطلبات الموجودة:**
```sql
-- انسخ محتوى: supabase/migrations/backfill_orders_for_assigned_requests.sql
-- شغّل الـ script
```

### الخطوة 2: التحقق من التطبيق

```sql
-- تحقق من وجود الـ trigger
SELECT trigger_name 
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_create_order_on_provider_assignment';
```

### الخطوة 3: الاختبار

1. من لوحة الأدمن، عيّن مزود لطلب جديد
2. تحقق من إنشاء order تلقائياً:
```sql
SELECT * FROM orders 
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

3. افتح صفحة المزود: `/provider/active-orders`
4. يجب أن يظهر الطلب الجديد

## إذا لم يعمل الـ Trigger

استخدم الـ script اليدوي:
```
scripts/verify_trigger_and_create_test_order.sql
```

هذا سينشئ order يدوياً للاختبار.
