import {
  copyProposalShareLink,
  createProProposal,
  deleteProLookbook,
  saveCurationToMyCollection,
} from "@/features/pro/api/proMutations";
import type { ProLookbookListItem } from "@/features/pro/api/fetchProLookbooksList";
import { useProCurationsListQuery } from "@/features/pro/api/useProCurationsListQuery";
import { toProCartNail, useProCartStore, type ProCartNail } from "@/features/pro/store/useProCartStore";
import { useLanguageContext } from "@/contexts/LanguageContext";
import ProCreateCurationModal from "@/pages/pro/components/ProCreateCurationModal";
import ProEditLookbookModal from "@/pages/pro/components/ProEditLookbookModal";
import ProQuickViewModal from "@/pages/pro/components/ProQuickViewModal";
import { supabase } from "@/shared/api/supabaseClient";
import { isAdminEmail } from "@/shared/constants/auth";
import type { NailDesignRow } from "@/shared/types/database.types";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const PAGE_ROOT_CLASS = "flex h-full w-full flex-col";
const CARD_GRID_CLASS = "grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
const CARD_CONTAINER_CLASS =
  "rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md";
const CARD_ACTION_BTN_CLASS =
  "rounded-md bg-stone-50 py-2 text-center text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 whitespace-nowrap";
const CARD_DELETE_BTN_CLASS =
  "rounded-md bg-red-50 py-2 text-center text-xs font-medium text-red-500 transition-colors hover:bg-red-100 whitespace-nowrap";
const PROPOSAL_FIELD_CLASS =
  "w-full rounded-xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 disabled:opacity-60";

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

export default function ProCurationPage() {
  const { isEnglish } = useLanguageContext();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<{ email: string | null } | null>(null);
  const [editTarget, setEditTarget] = useState<ProLookbookListItem | null>(null);
  const [previewTarget, setPreviewTarget] = useState<ProLookbookListItem | null>(null);
  const [selectedDetailNail, setSelectedDetailNail] = useState<NailDesignRow | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedCuration, setSelectedCuration] = useState<ProLookbookListItem | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const selectedNails = useProCartStore((state) => state.selectedNails);
  const toggleNail = useProCartStore((state) => state.toggleNail);

  const { data: curations = [], isLoading, isError, refetch } = useProCurationsListQuery();

  const selectedIdSet = useMemo(() => new Set(selectedNails.map((nail) => nail.id)), [selectedNails]);
  const userEmail = user?.email ?? null;
  const isAdmin = isAdminEmail(userEmail);

  useEffect(() => {
    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUser({ email: data.session?.user?.email ?? null });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser({ email: session?.user?.email ?? null });
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleToggleNail = useCallback(
    (item: NailDesignRow) => {
      toggleNail(toProCartNail(item));
    },
    [toggleNail],
  );

  const handleCreateCuration = () => {
    if (!isAdminEmail(userEmail)) return;
    setIsCreateModalOpen(true);
  };

  const handleSaveToMyCollection = async (event: MouseEvent, lookbook: ProLookbookListItem) => {
    event.stopPropagation();
    try {
      await saveCurationToMyCollection(lookbook);
      toast.success(
        isEnglish
          ? "Saved to your collection! Check it in [My Collection]."
          : "내 컬렉션에 담았습니다! [내 컬렉션] 메뉴에서 확인하세요.",
      );
      void queryClient.invalidateQueries({ queryKey: ["pro-lookbooks", "list"] });
    } catch {
      toast.error(
        isEnglish ? "Failed to save to your collection." : "내 컬렉션에 담기에 실패했습니다.",
      );
    }
  };

  const handlePreview = (lookbook: ProLookbookListItem) => {
    setPreviewTarget(lookbook);
    setSelectedDetailNail(null);
  };

  const openProposalModal = (event: MouseEvent, lookbook: ProLookbookListItem) => {
    event.stopPropagation();
    setSelectedCuration(lookbook);
    setCustomerName("");
    setGreeting("");
    setIsProposalModalOpen(true);
  };

  const closeProposalModal = useCallback(() => {
    if (isCreatingProposal) return;
    setIsProposalModalOpen(false);
    setSelectedCuration(null);
    setCustomerName("");
    setGreeting("");
  }, [isCreatingProposal]);

  const handleCreateProposalAndCopy = async () => {
    if (!selectedCuration || isCreatingProposal) return;

    const nailIds = (selectedCuration.nail_ids ?? [])
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
      setSelectedCuration(null);
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

  const handleEdit = (event: MouseEvent, lookbook: ProLookbookListItem) => {
    event.stopPropagation();
    if (!isAdminEmail(userEmail)) return;
    setEditTarget(lookbook);
  };

  const handleDelete = async (event: MouseEvent, lookbook: ProLookbookListItem) => {
    event.stopPropagation();
    if (!isAdminEmail(userEmail)) return;
    if (
      !window.confirm(
        isEnglish
          ? "Are you sure you want to delete this curation?"
          : "이 큐레이션을 정말 삭제하시겠습니까?",
      )
    ) {
      return;
    }
    try {
      await deleteProLookbook(lookbook.id);
      if (editTarget?.id === lookbook.id) {
        setEditTarget(null);
      }
      if (previewTarget?.id === lookbook.id) {
        setPreviewTarget(null);
        setSelectedDetailNail(null);
      }
      await refetch();
      window.alert(isEnglish ? "Curation deleted." : "큐레이션이 삭제되었습니다.");
    } catch {
      window.alert(isEnglish ? "Failed to delete curation." : "큐레이션 삭제에 실패했습니다.");
    }
  };

  if (previewTarget) {
    return (
      <div className={PAGE_ROOT_CLASS}>
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setPreviewTarget(null);
              setSelectedDetailNail(null);
            }}
            className="font-medium text-stone-500 transition-colors hover:text-stone-800"
          >
            {isEnglish ? "← Back" : "← 뒤로 가기"}
          </button>
          <h2 className="text-3xl font-bold text-stone-800">
            👀{" "}
            {isEnglish
              ? previewTarget.title_en || previewTarget.title
              : previewTarget.title}
          </h2>
        </div>

        <div className="columns-2 gap-6 md:columns-3 lg:columns-4">
          {previewTarget.nails.map((nail) => {
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
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-sm">
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-stone-800">
              🏆 {isEnglish ? "GELIA Curation" : "젤리아 큐레이션"}
            </h1>
            <p className="text-sm font-medium leading-relaxed text-stone-500">
              {isEnglish
                ? "Premium design lookbooks curated with the latest trends and seasonal moods. Use them as your own collection or propose 1:1 tailored consultations to clients."
                : "최신 트렌드와 계절의 무드를 담아 엄선한 프리미엄 디자인 룩북입니다. 원장님만의 컬렉션으로 활용하거나, 1:1 맞춤 상담 제안서로 고객에게 제안해 보세요."}
            </p>
          </div>
          {isAdmin ? (
            <button
              type="button"
              onClick={handleCreateCuration}
              className="shrink-0 rounded-xl bg-stone-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
            >
              {isEnglish ? "+ Create New Curation" : "+ 새로운 큐레이션 만들기"}
            </button>
          ) : null}
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#5C4A3A]" aria-hidden />
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
          <p className="text-sm text-stone-500">
            {isEnglish ? "Failed to load curations." : "큐레이션 목록을 불러오지 못했습니다."}
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

      {!isLoading && !isError && curations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-stone-500">
            {isEnglish ? "No curations registered yet." : "아직 등록된 큐레이션이 없습니다."}
          </p>
          {isAdmin ? (
            <p className="mt-2 text-xs text-stone-400">
              {isEnglish
                ? "Use the button at the top right to register a new curation."
                : "우측 상단 버튼으로 새 큐레이션을 등록해 보세요."}
            </p>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !isError && curations.length > 0 ? (
        <div className={CARD_GRID_CLASS}>
          {curations.map((curation) => (
            <CurationCard
              key={curation.id}
              curation={curation}
              isAdmin={isAdmin}
              isEnglish={isEnglish}
              onThumbnailClick={() => handlePreview(curation)}
              onSaveToCollection={(event) => void handleSaveToMyCollection(event, curation)}
              onSendProposal={(event) => openProposalModal(event, curation)}
              onEdit={(event) => handleEdit(event, curation)}
              onDelete={(event) => void handleDelete(event, curation)}
            />
          ))}
        </div>
      ) : null}

      {isAdmin && editTarget ? (
        <ProEditLookbookModal
          lookbook={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            void refetch();
            setEditTarget(null);
          }}
        />
      ) : null}

      {isAdmin && isCreateModalOpen ? (
        <ProCreateCurationModal
          onClose={() => setIsCreateModalOpen(false)}
          onSaved={() => {
            void refetch();
            setIsCreateModalOpen(false);
          }}
        />
      ) : null}

      {isProposalModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={isCreatingProposal ? undefined : closeProposalModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="curation-proposal-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="curation-proposal-modal-title" className="text-xl font-semibold text-stone-800">
              {isEnglish ? "Create Proposal Link" : "상담 제안서 링크 생성"}
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="curation-proposal-customer-name"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  {isEnglish ? "Customer Name" : "고객명"}
                </label>
                <input
                  id="curation-proposal-customer-name"
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
                  htmlFor="curation-proposal-greeting"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  {isEnglish ? "Greeting" : "인사말"}
                </label>
                <textarea
                  id="curation-proposal-greeting"
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

function CurationCard({
  curation,
  isAdmin,
  isEnglish,
  onThumbnailClick,
  onSaveToCollection,
  onSendProposal,
  onEdit,
  onDelete,
}: {
  curation: ProLookbookListItem;
  isAdmin: boolean;
  isEnglish: boolean;
  onThumbnailClick: () => void;
  onSaveToCollection: (event: MouseEvent) => void;
  onSendProposal: (event: MouseEvent) => void;
  onEdit: (event: MouseEvent) => void;
  onDelete: (event: MouseEvent) => void;
}) {
  const nailCount = curation.nails.length || curation.nail_ids.length;
  const createdLabel = formatCreatedAt(curation.created_at, isEnglish);

  return (
    <article className={CARD_CONTAINER_CLASS}>
      <button
        type="button"
        onClick={onThumbnailClick}
        className="w-full cursor-pointer text-left transition-opacity hover:opacity-95"
        aria-label={
          isEnglish ? `Preview ${curation.title}` : `${curation.title} 미리보기`
        }
      >
        <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-stone-100">
          <LookbookCoverImage nails={curation.nails} />
        </div>
      </button>
      <h3 className="truncate text-lg font-bold text-stone-800">{curation.title}</h3>
      <p className="mb-4 text-xs text-stone-500">
        {isEnglish
          ? `Registered ${createdLabel} · ${nailCount} Designs`
          : `등록 ${createdLabel} · 디자인 ${nailCount}개`}
      </p>
      <div className="grid w-full grid-cols-2 gap-1.5 border-t border-stone-100 pt-3">
        <button type="button" onClick={onSaveToCollection} className={CARD_ACTION_BTN_CLASS}>
          {isEnglish ? "📥 Save to Collection" : "📥 컬렉션 담기"}
        </button>
        <button type="button" onClick={onSendProposal} className={CARD_ACTION_BTN_CLASS}>
          {isEnglish ? "💌 Add to Proposal" : "💌 상담 제안서 담기"}
        </button>
        {isAdmin ? (
          <>
            <button type="button" onClick={onEdit} className={CARD_ACTION_BTN_CLASS}>
              {isEnglish ? "⚙️ Edit" : "⚙️ 수정"}
            </button>
            <button type="button" onClick={onDelete} className={CARD_DELETE_BTN_CLASS}>
              {isEnglish ? "🗑️ Delete" : "🗑️ 삭제"}
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}
