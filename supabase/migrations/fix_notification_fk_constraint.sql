-- Fix Key Violations in Notification Triggers
-- Problem: Triggers utilize 'requester_id' or 'provider_id' (from requesters/providers tables) directly as 'user_id' in notifications table.
-- Solution: Look up the actual 'user_id' from the respective tables (requesters/providers) before inserting into notifications.

-- 1. Fix notify_requester_on_provider_response
CREATE OR REPLACE FUNCTION public.notify_requester_on_provider_response()
RETURNS trigger
LANGUAGE plpgsql
AS $body$
DECLARE
    target_user_id UUID;
    req_id UUID;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.provider_response IS DISTINCT FROM OLD.provider_response THEN
    IF NEW.provider_response IN ('accepted','rejected') THEN
      
      -- Get requester_id from the request
      req_id := NEW.requester_id;
      
      -- Look up valid user_id from requesters table
      -- We attempt to find a user_id. If requesters table works differently, we fallback to req_id (unsafe) or handle null.
      SELECT user_id INTO target_user_id FROM public.requesters WHERE id = req_id;
      
      -- If not found (maybe req_id IS user_id in some legacy data), try to use req_id if it exists in users
      IF target_user_id IS NULL THEN
         SELECT id INTO target_user_id FROM auth.users WHERE id = req_id;
      END IF;

      IF target_user_id IS NOT NULL THEN
          INSERT INTO public.notifications (user_id, title, body, is_seen, created_at)
          VALUES (
            target_user_id,
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
  END IF;
  RETURN NEW;
END;
$body$;

-- 2. Fix create_notification (if used for requests INSERT)
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    p_user_id UUID;
BEGIN
  -- Create notification when request is created
  IF TG_TABLE_NAME = 'requests' AND TG_OP = 'INSERT' THEN
    -- Lookup user_id
    SELECT user_id INTO target_user_id FROM public.requesters WHERE id = NEW.requester_id;
    
    IF target_user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, body, is_seen)
        VALUES (
          target_user_id,
          'تم إنشاء طلب جديد',
          'تم إنشاء طلبك بنجاح',
          false
        );
    END IF;
  END IF;
  
  -- Create notification when project (orders?) status changes
  -- Checking if table is 'projects' or 'orders' - script should handle both if names vary, 
  -- but usually this function is attached to specific tables.
  IF (TG_TABLE_NAME = 'projects' OR TG_TABLE_NAME = 'orders') AND TG_OP = 'UPDATE' THEN
    IF OLD.status_id != NEW.status_id OR OLD.order_status_id != NEW.order_status_id THEN
       -- Handle requester
       IF TG_TABLE_NAME = 'orders' THEN
          -- For orders, we need to join requests to get requester
           SELECT r.user_id INTO target_user_id 
           FROM public.requests req
           JOIN public.requesters r ON req.requester_id = r.id
           WHERE req.id = NEW.request_id;
           
           -- For provider
           SELECT user_id INTO p_user_id FROM public.providers WHERE id = NEW.provider_id;
       ELSE
          -- For projects table (if exists separately)
           SELECT user_id INTO target_user_id FROM public.requesters WHERE id = NEW.requester_id;
           SELECT user_id INTO p_user_id FROM public.providers WHERE id = NEW.provider_id;
       END IF;

       -- Notify Requester
       IF target_user_id IS NOT NULL THEN
          INSERT INTO notifications (user_id, title, body, is_seen)
          VALUES (target_user_id, 'تحديث حالة المشروع', 'تم تحديث حالة مشروعك', false);
       END IF;

       -- Notify Provider
       IF p_user_id IS NOT NULL THEN
          INSERT INTO notifications (user_id, title, body, is_seen)
          VALUES (p_user_id, 'تحديث حالة المشروع', 'تم تحديث حالة مشروعك', false);
       END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Fix create_order_status_notification (Specific to orders table in 013_functions...)
CREATE OR REPLACE FUNCTION create_order_status_notification()
RETURNS TRIGGER AS $$
DECLARE
    requester_uuid UUID;
    provider_uuid UUID;
    order_title VARCHAR(255);
    real_requester_user_id UUID;
    real_provider_user_id UUID;
BEGIN
    -- Get Order Details
    SELECT 
        r.requester_id,
        o.provider_id,
        o.order_title
    INTO requester_uuid, provider_uuid, order_title
    FROM orders o
    JOIN requests r ON o.request_id = r.id
    WHERE o.id = NEW.id;
    
    -- Resolve real user IDs
    SELECT user_id INTO real_requester_user_id FROM public.requesters WHERE id = requester_uuid;
    SELECT user_id INTO real_provider_user_id FROM public.providers WHERE id = provider_uuid;

    -- Notification logic
    IF OLD.order_status_id != NEW.order_status_id THEN
        -- Notify Requester
        IF real_requester_user_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, body)
            VALUES (
                real_requester_user_id,
                'تحديث حالة الطلب',
                'تم تحديث حالة الطلب: ' || COALESCE(order_title, 'طلبك')
            );
        END IF;
        
        -- Notify Provider
        IF real_provider_user_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, body)
            VALUES (
                real_provider_user_id,
                'تحديث حالة المشروع',
                'تم تحديث حالة المشروع: ' || COALESCE(order_title, 'مشروعك')
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
