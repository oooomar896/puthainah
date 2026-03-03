# Epic 7: Email & In-App Notifications System

## Overview
Implement a comprehensive notification system with email delivery via Zoho SMTP, user preferences management, delivery tracking, and real-time in-app notifications.

## Goals
- Allow users to manage notification preferences
- Track email delivery and failures
- Send emails via Zoho SMTP
- Support multiple notification types
- Implement quiet hours and digest modes
- Provide in-app notifications with real-time updates
- Offer multiple deployment options (Manual, Worker, Edge Functions)

## Stories
- 12.1 Notification Preferences Schema
- 12.2 Email Delivery Logging
- 12.3 Zoho SMTP Integration
- 12.4 Notification Sending Logic
- 12.5 Notification Preferences UI
- 12.6 Database Migrations
- 12.7 Notification Testing
- 12.8 Notification API Endpoints
- 12.9 Email Queue & Worker System
- 12.10 In-App Notifications
- 12.11 Edge Functions Integration ⭐ (Recommended)
- 12.12 Notification Bell Component

## Technical Stack
- Node.js (Nodemailer) / Deno (Edge Functions)
- Supabase (PostgreSQL, Realtime)
- Zoho SMTP
- React (Frontend)
- PM2 (Worker deployment)

## Deployment Options
1. **MVP** - Manual notification sending (2 hours)
2. **Worker** - Automatic with Node.js worker (+ 30 min)
3. **Edge Functions** - Serverless automatic (+ 15 min) ⭐ Recommended

## Status
✅ Completed (2026-01-06)Zoho SMTP
- **Security**: Row Level Security (RLS) policies
