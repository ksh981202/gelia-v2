import { createProCuration } from "@/features/pro/api/proMutations";
import type { ProCartNail } from "@/features/pro/store/useProCartStore";
import ProEditProposalGalleryPanel from "@/pages/pro/components/ProEditProposalGalleryPanel";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ProCreateCurationModalProps = {
  onClose: () => void;
  onSaved: () => void;
};

export default function ProCreateCurationModal({ onClose, onSaved }: ProCreateCurationModalProps) {
  const [title, setTitle] = useState("");
  const [selectedNails, setSelectedNails] = useState<ProCartNail[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);

  useEffect(() => {
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
  }, [isSubmitting, onClose]);

  const handleToggleGalleryNail = useCallback((nail: ProCartNail) => {
    setSelectedNails((prev) => {
      const exists = prev.some((selected) => selected.id === nail.id);
      if (exists) {
        return prev.filter((selected) => selected.id !== nail.id);
      }
      return [...prev, nail];
    });
  }, []);

  const handleRemoveNail = (nailId: string) => {
    setSelectedNails((prev) => prev.filter((nail) => nail.id !== nailId));
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createProCuration(
        title,
        selectedNails.map((nail) => nail.id).filter(Boolean),
      );
      window.alert("큐레이션이 성공적으로 등록되었습니다.");
      onSaved();
    } catch (error) {
      const message = error instanceof Error ? error.message : "큐레이션 등록에 실패했습니다.";
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
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
        aria-labelledby="pro-create-curation-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-stone-100 px-6 py-5">
          <h2 id="pro-create-curation-title" className="text-xl font-semibold text-stone-900">
            🏆 새 큐레이션 만들기
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
                <label
                  htmlFor="pro-create-curation-title-input"
                  className="mb-2 block text-base font-medium text-stone-700"
                >
                  큐레이션 이름
                </label>
                <input
                  id="pro-create-curation-title-input"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="예: 2026 봄 시즌 베스트 20선"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-orange-100 bg-[#FFF9F5] px-4 py-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-orange-200 focus:bg-white disabled:opacity-60"
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
                    disabled={isSubmitting}
                    className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    [ ➕ 사진 추가하기 ]
                  </button>
                </div>

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
                {isSubmitting ? "등록 중..." : "[ 💾 큐레이션 등록 ]"}
              </button>
            </div>
          </div>

          {isGalleryExpanded ? (
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden bg-gray-50">
              <ProEditProposalGalleryPanel
                selectedNails={selectedNails}
                onToggleNail={handleToggleGalleryNail}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
