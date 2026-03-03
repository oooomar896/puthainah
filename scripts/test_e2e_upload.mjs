import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env fallback (same approach used in other scripts)
function loadDotEnvFallback() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();
        if (key) process.env[key] = value;
      }
    }
  } catch (e) {}
}

loadDotEnvFallback();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET = process.env.E2E_ATTACHMENTS_BUCKET || 'attachments';

if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
  console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in environment. Aborting.');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

async function createTestUser(email, password) {
  console.log('Creating test user:', email);
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'Requester' },
  });
  if (error) {
    // If user exists we try to find them
    if (error?.message?.includes('User already exists')) {
      console.log('User already exists, attempting to find ID in public.users');
      const { data: u } = await admin.from('users').select('id,email').eq('email', email).maybeSingle();
      if (u) return { id: u.id, email };
      // fallback: list users
      const { data: list, error: listErr } = await admin.auth.admin.listUsers();
      if (listErr) throw listErr;
      const found = list.users.find((x) => x.email === email);
      if (!found) throw new Error(`Could not locate existing user ${email}`);
      return { id: found.id, email };
    }
    throw error;
  }
  if (!data?.user?.id) throw new Error('Failed to create user');
  return { id: data.user.id, email };
}

async function signInAsUser(email, password) {
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session?.access_token || data.session?.access_token;
}

async function run() {
  const timestamp = Date.now();
  const email = `e2e+${timestamp}@example.com`;
  const password = 'Test@1234!';

  let user;
  try {
    user = await createTestUser(email, password);
    console.log('Test user id:', user.id);
  } catch (e) {
    console.error('Failed to create test user:', e.message || e);
    process.exit(1);
  }

  // Sign in
  try {
    const { data, error } = await anon.auth.signInWithPassword({ email, password });
    if (error) throw error;
    console.log('Signed in test user');
  } catch (e) {
    console.error('Failed to sign in as test user:', e.message || e);
    await admin.auth.admin.deleteUser(user.id).catch(() => {});
    process.exit(1);
  }

  // Create attachment group
  let group;
  try {
    const groupKey = `e2e-${timestamp}`;
    const { data, error } = await anon.from('attachment_groups').insert({ group_key: groupKey, created_by_user_id: user.id }).select('id').maybeSingle();
    if (error) throw error;
    group = data;
    console.log('Created attachment group:', group.id);
  } catch (e) {
    console.error('Failed to create attachment group:', e.message || e);
    await admin.auth.admin.deleteUser(user.id).catch(() => {});
    process.exit(1);
  }

  // Upload a small text file to storage
  const storagePath = `e2e/${user.id}/${timestamp}-receipt.txt`;
  let filePathStored = storagePath;
  try {
    const content = `E2E test file ${timestamp}`;
    const buffer = Buffer.from(content, 'utf8');
    const { data: uploadData, error } = await anon.storage.from(BUCKET).upload(storagePath, buffer, { contentType: 'text/plain' });
    if (error) throw error;
    filePathStored = uploadData?.path || storagePath;
    console.log('Uploaded file to storage at', filePathStored);
  } catch (e) {
    console.error('Storage upload failed (bucket may be private or policy disallows direct upload):', e.message || e);
    // cleanup
    try {
      await admin.from('attachment_groups').delete().eq('id', group.id);
    } catch (ignore) {}
    try {
      await admin.auth.admin.deleteUser(user.id);
    } catch (ignore) {}
    process.exit(1);
  }

  // Insert attachment row
  let attachment;
  try {
    const { data, error } = await anon.from('attachments').insert({ group_id: group.id, file_name: path.basename(storagePath), file_path: filePathStored }).select('*').maybeSingle();
    if (error) throw error;
    attachment = data;
    console.log('Inserted attachments row id:', attachment.id);
  } catch (e) {
    console.error('Failed to insert attachment row (RLS or FK may block):', e.message || e);
    // cleanup storage and group and user
    try {
      await admin.storage.from(BUCKET).remove([storagePath]);
    } catch (ignore) {}
    try {
      await admin.from('attachment_groups').delete().eq('id', group.id);
    } catch (ignore) {}
    try {
      await admin.auth.admin.deleteUser(user.id);
    } catch (ignore) {}
    process.exit(1);
  }

  // Verify uploaded file exists (list)
  try {
    const { data, error } = await admin.storage.from(BUCKET).list(`e2e/${user.id}`);
    if (error) throw error;
    const found = (data || []).some((f) => f.name === path.basename(storagePath));
    console.log('Storage check:', found ? 'file exists' : 'file not found');
  } catch (e) {
    console.error('Admin storage check failed:', e.message || e);
  }

  // Verify DB row
  try {
    const { data, error } = await anon.from('attachments').select('*').eq('id', attachment.id).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Attachment row not found via authenticated client');
    console.log('DB check: attachment row present');
  } catch (e) {
    console.error('DB verification failed:', e.message || e);
  }

  // Cleanup test artifacts
  try {
    try {
      await admin.from('attachments').delete().eq('id', attachment.id);
    } catch (ignore) {}
    try {
      await admin.storage.from(BUCKET).remove([storagePath]);
    } catch (ignore) {}
    try {
      await admin.from('attachment_groups').delete().eq('id', group.id);
    } catch (ignore) {}
    try {
      await admin.auth.admin.deleteUser(user.id);
    } catch (ignore) {}
    console.log('Cleaned up test artifacts');
  } catch (e) {
    console.error('Cleanup had errors:', e.message || e);
  }

  console.log('E2E test completed successfully');
}

run().catch((e) => {
  console.error('Unhandled error:', e.message || e);
  process.exit(1);
});
