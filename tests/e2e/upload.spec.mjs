import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// This test requires a running dev server (APP_URL) and Supabase env vars
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET = process.env.E2E_ATTACHMENTS_BUCKET || 'attachments';

if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
  throw new Error('Missing Supabase environment variables for E2E test. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_ANON_KEY');
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

test.setTimeout(60_000);

async function createTestUser(email, password) {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role: 'Requester' } });
  if (error) {
    if ((error.message || '').includes('User already exists')) {
      const { data: u } = await admin.from('users').select('id,email').eq('email', email).maybeSingle();
      if (u) return { id: u.id, email };
      const { data: list } = await admin.auth.admin.listUsers();
      const found = list.users.find((x) => x.email === email);
      if (found) return { id: found.id, email };
      throw error;
    }
    throw error;
  }
  return { id: data.user.id, email };
}

async function findRequesterId(userId) {
  const { data, error } = await admin.from('requesters').select('id').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (data?.id) return data.id;
  // If missing, create a minimal requester row
  const { data: ins } = await admin.from('requesters').insert({ user_id: userId, entity_type_id: 1, name: 'E2E Requester' }).select('id').maybeSingle();
  return ins.id;
}

async function findOrCreateService() {
  const { data } = await admin.from('services').select('id').limit(1).maybeSingle();
  if (data?.id) return data.id;
  const { data: ins } = await admin.from('services').insert({ name_ar: 'E2E', name_en: 'E2E Service', base_price: 10 }).select('id').maybeSingle();
  return ins.id;
}

test('UI receipt upload flow (Playwright)', async ({ page }) => {
  const timestamp = Date.now();
  const email = `e2e-ui+${timestamp}@example.com`;
  const password = 'Test@1234!';

  let user;
  try {
    user = await createTestUser(email, password);
  } catch (e) {
    test.fail();
    throw e;
  }

  const userId = user.id;

  // Ensure requester exists
  const requesterId = await findRequesterId(userId);
  const serviceId = await findOrCreateService();

  // Create request with admin price and accepted flag so PaymentOptions shows
  const { data: reqData, error: reqErr } = await admin.from('requests').insert({ requester_id: requesterId, service_id: serviceId, title: 'E2E UI Test Request', description: 'Created by Playwright test', admin_price: 9.5, requester_accepted_price: true, payment_status: 'pending' }).select('id').maybeSingle();
  if (reqErr) {
    // cleanup user
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    throw reqErr;
  }
  const requestId = reqData.id;

  try {
    // Sign in via UI
    await page.goto(`${APP_URL}/login`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await Promise.all([
      page.waitForNavigation({ url: '**', waitUntil: 'networkidle' }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);

    // Navigate to the request page
    await page.goto(`${APP_URL}/requests/${requestId}`);

    // Wait for the payment receipt input to appear
    await page.waitForSelector('#payment-receipt', { state: 'visible', timeout: 10_000 });

    // Attach file
    const fixturePath = path.resolve(process.cwd(), 'scripts', 'fixtures', 'e2e-receipt.txt');
    await page.setInputFiles('#payment-receipt', fixturePath);

    // Ensure filename appears
    await expect(page.locator(`text=e2e-receipt.txt`)).toBeVisible({ timeout: 5000 });

    // Click submit (try both languages)
    const submitLocator = page.locator('button', { hasText: /إرسال|Submit/ });
    await submitLocator.click();

    // Wait for DB insert (attachments row) — poll
    let attachmentRow = null;
    const start = Date.now();
    while (Date.now() - start < 20_000) {
      const { data: att } = await admin.from('attachments').select('id,file_name,group_id').eq('file_name', 'e2e-receipt.txt').maybeSingle();
      if (att && att.id) {
        attachmentRow = att;
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    expect(attachmentRow, 'Attachment row should be created by the client flow').toBeTruthy();

    // Verify file exists in storage
    const listRes = await admin.storage.from(BUCKET).list(`attachments/${attachmentRow.group_id}`);
    expect(Array.isArray(listRes.data) && listRes.data.some(f => f.name === 'e2e-receipt.txt')).toBeTruthy();

  } finally {
    // Cleanup
    try { if (requestId) await admin.from('requests').delete().eq('id', requestId); } catch (e) {}
    try { if (userId) await admin.auth.admin.deleteUser(userId); } catch (e) {}
    try {
      const { data: attachments } = await admin.from('attachments').select('id,file_name,file_path').eq('file_name', 'e2e-receipt.txt');
      if (attachments && attachments.length) {
        for (const a of attachments) {
          try { await admin.from('attachments').delete().eq('id', a.id); } catch (e) {}
          try { if (a.file_path) await admin.storage.from(BUCKET).remove([a.file_path]); } catch (e) {}
        }
      }
    } catch (e) {}
  }
});
