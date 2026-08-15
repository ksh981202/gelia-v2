-- GELIA V2 Security Patch (643)
-- 치명적 보안 구멍 봉쇄: gce_title_db 전면 개방 + nail_designs 과도한 UPDATE
-- TODO(SSOT): 관리자 이메일은 src/shared/constants/auth.ts ADMIN_EMAILS 와 동기화

DROP POLICY IF EXISTS "Allow all actions for gce_title_db" ON public.gce_title_db;

ALTER TABLE public.gce_title_db ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.gce_title_db FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.gce_title_db FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.gce_title_db TO authenticated;

DROP POLICY IF EXISTS "Admin only all actions for gce_title_db" ON public.gce_title_db;
CREATE POLICY "Admin only all actions for gce_title_db" ON public.gce_title_db
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'k981202@naver.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'k981202@naver.com');

DROP POLICY IF EXISTS "누구나 조회수 업데이트 가능" ON public.nail_designs;
