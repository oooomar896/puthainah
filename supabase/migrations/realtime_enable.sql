-- Enable Realtime for core tables
-- This adds the tables to the supabase_realtime publication

BEGIN;

-- Check if publication exists, if not create it (usually it exists by default in Supabase)
-- If it doesn't exist, this might fail, but in Supabase it's standard.
-- To be safe, we try to add.

ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE project_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE project_deliverables;
ALTER PUBLICATION supabase_realtime ADD TABLE status_history;

COMMIT;
