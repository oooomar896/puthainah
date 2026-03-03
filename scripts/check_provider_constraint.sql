-- Check existing foreign key constraints on requests table
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

-- If the constraint exists on wrong column, drop it
-- ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_assigned_provider_fkey;

-- Add correct foreign key constraint
-- ALTER TABLE requests 
-- ADD CONSTRAINT requests_assigned_provider_id_fkey 
-- FOREIGN KEY (assigned_provider_id) 
-- REFERENCES providers(id) 
-- ON DELETE SET NULL;
