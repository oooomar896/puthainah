-- 019_seed_attachment_uploader_lookup_values.sql
-- Add lookup_type 'attachment-uploader' and values 700/701/702 if missing

BEGIN;

-- Create lookup_type if not exists
INSERT INTO lookup_types (code, name_ar, name_en)
SELECT 'attachment-uploader', 'محمّل المرفقات', 'Attachment Uploader'
WHERE NOT EXISTS (SELECT 1 FROM lookup_types WHERE code = 'attachment-uploader');

-- Insert lookup_values for codes 700,701,702 (id is serial)
-- Code '700' -> Provider
-- Code '701' -> Requester
-- Code '702' -> Admin/Final

WITH lt AS (
  SELECT id FROM lookup_types WHERE code = 'attachment-uploader' LIMIT 1
)
INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
SELECT lt.id, v.code, v.name_ar, v.name_en
FROM lt, (VALUES
  ('700','محمّل من المزود','Provider Upload'),
  ('701','محمّل من العميل','Requester Upload'),
  ('702','محمّل إداري/نهائي','Admin/Final Upload')
) AS v(code, name_ar, name_en)
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values lv WHERE lv.lookup_type_id = lt.id AND lv.code = v.code
);

COMMIT;
