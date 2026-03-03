# Bakora Amal - Next.js Migration

## 🚀 الانتقال إلى Next.js

تم بدء عملية الانتقال من Vite + React Router إلى Next.js 15.

## 📋 الحالة الحالية

المشروع الآن يدعم **Next.js و Vite معاً** للمرحلة الانتقالية.

## 🛠️ التثبيت والتشغيل

### تثبيت التبعيات
```bash
npm install
```

### تشغيل Next.js (الطريقة الجديدة)
```bash
npm run dev
```
سيتم تشغيل Next.js على `http://localhost:3000`

### تشغيل Vite (الطريقة القديمة - للمرجع)
```bash
# سيتم إزالة هذا لاحقاً
```

## 📁 بنية المشروع

```
├── app/                    # Next.js App Router
│   ├── layout.jsx        # Root layout
│   ├── page.jsx          # Home page
│   ├── login/            # Login page
│   └── ...
├── src/                   # المكونات والصفحات (لا تزال تعمل)
│   ├── components/
│   ├── pages/
│   └── ...
├── middleware.js          # Next.js middleware للـ authentication
└── next.config.js        # إعدادات Next.js
```

## 🔄 Environment Variables

### Next.js
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_BASE_URL=...
```

### Vite (للمرحلة الانتقالية)
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_APP_BASE_URL=...
```

## 📝 ملاحظات مهمة

1. **المشروع يعمل الآن على Next.js** - جميع المسارات الجديدة تستخدم Next.js
2. **المكونات القديمة لا تزال تعمل** - لكن تحتاج تحديث تدريجي
3. **لا تحذف src/App.jsx** - نحتاجه كمرجع أثناء التحويل
4. **اختبر كل صفحة** بعد تحويلها

## 🎯 الخطوات التالية

راجع `docs/NEXTJS_MIGRATION_GUIDE.md` للتفاصيل الكاملة.

## 📚 الموارد

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Migration Guide](./docs/NEXTJS_MIGRATION_GUIDE.md)

