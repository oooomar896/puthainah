-- Add image_url column to services table via MCP/Supabase migration
-- This migration is idempotent and safe to run multiple times

BEGIN;

ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS image_url TEXT NULL;

COMMENT ON COLUMN public.services.image_url IS 'Public image URL for service card display';

COMMIT;

