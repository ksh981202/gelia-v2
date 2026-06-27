-- GELIA PRO: 공유 제안서 열람 추적 (views + last_viewed_at)
-- anon 고객 링크 열람 시 RLS를 우회하여 안전하게 카운트·타임스탬프 기록

ALTER TABLE public.pro_proposals
  ADD COLUMN IF NOT EXISTS last_viewed_at timestamptz;

COMMENT ON COLUMN public.pro_proposals.last_viewed_at IS '공유 링크 마지막 열람 시각';

CREATE OR REPLACE FUNCTION public.increment_proposal_view(p_proposal_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.pro_proposals
  SET
    views = COALESCE(views, 0) + 1,
    last_viewed_at = now()
  WHERE id = p_proposal_id
    AND COALESCE(is_active, true) = true;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_proposal_view(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_proposal_view(uuid) TO anon, authenticated;
