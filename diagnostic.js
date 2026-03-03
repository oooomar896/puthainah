// ============================================
// System Diagnostics
// File: diagnostic.js
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function runDiagnostics() {
    console.log('\n🔍 NOTIFICATION SYSTEM DIAGNOSTICS');
    console.log('═'.repeat(60));
    console.log('');

    let totalChecks = 0;
    let passedChecks = 0;

    // 1. Environment Variables
    console.log('1️⃣  Environment Variables');
    console.log('─'.repeat(60));

    const envVars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'ZOHO_SMTP_HOST',
        'ZOHO_SMTP_PORT',
        'ZOHO_SMTP_USER',
        'ZOHO_SMTP_PASS',
        'ZOHO_FROM_EMAIL'
    ];

    for (const envVar of envVars) {
        totalChecks++;
        const exists = !!process.env[envVar];
        if (exists) passedChecks++;

        const value = process.env[envVar];
        const display = envVar.includes('PASS') || envVar.includes('KEY')
            ? (value ? '***' + value.slice(-4) : 'NOT SET')
            : (value || 'NOT SET');

        console.log(`   ${exists ? '✅' : '❌'} ${envVar}: ${display}`);
    }
    console.log('');

    // 2. Supabase Connection
    console.log('2️⃣  Supabase Connection');
    console.log('─'.repeat(60));

    totalChecks++;
    try {
        const { error: countError } = await supabase.from('profiles').select('count').limit(1);
        if (!countError) {
            passedChecks++;
            console.log('   ✅ Connected to Supabase');
        } else {
            console.log('   ❌ Connection failed:', countError.message);
        }
    } catch (err) {
        console.log('   ❌ Connection error:', err.message);
    }
    console.log('');

    // 3. Database Tables
    console.log('3️⃣  Database Tables');
    console.log('─'.repeat(60));

    const tables = [
        'notification_preferences',
        'email_log',
        'in_app_notifications'
    ];

    for (const table of tables) {
        totalChecks++;
        try {
            const { error } = await supabase.from(table).select('count').limit(1);
            if (!error) {
                passedChecks++;
                console.log(`   ✅ ${table}`);
            } else {
                console.log(`   ❌ ${table}: ${error.message}`);
            }
        } catch (error) {
            console.log(`   ❌ ${table}: ${error.message}`);
        }
    }
    console.log('');

    // 4. RLS Policies
    console.log('4️⃣  RLS Policies');
    console.log('─'.repeat(60));

    const policiesCheck = [
        { table: 'notification_preferences', expected: 3 },
        { table: 'email_log', expected: 1 }
    ];

    for (const check of policiesCheck) {
        totalChecks++;
        try {
            const { data, error } = await supabase.rpc('get_policies', {
                table_name: check.table
            });

            if (!error && data && data.length >= check.expected) {
                passedChecks++;
                console.log(`   ✅ ${check.table}: ${data.length} policies`);
            } else {
                console.log(`   ⚠️  ${check.table}: Check manually in Supabase`);
            }
        } catch {
            console.log(`   ⚠️  ${check.table}: Unable to verify`);
        }
    }
    console.log('');

    // 5. Files Check
    console.log('5️⃣  Required Files');
    console.log('─'.repeat(60));

    const fs = await import('fs');
    const files = [
        'src/services/emailService.js',
        'src/services/canSendEmail.js',
        'src/services/notificationService.js',
        'src/pages/NotificationSettings.jsx',
        'database/migrations/mvp_notification_system.sql'
    ];

    for (const file of files) {
        totalChecks++;
        const exists = fs.existsSync(file);
        if (exists) passedChecks++;
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    }
    console.log('');

    // Summary
    console.log('═'.repeat(60));
    console.log('📊 SUMMARY');
    console.log('─'.repeat(60));

    const percentage = Math.round((passedChecks / totalChecks) * 100);
    const status = percentage === 100 ? '✅ EXCELLENT' :
        percentage >= 80 ? '⚠️  GOOD' :
            percentage >= 60 ? '⚠️  NEEDS WORK' :
                '❌ CRITICAL';

    console.log(`   Total Checks: ${totalChecks}`);
    console.log(`   Passed: ${passedChecks}`);
    console.log(`   Failed: ${totalChecks - passedChecks}`);
    console.log(`   Score: ${percentage}%`);
    console.log(`   Status: ${status}`);
    console.log('');

    if (percentage < 100) {
        console.log('💡 Next Steps:');
        console.log('   1. Fix failed checks above');
        console.log('   2. Read docs/TESTING_AND_TROUBLESHOOTING.md');
        console.log('   3. Run diagnostic.js again');
    } else {
        console.log('🎉 All checks passed! System ready to use.');
        console.log('   Next: Run test-email.js to send a test email');
    }

    console.log('═'.repeat(60));
    console.log('');
}

// Run diagnostics
runDiagnostics().catch(error => {
    console.error('\n💥 Fatal Error:');
    console.error(error);
    process.exit(1);
});
