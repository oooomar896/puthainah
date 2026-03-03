-- ================================================================
-- Fix RLS Policies for Project Chat & Deliverables
-- ================================================================

-- 1. Project Messages Table
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can insert their own messages" ON project_messages;
DROP POLICY IF EXISTS "Users can read related messages" ON project_messages;
DROP POLICY IF EXISTS "Admins full access messages" ON project_messages;

-- Insert Policy: Allow authenticated users to send messages if they identify as the sender
CREATE POLICY "Users can insert their own messages" ON project_messages
FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid()
);

-- Select Policy: Allow users to read messages they sent, or belong to their orders
CREATE POLICY "Users can read related messages" ON project_messages
FOR SELECT
TO authenticated
USING (
    sender_id = auth.uid() 
    OR 
    EXISTS (
        -- Check if user is the Requester of the order
        SELECT 1 FROM orders o
        JOIN requests r ON r.id = o.request_id
        JOIN requesters req ON req.id = r.requester_id
        WHERE o.id = project_messages.order_id
        AND req.user_id = auth.uid()
    )
    OR 
    EXISTS (
        -- Check if user is the Provider of the order
        SELECT 1 FROM orders o
        JOIN providers p ON p.id = o.provider_id
        WHERE o.id = project_messages.order_id
        AND p.user_id = auth.uid()
    )
    OR
    -- Admin override
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role = 'Admin'
    )
);

-- Admin Full Access
CREATE POLICY "Admins full access messages" ON project_messages
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role = 'Admin'
    )
);


-- 2. Project Deliverables Table
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Providers can insert deliverables" ON project_deliverables;
DROP POLICY IF EXISTS "Providers can view deliverables" ON project_deliverables;
DROP POLICY IF EXISTS "Requesters can view deliverables" ON project_deliverables;
DROP POLICY IF EXISTS "Requesters can update deliverables" ON project_deliverables;
DROP POLICY IF EXISTS "Admins full access deliverables" ON project_deliverables;
DROP POLICY IF EXISTS "See own or related deliverables" ON project_deliverables;

-- Insert Policy: Provider can upload
CREATE POLICY "Providers can insert deliverables" ON project_deliverables
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM providers p
        WHERE p.id = project_deliverables.provider_id
        AND p.user_id = auth.uid()
    )
);

-- Select Policy: Provider sees own, Requester sees order's
CREATE POLICY "See own or related deliverables" ON project_deliverables
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM providers p
        WHERE p.id = project_deliverables.provider_id
        AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM orders o
        JOIN requests r ON r.id = o.request_id
        JOIN requesters req ON req.id = r.requester_id
        WHERE o.id = project_deliverables.order_id
        AND req.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role = 'Admin'
    )
);

-- Update Policy: Requester can accept/reject (update status)
CREATE POLICY "Requesters can update deliverables" ON project_deliverables
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM orders o
        JOIN requests r ON r.id = o.request_id
        JOIN requesters req ON req.id = r.requester_id
        WHERE o.id = project_deliverables.order_id
        AND req.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders o
        JOIN requests r ON r.id = o.request_id
        JOIN requesters req ON req.id = r.requester_id
        WHERE o.id = project_deliverables.order_id
        AND req.user_id = auth.uid()
    )
);

-- Admin Full Access
CREATE POLICY "Admins full access deliverables" ON project_deliverables
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role = 'Admin'
    )
);
