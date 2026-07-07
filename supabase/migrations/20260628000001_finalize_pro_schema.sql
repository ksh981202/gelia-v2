-- 1. pro_lookbooks & pro_proposals 신규 컬럼 공식화
ALTER TABLE public.pro_lookbooks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.pro_lookbooks ADD COLUMN IF NOT EXISTS is_curation BOOLEAN DEFAULT false;

ALTER TABLE public.pro_proposals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.pro_proposals ADD COLUMN IF NOT EXISTS private_memo TEXT DEFAULT '';
ALTER TABLE public.pro_proposals ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;

-- 2. 기존 위험한 전면 개방 정책(개발용) 완전 폭파
DROP POLICY IF EXISTS "pro_lookbooks dev all access" ON public.pro_lookbooks;
DROP POLICY IF EXISTS "pro_proposals dev all access" ON public.pro_proposals;

-- 3. RLS 공식 가동 및 안전 정책 수립
ALTER TABLE public.pro_lookbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_proposals ENABLE ROW LEVEL SECURITY;

-- TODO(SSOT): 'k981202@naver.com' 큐레이션 권한 — 프론트 auth.ts ADMIN_EMAILS와 동기화.
-- 추후 env/DB 조회로 교체 시 신규 마이그레이션으로 RLS 정책 일괄 갱신 필요.

-- [내 컬렉션] 안전 정책
CREATE POLICY "컬렉션 조회 (본인 것 + 큐레이션)" ON public.pro_lookbooks FOR SELECT USING (auth.uid() = user_id OR is_curation = true);
CREATE POLICY "컬렉션 생성 (본인)" ON public.pro_lookbooks FOR INSERT WITH CHECK (auth.uid() = user_id AND (is_curation = false OR auth.jwt() ->> 'email' = 'k981202@naver.com'));
CREATE POLICY "컬렉션 수정 (본인)" ON public.pro_lookbooks FOR UPDATE USING (auth.uid() = user_id AND (is_curation = false OR auth.jwt() ->> 'email' = 'k981202@naver.com'));
CREATE POLICY "컬렉션 삭제 (본인)" ON public.pro_lookbooks FOR DELETE USING (auth.uid() = user_id AND (is_curation = false OR auth.jwt() ->> 'email' = 'k981202@naver.com'));

-- [상담 제안서] 안전 정책
DROP POLICY IF EXISTS "제안서 조회 (링크 공유용 전면 개방)" ON public.pro_proposals;
DROP POLICY IF EXISTS "제안서 조회 (원장 본인)" ON public.pro_proposals;
-- 제안서 조회: 원장님은 본인 row 전체 조회 가능 (private_memo 포함)
CREATE POLICY "제안서 조회 (원장 본인)" ON public.pro_proposals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "제안서 생성 (본인)" ON public.pro_proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "제안서 수정 (본인)" ON public.pro_proposals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "제안서 삭제 (본인)" ON public.pro_proposals FOR DELETE USING (auth.uid() = user_id);

-- 비회원 공유 링크용 안전 우체통: 테이블 직접 SELECT 차단, RPC로만 메모 제외 필드 반환
CREATE OR REPLACE FUNCTION public.get_public_proposal_share(p_proposal_id uuid)
RETURNS TABLE (
  customer_name text,
  greeting_message text,
  nail_ids text[],
  views integer,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.customer_name,
    p.greeting_message,
    p.nail_ids,
    p.views,
    p.is_active
  FROM public.pro_proposals p
  WHERE p.id = p_proposal_id
    AND COALESCE(p.is_active, true) = true;
END;
$$;

COMMENT ON FUNCTION public.get_public_proposal_share(uuid) IS
  '공유 링크 고객용 제안서 조회 — private_memo·user_id 미포함';

REVOKE ALL ON FUNCTION public.get_public_proposal_share(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_proposal_share(uuid) TO anon, authenticated;
