// ============================================
// Simple Diagnostic Check
// File: simple-diagnostic.js
// ============================================

console.log('\n🔍 NOTIFICATION SYSTEM - SIMPLE DIAGNOSTIC');
console.log('═'.repeat(60));
console.log('');

let totalChecks = 0;
let passedChecks = 0;

// 1. Environment Variables
console.log('1️⃣  Environment Variables');
console.log('─'.repeat(60));

const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'ZOHO_SMTP_HOST',
    'ZOHO_SMTP_PORT',
    'ZOHO_SMTP_USER',
    'ZOHO_SMTP_PASS',
    'ZOHO_FROM_EMAIL'
];

for (const envVar of requiredEnvVars) {
    totalChecks++;
    const exists = !!process.env[envVar];
    if (exists) passedChecks++;

    const value = process.env[envVar];
    let display;

    if (envVar.includes('PASS') || envVar.includes('KEY')) {
        display = value ? '***' + value.slice(-4) : 'NOT SET';
    } else {
        display = value || 'NOT SET';
    }

    console.log(`   ${exists ? '✅' : '❌'} ${envVar}: ${display}`);
}
console.log('');

// 2. Required Files
console.log('2️⃣  Required Files');
console.log('─'.repeat(60));

import { existsSync } from 'fs';

const requiredFiles = [
    'src/services/emailService.js',
    'src/services/canSendEmail.js',
    'src/services/notificationService.js',
    'src/pages/NotificationSettings.jsx',
    'src/pages/NotificationSettings.css',
    'database/migrations/mvp_notification_system.sql',
    'workers/notificationWorker.js',
    'supabase/functions/send-order-notification/index.ts'
];

for (const file of requiredFiles) {
    totalChecks++;
    const exists = existsSync(file);
    if (exists) passedChecks++;
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
}
console.log('');

// 3. Package.json check
console.log('3️⃣  Dependencies');
console.log('─'.repeat(60));

try {
    const packageJson = await import('./package.json', { assert: { type: 'json' } });
    const deps = { ...packageJson.default.dependencies, ...packageJson.default.devDependencies };

    const requiredDeps = [
        'nodemailer',
        '@supabase/supabase-js'
    ];

    for (const dep of requiredDeps) {
        totalChecks++;
        const exists = !!deps[dep];
        if (exists) passedChecks++;
        console.log(`   ${exists ? '✅' : '❌'} ${dep}${exists ? ` (${deps[dep]})` : ''}`);
    }
} catch {
    console.log('   ⚠️  Could not read package.json');
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
    console.log('   1. Fix missing environment variables in .env');
    console.log('   2. Install missing dependencies: npm install');
    console.log('   3. Create missing files if needed');
    console.log('   4. Run this diagnostic again');
    console.log('');
} else {
    console.log('🎉 All basic checks passed!');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Execute SQL: database/migrations/mvp_notification_system.sql');
    console.log('   2. Test email: node test-email.js');
    console.log('   3. Read: docs/TESTING_AND_TROUBLESHOOTING.md');
    console.log('');
}

console.log('═'.repeat(60));
console.log('');
