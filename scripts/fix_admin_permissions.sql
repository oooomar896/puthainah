-- =============================================
-- Fix Admin Permissions (Using 'users' table instead of 'profiles')
-- =============================================

-- 1. Ensure columns exist in 'requests' table
-- هذه الأعمدة ضرورية لقبول أو رفض الإيصالات
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS receipt_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS receipt_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS requester_rejection_reason TEXT;

-- 2. Grant permissions to Admin on 'requests'
-- السماح للأدمن بتعديل جميع الطلبات
DROP POLICY IF EXISTS "Admins can update all requests" ON requests;
CREATE POLICY "Admins can update all requests"
ON requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'Admin'
  )
);

DROP POLICY IF EXISTS "Admins can view all requests" ON requests;
CREATE POLICY "Admins can view all requests"
ON requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'Admin'
  )
);

-- 3. Grant permissions to Admin on 'orders'
-- السماح للأدمن بإنشاء وتعديل المشاريع (orders)
DROP POLICY IF EXISTS "Admins can insert orders" ON orders;
CREATE POLICY "Admins can insert orders"
ON orders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'Admin'
  )
);

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
ON orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'Admin'
  )
);

DROP POLICY IF EXISTS "Admins can select orders" ON orders;
CREATE POLICY "Admins can select orders"
ON orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'Admin'
  )
);

-- 4. Grant permissions to Admin on 'payments'
-- السماح للأدمن بتعديل المدفوعات
DROP POLICY IF EXISTS "Admins can update payments" ON payments;
CREATE POLICY "Admins can update payments"
ON payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'Admin'
  )
);

DROP POLICY IF EXISTS "Admins can select payments" ON payments;
CREATE POLICY "Admins can select payments"
ON payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'Admin'
  )
);

-- 5. Grant permissions to Admin on 'attachments'
-- السماح للأدمن بتعديل المرفقات (لقبول/رفض الإيصال)
DROP POLICY IF EXISTS "Admins can update attachments" ON attachments;
CREATE POLICY "Admins can update attachments"
ON attachments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'Admin'
  )
);

-- =============================================
-- End of Fixes
-- =============================================
