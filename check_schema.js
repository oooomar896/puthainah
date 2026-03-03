const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqskjoufozgyactjnrix.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpucml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTM0NywiZXhwIjoyMDgxOTg3MzQ3fQ.xRU624hUrN8FTprG-LDYBiRhfLYb1oxDn2JowoX3QtU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    console.log('Checking tables...');
    const tables = ['users', 'profiles', 'requesters', 'providers', 'profile_infos'];

    for (const table of tables) {
        console.log(`\nTable: ${table}`);
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

        if (error) {
            console.error(`Error fetching ${table}:`, error.message);
            continue;
        }

        if (data && data.length > 0) {
            console.log('Columns:', Object.keys(data[0]).join(', '));
        } else {
            console.log('No data, but table exists.');
            // Try to get columns from rpc if available, or just assume it's empty but okay
        }
    }
}

checkSchema();
