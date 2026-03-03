# 🔧 كيفية إعداد Edge Function Trigger

## ✅ تم إصلاح المشكلة!

المشكلة كانت أن Supabase لا يسمح بتعيين database settings. الآن الحل أبسط!

---

## 📋 الخطوات (3 دقائق)

### 1️⃣ احصل على القيم من Supabase

```
1. افتح Supabase Dashboard
2. اذهب إلى Settings → API
3. انسخ:
   - Project URL (مثل: https://abc123.supabase.co)
   - anon public key
```

### 2️⃣ عدّل ملف SQL

افتح: `database/migrations/edge_function_triggers.sql`

ابحث عن هذه الأسطر (في بداية الملف):

```sql
declare
  v_supabase_url text := 'https://YOUR_PROJECT.supabase.co'; -- ⚠️ غيّر هذا
  v_anon_key text := 'YOUR_ANON_KEY_HERE'; -- ⚠️ غيّر هذا
```

استبدلها بقيمك:

```sql
declare
  v_supabase_url text := 'https://abc123.supabase.co'; -- ✅ قيمتك الحقيقية
  v_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; -- ✅ قيمتك الحقيقية
```

### 3️⃣ نفّذ SQL

```sql
-- في Supabase SQL Editor
-- انسخ كل محتوى الملف بعد التعديل
-- الصق وشغّل Run
```

✅ **انتهى! الآن Trigger جاهز**

---

## 🧪 الاختبار

```javascript
// اختبر بتحديث طلب
await supabase
  .from('orders')
  .update({ status: 'completed' })
  .eq('id', 'order-id')

// ✅ يجب أن يُرسل البريد تلقائياً!
```

---

## 🆘 إذا لم يعمل

### تحقق من:

1. ✅ Edge Function منشورة:
```bash
supabase functions list
```

2. ✅ Trigger موجود:
```sql
select trigger_name from information_schema.triggers 
where trigger_name = 'on_order_status_changed_edge';
```

3. ✅ القيم صحيحة في الـ function:
```sql
select prosrc from pg_proc 
where proname = 'notify_order_update_via_edge_function';
```

---

## 💡 ملاحظات

- ⚠️ **anon key** عام - يمكن استخدامه في Frontend
- ⚠️ **service_role key** سري - لا تضعه في Trigger
- ✅ القيم مخزنة في الـ function نفسها
- ✅ لا حاجة لـ database settings

---

**🎉 الآن النظام جاهز للعمل!**
