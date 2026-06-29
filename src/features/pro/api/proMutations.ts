import { supabase } from "@/shared/api/supabaseClient";

async function requireAuthenticatedUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  const userId = data.user?.id?.trim();
  if (!userId) {
    throw new Error("로그인이 필요합니다. 다시 로그인 후 시도해 주세요.");
  }

  return userId;
}

const PROPOSAL_SHARE_BASE_URL = "https://gelia.app/proposal";
const LOOKBOOK_SHARE_BASE_URL = "https://gelia.app/lookbook";

export function buildProposalShareUrl(proposalId: string): string {
  const base =
    typeof window !== "undefined" && window.location?.origin
      ? `${window.location.origin}/proposal`
      : PROPOSAL_SHARE_BASE_URL;
  return `${base}/${proposalId}`;
}

export function buildLookbookShareUrl(lookbookId: string): string {
  const base =
    typeof window !== "undefined" && window.location?.origin
      ? `${window.location.origin}/lookbook`
      : LOOKBOOK_SHARE_BASE_URL;
  return `${base}/${lookbookId}`;
}

export async function copyLookbookShareLink(lookbookId: string): Promise<string> {
  const shareUrl = buildLookbookShareUrl(lookbookId);
  await navigator.clipboard.writeText(shareUrl);
  return shareUrl;
}

export async function saveProLookbook(title: string, nailIds: string[]): Promise<void> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error("컬렉션 이름을 입력해 주세요.");
  }
  if (nailIds.length === 0) {
    throw new Error("저장할 디자인을 먼저 선택해 주세요.");
  }

  const userId = await requireAuthenticatedUserId();

  const { data, error } = await supabase
    .from("pro_lookbooks")
    .insert({
      title: trimmedTitle,
      nail_ids: nailIds,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("컬렉션 저장 결과를 확인할 수 없습니다.");
  }
}

export async function createProCuration(title: string, nailIds: string[]): Promise<void> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error("큐레이션 이름을 입력해 주세요.");
  }
  if (nailIds.length === 0) {
    throw new Error("큐레이션에 담을 디자인을 1개 이상 선택해 주세요.");
  }

  const userId = await requireAuthenticatedUserId();

  const { data, error } = await supabase
    .from("pro_lookbooks")
    .insert({
      title: trimmedTitle,
      nail_ids: nailIds,
      is_curation: true,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("큐레이션 저장 결과를 확인할 수 없습니다.");
  }
}

export async function duplicateProLookbook(lookbook: {
  title: string;
  nail_ids: string[];
}): Promise<void> {
  const title = `${lookbook.title.trim()} (복사본)`;
  const nailIds = (lookbook.nail_ids ?? []).map((id) => String(id ?? "").trim()).filter(Boolean);

  if (!title.replace(/\s*\(복사본\)$/, "").trim()) {
    throw new Error("복제할 컬렉션 이름이 없습니다.");
  }

  const userId = await requireAuthenticatedUserId();

  const { data, error } = await supabase
    .from("pro_lookbooks")
    .insert({
      title,
      nail_ids: nailIds,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("컬렉션 복제 결과를 확인할 수 없습니다.");
  }
}

export async function saveCurationToMyCollection(lookbook: {
  title: string;
  nail_ids: string[];
}): Promise<void> {
  const title = lookbook.title.trim();
  const nailIds = (lookbook.nail_ids ?? []).map((id) => String(id ?? "").trim()).filter(Boolean);

  if (!title) {
    throw new Error("담을 컬렉션 이름이 없습니다.");
  }
  if (nailIds.length === 0) {
    throw new Error("담을 디자인이 없습니다.");
  }

  const userId = await requireAuthenticatedUserId();

  const { data, error } = await supabase
    .from("pro_lookbooks")
    .insert({
      title,
      nail_ids: nailIds,
      is_curation: false,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("내 컬렉션 담기 결과를 확인할 수 없습니다.");
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

  const userId = await requireAuthenticatedUserId();

  const { data, error } = await supabase
    .from("pro_proposals")
    .insert({
      customer_name: customerName,
      greeting_message: input.greetingMessage.trim() || null,
      nail_ids: input.nailIds,
      user_id: userId,
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
    privateMemo?: string;
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
      ...(input.privateMemo !== undefined
        ? { private_memo: input.privateMemo.trim() || null }
        : {}),
    })
    .eq("id", proposalId)
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("제안서 수정 결과를 확인할 수 없습니다.");
  }
}

export async function updateProProposalPrivateMemo(
  id: string,
  privateMemo: string,
): Promise<void> {
  const proposalId = id.trim();
  if (!proposalId) {
    throw new Error("수정할 제안서 ID가 없습니다.");
  }

  const { data, error } = await supabase
    .from("pro_proposals")
    .update({ private_memo: privateMemo.trim() || null })
    .eq("id", proposalId)
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("프라이빗 메모 저장 결과를 확인할 수 없습니다.");
  }
}

export async function copyProposalShareLink(proposalId: string): Promise<string> {
  const shareUrl = buildProposalShareUrl(proposalId);
  await navigator.clipboard.writeText(shareUrl);
  return shareUrl;
}

export async function deactivateProProposal(proposalId: string): Promise<void> {
  const id = proposalId.trim();
  if (!id) {
    throw new Error("종료할 제안서 ID가 없습니다.");
  }

  const { data, error } = await supabase
    .from("pro_proposals")
    .update({ is_active: false })
    .eq("id", id)
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("제안서 종료 결과를 확인할 수 없습니다.");
  }
}

export async function deleteProProposal(proposalId: string): Promise<void> {
  const id = proposalId.trim();
  if (!id) {
    throw new Error("삭제할 제안서 ID가 없습니다.");
  }

  const { data, error } = await supabase.from("pro_proposals").delete().eq("id", id).select("id").single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("제안서 삭제 결과를 확인할 수 없습니다.");
  }
}

export async function deleteProLookbook(lookbookId: string): Promise<void> {
  const id = lookbookId.trim();
  if (!id) {
    throw new Error("삭제할 컬렉션 ID가 없습니다.");
  }

  const { data, error } = await supabase.from("pro_lookbooks").delete().eq("id", id).select("id").single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("컬렉션 삭제 결과를 확인할 수 없습니다.");
  }
}
