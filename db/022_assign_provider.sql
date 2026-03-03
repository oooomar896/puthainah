-- 022_assign_provider.sql
-- Add fields to support assigning a provider with a quoted price and provider response, and add RLS + notification trigger

BEGIN;

-- Add columns to requests
ALTER TABLE IF EXISTS public.requests
  ADD COLUMN IF NOT EXISTS assigned_provider_id UUID NULL,
  ADD COLUMN IF NOT EXISTS provider_quoted_price NUMERIC(12,2) NULL,
  ADD COLUMN IF NOT EXISTS provider_response VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS provider_response_at TIMESTAMP WITH TIME ZONE NULL,
  ADD COLUMN IF NOT EXISTS provider_rejection_reason TEXT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_requests_assigned_provider_id ON public.requests (assigned_provider_id);
CREATE INDEX IF NOT EXISTS idx_requests_provider_response ON public.requests (provider_response);

-- Ensure profiles table exists (create minimal table if missing) and add FK to requests
DO $$
BEGIN
  -- Create a minimal profiles table if it doesn't exist. Adjust columns as needed for your schema.
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY,
      display_name TEXT,
      email TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    RAISE NOTICE 'Created minimal public.profiles table (id, display_name, email, created_at)';
  END IF;

  -- Add FK constraint if not already present
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'requests_assigned_provider_id_fkey') THEN
    -- Prefer to reference existing providers table if available
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'providers') THEN
      ALTER TABLE public.requests
        ADD CONSTRAINT requests_assigned_provider_id_fkey FOREIGN KEY (assigned_provider_id) REFERENCES public.providers(id) ON DELETE SET NULL;
    ELSE
      -- Fallback to profiles table (created above) using the canonical constraint name expected by code
      ALTER TABLE public.requests
        ADD CONSTRAINT requests_assigned_provider_id_fkey FOREIGN KEY (assigned_provider_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
  END IF;
END$$;

-- RLS policies: allow admins to assign provider & update quoted price
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'requests' AND p.polname = 'requests_assign_provider_admin'
  ) THEN
    EXECUTE 'CREATE POLICY requests_assign_provider_admin ON public.requests FOR UPDATE USING (get_user_role() = ''Admin'') WITH CHECK (get_user_role() = ''Admin'')';
  END IF;
END
$$;

-- RLS policies: allow assigned provider to update their response only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'requests' AND p.polname = 'requests_provider_respond'
  ) THEN
    EXECUTE 'CREATE POLICY requests_provider_respond ON public.requests FOR UPDATE USING (auth.uid() = assigned_provider_id) WITH CHECK (auth.uid() = assigned_provider_id AND (provider_response = ''accepted'' OR provider_response = ''rejected'' OR provider_response = ''pending''))';
  END IF;
END
$$;

-- Trigger function to notify requester when provider accepts/rejects
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_requester_on_provider_response') THEN
    EXECUTE $create$
    CREATE FUNCTION public.notify_requester_on_provider_response()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $body$
    BEGIN
      IF TG_OP = 'UPDATE' AND NEW.provider_response IS DISTINCT FROM OLD.provider_response THEN
        IF NEW.provider_response IN ('accepted','rejected') THEN
          -- Insert notification for requester
          INSERT INTO public.notifications (user_id, title, message, type, related_type, related_id, is_read, created_at)
          VALUES (
            (SELECT requester_id FROM public.requests WHERE id = NEW.id),
            CASE WHEN NEW.provider_response = 'accepted' THEN 'تم قبول العرض' ELSE 'تم رفض العرض' END,
            CASE WHEN NEW.provider_response = 'accepted' THEN
              format('تم قبول العرض من قبل المزود (%s) على الطلب %s', COALESCE(NEW.assigned_provider_id::text, '---'), NEW.id::text)
            ELSE
              format('تم رفض العرض من قبل المزود (%s) على الطلب %s. السبب: %s', COALESCE(NEW.assigned_provider_id::text, '---'), NEW.id::text, COALESCE(NEW.provider_rejection_reason, ''))
            END,
            'provider_response',
            'request',
            NEW.id,
            false,
            now()
          );
        END IF;
      END IF;
      RETURN NEW;
    END;
    $body$;
    $create$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tr_notify_requester_on_provider_response'
  ) THEN
    EXECUTE 'CREATE TRIGGER tr_notify_requester_on_provider_response AFTER UPDATE ON public.requests FOR EACH ROW EXECUTE PROCEDURE public.notify_requester_on_provider_response()';
  END IF;
END
$$;

COMMIT;
