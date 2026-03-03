-- 011_seed_demo_data_simple.sql
-- بيانات تجريبية مبسطة بدون CTEs معقدة

-- مستخدمون تجريبيون
INSERT INTO users (email, phone, password_hash, role, is_blocked)
VALUES
  ('admin@example.com',      '+966500000001', 'hashed-password-admin',      'Admin',     FALSE),
  ('requester@example.com',  '+966500000002', 'hashed-password-requester',  'Requester', FALSE),
  ('provider@example.com',   '+966500000003', 'hashed-password-provider',   'Provider',  FALSE)
ON CONFLICT (email) DO NOTHING;

-- requester تجريبي
INSERT INTO requesters (user_id, entity_type_id, name, commercial_reg_no, city_id, created_at, updated_at)
SELECT
  u.id AS user_id,
  lv.id AS entity_type_id,
  'Requester Demo Company' AS name,
  'CR-123456' AS commercial_reg_no,
  c.id AS city_id,
  NOW(), NOW()
FROM users u
JOIN lookup_types lt ON lt.code = 'requester-entity-types'
JOIN lookup_values lv ON lv.lookup_type_id = lt.id AND lv.code = 'company'
JOIN cities c ON c.name_en = 'Riyadh'
WHERE u.email = 'requester@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM requesters r WHERE r.user_id = u.id
  );

-- provider تجريبي
INSERT INTO providers (user_id, entity_type_id, name, specialization, city_id, avg_rate, created_at, updated_at)
SELECT
  u.id AS user_id,
  lv.id AS entity_type_id,
  'Provider Demo Office' AS name,
  'General Consulting' AS specialization,
  c.id AS city_id,
  0 AS avg_rate,
  NOW(), NOW()
FROM users u
JOIN lookup_types lt ON lt.code = 'provider-entity-types'
JOIN lookup_values lv ON lv.lookup_type_id = lt.id AND lv.code = 'consulting-office'
JOIN cities c ON c.name_en = 'Riyadh'
WHERE u.email = 'provider@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM providers p WHERE p.user_id = u.id
  );

-- admin تجريبي
INSERT INTO admins (user_id, display_name, created_at, updated_at)
SELECT
  u.id,
  'Main Admin',
  NOW(), NOW()
FROM users u
WHERE u.email = 'admin@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM admins a WHERE a.user_id = u.id
  );

-- خدمة تجريبية
INSERT INTO services (name_ar, name_en, description, base_price, is_active)
VALUES
  ('خدمة استشارية أساسية', 'Basic Consulting Service', 'خدمة استشارية تجريبية.', 500.00, TRUE)
ON CONFLICT DO NOTHING;

-- طلب (request) تجريبي
INSERT INTO requests (requester_id, service_id, city_id, title, description, status_id, created_at, updated_at)
SELECT
  r.id AS requester_id,
  s.id AS service_id,
  c.id AS city_id,
  'طلب استشارة تجريبي' AS title,
  'هذا الطلب تم إنشاؤه لأغراض الاختبار.' AS description,
  lv.id AS status_id,
  NOW(), NOW()
FROM requesters r
JOIN services s ON TRUE
JOIN cities c ON c.name_en = 'Riyadh'
JOIN lookup_types lt ON lt.code = 'request-status'
JOIN lookup_values lv ON lv.lookup_type_id = lt.id AND lv.code = 'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM requests WHERE title = 'طلب استشارة تجريبي'
)
LIMIT 1;

-- مشروع (order) تجريبي
INSERT INTO orders (request_id, provider_id, order_title, order_status_id, start_date, created_at, updated_at)
SELECT
  req.id AS request_id,
  p.id AS provider_id,
  'مشروع استشارة تجريبي' AS order_title,
  lv.id AS order_status_id,
  NOW() AS start_date,
  NOW(), NOW()
FROM requests req
JOIN providers p ON TRUE
JOIN lookup_types lt ON lt.code = 'order-status'
JOIN lookup_values lv ON lv.lookup_type_id = lt.id AND lv.code = 'in-progress'
WHERE req.title = 'طلب استشارة تجريبي'
  AND NOT EXISTS (
    SELECT 1 FROM orders WHERE order_title = 'مشروع استشارة تجريبي'
)
LIMIT 1;

-- --------------------------------------------------------------------
-- بيانات تجريبية إضافية لباقي الأقسام (تقييمات، تذاكر، إشعارات،
-- أسئلة شائعة، شركاء، عملاء، مدفوعات، ملف شخصي، ومرفقات)
-- --------------------------------------------------------------------

-- تقييم تجريبي للمشروع
INSERT INTO order_ratings (order_id, rated_by_user_id, rating_value, comment, created_at)
SELECT
  o.id AS order_id,
  u.id AS rated_by_user_id,
  5 AS rating_value,
  'تقييم تجريبي على المشروع.' AS comment,
  NOW()
FROM orders o
JOIN users u ON u.email = 'requester@example.com'
WHERE o.order_title = 'مشروع استشارة تجريبي'
  AND NOT EXISTS (
    SELECT 1 FROM order_ratings r WHERE r.order_id = o.id AND r.rated_by_user_id = u.id
  )
LIMIT 1;

-- تذكرة تجريبية
INSERT INTO tickets (user_id, related_order_id, title, description, status_id, created_at, updated_at)
SELECT
  u.id AS user_id,
  o.id AS related_order_id,
  'تذكرة دعم تجريبية' AS title,
  'هذه التذكرة أضيفت لأغراض الاختبار.' AS description,
  lv.id AS status_id,
  NOW(), NOW()
FROM users u
JOIN orders o ON o.order_title = 'مشروع استشارة تجريبي'
JOIN lookup_types lt ON lt.code = 'ticket-status'
JOIN lookup_values lv ON lv.lookup_type_id = lt.id AND lv.code = 'open'
WHERE u.email = 'requester@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM tickets t WHERE t.title = 'تذكرة دعم تجريبية'
  )
LIMIT 1;

-- إشعار تجريبي
INSERT INTO notifications (user_id, title, body, is_seen, created_at)
SELECT
  u.id AS user_id,
  'إشعار تجريبي' AS title,
  'تم إنشاء هذا الإشعار لأغراض الاختبار.' AS body,
  FALSE AS is_seen,
  NOW()
FROM users u
WHERE u.email = 'requester@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM notifications n WHERE n.title = 'إشعار تجريبي' AND n.user_id = u.id
  )
LIMIT 1;

-- سؤال شائع تجريبي
INSERT INTO faq_questions (question_ar, question_en, answer_ar, answer_en, is_active, created_at, updated_at)
VALUES
  (
    'كيف تعمل منصة باكورة أمل؟',
    'How does the Bacura Amal platform work?',
    'منصة باكورة أمل تتيح لطالبي الخدمة تقديم طلبات واستقبال العروض من مقدمي الخدمة.',
    'Bacura Amal allows requesters to submit service requests and receive offers from providers.',
    TRUE,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- شريك تجريبي
INSERT INTO partners (name, logo_url, website_url, description, is_active, created_at, updated_at)
VALUES
  (
    'Partner Demo',
    'https://via.placeholder.com/150x80.png?text=Partner+Logo',
    'https://example-partner.com',
    'شريك تجريبي لعرض شعار الشركاء.',
    TRUE,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- عميل تجريبي
INSERT INTO customers (name, logo_url, description, created_at, updated_at)
VALUES
  (
    'Customer Demo',
    'https://via.placeholder.com/150x80.png?text=Customer+Logo',
    'عميل تجريبي لعرض شعارات العملاء.',
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- ملف شخصي تجريبي للمستخدم requester
INSERT INTO profile_infos (user_id, bio, website_url, attachments_group_key, created_at, updated_at)
SELECT
  u.id AS user_id,
  'نبذة تجريبية عن المستخدم.' AS bio,
  'https://requester-demo.example.com' AS website_url,
  'profile-demo-attachments' AS attachments_group_key,
  NOW(), NOW()
FROM users u
WHERE u.email = 'requester@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM profile_infos p WHERE p.user_id = u.id
  )
LIMIT 1;

-- مجموعة مرفقات تجريبية + مرفق واحد
INSERT INTO attachment_groups (group_key, created_by_user_id, created_at)
SELECT
  'demo-attachments-group' AS group_key,
  u.id AS created_by_user_id,
  NOW()
FROM users u
WHERE u.email = 'admin@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM attachment_groups ag WHERE ag.group_key = 'demo-attachments-group'
  )
LIMIT 1;

INSERT INTO attachments (group_id, file_path, file_name, content_type, size_bytes, request_phase_lookup_id, created_at)
SELECT
  ag.id AS group_id,
  'public/demo/file.pdf' AS file_path,
  'file.pdf' AS file_name,
  'application/pdf' AS content_type,
  123456 AS size_bytes,
  lv.id AS request_phase_lookup_id,
  NOW()
FROM attachment_groups ag
JOIN lookup_types lt ON lt.code = 'request-phase'
JOIN lookup_values lv ON lv.lookup_type_id = lt.id AND lv.code = '700'
WHERE ag.group_key = 'demo-attachments-group'
  AND NOT EXISTS (
    SELECT 1 FROM attachments a WHERE a.group_id = ag.id
  )
LIMIT 1;

-- دفعة (Payment) تجريبية مرتبطة بالمشروع التجريبي
INSERT INTO payments (order_id, user_id, amount, currency, stripe_payment_intent_id, status, created_at, updated_at)
SELECT
  o.id AS order_id,
  u.id AS user_id,
  500.00 AS amount,
  'SAR' AS currency,
  'pi_demo_123456789' AS stripe_payment_intent_id,
  'succeeded' AS status,
  NOW(), NOW()
FROM orders o
JOIN users u ON u.email = 'requester@example.com'
WHERE o.order_title = 'مشروع استشارة تجريبي'
  AND NOT EXISTS (
    SELECT 1 FROM payments p WHERE p.order_id = o.id AND p.user_id = u.id
  )
LIMIT 1;


