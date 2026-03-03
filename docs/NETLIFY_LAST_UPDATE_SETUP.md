# إعداد Last Update مع Netlify CLI و MCP

## نظرة عامة

تم إضافة ميزة "آخر تحديث" (Last Update) إلى التطبيق باستخدام Netlify CLI و MCP. تعرض هذه الميزة تاريخ ووقت آخر تحديث/بناء للموقع.

## الملفات المعدلة

### 1. ملفات الترجمة
- `src/locales/ar.json` - إضافة `"lastUpdate": "آخر تحديث"`
- `src/locales/en.json` - إضافة `"lastUpdate": "Last Update"`

### 2. مكونات React
- `src/components/Layouts/main-layout/footer/Footer.jsx` - إضافة عرض آخر تحديث في Footer
- `app/layout.jsx` - إضافة metadata و build time script

### 3. Utilities
- `lib/utils/buildInfo.js` - دوال مساعدة للحصول على build time وتنسيقه
- `src/utils/buildInfo.js` - نسخة للاستخدام مع Vite/React القديم

### 4. إعدادات البناء
- `package.json` - تحديث build script لتعيين BUILD_TIME
- `next.config.js` - إضافة NEXT_PUBLIC_BUILD_TIME إلى environment variables
- `netlify.toml` - إعدادات Netlify (تم تبسيطها)
- `scripts/set-build-time.js` - Script جديد لتعيين build time

## كيفية العمل

### أثناء البناء (Build Time)

1. **Script البناء**: عند تشغيل `npm run build`، يتم تنفيذ `scripts/set-build-time.js`
2. **تعيين Build Time**: يتم تعيين `NEXT_PUBLIC_BUILD_TIME` و `BUILD_TIME` إلى الوقت الحالي
3. **Next.js Build**: يتم تشغيل `next build` مع متغيرات البيئة المحددة

### في Runtime

1. **Metadata**: يتم حفظ build time في metadata الخاص بـ Next.js
2. **Script Tag**: يتم إضافة script tag في layout.jsx لتعيين `window.__BUILD_TIME__`
3. **Footer Component**: يقرأ Footer component الوقت من meta tag أو window object ويعرضه

## الاستخدام

### في المكونات

```jsx
import { formatLastUpdate, getLastUpdateTime } from '@/lib/utils/buildInfo';

// الحصول على آخر تحديث
const lastUpdate = getLastUpdateTime();
const formatted = formatLastUpdate(lastUpdate, 'ar-SA'); // أو 'en-US'
```

### في Footer

تم إضافة عرض آخر تحديث تلقائياً في Footer component مع دعم الترجمة.

## متغيرات البيئة

### Netlify
Netlify سيقوم تلقائياً بتعيين BUILD_TIME أثناء البناء. يمكنك أيضاً تعيينه يدوياً في Netlify Dashboard:
- Site settings → Environment variables
- `BUILD_TIME` أو `NEXT_PUBLIC_BUILD_TIME`

### التطوير المحلي
عند التطوير المحلي، سيتم استخدام الوقت الحالي كـ build time.

## تنسيق التاريخ

يتم تنسيق التاريخ باستخدام `Intl.DateTimeFormat` مع:
- دعم اللغة العربية والإنجليزية
- Timezone: Asia/Riyadh
- التنسيق: السنة، الشهر، اليوم، الساعة، الدقيقة

## ملاحظات

1. **Next.js App Router**: تم استخدام metadata API من Next.js 13+
2. **Client/Server**: يعمل على كلا الجانبين (client-side و server-side)
3. **Fallback**: في حالة عدم توفر build time، يتم استخدام الوقت الحالي
4. **i18n**: يدعم الترجمة تلقائياً حسب لغة المستخدم

## الاختبار

لاختبار الميزة:

1. قم ببناء التطبيق: `npm run build`
2. شغل التطبيق: `npm start`
3. افتح الموقع وتحقق من Footer - يجب أن يظهر "آخر تحديث" مع التاريخ والوقت

## استكشاف الأخطاء

### لا يظهر آخر تحديث
- تأكد من أن build script يعمل بشكل صحيح
- تحقق من وجود `NEXT_PUBLIC_BUILD_TIME` في environment variables
- افتح Developer Tools وتحقق من `window.__BUILD_TIME__`

### التاريخ غير صحيح
- تحقق من timezone settings
- تأكد من أن build time يتم تعيينه بشكل صحيح أثناء البناء

## التحديثات المستقبلية

- إضافة cache invalidation بناءً على build time
- عرض build version مع last update
- إضافة API endpoint لإرجاع build info

