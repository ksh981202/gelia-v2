import {
  DEFAULT_GALLERY_TAB,
  useGalleryInfiniteQuery,
} from "@/entities/nail-design/api/useGalleryInfiniteQuery";
import type { NailDesignRow } from "@/shared/types/database.types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const PRO_THEME_OPTIONS = [
  "봄",
  "여름",
  "가을",
  "겨울",
  "데일리",
  "데이트",
  "오피스",
  "웨딩/하객",
  "여행/바캉스",
  "파티/페스티벌",
] as const;

export const PRO_COLOR_OPTIONS = [
  "화이트/누드",
  "핑크/코랄",
  "레드/버건디",
  "블루/네이비",
  "블랙/무채색",
  "파스텔",
  "글리터",
] as const;

export const PRO_MOOD_OPTIONS = [
  "심플",
  "화려한",
  "단아/청순",
  "러블리",
  "힙/스트릿",
  "발레코어",
  "올드머니/시크",
] as const;

export const PRO_SHAPE_OPTIONS = [
  "귀여운 숏네일",
  "우아한 롱/연장",
  "라운드",
  "스퀘어",
  "아몬드/오발",
] as const;

export const PRO_POINT_OPTIONS = [
  "시럽",
  "무광",
  "프렌치",
  "마블",
  "그라데이션",
  "트위드",
  "스톤/큐빅",
  "리본",
  "진주",
  "자석",
  "미러파우더",
] as const;

type ProThemeOption = (typeof PRO_THEME_OPTIONS)[number] | "전체";
type ProColorOption = (typeof PRO_COLOR_OPTIONS)[number] | "전체";
type ProMoodOption = (typeof PRO_MOOD_OPTIONS)[number] | "전체";
type ProShapeOption = (typeof PRO_SHAPE_OPTIONS)[number] | "전체";
type ProPointOption = (typeof PRO_POINT_OPTIONS)[number] | "전체";

export type ProGalleryActiveFilters = {
  themeFilter: ProThemeOption;
  colorFilter: ProColorOption;
  moodFilter: ProMoodOption;
  shapeFilter: ProShapeOption;
  pointFilter: ProPointOption;
};

const FILTER_LABEL_CLASS = "mt-1 w-20 shrink-0 text-sm font-medium text-stone-700";

const FILTER_SCROLL_ROW_CLASS =
  "scrollbar-hide flex min-w-0 flex-1 flex-nowrap gap-2 overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

const MASONRY_CLASS_BY_VARIANT = {
  dashboard: "columns-2 gap-4 md:columns-3 lg:columns-4",
  compact: "columns-3 gap-3 lg:columns-4 xl:columns-5",
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

export type ProGalleryWidgetProps = {
  variant?: "dashboard" | "compact";
  selectedIds: ReadonlySet<string>;
  onToggleSelect: (item: NailDesignRow) => void;
  onOpenDetail?: (item: NailDesignRow) => void;
  debouncedSearchKeyword?: string;
  ariaLabel?: string;
};

export default function ProGalleryWidget({
  variant = "dashboard",
  selectedIds,
  onToggleSelect,
  onOpenDetail,
  debouncedSearchKeyword = "",
  ariaLabel = "PRO 디자인 탐색 갤러리",
}: ProGalleryWidgetProps) {
  const isCompact = variant === "compact";
  const masonryClass = MASONRY_CLASS_BY_VARIANT[variant];

  const [themeFilter, setThemeFilter] = useState<ProThemeOption>("전체");
  const [colorFilter, setColorFilter] = useState<ProColorOption>("전체");
  const [moodFilter, setMoodFilter] = useState<ProMoodOption>("전체");
  const [shapeFilter, setShapeFilter] = useState<ProShapeOption>("전체");
  const [pointFilter, setPointFilter] = useState<ProPointOption>("전체");
  const observerRef = useRef<HTMLDivElement>(null);

  const galleryQuery = useMemo(
    () =>
      resolveProGalleryQuery(
        { themeFilter, colorFilter, moodFilter, shapeFilter, pointFilter },
        debouncedSearchKeyword,
      ),
    [themeFilter, colorFilter, moodFilter, shapeFilter, pointFilter, debouncedSearchKeyword],
  );

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGalleryInfiniteQuery(galleryQuery.tab, "최신순", {
    baseTab: galleryQuery.baseTab,
    extraTabs: galleryQuery.extraTabs,
  });

  const galleryItems = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  const handleFilterToggle = useCallback(
    <T extends string>(setter: (value: T | ((prev: T) => T)) => void, option: T) => {
      setter((prev) => (prev === option ? ("전체" as T) : option));
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
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

  const filterSection = (
    <section className={isCompact ? "mb-4 flex shrink-0 flex-col gap-2" : "mb-5 flex flex-col gap-2.5"}>
      {isCompact ? (
        <p className="text-lg font-semibold text-stone-700">디자인 갤러리</p>
      ) : null}

      <button
        type="button"
        onClick={handleResetFilters}
        className="mb-4 rounded-full bg-stone-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-700"
      >
        ✨ 모든 디자인 전체보기
      </button>

      <div className={`flex min-w-0 items-center ${filterRowGapClass}`}>
        <span className={FILTER_LABEL_CLASS}>시즌/테마</span>
        <div className={FILTER_SCROLL_ROW_CLASS}>
          {PRO_THEME_OPTIONS.map((option) => (
            <FilterPill
              key={`pro-gallery-theme-${option}`}
              label={option}
              selected={themeFilter === option}
              onClick={() => handleFilterToggle(setThemeFilter, option)}
              compact={isCompact}
            />
          ))}
        </div>
      </div>

      <div className={`flex min-w-0 items-center ${filterRowGapClass}`}>
        <span className={FILTER_LABEL_CLASS}>컬러</span>
        <div className={FILTER_SCROLL_ROW_CLASS}>
          {PRO_COLOR_OPTIONS.map((option) => (
            <FilterPill
              key={`pro-gallery-color-${option}`}
              label={option}
              selected={colorFilter === option}
              onClick={() => handleFilterToggle(setColorFilter, option)}
              compact={isCompact}
            />
          ))}
        </div>
      </div>

      <div className={`flex min-w-0 items-center ${filterRowGapClass}`}>
        <span className={FILTER_LABEL_CLASS}>무드</span>
        <div className={FILTER_SCROLL_ROW_CLASS}>
          {PRO_MOOD_OPTIONS.map((option) => (
            <FilterPill
              key={`pro-gallery-mood-${option}`}
              label={option}
              selected={moodFilter === option}
              onClick={() => handleFilterToggle(setMoodFilter, option)}
              compact={isCompact}
            />
          ))}
        </div>
      </div>

      <div className={`flex min-w-0 items-center ${filterRowGapClass}`}>
        <span className={FILTER_LABEL_CLASS}>쉐입</span>
        <div className={FILTER_SCROLL_ROW_CLASS}>
          {PRO_SHAPE_OPTIONS.map((option) => (
            <FilterPill
              key={`pro-gallery-shape-${option}`}
              label={option}
              selected={shapeFilter === option}
              onClick={() => handleFilterToggle(setShapeFilter, option)}
              compact={isCompact}
            />
          ))}
        </div>
      </div>

      <div className={`flex min-w-0 items-center ${filterRowGapClass}`}>
        <span className={FILTER_LABEL_CLASS}>포인트/기법</span>
        <div className={FILTER_SCROLL_ROW_CLASS}>
          {PRO_POINT_OPTIONS.map((option) => (
            <FilterPill
              key={`pro-gallery-point-${option}`}
              label={option}
              selected={pointFilter === option}
              onClick={() => handleFilterToggle(setPointFilter, option)}
              compact={isCompact}
            />
          ))}
        </div>
      </div>
    </section>
  );

  const galleryBody = (
    <>
      {isLoading ? (
        <div className={masonryClass}>
          {Array.from({ length: isCompact ? 6 : 8 }).map((_, index) => (
            <div
              key={`pro-gallery-skeleton-${index}`}
              className={[
                "break-inside-avoid animate-pulse bg-stone-200",
                isCompact ? "mb-3 rounded-xl" : "mb-4 rounded-2xl",
              ].join(" ")}
              style={{ height: `${(isCompact ? 10 : 12) + (index % (isCompact ? 3 : 4)) * (isCompact ? 2.5 : 3)}rem` }}
            />
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className={`text-center text-sm text-stone-500 ${isCompact ? "py-12" : "py-16"}`}>
          디자인을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}

      {!isLoading && !isError && galleryItems.length === 0 ? (
        <p className={`text-center text-sm text-stone-500 ${isCompact ? "py-12" : "py-16"}`}>
          선택한 필터에 맞는 디자인이 없습니다.
        </p>
      ) : null}

      {!isLoading && !isError && galleryItems.length > 0 ? (
        <section className={masonryClass} aria-label={ariaLabel}>
          {galleryItems.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const imageUrl = String(item.image_url ?? "").trim();
            const title = String(item.title ?? "").trim() || "네일 디자인";

            return (
              <article key={item.id} className={isCompact ? "mb-3 break-inside-avoid" : "mb-4 break-inside-avoid"}>
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
                      aria-label={`${title} 상세 보기`}
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
                    aria-label={isSelected ? "디자인 선택 해제" : "디자인 선택"}
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
      ) : null}

      <div ref={observerRef} className={isCompact ? "h-4 w-full" : "h-6 w-full"} aria-hidden />

      {isFetchingNextPage ? (
        <p className={`text-center text-xs text-stone-400 ${isCompact ? "py-3" : "py-4"}`}>
          더 불러오는 중...
        </p>
      ) : null}
    </>
  );

  if (isCompact) {
    return (
      <div className="flex h-full min-h-0 flex-col p-4">
        {filterSection}
        <div className="min-h-0 flex-1 overflow-y-auto">{galleryBody}</div>
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
