import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';

export default function TexturePage() {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-white pb-28 text-[#1A1A1A]">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 relative flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white/95 px-5 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-gray-900 transition-colors hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-tight text-gray-900 whitespace-nowrap">
          텍스처 트렌드
        </h1>
        <button type="button" className="p-1 -mr-1 text-gray-900 transition-colors hover:bg-gray-100 rounded-full">
          <Search className="w-5 h-5" strokeWidth={2} />
        </button>
      </header>

      <main className="w-full bg-white text-gray-900">
        
        {/* 섹션 1: 텍스처별 모아보기 (원형 탭) */}
        <section className="pt-6 pb-5">
          <div className="mb-5 flex items-baseline justify-between gap-2 px-5">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              텍스처별 모아보기
            </h3>
            <button
              type="button"
              onClick={() => navigate('/client/texture-list')}
              className="shrink-0 text-sm font-medium text-gray-500 cursor-pointer"
            >
              전체보기 {'>'}
            </button>
          </div>
          <div className="flex flex-nowrap items-start gap-4 overflow-x-auto scrollbar-hide px-5 pb-1.5 pt-1 [&::-webkit-scrollbar]:hidden">
            {[
              { label: "시럽", img: "/texture/syrup.jpg", active: true },
              { label: "무광", img: "/texture/matte.jpg", active: false },
              { label: "글리터", img: "/texture/glitter.jpg", active: false },
              { label: "자석", img: "/texture/magnetic.jpg", active: false },
              { label: "미러파우더", img: "/texture/mirror.jpg", active: false },
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
          <div className="relative mb-0 block w-full aspect-[3/4] overflow-hidden rounded-[2rem] shadow-lg shadow-black/5">
            <img alt="올드머니 생화" className="h-full w-full object-cover object-center" src="https://picsum.photos/600/800?random=10" />
            <div className="absolute inset-x-0 bottom-0 px-8 pb-8 pt-0">
              <div className="relative z-10">
                <h2 className="text-[28px] font-extrabold text-white drop-shadow-md truncate leading-tight">
                  올드머니 생화
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* 섹션 3: 지금 가장 핫한 시럽 BEST */}
        <section className="mb-0">
          <div className="mt-12 mb-4 flex items-baseline justify-between gap-2 px-5">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              지금 가장 핫한 시럽 BEST
            </h3>
            <button
              type="button"
              onClick={() => navigate('/client/syrup-best')}
              className="shrink-0 cursor-pointer text-sm font-medium text-gray-500"
            >
              전체보기 {'>'}
            </button>
          </div>
          <div className="mb-0 flex gap-4 overflow-x-auto px-5 pb-4 [&::-webkit-scrollbar]:hidden">
            {[
              { id: 1, name: '심플 피치 마블', img: 'https://picsum.photos/300/400?random=11' },
              { id: 2, name: '청순 수채화 체인', img: 'https://picsum.photos/300/400?random=12' },
              { id: 3, name: '발레코어 화이트', img: 'https://picsum.photos/300/400?random=13' }
            ].map((item) => (
              <button key={item.id} type="button" className="w-40 shrink-0 text-left">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm">
                  <img alt={item.name} className="h-full w-full object-cover object-center" src={item.img} />
                </div>
                <div className="mt-2 flex w-full flex-col items-center justify-center">
                  <span className="w-full min-w-0 text-center text-sm font-medium tracking-tight truncate text-gray-800">
                    {item.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 섹션 4: 추천 갤러리 */}
        <section className="mb-0 px-5">
          <div className="mt-12 mb-4 flex w-full items-center justify-between gap-2">
            <h3 className="min-w-0 flex-1 text-lg font-bold tracking-tight text-gray-900">
              추천 갤러리
            </h3>
            <button
              type="button"
              onClick={() => navigate('/client/texture-gallery')}
              className="shrink-0 cursor-pointer text-sm font-medium text-gray-500"
            >
              전체보기 {'>'}
            </button>
          </div>
          <div className="mb-0 grid grid-cols-2 gap-x-4 gap-y-8">
            {[
              { id: 1, name: '올드머니 생화', img: 'https://picsum.photos/300/400?random=14' },
              { id: 2, name: '화려한 라벤더 스톤', img: 'https://picsum.photos/300/400?random=15' },
              { id: 3, name: '우아한 카키 드로잉', img: 'https://picsum.photos/300/400?random=16' },
              { id: 4, name: '유니크 실버 리본', img: 'https://picsum.photos/300/400?random=17' }
            ].map((item) => (
              <article key={item.id} className="group flex flex-col gap-0">
                <button type="button" className="text-left">
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm">
                    <img alt={item.name} className="h-full w-full object-cover object-center" src={item.img} />
                  </div>
                  <div className="mt-2 flex w-full flex-col items-center justify-center">
                    <span className="w-full min-w-0 text-center text-sm font-medium tracking-tight truncate text-gray-800">
                      {item.name}
                    </span>
                  </div>
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
