// ============================================
// PM2 Ecosystem Configuration
// File: ecosystem.config.js
// ============================================

module.exports = {
    apps: [
        {
            name: 'notification-worker',
            script: './workers/notificationWorker.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                POLL_INTERVAL: 5000
            },
            env_development: {
                NODE_ENV: 'development',
                POLL_INTERVAL: 10000
            },
            error_file: './logs/notification-worker-error.log',
            out_file: './logs/notification-worker-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            cron_restart: '0 3 * * *', // إعادة تشغيل يومياً الساعة 3 صباحاً
        },
        {
            name: 'bacura-web',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            error_file: './logs/web-error.log',
            out_file: './logs/web-out.log',
        }
    ]
};
