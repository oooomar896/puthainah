# 🧪 دليل اختبار نظام الإشعارات وحل المشاكل

## 📋 الفهرس
1. [الاختبار السريع](#الاختبار-السريع)
2. [الاختبار التفصيلي](#الاختبار-التفصيلي)
3. [المشاكل الشائعة وحلولها](#المشاكل-الشائعة-وحلولها)
4. [التحقق من الإعدادات](#التحقق-من-الإعدادات)

---

## 🚀 الاختبار السريع (5 دقائق)

### الخطوة 1: التحقق من قاعدة البيانات

```sql
-- في Supabase SQL Editor

-- 1. تحقق من وجود الجداول
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notification_preferences', 'email_log', 'in_app_notifications');

-- يجب أن ترى 3 جداول ✅
```

**النتيجة المتوقعة:**
```
notification_preferences
email_log
in_app_notifications
```

**إذا لم تظهر الجداول:**
```sql
-- نفّذ هذا الملف:
-- database/migrations/mvp_notification_system.sql
```

---

### الخطوة 2: التحقق من متغيرات البيئة

```bash
# في ملف .env
cat .env | grep ZOHO
```

**يجب أن ترى:**
```env
ZOHO_SMTP_HOST=smtp.zoho.com
ZOHO_SMTP_PORT=465
ZOHO_SMTP_SECURE=true
ZOHO_SMTP_USER=info@bacuratec.com
ZOHO_SMTP_PASS=20Bac30@
ZOHO_FROM_EMAIL=info@bacuratec.com
ZOHO_FROM_NAME=Bacura Platform
```

**إذا كانت ناقصة:**
```bash
# أضفها إلى .env
echo "ZOHO_SMTP_USER=info@bacuratec.com" >> .env
echo "ZOHO_SMTP_PASS=20Bac30@" >> .env
# ... إلخ
```

---

### الخطوة 3: اختبار إرسال بريد بسيط

```javascript
// test-email.js
import { sendEmail } from './src/services/emailService.js';

async function testEmail() {
  console.log('🧪 Testing email sending...');
  
  const result = await sendEmail({
    to: 'YOUR_EMAIL@example.com', // ⚠️ ضع بريدك هنا
    subject: 'اختبار نظام الإشعارات',
    html: `
      <div dir="rtl" style="font-family: Arial; padding: 20px;">
        <h2>مرحباً!</h2>
        <p>هذا بريد اختبار من نظام الإشعارات.</p>
        <p>إذا استلمت هذا البريد، فالنظام يعمل بشكل صحيح! ✅</p>
      </div>
    `
  });
  
  console.log('Result:', result);
  
  if (result.success) {
    console.log('✅ Email sent successfully!');
  } else {
    console.log('❌ Error:', result.error);
  }
}

testEmail();
```

**تشغيل الاختبار:**
```bash
node test-email.js
```

**النتيجة المتوقعة:**
```
🧪 Testing email sending...
✅ Email sent successfully!
Result: { success: true, messageId: '...' }
```

---

## 🔍 الاختبار التفصيلي

### اختبار 1: التحقق من التفضيلات

```sql
-- في Supabase SQL Editor

-- 1. تحقق من وجود تفضيلات للمستخدمين
SELECT * FROM notification_preferences LIMIT 5;

-- 2. إذا لم توجد، أنشئ واحدة للاختبار
INSERT INTO notification_preferences (user_id, email_enabled, order_updates)
VALUES (
  (SELECT id FROM auth.users LIMIT 1), -- أول مستخدم
  true,
  true
)
ON CONFLICT (user_id) DO NOTHING;
```

---

### اختبار 2: اختبار دالة canSendEmail

```javascript
// test-can-send.js
import { canSendEmail } from './src/services/canSendEmail.js';

async function testCanSend() {
  const userId = 'YOUR_USER_ID'; // ⚠️ ضع معرف مستخدم حقيقي
  
  console.log('🧪 Testing canSendEmail...');
  
  const result = await canSendEmail(userId, 'order_updates');
  
  console.log('Result:', result);
  
  if (result.allowed) {
    console.log('✅ Email is allowed');
  } else {
    console.log('🔕 Email blocked:', result.reason);
  }
}

testCanSend();
```

---

### اختبار 3: اختبار إرسال إشعار كامل

```javascript
// test-notification.js
import { notifyOrderUpdate } from './src/services/notificationService.js';

async function testNotification() {
  console.log('🧪 Testing full notification...');
  
  const result = await notifyOrderUpdate(
    'YOUR_USER_ID',      // ⚠️ معرف المستخدم
    'ORD-TEST-123',      // رقم الطلب
    'completed',         // الحالة
    'تم إكمال طلبك بنجاح!' // الرسالة
  );
  
  console.log('Result:', result);
  
  if (result.success) {
    console.log('✅ Notification sent!');
  } else {
    console.log('❌ Failed:', result.reason || result.error);
  }
}

testNotification();
```

---

### اختبار 4: التحقق من email_log

```sql
-- بعد إرسال البريد، تحقق من السجل

SELECT 
  id,
  recipient_email,
  type,
  subject,
  status,
  error_text,
  created_at
FROM email_log
ORDER BY created_at DESC
LIMIT 10;
```

**النتيجة المتوقعة:**
```
id | recipient_email | type | subject | status | error_text | created_at
1  | user@email.com  | order_updates | ... | sent | null | 2026-01-06 ...
```

---

## ❌ المشاكل الشائعة وحلولها

### المشكلة 1: البريد لا يُرسل

**الأعراض:**
```
❌ Error: Invalid login
```

**الحلول:**

#### الحل 1: تحقق من Zoho credentials
```bash
# تحقق من .env
cat .env | grep ZOHO_SMTP

# يجب أن تكون:
ZOHO_SMTP_USER=info@bacuratec.com
ZOHO_SMTP_PASS=20Bac30@  # ⚠️ تأكد من صحة كلمة المرور
```

#### الحل 2: استخدم App Password
```
1. اذهب إلى Zoho Mail
2. Settings → Security → App Passwords
3. أنشئ App Password جديد
4. استخدمه في ZOHO_SMTP_PASS
```

#### الحل 3: تحقق من SMTP settings
```javascript
// في emailService.js
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",     // ✅ صحيح
  port: 465,                 // ✅ صحيح
  secure: true,              // ✅ صحيح
  auth: {
    user: process.env.ZOHO_SMTP_USER,
    pass: process.env.ZOHO_SMTP_PASS
  }
});
```

---

### المشكلة 2: "User email not found"

**الأعراض:**
```
❌ Error: User email not found
```

**الحلول:**

#### الحل 1: تحقق من جدول profiles
```sql
-- تحقق من وجود البريد
SELECT id, email, display_name 
FROM profiles 
WHERE id = 'USER_ID';

-- إذا لم يوجد، أضفه
INSERT INTO profiles (id, email, display_name)
VALUES (
  'USER_ID',
  'user@example.com',
  'اسم المستخدم'
);
```

#### الحل 2: تحقق من auth.users
```sql
-- البريد موجود في auth.users
SELECT id, email 
FROM auth.users 
WHERE id = 'USER_ID';
```

---

### المشكلة 3: RLS يمنع الوصول

**الأعراض:**
```
❌ Error: new row violates row-level security policy
```

**الحلول:**

#### الحل 1: تحقق من RLS policies
```sql
-- عرض policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('notification_preferences', 'email_log');
```

#### الحل 2: استخدم Service Role Key
```javascript
// في Backend/Worker
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ⚠️ مهم!
);
```

#### الحل 3: تعطيل RLS مؤقتاً للاختبار
```sql
-- ⚠️ للاختبار فقط!
ALTER TABLE email_log DISABLE ROW LEVEL SECURITY;

-- بعد الاختبار، أعد تفعيله
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
```

---

### المشكلة 4: Edge Function لا تعمل

**الأعراض:**
```
❌ Edge Function not found
```

**الحلول:**

#### الحل 1: تحقق من deployment
```bash
supabase functions list

# يجب أن ترى:
# send-order-notification
```

#### الحل 2: أعد النشر
```bash
supabase functions deploy send-order-notification
```

#### الحل 3: تحقق من Environment Variables
```
1. Supabase Dashboard
2. Edge Functions → Settings
3. تأكد من وجود:
   - ZOHO_SMTP_USER
   - ZOHO_SMTP_PASS
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
```

#### الحل 4: تحقق من Trigger
```sql
-- تحقق من وجود Trigger
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%edge%';

-- إذا لم يوجد، نفّذ:
-- database/migrations/edge_function_triggers.sql
```

---

### المشكلة 5: Worker لا يعالج الطابور

**الأعراض:**
```
Worker running but no emails sent
```

**الحلول:**

#### الحل 1: تحقق من Worker
```bash
# تحقق من حالة Worker
pm2 status

# عرض logs
pm2 logs notification-worker
```

#### الحل 2: تحقق من notification_queue
```sql
-- عرض الإشعارات المعلقة
SELECT * FROM notification_queue 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

#### الحل 3: أعد تشغيل Worker
```bash
pm2 restart notification-worker

# أو
pm2 delete notification-worker
pm2 start ecosystem.config.js
```

---

### المشكلة 6: صفحة الإعدادات لا تحفظ

**الأعراض:**
```
Settings page doesn't save
```

**الحلول:**

#### الحل 1: تحقق من Console
```javascript
// افتح Developer Tools → Console
// ابحث عن أخطاء
```

#### الحل 2: تحقق من RLS
```sql
-- تأكد من وجود policy للـ upsert
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'notification_preferences' 
AND policyname LIKE '%insert%';
```

#### الحل 3: تحقق من user_id
```javascript
// في NotificationSettings.jsx
console.log('User ID:', user.id);  // يجب أن يكون موجود
```

---

## ✅ التحقق من الإعدادات الكاملة

### قائمة التحقق الشاملة

```bash
# 1. قاعدة البيانات
✅ جدول notification_preferences موجود
✅ جدول email_log موجود
✅ جدول in_app_notifications موجود (اختياري)
✅ RLS policies مفعّلة
✅ Triggers موجودة

# 2. متغيرات البيئة
✅ ZOHO_SMTP_USER محدد
✅ ZOHO_SMTP_PASS محدد
✅ SUPABASE_URL محدد
✅ SUPABASE_SERVICE_ROLE_KEY محدد (للـ Worker/Edge Function)

# 3. الكود
✅ src/services/emailService.js موجود
✅ src/services/canSendEmail.js موجود
✅ src/services/notificationService.js موجود
✅ src/pages/NotificationSettings.jsx موجود

# 4. المكتبات
✅ nodemailer مثبت
✅ @supabase/supabase-js مثبت

# 5. الاختبار
✅ إرسال بريد يدوي يعمل
✅ canSendEmail يعمل
✅ notificationService يعمل
✅ صفحة الإعدادات تحفظ
```

---

## 🔧 أدوات التشخيص

### أداة 1: فحص شامل

```javascript
// diagnostic.js
import { supabase } from './src/lib/supabaseClient.js';

async function runDiagnostics() {
  console.log('🔍 Running diagnostics...\n');
  
  // 1. تحقق من الاتصال بـ Supabase
  console.log('1. Checking Supabase connection...');
  const { data, error } = await supabase.from('profiles').select('count');
  console.log(error ? '❌ Failed' : '✅ Connected\n');
  
  // 2. تحقق من الجداول
  console.log('2. Checking tables...');
  const tables = ['notification_preferences', 'email_log'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count');
    console.log(`   ${table}: ${error ? '❌' : '✅'}`);
  }
  console.log('');
  
  // 3. تحقق من متغيرات البيئة
  console.log('3. Checking environment variables...');
  const envVars = [
    'ZOHO_SMTP_USER',
    'ZOHO_SMTP_PASS',
    'SUPABASE_URL'
  ];
  for (const envVar of envVars) {
    console.log(`   ${envVar}: ${process.env[envVar] ? '✅' : '❌'}`);
  }
  console.log('');
  
  console.log('✅ Diagnostics complete!');
}

runDiagnostics();
```

**تشغيل:**
```bash
node diagnostic.js
```

---

### أداة 2: اختبار شامل

```javascript
// full-test.js
import { notifyOrderUpdate } from './src/services/notificationService.js';

async function fullTest() {
  console.log('🧪 Running full notification test...\n');
  
  const testCases = [
    {
      name: 'Order Completed',
      userId: 'USER_ID',
      orderId: 'TEST-001',
      status: 'completed',
      message: 'تم إكمال طلبك'
    },
    {
      name: 'Order Cancelled',
      userId: 'USER_ID',
      orderId: 'TEST-002',
      status: 'cancelled',
      message: 'تم إلغاء طلبك'
    }
  ];
  
  for (const test of testCases) {
    console.log(`Testing: ${test.name}...`);
    const result = await notifyOrderUpdate(
      test.userId,
      test.orderId,
      test.status,
      test.message
    );
    console.log(result.success ? '✅ Passed' : '❌ Failed');
    console.log('');
  }
  
  console.log('✅ All tests complete!');
}

fullTest();
```

---

## 📊 مراقبة النظام

### عرض إحصائيات الإرسال

```sql
-- إحصائيات آخر 24 ساعة
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM email_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

### عرض الإشعارات الفاشلة

```sql
SELECT 
  id,
  recipient_email,
  subject,
  error_text,
  attempts,
  created_at
FROM email_log
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

### عرض أكثر المستخدمين إرسالاً

```sql
SELECT 
  user_id,
  COUNT(*) as email_count,
  COUNT(*) FILTER (WHERE status = 'sent') as sent_count,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_count
FROM email_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY email_count DESC
LIMIT 10;
```

---

## 🎯 الخلاصة

### للبدء السريع:
1. ✅ نفّذ SQL migrations
2. ✅ أضف environment variables
3. ✅ ثبّت المكتبات
4. ✅ شغّل test-email.js
5. ✅ تحقق من email_log

### إذا واجهت مشاكل:
1. 🔍 راجع قسم "المشاكل الشائعة"
2. 🔧 شغّل diagnostic.js
3. 📖 راجع التوثيق
4. 💬 تحقق من logs

---

**📖 المراجع:**
- `docs/MVP_USAGE_GUIDE.md` - دليل الاستخدام
- `docs/EDGE_FUNCTIONS_GUIDE.md` - دليل Edge Functions
- `docs/AUTO_NOTIFICATION_GUIDE.md` - دليل Worker

**🆘 الدعم:**
- تحقق من Supabase Dashboard → Logs
- راجع PM2 logs: `pm2 logs`
- افتح Developer Console في المتصفح

---

**تاريخ الإنشاء**: 2026-01-06  
**الإصدار**: 1.0  
**الحالة**: ✅ جاهز للاستخدام
