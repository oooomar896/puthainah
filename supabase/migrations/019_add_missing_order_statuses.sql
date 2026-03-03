-- supabase/migrations/019_add_missing_order_statuses.sql

DO $$
DECLARE
    type_id INT;
BEGIN
    -- Get the ID for 'order-status'
    SELECT id INTO type_id FROM lookup_types WHERE code = 'order-status';

    -- Insert missing lookup values with explicit IDs
    -- We use OVERRIDING SYSTEM VALUE to force IDs to ensure consistency with frontend logic
    IF type_id IS NOT NULL THEN
        INSERT INTO lookup_values (id, lookup_type_id, code, name_ar, name_en)
        OVERRIDING SYSTEM VALUE
        VALUES
            (17, type_id, 'waiting_approval', 'بانتظار الموافقة', 'Waiting Approval'),
            (18, type_id, 'waiting_start', 'بانتظار البدء', 'Waiting to Start'),
            (19, type_id, 'rejected', 'مرفوض', 'Rejected'),
            (20, type_id, 'expired', 'منتهي الصلاحية', 'Expired')
        ON CONFLICT (id) DO UPDATE SET
            lookup_type_id = EXCLUDED.lookup_type_id,
            code = EXCLUDED.code,
            name_ar = EXCLUDED.name_ar,
            name_en = EXCLUDED.name_en;
            
        -- Update sequence to avoid conflicts
        PERFORM setval('lookup_values_id_seq', (SELECT MAX(id) FROM lookup_values));
    END IF;

END $$;
