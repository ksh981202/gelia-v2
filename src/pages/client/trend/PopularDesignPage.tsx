import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";

// 공통 썸네일 클래스
const NAIL_THUMB_IMAGE_FRAME = "aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5";
const NAIL_THUMB_TITLE = "block w-full min-w-0 max-w-full text-center text-sm font-medium tracking-tight text-gray-800 truncate mt-2";

// 각 섹션별 하드코딩 더미 데이터 (사진 2, 3 기반)
const PERIOD_BEST = [
  { id: 1, title: "하객 유니크 코랄 생화", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=400&q=80" },
  { id: 2, title: "다크 프렌치 조개", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80" },
  { id: 3, title: "웨딩 핑크 조개", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&q=80" },
];

const REACTION_BEST = [
  { id: 4, title: "올드머니 레드 시럽 글리터", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?w=400&q=80" },
  { id: 5, title: "라벤더 마블 풀스톤", image: "https://images.unsplash.com/photo-1516975080661-460ce4178550?w=400&q=80" },
];

const SHAPE_BEST = [
  { id: 6, title: "올드머니 레드 시럽 글리터", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?w=400&q=80" },
  { id: 7, title: "라벤더 마블 풀스톤", image: "https://images.unsplash.com/photo-1516975080661-460ce4178550?w=400&q=80" },
  { id: 8, title: "발레코어 투명 풀스톤", image: "https://images.unsplash.com/photo-1505330592283-e14b8a213e48?w=400&q=80" },
];

const SEARCH_TRENDS = [
  { rank: 1, text: "시럽 네일", status: "up" },
  { rank: 2, text: "누드 톤", status: "up" },
  { rank: 3, text: "마그넷", status: "new" },
  { rank: 4, text: "화이트 프렌치", status: "same" },
  { rank: 5, text: "글리터 포인트", status: "down" },
];

export default function PopularDesignPage() {
  const navigate = useNavigate();

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
            {PERIOD_BEST.map((item) => (
              <article key={item.id} className="flex w-32 flex-none cursor-pointer flex-col snap-start">
                <div className={`relative ${NAIL_THUMB_IMAGE_FRAME} bg-gray-100`}>
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover object-center" />
                </div>
                <span className={NAIL_THUMB_TITLE}>{item.title}</span>
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
            {REACTION_BEST.map((item) => (
              <article key={item.id} className="flex w-[260px] shrink-0 cursor-pointer flex-col">
                <div className={`${NAIL_THUMB_IMAGE_FRAME} bg-gray-100`}>
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover object-center" />
                </div>
                <span className={NAIL_THUMB_TITLE}>{item.title}</span>
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
            {SHAPE_BEST.map((item) => (
              <article key={item.id} className="flex w-32 flex-none cursor-pointer flex-col snap-start">
                <div className={`${NAIL_THUMB_IMAGE_FRAME} bg-gray-100`}>
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover object-center" />
                </div>
                <span className={NAIL_THUMB_TITLE}>{item.title}</span>
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
