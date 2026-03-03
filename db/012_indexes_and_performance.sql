-- 012_indexes_and_performance.sql
-- الفهارس (Indexes) لتحسين أداء الاستعلامات

-- ============================================
-- فهارس جدول users
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ============================================
-- فهارس جداول الحسابات
-- ============================================
CREATE INDEX IF NOT EXISTS idx_requesters_user_id ON requesters(user_id);
CREATE INDEX IF NOT EXISTS idx_requesters_city_id ON requesters(city_id);
CREATE INDEX IF NOT EXISTS idx_requesters_entity_type_id ON requesters(entity_type_id);

CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_city_id ON providers(city_id);
CREATE INDEX IF NOT EXISTS idx_providers_entity_type_id ON providers(entity_type_id);
CREATE INDEX IF NOT EXISTS idx_providers_avg_rate ON providers(avg_rate DESC);

CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);

-- ============================================
-- فهارس جداول الخدمات والطلبات
-- ============================================
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_name_ar ON services(name_ar);
CREATE INDEX IF NOT EXISTS idx_services_name_en ON services(name_en);

CREATE INDEX IF NOT EXISTS idx_requests_requester_id ON requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_service_id ON requests(service_id);
CREATE INDEX IF NOT EXISTS idx_requests_status_id ON requests(status_id);
CREATE INDEX IF NOT EXISTS idx_requests_city_id ON requests(city_id);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_attachments_group_key ON requests(attachments_group_key) WHERE attachments_group_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_request_id ON orders(request_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_id ON orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_id ON orders(order_status_id);
CREATE INDEX IF NOT EXISTS idx_orders_start_date ON orders(start_date);
CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date);
CREATE INDEX IF NOT EXISTS idx_orders_completed_at ON orders(completed_at);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- فهارس جداول المرفقات
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attachment_groups_group_key ON attachment_groups(group_key);
CREATE INDEX IF NOT EXISTS idx_attachment_groups_created_by_user_id ON attachment_groups(created_by_user_id);

CREATE INDEX IF NOT EXISTS idx_attachments_group_id ON attachments(group_id);
CREATE INDEX IF NOT EXISTS idx_attachments_request_phase_lookup_id ON attachments(request_phase_lookup_id);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON attachments(created_at DESC);

-- ============================================
-- فهارس جداول التقييمات والتذاكر
-- ============================================
CREATE INDEX IF NOT EXISTS idx_order_ratings_order_id ON order_ratings(order_id);
CREATE INDEX IF NOT EXISTS idx_order_ratings_rated_by_user_id ON order_ratings(rated_by_user_id);
CREATE INDEX IF NOT EXISTS idx_order_ratings_created_at ON order_ratings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_related_order_id ON tickets(related_order_id) WHERE related_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_status_id ON tickets(status_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_seen ON notifications(is_seen);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_seen ON notifications(user_id, is_seen, created_at DESC);

-- ============================================
-- فهارس جداول المدفوعات والملفات الشخصية
-- ============================================
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_infos_user_id ON profile_infos(user_id);

-- ============================================
-- فهارس جداول FAQs والشركاء
-- ============================================
CREATE INDEX IF NOT EXISTS idx_faq_questions_is_active ON faq_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_questions_created_at ON faq_questions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partners_is_active ON partners(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- ============================================
-- فهارس جداول Lookup
-- ============================================
CREATE INDEX IF NOT EXISTS idx_lookup_values_lookup_type_id ON lookup_values(lookup_type_id);
CREATE INDEX IF NOT EXISTS idx_lookup_values_code ON lookup_values(code);
CREATE INDEX IF NOT EXISTS idx_lookup_values_type_code ON lookup_values(lookup_type_id, code);

CREATE INDEX IF NOT EXISTS idx_cities_name_ar ON cities(name_ar);
CREATE INDEX IF NOT EXISTS idx_cities_name_en ON cities(name_en);

-- ============================================
-- فهارس مركبة للاستعلامات المعقدة
-- ============================================
-- فهرس مركب للبحث في الطلبات حسب الحالة والمستخدم
CREATE INDEX IF NOT EXISTS idx_requests_requester_status ON requests(requester_id, status_id, created_at DESC);

-- فهرس مركب للبحث في الأوامر حسب المزود والحالة
CREATE INDEX IF NOT EXISTS idx_orders_provider_status ON orders(provider_id, order_status_id, created_at DESC);

-- فهرس مركب للإشعارات غير المقروءة
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_seen, created_at DESC) WHERE is_seen = FALSE;

-- فهرس مركب للبحث في التقييمات حسب الطلب
CREATE INDEX IF NOT EXISTS idx_order_ratings_order_created ON order_ratings(order_id, created_at DESC);

