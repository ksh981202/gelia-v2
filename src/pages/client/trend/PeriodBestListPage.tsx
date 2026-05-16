import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, Search } from "lucide-react";

const PERIOD_TABS = ["🔥 일간", "👑 주간", "🏆 월간"];

// 더미 데이터
const DUMMY_ITEMS = [
  { id: 1, title: "하객 유니크 코랄 생화", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=400&q=80" },
  { id: 2, title: "다크 프렌치 조개", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80" },
  { id: 3, title: "웨딩 핑크 조개", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&q=80" },
  { id: 4, title: "올드머니 레드 시럽 글리터", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?w=400&q=80" },
  { id: 5, title: "라벤더 마블 풀스톤", image: "https://images.unsplash.com/photo-1516975080661-460ce4178550?w=400&q=80" },
  { id: 6, title: "발레코어 투명 풀스톤", image: "https://images.unsplash.com/photo-1505330592283-e14b8a213e48?w=400&q=80" },
  { id: 7, title: "우아한 화이트 3D 하트", image: "https://images.unsplash.com/photo-1516975080661-460ce4178550?w=400&q=80" },
  { id: 8, title: "청순 누드 트위드", image: "https://images.unsplash.com/photo-1505330592283-e14b8a213e48?w=400&q=80" },
];

export default function PeriodBestListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("🔥 일간");

  return (
    <div className="relative mx-auto max-w-md bg-gray-50 pb-20 min-h-screen">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="relative flex h-14 w-full items-center justify-between px-5">
          <button type="button" onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-tight text-gray-900 whitespace-nowrap">
            기간별 BEST 네일
          </h1>
          <button type="button" className="p-1 -mr-1" onClick={() => navigate("/search")}>
            <Search className="w-5 h-5 text-gray-900" />
          </button>
        </div>
        
        {/* 상단 탭: 기존 주황색이 아닌 V1의 둥근 검은색(slate-900) 스타일 적용 */}
        <div className="flex flex-nowrap gap-2 overflow-x-auto px-4 pb-2 pt-1 mt-2 mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth [-webkit-overflow-scrolling:touch]">
          {PERIOD_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={
                  isActive
                    ? "shrink-0 whitespace-nowrap rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors"
                    : "shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200/90"
                }
              >
                {tab}
              </button>
            );
          })}
          <div className="w-4 shrink-0" aria-hidden="true" />
        </div>

        <div className="relative flex items-center justify-between px-4 pb-3 pt-2">
          <span className="text-sm text-gray-500">
            총 <strong className="text-gray-900">20</strong>개의 디자인
          </span>
          <button type="button" className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100">
            <span>인기순</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </header>

      {/* 2열 그리드 리스트 */}
      <main className="grid grid-cols-2 gap-4 px-4 pb-6 pt-4">
        {DUMMY_ITEMS.map((item, index) => (
          <article key={item.id} className="flex w-full min-w-0 cursor-pointer flex-col items-stretch gap-0">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 bg-gray-200 shadow-sm">
              <img src={item.image} alt={item.title} className="h-full w-full object-cover object-center transition-transform hover:scale-105" />
              {/* 좌측 상단 랭킹 뱃지 */}
              <span className="absolute left-2 top-2 flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-gray-900/85 px-2 text-xs font-bold text-white shadow-sm backdrop-blur-[2px]">
                {index + 1}
              </span>
            </div>
            <div className="mt-2 flex w-full min-w-0 justify-center text-center px-1">
              <span className="block w-full min-w-0 truncate text-center text-sm font-medium tracking-tight text-gray-800">
                {item.title}
              </span>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
