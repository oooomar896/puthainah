-- 021_allow_admin_view_attachments.sql
-- Allow Admin users and service_role to SELECT attachment_groups and attachments

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'attachment_groups' AND p.polname = 'attachment_groups_select_admin'
  ) THEN
    EXECUTE 'CREATE POLICY attachment_groups_select_admin ON public.attachment_groups FOR SELECT USING (created_by_user_id = auth.uid() OR auth.role() = ''service_role'' OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = ''Admin''))';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'attachments' AND p.polname = 'attachments_select_admin'
  ) THEN
    EXECUTE 'CREATE POLICY attachments_select_admin ON public.attachments FOR SELECT USING ((SELECT created_by_user_id FROM public.attachment_groups WHERE id = group_id) = auth.uid() OR auth.role() = ''service_role'' OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = ''Admin''))';
  END IF;
END
$$;

COMMIT;