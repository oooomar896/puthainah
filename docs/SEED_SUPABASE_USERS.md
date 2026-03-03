# إنشاء مستخدمين تجريبيين في Supabase

- يعتمد السكربت على `SUPABASE_SERVICE_ROLE_KEY` و`SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL` الموجودة في البيئة.
- يقوم بإنشاء/تحديث 3 مستخدمين مع الأدوار: `Admin`, `Provider`, `Requester`.
- يتم مزامنة الجداول عبر Trigger `handle_new_user` لتعزيز الربط مع `public.users` وجداول الأدوار.

## التشغيل
- تأكد أن `.env` يحتوي على:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL` أو `SUPABASE_URL`
- نفّذ:
```
npm run seed:supabase
```

## تفاصيل
- إن كان المستخدم موجودًا سيتم تحديث دوره في `public.users` وضمان وجود سجل في جدول الدور المناسب.
- إن لم يكن موجودًا سيتم إنشاؤه في `auth.users` مع `email_confirm: true` و`user_metadata.role` ثم ضمان تطابق الجداول العامة.

