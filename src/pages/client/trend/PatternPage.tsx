import { useRecommendHubQuery } from '@/entities/nail-design/api/useRecommendHubQuery';
import type { NailDesignRow } from '@/shared/types/database.types';
import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';

const PATTERN_CATEGORIES = [
  { label: "프렌치", img: "/pattern/french.jpg" },
  { label: "마블", img: "/pattern/marble.jpg" },
  { label: "체크", img: "/pattern/check.png" },
  { label: "그라데이션", img: "/pattern/gradient.jpg" },
  { label: "트위드", img: "/pattern/tweed.png" },
] as const;

function extractPureThemeKeyword(raw: string): string {
  return String(raw ?? "")
    .replace(/[^\u3131-\u318E\uAC00-\uD7A3a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveActivePatternTab(rawTab: string | null): (typeof PATTERN_CATEGORIES)[number]["label"] {
  const pure = extractPureThemeKeyword(rawTab ?? "");
  return PATTERN_CATEGORIES.find((category) => category.label === rawTab || category.label === pure)?.label ?? "프렌치";
}

function displayItemTitle(item: NailDesignRow): string {
  const ko = String(item.title ?? "").trim();
  const en = String(item.title_en ?? "").trim();
  return ko || en || "네일 디자인";
}

function itemSearchText(item: NailDesignRow): string {
  return [
    item.title,
    item.title_en,
    item.category,
    item.color,
    item.mood,
    item.nail_length,
    item.design_elements,
    item.description,
    ...(item.tags ?? []),
    ...(item.situations ?? []),
    ...(item.styles ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesAnyKeyword(item: NailDesignRow, keywords: string[]): boolean {
  const haystack = itemSearchText(item);
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function filterPatternItems(items: NailDesignRow[], keyword: string): NailDesignRow[] {
  const normalized = extractPureThemeKeyword(keyword).toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => itemSearchText(item).includes(normalized));
}

export default function PatternPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo(() => resolveActivePatternTab(searchParams.get("tab")), [searchParams]);
  const activeTabKeyword = extractPureThemeKeyword(activeTab);
  const { data: hubData = [] } = useRecommendHubQuery();

  const filteredItems = useMemo(() => filterPatternItems(hubData, activeTab), [activeTab, hubData]);
  const heroItem = filteredItems[0];
  const marbleBestItems = useMemo(() => hubData.filter((item) => matchesAnyKeyword(item, ["마블", "대리석"])).slice(0, 3), [hubData]);
  const popularArtItems = useMemo(
    () =>
      hubData
        .filter((item) => matchesAnyKeyword(item, ["아트", "패턴", "프렌치", "마블", "체크", "그라데이션", "트위드", "드로잉", "자개", "생화"]))
        .sort((a, b) => Number(b.popularity ?? 0) - Number(a.popularity ?? 0))
        .slice(0, 4),
    [hubData],
  );

  useEffect(() => {
    if (searchParams.get("tab")) return;
    const next = new URLSearchParams(searchParams);
    next.set("tab", activeTabKeyword);
    setSearchParams(next, { replace: true });
  }, [activeTabKeyword, searchParams, setSearchParams]);

  const setActiveTab = (tab: (typeof PATTERN_CATEGORIES)[number]["label"]) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", extractPureThemeKeyword(tab));
    setSearchParams(next, { replace: true });
  };

  const openDetail = (item?: NailDesignRow) => {
    if (!item) return;
    navigate(`/client/detail/${item.id}`, {
      state: { initialNailData: { ...item, imageUrl: item.image_url, title: displayItemTitle(item) } },
    });
  };

  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-white pb-28 text-neutral-800">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 relative flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white/95 px-5 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-gray-900 transition-colors hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-tight text-gray-900 whitespace-nowrap">
          아트 & 패턴 트렌드
        </h1>
        <button type="button" className="p-1 -mr-1 text-gray-900 transition-colors hover:bg-gray-100 rounded-full" onClick={() => navigate('/client/search')}>
          <Search className="w-5 h-5" strokeWidth={2} />
        </button>
      </header>

      <main className="w-full bg-white">
        
        {/* 섹션 1: 아트별 모아보기 (원형 탭) */}
        <section className="pt-6 pb-5">
          <div className="mb-5 flex items-baseline justify-between gap-2 px-5">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              아트별 모아보기
            </h3>
            <button type="button" className="shrink-0 text-sm font-medium text-gray-500" onClick={() => navigate(`/client/pattern-list?tab=${encodeURIComponent(activeTabKeyword)}`)}>
              전체보기 {'>'}
            </button>
          </div>
          <div className="flex flex-nowrap items-start gap-4 overflow-x-auto scrollbar-hide px-5 pb-1.5 pt-1 [&::-webkit-scrollbar]:hidden">
            {PATTERN_CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.label;
              return (
              <button key={cat.label} type="button" onClick={() => setActiveTab(cat.label)} className="flex shrink-0 flex-col items-center gap-2.5">
                <div className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border border-gray-100 shadow-sm ${isActive ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-white" : ""}`}>
                  <img alt={cat.label} className="absolute inset-0 h-full w-full object-cover object-center" src={cat.img} />
                </div>
                <span className={`font-sans text-[13px] tracking-tight ${isActive ? "font-semibold text-gray-900" : "font-medium text-gray-800"}`}>
                  {cat.label}
                </span>
              </button>
              );
            })}
          </div>
        </section>

        {/* 섹션 2: 히어로 배너 */}
        <section className="mb-0 px-5">
          <div className="group relative mb-0 w-full aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 shadow-lg" onClick={() => openDetail(heroItem)}>
            {heroItem?.image_url ? (
              <img
                alt={displayItemTitle(heroItem)}
                className="absolute inset-0 w-full h-full object-cover object-center"
                src={heroItem.image_url}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement?.classList.add("bg-gray-100");
                }}
              />
            ) : null}
            <div className="absolute inset-x-6 bottom-6">
              <div className="relative z-10">
                <h2 className="text-[28px] font-extrabold text-white drop-shadow-md truncate leading-tight">
                  {heroItem ? displayItemTitle(heroItem) : `${activeTab} 네일`}
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* 섹션 3: 지금 가장 핫한 마블 BEST (3열 그리드) */}
        <section className="mb-0">
          <div className="mt-12 mb-4 flex items-center justify-between gap-2 px-5">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              지금 가장 핫한 마블 BEST
            </h3>
            <button type="button" className="shrink-0 text-sm font-medium text-gray-500" onClick={() => navigate('/client/marble-best-list')}>
              전체보기 {'>'}
            </button>
          </div>
          <div className="mb-0 grid grid-cols-3 gap-3 px-5">
            {marbleBestItems.map((item) => (
              <button key={item.id} type="button" onClick={() => openDetail(item)} className="flex flex-col items-center text-left bg-transparent p-0">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm mb-2">
                  <img
                    src={item.image_url}
                    alt={displayItemTitle(item)}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement?.classList.add("bg-gray-100");
                    }}
                  />
                </div>
                <span className="w-full min-w-0 text-center text-[13px] sm:text-sm font-medium tracking-tight truncate text-gray-800 px-1">
                  {displayItemTitle(item)}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 섹션 4: 실시간 인기 아트 네일 (2열 그리드) */}
        <section className="mb-0 px-5">
          <div className="mt-12 mb-4 flex items-center justify-between gap-2">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              실시간 인기 아트 네일
            </h3>
            <button type="button" className="shrink-0 text-sm font-medium text-gray-500" onClick={() => navigate('/client/popular-art-list')}>
              전체보기 {'>'}
            </button>
          </div>
          <div className="mb-0 grid grid-cols-2 gap-4 pb-10">
            {popularArtItems.map((item) => (
              <article key={item.id} className="flex flex-col gap-0 cursor-pointer" onClick={() => openDetail(item)}>
                <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm mb-2">
                  <img
                    src={item.image_url}
                    alt={displayItemTitle(item)}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement?.classList.add("bg-gray-100");
                    }}
                  />
                </div>
                <span className="w-full min-w-0 text-center text-sm font-medium tracking-tight truncate text-gray-800 px-1">
                  {displayItemTitle(item)}
                </span>
              </article>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
