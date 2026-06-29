-- GELIA PRO: 내 컬렉션 공유 링크용 안전 조회 RPC (비회원)
-- user_id 등 민감 필드는 반환하지 않음

CREATE OR REPLACE FUNCTION public.get_public_lookbook(p_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  nail_ids text[],
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.title,
    l.nail_ids,
    l.created_at
  FROM public.pro_lookbooks l
  WHERE l.id = p_id
    AND COALESCE(l.is_curation, false) = false;
END;
$$;

COMMENT ON FUNCTION public.get_public_lookbook(uuid) IS
  '공유 링크 고객용 룩북 조회 — user_id·is_curation 미포함, 개인 컬렉션만';

REVOKE ALL ON FUNCTION public.get_public_lookbook(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_lookbook(uuid) TO anon, authenticated;
