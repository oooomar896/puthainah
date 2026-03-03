# 🚀 دليل Supabase Edge Functions للإشعارات

## ✅ ما تم إنشاؤه

تم إنشاء **Edge Function** كاملة للإرسال التلقائي!

### الملفات:
1. ✅ `supabase/functions/send-order-notification/index.ts` - Edge Function
2. ✅ `database/migrations/edge_function_triggers.sql` - Database Trigger

---

## 🎯 كيف يعمل؟

```
1. تحديث حالة الطلب في قاعدة البيانات
   ↓
2. Database Trigger يستدعي Edge Function
   ↓
3. Edge Function:
   - يتحقق من التفضيلات
   - يجلب بيانات المستخدم
   - يرسل البريد عبر SMTP
   - يسجل في email_log
   ↓
4. ✅ تم!
```

---

## 📋 خطوات التفعيل

### 1️⃣ تثبيت Supabase CLI (مرة واحدة)

```bash
# Windows
scoop install supabase

# أو
npm install -g supabase

# تسجيل الدخول
supabase login
```

### 2️⃣ ربط المشروع

```bash
# في مجلد المشروع
supabase link --project-ref YOUR_PROJECT_REF

# يمكنك الحصول على PROJECT_REF من:
# Supabase Dashboard → Settings → General → Reference ID
```

### 3️⃣ إضافة Environment Variables للـ Edge Function

```bash
# في Supabase Dashboard → Edge Functions → Settings
# أضف هذه المتغيرات:

ZOHO_SMTP_USER=info@bacuratec.com
ZOHO_SMTP_PASS=20Bac30@
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4️⃣ نشر Edge Function

```bash
# من مجلد المشروع
supabase functions deploy send-order-notification

# ✅ يجب أن ترى: Function deployed successfully
```

### 5️⃣ تنفيذ Database Trigger

```sql
-- في Supabase SQL Editor
-- نفّذ: database/migrations/edge_function_triggers.sql

-- ⚠️ لا تنسى تحديث القيم:
alter database postgres set "app.settings.supabase_url" to 'https://YOUR_PROJECT.supabase.co';
alter database postgres set "app.settings.supabase_anon_key" to 'YOUR_ANON_KEY';
```

---

## 🧪 الاختبار

### اختبار Edge Function مباشرة:

```bash
# من Terminal
curl -i --location --request POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/send-order-notification' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"record":{"id":"test-123","user_id":"USER_ID","status":"completed"}}'
```

### اختبار عبر تحديث الطلب:

```javascript
// في الكود
await supabase
  .from('orders')
  .update({ status: 'completed' })
  .eq('id', 'order-id')

// ✅ يجب أن يُرسل البريد تلقائياً!
```

---

## 📊 المراقبة

### عرض Logs في Supabase Dashboard:

1. اذهب إلى **Edge Functions**
2. اختر `send-order-notification`
3. اضغط **Logs**
4. شاهد السجلات الفورية

### عرض Logs عبر CLI:

```bash
supabase functions logs send-order-notification
```

---

## 🔧 التعديل والتطوير

### تطوير محلي:

```bash
# تشغيل Edge Function محلياً
supabase functions serve send-order-notification

# في terminal آخر، اختبر:
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/send-order-notification' \
  --header 'Content-Type: application/json' \
  --data '{"record":{"id":"test","user_id":"user-id","status":"completed"}}'
```

### إعادة النشر بعد التعديل:

```bash
supabase functions deploy send-order-notification
```

---

## 💡 المزايا مقارنة بـ Worker

| الميزة | Edge Function | Worker (Node) |
|--------|--------------|---------------|
| **التكلفة** | مجاني حتى 500K طلب | يحتاج سيرفر |
| **الصيانة** | صفر | تحتاج PM2 |
| **التوسع** | تلقائي | يدوي |
| **السرعة** | فوري | كل 5 ثواني |
| **السهولة** | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🆘 حل المشاكل

### Edge Function لا تعمل

```bash
# تحقق من الـ deployment
supabase functions list

# عرض الأخطاء
supabase functions logs send-order-notification --tail
```

### Trigger لا يستدعي Edge Function

```sql
-- تحقق من وجود الـ Trigger
select trigger_name, event_object_table 
from information_schema.triggers 
where trigger_name = 'on_order_status_changed_edge';

-- تحقق من المتغيرات
show "app.settings.supabase_url";
show "app.settings.supabase_anon_key";
```

### SMTP لا يعمل

- ✅ تحقق من Environment Variables في Supabase Dashboard
- ✅ تحقق من Zoho credentials
- ✅ راجع Logs

---

## 📝 ملاحظات مهمة

1. ⚠️ **Service Role Key** سري جداً - لا ترفعه لـ Git
2. ⚠️ **Anon Key** عام - يمكن استخدامه في Frontend
3. ✅ Edge Functions تعمل على **Deno** وليس Node.js
4. ✅ التحديثات تُنشر فوراً بدون إعادة تشغيل

---

## 🎯 الخلاصة

### ما تم:
✅ Edge Function للإرسال التلقائي  
✅ Database Trigger للاستدعاء  
✅ SMTP Integration  
✅ Logging كامل  

### الخطوات:
1. نشر Edge Function
2. تنفيذ Trigger
3. اختبار
4. ✅ جاهز!

---

**🚀 الآن لديك نظام إشعارات تلقائي بدون سيرفر!**

**📖 للمزيد**: [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
