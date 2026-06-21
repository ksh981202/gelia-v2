import {
  DEFAULT_GALLERY_TAB,
  useGalleryCountQuery,
  useGalleryInfiniteQuery,
} from "@/entities/nail-design/api/useGalleryInfiniteQuery";
import ProQuickViewModal from "@/pages/pro/components/ProQuickViewModal";
import type { NailDesignRow } from "@/shared/types/database.types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PRO_COLOR_OPTIONS = [
  "전체",
  "화이트/누드",
  "핑크/코랄",
  "레드/버건디",
  "블루/네이비",
  "블랙/무채색",
  "파스텔",
  "글리터",
] as const;

const PRO_MOOD_OPTIONS = [
  "전체",
  "심플",
  "화려한",
  "단아/청순",
  "러블리",
  "힙/스트릿",
  "발레코어",
  "올드머니/시크",
] as const;

const PRO_SHAPE_OPTIONS = [
  "전체",
  "귀여운 숏네일",
  "우아한 롱/연장",
  "라운드",
  "스퀘어",
  "아몬드/오발",
] as const;

type ProColorOption = (typeof PRO_COLOR_OPTIONS)[number];
type ProMoodOption = (typeof PRO_MOOD_OPTIONS)[number];
type ProShapeOption = (typeof PRO_SHAPE_OPTIONS)[number];

type ProFilters = {
  color: ProColorOption;
  mood: ProMoodOption;
  shape: ProShapeOption;
};

const DEFAULT_PRO_FILTERS: ProFilters = {
  color: "전체",
  mood: "전체",
  shape: "전체",
};

const FILTER_SCROLL_ROW_CLASS =
  "scrollbar-hide flex min-w-0 flex-1 flex-nowrap gap-2 overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

export type SelectedNail = {
  id: string;
  imageUrl: string;
  title: string;
};

function resolveProGalleryQuery(filters: ProFilters) {
  const activeFilters = [
    filters.color !== "전체" ? filters.color : null,
    filters.mood !== "전체" ? filters.mood : null,
    filters.shape !== "전체" ? filters.shape : null,
  ].filter((value): value is string => Boolean(value));

  return {
    tab: activeFilters[0] ?? DEFAULT_GALLERY_TAB,
    baseTab: activeFilters[1] ?? "",
    extraTabs: activeFilters.slice(2),
  };
}

function FilterPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "bg-[#5C4A3A] text-white shadow-sm"
          : "border border-stone-200/80 bg-[#FFFCF8] text-stone-600 hover:border-stone-300 hover:bg-[#F3EDE4]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function formatTotalDesignCount(count: number | undefined, isLoading: boolean): string {
  if (isLoading) return "2,000+";
  if (count == null || count <= 0) return "2,000+";
  if (count >= 1000) return count.toLocaleString();
  return count.toLocaleString();
}

function toSelectedNail(item: NailDesignRow): SelectedNail {
  return {
    id: item.id,
    imageUrl: String(item.image_url ?? "").trim(),
    title: String(item.title ?? "").trim(),
  };
}

export default function ProDashboardPage() {
  const [filters, setFilters] = useState<ProFilters>(DEFAULT_PRO_FILTERS);
  const [selectedNails, setSelectedNails] = useState<SelectedNail[]>([]);
  const [selectedDetailNail, setSelectedDetailNail] = useState<NailDesignRow | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const galleryQuery = useMemo(() => resolveProGalleryQuery(filters), [filters]);

  const { data: totalDesignCount, isLoading: isTotalCountLoading } = useGalleryCountQuery(DEFAULT_GALLERY_TAB);

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
  const selectedIdSet = useMemo(() => new Set(selectedNails.map((nail) => nail.id)), [selectedNails]);
  const totalCountLabel = formatTotalDesignCount(totalDesignCount, isTotalCountLoading);

  const handleFilterSelect = useCallback(
    <K extends keyof ProFilters>(groupKey: K, option: ProFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [groupKey]: prev[groupKey] === option ? "전체" : option,
      }));
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_PRO_FILTERS);
  }, []);

  const toggleSelection = useCallback((item: NailDesignRow) => {
    setSelectedNails((prev) => {
      const exists = prev.some((nail) => nail.id === item.id);
      if (exists) return prev.filter((nail) => nail.id !== item.id);
      return [...prev, toSelectedNail(item)];
    });
  }, []);

  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || isFetchingNextPage) return;
        void fetchNextPage();
      },
      { root: null, rootMargin: "240px", threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, filters]);

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

      <section className="mb-6 flex flex-col gap-3">
        <div className="flex items-start justify-end">
          <button
            type="button"
            onClick={handleResetFilters}
            className="shrink-0 text-sm font-medium text-stone-500 transition-colors hover:text-[#5C4A3A]"
          >
            [ 🔄 필터 초기화 ]
          </button>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <span className="w-10 shrink-0 text-xs font-semibold tracking-wide text-stone-400">컬러</span>
          <div className={FILTER_SCROLL_ROW_CLASS}>
            {PRO_COLOR_OPTIONS.map((option) => (
              <FilterPill
                key={`color-${option}`}
                label={option}
                selected={filters.color === option}
                onClick={() => handleFilterSelect("color", option)}
              />
            ))}
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <span className="w-10 shrink-0 text-xs font-semibold tracking-wide text-stone-400">무드</span>
          <div className={FILTER_SCROLL_ROW_CLASS}>
            {PRO_MOOD_OPTIONS.map((option) => (
              <FilterPill
                key={`mood-${option}`}
                label={option}
                selected={filters.mood === option}
                onClick={() => handleFilterSelect("mood", option)}
              />
            ))}
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <span className="w-10 shrink-0 text-xs font-semibold tracking-wide text-stone-400">쉐입</span>
          <div className={FILTER_SCROLL_ROW_CLASS}>
            {PRO_SHAPE_OPTIONS.map((option) => (
              <FilterPill
                key={`shape-${option}`}
                label={option}
                selected={filters.shape === option}
                onClick={() => handleFilterSelect("shape", option)}
              />
            ))}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="mb-4 break-inside-avoid animate-pulse rounded-2xl bg-stone-200"
              style={{ height: `${12 + (index % 4) * 3}rem` }}
            />
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="py-16 text-center text-sm text-stone-500">
          디자인을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}

      {!isLoading && !isError && galleryItems.length === 0 ? (
        <p className="py-16 text-center text-sm text-stone-500">선택한 필터에 맞는 디자인이 없습니다.</p>
      ) : null}

      {!isLoading && !isError && galleryItems.length > 0 ? (
        <section
          className="columns-2 gap-4 md:columns-3 lg:columns-4"
          aria-label="PRO 디자인 탐색 갤러리"
        >
          {galleryItems.map((item) => {
            const isSelected = selectedIdSet.has(item.id);
            const imageUrl = String(item.image_url ?? "").trim();
            const title = String(item.title ?? "").trim() || "네일 디자인";

            return (
              <article key={item.id} className="mb-4 break-inside-avoid">
                <div className="group relative overflow-hidden rounded-2xl bg-stone-200">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailNail(item)}
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

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleSelection(item);
                    }}
                    aria-label={isSelected ? "디자인 선택 해제" : "디자인 선택"}
                    aria-pressed={isSelected}
                    className={[
                      "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all",
                      isSelected
                        ? "bg-[#5C4A3A]/90 text-white shadow-md"
                        : "bg-white/70 text-stone-600 hover:bg-white/90",
                    ].join(" ")}
                  >
                    <span className="text-base leading-none">{isSelected ? "☑️" : "☐"}</span>
                  </button>
                </div>
                <p className="mt-2 truncate text-center text-sm font-medium text-stone-700">{title}</p>
              </article>
            );
          })}
        </section>
      ) : null}

      <div ref={observerRef} className="h-6 w-full" aria-hidden />

      {isFetchingNextPage ? (
        <p className="py-4 text-center text-xs text-stone-400">더 불러오는 중...</p>
      ) : null}

      <ProQuickViewModal
        nail={selectedDetailNail}
        isSelected={selectedDetailNail ? selectedIdSet.has(selectedDetailNail.id) : false}
        onClose={() => setSelectedDetailNail(null)}
        onToggleSelect={toggleSelection}
      />
    </div>
  );
}
