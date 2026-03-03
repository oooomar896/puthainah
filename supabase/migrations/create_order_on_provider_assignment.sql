-- Fix: Create order when provider is assigned (not just when paid)
-- This allows providers to see their assigned requests immediately

CREATE OR REPLACE FUNCTION auto_create_order_on_provider_assignment()
RETURNS TRIGGER AS $$
DECLARE
    waiting_approval_status_id INT;
    existing_order_id UUID;
BEGIN
    -- Check if provider was just assigned (NEW has provider, OLD didn't or was different)
    IF NEW.assigned_provider_id IS NOT NULL AND 
       (OLD.assigned_provider_id IS NULL OR OLD.assigned_provider_id != NEW.assigned_provider_id) THEN
        
        -- Get "waiting-approval" status ID for orders (600)
        SELECT id INTO waiting_approval_status_id 
        FROM lookup_values 
        WHERE lookup_type_id = 4 AND code = 'waiting-approval'
        LIMIT 1;
        
        -- If not found, use "in-progress"
        IF waiting_approval_status_id IS NULL THEN
            SELECT id INTO waiting_approval_status_id 
            FROM lookup_values 
            WHERE lookup_type_id = 4 AND code = 'in-progress'
            LIMIT 1;
        END IF;
        
        -- Check if order already exists for this request
        SELECT id INTO existing_order_id 
        FROM orders 
        WHERE request_id = NEW.id 
        LIMIT 1;
        
        -- Create order only if it doesn't exist
        IF existing_order_id IS NULL AND waiting_approval_status_id IS NOT NULL THEN
            INSERT INTO orders (
                request_id,
                provider_id,
                order_title,
                order_status_id,
                payout,
                start_date,
                created_at
            ) VALUES (
                NEW.id,
                NEW.assigned_provider_id,
                COALESCE(NEW.title, 'مشروع جديد'),
                waiting_approval_status_id,
                NEW.provider_quoted_price,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Created order for request % with assigned provider % and payout %', NEW.id, NEW.assigned_provider_id, NEW.provider_quoted_price;
        ELSIF existing_order_id IS NOT NULL THEN
            -- Update existing order with new provider and payout
            UPDATE orders
            SET 
                provider_id = NEW.assigned_provider_id,
                payout = NEW.provider_quoted_price,
                updated_at = NOW()
            WHERE id = existing_order_id;
            
            RAISE NOTICE 'Updated order % with new provider % and payout %', existing_order_id, NEW.assigned_provider_id, NEW.provider_quoted_price;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_create_order_on_provider_assignment ON requests;

-- Create new trigger
CREATE TRIGGER trigger_auto_create_order_on_provider_assignment
    AFTER UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_order_on_provider_assignment();

COMMENT ON FUNCTION auto_create_order_on_provider_assignment() IS 'Creates or updates order when provider is assigned to request';
