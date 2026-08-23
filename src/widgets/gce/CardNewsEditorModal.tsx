import { X } from "lucide-react";
import CardNewsEditor, { type CardNewsAsset } from "./CardNewsEditor";

export type { CardNewsAsset };

export type CardNewsEditorModalProps = {
  open: boolean;
  onClose: () => void;
  imageAssets: CardNewsAsset[];
  ideaTitle: string;
};

export default function CardNewsEditorModal({
  open,
  onClose,
  imageAssets,
  ideaTitle,
}: CardNewsEditorModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[1100px] max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-stone-100 p-2 hover:bg-stone-200"
        >
          <X className="h-5 w-5 text-stone-700" />
        </button>
        {/* open 시 리마운트 → 황금 비율 초기값(70 / 70 / 75) 재적용 */}
        <CardNewsEditor
          key="card-news-editor"
          imageAssets={imageAssets}
          ideaTitle={ideaTitle}
          active
        />
      </div>
    </div>
  );
}
