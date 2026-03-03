
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tqskjoufozgyactjnrix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpu' +
    'cml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTM0NywiZXhwIjoyMDgxOTg3MzQ3fQ.xRU624hUrN8FTprG-LDYBiRhfLYb1oxDn2Jo' +
    'woX3QtU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFK() {
    await supabase.rpc('get_foreign_keys_for_table', { table_name: 'requests' });
    // If RPC doesn't exist, we can try direct query if policies allow, but usually standard info schema is accesssible

    // Alternative: Introspection query on information_schema
    // But standard supabase client doesn't do raw sql comfortably without rpc.

    // Let's just try to select with the join and see if it errors.
    const { error: testError } = await supabase
        .from('requests')
        .select('id, provider:providers!requests_provider_id_fkey(id,name)')
        .limit(1);

    console.log('Test Link 1 (explicit FK):', testError ? testError.message : 'Success');

    const { error: testError2 } = await supabase
        .from('requests')
        .select('id, provider:providers(id,name)')
        .limit(1);

    console.log('Test Link 2 (implicit):', testError2 ? testError2.message : 'Success');
}

checkFK();
