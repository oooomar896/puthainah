-- تحسين دالة get_user_role لتكون أكثر دقة في تحديد الدور
-- تقوم بالبحث في جدول users ثم الجداول الفرعية (admins, providers, requesters)

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS VARCHAR(50) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role VARCHAR(50);
BEGIN
    -- 1. محاولة جلب الدور من جدول users
    -- نستخدم COALESCE للتأكد من عدم وجود NULL
    SELECT role INTO user_role
    FROM public.users
    WHERE id = user_id;
    
    -- إذا وجدنا الدور وكان قيمة صالحة، نرجعه
    IF user_role IS NOT NULL AND user_role IN ('Admin', 'Provider', 'Requester') THEN
        RETURN user_role;
    END IF;

    -- 2. التحقق من جدول Admins
    IF EXISTS (SELECT 1 FROM public.admins WHERE user_id = get_user_role.user_id OR id = get_user_role.user_id) THEN
        RETURN 'Admin';
    END IF;

    -- 3. التحقق من جدول Providers
    IF EXISTS (SELECT 1 FROM public.providers WHERE user_id = get_user_role.user_id OR id = get_user_role.user_id) THEN
        RETURN 'Provider';
    END IF;

    -- 4. التحقق من جدول Requesters
    IF EXISTS (SELECT 1 FROM public.requesters WHERE user_id = get_user_role.user_id OR id = get_user_role.user_id) THEN
        RETURN 'Requester';
    END IF;

    -- 5. إذا لم يتم العثور على شيء، نرجع Requester كقيمة افتراضية لتمكين الدخول
    RETURN 'Requester';
EXCEPTION
    WHEN OTHERS THEN
        -- في حالة حدوث خطأ، نرجع القيمة الافتراضية
        RETURN 'Requester';
END;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO service_role;
