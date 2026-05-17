import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";

const RECENT_SEARCHES = ["키치 블랙 리본", "웨딩 화이트", "체리 레드 눈꽃", "스톤 파츠 네일", "청순 누드 톤", "파스텔 무광 풀컬러"];

const SEARCH_TRENDS = [
  { rank: 1, text: "시럽 네일", status: "up" },
  { rank: 2, text: "누드 톤", status: "up" },
  { rank: 3, text: "마그넷", status: "new" },
  { rank: 4, text: "화이트 프렌치", status: "same" },
  { rank: 5, text: "글리터 포인트", status: "down" },
];

const SUGGESTED_STYLES = ["#진주", "#소라", "#마블", "#거울", "#올드머니"];

export default function SearchMainPage() {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-white pb-28 text-gray-900">
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-gray-50 bg-white/95 px-5 backdrop-blur-md">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기" className="p-2 -ml-2 text-gray-900 rounded-full">
          <ChevronLeft className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900 whitespace-nowrap">
          검색
        </h1>
        <div className="w-10 shrink-0" aria-hidden />
      </header>

      <main className="px-5 pt-4">
        <section>
          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={2} />
            <span className="text-sm text-gray-400">시럽 네일, 봄 트렌드 검색</span>
          </div>

          <div className="relative mx-auto mt-8 mb-6 flex h-[200px] w-full max-w-[220px] items-center justify-center">
            <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-50" aria-hidden />
            <div className="relative z-10 w-[160px] h-[160px] rounded-full bg-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
                <img src="/search/GL-0000358.jpg" alt="검색 메인 네일" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          </div>

          <p className="mt-6 text-center text-lg font-bold text-slate-900 whitespace-pre-line leading-tight">
            어떤 네일을 찾고 싶으세요?<br />
            다양한 디자인을 찾아보세요
          </p>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-gray-900">최근 검색어</h2>
            <button type="button" className="text-sm font-medium text-gray-500">
              전체삭제 {">"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {RECENT_SEARCHES.map((term) => (
              <button key={term} type="button" className="rounded-full bg-gray-100 px-3.5 py-1.5 text-[13px] font-medium text-gray-700">
                {term}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-gray-900">인기 검색어 트렌드</h2>
            <button type="button" className="text-sm font-medium text-gray-500" onClick={() => navigate('/client/search-trend-list')}>
              전체보기 {">"}
            </button>
          </div>
          <div className="flex flex-col">
            {SEARCH_TRENDS.map((item) => (
              <div key={item.rank} className="flex items-center py-3.5 border-b border-gray-50 last:border-0 cursor-pointer">
                <span className={`w-6 text-left text-[15px] font-bold ${item.rank <= 3 ? 'text-[#FF7E67]' : 'text-gray-400'}`}>
                  {item.rank}
                </span>
                <span className="flex-1 text-[14px] font-medium text-gray-800">{item.text}</span>
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

        <section className="mt-10">
          <h2 className="mb-4 text-base font-bold text-gray-900">이런 스타일은 어때요?</h2>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_STYLES.map((tag) => (
              <button key={tag} type="button" className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[13px] text-gray-600 shadow-sm">
                {tag}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={() => navigate("/client/category")}
          className="mt-10 flex w-full items-center justify-center gap-0.5 rounded-xl border border-gray-200 bg-white py-4 text-sm font-semibold text-gray-900 shadow-sm"
        >
          카테고리 전체보기 {">"}
        </button>
      </main>
    </div>
  );
}
