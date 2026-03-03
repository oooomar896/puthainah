-- 008_payments_profile.sql
-- المدفوعات ومعلومات الملف الشخصي

CREATE TABLE IF NOT EXISTS payments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount                  NUMERIC(12,2) NOT NULL,
    currency                VARCHAR(10) NOT NULL DEFAULT 'SAR',
    stripe_payment_intent_id TEXT,
    status                  VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_infos (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio                     TEXT,
    website_url             TEXT,
    attachments_group_key   VARCHAR(100),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


