import { copyProposalShareLink } from "@/features/pro/api/proMutations";
import type { ProProposalListItem } from "@/features/pro/api/fetchProProposalsList";
import { useProProposalsListQuery } from "@/features/pro/api/useProProposalsListQuery";
import ProEditProposalModal from "@/pages/pro/components/ProEditProposalModal";
import { Loader2 } from "lucide-react";
import { useState, type MouseEvent } from "react";

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function ProSentProposalsPage() {
  const [editingProposal, setEditingProposal] = useState<ProProposalListItem | null>(null);
  const { data: proposals = [], isLoading, isError, refetch } = useProProposalsListQuery();

  const openEditModal = (proposal: ProProposalListItem) => {
    setEditingProposal(proposal);
  };

  const handleCopyLink = async (event: MouseEvent, proposalId: string) => {
    event.stopPropagation();
    try {
      await copyProposalShareLink(proposalId);
      window.alert("링크가 클립보드에 복사되었습니다!");
    } catch {
      window.alert("링크 복사에 실패했습니다.");
    }
  };

  const handleEditClick = (event: MouseEvent, proposal: ProProposalListItem) => {
    event.stopPropagation();
    openEditModal(proposal);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">📋 보낸 제안서 현황</h1>
        <p className="mt-2 text-sm text-stone-500">
          고객명을 클릭하거나 수정 버튼으로 제안서를 바로 편집할 수 있습니다.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#5C4A3A]" aria-hidden />
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
          <p className="text-sm text-stone-500">제안서 목록을 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-xl bg-[#EDE4D8] px-4 py-2 text-sm font-medium text-[#5C4A3A] hover:bg-[#E5D8C8]"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && proposals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-stone-500">아직 보낸 제안서가 없습니다.</p>
          <p className="mt-2 text-xs text-stone-400">
            우측 패널에서 디자인을 선택하고 상담 링크를 생성해 보세요.
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && proposals.length > 0 ? (
        <ul className="space-y-3">
          {proposals.map((proposal) => {
            const nailCount = proposal.nails.length || proposal.nail_ids.length;

            return (
              <li
                key={proposal.id}
                className="rounded-2xl border border-stone-200/80 bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => openEditModal(proposal)}
                    className="min-w-0 flex-1 text-left transition-colors hover:opacity-80"
                  >
                    <p className="truncate text-base font-semibold text-stone-800">
                      {proposal.customer_name}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                      <span>생성 {formatCreatedAt(proposal.created_at)}</span>
                      <span>조회 {proposal.views ?? 0}회</span>
                      <span>디자인 {nailCount}장</span>
                      {!proposal.is_active ? (
                        <span className="font-medium text-rose-500">종료됨</span>
                      ) : null}
                    </div>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={(event) => void handleCopyLink(event, proposal.id)}
                      className="rounded-lg border border-stone-200 bg-[#FAF7F2] px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-[#EDE4D8]"
                    >
                      [🔗 링크복사]
                    </button>
                    <button
                      type="button"
                      onClick={(event) => handleEditClick(event, proposal)}
                      className="rounded-lg border border-stone-200 bg-[#FAF7F2] px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-[#EDE4D8]"
                    >
                      [✏️ 수정]
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <ProEditProposalModal
        proposal={editingProposal}
        onClose={() => setEditingProposal(null)}
        onSaved={() => void refetch()}
      />
    </div>
  );
}
