-- 014_constraints_and_validations.sql
-- Constraints إضافية وتحسينات الجداول

-- ============================================
-- Constraints لجدول users
-- ============================================
-- التحقق من صحة البريد الإلكتروني
ALTER TABLE users
ADD CONSTRAINT chk_users_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- التحقق من صحة role
ALTER TABLE users
ADD CONSTRAINT chk_users_role 
CHECK (role IN ('Admin', 'Requester', 'Provider'));

-- ============================================
-- Constraints لجدول orders
-- ============================================
-- إضافة constraint للتحقق من أن order_price إيجابي
ALTER TABLE orders
ADD CONSTRAINT chk_orders_price_positive 
CHECK (order_price IS NULL OR order_price >= 0);

-- ============================================
-- Constraints لجدول payments
-- ============================================
-- التحقق من أن المبلغ إيجابي
ALTER TABLE payments
ADD CONSTRAINT chk_payments_amount_positive 
CHECK (amount > 0);

-- التحقق من صحة العملة
ALTER TABLE payments
ADD CONSTRAINT chk_payments_currency 
CHECK (currency IN ('SAR', 'USD', 'EUR'));

-- التحقق من صحة حالة الدفع
ALTER TABLE payments
ADD CONSTRAINT chk_payments_status 
CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'));

-- ============================================
-- Constraints لجدول order_ratings
-- ============================================
-- منع التقييم المزدوج من نفس المستخدم لنفس الطلب
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_ratings_unique_user_order 
ON order_ratings(order_id, rated_by_user_id);

-- ============================================
-- Constraints لجدول services
-- ============================================
-- التحقق من أن السعر إيجابي
ALTER TABLE services
ADD CONSTRAINT chk_services_price_positive 
CHECK (base_price IS NULL OR base_price >= 0);

-- ============================================
-- Constraints لجدول providers
-- ============================================
-- التحقق من أن avg_rate بين 0 و 5
ALTER TABLE providers
ADD CONSTRAINT chk_providers_avg_rate 
CHECK (avg_rate >= 0 AND avg_rate <= 5);

-- ============================================
-- Constraints لجدول notifications
-- ============================================
-- التحقق من أن العنوان والجسم غير فارغين
ALTER TABLE notifications
ADD CONSTRAINT chk_notifications_title_not_empty 
CHECK (LENGTH(TRIM(title)) > 0);

ALTER TABLE notifications
ADD CONSTRAINT chk_notifications_body_not_empty 
CHECK (LENGTH(TRIM(body)) > 0);

-- ============================================
-- Constraints لجدول tickets
-- ============================================
-- التحقق من أن العنوان غير فارغ
ALTER TABLE tickets
ADD CONSTRAINT chk_tickets_title_not_empty 
CHECK (LENGTH(TRIM(title)) > 0);

-- التحقق من أن closed_at بعد created_at
ALTER TABLE tickets
ADD CONSTRAINT chk_tickets_closed_after_created 
CHECK (closed_at IS NULL OR closed_at >= created_at);

-- ============================================
-- Constraints لجدول faq_questions
-- ============================================
-- التحقق من أن الأسئلة والأجوبة غير فارغة
ALTER TABLE faq_questions
ADD CONSTRAINT chk_faq_question_ar_not_empty 
CHECK (LENGTH(TRIM(question_ar)) > 0);

ALTER TABLE faq_questions
ADD CONSTRAINT chk_faq_question_en_not_empty 
CHECK (LENGTH(TRIM(question_en)) > 0);

ALTER TABLE faq_questions
ADD CONSTRAINT chk_faq_answer_ar_not_empty 
CHECK (LENGTH(TRIM(answer_ar)) > 0);

ALTER TABLE faq_questions
ADD CONSTRAINT chk_faq_answer_en_not_empty 
CHECK (LENGTH(TRIM(answer_en)) > 0);

-- ============================================
-- Constraints لجدول partners
-- ============================================
-- التحقق من أن الاسم غير فارغ
ALTER TABLE partners
ADD CONSTRAINT chk_partners_name_not_empty 
CHECK (LENGTH(TRIM(name)) > 0);

-- ============================================
-- Constraints لجدول customers
-- ============================================
-- التحقق من أن الاسم غير فارغ
ALTER TABLE customers
ADD CONSTRAINT chk_customers_name_not_empty 
CHECK (LENGTH(TRIM(name)) > 0);

-- ============================================
-- Constraints لجدول requesters
-- ============================================
-- التحقق من أن الاسم غير فارغ
ALTER TABLE requesters
ADD CONSTRAINT chk_requesters_name_not_empty 
CHECK (LENGTH(TRIM(name)) > 0);

-- ============================================
-- Constraints لجدول providers
-- ============================================
-- التحقق من أن الاسم غير فارغ
ALTER TABLE providers
ADD CONSTRAINT chk_providers_name_not_empty 
CHECK (LENGTH(TRIM(name)) > 0);

-- ============================================
-- Constraints لجدول requests
-- ============================================
-- التحقق من أن العنوان غير فارغ
ALTER TABLE requests
ADD CONSTRAINT chk_requests_title_not_empty 
CHECK (LENGTH(TRIM(title)) > 0);

-- ============================================
-- Constraints لجدول orders
-- ============================================
-- التحقق من أن العنوان غير فارغ
ALTER TABLE orders
ADD CONSTRAINT chk_orders_title_not_empty 
CHECK (LENGTH(TRIM(order_title)) > 0);

-- إضافة عمود order_price إذا لم يكن موجوداً
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'order_price'
    ) THEN
        ALTER TABLE orders ADD COLUMN order_price NUMERIC(12,2);
    END IF;
END $$;

