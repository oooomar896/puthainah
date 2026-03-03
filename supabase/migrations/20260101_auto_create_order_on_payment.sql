-- =============================================
-- Migration: Auto Create Order on Payment
-- تحويل الطلب إلى مشروع تلقائياً عند الدفع
-- Date: 2026-01-01
-- =============================================

-- =============================================
-- 1. جدول orders موجود بالفعل في 004_services_requests_orders.sql
-- نتأكد فقط من وجود الـ indexes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_orders_request_id ON orders(request_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_id ON orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- =============================================
-- 2. Function: إنشاء مشروع تلقائياً عند الدفع
-- =============================================

CREATE OR REPLACE FUNCTION auto_create_order_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    waiting_start_status_id INT;
    existing_order_id UUID;
BEGIN
    -- التحقق من أن الحالة الجديدة هي "مدفوع" (204)
    IF NEW.status_id = 204 AND (OLD.status_id IS NULL OR OLD.status_id != 204) THEN
        
        -- الحصول على ID حالة "بانتظار البدء" للمشاريع
        SELECT id INTO waiting_start_status_id 
        FROM lookup_values 
        WHERE lookup_type_id = 4 AND code = 'waiting_start'
        LIMIT 1;
        
        -- إذا لم نجد الحالة، نستخدم "قيد التنفيذ"
        IF waiting_start_status_id IS NULL THEN
            SELECT id INTO waiting_start_status_id 
            FROM lookup_values 
            WHERE lookup_type_id = 4 AND code = 'in-progress'
            LIMIT 1;
        END IF;
        
        -- التحقق من عدم وجود مشروع مسبقاً لهذا الطلب
        SELECT id INTO existing_order_id 
        FROM orders 
        WHERE request_id = NEW.id 
        LIMIT 1;
        
        -- إنشاء المشروع فقط إذا لم يكن موجوداً
        IF existing_order_id IS NULL AND waiting_start_status_id IS NOT NULL THEN
            INSERT INTO orders (
                request_id,
                provider_id,
                order_title,
                order_status_id,
                start_date
            ) VALUES (
                NEW.id,
                NEW.provider_id,
                COALESCE(NEW.title, 'مشروع جديد'),
                waiting_start_status_id,
                NOW()
            );
            
            RAISE NOTICE 'تم إنشاء مشروع جديد للطلب: %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. Trigger: تفعيل الإنشاء التلقائي
-- =============================================

DROP TRIGGER IF EXISTS trigger_auto_create_order_on_payment ON requests;

CREATE TRIGGER trigger_auto_create_order_on_payment
    AFTER UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_order_on_payment();

-- =============================================
-- 4. Function: مزامنة حالة المشروع مع الطلب
-- =============================================

CREATE OR REPLACE FUNCTION sync_order_status_with_request()
RETURNS TRIGGER AS $$
DECLARE
    order_status_map JSONB;
    target_order_status_id INT;
BEGIN
    -- خريطة تحويل حالات الطلبات إلى حالات المشاريع
    -- Request Status -> Order Status
    order_status_map := '{
        "204": "waiting_start",
        "205": "in-progress",
        "206": "in-progress",
        "207": "in-progress",
        "11": "completed"
    }'::jsonb;
    
    -- إذا تغيرت حالة الطلب، نحدث حالة المشروع المرتبط
    IF NEW.status_id != OLD.status_id THEN
        -- الحصول على رمز الحالة المستهدفة للمشروع
        IF order_status_map ? NEW.status_id::text THEN
            SELECT id INTO target_order_status_id
            FROM lookup_values
            WHERE lookup_type_id = 4 
            AND code = order_status_map->>NEW.status_id::text
            LIMIT 1;
            
            -- تحديث حالة المشروع
            IF target_order_status_id IS NOT NULL THEN
                UPDATE orders
                SET 
                    order_status_id = target_order_status_id,
                    completed_at = CASE 
                        WHEN NEW.status_id = 11 THEN NOW() 
                        ELSE completed_at 
                    END,
                    updated_at = NOW()
                WHERE request_id = NEW.id;
                
                RAISE NOTICE 'تم تحديث حالة المشروع للطلب: %', NEW.id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. Trigger: مزامنة الحالات
-- =============================================

DROP TRIGGER IF EXISTS trigger_sync_order_status ON requests;

CREATE TRIGGER trigger_sync_order_status
    AFTER UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION sync_order_status_with_request();

-- =============================================
-- 6. تحويل الطلبات المدفوعة الحالية إلى مشاريع
-- =============================================

DO $$
DECLARE
    paid_request RECORD;
    waiting_start_status_id INT;
BEGIN
    -- الحصول على ID حالة "بانتظار البدء"
    SELECT id INTO waiting_start_status_id 
    FROM lookup_values 
    WHERE lookup_type_id = 4 AND code = 'waiting_start'
    LIMIT 1;
    
    -- إذا لم نجد، نستخدم "قيد التنفيذ"
    IF waiting_start_status_id IS NULL THEN
        SELECT id INTO waiting_start_status_id 
        FROM lookup_values 
        WHERE lookup_type_id = 4 AND code = 'in-progress'
        LIMIT 1;
    END IF;
    
    -- تحويل جميع الطلبات المدفوعة إلى مشاريع
    IF waiting_start_status_id IS NOT NULL THEN
        FOR paid_request IN 
            SELECT r.* 
            FROM requests r
            LEFT JOIN orders o ON o.request_id = r.id
            WHERE r.status_id = 204 
            AND r.provider_id IS NOT NULL
            AND o.id IS NULL
        LOOP
            INSERT INTO orders (
                request_id,
                provider_id,
                order_title,
                order_status_id,
                start_date,
                created_at
            ) VALUES (
                paid_request.id,
                paid_request.provider_id,
                COALESCE(paid_request.title, 'مشروع جديد'),
                waiting_start_status_id,
                NOW(),
                paid_request.created_at
            );
            
            RAISE NOTICE 'تم تحويل الطلب المدفوع إلى مشروع: %', paid_request.id;
        END LOOP;
    END IF;
END $$;

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE orders IS 'المشاريع النشطة - يتم إنشاؤها تلقائياً عند دفع الطلب';
COMMENT ON FUNCTION auto_create_order_on_payment() IS 'ينشئ مشروعاً تلقائياً عندما يتم دفع الطلب';
COMMENT ON FUNCTION sync_order_status_with_request() IS 'يزامن حالة المشروع مع حالة الطلب';
