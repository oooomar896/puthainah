# 🤖 دليل تشغيل نظام الإشعارات التلقائي

## ✅ ما تم إنشاؤه

تم إنشاء نظام **إرسال تلقائي كامل** للإشعارات!

### الملفات الجديدة:
1. ✅ `database/migrations/auto_notification_triggers.sql` - Database Triggers
2. ✅ `workers/notificationWorker.js` - Worker للمعالجة التلقائية
3. ✅ `ecosystem.config.js` - PM2 Configuration

---

## 🎯 كيف يعمل النظام؟

```
1. يحدث حدث (مثل: تحديث حالة الطلب)
   ↓
2. Database Trigger يضيف إشعار للطابور (notification_queue)
   ↓
3. Worker يعالج الطابور كل 5 ثواني
   ↓
4. Worker يتحقق من التفضيلات
   ↓
5. Worker يرسل البريد عبر Zoho SMTP
   ↓
6. Worker يحدث الحالة (sent/failed/skipped)
```

---

## 📋 خطوات التفعيل

### 1️⃣ تنفيذ SQL Triggers (5 دقائق)

```sql
-- افتح Supabase Dashboard → SQL Editor
-- انسخ محتوى: database/migrations/auto_notification_triggers.sql
-- الصق وشغّل Run
```

**ما سيحدث:**
- ✅ إنشاء جدول `notification_queue`
- ✅ إنشاء Triggers تلقائية لـ:
  - تحديث حالة الطلب
  - إنشاء فاتورة جديدة
  - رسالة جديدة في المشروع
- ✅ دوال مساعدة للمعالجة

---

### 2️⃣ إضافة Service Role Key (دقيقتان)

```env
# في ملف .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# احصل عليه من:
# Supabase Dashboard → Settings → API → service_role key
```

⚠️ **مهم**: Service Role Key سري جداً! لا ترفعه لـ Git!

---

### 3️⃣ تثبيت المكتبات (دقيقة)

```bash
npm install @supabase/supabase-js
npm install -g pm2  # للتشغيل في الخلفية
```

---

### 4️⃣ تشغيل Worker (دقيقة)

#### للتطوير (Development):
```bash
# تشغيل مباشر
node workers/notificationWorker.js

# أو باستخدام nodemon للتحديث التلقائي
npx nodemon workers/notificationWorker.js
```

#### للإنتاج (Production):
```bash
# تشغيل باستخدام PM2
pm2 start ecosystem.config.js

# عرض الحالة
pm2 status

# عرض Logs
pm2 logs notification-worker

# إيقاف
pm2 stop notification-worker

# إعادة تشغيل
pm2 restart notification-worker
```

---

## 🧪 الاختبار

### اختبار 1: تحديث حالة طلب

```javascript
// في أي مكان في الكود
const { data, error } = await supabase
  .from('orders')
  .update({ status: 'completed' })
  .eq('id', 'order-id-here');

// ✅ سيتم إضافة إشعار تلقائياً للطابور!
```

### اختبار 2: التحقق من الطابور

```sql
-- في Supabase SQL Editor
select * from notification_queue 
order by created_at desc 
limit 10;
```

### اختبار 3: مراقبة Worker

```bash
# عرض logs مباشرة
pm2 logs notification-worker --lines 50
```

---

## 📊 مراقبة النظام

### عرض الإحصائيات

```sql
-- عدد الإشعارات حسب الحالة
select status, count(*) 
from notification_queue 
group by status;

-- الإشعارات الفاشلة
select * from notification_queue 
where status = 'failed' 
order by created_at desc;

-- معدل النجاح
select 
  count(*) filter (where status = 'sent') as sent,
  count(*) filter (where status = 'failed') as failed,
  round(
    count(*) filter (where status = 'sent')::numeric / 
    nullif(count(*)::numeric, 0) * 100, 
    2
  ) as success_rate
from notification_queue
where created_at > now() - interval '24 hours';
```

---

## 🔧 التخصيص

### تغيير سرعة المعالجة

```javascript
// في workers/notificationWorker.js
const POLL_INTERVAL = 5000; // غيّر هذا الرقم (بالميلي ثانية)
```

### تغيير حجم الدفعة

```javascript
const BATCH_SIZE = 10; // عدد الإشعارات في كل دفعة
```

### إضافة نوع إشعار جديد

1. أضف Trigger في SQL:
```sql
create or replace function trigger_custom_notification()
returns trigger as $$
begin
  insert into notification_queue (
    user_id,
    notification_type,
    subject,
    data,
    priority
  ) values (
    NEW.user_id,
    'custom',
    'عنوان الإشعار',
    jsonb_build_object('key', 'value'),
    'normal'
  );
  return NEW;
end;
$$ language plpgsql;
```

2. أضف قالب في Worker:
```javascript
getCustomTemplate(data, userName) {
  return `<div dir="rtl">...</div>`;
}
```

---

## 🆘 حل المشاكل

### Worker لا يعمل

```bash
# تحقق من الأخطاء
pm2 logs notification-worker --err

# تحقق من متغيرات البيئة
pm2 env notification-worker

# إعادة تشغيل
pm2 restart notification-worker
```

### الإشعارات لا تُضاف للطابور

```sql
-- تحقق من وجود Triggers
select trigger_name, event_object_table 
from information_schema.triggers 
where trigger_schema = 'public';

-- تحقق من آخر خطأ
select * from notification_queue 
where status = 'failed' 
order by created_at desc 
limit 5;
```

### البريد لا يُرسل

- ✅ تحقق من Service Role Key
- ✅ تحقق من Zoho SMTP credentials
- ✅ تحقق من logs: `pm2 logs notification-worker`

---

## 📈 الأداء

| المقياس | القيمة الموصى بها |
|---------|-------------------|
| POLL_INTERVAL | 5000ms (5 ثواني) |
| BATCH_SIZE | 10-20 إشعار |
| Max Attempts | 3 محاولات |
| Memory Limit | 500MB |

---

## 🎯 الميزات المتوفرة الآن

✅ **إرسال تلقائي** عند:
- تحديث حالة الطلب
- إنشاء فاتورة جديدة
- رسالة جديدة في المشروع

✅ **معالجة ذكية**:
- التحقق من التفضيلات
- إعادة المحاولة عند الفشل
- تخطي إذا كان معطّل
- تسجيل كامل

✅ **مراقبة**:
- Logs تفصيلية
- إحصائيات في قاعدة البيانات
- PM2 Dashboard

---

## 🚀 الخطوات التالية (اختياري)

1. ⏳ إضافة Slack/Discord notifications للأخطاء
2. ⏳ Dashboard لمراقبة الإشعارات
3. ⏳ تنبيهات عند ارتفاع معدل الفشل
4. ⏳ A/B Testing للقوالب

---

## 📝 ملخص الأوامر

```bash
# تشغيل
pm2 start ecosystem.config.js

# مراقبة
pm2 logs notification-worker

# حالة
pm2 status

# إيقاف
pm2 stop notification-worker

# حذف
pm2 delete notification-worker
```

---

## ✅ قائمة التحقق

- [ ] تنفيذ SQL triggers
- [ ] إضافة Service Role Key
- [ ] تثبيت المكتبات
- [ ] تشغيل Worker
- [ ] اختبار بتحديث طلب
- [ ] التحقق من الطابور
- [ ] مراقبة Logs

---

**🎉 تهانينا! الآن لديك نظام إشعارات تلقائي بالكامل!**

**📖 للمزيد**: راجع `workers/notificationWorker.js` للتخصيص
