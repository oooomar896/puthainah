-- 016_simplify_admin_rls.sql
-- تبسيط سياسات RLS للأدمن للتحقق من role مباشرة من جدول users
-- هذا يحل مشكلة 500 errors ويجعل الوصول أسرع وأبسط

-- ============================================
-- دالة مساعدة للتحقق من أن المستخدم أدمن
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'Admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- حذف السياسات القديمة للأدمن
-- ============================================
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can read all requesters" ON requesters;
DROP POLICY IF EXISTS "Admins can read all providers" ON providers;
DROP POLICY IF EXISTS "Admins can read all requests" ON requests;
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Admins can read all tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can read all attachments" ON attachments;
DROP POLICY IF EXISTS "Admins can read all payments" ON payments;

-- ============================================
-- إضافة سياسات جديدة مبسطة للأدمن
-- ============================================

-- جدول users
CREATE POLICY "Admins can read all users"
ON users FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all users"
ON users FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete users"
ON users FOR DELETE
USING (is_admin());

-- جدول requesters
CREATE POLICY "Admins can read all requesters"
ON requesters FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all requesters"
ON requesters FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete requesters"
ON requesters FOR DELETE
USING (is_admin());

CREATE POLICY "Admins can insert requesters"
ON requesters FOR INSERT
WITH CHECK (is_admin());

-- جدول providers
CREATE POLICY "Admins can read all providers"
ON providers FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all providers"
ON providers FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete providers"
ON providers FOR DELETE
USING (is_admin());

CREATE POLICY "Admins can insert providers"
ON providers FOR INSERT
WITH CHECK (is_admin());

-- جدول requests
CREATE POLICY "Admins can read all requests"
ON requests FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all requests"
ON requests FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete requests"
ON requests FOR DELETE
USING (is_admin());

CREATE POLICY "Admins can insert requests"
ON requests FOR INSERT
WITH CHECK (is_admin());

-- جدول orders
CREATE POLICY "Admins can read all orders"
ON orders FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete orders"
ON orders FOR DELETE
USING (is_admin());

CREATE POLICY "Admins can insert orders"
ON orders FOR INSERT
WITH CHECK (is_admin());

-- جدول tickets
CREATE POLICY "Admins can read all tickets"
ON tickets FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all tickets"
ON tickets FOR UPDATE
USING (is_admin());

-- جدول attachments
CREATE POLICY "Admins can read all attachments"
ON attachments FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all attachments"
ON attachments FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete attachments"
ON attachments FOR DELETE
USING (is_admin());

-- جدول payments
CREATE POLICY "Admins can read all payments"
ON payments FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all payments"
ON payments FOR UPDATE
USING (is_admin());

-- جدول order_ratings
CREATE POLICY "Admins can read all ratings"
ON order_ratings FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all ratings"
ON order_ratings FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete ratings"
ON order_ratings FOR DELETE
USING (is_admin());

-- جدول notifications
CREATE POLICY "Admins can read all notifications"
ON notifications FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all notifications"
ON notifications FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete notifications"
ON notifications FOR DELETE
USING (is_admin());

-- جدول profile_infos
CREATE POLICY "Admins can update all profiles"
ON profile_infos FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete profiles"
ON profile_infos FOR DELETE
USING (is_admin());

-- جدول admins
CREATE POLICY "Admins can read all admins"
ON admins FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all admins"
ON admins FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can insert admins"
ON admins FOR INSERT
WITH CHECK (is_admin());

-- جدول services (للأدمن فقط - القراءة متاحة للجميع بالفعل)
CREATE POLICY "Admins can update services"
ON services FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete services"
ON services FOR DELETE
USING (is_admin());

CREATE POLICY "Admins can insert services"
ON services FOR INSERT
WITH CHECK (is_admin());

-- جدول faq_questions
CREATE POLICY "Admins can update all faqs"
ON faq_questions FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete faqs"
ON faq_questions FOR DELETE
USING (is_admin());

CREATE POLICY "Admins can insert faqs"
ON faq_questions FOR INSERT
WITH CHECK (is_admin());

-- جدول partners
CREATE POLICY "Admins can update all partners"
ON partners FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete partners"
ON partners FOR DELETE
USING (is_admin());

CREATE POLICY "Admins can insert partners"
ON partners FOR INSERT
WITH CHECK (is_admin());

-- جدول customers
CREATE POLICY "Admins can update all customers"
ON customers FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete customers"
ON customers FOR DELETE
USING (is_admin());

CREATE POLICY "Admins can insert customers"
ON customers FOR INSERT
WITH CHECK (is_admin());

-- ============================================
-- إصلاح دالة get_user_role وجعلها متاحة كـ RPC
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS VARCHAR(50) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role VARCHAR(50);
BEGIN
    -- جلب role من جدول users مباشرة
    SELECT role INTO user_role
    FROM users
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'Requester');
END;
$$;

-- منح الصلاحيات للدالة
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO anon;

