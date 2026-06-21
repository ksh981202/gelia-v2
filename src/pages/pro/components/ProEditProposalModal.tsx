import { updateProProposal } from "@/features/pro/api/proMutations";
import type { ProProposalListItem } from "@/features/pro/api/fetchProProposalsList";
import type { ProCartNail } from "@/features/pro/store/useProCartStore";
import ProEditProposalGalleryPanel from "@/pages/pro/components/ProEditProposalGalleryPanel";
import { useCallback, useEffect, useState } from "react";

type ProEditProposalModalProps = {
  proposal: ProProposalListItem | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function ProEditProposalModal({
  proposal,
  onClose,
  onSaved,
}: ProEditProposalModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [selectedNails, setSelectedNails] = useState<ProCartNail[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);

  const isOpen = Boolean(proposal);

  useEffect(() => {
    if (!proposal) {
      setIsGalleryExpanded(false);
      return;
    }

    setCustomerName(proposal.customer_name);
    setGreetingMessage(String(proposal.greeting_message ?? "").trim());
    setSelectedNails([...proposal.nails]);
    setIsSubmitting(false);
    setIsGalleryExpanded(false);
  }, [proposal]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  const handleToggleGalleryNail = useCallback((nail: ProCartNail) => {
    setSelectedNails((prev) => {
      const exists = prev.some((selected) => selected.id === nail.id);
      if (exists) {
        return prev.filter((selected) => selected.id !== nail.id);
      }
      return [...prev, nail];
    });
  }, []);

  if (!proposal) return null;

  const handleRemoveNail = (nailId: string) => {
    setSelectedNails((prev) => prev.filter((nail) => nail.id !== nailId));
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateProProposal(proposal.id, {
        customerName,
        greetingMessage,
        nailIds: selectedNails.map((nail) => nail.id),
      });
      window.alert("성공적으로 수정되었습니다.");
      onSaved();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "제안서 수정에 실패했습니다.";
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className={[
          "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300",
          isGalleryExpanded ? "max-w-7xl w-[90vw]" : "max-w-lg",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-edit-proposal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-stone-100 px-6 py-5">
          <h2 id="pro-edit-proposal-title" className="text-xl font-semibold text-stone-900">
            상담 제안서 수정
          </h2>
        </div>

        <div className="flex min-h-0 flex-1">
          <div
            className={[
              "flex min-h-0 flex-col",
              isGalleryExpanded ? "w-[400px] shrink-0 border-r border-stone-200" : "w-full",
            ].join(" ")}
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div>
                <label htmlFor="pro-edit-customer-name" className="mb-2 block text-base font-medium text-stone-700">
                  고객명
                </label>
                <input
                  id="pro-edit-customer-name"
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-orange-100 bg-[#FFF9F5] px-4 py-3 text-sm text-stone-800 outline-none transition-colors focus:border-orange-200 focus:bg-white disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="pro-edit-greeting" className="mb-2 block text-base font-medium text-stone-700">
                  인사말
                </label>
                <textarea
                  id="pro-edit-greeting"
                  value={greetingMessage}
                  onChange={(event) => setGreetingMessage(event.target.value)}
                  rows={4}
                  disabled={isSubmitting}
                  className="w-full resize-none rounded-xl border border-orange-100 bg-[#FFF9F5] px-4 py-3 text-sm leading-relaxed text-stone-800 outline-none transition-colors focus:border-orange-200 focus:bg-white disabled:opacity-60"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-base font-medium text-stone-700">
                    선택된 사진 ({selectedNails.length}장)
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsGalleryExpanded((prev) => !prev)}
                    className="text-base text-stone-500 transition-colors hover:text-stone-800"
                  >
                    [ ➕ 사진 추가하기 ]
                  </button>
                </div>

                {selectedNails.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedNails.map((nail) => (
                      <div key={nail.id} className="flex flex-col">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100">
                          {nail.imageUrl ? (
                            <img
                              src={nail.imageUrl}
                              alt={nail.title}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-full w-full rounded-lg bg-stone-200" aria-hidden />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveNail(nail.id)}
                            disabled={isSubmitting}
                            className="absolute right-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white transition-colors hover:bg-black/80 disabled:opacity-60"
                            aria-label={`${nail.title} 삭제`}
                          >
                            X
                          </button>
                        </div>
                        <p className="mt-2 truncate text-center text-sm font-medium text-stone-700">
                          {nail.title}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-stone-300 py-8 text-center text-sm text-stone-400">
                    담긴 디자인이 없습니다. 최소 1장 이상 남겨 주세요.
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 gap-3 border-t border-stone-100 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-base font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                [ 취소 ]
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-stone-800 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "저장 중..." : "[ 저장 ]"}
              </button>
            </div>
          </div>

          {isGalleryExpanded ? (
            <div className="min-h-0 flex-1 bg-gray-50">
              <ProEditProposalGalleryPanel
                selectedNails={selectedNails}
                onToggleNail={handleToggleGalleryNail}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
