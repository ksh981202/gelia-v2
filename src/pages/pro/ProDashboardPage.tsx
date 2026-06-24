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
          <div className="mb-4 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-end gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-stone-800 md:text-3xl">
                ✨ 프리미엄 네일 컬렉션
              </h1>
              <span className="mb-1 text-base font-semibold tracking-wide text-stone-600 md:text-lg">
                <span className="font-bold text-orange-600">{countLabel}</span> 개의 네일 아트
              </span>
            </div>
            <div className="border-l-4 border-stone-200 py-1 pl-4">
              <p className="text-base font-medium text-stone-600">
                👑 원장님이 고객님을 위해 준비한 디자인 컬렉션입니다.
              </p>
              <p className="mt-1 text-base text-stone-600">
                💎 편하게 둘러보시고 마음에 드는 스타일을 찾아보세요.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-sm">
            <div className="flex items-end gap-3">
              <h1 className="text-2xl font-bold text-stone-800">💅 전체 디자인 갤러리</h1>
              <span className="mb-1 text-sm font-medium text-stone-500">
                {galleryStats.hasActiveFilters ? (
                  <>
                    총 <span className="font-semibold text-[#5C4A3A]">{countLabel}</span>개의 검색 결과
                  </>
                ) : (
                  <>
                    총 <span className="font-semibold text-[#5C4A3A]">{countLabel}</span>개의 프리미엄 디자인
                  </>
                )}
              </span>
            </div>

            <div className="mt-4 text-sm leading-relaxed text-stone-600">
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
                  <strong className="font-semibold text-stone-800">📋 상담 제안서 :</strong> 고객 맞춤 디자인을
                  선별하고 전용 제안서를 생성해 1:1 상담에 활용해 보세요.
                </li>
              </ul>
            </div>
          </div>
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
