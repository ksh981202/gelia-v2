import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';

export default function MoodPage() {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-white pb-28 text-[#333] antialiased">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 relative flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white/95 px-5 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-gray-900 transition-colors hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2} />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-lg font-bold tracking-tight text-gray-900">
          핫 트렌드 무드
        </h1>
        <button type="button" className="p-1 -mr-1 text-gray-900 transition-colors hover:bg-gray-100 rounded-full">
          <Search className="w-5 h-5" strokeWidth={2} />
        </button>
      </header>

      <main className="w-full bg-white">
        
        {/* 섹션 1: 무드별 모아보기 (알약 탭) */}
        <section className="mt-2">
          <div className="mb-3 mt-6 flex items-end justify-between gap-2 px-4">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              무드별 모아보기
            </h3>
            <button type="button" className="shrink-0 text-sm font-medium text-gray-500">
              전체보기 {'>'}
            </button>
          </div>
          <div className="mb-0 flex overflow-x-auto whitespace-nowrap gap-2 px-4 scrollbar-hide [&::-webkit-scrollbar]:hidden pb-2">
            {[
              { label: "🎀 발레코어", active: true },
              { label: "🎧 Y2K/키치", active: false },
              { label: "🥂 올드머니/시크", active: false },
            ].map((cat) => (
              <button
                key={cat.label}
                type="button"
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  cat.active
                    ? "bg-gray-900 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
            <div className="w-4 shrink-0" />
          </div>
        </section>

        {/* 섹션 2: 히어로 배너 */}
        <section className="mb-0 mt-5 px-4 pt-0">
          <div className="relative mb-0 aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-sm">
            <img alt="발레코어 화이트" className="absolute inset-0 h-full w-full object-cover object-center" src="https://picsum.photos/600/800?random=40" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-20 px-6 pb-6 pointer-events-none">
              <div className="relative z-10">
                <h2 className="text-[28px] font-extrabold text-white drop-shadow-md truncate leading-tight">
                  발레코어 화이트
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* 섹션 3: 세련된 미니멀 시크 BEST (가로 스크롤) */}
        <section className="mb-0">
          <div className="mt-12 mb-4 flex w-full items-center justify-between gap-2 px-4">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              세련된 미니멀 시크 BEST 🖤
            </h3>
            <button type="button" className="shrink-0 text-sm font-medium text-gray-500">
              전체보기 {'>'}
            </button>
          </div>
          <div className="mb-0 flex gap-3 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden">
            {[
              { id: 1, name: '유니크 실버 리본', img: 'https://picsum.photos/300/400?random=41' },
              { id: 2, name: '키치 블랙 라인', img: 'https://picsum.photos/300/400?random=42' },
              { id: 3, name: '청순 블랙 펄 드로잉', img: 'https://picsum.photos/300/400?random=43' }
            ].map((item) => (
              <button key={item.id} type="button" className="flex w-[130px] shrink-0 flex-col bg-transparent p-0 text-left">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm mb-2">
                  <img src={item.img} alt={item.name} className="h-full w-full object-cover object-center" />
                </div>
                <div className="flex w-full flex-col items-center justify-center">
                  <span className="w-full min-w-0 text-center text-sm font-medium tracking-tight truncate text-gray-800">
                    {item.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 섹션 4: 실시간 인기 무드 (2열 그리드) */}
        <section className="mb-0 px-4">
          <div className="mt-12 mb-4 flex w-full items-center justify-between gap-2">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              실시간 인기 무드
            </h3>
            <button type="button" className="shrink-0 text-sm font-medium text-gray-500">
              전체보기 {'>'}
            </button>
          </div>
          <div className="mb-0 grid grid-cols-2 gap-4 pb-10">
            {[
              { id: 1, name: '심플 피치 마블', img: 'https://picsum.photos/300/400?random=44' },
              { id: 2, name: '청순 수채화 체인', img: 'https://picsum.photos/300/400?random=45' },
              { id: 3, name: '올드머니 생화', img: 'https://picsum.photos/300/400?random=46' },
              { id: 4, name: '화려한 라벤더 스톤', img: 'https://picsum.photos/300/400?random=47' }
            ].map((item) => (
              <article key={item.id} className="flex flex-col gap-0 cursor-pointer">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm mb-2 bg-gray-100">
                  <img src={item.img} alt={item.name} className="h-full w-full object-cover object-center" />
                </div>
                <div className="flex w-full flex-col items-center justify-center">
                  <span className="w-full min-w-0 text-center text-sm font-medium tracking-tight truncate text-gray-800">
                    {item.name}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
