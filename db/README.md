## قاعدة البيانات للمشروع

هذا المجلد يحتوي على سكربتات SQL لبناء قاعدة بيانات **PostgreSQL** متوافقة مع واجهات الـ API المستخدمة في مشروع الواجهة الأمامية.

### طريقة الاستخدام

1. أنشئ قاعدة بيانات PostgreSQL جديدة (محليًا أو على خادم).
2. نفّذ الملفات بالترتيب العددي:
   - `001_core_users.sql`
   - `002_lookups_and_cities.sql`
   - `003_accounts.sql`
   - `004_services_requests_orders.sql`
   - `005_attachments.sql`
   - `006_ratings_tickets_notifications.sql`
   - `007_faqs_partners_customers.sql`
   - `008_payments_profile.sql`
   - `009_seed_lookups_cities.sql` (بيانات تجريبية)
   - `010_seed_demo_data.sql` (بيانات تجريبية)
   - `011_seed_demo_data_simple.sql` (بيانات تجريبية بسيطة)
   - **`012_indexes_and_performance.sql`** ⭐ (جديد - فهارس لتحسين الأداء)
   - **`013_functions_and_triggers.sql`** ⭐ (جديد - دوال وtriggers تلقائية)
   - **`014_constraints_and_validations.sql`** ⭐ (جديد - قيود وتحسينات)
   - **`015_rls_policies.sql`** ⭐ (جديد - سياسات الأمان RLS)
   - **`016_simplify_admin_rls.sql`** ⭐ (جديد - تبسيط سياسات RLS للأدمن)

3. حدّث متغير البيئة في مشروع React:

```env
VITE_APP_BASE_URL=http://localhost:5141/
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### الملفات الجديدة

#### 012_indexes_and_performance.sql
- فهارس (Indexes) لتحسين أداء الاستعلامات
- فهارس مركبة للاستعلامات المعقدة
- فهارس جزئية (Partial Indexes) للاستعلامات المشروطة

#### 013_functions_and_triggers.sql
- دالة `update_updated_at_column()`: تحديث `updated_at` تلقائياً
- دالة `calculate_provider_avg_rate()`: حساب متوسط التقييمات
- دالة `get_user_role()`: جلب role المستخدم (للاستخدام في LoginForm)
- دالة `update_provider_avg_rate()`: تحديث avg_rate تلقائياً
- دالة `create_order_status_notification()`: إنشاء إشعارات تلقائية
- دالة `validate_order_dates()`: التحقق من صحة التواريخ
- Triggers تلقائية لتحديث `updated_at` في جميع الجداول
- Trigger لتحديث avg_rate عند إضافة تقييم
- Trigger لإنشاء إشعارات عند تغيير حالة الطلب

#### 014_constraints_and_validations.sql
- Constraints للتحقق من صحة البيانات
- Constraints للبريد الإلكتروني والأرقام
- Constraints لمنع القيم الفارغة
- Constraints للتحقق من التواريخ
- إضافة عمود `order_price` إذا لم يكن موجوداً

#### 015_rls_policies.sql
- Row Level Security (RLS) Policies للأمان
- Policies للمستخدمين: قراءة وتحديث بياناتهم فقط
- Policies للأدمن: قراءة جميع البيانات
- Policies للطلبات والأوامر: حسب الدور
- Policies للإشعارات: المستخدم يرى إشعاراته فقط
- Policies للمرفقات: حسب المالك

> **ملاحظة مهمة**: ملف `015_rls_policies.sql` مخصص لـ Supabase. إذا كنت تستخدم PostgreSQL عادي، قد تحتاج لتعديله أو استخدام نظام أمان آخر.

#### 016_simplify_admin_rls.sql ⚠️ **مهم - إصلاح أخطاء 500**
- **يحل مشكلة 500 Internal Server Error** في استعلامات الأدمن
- تبسيط سياسات RLS للأدمن: التحقق من `users.role = 'Admin'` مباشرة بدلاً من استعلامات معقدة
- إضافة سياسات UPDATE وDELETE وINSERT للأدمن على جميع الجداول
- إصلاح دالة `get_user_role()` وجعلها متاحة كـ RPC function
- تحسين الأداء بشكل كبير للاستعلامات الإدارية

> **يجب تطبيق هذا الملف بعد `015_rls_policies.sql` لحل مشاكل الوصول للأدمن**

### الميزات الجديدة

1. **تحسين الأداء**: الفهارس تحسن سرعة الاستعلامات بشكل كبير
2. **العمليات التلقائية**: Triggers تقوم بتحديث البيانات تلقائياً
3. **الأمان**: RLS Policies تحمي البيانات على مستوى الصف
4. **التحقق من البيانات**: Constraints تضمن صحة البيانات
5. **الدوال المساعدة**: دوال SQL لتسهيل العمليات الشائعة

### ملاحظات

- يمكنك تعديل أسماء الجداول أو الحقول حسب الحاجة، لكن يجب الحفاظ على المنطق العام للعلاقات حتى تعمل الواجهات الحالية بدون تعديل كبير.
- تأكد من تنفيذ الملفات بالترتيب الصحيح.
- بعد تنفيذ الملفات الجديدة، قد تحتاج لإعادة فحص RLS policies في Supabase Dashboard.
