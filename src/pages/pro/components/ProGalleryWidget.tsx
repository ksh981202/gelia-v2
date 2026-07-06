import {
  DEFAULT_GALLERY_TAB,
  useGalleryInfiniteQuery,
} from "@/entities/nail-design/api/useGalleryInfiniteQuery";
import { useLanguageContext } from "@/contexts/LanguageContext";
import {
  PC_SIDEBAR_CATEGORIES,
  mapRankingFilterToGallerySort,
  resolveSidebarLabel,
  type PcSidebarCategoryId,
} from "@/features/client-home/clientPcSidebarConfig";
import type { NailDesignRow } from "@/shared/types/database.types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * B2C(ClientLayout) 좌측 사이드바 목차(PC_SIDEBAR_CATEGORIES)를 Single Source of
 * Truth로 삼아, PRO 갤러리 필터의 대분류/소분류 순서와 텍스트를 100% 동일하게
 * 복제(Sync)한다. 목차를 수정할 때는 clientPcSidebarConfig.ts 한 곳만 고치면 된다.
 */
function categoryItemValues(id: PcSidebarCategoryId): string[] {
  return (
    PC_SIDEBAR_CATEGORIES.find((category) => category.id === id)?.items.map(
      (item) => item.value,
    ) ?? []
  );
}

export const PRO_THEME_OPTIONS = categoryItemValues("season");
export const PRO_COLOR_OPTIONS = categoryItemValues("color");
export const PRO_MOOD_OPTIONS = categoryItemValues("mood");
export const PRO_SHAPE_OPTIONS = categoryItemValues("shape");
export const PRO_POINT_OPTIONS = categoryItemValues("technique");

type ProThemeOption = string;
type ProColorOption = string;
type ProMoodOption = string;
type ProShapeOption = string;
type ProPointOption = string;

export type ProGalleryActiveFilters = {
  themeFilter: ProThemeOption;
  colorFilter: ProColorOption;
  moodFilter: ProMoodOption;
  shapeFilter: ProShapeOption;
  pointFilter: ProPointOption;
};

const FILTER_STICKY_DASHBOARD_CLASS =
  "sticky top-16 z-30 -mx-6 bg-gray-50 px-6 pt-2 pb-4";

const FILTER_STICKY_COMPACT_CLASS = "shrink-0";

const FILTER_LABEL_CLASS = "mt-1 w-24 shrink-0 break-keep text-sm font-medium text-stone-700";

const FILTER_ROW_WRAPPER_CLASS =
  "scrollbar-hide flex min-w-0 items-center overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

const FILTER_SCROLL_ROW_CLASS =
  "flex shrink-0 flex-nowrap gap-2";

const GRID_CLASS_BY_VARIANT = {
  dashboard: "grid min-w-0 w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4",
  compact: "grid min-w-0 w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4",
} as const;

export function resolveProGalleryQuery(
  activeFilters: ProGalleryActiveFilters,
  debouncedKeyword = "",
) {
  const extraTabs: string[] = [];

  if (activeFilters.themeFilter !== "전체") extraTabs.push(activeFilters.themeFilter);
  if (activeFilters.colorFilter !== "전체") extraTabs.push(activeFilters.colorFilter);
  if (activeFilters.moodFilter !== "전체") extraTabs.push(activeFilters.moodFilter);
  if (activeFilters.shapeFilter !== "전체") extraTabs.push(activeFilters.shapeFilter);
  if (activeFilters.pointFilter !== "전체") extraTabs.push(activeFilters.pointFilter);

  const trimmedKeyword = debouncedKeyword.trim();
  if (trimmedKeyword) {
    extraTabs.push(trimmedKeyword);
  }

  return {
    tab: DEFAULT_GALLERY_TAB,
    baseTab: "",
    extraTabs,
  };
}

function FilterPill({
  label,
  selected,
  onClick,
  compact,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  compact: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "shrink-0 rounded-full font-medium transition-colors",
        compact ? "px-3 py-1.5 text-xs" : "px-4 py-1.5 text-sm",
        selected
          ? "bg-[#5C4A3A] text-white shadow-sm"
          : compact
            ? "border border-stone-200/80 bg-white text-stone-600 hover:border-stone-300 hover:bg-[#F3EDE4]"
            : "border border-stone-200/80 bg-[#FFFCF8] text-stone-600 hover:border-stone-300 hover:bg-[#F3EDE4]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export type ProGalleryStats = {
  totalCount: number | null;
  hasActiveFilters: boolean;
  isLoading: boolean;
};

export type ProGalleryWidgetProps = {
  variant?: "dashboard" | "compact";
  selectedIds: ReadonlySet<string>;
  onToggleSelect: (item: NailDesignRow) => void;
  onOpenDetail?: (item: NailDesignRow) => void;
  debouncedSearchKeyword?: string;
  ariaLabel?: string;
  onGalleryStatsChange?: (stats: ProGalleryStats) => void;
};

export default function ProGalleryWidget({
  variant = "dashboard",
  selectedIds,
  onToggleSelect,
  onOpenDetail,
  debouncedSearchKeyword = "",
  ariaLabel,
  onGalleryStatsChange,
}: ProGalleryWidgetProps) {
  const { isEnglish } = useLanguageContext();
  const resolvedAriaLabel = ariaLabel ?? (isEnglish ? "PRO design gallery" : "PRO 디자인 탐색 갤러리");
  const isCompact = variant === "compact";
  const gridClass = GRID_CLASS_BY_VARIANT[variant];

  const [rankingFilter, setRankingFilter] = useState<string>("전체");
  const [themeFilter, setThemeFilter] = useState<string>("전체");
  const [colorFilter, setColorFilter] = useState<string>("전체");
  const [moodFilter, setMoodFilter] = useState<string>("전체");
  const [shapeFilter, setShapeFilter] = useState<string>("전체");
  const [pointFilter, setPointFilter] = useState<string>("전체");
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  const isRankingActive = rankingFilter !== "전체";

  const galleryQuery = useMemo(() => {
    // 젤리아 TOP 100(랭킹) 모드: 개별 필터를 비우고 전체 갤러리를 랭킹 정렬로 노출
    if (isRankingActive) {
      return { tab: DEFAULT_GALLERY_TAB, baseTab: "", extraTabs: [] as string[] };
    }
    return resolveProGalleryQuery(
      {
        themeFilter: themeFilter as ProThemeOption,
        colorFilter: colorFilter as ProColorOption,
        moodFilter: moodFilter as ProMoodOption,
        shapeFilter: shapeFilter as ProShapeOption,
        pointFilter: pointFilter as ProPointOption,
      },
      debouncedSearchKeyword ?? "",
    );
  }, [isRankingActive, themeFilter, colorFilter, moodFilter, shapeFilter, pointFilter, debouncedSearchKeyword]);

  const gallerySort = isRankingActive
    ? mapRankingFilterToGallerySort(rankingFilter) ?? "최신순"
    : "최신순";

  const {
    galleryItems,
    totalCount,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGalleryInfiniteQuery(galleryQuery.tab, gallerySort, {
    baseTab: galleryQuery.baseTab,
    extraTabs: galleryQuery.extraTabs,
  });

  const hasActiveFilters = isRankingActive || galleryQuery.extraTabs.length > 0;

  useEffect(() => {
    onGalleryStatsChange?.({
      totalCount,
      hasActiveFilters,
      isLoading: isPending,
    });
  }, [totalCount, hasActiveFilters, isPending, onGalleryStatsChange]);

  // B2C 사이드바와 동일하게 대분류 간 상호 배타(exclusive)로 동작 — 한 번에 한 필터만 활성
  const handleDimensionSelect = useCallback(
    (id: PcSidebarCategoryId, current: string, option: string) => {
      const next = current === option ? "전체" : option;

      setRankingFilter("전체");
      setThemeFilter("전체");
      setColorFilter("전체");
      setMoodFilter("전체");
      setShapeFilter("전체");
      setPointFilter("전체");

      switch (id) {
        case "ranking":
          setRankingFilter(next);
          break;
        case "season":
          setThemeFilter(next);
          break;
        case "color":
          setColorFilter(next);
          break;
        case "mood":
          setMoodFilter(next);
          break;
        case "shape":
          setShapeFilter(next);
          break;
        case "technique":
          setPointFilter(next);
          break;
      }
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    setRankingFilter("전체");
    setThemeFilter("전체");
    setColorFilter("전체");
    setMoodFilter("전체");
    setShapeFilter("전체");
    setPointFilter("전체");
  }, []);

  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || isFetchingNextPage) return;
        void fetchNextPage();
      },
      { root: null, rootMargin: isCompact ? "200px" : "240px", threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, galleryQuery, isCompact]);

  const filterRowGapClass = isCompact ? "gap-2" : "gap-2.5";

  const filterValueById: Record<PcSidebarCategoryId, string> = {
    ranking: rankingFilter,
    season: themeFilter,
    color: colorFilter,
    mood: moodFilter,
    shape: shapeFilter,
    technique: pointFilter,
  };

  const filterSection = (
    <section
      className={
        isCompact
          ? `${FILTER_STICKY_COMPACT_CLASS} mb-4 flex flex-col gap-2`
          : `${FILTER_STICKY_DASHBOARD_CLASS} mb-5 flex flex-col gap-2.5`
      }
    >
      {isCompact ? (
        <p className="text-lg font-semibold text-stone-700">
          {isEnglish ? "Design Gallery" : "디자인 갤러리"}
        </p>
      ) : null}

      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleResetFilters}
          className="rounded-full bg-stone-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-700"
        >
          {isEnglish ? "✨ View All Designs" : "✨ 모든 디자인 전체보기"}
        </button>
        <button
          type="button"
          onClick={() => setIsFilterOpen((prev) => !prev)}
          className="flex items-center gap-1 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
        >
          {isFilterOpen
            ? isEnglish
              ? "🔼 Collapse Filters"
              : "🔼 필터 접기"
            : isEnglish
              ? "🔽 Open Filters"
              : "🔽 필터 열기"}
        </button>
      </div>

      {isFilterOpen ? (
        <div className={`flex flex-col ${filterRowGapClass}`}>
          {PC_SIDEBAR_CATEGORIES.map((category) => {
            const currentValue = filterValueById[category.id];
            return (
              <div
                key={`pro-gallery-row-${category.id}`}
                className={`${FILTER_ROW_WRAPPER_CLASS} ${filterRowGapClass}`}
              >
                <span className={FILTER_LABEL_CLASS}>
                  {resolveSidebarLabel(category.label, isEnglish)}
                </span>
                <div className={FILTER_SCROLL_ROW_CLASS}>
                  {category.items.map((item) => (
                    <FilterPill
                      key={`pro-gallery-${category.id}-${item.value}`}
                      label={resolveSidebarLabel(item.label, isEnglish)}
                      selected={currentValue === item.value}
                      onClick={() =>
                        handleDimensionSelect(category.id, currentValue, item.value)
                      }
                      compact={isCompact}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );

  const galleryBody = (
    <>
      {isPending ? (
        <div className={gridClass}>
          {Array.from({ length: isCompact ? 6 : 8 }).map((_, index) => (
            <div
              key={`pro-gallery-skeleton-${index}`}
              className={[
                "aspect-[3/4] animate-pulse bg-stone-200",
                isCompact ? "rounded-xl" : "rounded-2xl",
              ].join(" ")}
            />
          ))}
        </div>
      ) : isError ? (
        <div className="relative z-50 m-4 flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 text-red-600">
          <p className="mb-2 text-lg font-bold">
            {isEnglish ? "🚨 Failed to load designs" : "🚨 디자인 조회 실패 (에러 발생)"}
          </p>
          <code className="w-full overflow-x-auto whitespace-pre-wrap break-all rounded border border-red-100 bg-white p-4 text-xs shadow-inner">
            {error instanceof Error ? error.message : JSON.stringify(error)}
          </code>
        </div>
      ) : galleryItems.length === 0 ? (
        <p className={`text-center text-sm text-stone-500 ${isCompact ? "py-12" : "py-16"}`}>
          {isEnglish ? "No designs match the selected filters." : "선택한 필터에 맞는 디자인이 없습니다."}
        </p>
      ) : (
        <section className={gridClass} aria-label={resolvedAriaLabel}>
          {galleryItems.map((item) => {
            const isSelected = selectedIds.has(String(item.id ?? "").trim());
            const imageUrl = String(item.image_url ?? "").trim();
            const title = String(item.title ?? "").trim() || (isEnglish ? "Nail design" : "네일 디자인");

            return (
              <article key={item.id} className="min-w-0">
                <div
                  className={[
                    "group relative overflow-hidden bg-stone-200",
                    isCompact ? "rounded-xl" : "rounded-2xl",
                  ].join(" ")}
                >
                  {onOpenDetail ? (
                    <button
                      type="button"
                      onClick={() => onOpenDetail(item)}
                      className="block w-full cursor-pointer text-left"
                      aria-label={isEnglish ? `View ${title} details` : `${title} 상세 보기`}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={title}
                          loading="lazy"
                          className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="aspect-[3/4] w-full bg-stone-200" />
                      )}
                    </button>
                  ) : imageUrl ? (
                    <img src={imageUrl} alt={title} loading="lazy" className="w-full object-cover" />
                  ) : (
                    <div className="aspect-[3/4] w-full bg-stone-200" />
                  )}

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleSelect(item);
                    }}
                    aria-label={
                      isSelected
                        ? isEnglish
                          ? "Deselect design"
                          : "디자인 선택 해제"
                        : isEnglish
                          ? "Select design"
                          : "디자인 선택"
                    }
                    aria-pressed={isSelected}
                    className={[
                      "absolute flex items-center justify-center rounded-full backdrop-blur-sm transition-all",
                      isCompact
                        ? "right-1.5 top-1.5 h-7 w-7"
                        : "right-3 top-3 h-9 w-9",
                      isSelected
                        ? "bg-[#5C4A3A]/90 text-white shadow-md"
                        : "bg-white/70 text-stone-600 hover:bg-white/90",
                    ].join(" ")}
                  >
                    <span className={isCompact ? "text-sm leading-none" : "text-base leading-none"}>
                      {isSelected ? "☑️" : "☐"}
                    </span>
                  </button>
                </div>
                <p
                  className={[
                    "truncate text-center font-medium text-stone-700",
                    isCompact ? "mt-1.5 text-sm" : "mt-2 text-sm",
                  ].join(" ")}
                >
                  {title}
                </p>
              </article>
            );
          })}
        </section>
      )}

      <div ref={observerRef} className={isCompact ? "h-4 w-full" : "h-6 w-full"} aria-hidden />

      {isFetchingNextPage ? (
        <p className={`text-center text-xs text-stone-400 ${isCompact ? "py-3" : "py-4"}`}>
          {isEnglish ? "Loading more..." : "더 불러오는 중..."}
        </p>
      ) : null}
    </>
  );

  if (isCompact) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-col p-4">
        {filterSection}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">{galleryBody}</div>
      </div>
    );
  }

  return (
    <>
      {filterSection}
      {galleryBody}
    </>
  );
}
