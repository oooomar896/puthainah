# دليل التطبيق السريع - Migration قاعدة البيانات

## 🎯 الهدف
تطبيق migration للإنشاء التلقائي للمشاريع عند الدفع على قاعدة بيانات Supabase.

## ⚡ الخطوات السريعة

### 1. افتح Supabase Dashboard
```
https://tqskjoufozgyactjnrix.supabase.co
```

### 2. اذهب إلى SQL Editor
- من القائمة الجانبية: **SQL Editor**
- أو استخدم الرابط المباشر: **Database → SQL Editor**

### 3. افتح ملف Migration
```
المسار: supabase/migrations/20260101_auto_create_order_on_payment.sql
```

### 4. انسخ المحتوى والصق في SQL Editor

### 5. اضغط RUN (أو Ctrl+Enter)

### 6. تحقق من النجاح
يجب أن ترى رسالة: `Success. No rows returned`

---

## ✅ التحقق من التطبيق

### استخدم هذا SQL للتحقق:

```sql
-- 1. التحقق من Functions
SELECT proname FROM pg_proc 
WHERE proname IN ('auto_create_order_on_payment', 'sync_order_status_with_request');
-- النتيجة: يجب أن ترى 2 rows

-- 2. التحقق من Triggers
SELECT tgname FROM pg_trigger 
WHERE tgname LIKE 'trigger_%order%';
-- النتيجة: يجب أن ترى trigger names

-- 3. اختبار عملي
-- أ. أنشئ طلب تجريبي (يدوياً أو عبر UI)
-- ب. حدث حالته إلى 204:
UPDATE requests SET status_id = 204 WHERE id = 'طلب-id-هنا';

-- ج. تحقق من إنشاء المشروع:
SELECT * FROM orders WHERE request_id = 'طلب-id-هنا';
-- النتيجة: يجب أن ترى مشروع جديد!
```

---

## 🐛 استكشاف الأخطاء

### خطأ: "function does not exist"
**السبب**: لم يتم تنفيذ جميع الأوامر
**الحل**: تأكد من نسخ الملف كاملاً وتشغيله

### خطأ: "trigger already exists"
**السبب**: Migration تم تطبيقه سابقاً
**الحل**: هذا طبيعي! Trigger موجود بالفعل

### لا يتم إنشاء مشاريع تلقائياً
**الفحص**:
1. تحقق من أن status_id = 204 بالضبط
2. تحقق من وجود provider_id في الطلب
3. تحقق من logs في Supabase Dashboard → Logs

---

## 📞 الدعم

إذا واجهت مشاكل:
1. راجع [implementation_plan.md](file:///C:/Users/USER/.gemini/antigravity/brain/4aa4421c-4b67-4906-bc98-532f77532580/implementation_plan.md)
2. راجع [walkthrough.md](file:///C:/Users/USER/.gemini/antigravity/brain/4aa4421c-4b67-4906-bc98-532f77532580/walkthrough.md)
3. فحص Logs في Supabase
