-- ==========================================================
-- FORCE CONFIRM SCRIPT
-- RUN THIS TO FIX LOGIN "BAD REQUEST" / "EMAIL NOT CONFIRMED"
-- ==========================================================

-- 1. Force confirm ALL users who are currently unconfirmed
-- This allows you to login immediately with any existing account
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. Verify settings (Optional - just for output)
SELECT id, email, email_confirmed_at, raw_user_meta_data 
FROM auth.users 
WHERE raw_user_meta_data->>'role' = 'Requester'
ORDER BY created_at DESC 
LIMIT 5;
