-- 017_auth_sync_trigger.sql
-- مزامنة المستخدمين من auth.users إلى public.users وإنشاء ملفات التعريف تلقائياً

-- دالة لمعالجة المستخدمين الجدد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_role VARCHAR(50);
    user_name VARCHAR(255);
    entity_type INT;
    lookup_type_id_val INT;
BEGIN
    -- تحديد الدور من metadata أو افتراضياً 'Requester'
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'Requester');
    user_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'fullName',
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
    );

    -- إدخال المستخدم في جدول users
    INSERT INTO public.users (id, email, phone, role, created_at, updated_at)
    VALUES (new.id, new.email, new.phone, user_role, new.created_at, new.created_at)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = NOW();

    -- إنشاء ملف تعريف بناءً على الدور
    IF user_role = 'Requester' THEN
        -- استخدام entityTypeId من metadata إذا توفر
        entity_type := NULLIF(new.raw_user_meta_data->>'entityTypeId', '')::INT;
        IF entity_type IS NULL THEN
            -- محاولة العثور على نوع كيان افتراضي (individual)
            SELECT id INTO entity_type FROM public.lookup_values 
            WHERE code = 'individual' AND lookup_type_id IN (SELECT id FROM public.lookup_types WHERE code = 'requester-entity-types')
            LIMIT 1;
        END IF;
        IF entity_type IS NULL THEN
            -- احتياط: أي قيمة من النوع المناسب
            SELECT id INTO entity_type FROM public.lookup_values 
            WHERE lookup_type_id IN (SELECT id FROM public.lookup_types WHERE code = 'requester-entity-types') 
            LIMIT 1;
        END IF;

        -- إدراج السجل مع السجل التجاري إن وُجد في metadata
        INSERT INTO public.requesters (user_id, name, entity_type_id, commercial_reg_no)
        VALUES (
            new.id,
            user_name,
            COALESCE(entity_type, 1),
            NULLIF(new.raw_user_meta_data->>'commercialRecord', '')
        )
        ON CONFLICT (user_id) DO NOTHING;

    ELSIF user_role = 'Provider' THEN
        -- استخدام entityTypeId من metadata إذا توفر
        entity_type := NULLIF(new.raw_user_meta_data->>'entityTypeId', '')::INT;
        IF entity_type IS NULL THEN
            -- محاولة العثور على نوع كيان افتراضي (company)
            SELECT id INTO entity_type FROM public.lookup_values 
            WHERE code = 'company' AND lookup_type_id IN (SELECT id FROM public.lookup_types WHERE code = 'provider-entity-types')
            LIMIT 1;
        END IF;
        IF entity_type IS NULL THEN
            -- احتياط: أي قيمة من النوع المناسب
            SELECT id INTO entity_type FROM public.lookup_values 
            WHERE lookup_type_id IN (SELECT id FROM public.lookup_types WHERE code = 'provider-entity-types') 
            LIMIT 1;
        END IF;

        INSERT INTO public.providers (user_id, name, entity_type_id)
        VALUES (new.id, user_name, COALESCE(entity_type, 1))
        ON CONFLICT (user_id) DO NOTHING;
        
    ELSIF user_role = 'Admin' THEN
        INSERT INTO public.admins (user_id, display_name)
        VALUES (new.id, user_name)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- إنشاء سجل في profile_infos
    INSERT INTO public.profile_infos (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$;

-- إنشاء Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
