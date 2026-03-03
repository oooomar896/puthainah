CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_role VARCHAR(50);
    user_name VARCHAR(255);
    entity_type INT;
    provider_type_id INT;
    requester_type_id INT;
BEGIN
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'Requester');
    user_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

    -- Insert into users
    INSERT INTO public.users (id, email, phone, role, created_at, updated_at)
    VALUES (new.id, new.email, new.phone, user_role, new.created_at, new.created_at)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = NOW();

    -- Get lookup type IDs
    SELECT id INTO requester_type_id FROM public.lookup_types WHERE code = 'requester-entity-types';
    SELECT id INTO provider_type_id FROM public.lookup_types WHERE code = 'provider-entity-types';

    IF user_role = 'Requester' THEN
        -- Try to find 'individual'
        SELECT id INTO entity_type FROM public.lookup_values 
        WHERE code = 'individual' AND lookup_type_id = requester_type_id
        LIMIT 1;
        
        -- Fallback to any
        IF entity_type IS NULL THEN
            SELECT id INTO entity_type FROM public.lookup_values 
            WHERE lookup_type_id = requester_type_id
            LIMIT 1;
        END IF;

        INSERT INTO public.requesters (user_id, name, entity_type_id)
        VALUES (new.id, user_name, COALESCE(entity_type, 1))
        ON CONFLICT (user_id) DO NOTHING;

    ELSIF user_role = 'Provider' THEN
        -- Try to find 'company' (which might not exist, but let's try)
        SELECT id INTO entity_type FROM public.lookup_values 
        WHERE code = 'company' AND lookup_type_id = provider_type_id
        LIMIT 1;
        
        -- Fallback to any
        IF entity_type IS NULL THEN
            SELECT id INTO entity_type FROM public.lookup_values 
            WHERE lookup_type_id = provider_type_id
            LIMIT 1;
        END IF;
        
        -- Use 1 as last resort, but hopefully we found something
        INSERT INTO public.providers (user_id, name, entity_type_id)
        VALUES (new.id, user_name, COALESCE(entity_type, 1))
        ON CONFLICT (user_id) DO NOTHING;
        
    ELSIF user_role = 'Admin' THEN
        INSERT INTO public.admins (user_id, display_name)
        VALUES (new.id, user_name)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    INSERT INTO public.profile_infos (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$;
