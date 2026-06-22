import { useCurrentUserId } from "@/features/my-page/useCurrentUserId";
import { supabase } from "@/shared/api/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type ReactionState = {
  key: string;
  isLiked: boolean;
};

export function useNailLikeToggle(nailId: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = useCurrentUserId();
  const reactionKey = `${nailId?.trim() ?? ""}:${currentUserId ?? ""}`;

  const [reactionOverride, setReactionOverride] = useState<ReactionState | null>(null);
  const [dbReactionState, setDbReactionState] = useState<ReactionState>({ key: "", isLiked: false });

  const storedIsLiked = dbReactionState.key === reactionKey ? dbReactionState.isLiked : false;
  const isLiked = reactionOverride?.key === reactionKey ? reactionOverride.isLiked : storedIsLiked;

  useEffect(() => {
    const nailDesignId = nailId?.trim();
    if (!nailDesignId || !currentUserId) return;

    let cancelled = false;

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("user_likes")
          .select("nail_id")
          .eq("user_id", currentUserId)
          .eq("nail_id", nailDesignId)
          .maybeSingle();

        if (error) throw error;
        if (cancelled) return;

        setDbReactionState({
          key: reactionKey,
          isLiked: Boolean(data),
        });
        setReactionOverride(null);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("[nail-activity] like state load failed", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nailId, currentUserId, reactionKey]);

  const toggleLike = useCallback(() => {
    const nailDesignId = nailId?.trim();
    if (!nailDesignId) return;

    if (!currentUserId) {
      alert("로그인이 필요한 기능입니다.");
      navigate("/login");
      return;
    }

    const next = !isLiked;
    const previousState: ReactionState = { key: reactionKey, isLiked };

    setReactionOverride({ key: reactionKey, isLiked: next });
    setDbReactionState({ key: reactionKey, isLiked: next });

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
        setReactionOverride(previousState);
        setDbReactionState(previousState);
        if (import.meta.env.DEV) {
          console.warn("[nail-activity] like update failed", error);
        }
      }
    })();
  }, [currentUserId, isLiked, nailId, navigate, queryClient, reactionKey]);

  return {
    isLiked,
    toggleLike,
  };
}
