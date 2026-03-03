-- Enable RLS on project_messages
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

-- Policy for Sender (Insert): Allow users to insert messages where they are the sender
CREATE POLICY "Users can insert their own messages" ON project_messages
FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid()
);

-- Policy for Reading (Select): Users can read messages if they are the sender, 
-- OR if they are the Requester of the related Order, 
-- OR if they are the Provider of the related Order.
-- Since determining relation requires joins, we'll use EXISTS.

CREATE POLICY "Users can read related messages" ON project_messages
FOR SELECT
TO authenticated
USING (
    sender_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM orders o
        JOIN requests r ON r.id = o.request_id
        JOIN requesters req ON req.id = r.requester_id
        WHERE o.id = project_messages.order_id
        AND req.user_id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM orders o
        JOIN providers p ON p.id = o.provider_id
        WHERE o.id = project_messages.order_id
        AND p.user_id = auth.uid()
    ) OR
    -- Admins can read everything
     EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role = 'Admin'
    )
);

-- Admins full access
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
