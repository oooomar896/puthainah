-- Fix 1: notify_requester_on_provider_response
-- Usage: Triggered on requests UPDATE
CREATE OR REPLACE FUNCTION public.notify_requester_on_provider_response()
RETURNS trigger
LANGUAGE plpgsql
AS $body$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.provider_response IS DISTINCT FROM OLD.provider_response THEN
    IF NEW.provider_response IN ('accepted','rejected') THEN
      INSERT INTO public.notifications (user_id, title, body, is_seen, created_at)
      VALUES (
        (SELECT requester_id FROM public.requests WHERE id = NEW.id),
        CASE WHEN NEW.provider_response = 'accepted' THEN 'تم قبول العرض' ELSE 'تم رفض العرض' END,
        CASE WHEN NEW.provider_response = 'accepted' THEN
          format('تم قبول العرض من قبل المزود (%s) على الطلب %s', COALESCE(NEW.assigned_provider_id::text, '---'), NEW.id::text)
        ELSE
          format('تم رفض العرض من قبل المزود (%s) على الطلب %s. السبب: %s', COALESCE(NEW.assigned_provider_id::text, '---'), NEW.id::text, COALESCE(NEW.provider_rejection_reason, ''))
        END,
        false, 
        now()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$body$;

-- Fix 2: create_notification
-- Usage: Triggered on requests INSERT and projects UPDATE
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification when request is created
  IF TG_TABLE_NAME = 'requests' AND TG_OP = 'INSERT' THEN
    INSERT INTO notifications (user_id, title, body, is_seen)
    VALUES (
      NEW.requester_id,
      'تم إنشاء طلب جديد',
      'تم إنشاء طلبك بنجاح',
      false
    );
  END IF;
  
  -- Create notification when project status changes
  IF TG_TABLE_NAME = 'projects' AND TG_OP = 'UPDATE' THEN
    IF OLD.status_id != NEW.status_id THEN
      -- Notify Requester
      INSERT INTO notifications (user_id, title, body, is_seen)
      VALUES (
        NEW.requester_id,
        'تحديث حالة المشروع',
        'تم تحديث حالة مشروعك',
        false
      );

      -- Notify Provider
      INSERT INTO notifications (user_id, title, body, is_seen)
      VALUES (
        NEW.provider_id,
        'تحديث حالة المشروع',
        'تم تحديث حالة مشروعك',
        false
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
