import { toProCartNail, type ProCartNail } from "@/features/pro/store/useProCartStore";
import ProGalleryWidget from "@/pages/pro/components/ProGalleryWidget";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { NailDesignRow } from "@/shared/types/database.types";
import { useCallback, useMemo, useState } from "react";

type ProEditProposalGalleryPanelProps = {
  selectedNails: ProCartNail[];
  onToggleNail: (nail: ProCartNail) => void;
};

export default function ProEditProposalGalleryPanel({
  selectedNails,
  onToggleNail,
}: ProEditProposalGalleryPanelProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedSearchKeyword = useDebounce(searchKeyword.trim(), 500);
  const selectedIdSet = useMemo(() => new Set(selectedNails.map((nail) => nail.id)), [selectedNails]);

  const handleToggleSelect = useCallback(
    (item: NailDesignRow) => {
      onToggleNail(toProCartNail(item));
    },
    [onToggleNail],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-4 pt-4">
        <input
          type="text"
          placeholder="어떤 디자인을 추가할까요? (예: 시럽, 웨딩)"
          value={searchKeyword}
          onChange={(event) => setSearchKeyword(event.target.value)}
          className="w-full rounded-full border border-stone-200 bg-white px-4 py-2 text-sm transition-colors focus:border-stone-400 focus:outline-none"
          aria-label="제안서 수정 갤러리 디자인 검색"
        />
      </div>
      <div className="min-h-0 flex-1">
        <ProGalleryWidget
          variant="compact"
          selectedIds={selectedIdSet}
          onToggleSelect={handleToggleSelect}
          debouncedSearchKeyword={debouncedSearchKeyword}
          ariaLabel="제안서 수정 갤러리"
        />
      </div>
    </div>
  );
}
