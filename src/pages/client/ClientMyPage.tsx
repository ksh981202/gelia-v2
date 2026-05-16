import { useState } from "react";
import { Bell, Bookmark, Heart } from "lucide-react";

type ActiveTab = "recent" | "liked" | "saved";

const DUMMY_ITEMS = [
  { id: 1, title: "힙 핑크 마그넷 체인", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=400&q=80" },
  { id: 2, title: "여행 투명 마블 자개", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80" },
  { id: 3, title: "누드 프렌치 3D리본", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&q=80" },
  { id: 4, title: "누드 미러파우더 심플 진주", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?w=400&q=80" },
];

export default function ClientMyPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("recent");

  const statBoxClass = "flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl px-1 sm:px-1.5 transition-[box-shadow,background-color]";

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white">
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-white px-5 border-b border-gray-50">
        <div className="w-8" />
        <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">
          마이페이지
        </h1>
        <button type="button" aria-label="알림" className="relative p-2 text-gray-600">
          <Bell className="h-6 w-6 text-current" strokeWidth={2} />
          <span className="absolute right-1.5 top-1.5 h-[9px] w-[9px] rounded-full border-[2px] border-white bg-red-500" />
        </button>
      </header>

      <main className="pb-24">
        <section className="flex flex-col items-center py-10 border-b border-gray-50">
          <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-full shadow-sm ring-[3px] ring-rose-100/80 ring-offset-2 ring-offset-white bg-rose-50 flex items-center justify-center">
             <img src="/avatars/default_profile_pearl.png" alt="프로필" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
             <span className="absolute text-5xl">🦪</span>
          </div>
          <div className="text-xl font-bold text-gray-900 mt-4">네일리버</div>
          <span className="mt-1.5 inline-flex items-center justify-center rounded-full bg-rose-50 px-3.5 py-1 text-center text-[13px] font-semibold text-rose-400">
            좋은 하루 보내세요 🌷
          </span>
        </section>

        <section className="grid grid-cols-3 gap-3 px-5 mt-8 mb-10">
          <button
            type="button"
            className={`${statBoxClass} ${activeTab === "recent" ? "ring-2 ring-gray-400 ring-offset-2 bg-gray-100" : "bg-gray-50 border border-gray-100"}`}
            onClick={() => setActiveTab("recent")}
          >
            <span className="flex h-8 w-8 items-center justify-center text-[22px]" aria-hidden>⏱️</span>
            <span className="text-[22px] font-extrabold tabular-nums leading-none text-gray-800">20</span>
            <span className="text-[13px] font-semibold text-gray-600">최근 본 디자인</span>
          </button>
          
          <button
            type="button"
            className={`${statBoxClass} ${activeTab === "liked" ? "ring-2 ring-rose-400 ring-offset-2 bg-rose-100" : "bg-rose-50 border border-rose-100"}`}
            onClick={() => setActiveTab("liked")}
          >
            <Heart className="h-7 w-7 fill-rose-500 text-rose-500" strokeWidth={1.5} aria-hidden />
            <span className="text-[22px] font-extrabold tabular-nums leading-none text-rose-500">12</span>
            <span className="text-[13px] font-semibold text-rose-500">좋아요 한 네일</span>
          </button>

          <button
            type="button"
            className={`${statBoxClass} ${activeTab === "saved" ? "ring-2 ring-indigo-400 ring-offset-2 bg-indigo-100" : "bg-indigo-50 border border-indigo-100"}`}
            onClick={() => setActiveTab("saved")}
          >
            <Bookmark className="h-[26px] w-[26px] text-indigo-500" strokeWidth={2.5} aria-hidden />
            <span className="text-[22px] font-extrabold tabular-nums leading-none text-indigo-500">10</span>
            <span className="text-[13px] font-semibold text-indigo-500">저장한 네일</span>
          </button>
        </section>

        <section className="mb-12">
          <div className="mb-5 flex items-center justify-between px-5">
            <h2 className="text-lg font-bold text-gray-900">
              {activeTab === 'recent' ? '최근 본 디자인' : activeTab === 'liked' ? '좋아요 한 네일' : '저장한 네일'}
            </h2>
            <button type="button" className="text-sm font-medium text-gray-500">
              전체보기 {">"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 px-5">
            {DUMMY_ITEMS.map((item) => (
              <article key={item.id} className="flex flex-col cursor-pointer">
                <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 border border-black/5 shadow-sm">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform hover:scale-105" />
                </div>
                <div className="mt-2.5 flex w-full flex-col items-center justify-center">
                  <span className="w-full text-center text-sm font-medium tracking-tight text-gray-800 line-clamp-1">
                    {item.title}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pt-4">
          <div className="mb-8">
            <div className="text-[13px] font-bold text-gray-400 mb-2 px-5">맞춤 설정</div>
            <button type="button" className="w-full flex items-center justify-between py-4 px-5 bg-white border-b border-gray-50 active:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔔</span>
                <span className="text-[15px] font-semibold text-gray-800">알림 설정</span>
              </div>
              <span className="text-gray-300 font-bold">{">"}</span>
            </button>
          </div>
          
          <div className="mb-8">
            <div className="text-[13px] font-bold text-gray-400 mb-2 px-5">계정</div>
            <button type="button" className="w-full flex items-center justify-between py-4 px-5 bg-white border-b border-gray-50 active:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚙️</span>
                <span className="text-[15px] font-semibold text-gray-800">계정 관리</span>
              </div>
              <span className="text-gray-300 font-bold">{">"}</span>
            </button>
            <button type="button" className="w-full flex items-center justify-between py-4 px-5 bg-white border-b border-gray-50 active:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎧</span>
                <span className="text-[15px] font-semibold text-gray-800">고객센터 / 공지사항</span>
              </div>
              <span className="text-gray-300 font-bold">{">"}</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
