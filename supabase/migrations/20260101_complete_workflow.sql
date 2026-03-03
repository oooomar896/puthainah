-- =============================================
-- Migration: Complete Workflow Updates
-- نموذج الأدمن المركزي مع التسليم والتقييم
-- Date: 2026-01-01
-- =============================================

-- =============================================
-- 1. تحديث جدول requests
-- =============================================

-- حقول التسعير من الأدمن
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS admin_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS admin_proposal_file_url TEXT;

-- حقول قبول/رفض السعر من طالب الخدمة
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS requester_accepted_price BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS requester_response_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS requester_rejection_reason TEXT;

-- حقول تعيين مزود الخدمة (يختاره الأدمن)
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS provider_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS provider_assigned_at TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_requests_provider_id ON requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_requests_admin_price ON requests(admin_price);

-- =============================================
-- 2. إنشاء جدول الرسائل والتواصل
-- =============================================

CREATE TABLE IF NOT EXISTS project_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_messages_order ON project_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_sender ON project_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_created ON project_messages(created_at DESC);

-- =============================================
-- 3. إنشاء جدول التسليمات
-- =============================================

CREATE TABLE IF NOT EXISTS project_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    delivery_file_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'rejected', 'under_review')),
    requester_response TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deliverables_order ON project_deliverables(order_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON project_deliverables(status);

-- =============================================
-- 4. إضافة حالات جديدة
-- =============================================

DO $$
DECLARE
    request_status_type_id INT;
BEGIN
    SELECT id INTO request_status_type_id FROM lookup_types WHERE code = 'request-status';
    
    IF request_status_type_id IS NOT NULL THEN
        -- حالة: تم الدفع
        INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
        VALUES (request_status_type_id, 'paid', 'تم الدفع', 'Paid')
        ON CONFLICT DO NOTHING;
        
        -- حالة: تم تعيين مزود
        INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
        VALUES (request_status_type_id, 'provider_assigned', 'تم تعيين مزود', 'Provider Assigned')
        ON CONFLICT DO NOTHING;
        
        -- حالة: بانتظار التسليم
        INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
        VALUES (request_status_type_id, 'pending_delivery', 'بانتظار التسليم', 'Pending Delivery')
        ON CONFLICT DO NOTHING;
        
        -- حالة: تحت المراجعة
        INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
        VALUES (request_status_type_id, 'under_review', 'تحت المراجعة', 'Under Review')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =============================================
-- 5. تحديث جدول payments
-- =============================================

ALTER TABLE payments 
ALTER COLUMN order_id DROP NOT NULL;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS moyasar_payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'moyasar',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_payments_request_id ON payments(request_id);

-- =============================================
-- 6. التأكد من جدول التقييمات
-- =============================================

-- جدول التقييمات موجود، نتأكد من الهيكل
-- يمكن لطالب الخدمة تقييم مزود الخدمة بعد قبول التسليم

-- =============================================
-- Comments
-- =============================================

COMMENT ON COLUMN requests.admin_price IS 'السعر المقدم لطالب الخدمة';
COMMENT ON COLUMN requests.provider_price IS 'السعر المدفوع لمزود الخدمة (قد يختلف عن سعر العميل)';
COMMENT ON COLUMN requests.admin_proposal_file_url IS 'رابط ملف العرض المالي';
COMMENT ON TABLE project_messages IS 'رسائل التواصل بين طالب الخدمة ومزود الخدمة';
COMMENT ON TABLE project_deliverables IS 'نماذج التسليم من مزود الخدمة';
