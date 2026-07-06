-- B2C 컬렉션 폴더 (client_folders / client_folder_items)

CREATE TABLE IF NOT EXISTS public.client_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.client_folder_items (
  folder_id uuid NOT NULL REFERENCES public.client_folders (id) ON DELETE CASCADE,
  nail_id uuid NOT NULL REFERENCES public.nail_designs (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (folder_id, nail_id)
);

CREATE INDEX IF NOT EXISTS idx_client_folders_user_id_created_at
  ON public.client_folders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_folder_items_folder_id_created_at
  ON public.client_folder_items (folder_id, created_at DESC);

ALTER TABLE public.client_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_folder_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.client_folders TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.client_folders TO authenticated;

GRANT SELECT ON TABLE public.client_folder_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.client_folder_items TO authenticated;

-- client_folders: 공개 폴더 또는 소유자 조회
DROP POLICY IF EXISTS "client_folders_select_public_or_owner" ON public.client_folders;
CREATE POLICY "client_folders_select_public_or_owner"
  ON public.client_folders
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "client_folders_insert_owner" ON public.client_folders;
CREATE POLICY "client_folders_insert_owner"
  ON public.client_folders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "client_folders_update_owner" ON public.client_folders;
CREATE POLICY "client_folders_update_owner"
  ON public.client_folders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "client_folders_delete_owner" ON public.client_folders;
CREATE POLICY "client_folders_delete_owner"
  ON public.client_folders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- client_folder_items: 공개 폴더 항목 또는 소유자 폴더 항목 조회
DROP POLICY IF EXISTS "client_folder_items_select_public_or_owner" ON public.client_folder_items;
CREATE POLICY "client_folder_items_select_public_or_owner"
  ON public.client_folder_items
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.client_folders f
      WHERE f.id = client_folder_items.folder_id
        AND (f.is_public = true OR f.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "client_folder_items_insert_owner" ON public.client_folder_items;
CREATE POLICY "client_folder_items_insert_owner"
  ON public.client_folder_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.client_folders f
      WHERE f.id = client_folder_items.folder_id
        AND f.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "client_folder_items_update_owner" ON public.client_folder_items;
CREATE POLICY "client_folder_items_update_owner"
  ON public.client_folder_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.client_folders f
      WHERE f.id = client_folder_items.folder_id
        AND f.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.client_folders f
      WHERE f.id = client_folder_items.folder_id
        AND f.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "client_folder_items_delete_owner" ON public.client_folder_items;
CREATE POLICY "client_folder_items_delete_owner"
  ON public.client_folder_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.client_folders f
      WHERE f.id = client_folder_items.folder_id
        AND f.user_id = auth.uid()
    )
  );
