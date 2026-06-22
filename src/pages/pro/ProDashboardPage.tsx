import { toProCartNail, useProCartStore } from "@/features/pro/store/useProCartStore";
import { useProSearchStore } from "@/features/pro/store/useProSearchStore";
import { useProUIStore } from "@/features/pro/store/useProUIStore";
import ProGalleryWidget, { type ProGalleryStats } from "@/pages/pro/components/ProGalleryWidget";
import ProQuickViewModal from "@/pages/pro/components/ProQuickViewModal";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { NailDesignRow } from "@/shared/types/database.types";
import { useCallback, useMemo, useState } from "react";

function formatGalleryCountLabel(count: number | null, isLoading: boolean): string {
  if (isLoading) return "2,000+";
  if (count == null || count <= 0) return "0";
  return count.toLocaleString();
}

export default function ProDashboardPage() {
  const [selectedDetailNail, setSelectedDetailNail] = useState<NailDesignRow | null>(null);
  const [galleryStats, setGalleryStats] = useState<ProGalleryStats>({
    totalCount: null,
    hasActiveFilters: false,
    isLoading: true,
  });

  const selectedNails = useProCartStore((state) => state.selectedNails);
  const toggleNail = useProCartStore((state) => state.toggleNail);
  const searchKeyword = useProSearchStore((state) => state.searchKeyword);
  const debouncedKeyword = useDebounce(searchKeyword.trim(), 500);
  const isFocusMode = useProUIStore((state) => state.isFocusMode);

  const selectedIdSet = useMemo(() => new Set(selectedNails.map((nail) => nail.id)), [selectedNails]);
  const countLabel = formatGalleryCountLabel(galleryStats.totalCount, galleryStats.isLoading);

  const headerCountText = galleryStats.hasActiveFilters
    ? `총 ${countLabel}개의 검색 결과`
    : `총 ${countLabel}개의 프리미엄 디자인`;

  const handleGalleryStatsChange = useCallback((stats: ProGalleryStats) => {
    setGalleryStats(stats);
  }, []);

  const handleToggleNail = useCallback(
    (item: NailDesignRow) => {
      toggleNail(toProCartNail(item));
    },
    [toggleNail],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <header className="mb-8">
        {isFocusMode ? (
          <div className="mb-6">
            <div className="flex items-end gap-3">
              <h1 className="text-3xl font-bold text-stone-800 tracking-tight">✨ 프리미엄 디자인 룩북</h1>
              <span className="text-base font-medium text-stone-500 mb-1">{headerCountText}</span>
            </div>
            <div className="mt-4 text-base text-stone-600 leading-relaxed border-l-4 border-stone-200 pl-4 py-1">
              <p>👑 원장님이 고객님을 위해 엄선한 프리미엄 네일 갤러리입니다.</p>
              <p className="mt-1">💎 편안하게 감상하시고, 마음에 드는 디자인을 골라주세요.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-stone-800">💅 전체 디자인 갤러리</h1>
              <p className="pb-0.5 text-sm text-stone-600">
                {galleryStats.hasActiveFilters ? (
                  <>
                    총 <span className="font-semibold text-[#5C4A3A]">{countLabel}</span>개의 검색 결과
                  </>
                ) : (
                  <>
                    총{" "}
                    <span className="font-semibold text-[#5C4A3A]">{countLabel}</span>
                    개의 프리미엄 디자인
                  </>
                )}
              </p>
            </div>
            <div className="mt-4 text-sm text-stone-600 leading-relaxed">
              <p className="mb-3">
                사진 우측 상단의{" "}
                <strong className="font-semibold text-stone-800">[☑️ 체크박스]</strong>를 눌러 디자인을 담고, 고객
                맞춤 상담을 시작하세요.
              </p>
              <ul className="space-y-2">
                <li>
                  <strong className="font-semibold text-stone-800">⭐ 내 컬렉션 :</strong> 자주 사용하는 디자인을
                  저장해 빠르게 활용
                </li>
                <li>
                  <strong className="font-semibold text-stone-800">🔗 상담 링크 :</strong> 우측 패널에 담긴 디자인으로
                  고객 전용 제안서 생성
                </li>
              </ul>
            </div>
          </>
        )}
      </header>

      <ProGalleryWidget
        variant="dashboard"
        selectedIds={selectedIdSet}
        onToggleSelect={handleToggleNail}
        onOpenDetail={setSelectedDetailNail}
        debouncedSearchKeyword={debouncedKeyword}
        onGalleryStatsChange={handleGalleryStatsChange}
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
