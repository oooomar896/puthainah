-- 009_seed_lookups_cities.sql
-- بيانات أولية للـ lookup_types, lookup_values, cities

-- أنواع الـ lookup
INSERT INTO lookup_types (code, name_ar, name_en) VALUES
    ('requester-entity-types', 'أنواع كيان طالب الخدمة', 'Requester Entity Types'),
    ('provider-entity-types', 'أنواع كيان مقدم الخدمة', 'Provider Entity Types'),
    ('request-status', 'حالة الطلب', 'Request Status'),
    ('order-status', 'حالة المشروع', 'Order Status'),
    ('ticket-status', 'حالة التذكرة', 'Ticket Status'),
    ('request-phase', 'مرحلة الطلب / المرفقات', 'Request Phase')
ON CONFLICT (code) DO NOTHING;

-- قيم requester-entity-types
INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
SELECT lt.id, v.code, v.name_ar, v.name_en
FROM lookup_types lt
JOIN (
    VALUES
        ('company', 'شركة', 'Company'),
        ('individual', 'فرد', 'Individual'),
        ('government', 'جهة حكومية', 'Government Entity')
) AS v(code, name_ar, name_en) ON TRUE
WHERE lt.code = 'requester-entity-types'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- قيم provider-entity-types
INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
SELECT lt.id, v.code, v.name_ar, v.name_en
FROM lookup_types lt
JOIN (
    VALUES
        ('consulting-office', 'مكتب استشارات', 'Consulting Office'),
        ('freelancer', 'مستقل', 'Freelancer'),
        ('company', 'شركة', 'Company')
) AS v(code, name_ar, name_en) ON TRUE
WHERE lt.code = 'provider-entity-types'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- قيم request-status
INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
SELECT lt.id, v.code, v.name_ar, v.name_en
FROM lookup_types lt
JOIN (
    VALUES
        ('pending', 'قيد المراجعة', 'Pending'),
        ('priced', 'تم التسعير', 'Priced'),
        ('accepted', 'مقبول', 'Accepted'),
        ('rejected', 'مرفوض', 'Rejected'),
        ('completed', 'مكتمل', 'Completed'),
        ('cancelled', 'ملغى', 'Cancelled')
) AS v(code, name_ar, name_en) ON TRUE
WHERE lt.code = 'request-status'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- قيم order-status
INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
SELECT lt.id, v.code, v.name_ar, v.name_en
FROM lookup_types lt
JOIN (
    VALUES
        ('in-progress', 'قيد التنفيذ', 'In Progress'),
        ('on-hold', 'معلق', 'On Hold'),
        ('completed', 'مكتمل', 'Completed'),
        ('cancelled', 'ملغى', 'Cancelled')
) AS v(code, name_ar, name_en) ON TRUE
WHERE lt.code = 'order-status'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- قيم ticket-status
INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
SELECT lt.id, v.code, v.name_ar, v.name_en
FROM lookup_types lt
JOIN (
    VALUES
        ('open', 'مفتوحة', 'Open'),
        ('in-progress', 'قيد المعالجة', 'In Progress'),
        ('closed', 'مغلقة', 'Closed')
) AS v(code, name_ar, name_en) ON TRUE
WHERE lt.code = 'ticket-status'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- قيم request-phase (مرتبطة بالمرفقات 700/701/702 و 800/801/802)
INSERT INTO lookup_values (lookup_type_id, code, name_ar, name_en)
SELECT lt.id, v.code, v.name_ar, v.name_en
FROM lookup_types lt
JOIN (
    VALUES
        ('700', 'مرفقات مرحلة التسعير', 'Pricing Phase Attachments'),
        ('701', 'مرفقات قبل التنفيذ', 'Pre-Execution Attachments'),
        ('702', 'مرفقات بعد التنفيذ', 'Post-Execution Attachments'),
        ('800', 'مرفقات طالب الخدمة - قبل المشروع', 'Requester Attachments - Before Project'),
        ('801', 'مرفقات طالب الخدمة - أثناء المشروع', 'Requester Attachments - During Project'),
        ('802', 'مرفقات طالب الخدمة - بعد المشروع', 'Requester Attachments - After Project')
) AS v(code, name_ar, name_en) ON TRUE
WHERE lt.code = 'request-phase'
ON CONFLICT (lookup_type_id, code) DO NOTHING;

-- مدن افتراضية
INSERT INTO cities (name_ar, name_en) VALUES
    ('الرياض', 'Riyadh'),
    ('جدة', 'Jeddah'),
    ('الدمام', 'Dammam'),
    ('مكة المكرمة', 'Makkah'),
    ('المدينة المنورة', 'Madinah')
ON CONFLICT DO NOTHING;


