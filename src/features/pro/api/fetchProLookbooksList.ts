import { fetchNailDesignsByIds } from "@/entities/nail-design/api/fetchNailDesignsByIds";
import type { ProCartNail } from "@/features/pro/store/useProCartStore";
import { toProCartNail } from "@/features/pro/store/useProCartStore";
import { supabase } from "@/shared/api/supabaseClient";

export type ProLookbookListItem = {
  id: string;
  title: string;
  created_at: string;
  nail_ids: string[];
  nails: ProCartNail[];
};

export async function fetchProLookbooksList(): Promise<ProLookbookListItem[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("pro_lookbooks")
    .select("id, title, created_at, nail_ids")
    .eq("user_id", user.id)
    .or("is_curation.eq.false,is_curation.is.null")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const lookbooks = (data ?? []) as Omit<ProLookbookListItem, "nails">[];

  const orderedUniqueIds: string[] = [];
  const seenIds = new Set<string>();
  for (const lookbook of lookbooks) {
    for (const rawId of lookbook.nail_ids ?? []) {
      const id = String(rawId ?? "").trim();
      if (!id || seenIds.has(id)) continue;
      seenIds.add(id);
      orderedUniqueIds.push(id);
    }
  }

  const nailRows = await fetchNailDesignsByIds(orderedUniqueIds);
  const nailsById = new Map(nailRows.map((row) => [row.id, toProCartNail(row)]));

  return lookbooks.map((lookbook) => ({
    ...lookbook,
    nails: (lookbook.nail_ids ?? [])
      .map((rawId) => nailsById.get(String(rawId ?? "").trim()))
      .filter((nail): nail is ProCartNail => Boolean(nail)),
  }));
}
