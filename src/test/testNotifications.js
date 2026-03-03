// ============================================
// Test Notification System
// File: src/test/testNotifications.js
// ============================================

import { notifyOrderUpdate, notifyBilling, notifySecurityAlert } from '../services/notificationService.js';

/**
 * اختبار نظام الإشعارات
 * 
 * الاستخدام:
 * 1. تأكد من تشغيل السيرفر
 * 2. استبدل USER_ID بمعرف مستخدم حقيقي من قاعدة البيانات
 * 3. نفّذ: node src/test/testNotifications.js
 */

const TEST_USER_ID = 'YOUR_USER_ID_HERE'; // ⚠️ استبدل هذا بمعرف مستخدم حقيقي

async function testNotifications() {
    console.log('🧪 بدء اختبار نظام الإشعارات...\n');

    // اختبار 1: إشعار تحديث الطلب
    console.log('📦 اختبار 1: إشعار تحديث الطلب');
    try {
        const result1 = await notifyOrderUpdate(
            TEST_USER_ID,
            'ORD-12345',
            'completed',
            'تم إكمال طلبك بنجاح وجاهز للاستلام!'
        );
        console.log('✅ النتيجة:', result1);
    } catch (error) {
        console.error('❌ خطأ:', error.message);
    }
    console.log('');

    // اختبار 2: إشعار فاتورة
    console.log('💰 اختبار 2: إشعار فاتورة جديدة');
    try {
        const result2 = await notifyBilling(
            TEST_USER_ID,
            '500',
            'INV-67890'
        );
        console.log('✅ النتيجة:', result2);
    } catch (error) {
        console.error('❌ خطأ:', error.message);
    }
    console.log('');

    // اختبار 3: تنبيه أمني
    console.log('🔒 اختبار 3: تنبيه أمني');
    try {
        const result3 = await notifySecurityAlert(
            TEST_USER_ID,
            'تسجيل دخول من موقع جديد',
            'تم تسجيل الدخول من عنوان IP: 192.168.1.1'
        );
        console.log('✅ النتيجة:', result3);
    } catch (error) {
        console.error('❌ خطأ:', error.message);
    }
    console.log('');

    console.log('✅ انتهى الاختبار!');
}

// تشغيل الاختبار
testNotifications().catch(console.error);
