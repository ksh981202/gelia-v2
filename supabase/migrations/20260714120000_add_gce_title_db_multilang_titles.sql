-- gce_title_db: 다국어 매거진 제목 컬럼
ALTER TABLE public.gce_title_db
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS title_jp text,
  ADD COLUMN IF NOT EXISTS title_vn text,
  ADD COLUMN IF NOT EXISTS title_th text;
