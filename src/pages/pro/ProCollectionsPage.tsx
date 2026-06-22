import { copyLookbookShareLink, duplicateProLookbook } from "@/features/pro/api/proMutations";
import type { ProLookbookListItem } from "@/features/pro/api/fetchProLookbooksList";
import { useProLookbooksListQuery } from "@/features/pro/api/useProLookbooksListQuery";
import { toProCartNail, useProCartStore, type ProCartNail } from "@/features/pro/store/useProCartStore";
import { useProUIStore } from "@/features/pro/store/useProUIStore";
import ProEditLookbookModal from "@/pages/pro/components/ProEditLookbookModal";
import ProQuickViewModal from "@/pages/pro/components/ProQuickViewModal";
import type { NailDesignRow } from "@/shared/types/database.types";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function proCartNailToDetailRow(nail: ProCartNail): NailDesignRow {
  return {
    id: nail.id,
    title: nail.title,
    image_url: nail.imageUrl,
  } as NailDesignRow;
}

const PAGE_ROOT_CLASS = "flex h-full w-full flex-col";
const CARD_GRID_CLASS = "grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
const CARD_CONTAINER_CLASS =
  "cursor-pointer rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md";
const ADMIN_BTN_CLASS =
  "rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-200";
const ADMIN_BTN_DANGER_CLASS =
  "rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50";

export default function ProCollectionsPage() {
  const [editTarget, setEditTarget] = useState<ProLookbookListItem | null>(null);
  const [viewingLookbook, setViewingLookbook] = useState<ProLookbookListItem | null>(null);
  const [selectedDetailNail, setSelectedDetailNail] = useState<NailDesignRow | null>(null);
  const isFocusMode = useProUIStore((state) => state.isFocusMode);
  const selectedNails = useProCartStore((state) => state.selectedNails);
  const toggleNail = useProCartStore((state) => state.toggleNail);
  const { data: lookbooks = [], isLoading, isError, refetch } = useProLookbooksListQuery();

  const selectedIdSet = useMemo(() => new Set(selectedNails.map((nail) => nail.id)), [selectedNails]);

  useEffect(() => {
    if (!isFocusMode) {
      setViewingLookbook(null);
      setSelectedDetailNail(null);
      return;
    }
    setEditTarget(null);
  }, [isFocusMode]);

  const openEditModal = (lookbook: ProLookbookListItem) => {
    setEditTarget(lookbook);
  };

  const handleToggleNail = useCallback(
    (item: NailDesignRow) => {
      toggleNail(toProCartNail(item));
    },
    [toggleNail],
  );

  const handleDuplicate = async (event: MouseEvent, lookbook: ProLookbookListItem) => {
    event.stopPropagation();
    try {
      await duplicateProLookbook(lookbook);
      await refetch();
      window.alert("컬렉션이 복제되었습니다.");
    } catch {
      window.alert("복제에 실패했습니다.");
    }
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

  if (isFocusMode && viewingLookbook) {
    return (
      <div className={PAGE_ROOT_CLASS}>
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setViewingLookbook(null);
              setSelectedDetailNail(null);
            }}
            className="font-medium text-stone-500 transition-colors hover:text-stone-800"
          >
            ← 뒤로 가기
          </button>
          <h2 className="text-3xl font-bold text-stone-800">✨ {viewingLookbook.title}</h2>
        </div>

        <div className="columns-2 gap-6 md:columns-3 lg:columns-4">
          {viewingLookbook.nails.map((nail) => (
            <div key={nail.id} className="mb-6 break-inside-avoid">
              <button
                type="button"
                onClick={() => setSelectedDetailNail(proCartNailToDetailRow(nail))}
                className="block w-full text-left transition-opacity hover:opacity-90"
              >
                {nail.imageUrl ? (
                  <img
                    src={nail.imageUrl}
                    alt={nail.title}
                    className="w-full rounded-xl object-cover shadow-sm"
                    draggable={false}
                  />
                ) : (
                  <div className="aspect-[3/4] w-full rounded-xl bg-stone-200 shadow-sm" aria-hidden />
                )}
              </button>
              <p className="mt-2 truncate text-center text-sm font-medium text-stone-700">{nail.title}</p>
            </div>
          ))}
        </div>

        <ProQuickViewModal
          nail={selectedDetailNail}
          isSelected={selectedDetailNail ? selectedIdSet.has(selectedDetailNail.id) : false}
          onClose={() => setSelectedDetailNail(null)}
          onToggleSelect={handleToggleNail}
        />
      </div>
    );
  }

  return (
    <div className={PAGE_ROOT_CLASS}>
      <header className="mb-8">
        {isFocusMode ? (
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-stone-800">✨ VIP 디자인 룩북</h1>
            <div className="mt-4 border-l-4 border-stone-200 py-1 pl-4 text-base leading-relaxed text-stone-600">
              <p>👑 원장님이 직접 엄선한 맞춤형 디자인 컬렉션입니다.</p>
              <p className="mt-1">💎 마음에 드는 룩북을 편안하게 둘러보세요.</p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-stone-800">⭐ 내 컬렉션</h1>
            <p className="mt-2 text-sm text-stone-500">
              자주 쓰는 디자인을 폴더로 묶어 관리하고, 고정 링크로 언제든 공유하세요.
            </p>
          </>
        )}
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
          <p className="text-sm text-stone-500">
            {isFocusMode ? "아직 준비된 룩북이 없습니다." : "아직 저장된 컬렉션이 없습니다."}
          </p>
          {!isFocusMode ? (
            <p className="mt-2 text-xs text-stone-400">
              우측 패널에서 디자인을 선택하고 컬렉션으로 저장해 보세요.
            </p>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !isError && lookbooks.length > 0 ? (
        <div className={CARD_GRID_CLASS}>
          {lookbooks.map((lookbook) => (
            <LookbookCard
              key={lookbook.id}
              lookbook={lookbook}
              isFocusMode={isFocusMode}
              onImageClick={() =>
                isFocusMode ? setViewingLookbook(lookbook) : openEditModal(lookbook)
              }
              onOpenEdit={(event) => {
                event.stopPropagation();
                openEditModal(lookbook);
              }}
              onDuplicate={(event) => void handleDuplicate(event, lookbook)}
              onCopyLink={(event) => void handleCopyLink(event, lookbook.id)}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : null}

      {!isFocusMode && editTarget ? (
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

function LookbookCoverImage({ nails }: { nails: ProCartNail[] }) {
  const preview = nails.slice(0, 3);

  if (preview.length === 0) {
    return <div className="h-full w-full bg-stone-200" aria-hidden />;
  }

  if (preview.length === 1) {
    return (
      <img
        src={preview[0].imageUrl}
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
      />
    );
  }

  if (preview.length === 2) {
    return (
      <div className="grid h-full w-full grid-cols-2 gap-1">
        {preview.map((nail) => (
          <img
            key={nail.id}
            src={nail.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1">
      <img
        src={preview[0].imageUrl}
        alt=""
        className="row-span-2 h-full w-full object-cover"
        draggable={false}
      />
      <img
        src={preview[1].imageUrl}
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
      />
      <img
        src={preview[2].imageUrl}
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
      />
    </div>
  );
}

function LookbookCard({
  lookbook,
  isFocusMode,
  onImageClick,
  onOpenEdit,
  onDuplicate,
  onCopyLink,
  onDelete,
}: {
  lookbook: ProLookbookListItem;
  isFocusMode: boolean;
  onImageClick: () => void;
  onOpenEdit: (event: MouseEvent) => void;
  onDuplicate: (event: MouseEvent) => void;
  onCopyLink: (event: MouseEvent) => void;
  onDelete: (event: MouseEvent) => void;
}) {
  const nailCount = lookbook.nails.length || lookbook.nail_ids.length;

  return (
    <article className={CARD_CONTAINER_CLASS}>
      <button type="button" onClick={onImageClick} className="w-full text-left">
        <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-stone-100">
          <LookbookCoverImage nails={lookbook.nails} />
        </div>
      </button>
      <h3 className="truncate text-lg font-bold text-stone-800">{lookbook.title}</h3>
      <p className="mb-4 text-xs text-stone-500">
        생성 {formatCreatedAt(lookbook.created_at)} · 디자인 {nailCount}장
      </p>
      {!isFocusMode ? (
        <div className="flex flex-wrap gap-2 border-t border-stone-100 pt-3">
          <button type="button" onClick={onOpenEdit} className={ADMIN_BTN_CLASS}>
            열기/수정
          </button>
          <button type="button" onClick={onDuplicate} className={ADMIN_BTN_CLASS}>
            복제
          </button>
          <button type="button" onClick={onCopyLink} className={ADMIN_BTN_CLASS}>
            링크복사
          </button>
          <button type="button" onClick={onDelete} className={ADMIN_BTN_DANGER_CLASS}>
            삭제
          </button>
        </div>
      ) : null}
    </article>
  );
}
