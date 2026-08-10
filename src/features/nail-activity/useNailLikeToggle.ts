import { useCurrentUserId } from "@/features/my-page/useCurrentUserId";
import {
  isNailLikedInStorage,
  persistNailLikeState,
} from "@/shared/lib/likedNailsStorage";
import { supabase } from "@/shared/api/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom"; // 610: 비회원 좋아요 — login redirect 비활성

type ReactionState = {
  key: string;
  isLiked: boolean;
};

export function useNailLikeToggle(nailId: string | undefined) {
  // const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = useCurrentUserId();
  const reactionKey = `${nailId?.trim() ?? ""}:${currentUserId ?? ""}`;

  const [reactionOverride, setReactionOverride] = useState<ReactionState | null>(null);
  const [dbReactionState, setDbReactionState] = useState<ReactionState>({ key: "", isLiked: false });

  const storedIsLiked = dbReactionState.key === reactionKey ? dbReactionState.isLiked : false;
  const isLiked = reactionOverride?.key === reactionKey ? reactionOverride.isLiked : storedIsLiked;

  useEffect(() => {
    const nailDesignId = nailId?.trim();
    if (!nailDesignId) return;

    // 641: 하트 UI도 게스트 키 SSOT로 복원 (세션 무관)
    setDbReactionState({
      key: reactionKey,
      isLiked: isNailLikedInStorage(nailDesignId, null),
    });
    setReactionOverride(null);
  }, [nailId, reactionKey]);

  const toggleLike = useCallback(() => {
    const nailDesignId = nailId?.trim();
    if (!nailDesignId) return;

    // 610: 비회원 로그인 강제 리다이렉트 해제
    // if (!currentUserId) {
    //   alert("로그인이 필요한 기능입니다.");
    //   navigate("/login");
    //   return;
    // }

    const next = !isLiked;
    const previousState: ReactionState = { key: reactionKey, isLiked };

    setReactionOverride({ key: reactionKey, isLiked: next });
    setDbReactionState({ key: reactionKey, isLiked: next });

    // 641: 서랍장 SSOT — 세션 무관 게스트 키 강제 적재
    persistNailLikeState(nailDesignId, next, null);

    // 비회원: 카운트 RPC best-effort (실패해도 UI/로컬 유지)
    if (!currentUserId) {
      void (async () => {
        try {
          await supabase.rpc("increment_likes", {
            nail_id: nailDesignId,
            increment_value: next ? 1 : -1,
          });
          await queryClient.invalidateQueries({
            queryKey: ["nail-design", "detail", "supabase", nailDesignId],
          });
          queryClient.invalidateQueries({ queryKey: ["nail-designs", "reaction-best"] });
        } catch (error) {
          // silently keep optimistic UI
          if (import.meta.env.DEV) {
            console.warn("[nail-activity] guest like count rpc failed", error);
          }
        }
      })();
      return;
    }

    void (async () => {
      try {
        const query = supabase.from("user_likes");
        const { error } = next
          ? await query.insert({ user_id: currentUserId, nail_id: nailDesignId })
          : await query.delete().match({ user_id: currentUserId, nail_id: nailDesignId });
        if (error) throw error;

        const { error: likeCountError } = await supabase.rpc("increment_likes", {
          nail_id: nailDesignId,
          increment_value: next ? 1 : -1,
        });
        if (likeCountError) throw likeCountError;

        await queryClient.invalidateQueries({ queryKey: ["nail-design", "detail", "supabase", nailDesignId] });
        queryClient.invalidateQueries({ queryKey: ["nail-designs", "reaction-best"] });
        queryClient.invalidateQueries({ queryKey: ["my-page-count", "liked", currentUserId] });
        queryClient.invalidateQueries({ queryKey: ["my-page-gallery", "liked", currentUserId] });
        queryClient.invalidateQueries({ queryKey: ["my-nail-list", "liked", currentUserId] });
      } catch (error) {
        // 회원: DB 실패 시 롤백 (게스트 로컬도 원복)
        setReactionOverride(previousState);
        setDbReactionState(previousState);
        persistNailLikeState(nailDesignId, previousState.isLiked, null);
        if (import.meta.env.DEV) {
          console.warn("[nail-activity] like update failed", error);
        }
      }
    })();
  }, [currentUserId, isLiked, nailId, queryClient, reactionKey]);

  return {
    isLiked,
    toggleLike,
  };
}
