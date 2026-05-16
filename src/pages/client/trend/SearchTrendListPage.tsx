import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, Search } from "lucide-react";

// 사진 2 기반 탭 데이터 (메인 화면의 순위 데이터 활용)
const TREND_TABS = [
  "1위 시럽 네일",
  "2위 누드 톤",
  "3위 마그넷",
  "4위 화이트 프렌치",
  "5위 글리터 포인트",
];

// 더미 데이터
const DUMMY_ITEMS = [
  { id: 1, title: "웨딩 핑크 조개", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=400&q=80" },
  { id: 2, title: "올드머니 레드 시럽 글리터", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?w=400&q=80" },
  { id: 3, title: "발레코어 투명 풀스톤", image: "https://images.unsplash.com/photo-1505330592283-e14b8a213e48?w=400&q=80" },
  { id: 4, title: "여행 투명 마블 자개", image: "https://images.unsplash.com/photo-1516975080661-460ce4178550?w=400&q=80" },
  { id: 5, title: "투명 마블 웨딩 라인테이프", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&q=80" },
  { id: 6, title: "블랙 시럽 자개", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80" },
];

export default function SearchTrendListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1위 시럽 네일");

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white text-slate-900 pb-20">
      <div className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
        <header className="relative flex h-14 w-full items-center justify-between bg-white px-5">
          <button type="button" onClick={() => navigate(-1)} className="z-10 p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="absolute left-1/2 top-1/2 max-w-[62%] -translate-x-1/2 -translate-y-1/2 truncate text-center text-lg font-bold text-gray-900 whitespace-nowrap">
            인기 검색어 트렌드
          </h1>
          <button type="button" className="z-10 p-2 -mr-2">
            <Search className="w-6 h-6 text-gray-900" />
          </button>
        </header>

        {/* 상단 탭: 비활성 탭은 흰색 배경에 테두리 적용 */}
        <section className="w-full flex flex-nowrap gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4 pb-2 pt-3 whitespace-nowrap scroll-smooth [-webkit-overflow-scrolling:touch]">
          {TREND_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={
                  isActive
                    ? "shrink-0 whitespace-nowrap rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition-colors"
                    : "shrink-0 whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                }
              >
                {tab}
              </button>
            );
          })}
          <div className="w-4 shrink-0" aria-hidden="true" />
        </section>

        <div className="relative flex items-center justify-between px-4 pb-3 pt-2">
          <span className="text-sm text-gray-500">
            총 <span className="font-bold text-[#FF7E67]">78</span> 개의 디자인
          </span>
          <button type="button" className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
            <span>인기순</span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      <main className="grid grid-cols-2 gap-4 px-4 pb-6 pt-4">
        {DUMMY_ITEMS.map((item) => (
          <article key={item.id} className="flex flex-col gap-2 cursor-pointer">
            <div className="w-full aspect-[3/4] rounded-[20px] overflow-hidden bg-gray-100 border border-black/5">
              <img src={item.image} alt={item.title} className="h-full w-full object-cover object-center transition-transform hover:scale-105" />
            </div>
            <div className="mt-2 flex w-full flex-col items-center justify-center px-1">
              <p className="w-full text-center text-sm font-medium tracking-tight text-gray-800 line-clamp-2">{item.title}</p>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
