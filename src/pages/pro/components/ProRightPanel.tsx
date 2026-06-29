import { useProCartStore } from "@/features/pro/store/useProCartStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ProConsultationLinkModal from "./ProConsultationLinkModal";
import ProLookbookModal from "./ProLookbookModal";

export default function ProRightPanel() {
  const queryClient = useQueryClient();
  const [isLookbookModalOpen, setIsLookbookModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const selectedNails = useProCartStore((state) => state.selectedNails);
  const removeNail = useProCartStore((state) => state.removeNail);
  const clearCart = useProCartStore((state) => state.clearCart);

  useEffect(() => {
    if (!successToast) return;

    const timer = window.setTimeout(() => setSuccessToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [successToast]);

  const handleOpenLookbookModal = () => {
    if (selectedNails.length === 0) {
      alert("보관할 디자인을 갤러리에서 먼저 선택해주세요.");
      return;
    }
    setIsLookbookModalOpen(true);
  };

  const handleOpenLinkModal = () => {
    if (selectedNails.length === 0) {
      window.alert("상담 링크를 만들려면 갤러리에서 디자인을 1개 이상 선택해야 합니다.");
      return;
    }
    setIsLinkModalOpen(true);
  };

  return (
    <>
      <aside className="sticky top-0 flex h-screen w-80 shrink-0 flex-col overflow-y-auto border-l border-stone-200/80 bg-[#FAF7F2]">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
          <div className="border-b border-stone-200/60 pb-4 mb-4">
            <p className="mb-2 text-lg font-bold text-stone-800">
              선택된 디자인 ({selectedNails.length}장)
            </p>
          </div>

          {selectedNails.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-stone-300/80 bg-[#FFFCF8] px-4 py-10 text-center">
              <p className="text-sm leading-relaxed text-stone-400">선택된 디자인이 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {selectedNails.map((nail) => (
                <div key={nail.id} className="relative aspect-[3/4] overflow-hidden rounded-md bg-stone-200">
                  {nail.imageUrl ? (
                    <img
                      src={nail.imageUrl}
                      alt={nail.title}
                      className="h-full w-full rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-stone-200" />
                  )}

                  <button
                    type="button"
                    onClick={() => removeNail(nail.id)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-[10px] font-bold text-white transition-colors hover:bg-black/75"
                    aria-label={`${nail.title} 선택 해제`}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 shrink-0 border-t border-stone-200/60 bg-[#FAF7F2] p-5">
          <button
            type="button"
            onClick={handleOpenLookbookModal}
            className="w-full rounded-xl bg-[#EDE4D8] px-4 py-3.5 text-sm font-semibold text-[#5C4A3A] transition-colors hover:bg-[#E5D8C8]"
          >
            [ ⭐ 내 컬렉션 보관 ]
          </button>

          <button
            type="button"
            onClick={handleOpenLinkModal}
            className="mt-3 w-full rounded-xl bg-[#5C4A3A] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4A3B2E]"
          >
            [ 🔗 상담 제안서 생성 ]
          </button>
        </div>
      </aside>

      <ProLookbookModal
        isOpen={isLookbookModalOpen}
        nailIds={selectedNails.map((nail) => nail.id)}
        onClose={() => setIsLookbookModalOpen(false)}
        onSuccess={() => {
          setIsLookbookModalOpen(false);
          clearCart();
          setSuccessToast("내 컬렉션에 보관되었습니다!");
          void queryClient.invalidateQueries({ queryKey: ["pro-lookbooks", "list"] });
        }}
      />

      {isLinkModalOpen && (
        <ProConsultationLinkModal
          nailIds={selectedNails.map((nail) => nail.id)}
          onClose={() => setIsLinkModalOpen(false)}
          onSuccess={() => {
            clearCart();
            setIsLinkModalOpen(false);
          }}
        />
      )}

      {successToast ? (
        <div
          className="fixed bottom-8 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-[#5C4A3A] px-5 py-3 text-sm font-medium text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          {successToast}
        </div>
      ) : null}
    </>
  );
}
