-- 015_rls_policies.sql
-- Row Level Security (RLS) Policies للأمان
-- ملاحظة: هذا الملف مخصص لـ Supabase. إذا كنت تستخدم PostgreSQL عادي، قد تحتاج لتعديله

-- ============================================
-- تفعيل RLS على الجداول
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachment_groups ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies لجدول users
-- ============================================
-- المستخدمون يمكنهم قراءة بياناتهم الخاصة فقط
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- الأدمن يمكنه قراءة جميع المستخدمين
-- ملاحظة: هذا يتطلب أن يكون auth.uid() موجوداً في admins table
CREATE POLICY "Admins can read all users"
ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid() OR id = auth.uid()
    )
    -- السماح أيضاً بقراءة users المرتبطة بـ requesters/providers/admins للـ joins
    OR EXISTS (
        SELECT 1 FROM requesters WHERE user_id = users.id
    )
    OR EXISTS (
        SELECT 1 FROM providers WHERE user_id = users.id
    )
    OR EXISTS (
        SELECT 1 FROM admins WHERE user_id = users.id
    )
);

-- المستخدمون يمكنهم تحديث بياناتهم الخاصة
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- Policies لجدول requesters
-- ============================================
-- المستخدمون يمكنهم قراءة بياناتهم الخاصة
CREATE POLICY "Requesters can read own data"
ON requesters FOR SELECT
USING (user_id = auth.uid() OR id = auth.uid());

-- الأدمن يمكنه قراءة جميع طالبي الخدمة
CREATE POLICY "Admins can read all requesters"
ON requesters FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid() OR id = auth.uid()
    )
);

-- المستخدمون يمكنهم تحديث بياناتهم الخاصة
CREATE POLICY "Requesters can update own data"
ON requesters FOR UPDATE
USING (user_id = auth.uid() OR id = auth.uid());

-- ============================================
-- Policies لجدول providers
-- ============================================
-- المستخدمون يمكنهم قراءة بياناتهم الخاصة
CREATE POLICY "Providers can read own data"
ON providers FOR SELECT
USING (user_id = auth.uid() OR id = auth.uid());

-- الأدمن يمكنه قراءة جميع مقدمي الخدمة
CREATE POLICY "Admins can read all providers"
ON providers FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid() OR id = auth.uid()
    )
);

-- يمكن للجميع قراءة مقدمي الخدمة النشطين (للعرض العام)
CREATE POLICY "Public can read active providers"
ON providers FOR SELECT
USING (true); -- يمكن تعديل هذا ليشمل شروط إضافية

-- المستخدمون يمكنهم تحديث بياناتهم الخاصة
CREATE POLICY "Providers can update own data"
ON providers FOR UPDATE
USING (user_id = auth.uid() OR id = auth.uid());

-- ============================================
-- Policies لجدول requests
-- ============================================
-- طالب الخدمة يمكنه قراءة طلباته
CREATE POLICY "Requesters can read own requests"
ON requests FOR SELECT
USING (
    requester_id IN (
        SELECT id FROM requesters WHERE user_id = auth.uid() OR id = auth.uid()
    )
);

-- الأدمن يمكنه قراءة جميع الطلبات
CREATE POLICY "Admins can read all requests"
ON requests FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid() OR id = auth.uid()
    )
);

-- مقدمي الخدمة يمكنهم قراءة الطلبات المفتوحة
CREATE POLICY "Providers can read open requests"
ON requests FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM providers 
        WHERE user_id = auth.uid() OR id = auth.uid()
    )
    AND status_id IN (
        SELECT id FROM lookup_values 
        WHERE lookup_type_id IN (
            SELECT id FROM lookup_types WHERE code = 'request-status'
        )
        AND code IN ('pending', 'approved')
    )
);

-- ============================================
-- Policies لجدول orders
-- ============================================
-- طالب الخدمة يمكنه قراءة أوامره
CREATE POLICY "Requesters can read own orders"
ON orders FOR SELECT
USING (
    request_id IN (
        SELECT r.id FROM requests r
        JOIN requesters req ON r.requester_id = req.id
        WHERE req.user_id = auth.uid() OR req.id = auth.uid()
    )
);

-- مزود الخدمة يمكنه قراءة أوامره
CREATE POLICY "Providers can read own orders"
ON orders FOR SELECT
USING (
    provider_id IN (
        SELECT id FROM providers 
        WHERE user_id = auth.uid() OR id = auth.uid()
    )
);

-- الأدمن يمكنه قراءة جميع الأوامر
CREATE POLICY "Admins can read all orders"
ON orders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid() OR id = auth.uid()
    )
);

-- ============================================
-- Policies لجدول notifications
-- ============================================
-- المستخدمون يمكنهم قراءة إشعاراتهم فقط
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- المستخدمون يمكنهم تحديث إشعاراتهم (لتمييزها كمقروءة)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- ============================================
-- Policies لجدول tickets
-- ============================================
-- المستخدمون يمكنهم قراءة تذاكرهم
CREATE POLICY "Users can read own tickets"
ON tickets FOR SELECT
USING (user_id = auth.uid());

-- الأدمن يمكنه قراءة جميع التذاكر
CREATE POLICY "Admins can read all tickets"
ON tickets FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid() OR id = auth.uid()
    )
);

-- المستخدمون يمكنهم إنشاء تذاكر جديدة
CREATE POLICY "Users can create tickets"
ON tickets FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ============================================
-- Policies لجدول order_ratings
-- ============================================
-- يمكن للجميع قراءة التقييمات
CREATE POLICY "Public can read ratings"
ON order_ratings FOR SELECT
USING (true);

-- المستخدمون يمكنهم إنشاء تقييمات
CREATE POLICY "Users can create ratings"
ON order_ratings FOR INSERT
WITH CHECK (rated_by_user_id = auth.uid());

-- ============================================
-- Policies لجدول profile_infos
-- ============================================
-- المستخدمون يمكنهم قراءة وتحديث ملفاتهم الشخصية
CREATE POLICY "Users can manage own profile"
ON profile_infos FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- يمكن للجميع قراءة الملفات الشخصية (للعرض العام)
CREATE POLICY "Public can read profiles"
ON profile_infos FOR SELECT
USING (true);

-- ============================================
-- Policies لجدول attachments
-- ============================================
-- المستخدمون يمكنهم قراءة المرفقات المرتبطة بهم
CREATE POLICY "Users can read own attachments"
ON attachments FOR SELECT
USING (
    group_id IN (
        SELECT id FROM attachment_groups 
        WHERE created_by_user_id = auth.uid()
    )
);

-- الأدمن يمكنه قراءة جميع المرفقات
CREATE POLICY "Admins can read all attachments"
ON attachments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid() OR id = auth.uid()
    )
);

-- ============================================
-- Policies لجدول payments
-- ============================================
-- المستخدمون يمكنهم قراءة مدفوعاتهم
CREATE POLICY "Users can read own payments"
ON payments FOR SELECT
USING (user_id = auth.uid());

-- الأدمن يمكنه قراءة جميع المدفوعات
CREATE POLICY "Admins can read all payments"
ON payments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid() OR id = auth.uid()
    )
);

-- ============================================
-- Policies للجداول العامة (يمكن للجميع قراءتها)
-- ============================================
-- يمكن للجميع قراءة services, cities, lookup_values, faq_questions, partners, customers
CREATE POLICY "Public can read services"
ON services FOR SELECT
USING (true);

CREATE POLICY "Public can read cities"
ON cities FOR SELECT
USING (true);

CREATE POLICY "Public can read lookup_values"
ON lookup_values FOR SELECT
USING (true);

CREATE POLICY "Public can read lookup_types"
ON lookup_types FOR SELECT
USING (true);

CREATE POLICY "Public can read active faqs"
ON faq_questions FOR SELECT
USING (is_active = true);

CREATE POLICY "Public can read active partners"
ON partners FOR SELECT
USING (is_active = true);

CREATE POLICY "Public can read customers"
ON customers FOR SELECT
USING (true);

