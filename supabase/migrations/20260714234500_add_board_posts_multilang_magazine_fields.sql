-- board_posts: 매거진 5개국어 제목/본문 + 발행시각
ALTER TABLE public.board_posts
  ADD COLUMN IF NOT EXISTS title_jp text,
  ADD COLUMN IF NOT EXISTS title_vn text,
  ADD COLUMN IF NOT EXISTS title_th text,
  ADD COLUMN IF NOT EXISTS content_jp text,
  ADD COLUMN IF NOT EXISTS content_vn text,
  ADD COLUMN IF NOT EXISTS content_th text,
  ADD COLUMN IF NOT EXISTS content_ko text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

UPDATE public.board_posts
SET content_ko = content
WHERE (content_ko IS NULL OR content_ko = '')
  AND content IS NOT NULL
  AND content <> '';
