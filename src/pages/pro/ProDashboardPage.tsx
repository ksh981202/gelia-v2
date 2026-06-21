import {
  DEFAULT_GALLERY_TAB,
  useGalleryCountQuery,
} from "@/entities/nail-design/api/useGalleryInfiniteQuery";
import { toProCartNail, useProCartStore } from "@/features/pro/store/useProCartStore";
import { useProSearchStore } from "@/features/pro/store/useProSearchStore";
import ProGalleryWidget from "@/pages/pro/components/ProGalleryWidget";
import ProQuickViewModal from "@/pages/pro/components/ProQuickViewModal";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { NailDesignRow } from "@/shared/types/database.types";
import { useCallback, useMemo, useState } from "react";

function formatTotalDesignCount(count: number | undefined, isLoading: boolean): string {
  if (isLoading) return "2,000+";
  if (count == null || count <= 0) return "2,000+";
  return count.toLocaleString();
}

export default function ProDashboardPage() {
  const [selectedDetailNail, setSelectedDetailNail] = useState<NailDesignRow | null>(null);

  const selectedNails = useProCartStore((state) => state.selectedNails);
  const toggleNail = useProCartStore((state) => state.toggleNail);
  const searchKeyword = useProSearchStore((state) => state.searchKeyword);
  const debouncedKeyword = useDebounce(searchKeyword.trim(), 500);

  const { data: totalDesignCount, isLoading: isTotalCountLoading } = useGalleryCountQuery(DEFAULT_GALLERY_TAB);

  const selectedIdSet = useMemo(() => new Set(selectedNails.map((nail) => nail.id)), [selectedNails]);
  const totalCountLabel = formatTotalDesignCount(totalDesignCount, isTotalCountLoading);

  const handleToggleNail = useCallback(
    (item: NailDesignRow) => {
      toggleNail(toProCartNail(item));
    },
    [toggleNail],
  );

  return (
    <div className="w-full">
      <header className="mb-8">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-800">💅 전체 디자인 갤러리</h1>
          <p className="pb-0.5 text-sm text-stone-600">
            총{" "}
            <span className="font-semibold text-[#5C4A3A]">{totalCountLabel}</span>
            개의 프리미엄 디자인
          </p>
        </div>
        <div className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
          <p className="mb-2">마음에 드는 사진 우측 상단의 [체크박스]를 눌러보세요.</p>
          <p>
            폴더로 묶어 &apos;⭐ 내 컬렉션&apos;에 보관하거나,
            <br />
            우측 패널에서 고객에게 보낼 &apos;상담 링크&apos;를 즉시 생성할 수 있습니다.
          </p>
        </div>
      </header>

      <ProGalleryWidget
        variant="dashboard"
        selectedIds={selectedIdSet}
        onToggleSelect={handleToggleNail}
        onOpenDetail={setSelectedDetailNail}
        debouncedSearchKeyword={debouncedKeyword}
      />

      <ProQuickViewModal
        nail={selectedDetailNail}
        isSelected={selectedDetailNail ? selectedIdSet.has(selectedDetailNail.id) : false}
        onClose={() => setSelectedDetailNail(null)}
        onToggleSelect={handleToggleNail}
      />
    </div>
  );
}
