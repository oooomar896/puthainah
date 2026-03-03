-- 023_receipt_approval.sql
-- Add receipt approval fields and update assign-provider policy to require approval

BEGIN;

-- Add columns to requests
ALTER TABLE IF EXISTS public.requests
  ADD COLUMN IF NOT EXISTS receipt_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS receipt_approved_at TIMESTAMP WITH TIME ZONE NULL;

-- Index (optional) to speed up queries filtering on approval
CREATE INDEX IF NOT EXISTS idx_requests_receipt_approved ON public.requests (receipt_approved);

-- Update RLS policy: ensure admin can only assign provider when receipt_approved = true
DO $$
BEGIN
  -- Drop old policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'requests' AND p.polname = 'requests_assign_provider_admin'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS requests_assign_provider_admin ON public.requests';
  END IF;

  -- Create new policy that requires receipt_approved = true
  EXECUTE 'CREATE POLICY requests_assign_provider_admin ON public.requests FOR UPDATE USING (get_user_role() = ''Admin'' AND receipt_approved = true) WITH CHECK (get_user_role() = ''Admin'' AND receipt_approved = true)';
END
$$;

COMMIT;
