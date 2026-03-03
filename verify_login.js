import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqskjoufozgyactjnrix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpucml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MTEzNDcsImV4cCI6MjA4MTk4NzM0N30.VT5LhCeBXskkYevGaDC5K-Yxht0yP1_7CGguYBRMVAI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyUserRoleFunction() {
  console.log('Verifying get_user_role RPC function...');
  
  // Use a random UUID to test the default fallback behavior
  const randomUserId = '00000000-0000-0000-0000-000000000000';
  
  try {
    const { data, error } = await supabase.rpc('get_user_role', { user_id: randomUserId });
    
    if (error) {
      console.error('RPC Error:', error);
    } else {
      console.log('RPC Success! Result:', data);
      if (data === 'Requester') {
        console.log('Verification PASSED: Function exists and returns default fallback "Requester".');
      } else {
        console.log('Verification Unexpected: Returned', data);
      }
    }
  } catch (err) {
    console.error('Script Error:', err);
  }
}

verifyUserRoleFunction();
