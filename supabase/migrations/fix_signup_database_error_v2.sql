-- ==============================================================================
-- FIX: Database error saving new user (BACURA PLATFORM)
-- Consolidate all auth.users triggers into one reliable handler
-- This fixes column name mismatches and conflicting trigger logic
-- ==============================================================================

-- 1. CLEANUP: Drop all known conflicting triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_core ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_notification_prefs ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_consolidated ON auth.users;

-- 2. CREATE: The consolidated function
CREATE OR REPLACE FUNCTION public.handle_new_user_v3()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_full_name TEXT;
    v_entity_type_id INT;
    v_city_id INT;
    v_phone TEXT;
    v_cr_number TEXT;
    v_specialization TEXT;
    v_bio TEXT;
    v_default_entity_id INT;
BEGIN
    -- Data extraction from raw_user_meta_data (Sent from SignupForm.jsx)
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'Requester');
    v_full_name := COALESCE(
        new.raw_user_meta_data->>'fullName',
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
    );
    v_phone := COALESCE(new.raw_user_meta_data->>'phone', new.phone);
    v_cr_number := new.raw_user_meta_data->>'commercialRecord';
    v_specialization := new.raw_user_meta_data->>'specialization';
    v_bio := new.raw_user_meta_data->>'bio';
    
    -- Safe ID casting for entityTypeId and regionId (handle potential string-in-json)
    BEGIN v_entity_type_id := (new.raw_user_meta_data->>'entityTypeId')::INT; EXCEPTION WHEN OTHERS THEN v_entity_type_id := NULL; END;
    BEGIN v_city_id := (new.raw_user_meta_data->>'regionId')::INT; EXCEPTION WHEN OTHERS THEN v_city_id := NULL; END;

    -- Default Entity Type Fallback (Try 'individual' for Requesters, 'freelancer' for Providers)
    IF v_entity_type_id IS NULL THEN
        IF v_role ILIKE 'Requester' THEN
            SELECT id INTO v_entity_type_id FROM public.lookup_values 
            WHERE code = 'individual' AND lookup_type_id IN (SELECT id FROM public.lookup_types WHERE code = 'requester-entity-types')
            LIMIT 1;
        ELSE
            SELECT id INTO v_entity_type_id FROM public.lookup_values 
            WHERE code = 'freelancer' AND lookup_type_id IN (SELECT id FROM public.lookup_types WHERE code = 'provider-entity-types')
            LIMIT 1;
        END IF;
    END IF;

    -- Fallback to ANY value if still null (ensure NOT NULL constraint doesn't trip)
    IF v_entity_type_id IS NULL THEN
        SELECT id INTO v_entity_type_id FROM public.lookup_values LIMIT 1;
    END IF;

    -- A. Sync into public.users (Central table)
    INSERT INTO public.users (id, email, phone, role, created_at, updated_at)
    VALUES (new.id, new.email, v_phone, v_role, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.users.phone),
        role = EXCLUDED.role,
        updated_at = NOW();

    -- B. Handle specific roles with correct column names
    IF v_role ILIKE 'Requester' THEN
        INSERT INTO public.requesters (user_id, name, entity_type_id, city_id, commercial_reg_no, created_at, updated_at)
        VALUES (new.id, v_full_name, COALESCE(v_entity_type_id, 1), v_city_id, v_cr_number, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            name = EXCLUDED.name,
            entity_type_id = EXCLUDED.entity_type_id,
            city_id = EXCLUDED.city_id,
            commercial_reg_no = EXCLUDED.commercial_reg_no,
            updated_at = NOW();

    ELSIF v_role ILIKE 'Provider' THEN
        INSERT INTO public.providers (user_id, name, entity_type_id, city_id, specialization, created_at, updated_at, profile_status_id)
        VALUES (new.id, v_full_name, COALESCE(v_entity_type_id, 2), v_city_id, v_specialization, NOW(), NOW(), 201)
        ON CONFLICT (user_id) DO UPDATE SET
            name = EXCLUDED.name,
            entity_type_id = EXCLUDED.entity_type_id,
            city_id = EXCLUDED.city_id,
            specialization = EXCLUDED.specialization,
            updated_at = NOW();

    ELSIF v_role ILIKE 'Admin' THEN
        INSERT INTO public.admins (user_id, display_name, created_at, updated_at)
        VALUES (new.id, v_full_name, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            updated_at = NOW();
    END IF;

    -- C. Handle profile_infos (Metadata table)
    INSERT INTO public.profile_infos (user_id, bio, created_at, updated_at)
    VALUES (new.id, v_bio, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        bio = COALESCE(EXCLUDED.bio, public.profile_infos.bio),
        updated_at = NOW();

    -- D. Handle notification_preferences (Defaults)
    INSERT INTO public.notification_preferences (user_id, email_enabled, order_updates, billing_updates, security_alerts, marketing, updated_at)
    VALUES (new.id, TRUE, TRUE, TRUE, TRUE, FALSE, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- 3. RE-ATTACH: The consolidated trigger
CREATE TRIGGER on_auth_user_created_consolidated
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_v3();

-- 4. AUTO-CONFIRM: Keep Requesters confirmed for immediate login
CREATE OR REPLACE FUNCTION public.auto_confirm_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (new.raw_user_meta_data->>'role') ILIKE 'Requester' THEN
        new.email_confirmed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_auto_confirm
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_on_signup();

-- 5. REPAIR: Backfill missing records for existing users
DO $$
BEGIN
    -- Backfill public.users
    INSERT INTO public.users (id, email, role, created_at)
    SELECT id, email, COALESCE(raw_user_meta_data->>'role', 'Requester'), created_at
    FROM auth.users
    WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.users.id)
    ON CONFLICT DO NOTHING;

    -- Backfill profile_infos
    INSERT INTO public.profile_infos (user_id)
    SELECT id FROM auth.users
    WHERE NOT EXISTS (SELECT 1 FROM public.profile_infos WHERE user_id = auth.users.id)
    ON CONFLICT DO NOTHING;

    -- Backfill notification_preferences
    INSERT INTO public.notification_preferences (user_id)
    SELECT id FROM auth.users
    WHERE NOT EXISTS (SELECT 1 FROM public.notification_preferences WHERE user_id = auth.users.id)
    ON CONFLICT DO NOTHING;
END $$;
