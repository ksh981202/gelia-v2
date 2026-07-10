import { useLanguageContext } from "@/contexts/LanguageContext";
import {
  copyProposalShareLink,
  deleteProProposal,
  updateProProposalPrivateMemo,
} from "@/features/pro/api/proMutations";
import type { ProProposalListItem } from "@/features/pro/api/fetchProProposalsList";
import { useProProposalsListQuery } from "@/features/pro/api/useProProposalsListQuery";
import { toProCartNail, useProCartStore, type ProCartNail } from "@/features/pro/store/useProCartStore";
import { useProUIStore } from "@/features/pro/store/useProUIStore";
import ProEditProposalModal from "@/pages/pro/components/ProEditProposalModal";
import ProQuickViewModal from "@/pages/pro/components/ProQuickViewModal";
import type { NailDesignRow } from "@/shared/types/database.types";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
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

function getTimeAgo(dateString: string, isEnglish: boolean) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (isEnglish) {
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    if (diffMonths < 12) return `${diffMonths} months ago`;
    return `${diffYears} years ago`;
  }

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffWeeks < 4) return `${diffWeeks}주일 전`;
  if (diffMonths < 12) return `${diffMonths}개월 전`;
  return `${diffYears}년 전`;
}

const PAGE_ROOT_CLASS = "flex h-full w-full flex-col";
const CARD_GRID_CLASS = "grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
const CARD_CONTAINER_CLASS =
  "cursor-pointer rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md";
const ADMIN_BTN_CLASS =
  "flex-1 min-w-0 whitespace-nowrap rounded-full bg-stone-100 px-2 py-1 text-[11px] font-semibold text-stone-700 transition-colors hover:bg-stone-200";
const ADMIN_BTN_DANGER_CLASS =
  "flex-1 min-w-0 whitespace-nowrap rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50";
const DASHBOARD_WIDGET_CLASS =
  "flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-sm";

function proCartNailToDetailRow(nail: ProCartNail): NailDesignRow {
  return {
    id: nail.id,
    title: nail.title,
    image_url: nail.imageUrl,
  } as NailDesignRow;
}

export default function ProSentProposalsPage() {
  const { isEnglish } = useLanguageContext();
  const [editingProposal, setEditingProposal] = useState<ProProposalListItem | null>(null);
  const [viewingProposal, setViewingProposal] = useState<ProProposalListItem | null>(null);
  const [selectedDetailNail, setSelectedDetailNail] = useState<NailDesignRow | null>(null);
  const [viewFilter, setViewFilter] = useState<"all" | "read" | "unread">("all");
  const isFocusMode = useProUIStore((state) => state.isFocusMode);
  const selectedNails = useProCartStore((state) => state.selectedNails);
  const toggleNail = useProCartStore((state) => state.toggleNail);
  const { data: proposals = [], isLoading, isError, refetch } = useProProposalsListQuery();

  const selectedIdSet = useMemo(() => new Set(selectedNails.map((nail) => nail.id)), [selectedNails]);

  const proposalStats = useMemo(() => {
    const today = new Date().toLocaleDateString();
    const totalProposals = proposals.length;
    const readProposals = proposals.filter((proposal) => (proposal.views ?? 0) > 0).length;
    const readRate =
      totalProposals === 0 ? 0 : Math.floor((readProposals / totalProposals) * 100);
    const totalViews = proposals.reduce((sum, proposal) => sum + (proposal.views ?? 0), 0);
    const todayViewedCount = proposals.filter(
      (proposal) =>
        proposal.last_viewed_at &&
        new Date(proposal.last_viewed_at).toLocaleDateString() === today,
    ).length;

    return {
      totalViews,
      totalProposals,
      readRate,
      todayViewedCount,
    };
  }, [proposals]);

  const filteredProposals = useMemo(() => {
    if (viewFilter === "read") {
      return proposals.filter((proposal) => (proposal.views ?? 0) > 0);
    }
    if (viewFilter === "unread") {
      return proposals.filter((proposal) => (proposal.views ?? 0) === 0);
    }
    return proposals;
  }, [proposals, viewFilter]);

  useEffect(() => {
    if (!isFocusMode) {
      setViewingProposal(null);
      setSelectedDetailNail(null);
      return;
    }
    setEditingProposal(null);
  }, [isFocusMode]);

  const handleToggleNail = useCallback(
    (item: NailDesignRow) => {
      toggleNail(toProCartNail(item));
    },
    [toggleNail],
  );

  const openEditModal = (proposal: ProProposalListItem) => {
    setEditingProposal(proposal);
  };

  const handleCopyLink = async (event: MouseEvent, proposalId: string) => {
    event.stopPropagation();
    try {
      await copyProposalShareLink(proposalId);
      toast.success(
        isEnglish
          ? "🔗 Link copied! Paste it anywhere to share."
          : "🔗 링크가 복사되었습니다! 원하는 곳에 붙여넣기하여 공유해 보세요.",
      );
    } catch {
      toast.error(isEnglish ? "Failed to copy link." : "링크 복사에 실패했습니다.");
    }
  };

  const handleDeleteClick = async (event: MouseEvent, proposal: ProProposalListItem) => {
    event.stopPropagation();
    if (
      !window.confirm(
        isEnglish
          ? "Are you sure you want to delete this proposal? (The client will no longer be able to view the link.)"
          : "이 제안서를 정말 삭제하시겠습니까? (삭제 시 고객이 링크를 볼 수 없습니다)",
      )
    ) {
      return;
    }
    try {
      await deleteProProposal(proposal.id);
      await refetch();
      window.alert(isEnglish ? "Proposal deleted." : "제안서가 삭제되었습니다.");
    } catch {
      window.alert(isEnglish ? "Failed to delete proposal." : "제안서 삭제에 실패했습니다.");
    }
  };

  if (isFocusMode && viewingProposal) {
    return (
      <div className={PAGE_ROOT_CLASS}>
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setViewingProposal(null);
              setSelectedDetailNail(null);
            }}
            className="font-medium text-stone-500 transition-colors hover:text-stone-800"
          >
            ← {isEnglish ? "Back" : "뒤로 가기"}
          </button>
          <h2 className="text-3xl font-bold text-stone-800">💌 {viewingProposal.customer_name}</h2>
        </div>

        <div className="columns-2 gap-6 md:columns-3 lg:columns-4">
          {viewingProposal.nails.map((nail) => (
            <div key={nail.id} className="mb-6 break-inside-avoid">
              <button
                type="button"
                onClick={() => setSelectedDetailNail(proCartNailToDetailRow(nail))}
                className="block w-full cursor-pointer text-left transition-opacity hover:opacity-90"
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
          <div className="mb-4 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-end gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-stone-800 md:text-3xl">
                💌 {isEnglish ? "Private Custom Proposal" : "프라이빗 맞춤 제안서"}
              </h1>
            </div>
            <div className="border-l-4 border-stone-200 py-1 pl-4">
              <p className="text-base font-medium text-stone-600">
                {isEnglish
                  ? "👑 A private nail proposal prepared exclusively for you."
                  : "👑 오직 고객님 한 분만을 위해 프라이빗하게 준비된 네일 제안서입니다."}
              </p>
              <p className="mt-1 text-base text-stone-600">
                {isEnglish
                  ? "💎 Click the proposal to explore your personalized designs."
                  : "💎 제안서를 클릭하여 나만의 디자인을 확인해 보세요."}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-sm">
            <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-stone-800">
              {isEnglish ? "📋 Sent Proposals" : "📋 상담 제안서 현황"}
            </h1>
            <p className="text-sm font-medium text-stone-500">
              {isEnglish
                ? "Manage sent proposals and track client view rates."
                : "고객에게 보낸 디자인 제안서를 관리하고 공유 현황을 확인하세요."}
            </p>
            {!isLoading && !isError ? (
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                <div className={DASHBOARD_WIDGET_CLASS}>
                  <p className="text-xs font-medium text-stone-500">
                    {isEnglish ? "Total Views" : "총 열람"}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-stone-800">
                    {isEnglish ? proposalStats.totalViews : `${proposalStats.totalViews}회`}
                  </p>
                </div>
                <div className={DASHBOARD_WIDGET_CLASS}>
                  <p className="text-xs font-medium text-stone-500">
                    {isEnglish ? "Total Proposals" : "총 제안서"}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-stone-800">
                    {isEnglish ? proposalStats.totalProposals : `${proposalStats.totalProposals}건`}
                  </p>
                </div>
                <div className={DASHBOARD_WIDGET_CLASS}>
                  <p className="text-xs font-medium text-stone-500">
                    {isEnglish ? "View Rate" : "열람률"}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-stone-800">{proposalStats.readRate}%</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center shadow-sm">
                  <p className="text-xs font-medium text-blue-600">
                    {isEnglish ? "Today Views" : "오늘 열람"}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-blue-700">
                    {isEnglish ? proposalStats.todayViewedCount : `${proposalStats.todayViewedCount}건`}
                  </p>
                </div>
              </div>
            ) : null}
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
            {isEnglish ? "Failed to load proposals." : "제안서 목록을 불러오지 못했습니다."}
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

      {!isLoading && !isError && proposals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-stone-500">
            {isFocusMode
              ? isEnglish
                ? "No custom proposals prepared yet."
                : "아직 준비된 맞춤 제안서가 없습니다."
              : isEnglish
                ? "No sent proposals yet."
                : "아직 보낸 제안서가 없습니다."}
          </p>
          {!isFocusMode ? (
            <p className="mt-2 text-xs text-stone-400">
              {isEnglish
                ? "Select designs from the right panel and create a consultation link."
                : "우측 패널에서 디자인을 선택하고 상담 링크를 생성해 보세요."}
            </p>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !isError && !isFocusMode && proposals.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setViewFilter("all")}
            className={
              viewFilter === "all"
                ? "rounded-full bg-stone-800 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-200"
            }
          >
            {isEnglish ? "All" : "전체"}
          </button>
          <button
            type="button"
            onClick={() => setViewFilter("read")}
            className={
              viewFilter === "read"
                ? "rounded-full bg-stone-800 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-200"
            }
          >
            {isEnglish ? "🔵 Viewed" : "🔵 열람"}
          </button>
          <button
            type="button"
            onClick={() => setViewFilter("unread")}
            className={
              viewFilter === "unread"
                ? "rounded-full bg-stone-800 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-200"
            }
          >
            {isEnglish ? "⚪ Unread" : "⚪ 미열람"}
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && proposals.length > 0 && filteredProposals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-stone-500">
            {isEnglish
              ? "No proposals match the selected filter."
              : "선택한 필터에 해당하는 제안서가 없습니다."}
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && filteredProposals.length > 0 ? (
        <div className={CARD_GRID_CLASS}>
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              isEnglish={isEnglish}
              isFocusMode={isFocusMode}
              onImageClick={() =>
                isFocusMode ? setViewingProposal(proposal) : openEditModal(proposal)
              }
              onCopyLink={(event) => void handleCopyLink(event, proposal.id)}
              onDelete={(event) => void handleDeleteClick(event, proposal)}
              onMemoSaved={() => void refetch()}
            />
          ))}
        </div>
      ) : null}

      {!isFocusMode ? (
        <ProEditProposalModal
          proposal={editingProposal}
          onClose={() => setEditingProposal(null)}
          onSaved={() => void refetch()}
        />
      ) : null}
    </div>
  );
}

function ProposalCoverImage({ nails }: { nails: ProCartNail[] }) {
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

function ProposalCard({
  proposal,
  isEnglish,
  isFocusMode,
  onImageClick,
  onCopyLink,
  onDelete,
  onMemoSaved,
}: {
  proposal: ProProposalListItem;
  isEnglish: boolean;
  isFocusMode: boolean;
  onImageClick: () => void;
  onCopyLink: (event: MouseEvent) => void;
  onDelete: (event: MouseEvent) => void;
  onMemoSaved: () => void;
}) {
  const nailCount = proposal.nails.length || proposal.nail_ids.length;
  const viewCount = proposal.views ?? 0;
  const hasSavedMemo = Boolean(proposal.private_memo?.trim());
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [memoDraft, setMemoDraft] = useState(proposal.private_memo ?? "");
  const [isSavingMemo, setIsSavingMemo] = useState(false);

  useEffect(() => {
    setMemoDraft(proposal.private_memo ?? "");
  }, [proposal.id, proposal.private_memo]);

  const handleSaveMemo = async (event: MouseEvent) => {
    event.stopPropagation();
    setIsSavingMemo(true);
    try {
      await updateProProposalPrivateMemo(proposal.id, memoDraft);
      toast.success(isEnglish ? "Private memo saved." : "프라이빗 메모가 저장되었습니다.");
      onMemoSaved();
    } catch {
      toast.error(isEnglish ? "Failed to save memo." : "메모 저장에 실패했습니다.");
    } finally {
      setIsSavingMemo(false);
    }
  };

  return (
    <article className={CARD_CONTAINER_CLASS}>
      <button type="button" onClick={onImageClick} className="w-full text-left">
        <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-stone-100">
          <ProposalCoverImage nails={proposal.nails} />
        </div>
      </button>
      <h3 className="truncate text-lg font-bold text-stone-800">{proposal.customer_name}</h3>
      <div className="mb-2 text-xs text-stone-500">
        {formatCreatedAt(proposal.created_at, isEnglish)} ·{" "}
        {isEnglish ? `${nailCount} designs` : `디자인 ${nailCount}개`}
        {!proposal.is_active ? (isEnglish ? " · Closed" : " · 종료됨") : ""}
      </div>
      <div className="mb-4">
        {viewCount === 0 ? (
          <span className="inline-block rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
            {isEnglish ? "⚪ Unread" : "⚪ 미열람"}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
            {isEnglish ? `🔵 Viewed (${viewCount} views)` : `🔵 열람완료 (${viewCount}회)`}
            {proposal.last_viewed_at ? (
              <span className="ml-1.5 font-normal opacity-75">
                · {getTimeAgo(proposal.last_viewed_at, isEnglish)}
              </span>
            ) : null}
          </span>
        )}
      </div>
      {!isFocusMode ? (
        <>
          {isMemoOpen ? (
            <div
              className="mb-3 rounded-lg border border-yellow-100 bg-yellow-50/50 p-3"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="mb-2 text-xs font-medium text-yellow-800/80">
                {isEnglish
                  ? "Private customer note (not visible to client)"
                  : "고객 특이사항 메모 (고객에게는 보이지 않습니다)"}
              </p>
              <textarea
                value={memoDraft}
                onChange={(event) => setMemoDraft(event.target.value)}
                rows={3}
                placeholder={
                  isEnglish
                    ? "e.g.: Thin nails, prefers pastel tones"
                    : "예: 손톱이 얇으심, 파스텔 톤 선호"
                }
                className="w-full resize-none rounded-md border border-yellow-100 bg-white/80 px-2.5 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:border-yellow-200 focus:outline-none focus:ring-1 focus:ring-yellow-200"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={(event) => void handleSaveMemo(event)}
                  disabled={isSavingMemo}
                  className="rounded-md bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-900 transition-colors hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingMemo ? (isEnglish ? "Saving..." : "저장 중...") : isEnglish ? "Save" : "저장"}
                </button>
              </div>
            </div>
          ) : null}
          <div className="flex gap-1.5 border-t border-stone-100 pt-3">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsMemoOpen((open) => !open);
              }}
              className={
                hasSavedMemo
                  ? "flex-1 min-w-0 whitespace-nowrap rounded-full bg-yellow-50 px-2 py-1 text-[11px] font-bold text-yellow-700 transition-colors hover:bg-yellow-100"
                  : ADMIN_BTN_CLASS
              }
            >
              📝 {isEnglish ? "Memo" : "메모"}
            </button>
            <button type="button" onClick={onCopyLink} className={ADMIN_BTN_CLASS}>
              🔗 {isEnglish ? "Copy Link" : "링크복사"}
            </button>
            <button type="button" onClick={onDelete} className={ADMIN_BTN_DANGER_CLASS}>
              🗑️ {isEnglish ? "Delete" : "삭제"}
            </button>
          </div>
        </>
      ) : null}
    </article>
  );
}
