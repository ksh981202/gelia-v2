import { supabase } from "@/shared/api/supabaseClient";

const PROPOSAL_SHARE_BASE_URL = "https://gelia.app/proposal";
const LOOKBOOK_SHARE_BASE_URL = "https://gelia.app/lookbook";

export function buildProposalShareUrl(proposalId: string): string {
  return `${PROPOSAL_SHARE_BASE_URL}/${proposalId}`;
}

export function buildLookbookShareUrl(lookbookId: string): string {
  return `${LOOKBOOK_SHARE_BASE_URL}/${lookbookId}`;
}

export async function saveProLookbook(title: string, nailIds: string[]): Promise<void> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error("컬렉션 이름을 입력해 주세요.");
  }
  if (nailIds.length === 0) {
    throw new Error("저장할 디자인을 먼저 선택해 주세요.");
  }

  const { data, error } = await supabase
    .from("pro_lookbooks")
    .insert({
      title: trimmedTitle,
      nail_ids: nailIds,
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("컬렉션 저장 결과를 확인할 수 없습니다.");
  }
}

export async function createProProposal(input: {
  customerName: string;
  greetingMessage: string;
  nailIds: string[];
}): Promise<string> {
  const customerName = input.customerName.trim();
  if (!customerName) {
    throw new Error("고객명을 입력해 주세요.");
  }
  if (input.nailIds.length === 0) {
    throw new Error("제안서에 담을 디자인을 먼저 선택해 주세요.");
  }

  const { data, error } = await supabase
    .from("pro_proposals")
    .insert({
      customer_name: customerName,
      greeting_message: input.greetingMessage.trim() || null,
      nail_ids: input.nailIds,
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("제안서 ID를 받지 못했습니다.");
  }

  return String(data.id);
}

export async function updateProLookbook(
  id: string,
  input: {
    title: string;
    nailIds: string[];
  },
): Promise<void> {
  const lookbookId = id.trim();
  if (!lookbookId) {
    throw new Error("수정할 컬렉션 ID가 없습니다.");
  }

  const title = input.title.trim();
  if (!title) {
    throw new Error("컬렉션 이름을 입력해 주세요.");
  }
  if (input.nailIds.length === 0) {
    throw new Error("컬렉션에 담을 디자인을 1개 이상 선택해 주세요.");
  }

  const { data, error } = await supabase
    .from("pro_lookbooks")
    .update({
      title,
      nail_ids: input.nailIds,
    })
    .eq("id", lookbookId)
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("컬렉션 수정 결과를 확인할 수 없습니다.");
  }
}

export async function updateProProposal(
  id: string,
  input: {
    customerName: string;
    greetingMessage: string;
    nailIds: string[];
  },
): Promise<void> {
  const proposalId = id.trim();
  if (!proposalId) {
    throw new Error("수정할 제안서 ID가 없습니다.");
  }

  const customerName = input.customerName.trim();
  if (!customerName) {
    throw new Error("고객명을 입력해 주세요.");
  }
  if (input.nailIds.length === 0) {
    throw new Error("제안서에 담을 디자인을 1개 이상 선택해 주세요.");
  }

  const { data, error } = await supabase
    .from("pro_proposals")
    .update({
      customer_name: customerName,
      greeting_message: input.greetingMessage.trim() || null,
      nail_ids: input.nailIds,
    })
    .eq("id", proposalId)
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("제안서 수정 결과를 확인할 수 없습니다.");
  }
}

export async function copyProposalShareLink(proposalId: string): Promise<string> {
  const shareUrl = buildProposalShareUrl(proposalId);
  await navigator.clipboard.writeText(shareUrl);
  return shareUrl;
}

export async function copyLookbookShareLink(lookbookId: string): Promise<string> {
  const shareUrl = buildLookbookShareUrl(lookbookId);
  await navigator.clipboard.writeText(shareUrl);
  return shareUrl;
}
