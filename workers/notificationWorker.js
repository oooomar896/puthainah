// ============================================
// Automatic Notification Worker
// File: workers/notificationWorker.js
// ============================================

import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '../src/services/emailService.js';
import { canSendEmail } from '../src/services/canSendEmail.js';

// إنشاء Supabase client مع Service Role
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // مهم: استخدم Service Role Key
);

const BATCH_SIZE = 10; // عدد الإشعارات في كل دفعة
const POLL_INTERVAL = 5000; // كل 5 ثواني

/**
 * Worker رئيسي لمعالجة طابور الإشعارات
 */
class NotificationWorker {
    constructor() {
        this.isRunning = false;
        this.stats = {
            processed: 0,
            succeeded: 0,
            failed: 0,
            skipped: 0
        };
    }

    /**
     * بدء Worker
     */
    async start() {
        console.log('🚀 Starting Notification Worker...');
        console.log(`   Batch Size: ${BATCH_SIZE}`);
        console.log(`   Poll Interval: ${POLL_INTERVAL}ms`);
        console.log('');

        this.isRunning = true;

        // معالجة مستمرة
        while (this.isRunning) {
            try {
                await this.processBatch();
                await this.sleep(POLL_INTERVAL);
            } catch (error) {
                console.error('❌ Worker error:', error);
                await this.sleep(POLL_INTERVAL * 2); // انتظر أطول عند الخطأ
            }
        }
    }

    /**
     * إيقاف Worker
     */
    stop() {
        console.log('🛑 Stopping Notification Worker...');
        this.isRunning = false;
    }

    /**
     * معالجة دفعة من الإشعارات
     */
    async processBatch() {
        // جلب الإشعارات المعلقة
        const { data: notifications, error } = await supabase
            .from('notification_queue')
            .select('*')
            .eq('status', 'pending')
            .lt('attempts', 3) // أقل من 3 محاولات
            .order('priority', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(BATCH_SIZE);

        if (error) {
            console.error('❌ Error fetching notifications:', error);
            return;
        }

        if (!notifications || notifications.length === 0) {
            // لا توجد إشعارات معلقة
            return;
        }

        console.log(`📬 Processing ${notifications.length} notifications...`);

        // معالجة كل إشعار
        for (const notification of notifications) {
            await this.processNotification(notification);
        }

        this.printStats();
    }

    /**
     * معالجة إشعار واحد
     */
    async processNotification(notification) {
        try {
            this.stats.processed++;

            // تحديث الحالة إلى "processing"
            await supabase
                .from('notification_queue')
                .update({
                    status: 'processing',
                    updated_at: new Date().toISOString()
                })
                .eq('id', notification.id);

            // التحقق من التفضيلات
            const typeMapping = {
                'order_update': 'order_updates',
                'billing': 'billing_updates',
                'security_alert': 'security_alerts',
                'message': 'order_updates' // نعتبر الرسائل كتحديثات طلبات
            };

            const canSend = await canSendEmail(
                notification.user_id,
                typeMapping[notification.notification_type] || 'order_updates'
            );

            if (!canSend.allowed) {
                // تخطي الإرسال
                await this.markAsSkipped(notification.id, canSend.reason);
                this.stats.skipped++;
                console.log(`🔕 Skipped notification ${notification.id}: ${canSend.reason}`);
                return;
            }

            // جلب بريد المستخدم
            const { data: user } = await supabase
                .from('profiles')
                .select('email, display_name')
                .eq('id', notification.user_id)
                .single();

            if (!user?.email) {
                await this.markAsFailed(notification.id, 'User email not found');
                this.stats.failed++;
                return;
            }

            // إنشاء محتوى البريد
            const emailContent = this.generateEmailContent(notification, user.display_name);

            // إرسال البريد
            const result = await sendEmail({
                to: user.email,
                subject: emailContent.subject,
                html: emailContent.html
            });

            if (result.success) {
                // نجح الإرسال
                await this.markAsSent(notification.id, result.messageId);
                this.stats.succeeded++;
                console.log(`✅ Sent notification ${notification.id} to ${user.email}`);
            } else {
                // فشل الإرسال
                await this.markAsFailed(notification.id, result.error);
                this.stats.failed++;
                console.log(`❌ Failed notification ${notification.id}: ${result.error}`);
            }

        } catch (error) {
            console.error(`❌ Error processing notification ${notification.id}:`, error);
            await this.markAsFailed(notification.id, error.message);
            this.stats.failed++;
        }
    }

    /**
     * إنشاء محتوى البريد حسب النوع
     */
    generateEmailContent(notification, userName) {
        const data = notification.data;

        switch (notification.notification_type) {
            case 'order_update':
                return {
                    subject: notification.subject,
                    html: this.getOrderUpdateTemplate(data, userName)
                };

            case 'billing':
                return {
                    subject: notification.subject,
                    html: this.getBillingTemplate(data, userName)
                };

            case 'security_alert':
                return {
                    subject: notification.subject,
                    html: this.getSecurityTemplate(data, userName)
                };

            case 'message':
                return {
                    subject: notification.subject,
                    html: this.getMessageTemplate(data, userName)
                };

            default:
                return {
                    subject: notification.subject,
                    html: `<div dir="rtl"><p>${data.message || 'إشعار جديد'}</p></div>`
                };
        }
    }

    /**
     * قالب تحديث الطلب
     */
    getOrderUpdateTemplate(data, userName) {
        const statusEmojis = {
            'pending': '⏳',
            'in_progress': '🔄',
            'completed': '✅',
            'cancelled': '❌',
            'paid': '💰'
        };

        const emoji = statusEmojis[data.status] || '📦';

        return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .status-badge { display: inline-block; padding: 8px 16px; background: #f0f0f0; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} منصة باكورا</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${userName}</h2>
            <p>تم تحديث حالة طلبك <strong>#${data.order_id}</strong></p>
            <div class="status-badge">${emoji} ${data.status}</div>
            <p>${data.message}</p>
          </div>
          <div class="footer">
            <p>© 2026 منصة باكورا - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }

    /**
     * قالب الفواتير
     */
    getBillingTemplate(data, userName) {
        return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial; direction: rtl;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>💰 فاتورة جديدة</h2>
          <p>مرحباً ${userName}</p>
          <p>تم إصدار فاتورة جديدة بمبلغ <strong>${data.amount} ريال</strong></p>
          <p>رقم الفاتورة: ${data.invoice_id}</p>
        </div>
      </body>
      </html>
    `;
    }

    /**
     * قالب التنبيهات الأمنية
     */
    getSecurityTemplate(data, userName) {
        return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial; direction: rtl;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #FEF2F2; border: 2px solid #EF4444;">
          <h2 style="color: #DC2626;">⚠️ تنبيه أمني</h2>
          <p>مرحباً ${userName}</p>
          <p><strong>تم اكتشاف نشاط غير معتاد في حسابك</strong></p>
          <p>${data.message || 'يرجى مراجعة حسابك'}</p>
        </div>
      </body>
      </html>
    `;
    }

    /**
     * قالب الرسائل
     */
    getMessageTemplate(data, userName) {
        return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial; direction: rtl;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>💬 رسالة جديدة</h2>
          <p>مرحباً ${userName}</p>
          <p>لديك رسالة جديدة من <strong>${data.sender_name}</strong></p>
          <p style="background: #f9fafb; padding: 15px; border-radius: 8px;">${data.message_preview}</p>
        </div>
      </body>
      </html>
    `;
    }

    /**
     * تحديث الحالة إلى "sent"
     */
    async markAsSent(notificationId, messageId) {
        await supabase
            .from('notification_queue')
            .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                error_message: null
            })
            .eq('id', notificationId);

        // تسجيل في email_log أيضاً
        const { data: notification } = await supabase
            .from('notification_queue')
            .select('*')
            .eq('id', notificationId)
            .single();

        if (notification) {
            await supabase
                .from('email_log')
                .insert({
                    user_id: notification.user_id,
                    recipient_email: null, // سيتم ملؤه من profiles
                    type: notification.notification_type,
                    subject: notification.subject,
                    status: 'sent',
                    attempts: notification.attempts + 1,
                    provider_response: messageId
                });
        }
    }

    /**
     * تحديث الحالة إلى "failed"
     */
    async markAsFailed(notificationId, errorMessage) {
        const { data: notification } = await supabase
            .from('notification_queue')
            .select('attempts, max_attempts')
            .eq('id', notificationId)
            .single();

        const newAttempts = (notification?.attempts || 0) + 1;
        const isFinalFailure = newAttempts >= (notification?.max_attempts || 3);

        await supabase
            .from('notification_queue')
            .update({
                status: isFinalFailure ? 'failed' : 'pending', // إعادة للطابور إذا لم تنته المحاولات
                attempts: newAttempts,
                error_message: errorMessage,
                updated_at: new Date().toISOString()
            })
            .eq('id', notificationId);
    }

    /**
     * تحديث الحالة إلى "skipped"
     */
    async markAsSkipped(notificationId, reason) {
        await supabase
            .from('notification_queue')
            .update({
                status: 'sent', // نعتبرها مرسلة لأنها تم معالجتها
                error_message: `Skipped: ${reason}`,
                updated_at: new Date().toISOString()
            })
            .eq('id', notificationId);
    }

    /**
     * طباعة الإحصائيات
     */
    printStats() {
        console.log('');
        console.log('📊 Stats:');
        console.log(`   Processed: ${this.stats.processed}`);
        console.log(`   Succeeded: ${this.stats.succeeded}`);
        console.log(`   Failed: ${this.stats.failed}`);
        console.log(`   Skipped: ${this.stats.skipped}`);
        console.log('');
    }

    /**
     * انتظار
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================
// تشغيل Worker
// ============================================

const worker = new NotificationWorker();

// معالجة إشارات الإيقاف
process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    worker.stop();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received');
    worker.stop();
    process.exit(0);
});

// بدء Worker
worker.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

export default NotificationWorker;
