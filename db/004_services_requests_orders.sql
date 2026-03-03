-- 004_services_requests_orders.sql
-- الخدمات (Services)، الطلبات (Requests)، والمشاريع/الأوامر (Orders)

CREATE TABLE IF NOT EXISTS services (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar         VARCHAR(255) NOT NULL,
    name_en         VARCHAR(255) NOT NULL,
    description     TEXT,
    base_price      NUMERIC(12,2),
    image_url       TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- الطلبات الأساسية (مرتبطة بـ /api/requests)
CREATE TABLE IF NOT EXISTS requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id        UUID NOT NULL REFERENCES requesters(id) ON DELETE RESTRICT,
    service_id          UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    city_id             INT REFERENCES cities(id),
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    status_id           INT NOT NULL REFERENCES lookup_values(id), -- request-status
    attachments_group_key   VARCHAR(100), -- لربط المرفقات بالطلب (اختياري)
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- الأوامر / المشاريع (مرتبطة بـ /api/orders)
CREATE TABLE IF NOT EXISTS orders (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id                  UUID NOT NULL REFERENCES requests(id) ON DELETE RESTRICT,
    provider_id                 UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
    order_title                 VARCHAR(255) NOT NULL,
    order_status_id             INT NOT NULL REFERENCES lookup_values(id), -- order-status
    start_date                  TIMESTAMPTZ,
    due_date                    TIMESTAMPTZ,
    completed_at                TIMESTAMPTZ,
    order_attachments_group_key VARCHAR(100), -- مرفقات المشروع
    requester_attachments_group_key VARCHAR(100), -- مرفقات طالب الخدمة
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


