-- ============================================
-- Supabase Schema for Bakora Amal Platform
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Lookup Tables
-- ============================================

-- Cities Table
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entity Types Table
CREATE TABLE entity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  type TEXT CHECK (type IN ('requester', 'provider')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Request Status Lookup
CREATE TABLE request_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Status Lookup
CREATE TABLE project_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Status Lookup
CREATE TABLE ticket_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Main Tables
-- ============================================

-- Profiles Table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  role TEXT CHECK (role IN ('Admin', 'Provider', 'Requester')) NOT NULL,
  entity_type_id UUID REFERENCES entity_types(id),
  city_id UUID REFERENCES cities(id),
  commercial_register TEXT,
  commercial_register_confirmation_date DATE,
  avatar_url TEXT,
  is_blocked BOOLEAN DEFAULT false,
  is_suspended BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services Table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  price DECIMAL(10, 2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requests Table
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id),
  title TEXT NOT NULL,
  description TEXT,
  status_id UUID REFERENCES request_statuses(id) DEFAULT (SELECT id FROM request_statuses WHERE code = 'pending'),
  price DECIMAL(10, 2),
  provider_id UUID REFERENCES profiles(id),
  admin_notes TEXT,
  requester_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table (Orders)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status_id UUID REFERENCES project_statuses(id) DEFAULT (SELECT id FROM project_statuses WHERE code = 'waiting_approval'),
  price DECIMAL(10, 2) NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  requester_notes TEXT,
  provider_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments Table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings Table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  rater_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rated_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER CHECK (score >= 1 AND score <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets Table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status_id UUID REFERENCES ticket_statuses(id) DEFAULT (SELECT id FROM ticket_statuses WHERE code = 'open'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Ticket Messages Table
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs Table
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_ar TEXT NOT NULL,
  question_en TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners Table
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  related_id UUID,
  related_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_requests_requester ON requests(requester_id);
CREATE INDEX idx_requests_provider ON requests(provider_id);
CREATE INDEX idx_requests_status ON requests(status_id);
CREATE INDEX idx_projects_requester ON projects(requester_id);
CREATE INDEX idx_projects_provider ON projects(provider_id);
CREATE INDEX idx_projects_status ON projects(status_id);
CREATE INDEX idx_ratings_rated_user ON ratings(rated_user_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================
-- Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles"
  ON profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Requests Policies
CREATE POLICY "Requesters can view own requests"
  ON requests FOR SELECT
  USING (
    requester_id = auth.uid() OR
    provider_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Requesters can create requests"
  ON requests FOR INSERT
  WITH CHECK (
    requester_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Requester'
    )
  );

CREATE POLICY "Requesters can update own requests"
  ON requests FOR UPDATE
  USING (requester_id = auth.uid());

CREATE POLICY "Admins can update all requests"
  ON requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Projects Policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (
    requester_id = auth.uid() OR
    provider_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (
    requester_id = auth.uid() OR
    provider_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Ratings Policies
CREATE POLICY "Users can view ratings"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings for completed projects"
  ON ratings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND
      status_id = (SELECT id FROM project_statuses WHERE code = 'completed') AND
      (requester_id = auth.uid() OR provider_id = auth.uid())
    )
  );

-- Tickets Policies
CREATE POLICY "Users can view own tickets"
  ON tickets FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Users can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tickets"
  ON tickets FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- FAQs Policies
CREATE POLICY "Anyone can view active FAQs"
  ON faqs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage FAQs"
  ON faqs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Notifications Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- Initial Data
-- ============================================

-- Insert default statuses
INSERT INTO request_statuses (name_ar, name_en, code) VALUES
('جديد', 'New', 'pending'),
('تحت المعالجة', 'Under Processing', 'under_processing'),
('موافقة مبدأية', 'Initial Approval', 'initial_approval'),
('في انتظار الدفع', 'Awaiting Payment', 'awaiting_payment'),
('مرفوض', 'Rejected', 'rejected'),
('مكتمل', 'Completed', 'completed');

INSERT INTO project_statuses (name_ar, name_en, code) VALUES
('في انتظار الموافقة', 'Waiting Approval', 'waiting_approval'),
('في انتظار البدء', 'Waiting Start', 'waiting_start'),
('تحت المعالجة', 'Processing', 'processing'),
('مكتمل', 'Completed', 'completed'),
('منتهي', 'Ended', 'ended'),
('مرفوض', 'Rejected', 'rejected'),
('انتهت صلاحيته', 'Expired', 'expired');

INSERT INTO ticket_statuses (name_ar, name_en, code) VALUES
('مفتوح', 'Open', 'open'),
('قيد المعالجة', 'In Progress', 'in_progress'),
('محلول', 'Resolved', 'resolved'),
('مغلق', 'Closed', 'closed');

-- ============================================
-- Storage Buckets
-- ============================================

-- Note: Storage buckets are created via Supabase Dashboard or API
-- Buckets needed:
-- - attachments (public)
-- - avatars (public)
-- - documents (private)

-- ============================================
-- Views (Optional)
-- ============================================

-- View for project statistics
CREATE OR REPLACE VIEW project_statistics AS
SELECT
  p.id,
  p.requester_id,
  p.provider_id,
  COUNT(r.id) as total_ratings,
  AVG(r.score) as average_rating
FROM projects p
LEFT JOIN ratings r ON r.rated_user_id = p.provider_id
GROUP BY p.id, p.requester_id, p.provider_id;

-- ============================================
-- Additional Indexes for Performance
-- ============================================

-- Indexes for common queries
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX idx_attachments_request_id ON attachments(request_id);
CREATE INDEX idx_attachments_project_id ON attachments(project_id);
CREATE INDEX idx_ratings_project_id ON ratings(project_id);
CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

-- ============================================
-- Functions for Common Operations
-- ============================================

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(user_id_param UUID)
RETURNS TABLE (
  total_projects BIGINT,
  completed_projects BIGINT,
  average_rating NUMERIC,
  total_ratings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT p.id)::BIGINT as total_projects,
    COUNT(DISTINCT CASE WHEN ps.code = 'completed' THEN p.id END)::BIGINT as completed_projects,
    COALESCE(AVG(r.score), 0)::NUMERIC(3,2) as average_rating,
    COUNT(r.id)::BIGINT as total_ratings
  FROM projects p
  LEFT JOIN project_statuses ps ON p.status_id = ps.id
  LEFT JOIN ratings r ON r.rated_user_id = user_id_param
  WHERE p.provider_id = user_id_param OR p.requester_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin statistics
CREATE OR REPLACE FUNCTION get_admin_statistics()
RETURNS TABLE (
  total_users BIGINT,
  total_providers BIGINT,
  total_requesters BIGINT,
  total_requests BIGINT,
  total_projects BIGINT,
  pending_requests BIGINT,
  completed_projects BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT p.id)::BIGINT as total_users,
    COUNT(DISTINCT CASE WHEN p.role = 'Provider' THEN p.id END)::BIGINT as total_providers,
    COUNT(DISTINCT CASE WHEN p.role = 'Requester' THEN p.id END)::BIGINT as total_requesters,
    COUNT(DISTINCT r.id)::BIGINT as total_requests,
    COUNT(DISTINCT pr.id)::BIGINT as total_projects,
    COUNT(DISTINCT CASE WHEN rs.code = 'pending' THEN r.id END)::BIGINT as pending_requests,
    COUNT(DISTINCT CASE WHEN ps.code = 'completed' THEN pr.id END)::BIGINT as completed_projects
  FROM profiles p
  LEFT JOIN requests r ON true
  LEFT JOIN request_statuses rs ON r.status_id = rs.id
  LEFT JOIN projects pr ON true
  LEFT JOIN project_statuses ps ON pr.status_id = ps.id
  WHERE p.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Triggers for Notifications
-- ============================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification when request is created
  IF TG_TABLE_NAME = 'requests' AND TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
    VALUES (
      NEW.requester_id,
      'تم إنشاء طلب جديد',
      'تم إنشاء طلبك بنجاح',
      'request_created',
      NEW.id,
      'request'
    );
  END IF;
  
  -- Create notification when project status changes
  IF TG_TABLE_NAME = 'projects' AND TG_OP = 'UPDATE' THEN
    IF OLD.status_id != NEW.status_id THEN
      INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
      VALUES (
        NEW.requester_id,
        'تحديث حالة المشروع',
        'تم تحديث حالة مشروعك',
        'project_updated',
        NEW.id,
        'project'
      ),
      (
        NEW.provider_id,
        'تحديث حالة المشروع',
        'تم تحديث حالة مشروعك',
        'project_updated',
        NEW.id,
        'project'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for request notifications
CREATE TRIGGER request_notification_trigger
  AFTER INSERT ON requests
  FOR EACH ROW
  EXECUTE FUNCTION create_notification();

-- Trigger for project notifications
CREATE TRIGGER project_notification_trigger
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_notification();

-- ============================================
-- End of Schema
-- ============================================

