-- =============================================
-- Fix Trigger Logic for Auto Order Creation
-- =============================================

-- THe trigger uses `provider_id`.
-- However, the assignment logic might only populate `assigned_provider_id`.
-- We should update the trigger to fallback to `assigned_provider_id` if `provider_id` is null.

CREATE OR REPLACE FUNCTION auto_create_order_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    waiting_start_status_id INT;
    existing_order_id UUID;
    final_provider_id UUID;
BEGIN
    -- التحقق من أن الحالة الجديدة هي "مدفوع" (204)
    IF NEW.status_id = 204 AND (OLD.status_id IS NULL OR OLD.status_id != 204) THEN
        
        -- Use provider_id OR assigned_provider_id
        final_provider_id := COALESCE(NEW.provider_id, NEW.assigned_provider_id);

        -- If no provider is found at all, we cannot create an order. Log warning or exit.
        -- Ideally, we should enforce this in the application layer (which we did by adding the check).
        IF final_provider_id IS NULL THEN
            RAISE NOTICE 'Skipping order creation for request %: No provider assigned.', NEW.id;
            RETURN NEW;
        END IF;

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
                final_provider_id,
                COALESCE(NEW.title, 'مشروع جديد'),
                waiting_start_status_id,
                NOW()
            );
            
            -- ALSO update the request's provider_id if it was null, to keep them in sync
            IF NEW.provider_id IS NULL THEN
               -- We cannot update NEW directly in an AFTER trigger if we want to save it to DB (it's already saved).
               -- But this is an AFTER UPDATE trigger.
               -- We should probably update the table again or just leave it.
               -- Let's update the table to keep consistency.
               UPDATE requests SET provider_id = final_provider_id WHERE id = NEW.id;
            END IF;

            RAISE NOTICE 'تم إنشاء مشروع جديد للطلب: %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
