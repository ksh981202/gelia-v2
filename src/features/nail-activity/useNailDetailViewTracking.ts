import { useCurrentUserId } from "@/features/my-page/useCurrentUserId";
import { supabase } from "@/shared/api/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { trackNailActivity } from "./trackNailActivity";

export function useNailDetailViewTracking(nailId: string | undefined) {
  const queryClient = useQueryClient();
  const currentUserId = useCurrentUserId();
  const popularityTrackedRef = useRef<string | null>(null);
  const userViewTrackedRef = useRef<string | null>(null);
  const [optimisticViewNailId, setOptimisticViewNailId] = useState<string | null>(null);

  useEffect(() => {
    popularityTrackedRef.current = null;
    userViewTrackedRef.current = null;
    setOptimisticViewNailId(null);
  }, [nailId]);

  useEffect(() => {
    const nailDesignId = nailId?.trim();
    if (!nailDesignId) return;
    if (popularityTrackedRef.current === nailDesignId) return;

    popularityTrackedRef.current = nailDesignId;
    setOptimisticViewNailId(nailDesignId);

    void (async () => {
      try {
        const { error } = await supabase.rpc("increment_popularity", {
          nail_id: nailDesignId,
          increment_value: 1,
        });
        if (error) throw error;

        await queryClient.invalidateQueries({
          queryKey: ["nail-design", "detail", "supabase", nailDesignId],
        });
      } catch (error) {
        popularityTrackedRef.current = null;
        setOptimisticViewNailId((current) => (current === nailDesignId ? null : current));
        if (import.meta.env.DEV) {
          console.warn("[nail-activity] popularity increment failed", error);
        }
      }
    })();
  }, [nailId, queryClient]);

  useEffect(() => {
    const nailDesignId = nailId?.trim();
    if (!nailDesignId || !currentUserId) return;
    if (userViewTrackedRef.current === nailDesignId) return;

    userViewTrackedRef.current = nailDesignId;

    void (async () => {
      try {
        await trackNailActivity(nailDesignId, "detail_view", currentUserId);

        const { error: recentViewError } = await supabase.from("user_recent_views").upsert({
          user_id: currentUserId,
          nail_id: nailDesignId,
          viewed_at: new Date().toISOString(),
        });
        if (recentViewError) throw recentViewError;

        queryClient.invalidateQueries({ queryKey: ["my-page-count", "recent", currentUserId] });
        queryClient.invalidateQueries({ queryKey: ["my-page-gallery", "recent", currentUserId] });
        queryClient.invalidateQueries({ queryKey: ["my-nail-list", "recent", currentUserId] });
      } catch (error) {
        userViewTrackedRef.current = null;
        if (import.meta.env.DEV) {
          console.warn("[nail-activity] user view tracking failed", error);
        }
      }
    })();
  }, [nailId, currentUserId, queryClient]);

  return { optimisticViewNailId };
}
