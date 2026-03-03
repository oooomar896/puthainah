# وثيقة الهندسة المعمارية
## منصة باكورة أعمال - Bakora Amal Platform

---

## 1. نظرة عامة على الهندسة المعمارية

### 1.1 نوع التطبيق
تطبيق ويب أحادي الصفحة (Single Page Application - SPA) مبني باستخدام React و Vite.

### 1.2 نمط الهندسة المعمارية
**Frontend Architecture Pattern:** Component-Based Architecture مع State Management

---

## 2. البنية التقنية (Technology Stack)

### 2.1 التقنيات الأساسية
- **Framework:** React 19.1.0
- **Build Tool:** Vite 6.3.5
- **Routing:** React Router DOM 7.6.0
- **State Management:** Redux Toolkit 2.8.2
- **Styling:** Tailwind CSS 3.4.17
- **Internationalization:** i18next 25.3.2
- **Form Management:** Formik 2.4.6 + Yup 1.6.1
- **HTTP Client:** Axios 1.9.0
- **Authentication:** JWT (jwt-decode 4.0.0)

### 2.2 المكتبات المساعدة
- **UI Components:** Headless UI, Lucide React
- **Data Tables:** React Data Table Component
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast
- **Date Handling:** Day.js
- **Payment:** Stripe JS

---

## 3. هيكل المشروع (Project Structure)

```
Bakora-Amal-Front-end/
├── public/                 # الملفات الثابتة
│   ├── _redirects        # إعدادات Netlify
│   └── assets/           # الصور والفيديو
├── src/
│   ├── assets/           # الموارد (أيقونات، صور، فيديو)
│   ├── components/       # المكونات القابلة لإعادة الاستخدام
│   │   ├── admin-components/    # مكونات خاصة بالمدير
│   │   ├── landing-components/  # مكونات الصفحة الرئيسية
│   │   ├── provider-components/ # مكونات خاصة بمقدم الخدمة
│   │   ├── Layouts/             # تخطيطات الصفحات
│   │   ├── shared/              # مكونات مشتركة
│   │   └── authGuard.jsx        # حماية المسارات
│   ├── context/          # React Context
│   │   └── LanguageContext.jsx
│   ├── locales/         # ملفات الترجمة
│   │   ├── ar.json      # العربية
│   │   └── en.json      # الإنجليزية
│   ├── pages/           # صفحات التطبيق
│   │   ├── admin/       # صفحات المدير
│   │   ├── landing/     # صفحات عامة
│   │   └── provider/    # صفحات مقدم الخدمة
│   ├── redux/           # إدارة الحالة
│   │   ├── api/         # API endpoints
│   │   ├── slices/      # Redux slices
│   │   └── store.js     # إعدادات Redux store
│   ├── types/           # تعريفات الأنواع (JSDoc)
│   ├── App.jsx          # المكون الرئيسي
│   ├── main.jsx         # نقطة الدخول
│   └── i18n.js          # إعدادات الترجمة
├── docs/                # التوثيق
├── netlify.toml         # إعدادات Netlify
├── package.json         # التبعيات
└── vite.config.js       # إعدادات Vite
```

---

## 4. طبقات التطبيق (Application Layers)

### 4.1 طبقة العرض (Presentation Layer)

#### 4.1.1 المكونات (Components)
- **Layout Components:** تخطيطات الصفحات (MainLayout, AdminLayout, DashboardLayout)
- **Page Components:** صفحات كاملة (Home, Profile, Projects)
- **Feature Components:** مكونات الوظائف (Forms, Tables, Modals)
- **Shared Components:** مكونات مشتركة (Buttons, Cards, Inputs)

#### 4.1.2 التوجيه (Routing)
```javascript
// هيكل التوجيه
/                    → Landing Home (Requester)
/login               → Login Page
/signup              → Signup Page
/request-service     → Create Request (Requester)
/requests            → Explore Requests (Requester)
/projects            → Projects List (Requester)
/profile             → User Profile

/provider            → Provider Dashboard
/provider/active-orders → Active Orders
/provider/our-projects  → Provider Projects
/provider/our-rates     → Provider Ratings

/admin               → Admin Dashboard
/admin/providers      → Manage Providers
/admin/requesters     → Manage Requesters
/admin/requests       → Manage Requests
/admin/projects       → Manage Projects
/admin/services       → Manage Services
/admin/tickets        → Manage Tickets
```

### 4.2 طبقة إدارة الحالة (State Management Layer)

#### 4.2.1 Redux Store Structure
```javascript
{
  auth: {
    token: string | null,
    refreshToken: string | null,
    role: 'Admin' | 'Provider' | 'Requester' | null,
    userId: string | null
  },
  // API slices managed by RTK Query
  api: {
    // Cached API responses
  }
}
```

#### 4.2.2 API Slices (RTK Query)
- `authApi.js` - التوثيق
  - تسجيل الدخول
  - تسجيل مقدم خدمة
  - تسجيل طالب خدمة
  - تحديث التوكن
  - الحصول على الملف الشخصي
  - حظر المستخدمين
- `ordersApi.js` - إدارة الطلبات
  - إنشاء طلب
  - إنشاء طلب بسعر
  - الحصول على الطلبات
  - الحصول على طلبات المستخدم
  - تفاصيل الطلب
  - تسعير الطلب (للمدير)
  - إجراءات طالب الخدمة
  - إعادة تعيين الطلب
  - إتمام الطلب (للمدير)
- `projectsApi.js` - إدارة المشاريع
  - الحصول على المشاريع
  - الحصول على مشاريع مقدم الخدمة
  - تفاصيل المشروع
  - إحصائيات المشاريع
  - تحديث حالة المشروع
  - إضافة مرفقات المشروع
  - إتمام المشروع
- `providersApi.js` - إدارة مقدمي الخدمات
  - الحصول على مقدمي الخدمات
  - تفاصيل مقدم الخدمة
  - تفعيل/تعطيل/حظر مقدم الخدمة
- `requestersApi.js` - إدارة طالبي الخدمات
  - الحصول على طالبي الخدمات
  - تفاصيل طالب الخدمة
  - تفعيل/تعطيل/حظر طالب الخدمة
- `servicesApi.js` - إدارة الخدمات
  - الحصول على الخدمات
  - إنشاء خدمة
  - تحديث خدمة
  - تحديث سعر الخدمة
  - تفعيل/تعطيل خدمة
- `ticketApi.js` - إدارة التذاكر
  - إنشاء تذكرة
  - الحصول على التذاكر
  - تفاصيل التذكرة
  - تحديث حالة التذكرة
- `ratingsApi.js` - إدارة التقييمات
  - إنشاء تقييم
  - الحصول على التقييمات
  - تقييمات المستخدم
- `faqsApi.js` - إدارة الأسئلة الشائعة
  - الحصول على الأسئلة
  - إنشاء سؤال
  - تحديث سؤال
  - حذف سؤال
- `partnersApi.js` - إدارة الشركاء
  - الحصول على الشركاء
  - إنشاء شريك
  - تحديث شريك
  - حذف شريك
- `customersApi.js` - إدارة العملاء
  - الحصول على العملاء
  - إنشاء عميل
  - تحديث عميل
  - حذف عميل
- `notificationsApi.js` - الإشعارات
  - الحصول على الإشعارات
  - تحديث حالة الإشعار
  - حذف الإشعار
- `adminStatisticsApi.js` - إحصائيات المدير
  - إحصائيات عامة
  - إحصائيات المستخدمين
  - إحصائيات الطلبات
  - إحصائيات المشاريع
- `citiesApi.js` - إدارة المدن
  - الحصول على المدن
- `typeApi.js` - أنواع الكيانات
  - أنواع طالبي الخدمات
  - أنواع مقدمي الخدمات
- `profileInfoApi.js` - معلومات الملف الشخصي
  - تحديث الملف الشخصي
- `updateApi.js` - التحديثات
  - تحديثات عامة
- `paymentApi.js` - الدفع
  - معالجة الدفع
  - تتبع حالة الدفع

### 4.3 طبقة الخدمات (Services Layer)

#### 4.3.1 API Client
- **Base URL:** يتم تعريفه في متغيرات البيئة
- **Interceptors:** 
  - إضافة JWT token تلقائياً
  - معالجة الأخطاء
  - تحديث Token تلقائياً

#### 4.3.2 Authentication Flow
```
1. User Login → API Call
2. Receive JWT Token + Refresh Token
3. Store in Redux + localStorage
4. Add Token to all subsequent requests
5. Token Refresh when expired
6. Logout → Clear tokens
```

### 4.4 طبقة البيانات (Data Layer)

#### 4.4.1 Data Models
```typescript
// User Roles
type UserRole = 'Admin' | 'Provider' | 'Requester'

// Request Status
type RequestStatus = 
  | 'Pending' 
  | 'Approved' 
  | 'Rejected' 
  | 'InProgress' 
  | 'Completed' 
  | 'Cancelled'

// Project Status
type ProjectStatus =
  | 'WaitingApproval'
  | 'WaitingStart'
  | 'Processing'
  | 'Completed'
  | 'Ended'
  | 'Rejected'
  | 'Expired'

// Ticket Status
type TicketStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed'
```

---

## 5. الأمان (Security)

### 5.1 Authentication & Authorization
- **JWT Tokens:** للتوثيق
- **Role-Based Access Control (RBAC):** حماية المسارات حسب الدور
- **AuthGuard Component:** حماية المسارات المطلوب تسجيل الدخول
- **GuestGuard Component:** منع المستخدمين المسجلين من الوصول لصفحات الضيوف

### 5.2 Token Management
- **Access Token:** للطلبات العادية (مدة صلاحية محدودة)
- **Refresh Token:** لتحديث Access Token
- **Token Storage:** localStorage (يمكن تحسينه لاستخدام httpOnly cookies)
- **Auto Refresh:** تحديث تلقائي عند انتهاء الصلاحية

### 5.3 Input Validation
- **Client-Side:** Formik + Yup
- **Server-Side:** يجب التحقق على الخادم أيضاً

---

## 6. الأداء (Performance)

### 6.1 Code Splitting
- **Lazy Loading:** تحميل الصفحات عند الحاجة
- **Suspense:** عرض حالة التحميل
- **Dynamic Imports:** استيراد ديناميكي للمكونات

### 6.2 Caching
- **RTK Query Caching:** تخزين مؤقت تلقائي لاستجابات API
- **Browser Caching:** تخزين الملفات الثابتة

### 6.3 Optimization
- **Image Optimization:** تحسين الصور
- **Bundle Size:** تقليل حجم الحزمة
- **Tree Shaking:** إزالة الكود غير المستخدم

---

## 7. الترجمة (Internationalization)

### 7.1 i18n Setup
- **Library:** i18next + react-i18next
- **Languages:** العربية (ar) والإنجليزية (en)
- **RTL Support:** دعم الاتجاه من اليمين لليسار

### 7.2 Translation Files
- `locales/ar.json` - الترجمات العربية
- `locales/en.json` - الترجمات الإنجليزية

### 7.3 Language Context
- **LanguageContext:** إدارة اللغة المختارة
- **Persistence:** حفظ اللغة في localStorage
- **Auto RTL:** تغيير اتجاه الصفحة تلقائياً

---

## 8. النشر (Deployment)

### 8.1 Build Process
```bash
npm run build  # بناء المشروع
# Output: dist/ directory
```

### 8.2 Deployment Platform
- **Platform:** Netlify
- **Configuration:** `netlify.toml`
- **Redirects:** `public/_redirects` للـ SPA routing

### 8.3 Environment Variables
- **API Base URL:** `VITE_API_BASE_URL`
- **Other Secrets:** عبر Netlify Dashboard

---

## 9. التطوير (Development)

### 9.1 Development Server
```bash
npm run dev  # Vite dev server
# or
netlify dev  # Netlify dev with functions support
```

### 9.2 Code Quality
- **ESLint:** فحص جودة الكود
- **Prettier:** تنسيق الكود (مستقبلي)

### 9.3 Testing
- **Unit Tests:** (مستقبلي)
- **Integration Tests:** (مستقبلي)
- **E2E Tests:** (مستقبلي)

---

## 10. التكاملات (Integrations)

### 10.1 Payment Integration
- **Stripe:** للدفع الإلكتروني
- **Components:** `@stripe/react-stripe-js`

### 10.2 File Upload
- **API Endpoint:** رفع الملفات عبر API
- **Supported Types:** PDF, Images, Documents
- **Max File Size:** يتم تحديده في Backend
- **Storage:** يتم تخزين الملفات على الخادم

### 10.3 Payment Integration
- **Stripe:** للدفع الإلكتروني
- **Components:** `@stripe/react-stripe-js`
- **API:** `paymentApi.js` - معالجة المدفوعات
- **Features:**
  - معالجة الدفع
  - تتبع حالة الدفع
  - إشعارات حالة الدفع

---

## 11. التوسع المستقبلي (Future Scalability)

### 11.1 Improvements
- [ ] استخدام Service Workers للـ PWA
- [ ] تحسين إدارة الحالة مع Context API
- [ ] إضافة Error Boundary
- [ ] تحسين SEO
- [ ] إضافة Analytics

### 11.2 Architecture Enhancements
- [ ] Micro-frontends (إذا لزم الأمر)
- [ ] Server-Side Rendering (SSR) مع Next.js
- [ ] GraphQL API (بدلاً من REST)

---

## 12. المخططات (Diagrams)

### 12.1 Component Hierarchy
```
App
├── RouterProvider
│   ├── MainLayout (Requester)
│   │   ├── Header
│   │   ├── Navigation
│   │   └── Pages
│   ├── DashboardLayout (Provider)
│   │   ├── Sidebar
│   │   ├── Header
│   │   └── Pages
│   └── AdminLayout (Admin)
│       ├── Sidebar
│       ├── Header
│       └── Pages
└── TokenRefresher
```

### 12.2 Data Flow
```
User Action
  ↓
Component
  ↓
Redux Action/RTK Query Hook
  ↓
API Call
  ↓
Backend
  ↓
Response
  ↓
Redux Store Update
  ↓
Component Re-render
```

---

**تاريخ الإنشاء:** 2024  
**آخر تحديث:** 2024  
**الإصدار:** 1.0

