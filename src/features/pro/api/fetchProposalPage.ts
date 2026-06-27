import { fetchNailDesignsByIds } from "@/entities/nail-design/api/fetchNailDesignsByIds";
import { supabase } from "@/shared/api/supabaseClient";
import type { NailDesignRow } from "@/shared/types/database.types";

export type ProposalPageData = {
  customerName: string;
  greetingMessage: string | null;
  nails: NailDesignRow[];
};

async function incrementProposalViews(proposalId: string, currentViews: number): Promise<void> {
  const lastViewedAt = new Date().toISOString();

  const { error: rpcError } = await supabase.rpc("increment_proposal_view", {
    p_proposal_id: proposalId,
  });

  if (!rpcError) return;

  const { error: updateError } = await supabase
    .from("pro_proposals")
    .update({
      views: currentViews + 1,
      last_viewed_at: lastViewedAt,
    })
    .eq("id", proposalId);

  if (updateError) {
    console.warn("[fetchProposalPage] views increment failed:", updateError.message, rpcError.message);
  }
}

export async function fetchProposalPage(proposalId: string): Promise<ProposalPageData | null> {
  const trimmedId = proposalId.trim();
  if (!trimmedId) return null;

  const { data: proposal, error } = await supabase
    .from("pro_proposals")
    .select("customer_name, greeting_message, nail_ids, views, is_active")
    .eq("id", trimmedId)
    .maybeSingle();

  if (error) throw error;
  if (!proposal || proposal.is_active === false) return null;

  const nailIds = Array.isArray(proposal.nail_ids)
    ? proposal.nail_ids.filter((id): id is string => Boolean(id?.trim()))
    : [];

  await incrementProposalViews(trimmedId, Number(proposal.views ?? 0));

  const nails = await fetchNailDesignsByIds(nailIds);

  return {
    customerName: String(proposal.customer_name ?? "").trim() || "고객님",
    greetingMessage: proposal.greeting_message
      ? String(proposal.greeting_message).trim()
      : null,
    nails,
  };
}
