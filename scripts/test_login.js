import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqskjoufozgyactjnrix.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpucml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTM0NywiZXhwIjoyMDgxOTg3MzQ3fQ.xRU624hUrN8FTprG-LDYBiRhfLYb1oxDn2JowoX3QtU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLogin() {
  console.log('Testing login with rafrs2030@gmail.com...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'rafrs2030@gmail.com',
    password: 'Admin@123'
  });

  if (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code
    });
  } else {
    console.log('Login successful:', {
      user: data.user,
      session: data.session ? 'Session created' : 'No session',
      access_token: data.session?.access_token ? 'Token exists' : 'No token'
    });
  }
}

testLogin();
