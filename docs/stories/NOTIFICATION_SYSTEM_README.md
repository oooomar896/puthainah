# Email Notification System - Implementation Guide

## 📋 Overview

This document provides a comprehensive guide for implementing the email notification system for the Bacura platform. The system allows users to manage their notification preferences and receive emails via Zoho SMTP.

## 🎯 Features

- ✅ User notification preferences management
- ✅ Email delivery tracking and logging
- ✅ Zoho SMTP integration
- ✅ Multiple notification types (orders, billing, security, marketing)
- ✅ Digest modes (immediate, daily, weekly)
- ✅ Quiet hours support
- ✅ Duplicate email prevention
- ✅ Row Level Security (RLS)
- ✅ RTL (Arabic) email templates

## 📚 Stories Overview

| Story | Title | Status | Priority | Complexity |
|-------|-------|--------|----------|------------|
| Epic 7 | Email Notifications System | To Do | High | - |
| 12.1 | Notification Preferences Schema | To Do | High | 6/10 |
| 12.2 | Email Delivery Logging | To Do | High | 7/10 |
| 12.3 | Zoho SMTP Integration | To Do | High | 7/10 |
| 12.4 | Notification Sending Logic | To Do | High | 8/10 |
| 12.5 | Notification Preferences UI | To Do | Medium | 6/10 |
| 12.6 | Database Migrations | To Do | High | 7/10 |
| 12.7 | Notification Testing | To Do | Medium | 8/10 |
| 12.8 | Notification API Endpoints | To Do | High | 7/10 |
| 12.9 | Email Queue & Worker System | To Do | High | 9/10 |
| 12.10 | In-App Notifications | To Do | High | 8/10 |

## 🚀 Implementation Order

### Phase 1: Database Setup (Stories 12.1, 12.2, 12.6)
1. Create `notification_preferences` table
2. Create `email_log` table
3. Create `in_app_notifications` table
4. Set up RLS policies
5. Create triggers and functions
6. Backfill existing users

**Estimated Time**: 2-3 days

### Phase 2: Backend Integration (Stories 12.3, 12.4, 12.8)
1. Install Nodemailer
2. Configure Zoho SMTP
3. Create email service
4. Create notification service
5. Implement sending logic
6. Create email templates
7. Build API endpoints (GET/PUT preferences)
8. Add authentication & validation

**Estimated Time**: 4-5 days

### Phase 3: Queue & Worker System (Story 12.9)
1. Implement email queue
2. Create background worker
3. Set up cron jobs
4. Add retry logic
5. Deploy worker process

**Estimated Time**: 2-3 days

### Phase 4: Frontend UI (Stories 12.5, 12.10)
1. Create preferences page
2. Implement form controls
3. Add validation and loading states
4. Build notification bell component
5. Create notification dropdown
6. Implement real-time updates
7. Style with RTL support

**Estimated Time**: 3-4 days

### Phase 5: Testing & QA (Story 12.7)
1. Write unit tests
2. Write integration tests
3. Perform E2E testing
4. Fix bugs
5. Code review
6. Performance testing

**Estimated Time**: 2-3 days

**Total Estimated Time**: 13-18 days

## 🔧 Technical Stack

- **Backend**: Node.js
- **Email Library**: Nodemailer
- **Email Provider**: Zoho SMTP
- **Database**: Supabase (PostgreSQL)
- **Frontend**: React
- **Testing**: Jest, React Testing Library

## 📊 Database Schema

### notification_preferences
```sql
- user_id (uuid, PK, FK to auth.users)
- email_enabled (boolean)
- order_updates (boolean)
- billing_updates (boolean)
- security_alerts (boolean)
- marketing (boolean)
- digest_mode (text: immediate|daily|weekly)
- quiet_hours_from (time)
- quiet_hours_to (time)
- updated_at (timestamptz)
```

### email_log
```sql
- id (bigserial, PK)
- user_id (uuid, FK to auth.users)
- recipient_email (text)
- type (text)
- subject (text)
- status (text: queued|sent|failed|skipped)
- error_text (text)
- attempts (int)
- provider (text)
- provider_response (text)
- metadata (jsonb)
- created_at (timestamptz)
- sent_at (timestamptz)
```

### in_app_notifications
```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- type (text: order_update|billing|security|system|message)
- title (text)
- body (text)
- icon (text)
- link (text)
- read (boolean)
- archived (boolean)
- metadata (jsonb)
- created_at (timestamptz)
- read_at (timestamptz)
```

## 🔐 Environment Variables

```env
# Zoho SMTP Configuration
ZOHO_SMTP_HOST=smtp.zoho.com
ZOHO_SMTP_PORT=465
ZOHO_SMTP_SECURE=true
ZOHO_SMTP_USER=info@bacuratec.com
ZOHO_SMTP_PASS=20Bac30@
ZOHO_FROM_EMAIL=info@bacuratec.com
ZOHO_FROM_NAME=Bacura Platform
```

⚠️ **Security Note**: Never commit these credentials to Git. Use environment variables or secret management.

## 📝 Usage Examples

### Send Order Update Notification
```javascript
import { notifyOrderUpdate } from './services/notificationService';

await notifyOrderUpdate(
  userId,
  orderId,
  'completed',
  'تم إكمال طلبك بنجاح'
);
```

### Send Billing Notification
```javascript
import { notifyBilling } from './services/notificationService';

await notifyBilling(userId, '500 SAR', invoiceId);
```

### Send Security Alert
```javascript
import { notifySecurityAlert } from './services/notificationService';

await notifySecurityAlert(
  userId,
  'تسجيل دخول من موقع جديد',
  ipAddress
);
```

## 🎨 UI Screenshots

### Notification Preferences Page
- Master email toggle
- Individual notification type toggles
- Digest mode selection (radio buttons)
- Quiet hours time pickers
- Save button with loading state

## ✅ Testing Strategy

### Unit Tests
- Preference checking logic
- Quiet hours calculation
- Duplicate detection
- Email template generation

### Integration Tests
- Database operations
- Email sending
- RLS policies
- Triggers and functions

### E2E Tests
- User preference updates
- Email delivery flow
- Error handling

## 📈 Monitoring & Analytics

### Key Metrics to Track
- Email delivery rate
- Bounce rate
- Open rate (if tracking implemented)
- Click rate (if tracking implemented)
- Preference change frequency
- Quiet hours usage

### Recommended Tools
- Supabase Dashboard (for database monitoring)
- Email provider analytics (Zoho)
- Custom analytics dashboard

## 🐛 Troubleshooting

### Common Issues

**1. Emails not sending**
- Check SMTP credentials
- Verify email_enabled is true
- Check notification type is enabled
- Verify not in quiet hours
- Check for duplicates

**2. RLS policy errors**
- Verify user is authenticated
- Check policy definitions
- Test with service role

**3. Trigger not firing**
- Check trigger is enabled
- Verify function exists
- Check function permissions

## 🔄 Future Enhancements

- [ ] Email templates with rich HTML/CSS
- [ ] Email tracking (opens, clicks)
- [ ] SMS notifications
- [ ] Push notifications integration
- [ ] Notification center in-app
- [ ] Email preview before sending
- [ ] A/B testing for email content
- [ ] Unsubscribe links
- [ ] Email scheduling
- [ ] Webhook support for delivery status

## 📖 Related Documentation

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Zoho SMTP Setup](https://www.zoho.com/mail/help/zoho-smtp.html)

## 👥 Team Contacts

- **Backend Lead**: [Name]
- **Frontend Lead**: [Name]
- **DevOps**: [Name]
- **QA Lead**: [Name]

## 📅 Timeline

| Phase | Start Date | End Date | Status |
|-------|-----------|----------|--------|
| Phase 1: Database | TBD | TBD | Not Started |
| Phase 2: Backend | TBD | TBD | Not Started |
| Phase 3: Frontend | TBD | TBD | Not Started |
| Phase 4: Testing | TBD | TBD | Not Started |

## ✨ Success Criteria

- [ ] All database tables created with RLS
- [ ] Email sending works via Zoho SMTP
- [ ] Users can manage preferences
- [ ] All notification types working
- [ ] Quiet hours respected
- [ ] Duplicates prevented
- [ ] Test coverage >80%
- [ ] No security vulnerabilities
- [ ] Performance acceptable (<2s for email send)
- [ ] Documentation complete

## 🎓 Learning Resources

- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Row Level Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Deliverability Guide](https://sendgrid.com/blog/email-deliverability-guide/)
- [SMTP Best Practices](https://www.mailgun.com/blog/smtp-best-practices/)

---

**Last Updated**: 2026-01-06
**Version**: 1.0
**Status**: Draft
