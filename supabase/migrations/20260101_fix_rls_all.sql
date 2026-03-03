-- =============================================
-- Migration: Fix All RLS Policies for Admin and General Access
-- This migration ensures that all tables are accessible by the Admin
-- and provides public/authenticated access as needed for the app to function.
-- =============================================

-- Disable RLS on all tables to ensure immediate data visibility for development
-- If security is needed later, specific policies can be added back.
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY;';
    END LOOP;
END $$;

-- Grant full permissions to all roles for all tables
-- This ensures the 'anon' and 'authenticated' roles can perform all operations.
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Ensure schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Re-enable RLS but with "Allow All" policies for every table
-- This is a "safe" way to keep RLS active but non-restrictive.
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        -- Re-enable RLS
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
        
        -- Drop any existing "Allow All" policies to avoid duplicates
        EXECUTE 'DROP POLICY IF EXISTS "Policy_Allow_All" ON public.' || quote_ident(r.tablename);
        
        -- Create a new policy that allows everything
        EXECUTE 'CREATE POLICY "Policy_Allow_All" ON public.' || quote_ident(r.tablename) || ' FOR ALL USING (true) WITH CHECK (true);';
    END LOOP;
END $$;
