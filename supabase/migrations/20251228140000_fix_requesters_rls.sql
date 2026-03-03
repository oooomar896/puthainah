-- 017_fix_requesters_rls.sql
-- السماح للمستخدمين المصادق عليهم (Authenticated) بقراءة بيانات طالبي الخدمة (Requesters)
-- هذا ضروري لكي يتمكن مقدمو الخدمة (Providers) من رؤية تفاصيل صاحب الطلب

-- إضافة سياسة تسمح لجميع المستخدمين المسجلين بقراءة جدول requesters
CREATE POLICY "Authenticated users can read requesters"
ON requesters FOR SELECT
USING (auth.role() = 'authenticated');
