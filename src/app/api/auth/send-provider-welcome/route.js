import { NextResponse } from 'next/server.js';
import { sendEmail } from '@/services/emailService';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, name, role } = body;

        if (role !== 'Provider') {
            return NextResponse.json({ message: 'Ignore: Not a provider signup' }, { status: 200 });
        }

        let verificationLink = null;
        if (supabaseAdmin) {
            const { data, error } = await supabaseAdmin.auth.admin.generateLink({
                type: 'magiclink',
                email: email,
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://bacura.sa/'}/home`
                }
            });

            if (!error && data && data.properties && data.properties.action_link) {
                verificationLink = data.properties.action_link;
            } else {
                console.error('Failed to generate verification link:', error);
            }
        }

        const subject = 'تأكيد الحساب والانضمام كخبير - منصة باكورا';
        const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333; background-color: #f9fafb; border-radius: 8px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #059669; margin-top: 0;">مرحباً ${name}،</h2>
          <p>شكراً لاهتمامك بالانضمام إلى نخبة الخبراء في منصة باكورا.</p>
          <p>لقد تم استلام طلبك بنجاح.</p>
          
          ${verificationLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">تفعيل الحساب والدخول</a>
            <p style="margin-top: 10px; font-size: 13px; color: #666;">اضغط على الزر أعلاه لتفعيل بريدك الإلكتروني والدخول إلى حسابك.</p>
          </div>
          ` : ''}

          <h3 style="color: #333; margin-top: 20px;">الخطوات التالية:</h3>
          <ul style="color: #555;">
              <li>سيقوم فريقنا بمراجعة ملفك الشخصي والمرفقات.</li>
              <li>يرجى التأكد من تفعيل بريدك الإلكتروني لتلقي الإشعارات.</li>
          </ul>
          
          <p style="margin-top: 20px;">إذا واجهت أي مشكلة، لا تتردد في التواصل معنا عبر الدعم الفني.</p>
          <br/>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 14px;">تحياتنا،<br/>فريق منصة باكورا</p>
        </div>
      </div>
    `;

        const result = await sendEmail({ to: email, subject, html });

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Welcome and verification email sent successfully' });
        } else {
            console.error('Email sending failed:', result);
            return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in send-provider-welcome API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
