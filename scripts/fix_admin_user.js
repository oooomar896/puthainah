
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
        if (key && !(key in process.env)) {
          process.env[key] = value;
        }
      }
    }
  } catch {
    // ignore
  }
}

loadDotEnvFallback();

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const email = process.env.ADMIN_EMAIL || 'rafrs2030@gmail.com';
const password = process.env.ADMIN_PASSWORD || 'Admin@123';

async function fixUser() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in environment.');
    process.exit(1);
  }

  console.log(`Checking user: ${email}...`);

  // 1. Check if user exists in Auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  let user = users.find(u => u.email === email);

  if (user) {
    console.log(`User found (ID: ${user.id}). Updating password...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: password, email_confirm: true, user_metadata: { role: 'Admin' } }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
    } else {
      console.log('Password updated successfully.');
    }
  } else {
    console.log('User not found. Creating new user...');
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { role: 'Admin' }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }
    user = data.user;
    console.log(`User created successfully (ID: ${user.id}).`);
  }

  // 2. Ensure user exists in public.users
  if (user) {
    console.log('Checking public.users table...');
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking public.users:', dbError);
    }

    if (!dbUser) {
      console.log('User not found in public.users. Inserting...');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: email,
          role: 'Admin',
          is_blocked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting into public.users:', insertError);
      } else {
        console.log('User inserted into public.users successfully.');
      }
    } else {
      console.log('User exists in public.users. Updating role...');
      const { error: updateDbError } = await supabase
        .from('users')
        .update({ role: 'Admin', is_blocked: false })
        .eq('id', user.id);

      if (updateDbError) {
        console.error('Error updating public.users:', updateDbError);
      } else {
        console.log('User role updated in public.users successfully.');
      }
    }
  }
}

fixUser();
