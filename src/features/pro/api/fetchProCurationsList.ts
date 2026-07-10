import { fetchNailDesignsByIds } from "@/entities/nail-design/api/fetchNailDesignsByIds";
import type { ProLookbookListItem } from "@/features/pro/api/fetchProLookbooksList";
import type { ProCartNail } from "@/features/pro/store/useProCartStore";
import { toProCartNail } from "@/features/pro/store/useProCartStore";
import { resolveLookbookTitleEn } from "@/features/pro/lib/lookbookTitleI18n";
import { supabase } from "@/shared/api/supabaseClient";

export async function fetchProCurationsList(): Promise<ProLookbookListItem[]> {
  const { data, error } = await supabase
    .from("pro_lookbooks")
    .select("id, title, created_at, nail_ids")
    .eq("is_curation", true)
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
    title_en: resolveLookbookTitleEn(lookbook.title, lookbook.title_en),
    nails: (lookbook.nail_ids ?? [])
      .map((rawId) => nailsById.get(String(rawId ?? "").trim()))
      .filter((nail): nail is ProCartNail => Boolean(nail)),
  }));
}
