import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, Search } from "lucide-react";

// V1의 복잡한 로직을 걷어내고 순수 UI 구성을 위한 하드코딩 더미 데이터
const PARTS_STYLE_TABS = [
  "전체",
  "💎 스톤/큐빅",
  "🎀 리본",
  "⚪ 진주",
  "⛓️ 메탈/체인",
  "🦋 나비",
];

const DUMMY_ITEMS = [
  { id: 1, title: "웨딩 핑크 조개", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=400&q=80" },
  { id: 2, title: "발레코어 투명 풀스톤", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80" },
  { id: 3, title: "라벤더 마블 풀스톤", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&q=80" },
  { id: 4, title: "청순 누드 트위드", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?w=400&q=80" },
  { id: 5, title: "청순 파스텔 오피스", image: "https://images.unsplash.com/photo-1516975080661-460ce4178550?w=400&q=80" },
  { id: 6, title: "발레코어 소라 치크", image: "https://images.unsplash.com/photo-1505330592283-e14b8a213e48?w=400&q=80" },
];

export default function PartsListPage() {
  const navigate = useNavigate();
  // 정적 UI 테스트를 위해 '💎 스톤/큐빅' 탭을 기본 선택 상태로 둡니다. (두번째 사진 기준)
  const [activeTab, setActiveTab] = useState("💎 스톤/큐빅");

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white text-slate-900 pb-20">
      {/* 상단 헤더 */}
      <div className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
        <header className="relative flex h-14 w-full items-center justify-between bg-white px-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="z-10 p-2 -ml-2"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          
          <h1 className="absolute left-1/2 top-1/2 max-w-[62%] -translate-x-1/2 -translate-y-1/2 truncate text-center text-lg font-bold text-gray-900 whitespace-nowrap">
            {/* 탭 이름에 따라 유동적으로 헤더 타이틀이 바뀌게 (사진과 일치시킴) */}
            {activeTab.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim()}
          </h1>
          
          <button
            type="button"
            className="z-10 p-2 -mr-2"
            aria-label="검색"
          >
            <Search className="w-6 h-6 text-gray-900" />
          </button>
        </header>

        {/* 카테고리 칩 (가로 스크롤) */}
        <section className="w-full flex flex-nowrap gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4 pb-2 pt-1 whitespace-nowrap scroll-smooth [-webkit-overflow-scrolling:touch]">
          {PARTS_STYLE_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={
                  isActive
                    ? "bg-[#FF7E67] text-white rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap shrink-0"
                    : "bg-gray-100 text-gray-600 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap shrink-0"
                }
              >
                {tab}
              </button>
            );
          })}
          <div className="w-4 shrink-0" aria-hidden="true" />
        </section>

        {/* 총 디자인 개수 및 정렬 필터 */}
        <div className="relative flex items-center justify-between px-4 pb-3 pt-2">
          <span className="text-sm text-gray-500">
            총 <span className="font-bold text-[#FF7E67]">289</span> 개의 디자인
          </span>
          <button
            type="button"
            className="flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors active:bg-gray-100"
          >
            <span>인기순</span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* 2열 그리드 네일 카드 리스트 (픽셀 퍼펙트 V1 클래스 유지) */}
      <main className="grid grid-cols-2 gap-4 px-4 pb-6 pt-4">
        {DUMMY_ITEMS.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-2 cursor-pointer"
          >
            {/* 사진 2와 동일한 3:4 비율 (V1 클래스: aspect-[3/4]) */}
            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="mt-2 flex w-full flex-col items-center justify-center px-1">
              <p className="w-full text-center text-sm font-medium tracking-tight text-gray-800 line-clamp-2">
                {item.title}
              </p>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
