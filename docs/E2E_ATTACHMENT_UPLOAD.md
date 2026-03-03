# E2E Attachment Upload Test ✅

This document explains how to run the end-to-end test for the attachment upload flow.

## Purpose
- Create a test user (via service role)
- Upload a small file to the `attachments` storage bucket
- Insert a record in `attachment_groups` and `attachments` (via authenticated client)
- Verify file exists in storage and row exists in DB
- Clean up all test artifacts (storage object, DB rows, test user)

## Requirements
- Environment variables set locally (or a `.env` file at repo root):
  - SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
  - SUPABASE_SERVICE_ROLE_KEY
  - SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - Optional: E2E_ATTACHMENTS_BUCKET (defaults to `attachments`)
- Ensure the `attachments` bucket exists in the Supabase project
- Ensure migrations that add RLS and schema changes (018/019/020) are applied

## How to run
1. Ensure the required env vars are present in your shell or in `.env`.
   - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY
   - (Optional) E2E_ATTACHMENTS_BUCKET (defaults to `attachments`)
   - (Optional) APP_URL (defaults to `http://localhost:3000`) — if your dev server runs elsewhere, set this.

2. Run the Node-based test (quick check):

   node ./scripts/test_e2e_upload.mjs

3. Run the Playwright UI E2E test (covers real browser flow):

   - Install Playwright locally if you don't already have it:

     npm i -D @playwright/test && npx playwright install

   - Run the dev server locally (e.g. `npm run dev`) so the UI is available at `APP_URL` (default `http://localhost:3000`).

   - Run the Playwright test:

     npm run test:e2e:ui

The Playwright test will create a test user, sign in via the UI, navigate to a request page, upload a receipt using the file input, verify that an attachment row was created and that the file was saved to storage, then clean up all test artifacts.

Notes:
- The test expects the `attachments` bucket to exist and RLS/migrations to be applied (018/019/020).
- If your app is localized, the Playwright test looks for both Arabic and English text for the submit button.

## Notes
- If your bucket is private, the script still attempts a client-side upload as an authenticated user; if the bucket policy forbids this, the upload will fail and the script reports the error.
- The script uses the admin (service role) client only for creating/deleting the test user and for cleanup checks; the actual insertion into `attachments` uses the authenticated user client to validate RLS.
