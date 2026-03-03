// ============================================
// Supabase Edge Function - Send Order Notification
// File: supabase/functions/send-order-notification/index.ts
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// إنشاء Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Zoho SMTP Configuration
const SMTP_CONFIG = {
    hostname: "smtp.zoho.com",
    port: 465,
    username: Deno.env.get('ZOHO_SMTP_USER') || "info@bacuratec.com",
    password: Deno.env.get('ZOHO_SMTP_PASS') || "20Bac30@",
}

serve(async (req) => {
    try {
        const { record } = await req.json()

        console.log('📧 Processing notification for order:', record.id)

        // 1. التحقق من تفضيلات المستخدم
        const { data: preferences } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', record.user_id)
            .single()

        if (!preferences?.email_enabled || !preferences?.order_updates) {
            console.log('🔕 Email disabled for user:', record.user_id)
            return new Response(
                JSON.stringify({ success: false, reason: 'email_disabled' }),
                { headers: { 'Content-Type': 'application/json' } }
            )
        }

        // 2. جلب بيانات المستخدم
        const { data: user } = await supabase
            .from('profiles')
            .select('email, display_name')
            .eq('id', record.user_id)
            .single()

        if (!user?.email) {
            console.log('❌ User email not found')
            return new Response(
                JSON.stringify({ success: false, reason: 'no_email' }),
                { headers: { 'Content-Type': 'application/json' } }
            )
        }

        // 3. إنشاء محتوى البريد
        const statusEmojis: Record<string, string> = {
            'pending': '⏳',
            'in_progress': '🔄',
            'completed': '✅',
            'cancelled': '❌',
            'paid': '💰'
        }

        const statusMessages: Record<string, string> = {
            'pending': 'طلبك قيد المراجعة',
            'in_progress': 'جاري العمل على طلبك',
            'completed': 'تم إكمال طلبك بنجاح!',
            'cancelled': 'تم إلغاء الطلب',
            'paid': 'تم استلام الدفعة بنجاح'
        }

        const emoji = statusEmojis[record.status] || '📦'
        const message = statusMessages[record.status] || 'تم تحديث حالة طلبك'

        const htmlContent = `
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
            <h2>مرحباً ${user.display_name || 'عزيزي العميل'}</h2>
            <p>تم تحديث حالة طلبك <strong>#${record.id}</strong></p>
            <div class="status-badge">${emoji} ${record.status}</div>
            <p>${message}</p>
          </div>
          <div class="footer">
            <p>© 2026 منصة باكورا - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </body>
      </html>
    `

        // 4. إرسال البريد عبر SMTP
        const client = new SmtpClient()

        await client.connectTLS({
            hostname: SMTP_CONFIG.hostname,
            port: SMTP_CONFIG.port,
            username: SMTP_CONFIG.username,
            password: SMTP_CONFIG.password,
        })

        await client.send({
            from: `منصة باكورا <${SMTP_CONFIG.username}>`,
            to: user.email,
            subject: `${emoji} تحديث الطلب #${record.id}`,
            content: htmlContent,
            html: htmlContent,
        })

        await client.close()

        // 5. تسجيل في email_log
        await supabase
            .from('email_log')
            .insert({
                user_id: record.user_id,
                recipient_email: user.email,
                type: 'order_updates',
                subject: `تحديث الطلب #${record.id}`,
                status: 'sent',
                attempts: 1,
                provider: 'zoho_smtp',
                sent_at: new Date().toISOString()
            })

        console.log('✅ Email sent successfully to:', user.email)

        return new Response(
            JSON.stringify({ success: true, email: user.email }),
            { headers: { 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('❌ Error:', error)

        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
})
