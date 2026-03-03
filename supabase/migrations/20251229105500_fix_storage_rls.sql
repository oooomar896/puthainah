-- Enable RLS on tables (ensure they are enabled)
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachment_groups ENABLE ROW LEVEL SECURITY;

-- 1. Storage Policies (for 'attachments' bucket)
-- Allow authenticated users to upload files
DROP POLICY IF EXISTS "Allow authenticated uploads to attachments bucket" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to attachments bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'attachments' );

-- Allow authenticated users to view files
DROP POLICY IF EXISTS "Allow authenticated view of attachments bucket" ON storage.objects;
CREATE POLICY "Allow authenticated view of attachments bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING ( bucket_id = 'attachments' );

-- 2. Attachment Groups Policies
-- Allow users to view groups they created OR find groups by key (if we want to be permissive for the upload flow)
-- Since the frontend searches by group_key, we need to allow SELECT based on that or ownership.
-- However, at the point of upload, the user might just have the key. 
-- But `create_attachment_group_key` sets `created_by_user_id` to `auth.uid()`.
DROP POLICY IF EXISTS "Allow users to view own attachment groups" ON public.attachment_groups;
CREATE POLICY "Allow users to view own attachment groups"
ON public.attachment_groups
FOR SELECT
TO authenticated
USING ( created_by_user_id = auth.uid() );

-- 3. Attachments Table Policies
-- Allow authenticated users to insert records
DROP POLICY IF EXISTS "Allow authenticated insert to attachments table" ON public.attachments;
CREATE POLICY "Allow authenticated insert to attachments table"
ON public.attachments
FOR INSERT
TO authenticated
WITH CHECK ( true );

-- Allow users to view their own attachments
DROP POLICY IF EXISTS "Allow users to view own attachments" ON public.attachments;
CREATE POLICY "Allow users to view own attachments"
ON public.attachments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.attachment_groups ag
        WHERE ag.id = attachments.group_id
        AND ag.created_by_user_id = auth.uid()
    )
);
