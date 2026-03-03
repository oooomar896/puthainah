
-- Update status for request f86c0056-184c-40ff-95fe-111fc2058343 to 'priced' (ID 8 usually, let's look up by code)
UPDATE requests
SET status_id = (SELECT id FROM lookup_values WHERE code = 'priced' LIMIT 1)
WHERE id = 'f86c0056-184c-40ff-95fe-111fc2058343'
AND status_id = (SELECT id FROM lookup_values WHERE code = 'pending' LIMIT 1);
