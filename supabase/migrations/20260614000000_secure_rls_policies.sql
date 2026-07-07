-- GELIA V2: lock down public write paths for core content tables.
-- Public reads remain available, but writes are restricted to the owner admin account.

-- 1. Remove previously loose anonymous write/delete policies.
DROP POLICY IF EXISTS "Enable insert for all users" ON public.nail_designs;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.nail_designs;
DROP POLICY IF EXISTS "nail_designs_insert_anon_authenticated" ON public.nail_designs;
DROP POLICY IF EXISTS "nail_designs_delete_anon_authenticated" ON public.nail_designs;
DROP POLICY IF EXISTS "Admin full access nail_designs" ON public.nail_designs;

-- TODO(SSOT): 아래 'k981202@naver.com'은 프론트 auth.ts ADMIN_EMAILS와 동기화됨.
-- 추후 app.settings, admin_roles 테이블, 또는 Supabase Vault/env로 교체 권장 (마이그레이션 신규 작성 필요).

-- 2. nail_designs: public read stays, only the admin email can insert/update/delete.
ALTER TABLE public.nail_designs ENABLE ROW LEVEL SECURITY;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.nail_designs FROM anon;
GRANT INSERT, UPDATE, DELETE ON TABLE public.nail_designs TO authenticated;

CREATE POLICY "Admin full access nail_designs" ON public.nail_designs
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'k981202@naver.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'k981202@naver.com');

-- 3. board_posts: everyone can read active content through app queries, admin alone can edit.
ALTER TABLE public.board_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read board_posts" ON public.board_posts;
DROP POLICY IF EXISTS "Admin full access board_posts" ON public.board_posts;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.board_posts FROM anon;
GRANT SELECT ON TABLE public.board_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.board_posts TO authenticated;

CREATE POLICY "Public read board_posts" ON public.board_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin full access board_posts" ON public.board_posts
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'k981202@naver.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'k981202@naver.com');
