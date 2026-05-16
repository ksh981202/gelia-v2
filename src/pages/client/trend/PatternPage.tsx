import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';

export default function PatternPage() {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-white pb-28 text-neutral-800">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 relative flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white/95 px-5 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-gray-900 transition-colors hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-tight text-gray-900 whitespace-nowrap">
          아트 & 패턴 트렌드
        </h1>
        <button type="button" className="p-1 -mr-1 text-gray-900 transition-colors hover:bg-gray-100 rounded-full">
          <Search className="w-5 h-5" strokeWidth={2} />
        </button>
      </header>

      <main className="w-full bg-white">
        
        {/* 섹션 1: 아트별 모아보기 (원형 탭) */}
        <section className="pt-6 pb-5">
          <div className="mb-5 flex items-baseline justify-between gap-2 px-5">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              아트별 모아보기
            </h3>
            <button type="button" className="shrink-0 text-sm font-medium text-gray-500">
              전체보기 {'>'}
            </button>
          </div>
          <div className="flex flex-nowrap items-start gap-4 overflow-x-auto scrollbar-hide px-5 pb-1.5 pt-1 [&::-webkit-scrollbar]:hidden">
            {[
              { label: "프렌치", img: "https://picsum.photos/100/100?random=20", active: true },
              { label: "마블", img: "https://picsum.photos/100/100?random=21", active: false },
              { label: "체크", img: "https://picsum.photos/100/100?random=22", active: false },
              { label: "그라데이션", img: "https://picsum.photos/100/100?random=23", active: false },
              { label: "트위드", img: "https://picsum.photos/100/100?random=24", active: false },
            ].map((cat) => (
              <button key={cat.label} type="button" className="flex shrink-0 flex-col items-center gap-2.5">
                <div className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border border-gray-100 shadow-sm ${cat.active ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-white" : ""}`}>
                  <img alt={cat.label} className="absolute inset-0 h-full w-full object-cover object-center" src={cat.img} />
                </div>
                <span className={`font-sans text-[13px] tracking-tight ${cat.active ? "font-semibold text-gray-900" : "font-medium text-gray-800"}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 섹션 2: 히어로 배너 */}
        <section className="mb-0 px-5">
          <div className="group relative mb-0 w-full aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
            <img alt="화려한 라벤더 스톤" className="absolute inset-0 w-full h-full object-cover object-center" src="https://picsum.photos/600/800?random=25" />
            <div className="absolute inset-x-6 bottom-6">
              <div className="relative z-10">
                <h2 className="text-[28px] font-extrabold text-white drop-shadow-md truncate leading-tight">
                  화려한 라벤더 스톤
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* 섹션 3: 지금 가장 핫한 마블 BEST (3열 그리드) */}
        <section className="mb-0">
          <div className="mt-12 mb-4 flex items-center justify-between gap-2 px-5">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              지금 가장 핫한 마블 BEST
            </h3>
            <button type="button" className="shrink-0 text-sm font-medium text-gray-500">
              전체보기 {'>'}
            </button>
          </div>
          <div className="mb-0 grid grid-cols-3 gap-3 px-5">
            {[
              { id: 1, name: '심플 피치 마블', img: 'https://picsum.photos/300/400?random=26' },
              { id: 2, name: '겨울 파스텔 마블 풀스톤', img: 'https://picsum.photos/300/400?random=27' },
              { id: 3, name: '소라 마블 자개', img: 'https://picsum.photos/300/400?random=28' }
            ].map((item) => (
              <button key={item.id} type="button" className="flex flex-col items-center text-left bg-transparent p-0">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm mb-2">
                  <img src={item.img} alt={item.name} className="h-full w-full object-cover object-center" />
                </div>
                <span className="w-full min-w-0 text-center text-[13px] sm:text-sm font-medium tracking-tight truncate text-gray-800 px-1">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 섹션 4: 실시간 인기 아트 네일 (2열 그리드) */}
        <section className="mb-0 px-5">
          <div className="mt-12 mb-4 flex items-center justify-between gap-2">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              실시간 인기 아트 네일
            </h3>
            <button type="button" className="shrink-0 text-sm font-medium text-gray-500">
              전체보기 {'>'}
            </button>
          </div>
          <div className="mb-0 grid grid-cols-2 gap-4 pb-10">
            {[
              { id: 1, name: '하객 유니크 코랄 생화', img: 'https://picsum.photos/300/400?random=29' },
              { id: 2, name: '다크 프렌치 조개', img: 'https://picsum.photos/300/400?random=30' },
              { id: 3, name: '웨딩 핑크 조개', img: 'https://picsum.photos/300/400?random=31' },
              { id: 4, name: '올드머니 레드 시럽 글리터', img: 'https://picsum.photos/300/400?random=32' }
            ].map((item) => (
              <article key={item.id} className="flex flex-col gap-0 cursor-pointer">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm mb-2">
                  <img src={item.img} alt={item.name} className="h-full w-full object-cover object-center" />
                </div>
                <span className="w-full min-w-0 text-center text-sm font-medium tracking-tight truncate text-gray-800 px-1">
                  {item.name}
                </span>
              </article>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
