# إعداد المتغيرات البيئية - Environment Variables Setup

## المشكلة الحالية

إذا كنت ترى هذا الخطأ:
```
❌ Supabase configuration is missing!
```

هذا يعني أن ملف `.env.local` غير موجود أو أن المتغيرات البيئية غير معرّفة.

## الحل السريع

### الخطوة 1: إنشاء ملف `.env.local`

أنشئ ملف جديد باسم `.env.local` في المجلد الرئيسي للمشروع (نفس مستوى `package.json`).

### الخطوة 2: إضافة المتغيرات المطلوبة

أضف السطور التالية إلى ملف `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### الخطوة 3: الحصول على بيانات Supabase

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر مشروعك أو أنشئ مشروع جديد
3. اذهب إلى **Settings** → **API**
4. انسخ القيم التالية:
   - **Project URL** → استخدمها في `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → استخدمها في `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### الخطوة 4: إعادة تشغيل الخادم

بعد إنشاء الملف، أعد تشغيل خادم التطوير:

```bash
# أوقف الخادم الحالي (Ctrl+C)
# ثم شغله مرة أخرى
npm run dev
```

## مثال على ملف `.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example

# App Configuration (Optional)
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LANG=ar
```

## ملاحظات مهمة

1. **الملف `.env.local` محمي**: هذا الملف موجود في `.gitignore` ولن يتم رفعه إلى Git، لذا بياناتك آمنة.

2. **لا تشارك المفاتيح**: لا تشارك ملف `.env.local` أو المفاتيح مع أي شخص.

3. **للاستخدام في الإنتاج**: عند النشر على Netlify أو أي منصة أخرى، أضف المتغيرات البيئية من لوحة التحكم الخاصة بالمنصة.

4. **إعادة التشغيل مطلوبة**: بعد إنشاء أو تعديل `.env.local`، يجب إعادة تشغيل خادم Next.js.

## استكشاف الأخطاء

### الخطأ: "Invalid Supabase URL format"
- تأكد أن URL يبدأ بـ `https://` أو `http://`
- تأكد من عدم وجود مسافات في بداية أو نهاية القيمة

### الخطأ: "supabaseKey is required"
- تأكد أن `NEXT_PUBLIC_SUPABASE_ANON_KEY` موجود وليس فارغاً
- تأكد من عدم وجود مسافات إضافية

### المتغيرات لا تعمل
- تأكد أن اسم الملف هو `.env.local` وليس `.env.local.txt`
- تأكد أن المتغيرات تبدأ بـ `NEXT_PUBLIC_` للاستخدام في المتصفح
- أعد تشغيل خادم التطوير

## المساعدة

إذا استمرت المشكلة:
1. تحقق من أن ملف `.env.local` في المجلد الرئيسي للمشروع
2. تحقق من أن المتغيرات مكتوبة بشكل صحيح (بدون مسافات إضافية)
3. تأكد من إعادة تشغيل الخادم بعد التعديلات

