# سجل التغييرات (Changelog)

## [2.1.0] - 2026-01-03

### ✨ ميزات جديدة

#### Migration: الإنشاء التلقائي للمشاريع عند الدفع
- ✅ **Function: `auto_create_order_on_payment()`**
  - ينشئ مشروعاً تلقائياً في جدول `orders` عند تحديث حالة الطلب إلى 204 (مدفوع)
  - يتحقق من عدم وجود مشروع مسبق
  - يستخدم حالة "بانتظار البدء" كحالة افتراضية
- ✅ **Function: `sync_order_status_with_request()`**
  - يزامن حالة المشروع مع حالة الطلب تلقائياً
  - خريطة تحويل من حالات الطلبات إلى حالات المشاريع
- ✅ **Triggers تلقائية**
  - `trigger_auto_create_order_on_payment` - ينفذ عند تحديث requests
  - `trigger_sync_order_status` - يزامن الحالات
- ✅ **Backfill Script**
  - يحول جميع الطلبات المدفوعة الحالية إلى مشاريع
- ✅ **Indexes** لتحسين أداء جدول orders

#### المكونات الجديدة
- ✅ **PaymentOptions.jsx** - نظام دفع محسّن
  - 3 خيارات دفع: بطاقة، تحويل بنكي، نقدي
  - عرض بيانات التحويل البنكي الكاملة
  - رفع إيصال الدفع كمرفقات
  - واجهة مستخدم عصرية ومتجاوبة
- ✅ **RequestChat.jsx** - نظام محادثة متكامل
  - إنشاء تذكرة تلقائية للمحادثة
  - ربط التذكرة بالطلب أو المشروع
  - إرسال واستقبال الرسائل
  - عرض سجل المحادثات

#### API Endpoints الجديدة
- ✅ `ticketMessagesApi.js` - إدارة رسائل التذاكر
  - `useGetTicketMessagesQuery`
  - `useSendTicketMessageMutation`

### 🔧 تحسينات

#### قاعدة البيانات
- ✅ تحسين أداء جدول `orders` من خلال الـ indexes
- ✅ تلقائية سير العمل من طلب إلى مشروع

#### Frontend
- ✅ تحسين تجربة الدفع مع خيارات متعددة
- ✅ تحسين التواصل مع المحادثة المباشرة
- ✅ واجهة مستخدم أكثر احترافية

### 📚 التوثيق
- ✅ **MIGRATION_GUIDE.md** - دليل تطبيق سريع
- ✅ **walkthrough.md** - مراجعة شاملة مع carousel تفاعلي
- ✅ **implementation_plan.md** - خطة تنفيذ مفصلة
- ✅ **verify_migration.sql** - سكريبت التحقق من التطبيق
- ✅ **apply-migration.js** - سكريبت Node.js للتطبيق

### 📋 الملفات الجديدة

#### Database Migrations
- `supabase/migrations/20260101_auto_create_order_on_payment.sql`
- `supabase/migrations/verify_migration.sql`

#### Frontend Components
- `src/components/landing-components/request-service/PaymentOptions.jsx`
- `src/components/landing-components/request-service/RequestChat.jsx`
- `src/components/landing-components/request-service/RequestRating.jsx`
- `src/components/admin-components/tickets/AdminTicketChat.jsx`
- `src/components/shared/UserAvatarMenu.jsx`

#### API
- `src/redux/api/ticketMessagesApi.js`

#### Utilities
- `src/utils/format.ts`
- `src/utils/statusMapper.ts`
- `src/utils/tr.ts`

#### Scripts
- `apply-migration.js` - تطبيق migration
- `MIGRATION_GUIDE.md` - دليل التطبيق

### ⚠️ ملاحظات مهمة

> [!IMPORTANT]
> **Migration يجب تطبيقه يدوياً**
> 
> بسبب قيود الصلاحيات، يجب تطبيق migration عبر Supabase SQL Editor:
> 1. افتح https://tqskjoufozgyactjnrix.supabase.co
> 2. اذهب إلى SQL Editor
> 3. انسخ محتوى `20260101_auto_create_order_on_payment.sql`
> 4. الصق في SQL Editor واضغط RUN

> [!WARNING]
> **PowerShell Execution Policy**
> 
> إذا واجهت مشكلة في تشغيل npm/npx، استخدم:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

### 🔄 خطوات الترقية

1. **تطبيق Migration على قاعدة البيانات**
   - راجع [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)

2. **لا حاجة لتحديث Dependencies**
   - جميع المكونات الجديدة تستخدم المكتبات الموجودة

3. **التحقق من التطبيق**
   ```sql
   -- في Supabase SQL Editor
   \i supabase/migrations/verify_migration.sql
   ```

4. **تشغيل التطبيق**
   ```bash
   npm run dev
   ```

### 📊 الإحصائيات

- **Migration files جديدة**: 2 ملفات
- **Frontend components جديدة**: 5 مكونات
- **API endpoints جديدة**: 1 ملف
- **Utility files جديدة**: 3 ملفات
- **ملفات معدلة**: 45+ ملف
- **Functions SQL مضافة**: 2 دوال
- **Triggers مضافة**: 2 triggers
- **Indexes مضافة**: 4+ indexes

---

## [2.0.0] - 2024-12-XX

### ✨ ميزات جديدة

#### قاعدة البيانات
- ✅ **إضافة فهارس (Indexes)** لتحسين أداء الاستعلامات
  - فهارس على جميع الجداول الرئيسية
  - فهارس مركبة للاستعلامات المعقدة
  - فهارس جزئية للاستعلامات المشروطة
- ✅ **إضافة دوال SQL و Triggers**
  - دالة `get_user_role()` لجلب role المستخدم
  - دالة `calculate_provider_avg_rate()` لحساب متوسط التقييمات
  - دالة `update_updated_at_column()` لتحديث updated_at تلقائياً
  - Trigger لتحديث avg_rate عند إضافة تقييم
  - Trigger لإنشاء إشعارات عند تغيير حالة الطلب
- ✅ **إضافة Constraints للتحقق من صحة البيانات**
  - التحقق من صحة البريد الإلكتروني
  - التحقق من أن المبالغ إيجابية
  - التحقق من أن التواريخ صحيحة
  - منع القيم الفارغة
- ✅ **إضافة RLS Policies للأمان**
  - Policies للمستخدمين: قراءة وتحديث بياناتهم فقط
  - Policies للأدمن: قراءة جميع البيانات
  - Policies للطلبات والأوامر حسب الدور

#### Frontend
- ✅ **تحسين LoginForm.jsx**
  - إزالة جميع console.log (أكثر من 40 سطر)
  - تبسيط منطق تحديد role المستخدم
  - تقسيم الكود إلى دوال منفصلة قابلة لإعادة الاستخدام
  - تحسين معالجة الأخطاء
- ✅ **إضافة Utilities جديدة**
  - `src/utils/errorHandler.js`: معالجة الأخطاء بشكل موحد
  - `src/utils/validation.js`: دوال التحقق من صحة البيانات
- ✅ **تنظيف الكود**
  - إزالة console.log و console.error من جميع الملفات
  - استبدال console.error بـ toast.error مع رسائل واضحة
  - تحسين معالجة الأخطاء في جميع المكونات

### 🐛 إصلاحات الأخطاء

- ✅ إصلاح dependency array في useEffect في ProvidersTable.jsx
- ✅ إصلاح معالجة الأخطاء في جميع المكونات
- ✅ إصلاح مشكلة تحديد role المستخدم في LoginForm
- ✅ إصلاح مشاكل الاستيراد في PaymentForm.jsx

### 📝 تحسينات

- ✅ تحسين معالجة الأخطاء في جميع المكونات
- ✅ إضافة رسائل خطأ احتياطية بالعربية
- ✅ تحسين الأداء من خلال إضافة فهارس قاعدة البيانات
- ✅ تحسين الأمان من خلال RLS Policies
- ✅ تحسين جودة الكود من خلال إزالة console.log

### 📚 ملفات SQL الجديدة

1. **012_indexes_and_performance.sql**
   - فهارس لجميع الجداول الرئيسية
   - فهارس مركبة للاستعلامات المعقدة

2. **013_functions_and_triggers.sql**
   - دوال SQL مساعدة
   - Triggers تلقائية

3. **014_constraints_and_validations.sql**
   - Constraints للتحقق من صحة البيانات
   - إضافة عمود order_price إذا لم يكن موجوداً

4. **015_rls_policies.sql**
   - Row Level Security Policies
   - Policies للمستخدمين والأدمن

### 🔧 ملفات Frontend الجديدة

1. **src/utils/errorHandler.js**
   - دوال لمعالجة الأخطاء بشكل موحد
   - دوال للتحقق من نوع الخطأ

2. **src/utils/validation.js**
   - دوال للتحقق من صحة البيانات
   - دوال لتنسيق البيانات

### 📋 الملفات المعدلة

#### قاعدة البيانات
- `db/README.md` - تحديث التوثيق

#### Frontend
- `src/components/landing-components/login-components/LoginForm.jsx`
- `src/components/admin-components/providers/ProvidersTable.jsx`
- `src/components/admin-components/faqs/AddQuestion.jsx`
- `src/components/admin-components/faqs/UpdateQuestion.jsx`
- `src/components/admin-components/services/ServicesTable.jsx`
- `src/components/admin-components/services/AddService.jsx`
- `src/components/admin-components/partners/UpsertPartner.jsx`
- `src/components/admin-components/customers/UpsertCustomer.jsx`
- `src/redux/slices/authSlice.js`
- `src/components/Layouts/main-layout/footer/Footer.jsx`
- `src/components/shared/suspend-modal/SuspendModal.jsx`
- `src/components/admin-components/users-details/UserData.jsx`
- `src/components/shared/profile-modal/ProfileModal.jsx`
- `src/components/admin-components/services/UpdatePriceModal.jsx`
- `src/components/request-service-forms/AdminCompleteRequest.jsx`
- `src/components/request-service-forms/AdminAttachmentForm.jsx`
- `src/components/request-service-forms/RequesterAttachmentForm.jsx`
- `src/components/admin-components/projects/ReassignRequest.jsx`
- `src/components/shared/forms-end-project/UploadAdminAttachments.jsx`
- `src/components/landing-components/signup-components/SignupForm.jsx`
- `src/components/landing-components/add-rate/AddRateModal.jsx`
- `src/components/landing-components/profile-components/TicketModal.jsx`
- `src/components/landing-components/request-service/PaymentForm.jsx`
- `src/components/landing-components/request-service/CheckoutForm.jsx`
- `src/components/landing-components/request-service/RequestForm.jsx`

### ⚠️ ملاحظات مهمة

1. **قاعدة البيانات**: تأكد من تنفيذ ملفات SQL بالترتيب الصحيح
2. **RLS Policies**: ملف `015_rls_policies.sql` مخصص لـ Supabase. إذا كنت تستخدم PostgreSQL عادي، قد تحتاج لتعديله
3. **الترجمة**: تأكد من إضافة مفاتيح الترجمة الجديدة في ملفات `locales/ar.json` و `locales/en.json`

### 🔄 خطوات الترقية

1. قم بتنفيذ ملفات SQL الجديدة بالترتيب:
   ```sql
   \i 012_indexes_and_performance.sql
   \i 013_functions_and_triggers.sql
   \i 014_constraints_and_validations.sql
   \i 015_rls_policies.sql
   ```

2. قم بتحديث التبعيات:
   ```bash
   npm install
   ```

3. قم بتشغيل التطبيق:
   ```bash
   npm run dev
   ```

### 📊 الإحصائيات

- **ملفات SQL جديدة**: 4 ملفات
- **ملفات Frontend جديدة**: 2 ملفات
- **ملفات معدلة**: 25+ ملف
- **سطور كود محذوفة**: 100+ سطر (console.log)
- **فهارس مضافة**: 50+ فهرس
- **دوال SQL مضافة**: 6 دوال
- **Triggers مضافة**: 15+ trigger
- **Constraints مضافة**: 20+ constraint
- **RLS Policies مضافة**: 20+ policy

