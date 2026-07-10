import { useLanguageContext } from "@/contexts/LanguageContext";
import {
  copyLookbookShareLink,
  copyProposalShareLink,
  createProProposal,
  deleteProLookbook,
  duplicateProLookbook,
} from "@/features/pro/api/proMutations";
import type { ProLookbookListItem } from "@/features/pro/api/fetchProLookbooksList";
import { useProLookbooksListQuery } from "@/features/pro/api/useProLookbooksListQuery";
import { toProCartNail, useProCartStore, type ProCartNail } from "@/features/pro/store/useProCartStore";
import { useProUIStore } from "@/features/pro/store/useProUIStore";
import ProEditLookbookModal from "@/pages/pro/components/ProEditLookbookModal";
import ProQuickViewModal from "@/pages/pro/components/ProQuickViewModal";
import type { NailDesignRow } from "@/shared/types/database.types";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

function formatCreatedAt(value: string, isEnglish: boolean): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(isEnglish ? "en-US" : "ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function proCartNailToDetailRow(nail: ProCartNail): NailDesignRow {
  return {
    id: nail.id,
    title: nail.title,
    title_en: nail.titleEn ?? "",
    image_url: nail.imageUrl,
  } as NailDesignRow;
}

const PAGE_ROOT_CLASS = "flex h-full w-full flex-col";
const CARD_GRID_CLASS = "grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
const CARD_CONTAINER_CLASS =
  "rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md";
const CARD_ACTION_BTN_CLASS =
  "flex-1 rounded-md bg-stone-50 py-2 text-center text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100";
const CARD_DELETE_BTN_CLASS =
  "flex-1 rounded-md bg-red-50 py-2 text-center text-xs font-medium text-red-500 transition-colors hover:bg-red-100";
const PROPOSAL_FIELD_CLASS =
  "w-full rounded-xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 disabled:opacity-60";

export default function ProCollectionsPage() {
  const { isEnglish } = useLanguageContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id: collectionId } = useParams<{ id?: string }>();
  const [editTarget, setEditTarget] = useState<ProLookbookListItem | null>(null);
  const [viewingLookbook, setViewingLookbook] = useState<ProLookbookListItem | null>(null);
  const [selectedDetailNail, setSelectedDetailNail] = useState<NailDesignRow | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<ProLookbookListItem | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
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
    navigate(`/pro/collections/${lookbook.id}`);
  };

  const closeEditModal = useCallback(() => {
    setEditTarget(null);
    navigate("/pro/collections");
  }, [navigate]);

  useEffect(() => {
    if (isFocusMode || isLoading || !collectionId) {
      if (!collectionId) setEditTarget(null);
      return;
    }

    const target = lookbooks.find((lookbook) => lookbook.id === collectionId);
    if (target) {
      setEditTarget(target);
      return;
    }

    if (!isError && lookbooks.length > 0) {
      navigate("/pro/collections", { replace: true });
    }
  }, [collectionId, isFocusMode, isLoading, isError, lookbooks, navigate]);

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
      window.alert(isEnglish ? "Collection duplicated." : "컬렉션이 복제되었습니다.");
    } catch {
      window.alert(isEnglish ? "Failed to duplicate." : "복제에 실패했습니다.");
    }
  };

  const handleCopyLink = async (event: MouseEvent, lookbookId: string) => {
    event.stopPropagation();
    try {
      await copyLookbookShareLink(lookbookId);
      toast.success(
        isEnglish ? "Default share link copied." : "기본 공유 링크가 복사되었습니다.",
      );
    } catch {
      toast.error(isEnglish ? "Failed to copy link." : "링크 복사에 실패했습니다.");
    }
  };

  const handleDeleteClick = async (event: MouseEvent, lookbook: ProLookbookListItem) => {
    event.stopPropagation();
    if (
      !window.confirm(
        isEnglish
          ? "Are you sure you want to delete this collection?"
          : "이 컬렉션을 정말 삭제하시겠습니까?",
      )
    ) {
      return;
    }
    try {
      await deleteProLookbook(lookbook.id);
      if (editTarget?.id === lookbook.id) {
        closeEditModal();
      }
      await refetch();
      window.alert(isEnglish ? "Collection deleted." : "컬렉션이 삭제되었습니다.");
    } catch {
      window.alert(isEnglish ? "Failed to delete collection." : "컬렉션 삭제에 실패했습니다.");
    }
  };

  const openProposalModal = (event: MouseEvent, lookbook: ProLookbookListItem) => {
    event.stopPropagation();
    setSelectedCollection(lookbook);
    setCustomerName("");
    setGreeting("");
    setIsProposalModalOpen(true);
  };

  const closeProposalModal = useCallback(() => {
    if (isCreatingProposal) return;
    setIsProposalModalOpen(false);
    setSelectedCollection(null);
    setCustomerName("");
    setGreeting("");
  }, [isCreatingProposal]);

  const handleCreateProposalAndCopy = async () => {
    if (!selectedCollection || isCreatingProposal) return;

    const nailIds = (selectedCollection.nail_ids ?? [])
      .map((id) => String(id ?? "").trim())
      .filter(Boolean);

    setIsCreatingProposal(true);
    try {
      const proposalId = await createProProposal({
        customerName,
        greetingMessage: greeting,
        nailIds,
      });
      await copyProposalShareLink(proposalId);
      setIsProposalModalOpen(false);
      setSelectedCollection(null);
      setCustomerName("");
      setGreeting("");
      toast.success(
        isEnglish ? "Proposal link copied!" : "상담 제안서 링크가 복사되었습니다!",
        {
          description: isEnglish
            ? "You can view and manage created proposals anytime in [Proposals] on the left."
            : "생성된 내역은 좌측 [상담 제안서] 메뉴에서 언제든 확인하고 관리할 수 있습니다.",
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["pro-proposals", "list"] });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isEnglish
            ? "Failed to create proposal."
            : "제안서 생성에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsCreatingProposal(false);
    }
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
            {isEnglish ? "← Back" : "← 뒤로 가기"}
          </button>
          <h2 className="text-3xl font-bold text-stone-800">
            ✨{" "}
            {isEnglish
              ? viewingLookbook.title_en || viewingLookbook.title
              : viewingLookbook.title}
          </h2>
        </div>

        <div className="columns-2 gap-6 md:columns-3 lg:columns-4">
          {viewingLookbook.nails.map((nail) => {
            const nailTitle = isEnglish
              ? nail.titleEn || nail.title
              : nail.title;
            return (
            <div key={nail.id} className="mb-6 break-inside-avoid">
              <button
                type="button"
                onClick={() => setSelectedDetailNail(proCartNailToDetailRow(nail))}
                className="block w-full text-left transition-opacity hover:opacity-90"
              >
                {nail.imageUrl ? (
                  <img
                    src={nail.imageUrl}
                    alt={nailTitle}
                    className="w-full rounded-xl object-cover shadow-sm"
                    draggable={false}
                  />
                ) : (
                  <div className="aspect-[3/4] w-full rounded-xl bg-stone-200 shadow-sm" aria-hidden />
                )}
              </button>
              <p className="mt-2 truncate text-center text-sm font-medium text-stone-700">{nailTitle}</p>
            </div>
            );
          })}
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
          <div className="mb-4 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-end gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-stone-800 md:text-3xl">
                {isEnglish ? "✨ VIP Design Lookbook" : "✨ VIP 디자인 룩북"}
              </h1>
            </div>
            <div className="border-l-4 border-stone-200 py-1 pl-4">
              <p className="text-base font-medium text-stone-600">
                {isEnglish
                  ? "👑 A custom lookbook curated by theme by the director."
                  : "👑 원장님이 테마별로 직접 엄선해 둔 맞춤형 룩북입니다."}
              </p>
              <p className="mt-1 text-base text-stone-600">
                {isEnglish
                  ? "💎 Choose a lookbook you like and browse comfortably."
                  : "💎 마음에 드는 룩북을 선택해 편안하게 감상해 보세요."}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-sm">
            <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-stone-800">
              {isEnglish ? "⭐ My Collection" : "⭐ 내 컬렉션"}
            </h1>
            <p className="text-sm font-medium text-stone-500">
              {isEnglish
                ? "Organize frequently used designs into folders and deliver tailored proposals to clients."
                : "자주 쓰는 디자인을 폴더로 묶어 관리하고, 상담 제안서로 고객에게 맞춤 룩북을 전달하세요."}
            </p>
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#5C4A3A]" aria-hidden />
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
          <p className="text-sm text-stone-500">
            {isEnglish ? "Failed to load collections." : "컬렉션 목록을 불러오지 못했습니다."}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-xl bg-[#EDE4D8] px-4 py-2 text-sm font-medium text-[#5C4A3A] hover:bg-[#E5D8C8]"
          >
            {isEnglish ? "Retry" : "다시 시도"}
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && lookbooks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-stone-500">
            {isFocusMode
              ? isEnglish
                ? "No lookbooks available yet."
                : "아직 준비된 룩북이 없습니다."
              : isEnglish
                ? "No saved collections yet."
                : "아직 저장된 컬렉션이 없습니다."}
          </p>
          {!isFocusMode ? (
            <p className="mt-2 text-xs text-stone-400">
              {isEnglish
                ? "Select designs from the right panel and save them to a collection."
                : "우측 패널에서 디자인을 선택하고 컬렉션으로 저장해 보세요."}
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
              isEnglish={isEnglish}
              onImageClick={() =>
                isFocusMode ? setViewingLookbook(lookbook) : openEditModal(lookbook)
              }
              onSendProposal={(event) => openProposalModal(event, lookbook)}
              onDuplicate={(event) => void handleDuplicate(event, lookbook)}
              onCopyLink={(event) => void handleCopyLink(event, lookbook.id)}
              onDelete={(event) => void handleDeleteClick(event, lookbook)}
            />
          ))}
        </div>
      ) : null}

      {!isFocusMode && editTarget ? (
        <ProEditLookbookModal
          lookbook={editTarget}
          onClose={closeEditModal}
          onSaved={() => {
            void refetch();
            closeEditModal();
          }}
        />
      ) : null}

      {!isFocusMode && isProposalModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={isCreatingProposal ? undefined : closeProposalModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-proposal-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="collection-proposal-modal-title" className="text-xl font-semibold text-stone-800">
              {isEnglish ? "Create Proposal Link" : "상담 제안서 링크 생성"}
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="collection-proposal-customer-name"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  {isEnglish ? "Customer Name" : "고객명"}
                </label>
                <input
                  id="collection-proposal-customer-name"
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder={
                    isEnglish
                      ? "Customer name (e.g., Jane Doe)"
                      : "고객 이름 (예: 김지영 고객님)"
                  }
                  disabled={isCreatingProposal}
                  className={PROPOSAL_FIELD_CLASS}
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="collection-proposal-greeting"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  {isEnglish ? "Greeting" : "인사말"}
                </label>
                <textarea
                  id="collection-proposal-greeting"
                  value={greeting}
                  onChange={(event) => setGreeting(event.target.value)}
                  rows={3}
                  placeholder={
                    isEnglish
                      ? "Write a short welcome message for your client. (e.g., Recommended designs for your wedding shoot.)"
                      : "고객에게 전달할 짧은 환영 메시지를 적어주세요. (예: 웨딩 촬영에 어울릴 추천 디자인입니다.)"
                  }
                  disabled={isCreatingProposal}
                  className={`${PROPOSAL_FIELD_CLASS} resize-none leading-relaxed`}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeProposalModal}
                disabled={isCreatingProposal}
                className="flex-1 rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition-colors hover:bg-orange-50/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isEnglish ? "[ Cancel ]" : "[ 취소 ]"}
              </button>
              <button
                type="button"
                onClick={() => void handleCreateProposalAndCopy()}
                disabled={isCreatingProposal || !customerName.trim()}
                className="flex-1 rounded-xl bg-stone-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingProposal
                  ? isEnglish
                    ? "Creating..."
                    : "생성 중..."
                  : isEnglish
                    ? "[ Create & Copy Link ]"
                    : "[ 링크 생성 및 복사 ]"}
              </button>
            </div>
          </div>
        </div>
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
  isEnglish,
  onImageClick,
  onSendProposal,
  onDuplicate,
  onCopyLink,
  onDelete,
}: {
  lookbook: ProLookbookListItem;
  isFocusMode: boolean;
  isEnglish: boolean;
  onImageClick: () => void;
  onSendProposal: (event: MouseEvent) => void;
  onDuplicate: (event: MouseEvent) => void;
  onCopyLink: (event: MouseEvent) => void;
  onDelete: (event: MouseEvent) => void;
}) {
  const nailCount = lookbook.nails.length || lookbook.nail_ids.length;
  const createdLabel = formatCreatedAt(lookbook.created_at, isEnglish);

  return (
    <article className={CARD_CONTAINER_CLASS}>
      <button
        type="button"
        onClick={onImageClick}
        className="w-full cursor-pointer text-left transition-opacity hover:opacity-95"
        aria-label={isEnglish ? `Open ${lookbook.title}` : `${lookbook.title} 열기`}
      >
        <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-stone-100">
          <LookbookCoverImage nails={lookbook.nails} />
        </div>
      </button>
      <h3 className="truncate text-lg font-bold text-stone-800">{lookbook.title}</h3>
      <p className="mb-4 text-xs text-stone-500">
        {isEnglish
          ? `Created ${createdLabel} · ${nailCount} Designs`
          : `생성 ${createdLabel} · 디자인 ${nailCount}개`}
      </p>
      {!isFocusMode ? (
        <div className="border-t border-stone-100 pt-3">
          <button
            type="button"
            onClick={onSendProposal}
            className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-stone-400 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-500"
          >
            <span aria-hidden>📝</span>
            {isEnglish ? "Create Proposal" : "상담 제안서로 만들기"}
          </button>
          <div className="flex w-full items-center gap-1.5">
            <button type="button" onClick={onDuplicate} className={CARD_ACTION_BTN_CLASS}>
              {isEnglish ? "📑 Duplicate" : "📑 복제"}
            </button>
            <button type="button" onClick={onCopyLink} className={CARD_ACTION_BTN_CLASS}>
              {isEnglish ? "🔗 Copy Link" : "🔗 기본 링크"}
            </button>
            <button type="button" onClick={onDelete} className={CARD_DELETE_BTN_CLASS}>
              {isEnglish ? "🗑️ Delete" : "🗑️ 삭제"}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
