// ============================================
// Email Service - Zoho SMTP Integration
// File: src/services/emailService.js
// ============================================

import nodemailer from "nodemailer";

/**
 * إنشاء ناقل البريد الإلكتروني (Transporter)
 */
const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.com",
    port: parseInt(process.env.ZOHO_SMTP_PORT) || 587, // Changed to 587 for STARTTLS
    secure: false, // false for port 587, true for 465
    auth: {
        user: process.env.ZOHO_SMTP_USER,
        pass: process.env.ZOHO_SMTP_PASS
    },
    // إعدادات إضافية لـ Zoho
    tls: {
        rejectUnauthorized: false, // قبول الشهادات
        minVersion: 'TLSv1.2'
    },
    requireTLS: true, // Force TLS
    // تحسين الأداء
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Timeout settings
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 30000
});

/**
 * التحقق من اتصال SMTP
 */
transporter.verify(function (error) {
    if (error) {
        console.error('❌ SMTP connection error:', error);
    } else {
        console.log('✅ SMTP server is ready to send emails');
    }
});

/**
 * إرسال بريد إلكتروني
 * @param {Object} options - خيارات البريد
 * @param {string} options.to - البريد الإلكتروني للمستلم
 * @param {string} options.subject - عنوان البريد
 * @param {string} options.html - محتوى HTML
 * @param {string} options.text - نص بديل (اختياري)
 * @returns {Promise<Object>} - نتيجة الإرسال
 */
export async function sendEmail({ to, subject, html, text = null }) {
    try {
        const mailOptions = {
            from: {
                name: process.env.ZOHO_FROM_NAME || 'منصة باكورا',
                address: process.env.ZOHO_FROM_EMAIL || process.env.ZOHO_SMTP_USER
            },
            to,
            subject,
            html,
            text: text || stripHtml(html) // إنشاء نص بديل تلقائياً
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId,
            response: info.response,
            accepted: info.accepted,
            rejected: info.rejected
        };

    } catch (error) {
        console.error('❌ Email sending error:', error);
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}

/**
 * إزالة علامات HTML للحصول على نص بديل
 * @param {string} html - محتوى HTML
 * @returns {string} - نص بدون HTML
 */
function stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * اختبار إرسال بريد
 */
export async function testEmail() {
    return await sendEmail({
        to: 'test@example.com',
        subject: 'اختبار نظام الإشعارات',
        html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>مرحباً من منصة باكورا</h2>
        <p>هذا بريد اختبار للتأكد من عمل نظام الإشعارات.</p>
        <p>إذا استلمت هذا البريد، فهذا يعني أن النظام يعمل بشكل صحيح! ✅</p>
      </div>
    `
    });
}

export default { sendEmail, testEmail };
