-- Enable RLS on project_deliverables
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

-- Allow Providers to insert their own deliverables
CREATE POLICY "Providers can insert deliverables" ON project_deliverables
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM providers p
        WHERE p.id = provider_id
        AND p.user_id = auth.uid()
    )
);

-- Allow Providers to view their own deliverables
CREATE POLICY "Providers can view deliverables" ON project_deliverables
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM providers p
        WHERE p.id = provider_id
        AND p.user_id = auth.uid()
    )
);

-- Allow Requesters to view deliverables linked to their orders
CREATE POLICY "Requesters can view deliverables" ON project_deliverables
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM orders o
        JOIN requests req ON req.id = o.request_id
        JOIN requesters r ON r.id = req.requester_id
        WHERE o.id = project_deliverables.order_id
        AND r.user_id = auth.uid()
    )
);

-- Allow Requesters to update status (accept/reject)
CREATE POLICY "Requesters can update deliverables" ON project_deliverables
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM orders o
        JOIN requests req ON req.id = o.request_id
        JOIN requesters r ON r.id = req.requester_id
        WHERE o.id = project_deliverables.order_id
        AND r.user_id = auth.uid()
    )
);

-- Allow Admins full access
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
