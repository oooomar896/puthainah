-- 001_core_users.sql
-- الجداول الأساسية للمستخدمين والتوكنات

-- يفضَّل تنفيذ هذا الملف أولاً

-- امتداد لتوليد UUID عشوائي
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- جدول المستخدمين الأساسي
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(50),
    password_hash   TEXT NOT NULL,
    role            VARCHAR(50) NOT NULL, -- Admin / Requester / Provider
    is_blocked      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- توكنات التحديث (اختياري للتوافق مع JWT + refresh)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT UNIQUE NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


