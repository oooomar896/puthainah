-- 018_add_attachment_uploader_lookup_id.sql
-- Add attachment_uploader_lookup_id to attachments for tracking uploader type
-- This migration is idempotent (uses IF NOT EXISTS where supported)

BEGIN;

ALTER TABLE IF EXISTS public.attachments
  ADD COLUMN IF NOT EXISTS attachment_uploader_lookup_id INT;

-- Add foreign key constraint to lookup_values (nullable)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'attachments' AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'attachment_uploader_lookup_id'
    ) THEN
        ALTER TABLE public.attachments
        ADD CONSTRAINT attachments_attachment_uploader_fkey FOREIGN KEY (attachment_uploader_lookup_id)
        REFERENCES public.lookup_values(id) ON DELETE SET NULL;
    END IF;
END$$;

-- Add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_attachments_attachment_uploader_lookup_id ON public.attachments(attachment_uploader_lookup_id);

COMMIT;
