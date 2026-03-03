// ============================================
// Can Send Email - Check User Preferences
// File: src/services/canSendEmail.js
// ============================================

import { supabase } from '../lib/supabaseClient.js';

/**
 * التحقق من إمكانية إرسال بريد إلكتروني للمستخدم
 * @param {string} userId - معرف المستخدم
 * @param {string} type - نوع الإشعار (order_updates, billing_updates, security_alerts, marketing)
 * @returns {Promise<Object>} - {allowed: boolean, reason: string}
 */
export async function canSendEmail(userId, type) {
    try {
        // 1. جلب تفضيلات المستخدم
        const { data: preferences, error } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        // إذا حدث خطأ في الجلب، اسمح بالإرسال (افتراضي)
        if (error) {
            console.warn('⚠️ Error fetching preferences, allowing email:', error.message);
            return { allowed: true, reason: null };
        }

        // إذا لم توجد تفضيلات، اسمح بالإرسال (افتراضي)
        if (!preferences) {
            console.log('ℹ️ No preferences found, allowing email');
            return { allowed: true, reason: null };
        }

        // 2. التحقق من التفعيل العام للبريد الإلكتروني
        if (!preferences.email_enabled) {
            console.log('🔕 Email disabled globally for user:', userId);
            return { allowed: false, reason: 'email_disabled' };
        }

        // 3. التحقق من نوع الإشعار المحدد
        const typeMapping = {
            'order_updates': preferences.order_updates,
            'billing_updates': preferences.billing_updates,
            'security_alerts': preferences.security_alerts,
            'marketing': preferences.marketing
        };

        const isTypeEnabled = typeMapping[type];

        if (isTypeEnabled === undefined) {
            console.warn('⚠️ Unknown notification type:', type);
            return { allowed: true, reason: null }; // نوع غير معروف، اسمح به
        }

        if (!isTypeEnabled) {
            console.log(`🔕 ${type} disabled for user:`, userId);
            return { allowed: false, reason: 'type_disabled' };
        }

        // 4. التحقق من ساعات الهدوء (اختياري - للنسخة الكاملة)
        // يمكن تفعيله لاحقاً
        // if (type !== 'security_alerts' && isInQuietHours(preferences)) {
        //   return { allowed: false, reason: 'quiet_hours' };
        // }

        // ✅ كل الفحوصات نجحت، يمكن الإرسال
        console.log('✅ Email allowed for user:', userId, 'type:', type);
        return { allowed: true, reason: null };

    } catch (error) {
        console.error('❌ Error in canSendEmail:', error);
        // في حالة الخطأ، اسمح بالإرسال لتجنب فقدان الإشعارات المهمة
        return { allowed: true, reason: null };
    }
}

/**
 * التحقق من ساعات الهدوء (للنسخة المتقدمة)
 * @param {Object} preferences - تفضيلات المستخدم
 * @returns {boolean} - true إذا كان الوقت الحالي ضمن ساعات الهدوء
 */


export default canSendEmail;
