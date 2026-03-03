
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tqskjoufozgyactjnrix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpu' +
    'cml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTM0NywiZXhwIjoyMDgxOTg3MzQ3fQ.xRU624hUrN8FTprG-LDYBiRhfLYb1oxDn2Jo' +
    'woX3QtU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findRequest() {
    const { data } = await supabase
        .from('requests')
        .select('id, admin_price, status_id')
        .ilike('id', 'a8504930%');

    console.log(data);
}

findRequest();
