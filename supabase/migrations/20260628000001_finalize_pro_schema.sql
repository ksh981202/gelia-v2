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

-- [내 컬렉션] 안전 정책
CREATE POLICY "컬렉션 조회 (본인 것 + 큐레이션)" ON public.pro_lookbooks FOR SELECT USING (auth.uid() = user_id OR is_curation = true);
CREATE POLICY "컬렉션 생성 (본인)" ON public.pro_lookbooks FOR INSERT WITH CHECK (auth.uid() = user_id AND (is_curation = false OR auth.jwt() ->> 'email' = 'k981202@naver.com'));
CREATE POLICY "컬렉션 수정 (본인)" ON public.pro_lookbooks FOR UPDATE USING (auth.uid() = user_id AND (is_curation = false OR auth.jwt() ->> 'email' = 'k981202@naver.com'));
CREATE POLICY "컬렉션 삭제 (본인)" ON public.pro_lookbooks FOR DELETE USING (auth.uid() = user_id AND (is_curation = false OR auth.jwt() ->> 'email' = 'k981202@naver.com'));

-- [상담 제안서] 안전 정책
CREATE POLICY "제안서 조회 (링크 공유용 전면 개방)" ON public.pro_proposals FOR SELECT USING (true);
CREATE POLICY "제안서 생성 (본인)" ON public.pro_proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "제안서 수정 (본인)" ON public.pro_proposals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "제안서 삭제 (본인)" ON public.pro_proposals FOR DELETE USING (auth.uid() = user_id);
