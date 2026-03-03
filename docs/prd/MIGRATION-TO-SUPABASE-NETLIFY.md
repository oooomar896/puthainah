# وثيقة التحويل إلى Supabase و Netlify و Next.js
## منصة باكورة أعمال - Bakora Amal Platform Migration Guide

---

## 1. نظرة عامة على التحويل

### 1.1 الهدف
تحويل المشروع الحالي من:
- **Frontend:** React + Vite → **Next.js 14+ (App Router)**
- **Backend:** REST API تقليدي → **Supabase (PostgreSQL + Auth + Storage + Edge Functions)**
- **Deployment:** Netlify (حالي) → **Netlify (محسّن لـ Next.js)**

### 1.2 الفوائد المتوقعة
- ✅ **أداء أفضل:** Server-Side Rendering (SSR) و Static Site Generation (SSG)
- ✅ **SEO محسّن:** تحسين محركات البحث
- ✅ **أمان أفضل:** Supabase Auth مع Row Level Security (RLS)
- ✅ **تكلفة أقل:** لا حاجة لخادم Backend منفصل
- ✅ **قابلية التوسع:** Supabase يدعم التوسع التلقائي
- ✅ **تطوير أسرع:** APIs جاهزة (Auth, Database, Storage)

### 1.3 التحديات المتوقعة
- ⚠️ إعادة هيكلة الكود من React إلى Next.js
- ⚠️ نقل البيانات من قاعدة البيانات الحالية
- ⚠️ تحديث جميع API calls
- ⚠️ إعادة كتابة منطق التوثيق
- ⚠️ تحديث جميع المكونات للعمل مع Next.js

---

## 2. البنية الحالية vs البنية الجديدة

### 2.1 البنية الحالية

```
Current Stack:
├── Frontend: React 19 + Vite
├── State Management: Redux Toolkit + RTK Query
├── Routing: React Router DOM
├── Backend: REST API (External Server)
├── Auth: JWT Tokens (Custom)
├── Database: Unknown (External)
├── Storage: External Server
└── Deployment: Netlify (Static)
```

**ملفات API الحالية:**
- `src/redux/api/authApi.js`
- `src/redux/api/ordersApi.js`
- `src/redux/api/projectsApi.js`
- `src/redux/api/providersApi.js`
- `src/redux/api/requestersApi.js`
- `src/redux/api/servicesApi.js`
- `src/redux/api/ticketApi.js`
- `src/redux/api/ratingsApi.js`
- `src/redux/api/faqsApi.js`
- `src/redux/api/partnersApi.js`
- `src/redux/api/customersApi.js`
- `src/redux/api/notificationsApi.js`
- `src/redux/api/adminStatisticsApi.js`
- وغيرها...

### 2.2 البنية الجديدة

```
New Stack:
├── Frontend: Next.js 14+ (App Router)
├── State Management: React Context + Server Components
├── Routing: Next.js File-based Routing
├── Backend: Supabase (PostgreSQL + Auth + Storage)
├── Auth: Supabase Auth (Built-in)
├── Database: Supabase PostgreSQL
├── Storage: Supabase Storage
├── Edge Functions: Supabase Edge Functions (للعمليات المعقدة)
└── Deployment: Netlify (Next.js Optimized)
```

---

## 3. خطة التحويل خطوة بخطوة

### المرحلة 1: إعداد Supabase (أسبوع 1)

#### 3.1.1 إنشاء مشروع Supabase
1. إنشاء حساب على [supabase.com](https://supabase.com)
2. إنشاء مشروع جديد
3. حفظ:
   - Project URL
   - Anon Key
   - Service Role Key

#### 3.1.2 تصميم قاعدة البيانات
راجع [supabase-schema.sql](./supabase-schema.sql) لتصميم قاعدة البيانات الكامل.

**الجداول الرئيسية:**
- `users` (موسع من auth.users)
- `profiles` (معلومات المستخدمين)
- `services` (الخدمات)
- `requests` (الطلبات)
- `projects` (المشاريع)
- `ratings` (التقييمات)
- `tickets` (التذاكر)
- `faqs` (الأسئلة الشائعة)
- `partners` (الشركاء)
- `customers` (العملاء)
- `notifications` (الإشعارات)
- `attachments` (المرفقات)

#### 3.1.3 إعداد Row Level Security (RLS)
- سياسات الأمان لكل جدول
- صلاحيات حسب الدور (Admin, Provider, Requester)

### المرحلة 2: إعداد Next.js (أسبوع 1-2)

#### 3.2.1 إنشاء مشروع Next.js جديد
```bash
npx create-next-app@latest bakora-amal-nextjs --typescript --tailwind --app
cd bakora-amal-nextjs
```

#### 3.2.2 تثبيت التبعيات
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @supabase/auth-helpers-nextjs
npm install @reduxjs/toolkit react-redux (اختياري - للـ client state)
npm install formik yup
npm install react-hot-toast
npm install dayjs
npm install i18next react-i18next
npm install framer-motion
npm install recharts
npm install react-data-table-component
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### 3.2.3 هيكل المشروع الجديد
```
bakora-amal-nextjs/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (admin)/
│   │   └── admin/
│   ├── (provider)/
│   │   └── provider/
│   ├── (requester)/
│   │   └── [الصفحات الرئيسية]
│   ├── api/              # API Routes (إن لزم)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── admin/
│   ├── provider/
│   ├── requester/
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils/
├── hooks/
├── types/
├── locales/
└── public/
```

### المرحلة 3: تحويل التوثيق (أسبوع 2)

#### 3.3.1 إعداد Supabase Client
**`lib/supabase/client.ts`**
```typescript
import { createClientComponentClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export const createClient = () => {
  return createClientComponentClient<Database>()
}
```

**`lib/supabase/server.ts`**
```typescript
import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}
```

**`lib/supabase/middleware.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient({
    request,
    response: supabaseResponse,
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // حماية المسارات حسب الدور
  if (request.nextUrl.pathname.startsWith('/admin') && user?.user_metadata?.role !== 'Admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/provider') && user?.user_metadata?.role !== 'Provider') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
```

#### 3.3.2 تحديث Auth Logic
**من:**
```javascript
// Redux + RTK Query
const { data } = useLoginMutation()
dispatch(setCredentials({ token, role, userId }))
```

**إلى:**
```typescript
// Next.js + Supabase
'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

### المرحلة 4: تحويل API Calls (أسبوع 2-3)

#### 3.4.1 تحويل Orders API
**من:**
```javascript
// src/redux/api/ordersApi.js
createOrder: builder.mutation({
  query: (body) => ({
    url: "api/requests",
    method: "POST",
    body,
  }),
})
```

**إلى:**
```typescript
// app/actions/orders.ts
'use server'
import { createServerClient } from '@/lib/supabase/server'

export async function createOrder(orderData: OrderData) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')
  
  const { data, error } = await supabase
    .from('requests')
    .insert({
      ...orderData,
      requester_id: user.id,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

#### 3.4.2 تحويل Projects API
**من:**
```javascript
getProjects: builder.query({
  query: ({ PageNumber, PageSize, OrderTitle, OrderStatusLookupId }) => ({
    url: "api/orders",
    method: "GET",
    params: { PageNumber, PageSize, OrderTitle, OrderStatusLookupId },
  }),
})
```

**إلى:**
```typescript
// app/actions/projects.ts
'use server'
import { createServerClient } from '@/lib/supabase/server'

export async function getProjects(filters: ProjectFilters) {
  const supabase = createServerClient()
  
  let query = supabase
    .from('projects')
    .select('*, requester:profiles!projects_requester_id_fkey(*), provider:profiles!projects_provider_id_fkey(*)')
  
  if (filters.OrderTitle) {
    query = query.ilike('title', `%${filters.OrderTitle}%`)
  }
  
  if (filters.OrderStatusLookupId) {
    query = query.eq('status', filters.OrderStatusLookupId)
  }
  
  const { from, to } = getPaginationRange(filters.PageNumber, filters.PageSize)
  query = query.range(from, to)
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}
```

### المرحلة 5: تحويل المكونات (أسبوع 3-4)

#### 3.5.1 تحويل الصفحات إلى Server Components
**من:**
```javascript
// pages/landing/home/Home.jsx
import { useEffect } from 'react'
import { useGetOrdersQuery } from '@/redux/api/ordersApi'

export default function Home() {
  const { data, isLoading } = useGetOrdersQuery()
  // ...
}
```

**إلى:**
```typescript
// app/page.tsx
import { getOrders } from '@/app/actions/orders'

export default async function Home() {
  const orders = await getOrders({ PageNumber: 1, PageSize: 10 })
  
  return (
    <div>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
```

#### 3.5.2 تحويل Client Components
**من:**
```javascript
// components/LoginForm.jsx
import { useLoginMutation } from '@/redux/api/authApi'

export default function LoginForm() {
  const [login, { isLoading }] = useLoginMutation()
  // ...
}
```

**إلى:**
```typescript
// components/LoginForm.tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (data) router.push('/')
  }
  // ...
}
```

### المرحلة 6: إعداد Storage (أسبوع 4)

#### 3.6.1 إعداد Supabase Storage Buckets
```sql
-- إنشاء buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('attachments', 'attachments', true),
('avatars', 'avatars', true),
('documents', 'documents', false);
```

#### 3.6.2 تحويل رفع الملفات
**من:**
```javascript
// رفع إلى Backend API
const formData = new FormData()
formData.append('file', file)
await fetch('api/upload', { method: 'POST', body: formData })
```

**إلى:**
```typescript
// رفع إلى Supabase Storage
'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.storage
  .from('attachments')
  .upload(`${userId}/${file.name}`, file)

const { data: { publicUrl } } = supabase.storage
  .from('attachments')
  .getPublicUrl(`${userId}/${file.name}`)
```

### المرحلة 7: إعداد Netlify (أسبوع 4)

#### 3.7.1 تحديث netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3.7.2 إعداد Environment Variables
في Netlify Dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### المرحلة 8: نقل البيانات (أسبوع 5)

#### 3.8.1 تصدير البيانات من قاعدة البيانات الحالية
```bash
# مثال: تصدير من PostgreSQL
pg_dump -h host -U user -d database > backup.sql
```

#### 3.8.2 تحويل البيانات إلى تنسيق Supabase
- تحويل الجداول
- تحويل العلاقات
- تحويل البيانات
- التحقق من النزاهة

#### 3.8.3 استيراد البيانات إلى Supabase
```bash
# استخدام Supabase SQL Editor أو CLI
supabase db push
```

---

## 4. تصميم قاعدة البيانات في Supabase

### 4.1 الجداول الرئيسية

#### 4.1.1 جدول Profiles
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  phone_number TEXT,
  role TEXT CHECK (role IN ('Admin', 'Provider', 'Requester')),
  entity_type TEXT,
  city_id UUID REFERENCES cities(id),
  commercial_register TEXT,
  avatar_url TEXT,
  is_blocked BOOLEAN DEFAULT false,
  is_suspended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.2 جدول Requests
```sql
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'under_processing', 'initial_approval', 'awaiting_payment', 'rejected', 'completed')) DEFAULT 'pending',
  price DECIMAL(10, 2),
  provider_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.3 جدول Projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('waiting_approval', 'waiting_start', 'processing', 'completed', 'ended', 'rejected', 'expired')) DEFAULT 'waiting_approval',
  price DECIMAL(10, 2) NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Row Level Security (RLS) Policies

#### 4.2.1 Policies للـ Profiles
```sql
-- المستخدمون يمكنهم قراءة ملفاتهم فقط
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- المديرون يمكنهم قراءة جميع الملفات
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- المستخدمون يمكنهم تحديث ملفاتهم فقط
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### 4.2.2 Policies للـ Requests
```sql
-- طالب الخدمة يمكنه قراءة طلباته
CREATE POLICY "Requesters can view own requests"
  ON requests FOR SELECT
  USING (
    requester_id = auth.uid() OR
    provider_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- طالب الخدمة يمكنه إنشاء طلبات
CREATE POLICY "Requesters can create requests"
  ON requests FOR INSERT
  WITH CHECK (
    requester_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Requester'
    )
  );
```

---

## 5. تحديثات الكود المطلوبة

### 5.1 تحديثات التوثيق

#### 5.1.1 Auth Slice → Supabase Auth
**إزالة:**
```javascript
// src/redux/slices/authSlice.js
```

**استبدال بـ:**
```typescript
// hooks/useAuth.ts
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, loading }
}
```

### 5.2 تحديثات API Calls

#### 5.2.1 تحويل RTK Query إلى Server Actions
**نمط عام:**
```typescript
// app/actions/[resource].ts
'use server'
import { createServerClient } from '@/lib/supabase/server'

export async function get[Resource](filters: Filters) {
  const supabase = createServerClient()
  // ... logic
}

export async function create[Resource](data: Data) {
  const supabase = createServerClient()
  // ... logic
}

export async function update[Resource](id: string, data: Partial<Data>) {
  const supabase = createServerClient()
  // ... logic
}

export async function delete[Resource](id: string) {
  const supabase = createServerClient()
  // ... logic
}
```

### 5.3 تحديثات Routing

#### 5.3.1 تحويل React Router إلى Next.js Routing
**من:**
```javascript
// App.jsx
<Route path="/admin/providers" element={<Providers />} />
```

**إلى:**
```typescript
// app/admin/providers/page.tsx
export default function ProvidersPage() {
  return <Providers />
}
```

#### 5.3.2 Middleware للـ Route Protection
```typescript
// middleware.ts
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 6. نقل البيانات

### 6.1 خطة نقل البيانات

#### 6.1.1 مرحلة التحليل
1. تحليل قاعدة البيانات الحالية
2. تحديد الجداول والعلاقات
3. تحديد البيانات المطلوب نقلها

#### 6.1.2 مرحلة التحويل
1. إنشاء سكريبتات تحويل البيانات
2. تحويل التنسيقات
3. التحقق من النزاهة

#### 6.1.3 مرحلة الاستيراد
1. استيراد البيانات إلى Supabase
2. التحقق من البيانات المستوردة
3. اختبار الوظائف

### 6.2 سكريبتات التحويل

#### 6.2.1 مثال: تحويل المستخدمين
```typescript
// scripts/migrate-users.ts
import { createClient } from '@supabase/supabase-js'

const oldDb = createClient(OLD_DB_URL, OLD_DB_KEY)
const newDb = createClient(NEW_DB_URL, NEW_DB_KEY)

async function migrateUsers() {
  // جلب المستخدمين من قاعدة البيانات القديمة
  const { data: oldUsers } = await oldDb.from('users').select('*')
  
  for (const user of oldUsers) {
    // إنشاء حساب في Supabase Auth
    const { data: authData, error: authError } = await newDb.auth.admin.createUser({
      email: user.email,
      password: user.password_hash, // إذا كان متاحاً
      email_confirm: true,
      user_metadata: {
        role: user.role,
      }
    })
    
    if (authError) {
      console.error(`Error creating user ${user.email}:`, authError)
      continue
    }
    
    // إنشاء profile
    const { error: profileError } = await newDb
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        // ... باقي الحقول
      })
    
    if (profileError) {
      console.error(`Error creating profile for ${user.email}:`, profileError)
    }
  }
}
```

---

## 7. خطة النشر والاختبار

### 7.1 مراحل الاختبار

#### 7.1.1 اختبار محلي
```bash
# تشغيل Supabase محلياً
supabase start

# تشغيل Next.js
npm run dev

# اختبار الوظائف الأساسية
```

#### 7.1.2 اختبار Staging
1. نشر على Netlify (Branch Deploy)
2. اختبار شامل للوظائف
3. اختبار الأداء
4. اختبار الأمان

#### 7.1.3 اختبار Production
1. نشر على Production
2. مراقبة الأخطاء
3. مراقبة الأداء
4. جمع ملاحظات المستخدمين

### 7.2 خطة النشر

#### 7.2.1 قبل النشر
- [ ] اختبار جميع الوظائف
- [ ] التحقق من الأمان
- [ ] التحقق من الأداء
- [ ] نسخ احتياطي للبيانات
- [ ] إعداد Monitoring

#### 7.2.2 أثناء النشر
1. نشر على Staging أولاً
2. اختبار شامل
3. نشر على Production
4. مراقبة مباشرة

#### 7.2.3 بعد النشر
1. مراقبة الأخطاء
2. جمع ملاحظات المستخدمين
3. إصلاح المشاكل الطارئة
4. تحسينات مستمرة

---

## 8. قائمة التحقق (Checklist)

### 8.1 الإعداد
- [ ] إنشاء مشروع Supabase
- [ ] تصميم قاعدة البيانات
- [ ] إعداد RLS Policies
- [ ] إنشاء مشروع Next.js
- [ ] تثبيت التبعيات

### 8.2 التحويل
- [ ] تحويل Auth Logic
- [ ] تحويل API Calls
- [ ] تحويل المكونات
- [ ] تحويل Routing
- [ ] إعداد Storage

### 8.3 البيانات
- [ ] تصدير البيانات القديمة
- [ ] تحويل البيانات
- [ ] استيراد البيانات
- [ ] التحقق من النزاهة

### 8.4 النشر
- [ ] إعداد Netlify
- [ ] إعداد Environment Variables
- [ ] اختبار محلي
- [ ] اختبار Staging
- [ ] نشر Production

### 8.5 ما بعد النشر
- [ ] مراقبة الأخطاء
- [ ] جمع الملاحظات
- [ ] التحسينات

---

## 9. الموارد والأدوات

### 9.1 الوثائق
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

### 9.2 الأدوات
- Supabase CLI
- Next.js CLI
- Netlify CLI
- Database Migration Tools

### 9.3 أمثلة الكود
- [Supabase Next.js Examples](https://github.com/supabase/supabase/tree/master/examples)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)

---

## 10. الدعم والمساعدة

### 10.1 المشاكل الشائعة
- مشاكل التوثيق
- مشاكل RLS Policies
- مشاكل النشر
- مشاكل الأداء

### 10.2 الحلول
- مراجعة الوثائق
- فحص Logs
- التواصل مع الدعم

---

**تاريخ الإنشاء:** 2024  
**آخر تحديث:** 2024  
**الإصدار:** 1.0

---

## ملاحظات إضافية

### 11. Edge Cases

#### 11.1 معالجة الأخطاء
- معالجة أخطاء Supabase
- معالجة أخطاء Network
- معالجة أخطاء Authentication

#### 11.2 التحسينات المستقبلية
- استخدام Edge Functions للعمليات المعقدة
- استخدام Realtime للـ Live Updates
- استخدام Full-Text Search
- استخدام Analytics

---

**ملاحظة:** هذه الوثيقة قابلة للتحديث بناءً على التقدم في التحويل والمشاكل التي قد تظهر.

