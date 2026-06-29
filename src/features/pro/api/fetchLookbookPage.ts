import { fetchNailDesignsByIds } from "@/entities/nail-design/api/fetchNailDesignsByIds";
import { supabase } from "@/shared/api/supabaseClient";
import type { NailDesignRow } from "@/shared/types/database.types";

export type LookbookPageData = {
  id: string;
  title: string;
  createdAt: string | null;
  nails: NailDesignRow[];
};

type LookbookShareRow = {
  id?: string | null;
  title?: string | null;
  nail_ids?: string[] | null;
  created_at?: string | null;
};

async function fetchLookbookShareRow(lookbookId: string): Promise<LookbookShareRow | null> {
  const { data: rows, error: rpcError } = await supabase.rpc("get_public_lookbook", {
    p_id: lookbookId,
  });

  if (!rpcError) {
    const lookbook = (Array.isArray(rows) ? rows[0] : rows) as LookbookShareRow | undefined;
    return lookbook ?? null;
  }

  const { data, error: selectError } = await supabase
    .from("pro_lookbooks")
    .select("id, title, nail_ids, created_at")
    .eq("id", lookbookId)
    .eq("is_curation", false)
    .maybeSingle();

  if (selectError) {
    console.warn(
      "[fetchLookbookPage] RPC and direct select failed:",
      rpcError.message,
      selectError.message,
    );
    return null;
  }

  return (data as LookbookShareRow | null) ?? null;
}

export async function fetchLookbookPage(lookbookId: string): Promise<LookbookPageData | null> {
  const trimmedId = lookbookId.trim();
  if (!trimmedId) return null;

  const lookbook = await fetchLookbookShareRow(trimmedId);
  if (!lookbook?.id) return null;

  const nailIds = Array.isArray(lookbook.nail_ids)
    ? lookbook.nail_ids.filter((id): id is string => Boolean(id?.trim()))
    : [];

  const nails = await fetchNailDesignsByIds(nailIds);

  return {
    id: String(lookbook.id),
    title: String(lookbook.title ?? "").trim() || "룩북 컬렉션",
    createdAt: lookbook.created_at ? String(lookbook.created_at) : null,
    nails,
  };
}
