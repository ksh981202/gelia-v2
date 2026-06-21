import { copyLookbookShareLink } from "@/features/pro/api/proMutations";
import type { ProLookbookListItem } from "@/features/pro/api/fetchProLookbooksList";
import { useProLookbooksListQuery } from "@/features/pro/api/useProLookbooksListQuery";
import ProEditLookbookModal from "@/pages/pro/components/ProEditLookbookModal";
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

export default function ProCollectionsPage() {
  const [editTarget, setEditTarget] = useState<ProLookbookListItem | null>(null);
  const { data: lookbooks = [], isLoading, isError, refetch } = useProLookbooksListQuery();

  const openEditModal = (lookbook: ProLookbookListItem) => {
    console.log("수정 버튼 클릭됨:", lookbook);
    setEditTarget(lookbook);
  };

  const handleCopyLink = async (event: MouseEvent, lookbookId: string) => {
    event.stopPropagation();
    try {
      await copyLookbookShareLink(lookbookId);
      window.alert("링크가 클립보드에 복사되었습니다!");
    } catch {
      window.alert("링크 복사에 실패했습니다.");
    }
  };

  const handleDeleteClick = (event: MouseEvent) => {
    event.stopPropagation();
    window.alert("준비 중");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">⭐ 내 컬렉션</h1>
        <p className="mt-2 text-sm text-stone-500">
          자주 쓰는 디자인을 폴더로 묶어 관리하고, 고정 링크로 언제든 공유하세요.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#5C4A3A]" aria-hidden />
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
          <p className="text-sm text-stone-500">컬렉션 목록을 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-xl bg-[#EDE4D8] px-4 py-2 text-sm font-medium text-[#5C4A3A] hover:bg-[#E5D8C8]"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && lookbooks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-stone-500">아직 저장된 컬렉션이 없습니다.</p>
          <p className="mt-2 text-xs text-stone-400">
            우측 패널에서 디자인을 선택하고 컬렉션으로 저장해 보세요.
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && lookbooks.length > 0 ? (
        <ul className="space-y-3">
          {lookbooks.map((lookbook) => (
            <LookbookListItem
              key={lookbook.id}
              lookbook={lookbook}
              onOpenEdit={() => openEditModal(lookbook)}
              onCopyLink={(event) => void handleCopyLink(event, lookbook.id)}
              onEdit={(event) => {
                event.stopPropagation();
                openEditModal(lookbook);
              }}
              onDelete={handleDeleteClick}
            />
          ))}
        </ul>
      ) : null}

      {editTarget ? (
        <ProEditLookbookModal
          lookbook={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            void refetch();
            setEditTarget(null);
          }}
        />
      ) : null}
    </div>
  );
}

function LookbookListItem({
  lookbook,
  onOpenEdit,
  onCopyLink,
  onEdit,
  onDelete,
}: {
  lookbook: ProLookbookListItem;
  onOpenEdit: () => void;
  onCopyLink: (event: MouseEvent) => void;
  onEdit: (event: MouseEvent) => void;
  onDelete: (event: MouseEvent) => void;
}) {
  const nailCount = lookbook.nails.length || lookbook.nail_ids.length;

  return (
    <li className="rounded-2xl border border-stone-200/80 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onOpenEdit}
          className="min-w-0 flex-1 cursor-pointer text-left transition-colors hover:text-stone-600"
        >
          <p className="truncate text-base font-semibold text-stone-800">{lookbook.title}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
            <span>생성 {formatCreatedAt(lookbook.created_at)}</span>
            <span>디자인 {nailCount}장</span>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCopyLink}
            className="rounded-lg border border-stone-200 bg-[#FAF7F2] px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-[#EDE4D8]"
          >
            [ 🔗 링크 복사 ]
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-stone-200 bg-[#FAF7F2] px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-[#EDE4D8]"
          >
            [ ✏️ 수정 ]
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-stone-200 bg-[#FAF7F2] px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-[#EDE4D8]"
          >
            [ 🗑️ 삭제 ]
          </button>
        </div>
      </div>
    </li>
  );
}
