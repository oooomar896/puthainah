-- =============================================
-- Migration: Allow Project Creation Without Provider
-- تحويل الطلب إلى مشروع حتى لو لم يتم تعيين مزود بعد
-- =============================================

-- 1. Make provider_id nullable in orders table
ALTER TABLE orders ALTER COLUMN provider_id DROP NOT NULL;

-- 2. Update the trigger function to handle null provider_id
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
        
        -- إنشاء المشروع حتى لو لم يوجد مزود (provider_id قد يكون NULL)
        IF existing_order_id IS NULL AND waiting_start_status_id IS NOT NULL THEN
            INSERT INTO orders (
                request_id,
                provider_id,
                order_title,
                order_status_id,
                start_date
            ) VALUES (
                NEW.id,
                COALESCE(NEW.provider_id, NEW.assigned_provider_id), -- Try either
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

-- 3. Add a trigger to sync provider_id from request to order when it changes
CREATE OR REPLACE FUNCTION sync_provider_to_order()
RETURNS TRIGGER AS $$
BEGIN
    -- إذا تم تعيين مزود نهائي للطلب، نحدث المشروع المرتبط
    IF NEW.provider_id IS DISTINCT FROM OLD.provider_id AND NEW.provider_id IS NOT NULL THEN
        UPDATE orders
        SET provider_id = NEW.provider_id,
            updated_at = NOW()
        WHERE request_id = NEW.id;
    END IF;
    
    -- إذا تم قبول عرض مزود (provider_response = 'accepted')، نقوم بتعيينه كمزود نهائي
    IF NEW.provider_response = 'accepted' AND OLD.provider_response != 'accepted' THEN
        NEW.provider_id := NEW.assigned_provider_id;
        NEW.provider_price := NEW.provider_quoted_price;
        NEW.provider_assigned_at := NOW();
        
        -- تحديث المشروع أيضاً بالمرة
        UPDATE orders
        SET provider_id = NEW.assigned_provider_id,
            updated_at = NOW()
        WHERE request_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_provider_to_order ON requests;
CREATE TRIGGER trigger_sync_provider_to_order
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION sync_provider_to_order();
