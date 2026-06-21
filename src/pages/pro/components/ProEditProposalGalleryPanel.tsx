import { toProCartNail, type ProCartNail } from "@/features/pro/store/useProCartStore";
import ProGalleryWidget from "@/pages/pro/components/ProGalleryWidget";
import type { NailDesignRow } from "@/shared/types/database.types";
import { useCallback, useMemo } from "react";

type ProEditProposalGalleryPanelProps = {
  selectedNails: ProCartNail[];
  onToggleNail: (nail: ProCartNail) => void;
};

export default function ProEditProposalGalleryPanel({
  selectedNails,
  onToggleNail,
}: ProEditProposalGalleryPanelProps) {
  const selectedIdSet = useMemo(() => new Set(selectedNails.map((nail) => nail.id)), [selectedNails]);

  const handleToggleSelect = useCallback(
    (item: NailDesignRow) => {
      onToggleNail(toProCartNail(item));
    },
    [onToggleNail],
  );

  return (
    <ProGalleryWidget
      variant="compact"
      selectedIds={selectedIdSet}
      onToggleSelect={handleToggleSelect}
      ariaLabel="제안서 수정 갤러리"
    />
  );
}
