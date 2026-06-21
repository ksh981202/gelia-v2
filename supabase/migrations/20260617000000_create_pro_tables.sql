-- GELIA PRO: B2B 전용 룩북(컬렉션) 및 상담 제안서 테이블
-- 기존 B2C 테이블(nail_designs 등)은 수정하지 않음

-- 1. pro_lookbooks — 내 컬렉션 / 즐겨찾기
CREATE TABLE IF NOT EXISTS public.pro_lookbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  nail_ids text[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pro_lookbooks IS 'GELIA PRO: 원장님 룩북(컬렉션) 저장';
COMMENT ON COLUMN public.pro_lookbooks.title IS '룩북 제목 (예: 여름 바캉스 20선)';
COMMENT ON COLUMN public.pro_lookbooks.nail_ids IS '담긴 nail_designs.id 목록 (text[])';

-- 2. pro_proposals — 1:1 상담 제안서
CREATE TABLE IF NOT EXISTS public.pro_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  greeting_message text,
  nail_ids text[] NOT NULL,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

COMMENT ON TABLE public.pro_proposals IS 'GELIA PRO: 고객별 상담 제안서(공유 링크) 저장';
COMMENT ON COLUMN public.pro_proposals.customer_name IS '고객명 (예: 김지영 고객님)';
COMMENT ON COLUMN public.pro_proposals.greeting_message IS '원장님 환영 인사말';
COMMENT ON COLUMN public.pro_proposals.nail_ids IS '제안서에 포함된 nail_designs.id 목록 (text[])';
COMMENT ON COLUMN public.pro_proposals.views IS '공유 링크 조회수';
COMMENT ON COLUMN public.pro_proposals.is_active IS '링크 활성 여부 (false 시 종료 처리)';

-- 3. RLS 활성화
ALTER TABLE public.pro_lookbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_proposals ENABLE ROW LEVEL SECURITY;

-- 4. API 접근 권한 (개발 단계: anon / authenticated)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pro_lookbooks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pro_proposals TO anon, authenticated;

-- 5. 임시 개발용 느슨한 RLS 정책 (추후 PRO 인증·샵 단위로 고도화 예정)
CREATE POLICY "pro_lookbooks dev all access"
  ON public.pro_lookbooks
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "pro_proposals dev all access"
  ON public.pro_proposals
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
