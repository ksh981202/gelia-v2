import { useClientHomeFeed } from "@/features/client-home/useClientHomeFeed";
import { mapPcGallerySortToQuery, mapRankingFilterToGallerySort, findActivePcSidebarFilter, resolveSidebarLabel } from "@/features/client-home/clientPcSidebarConfig";
import { GalleryListTypographyHeader } from "@/widgets/gallery-list/GalleryListTypographyHeader";
import {
  useClientPcFilterStore,
  useClientPcGalleryExtraTabs,
} from "@/features/client-home/useClientPcFilterStore";
import {
  DEFAULT_GALLERY_TAB,
  RANKING_WEEKLY_LIMIT,
  useGalleryInfiniteQuery,
} from "@/entities/nail-design/api/useGalleryInfiniteQuery";
import FolderSelectModal from "@/features/collection/components/FolderSelectModal";
import { useUserStore } from "@/features/user-actions/useUserStore";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { buildNailImageSeoAlt } from "@/entities/nail-design/lib/nailDisplayText";
import { ADMIN_EMAILS } from "@/shared/constants/auth";
import { getOptimizedNailImageUrl } from "@/shared/lib/nailImageUrl";
import { NailImage } from "@/shared/ui/NailImage";
import ClientGlobalHeader from "@/widgets/layout/ClientGlobalHeader";
import type { NailDesignRow } from "@/shared/types/database.types";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

type HomeNailCard = {
  id: string
  title: string
  titleEn: string
  image: string
  color: string
  colorEn: string
  nailLength: string
  lengthEn: string
  styles: string[]
  stylesEn: string[]
}

function toHomeNailCard(row: NailDesignRow): HomeNailCard {
  return {
    id: row.id,
    title: row.title,
    titleEn: row.title_en,
    image: row.image_url,
    color: String(row.color ?? '').trim(),
    colorEn: String(row.color_en ?? '').trim(),
    nailLength: String(row.nail_length ?? '').trim(),
    lengthEn: String(row.length_en ?? '').trim(),
    styles: Array.isArray(row.styles) ? row.styles : [],
    stylesEn: Array.isArray(row.styles_en) ? row.styles_en : [],
  }
}

function homeNailSeoAlt(nail: HomeNailCard, isEnglish: boolean): string {
  return buildNailImageSeoAlt(
    {
      title: nail.title,
      title_en: nail.titleEn,
      color: nail.color,
      color_en: nail.colorEn,
      nail_length: nail.nailLength,
      length_en: nail.lengthEn,
      styles: nail.styles,
      styles_en: nail.stylesEn,
    },
    isEnglish,
  )
}

const CATEGORY_CHIPS = [
  { label: "컬러", labelEn: "Color", to: "/color-curation", imageUrl: "/maincategory/ic-category-color.png" },
  { label: "스타일", labelEn: "Style", to: "/style-curation", imageUrl: "/maincategory/ic-category-style.png" },
  { label: "텍스처", labelEn: "Texture", to: "/texture", imageUrl: "/maincategory/ic-category-texture.png" },
  { label: "아트&패턴", labelEn: "Art & Pattern", to: "/pattern", imageUrl: "/maincategory/ic-category-art-pattern.png" },
  { label: "계절", labelEn: "Season", to: "/season-curation", imageUrl: "/maincategory/ic-category-season.png" },
  { label: "맞춤 네일", labelEn: "Custom Nails", to: "/theme", imageUrl: "/maincategory/ic-category-custom.png" },
];

function homeNailTitle(nail: HomeNailCard, isEnglish: boolean) {
  const en = nail.titleEn?.trim();
  const ko = nail.title?.trim();
  return isEnglish && en ? en : ko || en || "";
}

function useIsMdDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

const HOME_HERO_THUMB_WIDTH = 600

const HOME_FEED_IMAGE_CLASS = "h-full w-full object-cover object-center"

function HomeMainFeedImage({
  src,
  alt,
  variant,
}: {
  src: string
  alt: string
  variant: "hero" | "default"
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    const frame = requestAnimationFrame(() => {
      const img = containerRef.current?.querySelector("img")
      if (img?.complete && img.naturalWidth > 0) setLoaded(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [src])

  const imageClassName = loaded ? HOME_FEED_IMAGE_CLASS : `${HOME_FEED_IMAGE_CLASS} opacity-0`

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {!loaded ? (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" aria-hidden />
      ) : null}
      {variant === "hero" ? (
        <NailImage
          src={src}
          alt={alt}
          priority
          thumbWidth={HOME_HERO_THUMB_WIDTH}
          className={imageClassName}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={imageClassName}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  )
}

function PcHomeGalleryCard({
  item,
  index,
  isEnglish,
}: {
  item: NailDesignRow;
  index: number;
  isEnglish: boolean;
}) {
  const card = toHomeNailCard(item);
  const savedNails = useUserStore((state) => state.savedNails);
  const isSaved = savedNails.includes(item.id);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const handleSaveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsFolderModalOpen(true);
  };

  return (
    <>
    <Link
      to={`/detail/${item.id}`}
      className="group block cursor-pointer break-inside-avoid"
    >
      <div className="relative overflow-hidden rounded-2xl border border-black/5 shadow-sm">
        <img
          src={card.image}
          alt={buildNailImageSeoAlt(item, isEnglish)}
          loading={index < 12 ? "eager" : "lazy"}
          fetchPriority={index < 4 ? "high" : undefined}
          decoding="async"
          className="h-auto w-full object-cover object-center"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/55 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        />
        <button
          type="button"
          onClick={handleSaveClick}
          className={[
            "absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-md backdrop-blur-sm transition-all duration-300",
            "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0",
            isSaved ? "bg-[#FF7E67]/95" : "bg-black/45 hover:bg-black/60",
          ].join(" ")}
          aria-label={isEnglish ? "Save nail design" : "네일 저장"}
        >
          <span aria-hidden>❤️</span>
          <span>{isEnglish ? "Save" : "저장"}</span>
        </button>
      </div>
      <p className="mt-3 truncate px-2 text-center text-[14px] font-semibold text-stone-800">
        {homeNailTitle(card, isEnglish)}
      </p>
    </Link>
    <FolderSelectModal
      isOpen={isFolderModalOpen}
      onClose={() => setIsFolderModalOpen(false)}
      nailId={item.id}
    />
    </>
  );
}

function PcGalleryNavigatorBar({
  totalCount,
  activeFilter,
  isLoading,
  isEnglish,
}: {
  totalCount: number | null;
  activeFilter: ReturnType<typeof findActivePcSidebarFilter>;
  isLoading: boolean;
  isEnglish: boolean;
}) {
  const count = isLoading || totalCount == null ? 0 : totalCount;

  return (
    <div className="mb-6 border-b border-stone-200 pb-3">
      {activeFilter ? (
        <GalleryListTypographyHeader
          breadcrumb={resolveSidebarLabel(activeFilter.categoryLabel, isEnglish)}
          mainTitle={resolveSidebarLabel(activeFilter.filterName, isEnglish)}
          totalCount={count}
          isEnglish={isEnglish}
          className="mb-0 md:mb-0"
        />
      ) : (
        <GalleryListTypographyHeader
          breadcrumb={isEnglish ? "GELIA Gallery" : "젤리아 갤러리"}
          mainTitle={isEnglish ? "Premium Nail Designs" : "프리미엄 네일 디자인"}
          totalCount={count}
          isEnglish={isEnglish}
          className="mb-0 md:mb-0"
        />
      )}
    </div>
  );
}

export default function ClientHomePage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pcGalleryObserverRef = useRef<HTMLDivElement>(null);
  const autoPlayIndexRef = useRef(0);
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const isDesktop = useIsMdDesktop();
  const { data: feed, isLoading, isError: isFeedError, refetch: refetchFeed } = useClientHomeFeed();
  const { language } = useLanguageContext();
  const isEnglish = language === "en";
  const gallerySort = useClientPcFilterStore((state) => state.gallerySort);
  const searchKeyword = useClientPcFilterStore((state) => state.searchKeyword);
  const themeFilter = useClientPcFilterStore((state) => state.themeFilter);
  const colorFilter = useClientPcFilterStore((state) => state.colorFilter);
  const moodFilter = useClientPcFilterStore((state) => state.moodFilter);
  const shapeFilter = useClientPcFilterStore((state) => state.shapeFilter);
  const pointFilter = useClientPcFilterStore((state) => state.pointFilter);
  const rankingFilter = useClientPcFilterStore((state) => state.rankingFilter);
  const quickChipKeyword = useClientPcFilterStore((state) => state.quickChipKeyword);
  const debouncedSearchKeyword = useDebounce(searchKeyword, 300);
  const pcGalleryExtraTabs = useClientPcGalleryExtraTabs(debouncedSearchKeyword);

  const hasActiveFilter =
    rankingFilter !== "전체" ||
    themeFilter !== "전체" ||
    colorFilter !== "전체" ||
    moodFilter !== "전체" ||
    shapeFilter !== "전체" ||
    pointFilter !== "전체" ||
    quickChipKeyword !== null;

  const pcGallerySortQuery = useMemo(
    () => mapRankingFilterToGallerySort(rankingFilter) ?? mapPcGallerySortToQuery(gallerySort),
    [rankingFilter, gallerySort],
  );

  const isPcRankingMode = rankingFilter !== "전체";

  const activePcGalleryFilter = useMemo(
    () =>
      findActivePcSidebarFilter(
        {
          rankingFilter,
          themeFilter,
          colorFilter,
          moodFilter,
          shapeFilter,
          pointFilter,
        },
        debouncedSearchKeyword,
        quickChipKeyword,
      ),
    [
      rankingFilter,
      themeFilter,
      colorFilter,
      moodFilter,
      shapeFilter,
      pointFilter,
      debouncedSearchKeyword,
      quickChipKeyword,
    ],
  );

  const {
    galleryItems: pcGalleryItems,
    totalCount: pcGalleryTotalCount,
    isPending: isPcGalleryPending,
    isError: isPcGalleryError,
    error: pcGalleryError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGalleryInfiniteQuery(DEFAULT_GALLERY_TAB, pcGallerySortQuery, {
    enabled: isDesktop,
    extraTabs: pcGalleryExtraTabs,
    maxItems: isPcRankingMode ? RANKING_WEEKLY_LIMIT : undefined,
  });

  const recommendNails = useMemo(
    () => (feed?.recommend ?? []).map(toHomeNailCard),
    [feed?.recommend],
  );

  // LCP 최우선 프리페치 트릭 (가장 첫 번째 사진 멱살 잡기)
  useEffect(() => {
    const firstImage = recommendNails[0]?.image;
    if (!firstImage) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = getOptimizedNailImageUrl(firstImage, { width: HOME_HERO_THUMB_WIDTH });
    link.fetchPriority = "high";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [recommendNails]);

  const trendNails = useMemo(() => (feed?.trend ?? []).map(toHomeNailCard), [feed?.trend]);
  const popularNails = useMemo(
    () => (feed?.popular ?? []).map(toHomeNailCard),
    [feed?.popular],
  );

  useEffect(() => {
    if (!isDesktop) return;

    const target = pcGalleryObserverRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || isFetchingNextPage) return;
        void fetchNextPage();
      },
      { root: null, rootMargin: "320px", threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isDesktop]);

  useEffect(() => {
    if (isLoading || isAutoPlayPaused || recommendNails.length <= 1) return;

    const timer = window.setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      const nextIndex = autoPlayIndexRef.current + 1;
      if (nextIndex >= recommendNails.length) {
        autoPlayIndexRef.current = 0;
        el.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      autoPlayIndexRef.current = nextIndex;
      el.scrollBy({ left: el.clientWidth, behavior: "smooth" });
    }, 3500);

    return () => window.clearInterval(timer);
  }, [isAutoPlayPaused, isLoading, recommendNails.length]);

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#fdfaf7] pb-4 md:overflow-x-visible md:bg-white md:pb-0">
      {isFeedError ? (
        <div className="mx-5 mt-4 rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-4 text-center md:mx-auto md:max-w-3xl">
          <p className="text-[14px] font-medium text-stone-700">
            {isEnglish
              ? "We couldn't load the home feed. Please try again."
              : "홈 피드를 불러오지 못했습니다. 다시 시도해 주세요."}
          </p>
          <button
            type="button"
            onClick={() => void refetchFeed()}
            className="mt-3 rounded-full bg-stone-900 px-4 py-2 text-[13px] font-bold text-white"
          >
            {isEnglish ? "Retry" : "다시 시도"}
          </button>
        </div>
      ) : null}
      <section className="mt-2 px-5 md:hidden">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-gray-900">
            {isEnglish ? "Recommended Nails" : "추천 네일"}
          </h2>
          <button
            type="button"
            onClick={() => navigate('/recommend')}
            className="cursor-pointer text-sm font-medium text-gray-500"
          >
            {isEnglish ? "See All" : "전체보기"} {">"}
          </button>
        </div>
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsAutoPlayPaused(true)}
          onMouseLeave={() => setIsAutoPlayPaused(false)}
          onTouchStart={() => setIsAutoPlayPaused(true)}
          onTouchEnd={() => setIsAutoPlayPaused(false)}
          className="min-w-0 -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pl-4 pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {isLoading
            ? [0, 1, 2, 3].map((i) => (
                <div
                  key={`rec-skel-${i}`}
                  className="relative w-full flex-none snap-center"
                  aria-hidden
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm bg-gray-200 animate-pulse" />
                </div>
              ))
            : recommendNails.map((nail, index) => (
            <Link key={nail.id} to={`/detail/${nail.id}`} className="relative w-full flex-none snap-center cursor-pointer">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm">
                <HomeMainFeedImage
                  src={nail.image}
                  alt={homeNailSeoAlt(nail, isEnglish)}
                  variant={index === 0 ? "hero" : "default"}
                />
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/40 to-transparent p-5 pt-12">
                  <div className="flex w-full flex-col items-start text-left">
                    <span className="mb-2 inline-block rounded-full bg-[#FF7E67] px-3 py-1 text-[11px] font-bold text-white shadow-sm">PICK</span>
                    <h3 className="w-full truncate text-lg font-bold text-white drop-shadow-md">{homeNailTitle(nail, isEnglish)}</h3>
                  </div>
                </div>
                {index > 0 && (
                  <button type="button" className="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); const el = scrollRef.current; if (!el) return; el.scrollBy({ left: -el.clientWidth, behavior: "smooth" }); }}>
                    <ChevronLeft size={18} strokeWidth={2} />
                  </button>
                )}
                {index < recommendNails.length - 1 && (
                  <button type="button" className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); const el = scrollRef.current; if (!el) return; el.scrollBy({ left: el.clientWidth, behavior: "smooth" }); }}>
                    <ChevronRight size={18} strokeWidth={2} />
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mb-10 mt-10 w-full px-5 md:hidden">
        <div className="relative w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-[#fff5f5] to-[#fffafa] px-6 py-7 shadow-sm border border-rose-50">
          <div className="relative z-10 flex flex-col items-start w-[65%]">
            <h3 className="text-[18px] font-bold text-gray-900 leading-tight">{isEnglish ? "Find Nails Made for Your Hands" : "내 손에 찰떡인 네일 찾기"}</h3>
            <p className="mt-1.5 text-[13px] text-gray-500">{isEnglish ? "Discover your perfect nail style with a quick test" : "간단한 테스트로 인생 네일 찾기"}</p>
            <button
              type="button"
              onClick={() => navigate('/test-intro')}
              className="mt-5 flex items-center justify-center rounded-full bg-[#111827] px-4 py-2 text-[13px] font-bold text-white transition-transform active:scale-95"
            >
              {isEnglish ? "Start Test" : "테스트 시작하기"} <span className="ml-1 text-[10px]">➔</span>
            </button>
          </div>
          <div className="absolute right-4 bottom-4 w-[100px] h-[100px] pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[80px] h-[80px] rounded-full bg-white shadow-sm flex items-center justify-center text-[32px]">💅</div>
            </div>
            <div className="absolute top-0 right-0 text-[24px]">✨</div>
          </div>
        </div>
      </div>

      <section className="mb-12 px-5 md:mb-0 md:mt-0 md:px-0 md:pt-0">
        <div className="mb-5 flex items-center justify-between md:hidden">
          <h2 className="text-[20px] font-bold tracking-tight text-gray-900">{isEnglish ? "Trending Nails" : "트렌드 네일"}</h2>
          <span onClick={() => navigate('/trend')} className="cursor-pointer text-sm font-medium text-gray-500">{isEnglish ? "See All" : "전체보기"} {">"}</span>
        </div>

        <ClientGlobalHeader isMainHome showBackButton={hasActiveFilter} />

        <div className="grid grid-cols-3 gap-3 md:hidden">
          {isLoading
            ? [0, 1, 2].map((i) => (
                <div key={`trend-skel-${i}`} className="flex w-full flex-col items-center" aria-hidden>
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm bg-gray-200 animate-pulse" />
                  <span className="mt-2.5 h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                </div>
              ))
            : trendNails.map((nail) => (
                <Link key={nail.id} to={`/detail/${nail.id}`} className="flex w-full cursor-pointer flex-col items-center">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm">
                    <HomeMainFeedImage
                      src={nail.image}
                      alt={homeNailSeoAlt(nail, isEnglish)}
                      variant="default"
                    />
                  </div>
                  <span className="mt-2.5 w-full text-center text-[13px] font-medium leading-snug tracking-tight text-gray-800 line-clamp-2">{homeNailTitle(nail, isEnglish)}</span>
                </Link>
              ))}
        </div>
        <div className="hidden min-w-0 px-4 pb-8 pt-4 md:block">
          <PcGalleryNavigatorBar
            totalCount={pcGalleryTotalCount}
            activeFilter={activePcGalleryFilter}
            isLoading={isPcGalleryPending}
            isEnglish={isEnglish}
          />
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {isPcGalleryPending
            ? Array.from({ length: 20 }, (_, i) => (
                <div key={`pc-gallery-skel-${i}`} className="break-inside-avoid" aria-hidden>
                  <div
                    className="w-full animate-pulse rounded-2xl bg-gray-200"
                    style={{ height: `${11 + (i % 4) * 2.5}rem` }}
                  />
                </div>
              ))
            : isPcGalleryError ? (
                <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
                  {pcGalleryError instanceof Error
                    ? pcGalleryError.message
                    : isEnglish
                      ? "Could not load designs."
                      : "디자인을 불러오지 못했습니다."}
                </div>
              )
            : pcGalleryItems.length === 0 ? (
                <p className="col-span-full py-12 text-center text-sm text-gray-500">
                  {isEnglish ? "No designs to show." : "표시할 네일이 없습니다."}
                </p>
              )
            : (
                <>
                  {pcGalleryItems.map((item, index) => (
                    <PcHomeGalleryCard
                      key={item.id}
                      item={item}
                      index={index}
                      isEnglish={isEnglish}
                    />
                  ))}
                  {isFetchingNextPage
                    ? Array.from({ length: 8 }, (_, i) => (
                        <div key={`pc-gallery-more-skel-${i}`} className="break-inside-avoid" aria-hidden>
                          <div
                            className="w-full animate-pulse rounded-2xl bg-gray-200"
                            style={{ height: `${10 + (i % 3) * 2}rem` }}
                          />
                        </div>
                      ))
                    : null}
                  <div ref={pcGalleryObserverRef} className="col-span-full h-4 w-full" aria-hidden />
                </>
              )}
          </div>
        </div>
      </section>

      <section className="mb-12 px-5 md:hidden">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-gray-900">{isEnglish ? "Popular Nail Designs" : "인기 네일 디자인"}</h2>
          <span onClick={() => navigate('/popular-design')} className="cursor-pointer text-sm font-medium text-gray-500">{isEnglish ? "See All" : "전체보기"} {">"}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {isLoading
            ? [0, 1, 2, 3].map((i) => (
                <div key={`pop-skel-${i}`} className="flex w-full flex-col items-center" aria-hidden>
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm bg-gray-200 animate-pulse" />
                  <span className="mt-2.5 h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
                </div>
              ))
            : popularNails.map((nail) => (
                <Link key={nail.id} to={`/detail/${nail.id}`} className="flex w-full cursor-pointer flex-col items-center">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm">
                    <HomeMainFeedImage
                      src={nail.image}
                      alt={homeNailSeoAlt(nail, isEnglish)}
                      variant="default"
                    />
                  </div>
                  <span className="mt-2.5 w-full text-center text-[14px] font-medium tracking-tight text-gray-800 truncate">{homeNailTitle(nail, isEnglish)}</span>
                </Link>
              ))}
        </div>
      </section>

      <section className="mb-10 mt-8 px-5 md:hidden">
        <div className="mb-5 flex w-full items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-gray-900">
            {isEnglish ? "Explore Categories" : "카테고리 탐색"}
          </h2>
          <button
            type="button"
            onClick={() => navigate('/category')}
            className="cursor-pointer text-sm font-medium text-gray-500"
          >
            {isEnglish ? "See All" : "전체보기"} {">"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORY_CHIPS.map((cat) => (
            <button
              key={cat.to}
              type="button"
              onClick={() => navigate(cat.to)}
              className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-5 shadow-sm transition-transform active:scale-95 hover:bg-secondary/40"
            >
              <div className="mb-3 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-white shadow-sm">
                <img
                  src={cat.imageUrl}
                  alt={isEnglish ? cat.labelEn : cat.label}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="mt-3 text-[14px] font-semibold tracking-tight text-gray-800 font-sans">
                {isEnglish ? cat.labelEn : cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <footer className="w-full border-t border-gray-200 bg-gray-50 px-5 pb-8 pt-10 text-left font-sans md:hidden">
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm">
          <p className="text-center text-[13px] font-medium leading-[1.6] text-gray-700">
            {isEnglish ? "All GELIA images are AI-created designs 😉" : "젤리아의 모든 이미지는 AI로 만든 디자인이에요 😉"}<br />{isEnglish ? "Use them as inspiration to find your own nail style!" : "나만의 네일 스타일 찾는 데 참고해보세요!"}
          </p>
        </div>
        <div className="mb-6">
          <button type="button" onClick={() => setIsFooterOpen(!isFooterOpen)} className="flex items-center gap-1 text-[14px] font-bold text-gray-800">
            {isEnglish ? "GELIA Studio" : "젤리아 스튜디오 (GELIA Studio)"}
            {isFooterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {isFooterOpen && (
            <div className="mt-2 space-y-1.5">
              <p className="text-[13px] text-gray-500">{isEnglish ? "A new standard for finding your own nail style, GELIA" : "나만의 네일 스타일을 찾는 새로운 기준, 젤리아"}</p>
              <p className="text-[13px] text-gray-500">
                {isEnglish ? `Contact: ${ADMIN_EMAILS[0]}` : `문의: ${ADMIN_EMAILS[0]}`}
              </p>
            </div>
          )}
        </div>
        <div className="mb-4 flex items-center gap-3 text-[13px] text-gray-500">
          <Link to="/terms" className="font-semibold text-gray-500 hover:underline">
            {isEnglish ? "Terms of Service" : "이용약관"}
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/privacy" className="font-bold text-gray-800 hover:underline">
            {isEnglish ? "Privacy Policy" : "개인정보처리방침"}
          </Link>
        </div>
        <p className="text-[11px] font-medium text-gray-400">&copy; 2026 GELIA Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}
