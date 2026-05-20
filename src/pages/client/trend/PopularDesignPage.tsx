import { useRecommendHubQuery } from "@/entities/nail-design/api/useRecommendHubQuery";
import type { NailDesignRow } from "@/shared/types/database.types";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";

// 공통 썸네일 클래스
const NAIL_THUMB_IMAGE_FRAME = "aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5";
const NAIL_THUMB_TITLE = "block w-full min-w-0 max-w-full text-center text-sm font-medium tracking-tight text-gray-800 truncate mt-2";

const SHAPE_KEYWORDS = [
  "숏",
  "미디엄",
  "롱",
  "오발",
  "라운드",
  "스퀘어",
  "코핀",
  "아몬드",
  "발레리나",
] as const;

const SEARCH_TRENDS = [
  { rank: 1, text: "시럽 네일", status: "up" },
  { rank: 2, text: "누드 톤", status: "up" },
  { rank: 3, text: "마그넷", status: "new" },
  { rank: 4, text: "화이트 프렌치", status: "same" },
  { rank: 5, text: "글리터 포인트", status: "down" },
];

function displayItemTitle(item: NailDesignRow): string {
  const ko = String(item.title ?? "").trim();
  const en = String(item.title_en ?? "").trim();
  return ko || en || "네일 디자인";
}

function metric(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function engagementScore(item: NailDesignRow): number {
  return Math.max(metric(item.views), metric(item.saves), metric(item.likes));
}

function compareByEngagementThenNewest(a: NailDesignRow, b: NailDesignRow): number {
  const byEngagement = engagementScore(b) - engagementScore(a);
  if (byEngagement !== 0) return byEngagement;

  const aTime = new Date(a.created_at ?? 0).getTime();
  const bTime = new Date(b.created_at ?? 0).getTime();
  return bTime - aTime;
}

function itemMatchesShapeKeyword(item: NailDesignRow): boolean {
  const haystack = [
    item.nail_length,
    item.design_elements,
    item.title,
    item.category,
    ...(item.tags ?? []),
    ...(item.styles ?? []),
  ]
    .map((part) => String(part ?? ""))
    .join(" ");

  return SHAPE_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function initialNailData(item: NailDesignRow) {
  return {
    ...item,
    imageUrl: item.image_url,
    title: displayItemTitle(item),
  };
}

export default function PopularDesignPage() {
  const navigate = useNavigate();
  const { data: hubData = [] } = useRecommendHubQuery();

  const periodBest = useMemo(
    () => [...hubData].sort(compareByEngagementThenNewest).slice(0, 6),
    [hubData],
  );

  const engagementFallback = useMemo(
    () => [...hubData].sort(compareByEngagementThenNewest),
    [hubData],
  );

  const reactionBest = useMemo(
    () => {
      const liked = [...hubData]
        .filter((item) => metric(item.likes) > 0)
        .sort((a, b) => metric(b.likes) - metric(a.likes))
        .slice(0, 6);

      if (liked.length >= 4) return liked;

      const seen = new Set(liked.map((item) => item.id));
      const fallback = engagementFallback
        .slice(2, 8)
        .filter((item) => !seen.has(item.id));
      return [...liked, ...fallback].slice(0, 6);
    },
    [hubData, engagementFallback],
  );

  const shapeBest = useMemo(
    () =>
      [...hubData]
        .filter(itemMatchesShapeKeyword)
        .sort(compareByEngagementThenNewest)
        .slice(0, 6),
    [hubData],
  );

  const goDetail = (item: NailDesignRow) => {
    navigate(`/client/detail/${item.id}`, {
      state: { initialNailData: initialNailData(item) },
    });
  };

  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-white pb-24 font-sans text-slate-900 antialiased">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white/95 px-5 backdrop-blur-md">
        <button type="button" aria-label="뒤로 가기" className="z-10 p-1 -ml-1" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-6 h-6 text-gray-900" strokeWidth={2} />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-lg font-bold tracking-tight text-gray-900">
          인기 네일 디자인
        </h1>
        <button type="button" aria-label="검색" className="z-10 p-1 -mr-1" onClick={() => navigate("/client/search")}>
          <Search className="w-6 h-6 text-gray-900" strokeWidth={2} />
        </button>
      </header>

      <main className="mt-4 flex flex-col gap-10">
        {/* 1. 기간별 BEST 네일 */}
        <section className="w-full">
          <div className="mb-4 flex w-full items-center justify-between gap-2 px-4">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">기간별 BEST 네일</h2>
            <button
              type="button"
              onClick={() => navigate('/client/period-best-list')}
              className="cursor-pointer text-sm font-medium text-gray-500"
            >
              전체보기 {">"}
            </button>
          </div>
          {/* 스크롤바 완벽 숨김 처리 */}
          <div className="flex snap-x gap-4 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {periodBest.map((item, index) => (
              <article
                key={item.id}
                className="flex w-32 flex-none cursor-pointer flex-col snap-start"
                onClick={() => goDetail(item)}
              >
                <div className={`relative ${NAIL_THUMB_IMAGE_FRAME} bg-gray-100`}>
                  <img
                    src={item.image_url}
                    alt={displayItemTitle(item)}
                    className="h-full w-full object-cover object-center"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : undefined}
                  />
                </div>
                <span className={NAIL_THUMB_TITLE}>{displayItemTitle(item)}</span>
              </article>
            ))}
          </div>
        </section>

        {/* 2. 유저 반응 BEST */}
        <section className="w-full">
          <div className="mb-4 flex w-full items-center justify-between gap-2 px-4">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">유저 반응 BEST</h2>
            <button
              type="button"
              onClick={() => navigate('/client/reaction-best-list')}
              className="cursor-pointer text-sm font-medium text-gray-500"
            >
              전체보기 {">"}
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {reactionBest.map((item) => (
              <article
                key={item.id}
                className="flex w-[260px] shrink-0 cursor-pointer flex-col"
                onClick={() => goDetail(item)}
              >
                <div className={`${NAIL_THUMB_IMAGE_FRAME} bg-gray-100`}>
                  <img
                    src={item.image_url}
                    alt={displayItemTitle(item)}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className={NAIL_THUMB_TITLE}>{displayItemTitle(item)}</span>
              </article>
            ))}
          </div>
        </section>

        {/* 3. 손톱 모양별 BEST 네일 */}
        <section className="w-full">
          <div className="mb-4 flex items-center justify-between gap-2 px-4">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">손톱 모양별 BEST 네일</h2>
            <button
              type="button"
              onClick={() => navigate('/client/shape-best-list')}
              className="cursor-pointer text-sm font-medium text-gray-500"
            >
              전체보기 {">"}
            </button>
          </div>
          <div className="flex snap-x gap-4 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {shapeBest.map((item) => (
              <article
                key={item.id}
                className="flex w-32 flex-none cursor-pointer flex-col snap-start"
                onClick={() => goDetail(item)}
              >
                <div className={`${NAIL_THUMB_IMAGE_FRAME} bg-gray-100`}>
                  <img
                    src={item.image_url}
                    alt={displayItemTitle(item)}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className={NAIL_THUMB_TITLE}>{displayItemTitle(item)}</span>
              </article>
            ))}
          </div>
        </section>

        {/* 4. 인기 검색어 트렌드 (독립 컴포넌트 인라인 정적 처리) */}
        <section className="w-full mb-10">
          <div className="mb-4 flex items-center justify-between gap-2 px-4">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">인기 검색어 트렌드</h2>
            <button
              type="button"
              onClick={() => navigate('/client/search-trend-list')}
              className="cursor-pointer text-sm font-medium text-gray-500"
            >
              전체보기 {">"}
            </button>
          </div>
          <div className="flex flex-col px-4">
            {SEARCH_TRENDS.map((item) => (
              <div key={item.rank} className="flex items-center py-3.5 border-b border-gray-50 last:border-0 cursor-pointer">
                <span className={`w-8 text-center text-lg font-bold ${item.rank <= 3 ? 'text-[#FF7E67]' : 'text-gray-400'}`}>
                  {item.rank}
                </span>
                <span className="flex-1 ml-3 text-[15px] font-medium text-gray-800">{item.text}</span>
                <div className="w-10 flex justify-end">
                  {item.status === 'up' && <TrendingUp className="w-5 h-5 text-[#FF7E67]" />}
                  {item.status === 'down' && <TrendingDown className="w-5 h-5 text-gray-400" />}
                  {item.status === 'same' && <Minus className="w-5 h-5 text-gray-300" />}
                  {item.status === 'new' && (
                    <span className="text-[10px] font-bold text-[#FF7E67] border border-[#FF7E67] rounded px-1.5 py-0.5">
                      NEW
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
