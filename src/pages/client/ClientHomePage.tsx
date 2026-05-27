import { useClientHomeFeed } from "@/features/client-home/useClientHomeFeed";
import { useLanguageContext } from "@/contexts/LanguageContext";
import type { NailDesignRow } from "@/shared/types/database.types";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type HomeNailCard = { id: string; title: string; titleEn: string; image: string };

function toHomeNailCard(row: NailDesignRow): HomeNailCard {
  return {
    id: row.id,
    title: row.title,
    titleEn: row.title_en,
    image: row.image_url,
  };
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

export default function ClientHomePage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayIndexRef = useRef(0);
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const { data: feed, isLoading } = useClientHomeFeed();
  const { language } = useLanguageContext();
  const isEnglish = language === "en";

  const recommendNails = useMemo(
    () => (feed?.recommend ?? []).map(toHomeNailCard),
    [feed?.recommend],
  );
  const trendNails = useMemo(() => (feed?.trend ?? []).map(toHomeNailCard), [feed?.trend]);
  const popularNails = useMemo(
    () => (feed?.popular ?? []).map(toHomeNailCard),
    [feed?.popular],
  );

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
    <div className="w-full flex flex-col min-h-screen overflow-x-hidden bg-[#fdfaf7] pb-4">
      <section className="mt-2 px-5">
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
            <div key={nail.id} className="relative w-full flex-none snap-center cursor-pointer" onClick={() => navigate(`/detail/${nail.id}`)}>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm">
                <img src={nail.image} alt={homeNailTitle(nail, isEnglish)} fetchPriority={index === 0 ? "high" : undefined} loading={index > 0 ? "lazy" : undefined} decoding={index > 0 ? "async" : undefined} className="h-full w-full object-cover object-center" />
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-5 pt-12">
                  <div className="flex w-full flex-col items-start text-left">
                    <span className="mb-2 inline-block rounded-full bg-[#FF7E67] px-3 py-1 text-[11px] font-bold text-white shadow-sm">PICK</span>
                    <h3 className="w-full truncate text-lg font-bold text-white drop-shadow-md">{homeNailTitle(nail, isEnglish)}</h3>
                  </div>
                </div>
                {index > 0 && (
                  <button type="button" className="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); const el = scrollRef.current; if (!el) return; el.scrollBy({ left: -el.clientWidth, behavior: "smooth" }); }}>
                    <ChevronLeft size={18} strokeWidth={2} />
                  </button>
                )}
                {index < recommendNails.length - 1 && (
                  <button type="button" className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); const el = scrollRef.current; if (!el) return; el.scrollBy({ left: el.clientWidth, behavior: "smooth" }); }}>
                    <ChevronRight size={18} strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full mt-10 mb-10 px-5">
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

      <section className="mb-12 px-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-gray-900">{isEnglish ? "Trending Nails" : "트렌드 네일"}</h2>
          <span onClick={() => navigate('/trend')} className="cursor-pointer text-sm font-medium text-gray-500">{isEnglish ? "See All" : "전체보기"} {">"}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {isLoading
            ? [0, 1, 2].map((i) => (
                <div key={`trend-skel-${i}`} className="flex w-full flex-col items-center" aria-hidden>
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm bg-gray-200 animate-pulse" />
                  <span className="mt-2.5 h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                </div>
              ))
            : trendNails.map((nail) => (
                <div key={nail.id} className="flex w-full cursor-pointer flex-col items-center" onClick={() => navigate(`/detail/${nail.id}`)}>
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm">
                    <img src={nail.image} alt={homeNailTitle(nail, isEnglish)} loading="lazy" decoding="async" className="h-full w-full object-cover object-center" />
                  </div>
                  <span className="mt-2.5 w-full text-center text-[13px] font-medium leading-snug tracking-tight text-gray-800 line-clamp-2">{homeNailTitle(nail, isEnglish)}</span>
                </div>
              ))}
        </div>
      </section>

      <section className="mb-12 px-5">
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
                <div key={nail.id} className="flex w-full cursor-pointer flex-col items-center" onClick={() => navigate(`/detail/${nail.id}`)}>
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm">
                    <img src={nail.image} alt={homeNailTitle(nail, isEnglish)} loading="lazy" decoding="async" className="h-full w-full object-cover object-center" />
                  </div>
                  <span className="mt-2.5 w-full text-center text-[14px] font-medium tracking-tight text-gray-800 truncate">{homeNailTitle(nail, isEnglish)}</span>
                </div>
              ))}
        </div>
      </section>

      <section className="mb-10 mt-8 px-5">
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

      <footer className="w-full border-t border-gray-200 bg-gray-50 px-5 pb-8 pt-10 text-left font-sans">
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
              <p className="text-[13px] text-gray-500">{isEnglish ? "Contact: k981202@naver.com" : "문의: k981202@naver.com"}</p>
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
