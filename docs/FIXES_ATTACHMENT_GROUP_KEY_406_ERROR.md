# Fixes for Attachment Group Key and 406 Error

## Issues Fixed

### 1. Missing RPC Function: `create_attachment_group_key`
**Problem**: The RPC function `create_attachment_group_key` was being called but didn't exist in the database, causing a 409 Conflict error.

**Solution**: Added the RPC function in `db/013_functions_and_triggers.sql` that:
- Generates a unique group key
- Checks if the authenticated user exists in `public.users` table
- Sets `created_by_user_id` to NULL if the user doesn't exist (handles foreign key constraint)
- Uses `SECURITY DEFINER` to bypass RLS for the insert operation

### 2. Foreign Key Constraint Violation
**Problem**: The function was trying to insert a record with `created_by_user_id` that referenced a user ID from `auth.uid()` that didn't exist in the `public.users` table.

**Solution**: The RPC function now checks if the user exists before setting `created_by_user_id`, and sets it to NULL if the user doesn't exist (which is allowed by the foreign key constraint `ON DELETE SET NULL`).

### 3. 406 Not Acceptable Error for Requesters Query
**Problem**: When querying `requesters` table with joins to `users` table, a 406 error occurred because RLS policies blocked access to the `users` table during the join.

**Solution**: Updated the RLS policy for `users` table in `db/015_rls_policies.sql` to allow reading users when they're referenced by `requesters`, `providers`, or `admins` tables. This enables joins to work properly while maintaining security.

### 4. Improved Error Handling
**Problem**: Error messages weren't specific enough to diagnose the foreign key constraint issue.

**Solution**: Enhanced error handling in `src/utils/attachmentUtils.js` to:
- Detect foreign key constraint violations (code 23503)
- Provide more specific error messages
- Attempt retry when appropriate

## Database Migration Status

✅ **All migrations have been applied successfully using Supabase MCP!**

The following migrations were applied:

1. **`create_attachment_group_key_function`** - Created the RPC function with proper security settings
2. **`fix_users_rls_policy_for_joins`** - Updated RLS policy to allow joins
3. **`fix_attachment_group_key_function_security`** - Fixed security warning by setting explicit search_path

### Migration Details

1. **RPC Function** (`create_attachment_group_key`):
   - Handles cases where user doesn't exist in `public.users` table
   - Uses `SECURITY DEFINER` with explicit `search_path = public` for security
   - Grants execute permissions to `authenticated` and `anon` roles

2. **RLS Policy Update**:
   - Updated "Admins can read all users" policy to allow reading users referenced by `requesters`, `providers`, or `admins` tables
   - Enables joins to work properly while maintaining security

## Testing

After applying the migrations, test:

1. **Attachment Group Key Creation**:
   - Try creating an attachment group key when logged in
   - Try creating an attachment group key when not logged in (should still work with NULL user_id)

2. **Requesters Query**:
   - As an admin, query requesters with joins to users table
   - Verify no 406 errors occur
   - Verify data is returned correctly

3. **Error Handling**:
   - Verify error messages are clear and helpful
   - Check console logs for detailed error information

## Notes

- The RPC function uses `SECURITY DEFINER` to bypass RLS, which is necessary for the function to insert records even when the user might not have direct access
- The foreign key constraint allows NULL values for `created_by_user_id`, so the function can work even when the user doesn't exist in `public.users`
- The RLS policy update allows joins to work while maintaining security by only allowing reading users that are referenced by other tables

