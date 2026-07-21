-- 매거진 조회수 (board_posts) + 경량 RPC
ALTER TABLE public.board_posts
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count_ko integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count_en integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count_jp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count_vn integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count_th integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_view_count(post_id uuid, view_lang text DEFAULT 'ko')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lang_key text := lower(trim(coalesce(view_lang, 'ko')));
BEGIN
  IF post_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.board_posts
  SET
    view_count = COALESCE(view_count, 0) + 1,
    view_count_ko = COALESCE(view_count_ko, 0) + CASE WHEN lang_key = 'ko' THEN 1 ELSE 0 END,
    view_count_en = COALESCE(view_count_en, 0) + CASE WHEN lang_key = 'en' THEN 1 ELSE 0 END,
    view_count_jp = COALESCE(view_count_jp, 0) + CASE WHEN lang_key = 'jp' THEN 1 ELSE 0 END,
    view_count_vn = COALESCE(view_count_vn, 0) + CASE WHEN lang_key = 'vn' THEN 1 ELSE 0 END,
    view_count_th = COALESCE(view_count_th, 0) + CASE WHEN lang_key = 'th' THEN 1 ELSE 0 END
  WHERE id = post_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid, text) TO anon, authenticated;
