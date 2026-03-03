-- supabase/migrations/018_add_profile_status.sql

DO $$
DECLARE
    type_id INT;
BEGIN
    -- 1. Insert lookup type
    INSERT INTO lookup_types (code, name_ar, name_en)
    VALUES ('profile-status', 'حالة الملف الشخصي', 'Profile Status')
    ON CONFLICT (code) DO UPDATE SET code = EXCLUDED.code
    RETURNING id INTO type_id;

    -- If it existed, get the ID
    IF type_id IS NULL THEN
        SELECT id INTO type_id FROM lookup_types WHERE code = 'profile-status';
    END IF;

    -- 2. Insert lookup values with explicit IDs
    -- We use OVERRIDING SYSTEM VALUE to force IDs
    INSERT INTO lookup_values (id, lookup_type_id, code, name_ar, name_en)
    OVERRIDING SYSTEM VALUE
    VALUES
        (200, type_id, 'pending', 'قيد المراجعة', 'Pending'),
        (201, type_id, 'active', 'نشط', 'Active'),
        (202, type_id, 'blocked', 'محظور', 'Blocked'),
        (203, type_id, 'suspended', 'موقوف', 'Suspended')
    ON CONFLICT (id) DO UPDATE SET
        lookup_type_id = EXCLUDED.lookup_type_id,
        code = EXCLUDED.code,
        name_ar = EXCLUDED.name_ar,
        name_en = EXCLUDED.name_en;
        
    -- 3. Update sequence to avoid conflicts
    PERFORM setval('lookup_values_id_seq', (SELECT MAX(id) FROM lookup_values));

    -- 4. Add column to providers if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'profile_status_id') THEN
        ALTER TABLE providers ADD COLUMN profile_status_id INT DEFAULT 200 REFERENCES lookup_values(id);
    END IF;

END $$;
