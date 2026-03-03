const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRequestColumns() {
    try {
        // Get a sample request to see all columns
        const { data, error } = await supabase
            .from('requests')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error:', error);
            return;
        }

        if (data && data.length > 0) {
            console.log('Request table columns:', Object.keys(data[0]));
        } else {
            console.log('No requests found in the database');
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

checkRequestColumns();
