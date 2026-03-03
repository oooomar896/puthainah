-- 005_attachments.sql
-- مجموعات المرفقات والمرفقات نفسها

CREATE TABLE IF NOT EXISTS attachment_groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_key       VARCHAR(100) UNIQUE NOT NULL,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attachments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id                UUID NOT NULL REFERENCES attachment_groups(id) ON DELETE CASCADE,
    file_path               TEXT NOT NULL, -- مسار الملف في التخزين
    file_name               VARCHAR(255) NOT NULL,
    content_type            VARCHAR(255),
    size_bytes              BIGINT,
    request_phase_lookup_id INT REFERENCES lookup_values(id), -- request-phase: 700/701/702/800/801/802
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


