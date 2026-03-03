-- Remove all existing RLS policies and create unrestricted access policies
-- This migration allows full CRUD operations on all tables without restrictions

-- Users table
DROP POLICY IF EXISTS "Allow full access to users" ON users;
CREATE POLICY "Allow full access to users" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- Refresh tokens table
DROP POLICY IF EXISTS "Allow full access to refresh_tokens" ON refresh_tokens;
CREATE POLICY "Allow full access to refresh_tokens" ON refresh_tokens
    FOR ALL USING (true) WITH CHECK (true);

-- Lookup types table
DROP POLICY IF EXISTS "Allow full access to lookup_types" ON lookup_types;
CREATE POLICY "Allow full access to lookup_types" ON lookup_types
    FOR ALL USING (true) WITH CHECK (true);

-- Lookup values table
DROP POLICY IF EXISTS "Allow full access to lookup_values" ON lookup_values;
CREATE POLICY "Allow full access to lookup_values" ON lookup_values
    FOR ALL USING (true) WITH CHECK (true);

-- Cities table
DROP POLICY IF EXISTS "Allow full access to cities" ON cities;
CREATE POLICY "Allow full access to cities" ON cities
    FOR ALL USING (true) WITH CHECK (true);

-- Requesters table
DROP POLICY IF EXISTS "Allow full access to requesters" ON requesters;
CREATE POLICY "Allow full access to requesters" ON requesters
    FOR ALL USING (true) WITH CHECK (true);

-- Providers table
DROP POLICY IF EXISTS "Allow full access to providers" ON providers;
CREATE POLICY "Allow full access to providers" ON providers
    FOR ALL USING (true) WITH CHECK (true);

-- Admins table
DROP POLICY IF EXISTS "Allow full access to admins" ON admins;
CREATE POLICY "Allow full access to admins" ON admins
    FOR ALL USING (true) WITH CHECK (true);

-- Services table
DROP POLICY IF EXISTS "Allow full access to services" ON services;
CREATE POLICY "Allow full access to services" ON services
    FOR ALL USING (true) WITH CHECK (true);

-- Requests table
DROP POLICY IF EXISTS "Allow full access to requests" ON requests;
CREATE POLICY "Allow full access to requests" ON requests
    FOR ALL USING (true) WITH CHECK (true);

-- Orders table
DROP POLICY IF EXISTS "Allow full access to orders" ON orders;
CREATE POLICY "Allow full access to orders" ON orders
    FOR ALL USING (true) WITH CHECK (true);

-- Attachment groups table
DROP POLICY IF EXISTS "Allow full access to attachment_groups" ON attachment_groups;
CREATE POLICY "Allow full access to attachment_groups" ON attachment_groups
    FOR ALL USING (true) WITH CHECK (true);

-- Attachments table
DROP POLICY IF EXISTS "Allow full access to attachments" ON attachments;
CREATE POLICY "Allow full access to attachments" ON attachments
    FOR ALL USING (true) WITH CHECK (true);

-- Order ratings table
DROP POLICY IF EXISTS "Allow full access to order_ratings" ON order_ratings;
CREATE POLICY "Allow full access to order_ratings" ON order_ratings
    FOR ALL USING (true) WITH CHECK (true);

-- Tickets table
DROP POLICY IF EXISTS "Allow full access to tickets" ON tickets;
CREATE POLICY "Allow full access to tickets" ON tickets
    FOR ALL USING (true) WITH CHECK (true);

-- Notifications table
DROP POLICY IF EXISTS "Allow full access to notifications" ON notifications;
CREATE POLICY "Allow full access to notifications" ON notifications
    FOR ALL USING (true) WITH CHECK (true);

-- FAQ questions table
DROP POLICY IF EXISTS "Allow full access to faq_questions" ON faq_questions;
CREATE POLICY "Allow full access to faq_questions" ON faq_questions
    FOR ALL USING (true) WITH CHECK (true);

-- Partners table
DROP POLICY IF EXISTS "Allow full access to partners" ON partners;
CREATE POLICY "Allow full access to partners" ON partners
    FOR ALL USING (true) WITH CHECK (true);

-- Customers table
DROP POLICY IF EXISTS "Allow full access to customers" ON customers;
CREATE POLICY "Allow full access to customers" ON customers
    FOR ALL USING (true) WITH CHECK (true);

-- Payments table
DROP POLICY IF EXISTS "Allow full access to payments" ON payments;
CREATE POLICY "Allow full access to payments" ON payments
    FOR ALL USING (true) WITH CHECK (true);

-- Profile infos table
DROP POLICY IF EXISTS "Allow full access to profile_infos" ON profile_infos;
CREATE POLICY "Allow full access to profile_infos" ON profile_infos
    FOR ALL USING (true) WITH CHECK (true);

-- Grant full permissions to anon and authenticated roles for all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;