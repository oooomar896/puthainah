// ============================================
// Notification Service - Complete Email Sending
// File: src/services/notificationService.js
// ============================================

import { supabase } from '../lib/supabaseClient.js';
import { canSendEmail } from './canSendEmail.js';
import { sendEmail } from './emailService.js';

/**
 * إرسال إشعار بريد إلكتروني كامل
 * @param {Object} params - معاملات الإشعار
 * @param {string} params.userId - معرف المستخدم
 * @param {string} params.type - نوع الإشعار
 * @param {string} params.subject - عنوان البريد
 * @param {string} params.htmlContent - محتوى HTML
 * @returns {Promise<Object>} - نتيجة الإرسال
 */
export async function sendNotification({ userId, type, subject, htmlContent }) {
    try {
        console.log('📧 Starting notification send process...');
        console.log('   User:', userId);
        console.log('   Type:', type);
        console.log('   Subject:', subject);

        // 1. التحقق من التفضيلات
        const canSend = await canSendEmail(userId, type);

        if (!canSend.allowed) {
            console.log('🔕 Email skipped:', canSend.reason);

            // تسجيل في email_log كـ "skipped"
            await logEmail({
                userId,
                type,
                subject,
                status: 'skipped',
                errorText: `Skipped: ${canSend.reason}`
            });

            return {
                success: false,
                reason: canSend.reason,
                skipped: true
            };
        }

        // 2. جلب بريد المستخدم
        const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('email, display_name')
            .eq('id', userId)
            .single();

        if (userError || !user?.email) {
            console.error('❌ User email not found:', userError);

            await logEmail({
                userId,
                type,
                subject,
                status: 'failed',
                errorText: 'User email not found'
            });

            return {
                success: false,
                reason: 'no_email',
                error: 'User email not found'
            };
        }

        console.log('📬 Sending to:', user.email);

        // 3. تسجيل في email_log كـ "queued"
        const { data: logEntry } = await logEmail({
            userId,
            recipientEmail: user.email,
            type,
            subject,
            status: 'queued'
        });

        // 4. إرسال البريد الإلكتروني
        const result = await sendEmail({
            to: user.email,
            subject,
            html: htmlContent
        });

        // 5. تحديث حالة السجل
        if (result.success) {
            await updateEmailLog(logEntry.id, {
                status: 'sent',
                sentAt: new Date().toISOString(),
                providerResponse: result.response,
                attempts: 1
            });

            console.log('✅ Email sent successfully!');

            return {
                success: true,
                messageId: result.messageId,
                logId: logEntry.id
            };
        } else {
            await updateEmailLog(logEntry.id, {
                status: 'failed',
                errorText: result.error,
                attempts: 1
            });

            console.error('❌ Email sending failed:', result.error);

            return {
                success: false,
                reason: 'send_failed',
                error: result.error,
                logId: logEntry.id
            };
        }

    } catch (error) {
        console.error('❌ Notification service error:', error);
        return {
            success: false,
            reason: 'exception',
            error: error.message
        };
    }
}

/**
 * تسجيل محاولة إرسال بريد
 */
async function logEmail({
    userId,
    recipientEmail = null,
    type,
    subject,
    status,
    errorText = null
}) {
    try {
        const { data, error } = await supabase
            .from('email_log')
            .insert({
                user_id: userId,
                recipient_email: recipientEmail,
                type,
                subject,
                status,
                error_text: errorText,
                attempts: 0
            })
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('❌ Error logging email:', error);
        return { data: null, error };
    }
}

/**
 * تحديث سجل البريد
 */
async function updateEmailLog(logId, updates) {
    try {
        const { error } = await supabase
            .from('email_log')
            .update({
                status: updates.status,
                sent_at: updates.sentAt || null,
                error_text: updates.errorText || null,
                provider_response: updates.providerResponse || null,
                attempts: updates.attempts || 1
            })
            .eq('id', logId);

        if (error) throw error;
    } catch (error) {
        console.error('❌ Error updating email log:', error);
    }
}

// ============================================
// دوال مساعدة لأنواع الإشعارات المختلفة
// ============================================

/**
 * إرسال إشعار تحديث الطلب
 */
export async function notifyOrderUpdate(userId, orderId, status, message) {
    const statusEmojis = {
        'pending': '⏳',
        'in_progress': '🔄',
        'completed': '✅',
        'cancelled': '❌',
        'paid': '💰'
    };

    const emoji = statusEmojis[status] || '📦';

    return await sendNotification({
        userId,
        type: 'order_updates',
        subject: `${emoji} تحديث الطلب #${orderId}`,
        htmlContent: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            direction: rtl; 
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content { 
            padding: 30px 20px; 
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: #f0f0f0;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666;
            font-size: 14px;
            border-top: 1px solid #eee;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} منصة باكورا</h1>
          </div>
          <div class="content">
            <h2>تحديث حالة الطلب</h2>
            <p>تم تحديث حالة طلبك <strong>#${orderId}</strong></p>
            <div class="status-badge">
              ${emoji} ${status}
            </div>
            <p>${message}</p>
            <a href="${process.env.FRONTEND_URL || 'https://bacuratec.com'}/orders/${orderId}" class="button">
              عرض تفاصيل الطلب
            </a>
          </div>
          <div class="footer">
            <p>© 2026 منصة باكورا - جميع الحقوق محفوظة</p>
            <p style="font-size: 12px; color: #999;">
              إذا كنت لا ترغب في استلام هذه الرسائل، يمكنك 
              <a href="${process.env.FRONTEND_URL || 'https://bacuratec.com'}/settings/notifications">
                تعديل إعدادات الإشعارات
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
    });
}

/**
 * إرسال إشعار فاتورة جديدة
 */
export async function notifyBilling(userId, amount, invoiceId) {
    return await sendNotification({
        userId,
        type: 'billing_updates',
        subject: `💰 فاتورة جديدة #${invoiceId}`,
        htmlContent: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; }
          .amount { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 فاتورة جديدة</h1>
          </div>
          <div class="content">
            <p>تم إصدار فاتورة جديدة لحسابك</p>
            <div class="amount">${amount} ريال</div>
            <p><strong>رقم الفاتورة:</strong> ${invoiceId}</p>
            <p>يرجى مراجعة الفاتورة وإتمام الدفع في أقرب وقت.</p>
          </div>
        </div>
      </body>
      </html>
    `
    });
}

/**
 * إرسال تنبيه أمني
 */
export async function notifySecurityAlert(userId, action, details) {
    return await sendNotification({
        userId,
        type: 'security_alerts',
        subject: '⚠️ تنبيه أمني - نشاط غير معتاد',
        htmlContent: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { background: #FEF2F2; padding: 20px; border: 2px solid #EF4444; }
          .warning { color: #DC2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ تنبيه أمني</h1>
          </div>
          <div class="content">
            <p class="warning">تم اكتشاف نشاط غير معتاد في حسابك</p>
            <p><strong>الإجراء:</strong> ${action}</p>
            <p><strong>التفاصيل:</strong> ${details}</p>
            <p><strong>الوقت:</strong> ${new Date().toLocaleString('ar-SA')}</p>
            <hr>
            <p>إذا لم تكن أنت من قام بهذا الإجراء، يرجى تغيير كلمة المرور فوراً والتواصل مع الدعم الفني.</p>
          </div>
        </div>
      </body>
      </html>
    `
    });
}

export default {
    sendNotification,
    notifyOrderUpdate,
    notifyBilling,
    notifySecurityAlert
};
