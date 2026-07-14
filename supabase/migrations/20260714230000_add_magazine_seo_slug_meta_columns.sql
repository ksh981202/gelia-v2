-- 매거진 SEO: URL 슬러그 + 5개국어 메타 요약
ALTER TABLE public.board_posts
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS meta_ko text,
  ADD COLUMN IF NOT EXISTS meta_en text,
  ADD COLUMN IF NOT EXISTS meta_jp text,
  ADD COLUMN IF NOT EXISTS meta_vn text,
  ADD COLUMN IF NOT EXISTS meta_th text;

ALTER TABLE public.gce_title_db
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS meta_ko text,
  ADD COLUMN IF NOT EXISTS meta_en text,
  ADD COLUMN IF NOT EXISTS meta_jp text,
  ADD COLUMN IF NOT EXISTS meta_vn text,
  ADD COLUMN IF NOT EXISTS meta_th text;
