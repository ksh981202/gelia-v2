import { supabase } from "@/shared/api/supabaseClient";
import { useLanguageContext } from "@/contexts/LanguageContext";
import type { NailDesignRow } from "@/shared/types/database.types";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate, useNavigationType, useSearchParams } from "react-router-dom";

const STONE_BEST_TABS = ['전체', '💎 스톤/큐빅', '⚪ 진주/체인', '🐚 조개/자개'] as const;
const STONE_BEST_LIMIT = 30;
const STONE_BEST_SCROLL_Y_KEY = "gelia_stone_best_scroll_y";

type RankingNailRow = NailDesignRow & { ranking_score?: number };

const STONE_BEST_TAB_LABEL_EN: Record<(typeof STONE_BEST_TABS)[number], string> = {
  전체: "All",
  "💎 스톤/큐빅": "💎 Stone/Cubic",
  "⚪ 진주/체인": "⚪ Pearl/Chain",
  "🐚 조개/자개": "🐚 Shell/Mother-of-Pearl",
};

function extractPureThemeKeyword(raw: string): string {
  return String(raw ?? "")
    .replace(/[^\u3131-\u318E\uAC00-\uD7A3a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveActiveStoneTab(rawTab: string | null): (typeof STONE_BEST_TABS)[number] {
  const trimmed = rawTab?.trim();
  if (!trimmed || trimmed === "전체") return "전체";
  const pure = extractPureThemeKeyword(trimmed);
  return STONE_BEST_TABS.find((tab) => tab === trimmed || extractPureThemeKeyword(tab) === pure) ?? "전체";
}

function stoneTabKeywordForQuery(tab: (typeof STONE_BEST_TABS)[number]): string {
  if (tab === "전체") return "스톤 큐빅";
  return extractPureThemeKeyword(tab);
}

function displayStoneBestTabLabel(tab: (typeof STONE_BEST_TABS)[number], isEnglish: boolean): string {
  return isEnglish ? STONE_BEST_TAB_LABEL_EN[tab] : tab;
}

function displayItemTitle(item: NailDesignRow, isEnglish: boolean): string {
  const ko = String(item.title ?? "").trim();
  const en = String(item.title_en ?? "").trim();
  if (isEnglish && en) return en;
  return ko || en || (isEnglish ? "Nail Design" : "네일 디자인");
}

function useStyleBestRankingQuery(period: string, maxLimit: number) {
  return useQuery({
    queryKey: ["nail-designs", "stone-best-ranking", { period, maxLimit }],
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }): Promise<RankingNailRow[]> => {
      const { data, error } = await supabase
        .rpc("get_style_ranking_nails", { p_period: period, p_limit: maxLimit })
        .abortSignal(signal);

      if (error) throw error;
      return (data ?? []) as RankingNailRow[];
    },
  });
}

export default function StoneBestListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const { language } = useLanguageContext();
  const isEnglish = language === "en";
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabButtonRef = useRef<HTMLButtonElement | null>(null);

  const activeTab = useMemo(() => resolveActiveStoneTab(searchParams.get("tab")), [searchParams]);
  const activeTabKeyword = stoneTabKeywordForQuery(activeTab);
  const { data = [], isLoading, isError } = useStyleBestRankingQuery(activeTabKeyword, STONE_BEST_LIMIT);
  const rankingItems = data.slice(0, STONE_BEST_LIMIT);

  const setActiveTab = useCallback(
    (tab: (typeof STONE_BEST_TABS)[number]) => {
      const next = new URLSearchParams(searchParams);
      if (tab === "전체") {
        next.delete("tab");
      } else {
        next.set("tab", extractPureThemeKeyword(tab));
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const saveListScrollPosition = useCallback(() => {
    try {
      sessionStorage.setItem(STONE_BEST_SCROLL_Y_KEY, window.scrollY.toString());
    } catch {
      // sessionStorage may be unavailable in private or restricted contexts.
    }
  }, []);

  useEffect(() => {
    activeTabButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeTab]);

  useEffect(() => {
    if (navigationType !== "POP" || isLoading || rankingItems.length === 0) return;
    const savedY = sessionStorage.getItem(STONE_BEST_SCROLL_Y_KEY);
    if (!savedY) return;
    const y = Number.parseInt(savedY, 10);
    if (Number.isNaN(y)) return;
    const timer = window.setTimeout(() => {
      window.scrollTo(0, y);
      sessionStorage.removeItem(STONE_BEST_SCROLL_Y_KEY);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [navigationType, location.pathname, isLoading, rankingItems.length]);

  return (
    <div className="max-w-md mx-auto w-full min-w-0 min-h-screen bg-white text-slate-900 pb-20">
      <div className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
        <header className="relative flex h-14 w-full items-center justify-between bg-white px-5">
          <button type="button" onClick={() => navigate(-1)} className="z-10 p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="absolute left-1/2 top-1/2 max-w-[62%] -translate-x-1/2 -translate-y-1/2 truncate text-center text-lg font-bold text-gray-900 whitespace-nowrap">
            {isEnglish ? "Hottest Stone BEST" : "지금 가장 핫한 스톤 BEST"}
          </h1>
          <button type="button" className="z-10 p-2 -mr-2" onClick={() => navigate("/client/search")}>
            <Search className="w-6 h-6 text-gray-900" />
          </button>
        </header>

        <section className="w-full flex flex-nowrap gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4 pb-2 pt-1 whitespace-nowrap scroll-smooth [-webkit-overflow-scrolling:touch]">
          {STONE_BEST_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                ref={isActive ? activeTabButtonRef : undefined}
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={
                  isActive
                    ? "bg-[#FF7E67] text-white rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap shrink-0"
                    : "bg-gray-100 text-gray-600 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap shrink-0"
                }
              >
                {displayStoneBestTabLabel(tab, isEnglish)}
              </button>
            );
          })}
          <div className="w-4 shrink-0" aria-hidden="true" />
        </section>

        <div className="relative flex items-center justify-between px-4 pb-3 pt-2">
          <span className="text-sm text-gray-500">
            {isEnglish ? (
              <>Total <span className="font-bold text-[#FF7E67]">{STONE_BEST_LIMIT}</span> designs</>
            ) : (
              <>총 <span className="font-bold text-[#FF7E67]">{STONE_BEST_LIMIT}</span>개의 디자인</>
            )}
          </span>
        </div>
      </div>

      <main className="grid grid-cols-2 gap-4 px-4 pb-6 pt-4">
        {isLoading ? (
          Array.from({ length: STONE_BEST_LIMIT }, (_, index) => (
            <article key={`stone-best-skel-${index}`} className="flex flex-col gap-2" aria-hidden>
              <div className="w-full aspect-[3/4] rounded-lg bg-gray-100 animate-pulse" />
              <div className="mt-2 flex w-full flex-col gap-1 px-1">
                <div className="h-3.5 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-3.5 w-2/3 rounded bg-gray-200 animate-pulse" />
              </div>
            </article>
          ))
        ) : isError ? (
          <p className="col-span-2 py-12 text-center text-sm text-gray-500">
            {isEnglish ? "Failed to load rankings." : "랭킹을 불러오지 못했습니다."}
          </p>
        ) : rankingItems.length === 0 ? (
          <p className="col-span-2 py-12 text-center text-sm text-gray-500">
            {isEnglish ? "No nails registered yet." : "등록된 네일이 없어요."}
          </p>
        ) : (
          rankingItems.map((item, index) => {
            const title = displayItemTitle(item, isEnglish);
            return (
              <article key={item.id} className="flex flex-col gap-2 cursor-pointer">
                <Link
                  to={`/client/detail/${item.id}`}
                  onClick={saveListScrollPosition}
                  state={{ initialNailData: { ...item, imageUrl: item.image_url, title } }}
                  className="relative flex cursor-pointer flex-col gap-2"
                >
                  <div className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded bg-gray-900/90 text-[12px] font-bold text-white shadow-sm">
                    {index + 1}
                  </div>
                  <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={title}
                        className="h-full w-full object-cover object-center transition-transform hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement?.classList.add("animate-pulse", "bg-gray-100");
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="mt-2 flex w-full flex-col items-center justify-center px-1">
                    <p className="w-full text-center text-sm font-medium tracking-tight text-gray-800 line-clamp-2">{title}</p>
                  </div>
                </Link>
              </article>
            );
          })
        )}
      </main>
    </div>
  );
}
