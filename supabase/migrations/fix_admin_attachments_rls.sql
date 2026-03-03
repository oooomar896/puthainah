-- Add Admin RLS policies for attachments and payments tables
-- This allows admins to update attachment status when accepting/rejecting receipts

-- First, ensure the is_admin() function exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND LOWER(u.role) = 'admin'
  );
$$;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "admin update attachments" ON public.attachments;
CREATE POLICY "admin update attachments" 
ON public.attachments 
FOR UPDATE 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin insert attachments" ON public.attachments;
CREATE POLICY "admin insert attachments" 
ON public.attachments 
FOR INSERT 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin delete attachments" ON public.attachments;
CREATE POLICY "admin delete attachments" 
ON public.attachments 
FOR DELETE 
USING (public.is_admin());

DROP POLICY IF EXISTS "admin update payments" ON public.payments;
CREATE POLICY "admin update payments" 
ON public.payments 
FOR UPDATE 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin insert payments" ON public.payments;
CREATE POLICY "admin insert payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (public.is_admin());
