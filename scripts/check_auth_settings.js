import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqskjoufozgyactjnrix.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpucml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTM0NywiZXhwIjoyMDgxOTg3MzQ3fQ.xRU624hUrN8FTprG-LDYBiRhfLYb1oxDn2JowoX3QtU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAuthSettings() {
  console.log('Checking Supabase Auth settings...');
  
  // Check if the user exists and is confirmed
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const user = users.find(u => u.email === 'rafrs2030@gmail.com');
  
  if (user) {
    console.log('User found:', {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      role: user.user_metadata?.role,
      is_blocked: user.user_metadata?.is_blocked,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata
    });
  } else {
    console.log('User not found');
  }

  // Check if user exists in public.users
  if (user) {
    console.log('Checking public.users table...');
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError) {
      console.error('Error checking public.users:', dbError);
    } else {
      console.log('User in public.users:', dbUser);
    }
  }
}

checkAuthSettings();
