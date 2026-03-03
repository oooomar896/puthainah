# دليل التكامل مع Next.js

تم تكامل المشروع بنجاح مع Next.js! هذا الدليل يوضح التغييرات الرئيسية وكيفية استخدام المشروع الآن.

## التغييرات الرئيسية

### 1. البنية الجديدة
- تم إنشاء مجلد `app/` لصفحات Next.js App Router
- تم إنشاء مجلد `lib/` للمكتبات المشتركة (Redux, Supabase, i18n)
- تم إنشاء مجلد `components/` للمكونات المحولة
- تم إنشاء مجلد `context/` للـ Context APIs

### 2. Redux Store
- تم إنشاء `lib/redux/store.js` مع دعم SSR
- تم إنشاء `lib/redux/StoreProvider.jsx` لتوفير Redux في Next.js
- تم تحديث `lib/redux/slices/authSlice.js` لدعم SSR (التحقق من `typeof window`)

### 3. Routing
- تم تحويل جميع المسارات من React Router إلى Next.js App Router
- الصفحات الآن في مجلد `app/` بدلاً من `src/pages/`
- المسارات الديناميكية تستخدم `[id]` بدلاً من `:id`

### 4. Navigation
- تم تحديث `AuthGuard` و `GuestGuard` لاستخدام `next/navigation` بدلاً من `react-router-dom`
- تم تحديث `MainLayout`, `DashboardLayout`, `AdminLayout` لاستخدام `children` بدلاً من `Outlet`

### 5. Environment Variables
- تم تغيير `VITE_*` إلى `NEXT_PUBLIC_*` لـ Next.js
- تم إنشاء ملف `.env.example` للمتغيرات المطلوبة

## المتغيرات البيئية المطلوبة

أنشئ ملف `.env.local` في جذر المشروع:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_DEFAULT_LANG=ar
```

## الأوامر الجديدة

```bash
# تشغيل المشروع في وضع التطوير
npm run dev

# بناء المشروع للإنتاج
npm run build

# تشغيل المشروع بعد البناء
npm run start
```

## المسارات المحولة

### Landing Pages (Requester)
- `/` - الصفحة الرئيسية
- `/request-service` - طلب خدمة
- `/requests` - استكشاف الطلبات
- `/requests/[id]` - تفاصيل الطلب
- `/projects` - المشاريع
- `/projects/[id]` - تفاصيل المشروع
- `/profile` - الملف الشخصي
- `/profile/reviews` - التقييمات

### Public Pages
- `/login` - تسجيل الدخول
- `/signup` - التسجيل
- `/signup-provider` - تسجيل مقدم خدمة
- `/our-services` - خدماتنا
- `/about-us` - من نحن
- `/how-it-work` - كيف يعمل
- `/faqs` - الأسئلة الشائعة
- `/partners` - الشركاء

### Provider Pages
- `/provider` - الصفحة الرئيسية
- `/provider/active-orders` - الطلبات النشطة
- `/provider/our-projects` - مشاريعنا
- `/provider/our-rates` - تقييماتنا

### Admin Pages
- `/admin` - الصفحة الرئيسية
- (يمكن إضافة باقي صفحات Admin بنفس الطريقة)

## ملاحظات مهمة

1. **Client Components**: جميع الصفحات والمكونات التي تستخدم hooks مثل `useState`, `useEffect`, أو Redux يجب أن تبدأ بـ `'use client'`

2. **Server Components**: المكونات التي لا تحتاج إلى تفاعل يمكن أن تكون Server Components (افتراضي في Next.js)

3. **Imports**: تم تحديث جميع الـ imports لاستخدام `@/` بدلاً من المسارات النسبية

4. **Supabase Client**: تم تحديث `lib/supabaseClient.js` لاستخدام `process.env.NEXT_PUBLIC_*` بدلاً من `import.meta.env.VITE_*`

5. **i18n**: تم تحديث `lib/i18n.js` لاستخدام `process.env.NEXT_PUBLIC_*`

## الخطوات التالية

1. إضافة باقي صفحات Admin و Provider
2. اختبار جميع المسارات والوظائف
3. تحديث أي مكونات تستخدم `react-router-dom` لاستخدام `next/navigation`
4. إضافة Metadata لكل صفحة (SEO)
5. تحسين الأداء باستخدام Server Components حيثما أمكن

## المشاكل المحتملة والحلول

### مشكلة: localStorage غير متاح
**الحل**: تم إصلاحها في `authSlice.js` و `LanguageContext.jsx` بإضافة `typeof window !== 'undefined'`

### مشكلة: imports لا تعمل
**الحل**: تأكد من تحديث `jsconfig.json` و استخدام `@/` للـ imports

### مشكلة: Redux لا يعمل
**الحل**: تأكد من استخدام `StoreProvider` في `app/layout.jsx`

## الدعم

إذا واجهت أي مشاكل، راجع:
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Redux Toolkit with Next.js](https://redux-toolkit.js.org/usage/nextjs)

