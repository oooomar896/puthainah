// ============================================
// Notification Settings Page - React Component
// File: src/pages/NotificationSettings.jsx
// ============================================

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import './NotificationSettings.css';

export default function NotificationSettings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const [preferences, setPreferences] = useState({
        email_enabled: true,
        order_updates: true,
        billing_updates: true,
        security_alerts: true,
        marketing: false,
        digest_mode: 'immediate',
        quiet_hours_from: null,
        quiet_hours_to: null
    });

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from('notification_preferences')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }

                if (data) {
                    setPreferences(data);
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
                showMessage('حدث خطأ أثناء تحميل الإعدادات', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadPreferences();
        }
    }, [user]);

    async function savePreferences() {
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('notification_preferences')
                .upsert({
                    user_id: user.id,
                    ...preferences,
                    security_alerts: true, // دائماً مفعّل
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            showMessage('✅ تم حفظ التفضيلات بنجاح', 'success');
        } catch (error) {
            console.error('Error saving preferences:', error);
            showMessage('❌ حدث خطأ أثناء حفظ التفضيلات', 'error');
        } finally {
            setSaving(false);
        }
    }

    function showMessage(text, type) {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    }

    function updatePreference(key, value) {
        setPreferences(prev => ({ ...prev, [key]: value }));
    }

    if (loading) {
        return (
            <div className="notification-settings-loading">
                <div className="spinner"></div>
                <p>جاري التحميل...</p>
            </div>
        );
    }

    return (
        <div className="notification-settings" dir="rtl">
            <div className="settings-header">
                <h1>⚙️ إعدادات الإشعارات</h1>
                <p>تحكم في الإشعارات التي تريد استلامها عبر البريد الإلكتروني</p>
            </div>

            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Master Switch */}
            <div className="settings-section master-section">
                <div className="setting-item master-switch">
                    <div className="setting-info">
                        <h3>📧 تفعيل الإشعارات عبر البريد الإلكتروني</h3>
                        <p>تحكم في جميع الإشعارات من مكان واحد</p>
                    </div>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            checked={preferences.email_enabled}
                            onChange={(e) => updatePreference('email_enabled', e.target.checked)}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            {/* Notification Types */}
            <div className="settings-section">
                <h2>📬 أنواع الإشعارات</h2>

                <div className="setting-item">
                    <div className="setting-info">
                        <h3>📦 تحديثات الطلبات</h3>
                        <p>احصل على إشعارات عند تحديث حالة طلباتك</p>
                    </div>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            checked={preferences.order_updates}
                            onChange={(e) => updatePreference('order_updates', e.target.checked)}
                            disabled={!preferences.email_enabled}
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h3>💰 تحديثات الفواتير</h3>
                        <p>احصل على إشعارات عند إصدار فواتير جديدة أو استلام مدفوعات</p>
                    </div>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            checked={preferences.billing_updates}
                            onChange={(e) => updatePreference('billing_updates', e.target.checked)}
                            disabled={!preferences.email_enabled}
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="setting-item security-item">
                    <div className="setting-info">
                        <h3>🔒 التنبيهات الأمنية</h3>
                        <p>تنبيهات مهمة حول أمان حسابك (لا يمكن تعطيلها)</p>
                    </div>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            checked={true}
                            disabled={true}
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h3>🎁 العروض التسويقية</h3>
                        <p>احصل على آخر العروض والأخبار والتحديثات</p>
                    </div>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            checked={preferences.marketing}
                            onChange={(e) => updatePreference('marketing', e.target.checked)}
                            disabled={!preferences.email_enabled}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            {/* Digest Mode */}
            <div className="settings-section">
                <h2>📅 وضع التجميع</h2>
                <p className="section-description">
                    اختر متى تريد استلام الإشعارات
                </p>

                <div className="radio-group">
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="digest_mode"
                            value="immediate"
                            checked={preferences.digest_mode === 'immediate'}
                            onChange={(e) => updatePreference('digest_mode', e.target.value)}
                            disabled={!preferences.email_enabled}
                        />
                        <div className="radio-content">
                            <h4>⚡ فوري</h4>
                            <p>استلم الإشعارات فور حدوثها</p>
                        </div>
                    </label>

                    <label className="radio-option">
                        <input
                            type="radio"
                            name="digest_mode"
                            value="daily"
                            checked={preferences.digest_mode === 'daily'}
                            onChange={(e) => updatePreference('digest_mode', e.target.value)}
                            disabled={!preferences.email_enabled}
                        />
                        <div className="radio-content">
                            <h4>📆 يومي</h4>
                            <p>ملخص يومي لجميع الإشعارات</p>
                        </div>
                    </label>

                    <label className="radio-option">
                        <input
                            type="radio"
                            name="digest_mode"
                            value="weekly"
                            checked={preferences.digest_mode === 'weekly'}
                            onChange={(e) => updatePreference('digest_mode', e.target.value)}
                            disabled={!preferences.email_enabled}
                        />
                        <div className="radio-content">
                            <h4>📅 أسبوعي</h4>
                            <p>ملخص أسبوعي لجميع الإشعارات</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Save Button */}
            <div className="settings-actions">
                <button
                    className="btn-save"
                    onClick={savePreferences}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <span className="spinner-small"></span>
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            💾 حفظ التفضيلات
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
