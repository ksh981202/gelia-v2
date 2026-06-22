import { supabase } from "@/shared/api/supabaseClient";

export type NailActivityAction = "detail_view" | "save" | "unsave" | "share";

export async function trackNailActivity(
  nailId: string,
  action: NailActivityAction,
  userId?: string | null,
): Promise<void> {
  const nailDesignId = nailId.trim();
  if (!nailDesignId) return;

  const { error } = await supabase.from("nail_activity_events").insert({
    nail_id: nailDesignId,
    action,
    user_id: userId?.trim() || null,
  });

  if (error && import.meta.env.DEV) {
    console.warn("[nail-activity] tracking failed", { action, error });
  }
}
