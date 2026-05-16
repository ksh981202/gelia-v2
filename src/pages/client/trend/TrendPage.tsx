import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';

export default function TrendPage() {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-gray-50 pb-20 text-gray-900">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-[#F2E8DA]/40 bg-gray-50 px-5">
        <button
          type="button"
          className="p-2 -ml-2 text-gray-900 transition-colors hover:bg-gray-100 rounded-full"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900 whitespace-nowrap">
          트렌드 네일
        </h1>
        <button
          type="button"
          className="p-2 -mr-2 text-gray-900 transition-colors hover:bg-gray-100 rounded-full"
        >
          <Search className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </button>
      </header>

      <main className="w-full bg-gray-50 px-5 text-gray-900">
        
        {/* 섹션 1: 텍스처 트렌드 */}
        <section className="pt-6">
          <div className="mb-5 flex w-full items-center justify-between gap-2">
            <h2 className="text-[20px] font-bold tracking-tight text-gray-900">
              텍스처 트렌드
            </h2>
            <button
              type="button"
              onClick={() => navigate('/client/texture')}
              className="text-[13px] font-medium text-gray-500 cursor-pointer"
            >
              전체보기 {'>'}
            </button>
          </div>
          <div className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4 [&::-webkit-scrollbar]:hidden">
            {[
              { id: 1, name: '시럽 네일', img: 'https://picsum.photos/300/400?random=1' },
              { id: 2, name: '자석 네일', img: 'https://picsum.photos/300/400?random=2' },
              { id: 3, name: '미러파우더 네일', img: 'https://picsum.photos/300/400?random=3' }
            ].map(item => (
              <button key={item.id} type="button" className="flex w-[45%] shrink-0 snap-start flex-col bg-transparent p-0 text-left">
                <img src={item.img} alt={item.name} className="w-full aspect-[3/4] object-cover object-center rounded-2xl shadow-sm" />
                <span className="mt-3 w-full text-center text-sm font-medium text-gray-800 line-clamp-1">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 섹션 2: 포인트 파츠 트렌드 */}
        <section className="mt-12">
          <div className="mb-5 flex w-full items-center justify-between gap-2">
            <h2 className="text-[20px] font-bold tracking-tight text-gray-900">
              포인트 파츠 트렌드
            </h2>
            <button
              type="button"
              onClick={() => navigate('/client/parts')}
              className="text-sm font-medium text-gray-500 cursor-pointer"
            >
              전체보기 {'>'}
            </button>
          </div>
          <div className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4 [&::-webkit-scrollbar]:hidden">
            {[
              { id: 1, name: '스톤/큐빅 네일', img: 'https://picsum.photos/300/400?random=4' },
              { id: 2, name: '리본 네일', img: 'https://picsum.photos/300/400?random=5' },
              { id: 3, name: '진주 네일', img: 'https://picsum.photos/300/400?random=6' },
              { id: 4, name: '메탈/체인 네일', img: 'https://picsum.photos/300/400?random=7' }
            ].map(item => (
              <button key={item.id} type="button" className="flex w-32 shrink-0 snap-start flex-col bg-transparent p-0 text-left">
                <img src={item.img} alt={item.name} className="w-full aspect-[3/4] rounded-2xl object-cover object-center shadow-sm" />
                <p className="font-sans font-medium text-[13px] sm:text-[14px] text-gray-800 tracking-tight text-center mt-2.5">
                  {item.name}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* 섹션 3: 아트 & 패턴 트렌드 */}
        <section className="mt-12">
          <div className="mb-5 flex w-full items-center justify-between gap-2">
            <h2 className="text-[20px] font-bold tracking-tight text-gray-900">
              아트 & 패턴 트렌드
            </h2>
            <button
              type="button"
              onClick={() => navigate('/client/pattern')}
              className="text-sm font-medium text-gray-500 cursor-pointer"
            >
              전체보기 {'>'}
            </button>
          </div>
          <div className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4 [&::-webkit-scrollbar]:hidden">
            {[
              { id: 1, name: '프렌치 네일', img: 'https://picsum.photos/300/400?random=8' },
              { id: 2, name: '마블 네일', img: 'https://picsum.photos/300/400?random=9' },
              { id: 3, name: '그라데이션 네일', img: 'https://picsum.photos/300/400?random=10' }
            ].map(item => (
              <button key={item.id} type="button" className="flex w-[45%] shrink-0 snap-start flex-col bg-transparent p-0 text-left">
                <img src={item.img} alt={item.name} className="w-full aspect-[3/4] object-cover object-center rounded-2xl shadow-sm" />
                <span className="mt-3 w-full text-center text-sm font-medium text-gray-800 line-clamp-1">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 섹션 4: 핫 트렌드 무드 */}
        <section className="mt-8 mb-6 w-full">
          <div className="mb-5 flex w-full items-center justify-between gap-2">
            <h2 className="text-[20px] font-bold tracking-tight text-gray-900">
              핫 트렌드 무드
            </h2>
            <button
              type="button"
              onClick={() => navigate('/client/mood')}
              className="text-sm font-medium text-gray-500 cursor-pointer"
            >
              전체보기 {'>'}
            </button>
          </div>
          <div className="w-full">
            <div className="relative w-full h-[180px] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
              <img src="https://picsum.photos/600/300?random=11" alt="핫 트렌드 무드" className="absolute inset-0 w-full h-full object-cover object-center" />
              <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
                <span className="font-sans font-bold text-[13px] tracking-widest text-white/90 drop-shadow-md mb-1.5">
                  AESTHETIC MOOD
                </span>
                <h3 className="font-sans text-[22px] font-bold text-white drop-shadow-lg mb-4">
                  요즘 가장 핫한 네일 무드
                </h3>
                <div className="px-5 py-2 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-bold rounded-full shadow-md">
                  View Moodboard
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
