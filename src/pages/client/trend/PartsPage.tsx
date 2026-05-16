import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';

export default function PartsPage() {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-white pb-28 text-[#1A1A1A]">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 relative flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white px-5 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-gray-900 transition-colors hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2} />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-tight text-gray-900 whitespace-nowrap">
          포인트 파츠 트렌드
        </h1>
        <button type="button" className="p-1 -mr-1 text-gray-900 transition-colors hover:bg-gray-100 rounded-full">
          <Search className="w-5 h-5" strokeWidth={2} />
        </button>
      </header>

      <main>
        {/* 섹션 1: 파츠별 모아보기 (원형 탭) */}
        <section className="pt-6 pb-5">
          <div className="mb-5 flex items-baseline justify-between gap-2 px-5">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              파츠별 모아보기
            </h3>
            <button
              type="button"
              onClick={() => navigate('/client/parts-list')}
              className="shrink-0 cursor-pointer text-sm font-medium text-gray-500"
            >
              전체보기 {'>'}
            </button>
          </div>
          <div className="flex items-start gap-4 overflow-x-auto px-5 pb-1.5 pt-1 scrollbar-hide [&::-webkit-scrollbar]:hidden">
            {[
              { label: "스톤/큐빅", img: "https://picsum.photos/100/100?random=1", active: true },
              { label: "리본", img: "https://picsum.photos/100/100?random=2", active: false },
              { label: "진주", img: "https://picsum.photos/100/100?random=3", active: false },
              { label: "메탈/체인", img: "https://picsum.photos/100/100?random=4", active: false },
              { label: "나비", img: "https://picsum.photos/100/100?random=5", active: false },
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
        <section className="mb-0 px-4">
          <div className="group relative mb-0 aspect-[3/4] w-full overflow-hidden rounded-[20px] shadow-lg">
            <img alt="발레코어 화이트" className="h-full w-full object-cover object-center" src="https://picsum.photos/600/800?random=6" />
            <div className="absolute inset-x-5 bottom-5">
              <div className="relative z-10">
                <h2 className="text-[28px] font-extrabold text-white drop-shadow-md truncate leading-tight">
                  발레코어 화이트
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* 섹션 3: 지금 가장 핫한 스톤 BEST (가로 스크롤) */}
        <section className="mb-0">
          <div className="mt-12 mb-4 flex items-center justify-between gap-2 px-4">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              지금 가장 핫한 스톤 BEST
            </h3>
            <button
              type="button"
              onClick={() => navigate('/client/stone-best-list')}
              className="shrink-0 cursor-pointer text-sm font-medium text-gray-500"
            >
              전체보기 {'>'}
            </button>
          </div>
          <div className="mb-0 flex gap-4 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden">
            {[
              { id: 1, name: '발레코어 화이트', img: 'https://picsum.photos/300/400?random=7' },
              { id: 2, name: '화려한 라벤더 스톤', img: 'https://picsum.photos/300/400?random=8' },
              { id: 3, name: '청순 블랙 펄 드로잉', img: 'https://picsum.photos/300/400?random=9' }
            ].map((item) => (
              <button key={item.id} type="button" className="flex w-32 shrink-0 flex-col text-center bg-transparent p-0">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm mb-2">
                  <img src={item.img} alt={item.name} className="h-full w-full object-cover object-center" />
                </div>
                <span className="w-full min-w-0 text-[14px] font-medium tracking-tight truncate text-gray-800 px-1">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 섹션 4: 인기 풀파츠 스타일 (2열 그리드) */}
        <section className="mb-0 px-4">
          <div className="mt-12 mb-4 flex w-full items-center justify-between gap-2">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              인기 풀파츠 스타일
            </h3>
            <button
              type="button"
              onClick={() => navigate('/client/full-parts-list')}
              className="shrink-0 cursor-pointer text-sm font-medium text-gray-500"
            >
              전체보기 {'>'}
            </button>
          </div>
          <div className="mb-0 grid grid-cols-2 gap-4 pb-10">
            {[
              { id: 1, name: '우아한 카키 드로잉', img: 'https://picsum.photos/300/400?random=10' },
              { id: 2, name: '유니크 실버 리본', img: 'https://picsum.photos/300/400?random=11' },
              { id: 3, name: '심플 버건디 트위드 진주', img: 'https://picsum.photos/300/400?random=12' },
              { id: 4, name: '레드 수채화 풀파츠', img: 'https://picsum.photos/300/400?random=13' }
            ].map((item) => (
              <article key={item.id} className="flex flex-col gap-0 cursor-pointer">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm mb-2">
                  <img src={item.img} alt={item.name} className="h-full w-full object-cover object-center" />
                </div>
                <span className="w-full min-w-0 text-center text-[14px] font-medium tracking-tight truncate text-gray-800 px-1">
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
