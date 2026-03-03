-- migration: improve_provider_workflow.sql
-- This migration ensures status identifiers are consistent and adds server-side synchronization

-- 1. Correct/Ensure Status Lookups (Type 4 = Order Status)
DO $$
DECLARE
    type_id INT;
BEGIN
    SELECT id INTO type_id FROM lookup_types WHERE code = 'order-status';
    IF type_id IS NOT NULL THEN
        -- 17: waiting_approval
        -- 18: waiting_start
        -- 13: processing / ongoing
        -- 15: completed
        -- 19: rejected
        -- 20: expired
        -- 16: cancelled
        
        INSERT INTO lookup_values (id, lookup_type_id, code, name_ar, name_en)
        OVERRIDING SYSTEM VALUE
        VALUES 
            (17, type_id, 'waiting_approval', 'بانتظار موافقة المزود', 'Waiting Provider Approval'),
            (18, type_id, 'waiting_start', 'بانتظار البدء', 'Waiting to Start'),
            (19, type_id, 'rejected', 'مرفوض من المزود', 'Rejected by Provider')
        ON CONFLICT (id) DO UPDATE SET 
            code = EXCLUDED.code,
            name_ar = EXCLUDED.name_ar,
            name_en = EXCLUDED.name_en;
            
        -- Ensure 13 and 15 are there too if they follow a different sequence
        IF NOT EXISTS (SELECT 1 FROM lookup_values WHERE id = 13) THEN
             INSERT INTO lookup_values (id, lookup_type_id, code, name_ar, name_en)
             OVERRIDING SYSTEM VALUE VALUES (13, type_id, 'processing', 'قيد التنفيذ', 'Ongoing / Processing');
        END IF;
    END IF;
END $$;

-- 2. Sync Trigger: When an order status changes, update the request provider_response
CREATE OR REPLACE FUNCTION sync_order_status_to_request()
RETURNS TRIGGER AS $$
DECLARE
    v_status_code TEXT;
BEGIN
    -- Get the code of the new status
    SELECT code INTO v_status_code FROM lookup_values WHERE id = NEW.order_status_id;
    
    -- If status is waiting_start (ID 18), then provider has accepted
    IF v_status_code = 'waiting_start' THEN
        UPDATE requests SET 
            provider_response = 'accepted',
            provider_response_at = NOW(),
            -- Sync with 'provider_assigned' status for requests if available
            status_id = COALESCE(
                (SELECT id FROM lookup_values WHERE lookup_type_id = (SELECT id FROM lookup_types WHERE code = 'request-status') AND code = 'provider_assigned' LIMIT 1),
                status_id
            )
        WHERE id = NEW.request_id;
        
    -- If status is rejected (ID 19), then provider has rejected
    ELSIF v_status_code = 'rejected' THEN
        UPDATE requests SET 
            provider_response = 'rejected',
            provider_response_at = NOW(),
            assigned_provider_id = NULL, -- Unassign so admin can re-assign
            -- Revert request status to 'paid' (204) so it can be reassigned
            status_id = COALESCE(
                (SELECT id FROM lookup_values WHERE lookup_type_id = (SELECT id FROM lookup_types WHERE code = 'request-status') AND code = 'paid' LIMIT 1),
                204
            )
        WHERE id = NEW.request_id;
        
    -- If status is processing (ID 13), mark request as ongoing
    ELSIF v_status_code = 'processing' THEN
        UPDATE requests SET 
            -- Can stay in provider_assigned or move to a more advanced status if needed
            updated_at = NOW()
        WHERE id = NEW.request_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_order_status_to_request ON orders;
CREATE TRIGGER trigger_sync_order_status_to_request
    AFTER UPDATE OF order_status_id ON orders
    FOR EACH ROW
    EXECUTE FUNCTION sync_order_status_to_request();

-- 3. Cleanup: If any orders are in status 'waiting_approval' (17) but request is already accepted, sync them
UPDATE orders o
SET order_status_id = 18
FROM requests r
WHERE o.request_id = r.id 
  AND o.order_status_id = 17 
  AND r.provider_response = 'accepted';
