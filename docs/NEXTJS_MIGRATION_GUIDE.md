# دليل الانتقال إلى Next.js - Migration Guide

## 📅 تاريخ البدء: 2024

## ✅ الخطوات المنجزة

### 1. تحديث package.json
- ✅ إضافة Next.js 15.1.0
- ✅ إزالة Vite والتبعيات المرتبطة
- ✅ تحديث scripts لاستخدام Next.js
- ✅ إضافة @netlify/next للدعم

### 2. إنشاء next.config.js
- ✅ إعدادات Next.js الأساسية
- ✅ دعم Netlify
- ✅ Image optimization
- ✅ API rewrites
- ✅ Webpack configuration

### 3. تحديث ملفات الإعدادات
- ✅ tailwind.config.js - تحديث لـ Next.js
- ✅ jsconfig.json - تحديث paths
- ✅ postcss.config.js - جاهز للاستخدام

### 4. إنشاء بنية Next.js App Router
- ✅ app/layout.jsx - Layout الرئيسي
- ✅ app/page.jsx - الصفحة الرئيسية
- ✅ app/loading.jsx - Loading state
- ✅ app/not-found.jsx - 404 page

### 5. تحديث Supabase Client
- ✅ تحديث لاستخدام process.env بدلاً من import.meta.env
- ✅ دعم NEXT_PUBLIC_* variables

### 6. إنشاء Middleware
- ✅ Authentication guards
- ✅ Role-based access control
- ✅ Redirect logic

## 🔄 الخطوات المتبقية

### 1. تحويل جميع المسارات
- [ ] إنشاء app/login/page.jsx
- [ ] إنشاء app/signup/page.jsx
- [ ] إنشاء app/request-service/page.jsx
- [ ] إنشاء app/requests/page.jsx
- [ ] إنشاء app/requests/[id]/page.jsx
- [ ] إنشاء app/projects/page.jsx
- [ ] إنشاء app/projects/[id]/page.jsx
- [ ] إنشاء app/profile/page.jsx
- [ ] إنشاء app/profile/reviews/page.jsx
- [ ] إنشاء app/tickets/page.jsx
- [ ] إنشاء app/provider/page.jsx
- [ ] إنشاء app/provider/active-orders/page.jsx
- [ ] إنشاء app/provider/our-projects/page.jsx
- [ ] إنشاء app/provider/our-rates/page.jsx
- [ ] إنشاء app/provider/profile/page.jsx
- [ ] إنشاء app/provider/tickets/page.jsx
- [ ] إنشاء app/provider/tickets/[id]/page.jsx
- [ ] إنشاء app/provider/projects/[id]/page.jsx
- [ ] إنشاء app/admin/page.jsx
- [ ] إنشاء جميع صفحات Admin

### 2. تحديث المكونات
- [ ] تحديث جميع useNavigate → useRouter من next/navigation
- [ ] تحديث جميع useLocation → usePathname من next/navigation
- [ ] تحديث جميع Link من react-router-dom → next/link
- [ ] تحديث جميع useParams لاستخدام params prop
- [ ] إضافة 'use client' للمكونات التي تستخدم hooks

### 3. تحديث Environment Variables
- [ ] تحديث .env.example
- [ ] تغيير VITE_* إلى NEXT_PUBLIC_*
- [ ] تحديث جميع الملفات التي تستخدم import.meta.env

### 4. تحديث Redux
- ✅ StoreProvider جاهز للاستخدام
- [ ] التأكد من عمل Redux مع SSR
- [ ] اختبار state management

### 5. اختبارات
- [ ] اختبار جميع المسارات
- [ ] اختبار Authentication flow
- [ ] اختبار Role-based access
- [ ] اختبار API calls
- [ ] اختبار i18n
- [ ] اختبار RTL/LTR

## 📝 ملاحظات مهمة

### Environment Variables
في Next.js، المتغيرات البيئية التي تحتاج للوصول من المتصفح يجب أن تبدأ بـ `NEXT_PUBLIC_`:

```env
# قبل (Vite)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# بعد (Next.js)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Routing
- في React Router: `/requests/:id`
- في Next.js: `/requests/[id]`

### Navigation
```jsx
// قبل (React Router)
import { useNavigate, useLocation, Link } from 'react-router-dom';
const navigate = useNavigate();
navigate('/profile');

// بعد (Next.js)
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
const router = useRouter();
router.push('/profile');
```

### Client Components
المكونات التي تستخدم hooks أو state يجب أن تكون Client Components:

```jsx
'use client';

import { useState } from 'react';
```

### Server Components
المكونات البسيطة يمكن أن تكون Server Components (افتراضي):

```jsx
// No 'use client' directive = Server Component
export default function MyComponent() {
  return <div>Hello</div>;
}
```

## 🚀 خطوات التشغيل

1. **تثبيت التبعيات:**
   ```bash
   npm install
   ```

2. **إنشاء ملف .env.local:**
   ```bash
   cp .env.example .env.local
   # ثم تحديث القيم
   ```

3. **تشغيل المشروع:**
   ```bash
   npm run dev
   ```

4. **بناء المشروع:**
   ```bash
   npm run build
   ```

5. **تشغيل الإنتاج:**
   ```bash
   npm start
   ```

## ⚠️ تحذيرات

1. **لا تحذف src/App.jsx الآن** - سنحتاجه كمرجع أثناء التحويل
2. **احفظ نسخة احتياطية** قبل البدء
3. **اختبر كل صفحة** بعد تحويلها
4. **تأكد من تحديث جميع الـ imports**

## 📚 الموارد

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Migrating from React Router](https://nextjs.org/docs/app/building-your-application/routing/migrating)

