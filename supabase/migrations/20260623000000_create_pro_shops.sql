-- GELIA PRO: 샵 프로필 및 PRO 회원 식별 테이블
-- pro_shops에 행이 있으면 PRO 회원으로 간주

CREATE TABLE IF NOT EXISTS public.pro_shops (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  instagram_url text,
  map_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pro_shops IS 'GELIA PRO: 원장님 샵 프로필 (존재 시 PRO 회원)';
COMMENT ON COLUMN public.pro_shops.user_id IS 'Supabase Auth 사용자 ID (PK)';
COMMENT ON COLUMN public.pro_shops.shop_name IS '네일샵 이름';
COMMENT ON COLUMN public.pro_shops.instagram_url IS '인스타그램 프로필/게시물 URL';
COMMENT ON COLUMN public.pro_shops.map_url IS '네이버 지도 등 샵 위치 URL';

ALTER TABLE public.pro_shops ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pro_shops TO authenticated;
REVOKE ALL ON TABLE public.pro_shops FROM anon;

CREATE POLICY "pro_shops select own"
  ON public.pro_shops
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "pro_shops insert own"
  ON public.pro_shops
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pro_shops update own"
  ON public.pro_shops
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pro_shops delete own"
  ON public.pro_shops
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
