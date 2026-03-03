-- 010_seed_demo_data.sql
-- بيانات تجريبية (مستخدمون، طالبي خدمة، مقدمي خدمة، خدمات، طلبات، مشاريع)

-- إنشاء مستخدمين تجريبيين
INSERT INTO users (email, phone, password_hash, role, is_blocked)
VALUES
    ('admin@example.com', '+966500000001', 'hashed-password-admin', 'Admin', FALSE),
    ('requester@example.com', '+966500000002', 'hashed-password-requester', 'Requester', FALSE),
    ('provider@example.com', '+966500000003', 'hashed-password-provider', 'Provider', FALSE)
ON CONFLICT (email) DO NOTHING;

-- جلب معرفات المستخدمين
WITH u AS (
    SELECT
        (SELECT id FROM users WHERE email = 'admin@example.com')        AS admin_id,
        (SELECT id FROM users WHERE email = 'requester@example.com')   AS requester_user_id,
        (SELECT id FROM users WHERE email = 'provider@example.com')    AS provider_user_id
),
rt AS (
    SELECT lv.id AS requester_type_company_id
    FROM lookup_values lv
    JOIN lookup_types lt ON lt.id = lv.lookup_type_id
    WHERE lt.code = 'requester-entity-types' AND lv.code = 'company'
),
pt AS (
    SELECT lv.id AS provider_type_office_id
    FROM lookup_values lv
    JOIN lookup_types lt ON lt.id = lv.lookup_type_id
    WHERE lt.code = 'provider-entity-types' AND lv.code = 'consulting-office'
),
c AS (
    SELECT id AS city_id
    FROM cities
    WHERE name_en = 'Riyadh'
    LIMIT 1
)
-- إنشاء requester / provider / admin مرتبطين بالمستخدمين
INSERT INTO requesters (user_id, entity_type_id, name, commercial_reg_no, city_id, created_at, updated_at)
SELECT
    u.requester_user_id,
    rt.requester_type_company_id,
    'Requester Demo Company',
    'CR-123456',
    c.city_id,
    NOW(),
    NOW()
FROM u, rt, c
WHERE u.requester_user_id IS NOT NULL
  AND rt.requester_type_company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM requesters r WHERE r.user_id = u.requester_user_id
  );

INSERT INTO providers (user_id, entity_type_id, name, specialization, city_id, avg_rate, created_at, updated_at)
SELECT
    u.provider_user_id,
    pt.provider_type_office_id,
    'Provider Demo Office',
    'General Consulting',
    c.city_id,
    0,
    NOW(),
    NOW()
FROM u, pt, c
WHERE u.provider_user_id IS NOT NULL
  AND pt.provider_type_office_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM providers p WHERE p.user_id = u.provider_user_id
  );

INSERT INTO admins (user_id, display_name, created_at, updated_at)
SELECT
    u.admin_id,
    'Main Admin',
    NOW(),
    NOW()
FROM u
WHERE u.admin_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM admins a WHERE a.user_id = u.admin_id
  );

-- إنشاء خدمة تجريبية
INSERT INTO services (name_ar, name_en, description, base_price, is_active)
VALUES
    ('خدمة استشارية أساسية', 'Basic Consulting Service', 'خدمة استشارية تجريبية.', 500.00, TRUE)
ON CONFLICT DO NOTHING;

-- جلب معرفات requester / provider / service / statuses
WITH r AS (
    SELECT id AS requester_id FROM requesters LIMIT 1
),
p AS (
    SELECT id AS provider_id FROM providers LIMIT 1
),
s AS (
    SELECT id AS service_id FROM services LIMIT 1
),
rs AS (
    SELECT lv.id AS status_pending_id
    FROM lookup_values lv
    JOIN lookup_types lt ON lt.id = lv.lookup_type_id
    WHERE lt.code = 'request-status' AND lv.code = 'pending'
),
os AS (
    SELECT lv.id AS order_status_in_progress_id
    FROM lookup_values lv
    JOIN lookup_types lt ON lt.id = lv.lookup_type_id
    WHERE lt.code = 'order-status' AND lv.code = 'in-progress'
),
ct AS (
    SELECT id AS city_id FROM cities ORDER BY id LIMIT 1
)
-- إنشاء طلب (request) ومشروع (order) تجريبيين
INSERT INTO requests (requester_id, service_id, city_id, title, description, status_id, created_at, updated_at)
SELECT
    r.requester_id,
    s.service_id,
    ct.city_id,
    'طلب استشارة تجريبي',
    'هذا الطلب تم إنشاؤه لأغراض الاختبار.',
    rs.status_pending_id,
    NOW(),
    NOW()
FROM r, s, rs, ct
WHERE r.requester_id IS NOT NULL
  AND s.service_id IS NOT NULL
  AND rs.status_pending_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM requests WHERE title = 'طلب استشارة تجريبي'
  );

WITH req AS (
    SELECT id AS request_id FROM requests WHERE title = 'طلب استشارة تجريبي' LIMIT 1
),
prov AS (
    SELECT id AS provider_id FROM providers LIMIT 1
),
os AS (
    SELECT lv.id AS order_status_in_progress_id
    FROM lookup_values lv
    JOIN lookup_types lt ON lt.id = lv.lookup_type_id
    WHERE lt.code = 'order-status' AND lv.code = 'in-progress'
)
INSERT INTO orders (request_id, provider_id, order_title, order_status_id, start_date, created_at, updated_at)
SELECT
    req.request_id,
    prov.provider_id,
    'مشروع استشارة تجريبي',
    os.order_status_in_progress_id,
    NOW(),
    NOW(),
    NOW()
FROM req, prov, os
WHERE req.request_id IS NOT NULL
  AND prov.provider_id IS NOT NULL
  AND os.order_status_in_progress_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM orders WHERE order_title = 'مشروع استشارة تجريبي'
  );


