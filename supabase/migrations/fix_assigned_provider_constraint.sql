-- Fix: Remove incorrect foreign key constraint
-- The constraint 'requests_assigned_provider_fkey' incorrectly references 'profiles' table
-- We already have the correct constraint 'requests_assigned_provider_id_fkey' referencing 'providers'

-- Drop the incorrect constraint
ALTER TABLE requests 
DROP CONSTRAINT IF EXISTS requests_assigned_provider_fkey;

-- Verify the correct constraint exists
-- This should show only the correct constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'requests'
  AND kcu.column_name LIKE '%provider%';
