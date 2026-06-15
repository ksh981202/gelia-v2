-- GELIA V2: harden public RPC counters and close direct activity-event inserts.
-- This migration keeps public read paths intact while blocking write amplification.

-- 1. Counter RPC hardening: only +1 / -1 is allowed and counts never go below 0.
CREATE OR REPLACE FUNCTION public.increment_likes(nail_id uuid, increment_value integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF increment_value NOT IN (-1, 1) THEN
    RAISE EXCEPTION 'increment_value must be -1 or 1';
  END IF;

  UPDATE public.nail_designs
  SET
    likes = GREATEST(0, COALESCE(likes, 0) + increment_value),
    updated_at = now()
  WHERE id = nail_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_saves(nail_id uuid, increment_value integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF increment_value NOT IN (-1, 1) THEN
    RAISE EXCEPTION 'increment_value must be -1 or 1';
  END IF;

  UPDATE public.nail_designs
  SET
    saves = GREATEST(0, COALESCE(saves, 0) + increment_value),
    updated_at = now()
  WHERE id = nail_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_popularity(nail_id uuid, increment_value integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF increment_value NOT IN (-1, 1) THEN
    RAISE EXCEPTION 'increment_value must be -1 or 1';
  END IF;

  UPDATE public.nail_designs
  SET
    popularity = GREATEST(0, COALESCE(popularity, 0) + increment_value),
    updated_at = now()
  WHERE id = nail_id;
END;
$$;

-- 2. Search keyword RPC hardening: normalize, strip special characters, cap length.
CREATE OR REPLACE FUNCTION public.log_search_keyword(search_term text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_term text;
BEGIN
  normalized_term := regexp_replace(
    lower(trim(COALESCE(search_term, ''))),
    '[^[:alnum:][:space:]가-힣ㄱ-ㅎㅏ-ㅣ]',
    '',
    'g'
  );
  normalized_term := regexp_replace(normalized_term, '[[:space:]]+', ' ', 'g');
  normalized_term := left(trim(normalized_term), 30);

  IF normalized_term = '' THEN
    RETURN;
  END IF;

  INSERT INTO public.search_stats (keyword, search_count, updated_at)
  VALUES (normalized_term, 1, now())
  ON CONFLICT (keyword)
  DO UPDATE SET
    search_count = public.search_stats.search_count + 1,
    updated_at = now();
END;
$$;

-- 3. nail_activity_events: block direct client inserts to prevent anonymous flooding.
ALTER TABLE public.nail_activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nail_activity_events_insert_anon_authenticated"
  ON public.nail_activity_events;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.nail_activity_events FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.nail_activity_events FROM authenticated;

-- Activity events must now be written only from trusted server-side code
-- such as an Edge Function using privileged credentials or a separately
-- hardened RPC with abuse controls.
