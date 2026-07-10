import { useLanguageContext } from "@/contexts/LanguageContext";
import { saveProLookbook } from "@/features/pro/api/proMutations";
import { useEffect, useState } from "react";

type ProLookbookModalProps = {
  isOpen: boolean;
  nailIds: string[];
  onClose: () => void;
  onSuccess: () => void;
};

export default function ProLookbookModal({
  isOpen,
  nailIds,
  onClose,
  onSuccess,
}: ProLookbookModalProps) {
  const { isEnglish } = useLanguageContext();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert(isEnglish ? "Please enter a collection name." : "컬렉션 이름을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await saveProLookbook(trimmedTitle, nailIds);
      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isEnglish
            ? "An error occurred while saving."
            : "저장 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-lookbook-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="pro-lookbook-modal-title" className="text-xl font-semibold text-gray-900">
          {isEnglish ? "⭐ Save to My Collection" : "⭐ 내 컬렉션으로 보관"}
        </h2>

        <p className="mt-2 text-sm text-stone-500">
          {isEnglish
            ? `Save ${nailIds.length} selected designs to a new folder.`
            : `선택한 ${nailIds.length}장의 디자인을 새 폴더에 저장합니다.`}
        </p>

        <div className="mt-5">
          <label htmlFor="pro-lookbook-title" className="mb-2 block text-sm font-medium text-gray-700">
            {isEnglish ? "Collection Name" : "컬렉션 이름"}
          </label>
          <input
            id="pro-lookbook-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={isEnglish ? "e.g., Summer Vacation Picks 2026" : "예: 2026 여름 바캉스 20선"}
            disabled={isSubmitting}
            autoFocus
            className="w-full rounded-xl border border-orange-100 bg-[#FFF9F5] px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-orange-200 focus:bg-white disabled:opacity-60"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-orange-100 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-orange-50/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEnglish ? "[ Cancel ]" : "[ 취소 ]"}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-[#5C4A3A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4A3B2E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? isEnglish
                ? "Saving..."
                : "보관 중..."
              : isEnglish
                ? "[ Save ]"
                : "[ 보관하기 ]"}
          </button>
        </div>
      </div>
    </div>
  );
}
