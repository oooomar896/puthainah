-- supabase/migrations/020_seed_comprehensive_demo_data.sql

-- 1. Add 'waiting_payment' status for requests
DO $$
DECLARE
    request_status_type_id INT;
BEGIN
    SELECT id INTO request_status_type_id FROM lookup_types WHERE code = 'request-status';
    
    IF request_status_type_id IS NOT NULL THEN
        INSERT INTO lookup_values (id, lookup_type_id, code, name_ar, name_en)
        OVERRIDING SYSTEM VALUE
        VALUES (21, request_status_type_id, 'waiting_payment', 'بانتظار الدفع', 'Waiting Payment')
        ON CONFLICT (id) DO UPDATE SET
            lookup_type_id = EXCLUDED.lookup_type_id,
            code = EXCLUDED.code,
            name_ar = EXCLUDED.name_ar,
            name_en = EXCLUDED.name_en;
            
        PERFORM setval('lookup_values_id_seq', (SELECT MAX(id) FROM lookup_values));
    END IF;
END $$;

-- 2. Seed Users, Requesters, Providers
-- (Assuming users from 010 might exist, we'll try to add more or ensure they exist)
-- We will add a few more users to have variety

INSERT INTO users (email, phone, password_hash, role, is_blocked)
VALUES
    ('requester2@example.com', '+966500000012', 'hashed', 'Requester', FALSE),
    ('requester3@example.com', '+966500000013', 'hashed', 'Requester', FALSE),
    ('provider2@example.com', '+966500000014', 'hashed', 'Provider', FALSE),
    ('provider3@example.com', '+966500000015', 'hashed', 'Provider', FALSE)
ON CONFLICT (email) DO NOTHING;

-- Seed Requesters Profile
INSERT INTO requesters (user_id, entity_type_id, name, city_id)
SELECT 
    u.id, 
    (SELECT id FROM lookup_values WHERE code = 'company' LIMIT 1),
    'شركة الأفق البعيد',
    (SELECT id FROM cities WHERE name_en = 'Riyadh' LIMIT 1)
FROM users u WHERE email = 'requester2@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO requesters (user_id, entity_type_id, name, city_id)
SELECT 
    u.id, 
    (SELECT id FROM lookup_values WHERE code = 'individual' LIMIT 1),
    'خالد محمد',
    (SELECT id FROM cities WHERE name_en = 'Jeddah' LIMIT 1)
FROM users u WHERE email = 'requester3@example.com'
ON CONFLICT DO NOTHING;

-- Seed Providers Profile
INSERT INTO providers (user_id, entity_type_id, name, specialization, city_id, profile_status_id)
SELECT 
    u.id, 
    (SELECT id FROM lookup_values WHERE code = 'consulting-office' LIMIT 1),
    'مكتب الخبراء للاستشارات',
    'استشارات مالية',
    (SELECT id FROM cities WHERE name_en = 'Dammam' LIMIT 1),
    201 -- Active
FROM users u WHERE email = 'provider2@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO providers (user_id, entity_type_id, name, specialization, city_id, profile_status_id)
SELECT 
    u.id, 
    (SELECT id FROM lookup_values WHERE code = 'freelancer' LIMIT 1),
    'سارة أحمد - مصممة',
    'تصميم داخلي',
    (SELECT id FROM cities WHERE name_en = 'Riyadh' LIMIT 1),
    200 -- Pending
FROM users u WHERE email = 'provider3@example.com'
ON CONFLICT DO NOTHING;


-- 3. Seed Services
INSERT INTO services (name_ar, name_en, description, base_price, is_active)
VALUES
    ('دراسة جدوى اقتصادية', 'Feasibility Study', 'دراسة شاملة للمشروع', 1500.00, TRUE),
    ('تصميم هوية بصرية', 'Brand Identity Design', 'تصميم شعار ومطبوعات', 3000.00, TRUE),
    ('استشارة قانونية', 'Legal Consultation', 'استشارة لمدة ساعة', 500.00, TRUE)
ON CONFLICT DO NOTHING;

-- 4. Seed Requests (Mix of statuses)
DO $$
DECLARE
    req1_id UUID;
    req2_id UUID;
    serv1_id UUID;
    serv2_id UUID;
    city_id INT;
BEGIN
    SELECT id INTO req1_id FROM requesters WHERE name = 'Requester Demo Company' LIMIT 1; -- From 010
    IF req1_id IS NULL THEN SELECT id INTO req1_id FROM requesters LIMIT 1; END IF;
    
    SELECT id INTO req2_id FROM requesters WHERE name = 'شركة الأفق البعيد' LIMIT 1;
    IF req2_id IS NULL THEN SELECT id INTO req2_id FROM requesters LIMIT 1; END IF;

    SELECT id INTO serv1_id FROM services WHERE name_en = 'Feasibility Study' LIMIT 1;
    SELECT id INTO serv2_id FROM services WHERE name_en = 'Brand Identity Design' LIMIT 1;
    SELECT id INTO city_id FROM cities WHERE name_en = 'Riyadh' LIMIT 1;

    -- New Request (Pending - 7)
    INSERT INTO requests (requester_id, service_id, city_id, title, description, status_id)
    VALUES (req1_id, serv1_id, city_id, 'طلب دراسة جدوى لمطعم', 'نرغب في دراسة جدوى لمطعم مأكولات شعبية', 7);

    -- Priced Request (8)
    INSERT INTO requests (requester_id, service_id, city_id, title, description, status_id)
    VALUES (req2_id, serv2_id, city_id, 'تصميم شعار شركة تقنية', 'شركة ناشئة في مجال الذكاء الاصطناعي', 8);

    -- Waiting Payment (21)
    INSERT INTO requests (requester_id, service_id, city_id, title, description, status_id)
    VALUES (req1_id, serv2_id, city_id, 'هوية بصرية كاملة', 'نحتاج هوية بصرية متكاملة', 21);

    -- Completed Request (11)
    INSERT INTO requests (requester_id, service_id, city_id, title, description, status_id)
    VALUES (req2_id, serv1_id, city_id, 'دراسة سوق القهوة', 'تم الانتهاء منها سابقا', 11);

END $$;

-- 5. Seed Orders (Projects)
DO $$
DECLARE
    req_id UUID;
    prov_id UUID;
    request_id UUID;
BEGIN
    SELECT id INTO req_id FROM requests WHERE status_id = 11 LIMIT 1; -- Use the completed request for a completed order
    SELECT id INTO prov_id FROM providers WHERE name = 'Provider Demo Office' LIMIT 1;
    IF prov_id IS NULL THEN SELECT id INTO prov_id FROM providers LIMIT 1; END IF;
    
    -- Insert Order for Completed Request
    IF req_id IS NOT NULL THEN
        INSERT INTO orders (request_id, provider_id, order_title, order_status_id, start_date, completed_at)
        VALUES (req_id, prov_id, 'مشروع دراسة سوق القهوة', 15, NOW() - INTERVAL '1 month', NOW()) -- 15: Completed
        ON CONFLICT DO NOTHING;
    END IF;

    -- Create a fake request for ongoing order
    INSERT INTO requests (requester_id, service_id, city_id, title, status_id)
    SELECT id, (SELECT id FROM services LIMIT 1), (SELECT id FROM cities LIMIT 1), 'طلب لمشروع قائم', 9 -- Accepted
    FROM requesters LIMIT 1
    RETURNING id INTO request_id;

    INSERT INTO orders (request_id, provider_id, order_title, order_status_id, start_date)
    VALUES (request_id, prov_id, 'مشروع تطوير تطبيق', 13, NOW()) -- 13: In Progress
    ON CONFLICT DO NOTHING;

    -- Waiting Approval Order
    INSERT INTO requests (requester_id, service_id, city_id, title, status_id)
    SELECT id, (SELECT id FROM services LIMIT 1), (SELECT id FROM cities LIMIT 1), 'طلب بانتظار الموافقة', 9
    FROM requesters LIMIT 1
    RETURNING id INTO request_id;

    INSERT INTO orders (request_id, provider_id, order_title, order_status_id)
    VALUES (request_id, prov_id, 'مشروع تصميم داخلي', 17) -- 17: Waiting Approval
    ON CONFLICT DO NOTHING;
    
     -- Rejected Order
    INSERT INTO requests (requester_id, service_id, city_id, title, status_id)
    SELECT id, (SELECT id FROM services LIMIT 1), (SELECT id FROM cities LIMIT 1), 'طلب مرفوض', 10
    FROM requesters LIMIT 1
    RETURNING id INTO request_id;

    INSERT INTO orders (request_id, provider_id, order_title, order_status_id)
    VALUES (request_id, prov_id, 'مشروع ملغى', 19) -- 19: Rejected
    ON CONFLICT DO NOTHING;

END $$;
