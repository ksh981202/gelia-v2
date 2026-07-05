-- B2C 내 컬렉션: 기본 보관함(user_saves) + 커스텀 폴더(client_folder_items) 고유 nail_id 총합

CREATE OR REPLACE FUNCTION public.get_user_unique_collection_count(p_user_id uuid)
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'not authorized to read collection count for this user';
  END IF;

  RETURN (
    SELECT COUNT(*)::bigint
    FROM (
      SELECT us.nail_id
      FROM public.user_saves AS us
      WHERE us.user_id = p_user_id
      UNION
      SELECT cfi.nail_id
      FROM public.client_folder_items AS cfi
      INNER JOIN public.client_folders AS cf ON cf.id = cfi.folder_id
      WHERE cf.user_id = p_user_id
    ) AS unique_nails
  );
END;
$$;

COMMENT ON FUNCTION public.get_user_unique_collection_count(uuid) IS
  'B2C 컬렉션 전역 카운터 — user_saves와 client_folder_items를 UNION DISTINCT 합산한 고유 nail_id 개수';

REVOKE ALL ON FUNCTION public.get_user_unique_collection_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_unique_collection_count(uuid) TO authenticated;
