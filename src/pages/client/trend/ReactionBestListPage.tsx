import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";

// V1 탭 데이터 추출
const TAB_ITEMS = [
  { id: "save", name: "📌 압도적 저장" },
  { id: "like", name: "❤️ 독보적 하트" },
];

// 더미 데이터
const DUMMY_ITEMS = [
  { id: 1, title: "라벤더 마블 풀스톤", image: "https://images.unsplash.com/photo-1516975080661-460ce4178550?w=800&q=80" }, // 1위 (고화질 권장)
  { id: 2, title: "블랙 화이트프렌치 스톤", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80" },
  { id: 3, title: "심플 누드 무광 진주", image: "https://images.unsplash.com/photo-1505330592283-e14b8a213e48?w=400&q=80" },
  { id: 4, title: "올드머니 레드 시럽 글리터", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?w=400&q=80" },
  { id: 5, title: "우아한 카키 드로잉", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&q=80" },
];

export default function ReactionBestListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("save");

  const top1 = DUMMY_ITEMS[0];
  const gridItems = DUMMY_ITEMS.slice(1);

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex flex-col pb-20">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="flex h-14 w-full items-center justify-between px-5">
          <button type="button" className="p-1 text-gray-800" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="whitespace-nowrap text-lg font-bold tracking-tight text-gray-900">
            유저 반응 BEST
          </h1>
          <button type="button" className="p-1 text-gray-800" onClick={() => navigate("/search")}>
            <Search className="w-5 h-5" />
          </button>
        </div>
        
        {/* V1 밑줄형 탭 유지 */}
        <div className="mb-6 mt-2 flex w-full border-t border-gray-50 px-2 sm:px-4">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-h-[3rem] min-w-0 flex-1 items-center justify-center px-2 py-3 text-center text-sm font-medium leading-tight transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 pt-4">
        {/* 1위 카드: 화면 전체 너비 + 내부 텍스트 그라데이션 처리 */}
        <div className="px-4">
          <div className="relative block w-full cursor-pointer overflow-hidden rounded-[20px] border border-black/5 bg-gray-200 shadow-sm aspect-[3/4] text-left">
            <img alt={top1.title} className="h-full w-full object-cover object-center" src={top1.image} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] min-h-[45%] bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden />
            
            {/* 왕관 뱃지 */}
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              <span>👑</span>
              <span>1</span>
            </div>
            
            <div className="absolute bottom-4 left-4 z-10 flex w-[calc(100%-2rem)] flex-col items-start">
              <h2 className="w-full min-w-0 text-left text-lg font-bold leading-snug tracking-tight text-white">
                {top1.title}
              </h2>
            </div>
          </div>
        </div>

        {/* 2위 이하: 2열 그리드 리스트 */}
        <div className="mt-6 grid grid-cols-2 gap-3 px-4">
          {gridItems.map((item, idx) => {
            const rank = idx + 2;
            return (
              <div key={item.id} className="group flex min-w-0 cursor-pointer flex-col gap-0 text-left">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 bg-gray-200 shadow-sm">
                  <img alt={item.title} className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105" src={item.image} />
                  {/* 일반 숫자 뱃지 */}
                  <div className="absolute left-2 top-2 z-10 flex h-7 min-w-[1.75rem] items-center justify-center rounded-md bg-gray-900/85 px-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                    {rank}
                  </div>
                </div>
                <div className="mt-2 flex w-full flex-col items-center justify-center">
                  <span className="w-full min-w-0 text-center text-sm font-medium tracking-tight truncate text-gray-800">
                    {item.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
