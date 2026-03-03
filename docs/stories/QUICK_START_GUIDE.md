# 🚀 Quick Start Guide - Notification System

## الحد الأدنى للتنفيذ اليوم (MVP)

هذا الدليل يوضح الخطوات الأساسية لتشغيل نظام الإشعارات بأسرع وقت ممكن.

## ✅ المتطلبات الأساسية

### 1. قاعدة البيانات (30 دقيقة)

#### أ) جدول تفضيلات الإشعارات
```sql
-- نفذ هذا في Supabase SQL Editor
create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  order_updates boolean not null default true,
  billing_updates boolean not null default true,
  security_alerts boolean not null default true,
  marketing boolean not null default false,
  digest_mode text not null default 'immediate' check (digest_mode in ('immediate','daily','weekly')),
  quiet_hours_from time null,
  quiet_hours_to time null,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

create policy "Users can view own preferences"
on public.notification_preferences for select using (auth.uid() = user_id);

create policy "Users can upsert own preferences"
on public.notification_preferences for insert with check (auth.uid() = user_id);

create policy "Users can update own preferences"
on public.notification_preferences for update using (auth.uid() = user_id);
```

#### ب) جدول سجل الإرسال
```sql
create table public.email_log (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  recipient_email text not null,
  type text not null,
  subject text not null,
  status text not null default 'queued' check (status in ('queued','sent','failed','skipped')),
  error_text text null,
  attempts int not null default 0,
  provider text not null default 'zoho_smtp',
  provider_response text null,
  metadata jsonb null,
  created_at timestamptz not null default now(),
  sent_at timestamptz null
);

create index idx_email_log_status on public.email_log(status, attempts);
create index idx_email_log_user_id on public.email_log(user_id);

alter table public.email_log enable row level security;

create policy "Service role can manage email logs"
on public.email_log for all using (true);
```

#### ج) جدول الإشعارات داخل المنصة
```sql
create table public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('order_update', 'billing', 'security', 'system', 'message')),
  title text not null,
  body text not null,
  icon text null,
  link text null,
  read boolean not null default false,
  archived boolean not null default false,
  metadata jsonb null,
  created_at timestamptz not null default now(),
  read_at timestamptz null
);

create index idx_in_app_notifications_user_id on public.in_app_notifications(user_id);
create index idx_in_app_notifications_read on public.in_app_notifications(user_id, read);

alter table public.in_app_notifications enable row level security;

create policy "Users can view own notifications"
on public.in_app_notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
on public.in_app_notifications for update using (auth.uid() = user_id);

create policy "Service role can insert notifications"
on public.in_app_notifications for insert with check (true);
```

### 2. متغيرات البيئة (5 دقائق)

أضف هذه المتغيرات إلى ملف `.env`:

```env
# Zoho SMTP
ZOHO_SMTP_HOST=smtp.zoho.com
ZOHO_SMTP_PORT=465
ZOHO_SMTP_SECURE=true
ZOHO_SMTP_USER=info@bacuratec.com
ZOHO_SMTP_PASS=20Bac30@
ZOHO_FROM_EMAIL=info@bacuratec.com
ZOHO_FROM_NAME=Bacura Platform
```

### 3. تثبيت المكتبات (5 دقائق)

```bash
# Backend dependencies
npm install nodemailer node-cron

# Frontend dependencies (if not already installed)
npm install @supabase/supabase-js
```

## 📝 الكود الأساسي

### 1. خدمة البريد الإلكتروني (15 دقيقة)

أنشئ ملف `src/services/emailService.js`:

```javascript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST,
  port: parseInt(process.env.ZOHO_SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.ZOHO_SMTP_USER,
    pass: process.env.ZOHO_SMTP_PASS
  }
});

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: {
        name: process.env.ZOHO_FROM_NAME,
        address: process.env.ZOHO_FROM_EMAIL
      },
      to,
      subject,
      html
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}
```

### 2. دالة التحقق من الإرسال (10 دقائق)

أنشئ ملف `src/services/canSendEmail.js`:

```javascript
import { supabase } from '../lib/supabaseClient.js';

export async function canSendEmail(userId, type) {
  try {
    // جلب تفضيلات المستخدم
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // إذا لم توجد تفضيلات، اسمح بالإرسال (افتراضي)
    if (!prefs) return { allowed: true };

    // تحقق من التفعيل العام
    if (!prefs.email_enabled) {
      return { allowed: false, reason: 'email_disabled' };
    }

    // تحقق من نوع الإشعار
    const typeMap = {
      'order_updates': prefs.order_updates,
      'billing_updates': prefs.billing_updates,
      'security_alerts': prefs.security_alerts,
      'marketing': prefs.marketing
    };

    if (!typeMap[type]) {
      return { allowed: false, reason: 'type_disabled' };
    }

    return { allowed: true };

  } catch (error) {
    console.error('Error checking preferences:', error);
    return { allowed: true }; // في حالة الخطأ، اسمح بالإرسال
  }
}
```

### 3. دالة الإرسال الكاملة (15 دقيقة)

أنشئ ملف `src/services/notificationService.js`:

```javascript
import { supabase } from '../lib/supabaseClient.js';
import { canSendEmail } from './canSendEmail.js';
import { sendEmail } from './emailService.js';

export async function sendNotification({ userId, type, subject, htmlContent }) {
  try {
    // 1. التحقق من التفضيلات
    const canSend = await canSendEmail(userId, type);
    if (!canSend.allowed) {
      console.log(`Email skipped: ${canSend.reason}`);
      return { success: false, reason: canSend.reason };
    }

    // 2. جلب بريد المستخدم
    const { data: user } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (!user?.email) {
      return { success: false, reason: 'no_email' };
    }

    // 3. تسجيل في email_log
    const { data: log } = await supabase
      .from('email_log')
      .insert({
        user_id: userId,
        recipient_email: user.email,
        type,
        subject,
        status: 'queued'
      })
      .select()
      .single();

    // 4. إرسال البريد
    const result = await sendEmail({
      to: user.email,
      subject,
      html: htmlContent
    });

    // 5. تحديث الحالة
    await supabase
      .from('email_log')
      .update({
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date().toISOString() : null,
        error_text: result.error || null,
        attempts: 1
      })
      .eq('id', log.id);

    return result;

  } catch (error) {
    console.error('Notification error:', error);
    return { success: false, error: error.message };
  }
}

// دالة مساعدة لإرسال إشعار تحديث الطلب
export async function notifyOrderUpdate(userId, orderId, status) {
  const subject = `تحديث الطلب #${orderId}`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>تحديث حالة الطلب</h2>
      <p>تم تحديث حالة طلبك #${orderId} إلى: <strong>${status}</strong></p>
      <p>شكراً لاستخدامك منصة باكورا</p>
    </div>
  `;

  return await sendNotification({
    userId,
    type: 'order_updates',
    subject,
    htmlContent: html
  });
}
```

### 4. صفحة إعدادات الإشعارات (React) (30 دقيقة)

أنشئ ملف `src/pages/NotificationSettings.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

export default function NotificationSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    email_enabled: true,
    order_updates: true,
    billing_updates: true,
    security_alerts: true,
    marketing: false,
    digest_mode: 'immediate'
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPrefs(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  }

  async function savePreferences() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...prefs,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('تم حفظ التفضيلات بنجاح');
    } catch (error) {
      console.error('Error saving:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div dir="rtl" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>إعدادات الإشعارات</h1>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={prefs.email_enabled}
            onChange={(e) => setPrefs({ ...prefs, email_enabled: e.target.checked })}
          />
          <span>تفعيل الإشعارات عبر البريد الإلكتروني</span>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={prefs.order_updates}
            onChange={(e) => setPrefs({ ...prefs, order_updates: e.target.checked })}
            disabled={!prefs.email_enabled}
          />
          <span>تحديثات الطلبات</span>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={prefs.billing_updates}
            onChange={(e) => setPrefs({ ...prefs, billing_updates: e.target.checked })}
            disabled={!prefs.email_enabled}
          />
          <span>تحديثات الفواتير</span>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" checked disabled />
          <span>التنبيهات الأمنية (لا يمكن تعطيلها)</span>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={prefs.marketing}
            onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
            disabled={!prefs.email_enabled}
          />
          <span>العروض التسويقية</span>
        </label>
      </div>

      <button
        onClick={savePreferences}
        disabled={saving}
        style={{
          padding: '10px 20px',
          background: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        {saving ? 'جاري الحفظ...' : 'حفظ التفضيلات'}
      </button>
    </div>
  );
}
```

### 5. مكون جرس الإشعارات (20 دقيقة)

أنشئ ملف `src/components/NotificationBell.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

export default function NotificationBell() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    loadCount();

    // الاشتراك في التحديثات الفورية
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => loadCount()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user]);

  async function loadCount() {
    const { count } = await supabase
      .from('in_app_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    setCount(count || 0);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>
        🔔
      </button>
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'red',
            color: 'white',
            borderRadius: '10px',
            padding: '2px 6px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}
```

## 🎯 الاستخدام

### مثال: إرسال إشعار عند تحديث الطلب

```javascript
import { notifyOrderUpdate } from './services/notificationService.js';
import { supabase } from './lib/supabaseClient.js';

async function updateOrderStatus(orderId, newStatus) {
  // تحديث الطلب
  const { data: order } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    .select()
    .single();

  // إرسال إشعار بريد إلكتروني
  await notifyOrderUpdate(order.user_id, orderId, newStatus);

  // إنشاء إشعار داخل المنصة
  await supabase
    .from('in_app_notifications')
    .insert({
      user_id: order.user_id,
      type: 'order_update',
      title: `تحديث الطلب #${orderId}`,
      body: `تم تحديث حالة طلبك إلى: ${newStatus}`,
      icon: '📦',
      link: `/orders/${orderId}`
    });
}
```

## ⏱️ الوقت الإجمالي المتوقع

- قاعدة البيانات: **30 دقيقة**
- المتغيرات والمكتبات: **10 دقائق**
- الكود الأساسي: **70 دقيقة**
- **الإجمالي: ~2 ساعة**

## ✅ قائمة التحقق

- [ ] تنفيذ SQL للجداول الثلاثة
- [ ] إضافة متغيرات البيئة
- [ ] تثبيت المكتبات
- [ ] إنشاء emailService.js
- [ ] إنشاء canSendEmail.js
- [ ] إنشاء notificationService.js
- [ ] إنشاء صفحة الإعدادات
- [ ] إنشاء مكون الجرس
- [ ] اختبار إرسال بريد تجريبي
- [ ] اختبار الإشعارات داخل المنصة

## 🔍 الاختبار

```javascript
// اختبار سريع
import { notifyOrderUpdate } from './services/notificationService.js';

// استبدل بـ user_id حقيقي من قاعدة البيانات
await notifyOrderUpdate('user-uuid-here', 'ORD-123', 'مكتمل');
```

## 📚 الخطوات التالية

بعد تنفيذ الحد الأدنى، يمكنك إضافة:

1. **Worker للإرسال بالخلفية** (Story 12.9)
2. **قوالب بريد إلكتروني محسّنة** (Story 12.3)
3. **API Endpoints** (Story 12.8)
4. **واجهة إشعارات كاملة** (Story 12.10)
5. **اختبارات شاملة** (Story 12.7)

## 🆘 المساعدة

إذا واجهت مشاكل:

1. **SMTP لا يعمل**: تحقق من App Password في Zoho
2. **RLS يمنع الوصول**: تأكد من تسجيل الدخول بـ JWT صحيح
3. **الإشعارات لا تظهر**: تحقق من Supabase Realtime في Dashboard

---

**نصيحة**: ابدأ بالحد الأدنى واختبره جيداً قبل إضافة ميزات إضافية!
