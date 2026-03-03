-- 003_accounts.sql
-- حسابات طالبي الخدمة (Requesters)، مقدمي الخدمة (Providers)، والإداريين (Admins)

CREATE TABLE IF NOT EXISTS requesters (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    entity_type_id          INT NOT NULL REFERENCES lookup_values(id), -- requester-entity-types
    name                    VARCHAR(255) NOT NULL,
    commercial_reg_no       VARCHAR(100),
    city_id                 INT REFERENCES cities(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS providers (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    entity_type_id          INT NOT NULL REFERENCES lookup_values(id), -- provider-entity-types
    name                    VARCHAR(255) NOT NULL,
    specialization          VARCHAR(255),
    city_id                 INT REFERENCES cities(id),
    avg_rate                NUMERIC(3,2) DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name    VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


