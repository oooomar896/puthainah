
-- Create status_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  status_id INT REFERENCES lookup_values(id),
  old_status_id INT REFERENCES lookup_values(id),
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Function to handle status changes
CREATE OR REPLACE FUNCTION handle_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status_id IS DISTINCT FROM NEW.status_id) THEN
    INSERT INTO status_history (request_id, status_id, old_status_id, changed_by, notes)
    VALUES (NEW.id, NEW.status_id, OLD.status_id, auth.uid(), 'Automatic status update via trigger');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for requests table
DROP TRIGGER IF EXISTS on_request_status_change ON requests;
CREATE TRIGGER on_request_status_change
  AFTER UPDATE OF status_id ON requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_request_status_change();

-- Enable RLS
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON status_history FOR SELECT USING (true);
CREATE POLICY "Authenticated insert access" ON status_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
