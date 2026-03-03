const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqskjoufozgyactjnrix.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpucml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTM0NywiZXhwIjoyMDgxOTg3MzQ3fQ.xRU624hUrN8FTprG-LDYBiRhfLYb1oxDn2JowoX3QtU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listTriggers() {
    console.log('Fetching triggers on auth.users...');
    // We can query information_schema.triggers through an RPC if allowed, 
    // or just try to execute some SQL if we have high enough privileges.
    // Since we don't have direct SQL access through supabase-js for system tables usually,
    // we can try to guess or use a diagnostic tool if the user has one.

    // Instead, let's just try to check if the columns exist in the tables.
    const tables = {
        requesters: ['commercial_reg_no', 'commercial_registeration', 'mobile'],
        providers: ['phone', 'commercial_registeration', 'specialization', 'profile_status_id']
    };

    for (const [table, columns] of Object.entries(tables)) {
        console.log(`\nChecking columns for ${table}:`);
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`Error: ${error.message}`);
            continue;
        }
        if (data && data.length > 0) {
            console.log(`Found columns: ${Object.keys(data[0]).join(', ')}`);
        } else {
            console.log('No data to check columns.');
        }
    }
}

listTriggers();
