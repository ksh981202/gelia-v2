-- GELIA V2 Security Patch (643)
-- 치명적 보안 구멍 봉쇄: gce_title_db 전면 개방 + nail_designs 과도한 UPDATE
-- TODO(SSOT): 관리자 이메일은 src/shared/constants/auth.ts ADMIN_EMAILS 와 동기화

-- =============================================================================
-- 1. gce_title_db 전면 개방 정책 삭제
-- =============================================================================
DROP POLICY IF EXISTS "Allow all actions for gce_title_db" ON public.gce_title_db;

ALTER TABLE public.gce_title_db ENABLE ROW LEVEL SECURITY;

-- anon / 일반 authenticated 쓰기·읽기 권한 회수 (관리자 JWT 정책만 허용)
REVOKE ALL ON TABLE public.gce_title_db FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.gce_title_db FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.gce_title_db TO authenticated;

-- 2. 오직 관리자(k981202@naver.com)만 읽고/쓰고/지울 수 있는 강력한 정책 생성
DROP POLICY IF EXISTS "Admin only all actions for gce_title_db" ON public.gce_title_db;
CREATE POLICY "Admin only all actions for gce_title_db" ON public.gce_title_db
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'k981202@naver.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'k981202@naver.com');

-- =============================================================================
-- 3. nail_designs: 누구나 UPDATE 가능하던 과도한 정책 제거
--    (조회수/좋아요는 security definer RPC로 처리 — 컬럼 전면 UPDATE 우회 차단)
-- =============================================================================
DROP POLICY IF EXISTS "누구나 조회수 업데이트 가능" ON public.nail_designs;
