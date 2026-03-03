-- 020_rls_attachments_and_groups.sql
-- Enable RLS and add policies to restrict attachments and their groups to owners (auth.uid())

BEGIN;

-- Enable RLS on attachment_groups and attachments
ALTER TABLE IF EXISTS public.attachment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attachments ENABLE ROW LEVEL SECURITY;

-- Policy: allow authenticated users to insert groups only for themselves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'attachment_groups' AND p.polname = 'attachment_groups_insert_own'
  ) THEN
    EXECUTE 'CREATE POLICY attachment_groups_insert_own ON public.attachment_groups FOR INSERT WITH CHECK (created_by_user_id = auth.uid())';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'attachment_groups' AND p.polname = 'attachment_groups_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY attachment_groups_select_own ON public.attachment_groups FOR SELECT USING (created_by_user_id = auth.uid())';
  END IF;
END
$$;

-- Policy: allow selecting groups if owner
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'attachments' AND p.polname = 'attachments_select_if_group_owner'
  ) THEN
    EXECUTE 'CREATE POLICY attachments_select_if_group_owner ON public.attachments FOR SELECT USING ((SELECT created_by_user_id FROM public.attachment_groups WHERE id = group_id) = auth.uid())';
  END IF;
END
$$;

-- Policy: allow admin users to select groups and attachments (Admin role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'attachment_groups' AND p.polname = 'attachment_groups_select_admin'
  ) THEN
    EXECUTE 'CREATE POLICY attachment_groups_select_admin ON public.attachment_groups FOR SELECT USING (get_user_role() = ''Admin'')';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'attachments' AND p.polname = 'attachments_select_admin'
  ) THEN
    EXECUTE 'CREATE POLICY attachments_select_admin ON public.attachments FOR SELECT USING (get_user_role() = ''Admin'')';
  END IF;
END
$$;

-- Policy: allow inserting attachments only when group belongs to auth.uid()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'attachments' AND p.polname = 'attachments_insert_if_group_owner'
  ) THEN
    -- Use group_id (the new row's column value) in the subquery instead of referencing "new" explicitly
    EXECUTE 'CREATE POLICY attachments_insert_if_group_owner ON public.attachments FOR INSERT WITH CHECK ((SELECT created_by_user_id FROM public.attachment_groups WHERE id = group_id) = auth.uid())';
  END IF;
END
$$;

-- Policy: allow admin users to UPDATE/DELETE attachments (Admin role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'attachments' AND p.polname = 'attachments_update_admin'
  ) THEN
    EXECUTE 'CREATE POLICY attachments_update_admin ON public.attachments FOR UPDATE USING (get_user_role() = ''Admin'') WITH CHECK (get_user_role() = ''Admin'')';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'attachments' AND p.polname = 'attachments_delete_admin'
  ) THEN
    EXECUTE 'CREATE POLICY attachments_delete_admin ON public.attachments FOR DELETE USING (get_user_role() = ''Admin'')';
  END IF;
END
$$;

COMMIT;
