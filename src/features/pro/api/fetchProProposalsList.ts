import { fetchNailDesignsByIds } from "@/entities/nail-design/api/fetchNailDesignsByIds";
import type { ProCartNail } from "@/features/pro/store/useProCartStore";
import { toProCartNail } from "@/features/pro/store/useProCartStore";
import { supabase } from "@/shared/api/supabaseClient";

export type ProProposalListItem = {
  id: string;
  customer_name: string;
  greeting_message: string | null;
  created_at: string;
  views: number;
  nail_ids: string[];
  is_active: boolean;
  nails: ProCartNail[];
};

export async function fetchProProposalsList(): Promise<ProProposalListItem[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("pro_proposals")
    .select("id, customer_name, greeting_message, created_at, views, nail_ids, is_active")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const proposals = (data ?? []) as Omit<ProProposalListItem, "nails">[];

  const orderedUniqueIds: string[] = [];
  const seenIds = new Set<string>();
  for (const proposal of proposals) {
    for (const rawId of proposal.nail_ids ?? []) {
      const id = String(rawId ?? "").trim();
      if (!id || seenIds.has(id)) continue;
      seenIds.add(id);
      orderedUniqueIds.push(id);
    }
  }

  const nailRows = await fetchNailDesignsByIds(orderedUniqueIds);
  const nailsById = new Map(nailRows.map((row) => [row.id, toProCartNail(row)]));

  return proposals.map((proposal) => ({
    ...proposal,
    nails: (proposal.nail_ids ?? [])
      .map((rawId) => nailsById.get(String(rawId ?? "").trim()))
      .filter((nail): nail is ProCartNail => Boolean(nail)),
  }));
}
