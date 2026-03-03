# إصلاحات بناء Next.js - Build Fixes

## ✅ المشاكل التي تم إصلاحها

### 1. next.config.js
- ✅ إزالة `swcMinify` (لم يعد مدعوم في Next.js 15)

### 2. app/layout.jsx
- ✅ إزالة `arabic` subset من Inter font
- ✅ فصل Providers إلى ملف منفصل (`app/providers.jsx`)
- ✅ الحفاظ على `metadata` في Server Component

### 3. Client Components
تم إضافة `'use client'` directive للمكونات التالية:
- ✅ `src/components/BackTop.jsx`
- ✅ `src/context/LanguageContext.jsx`
- ✅ `src/lib/redux/StoreProvider.jsx`
- ✅ `src/pages/not-found/NotFound.jsx`
- ✅ `src/components/shared/ErrorBoundary.jsx`
- ✅ `app/providers.jsx` (جديد)

### 4. Navigation Updates
- ✅ تحديث `NotFound.jsx` لاستخدام `useRouter` من `next/navigation`
- ✅ تحديث `ErrorBoundary.jsx` لاستخدام `useRouter` من `next/navigation`

### 5. netlify.toml
- ✅ تحديث `publish` directory إلى `.next`
- ✅ إضافة `@netlify/plugin-nextjs` plugin

### 6. package.json
- ✅ إضافة `@netlify/plugin-nextjs` في devDependencies

## 📁 الملفات المعدلة

1. `next.config.js` - إزالة swcMinify
2. `app/layout.jsx` - فصل Providers
3. `app/providers.jsx` - جديد: Client Component wrapper
4. `src/components/BackTop.jsx` - إضافة 'use client'
5. `src/context/LanguageContext.jsx` - إضافة 'use client'
6. `src/lib/redux/StoreProvider.jsx` - إضافة 'use client'
7. `src/pages/not-found/NotFound.jsx` - تحديث navigation + 'use client'
8. `src/components/shared/ErrorBoundary.jsx` - تحديث navigation + 'use client'
9. `netlify.toml` - تحديث إعدادات Netlify
10. `package.json` - إضافة @netlify/plugin-nextjs

## 🚀 الخطوات التالية

1. **تثبيت التبعيات الجديدة:**
   ```bash
   npm install
   ```

2. **اختبار البناء محلياً:**
   ```bash
   npm run build
   ```

3. **اختبار الإنتاج:**
   ```bash
   npm start
   ```

## ⚠️ ملاحظات مهمة

1. **app/layout.jsx** يجب أن يكون Server Component للحفاظ على metadata
2. **app/providers.jsx** هو Client Component wrapper لجميع Providers
3. **netlify.toml** يحتاج إلى `@netlify/plugin-nextjs` للعمل بشكل صحيح

## 📚 الموارد

- [Next.js App Router](https://nextjs.org/docs/app)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Netlify Next.js Plugin](https://docs.netlify.com/integrations/frameworks/nextjs/)

