import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";

const colorNailChips = [
  { label: "핑크", src: "/color/color-pink.png" },
  { label: "레드", src: "/color/color-red.png" },
  { label: "누드", src: "/color/color-nude.png" },
  { label: "파스텔", src: "/color/color-pastel.png" },
  { label: "블루", src: "/color/color-blue.png" },
  { label: "화이트", src: "/color/color-white.png" },
  { label: "블랙", src: "/color/color-black.png" },
  { label: "글리터", src: "/color/color-glitter.png" },
];

const seasonItems = [
  { label: "봄", bgColor: "bg-red-50", imageSrc: "/season/ic-season-spring.png" },
  { label: "여름", bgColor: "bg-blue-50", imageSrc: "/season/ic-season-summer.png" },
  { label: "가을", bgColor: "bg-orange-50", imageSrc: "/season/ic-season-autumn.png" },
  { label: "겨울", bgColor: "bg-slate-50", imageSrc: "/season/ic-season-winter.png" },
];

const CUSTOM_THEME_PILLS = ["🌿 데일리", "💍 웨딩", "💖 데이트", "💼 오피스", "✈️ 여행", "🎉 파티"];

const DUMMY_IMG = "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=400&q=80";

const styleItems = [
  { label: "심플 네일", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80" },
  { label: "화려한 네일", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&q=80" },
  { label: "프렌치 네일", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?w=400&q=80" },
  { label: "드로잉 네일", image: "https://images.unsplash.com/photo-1516975080661-460ce4178550?w=400&q=80" },
];

const patternTrends = [
  { title: "마블 네일", image: DUMMY_IMG },
  { title: "그라데이션 네일", image: DUMMY_IMG },
  { title: "체크 네일", image: DUMMY_IMG },
  { title: "트위드 네일", image: DUMMY_IMG },
];

const textureTrends = [
  { title: "시럽 네일", image: DUMMY_IMG },
  { title: "마그넷 네일", image: DUMMY_IMG },
];

const partTrends = [
  { title: "스톤/큐빅 네일", image: DUMMY_IMG },
  { title: "리본 네일", image: DUMMY_IMG },
  { title: "진주 네일", image: DUMMY_IMG },
];

export default function CategoryPage() {
  const navigate = useNavigate();

  const goColorCuration = () => navigate("/client/color-curation");

  const goSeasonCuration = () => navigate("/client/season-curation");

  const goStyleCuration = () => navigate("/client/style-curation");

  const goTheme = () => navigate("/client/theme");

  const goPattern = () => navigate("/client/pattern");
  const goTexture = () => navigate("/client/texture");
  const goParts = () => navigate("/client/parts");

  return (
    <div className="relative mx-auto min-h-screen max-w-md bg-white pb-24 text-[#1A1A1A] antialiased">
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-gray-50 bg-white px-5">
        <button type="button" onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 rounded-full">
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 top-1/2 max-w-[60%] -translate-x-1/2 -translate-y-1/2 truncate text-center text-lg font-bold text-gray-900 whitespace-nowrap">
          카테고리 탐색
        </h1>
        <button type="button" onClick={() => navigate("/client/gallery")} className="p-2 -mr-2 text-gray-900 rounded-full">
          <Search className="h-6 w-6" strokeWidth={2} />
        </button>
      </header>

      <main className="bg-white px-5 pt-4 flex flex-col gap-12">
        <section>
          <div className="mb-4 flex w-full items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">컬러 네일</h2>
            <button type="button" onClick={goColorCuration} className="text-sm font-medium text-gray-500 cursor-pointer">
              전체보기 {">"}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {colorNailChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={goColorCuration}
                className="flex cursor-pointer flex-col items-center rounded-xl border-0 bg-transparent p-0"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 relative mx-auto flex items-center justify-center rounded-full bg-gray-50 shadow-sm overflow-hidden">
                  <img src={chip.src} alt={chip.label} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
                <span className="mt-2 w-full text-center font-sans tracking-tight font-medium text-[13px] text-gray-700">
                  {chip.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex w-full items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">계절별 맞춤 네일</h2>
            <button type="button" onClick={goSeasonCuration} className="text-sm font-medium text-gray-500 cursor-pointer">
              전체보기 {">"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {seasonItems.map((season) => (
              <button
                key={season.label}
                type="button"
                onClick={goSeasonCuration}
                className={`${season.bgColor} border border-gray-100 rounded-2xl py-5 px-4 flex flex-col items-center justify-center gap-3 cursor-pointer`}
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/50 shadow-sm">
                  <img
                    src={season.imageSrc}
                    alt={season.label}
                    className="h-20 w-20 scale-110 object-contain"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
                <span className="font-medium text-[14px] text-gray-800">{season.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex w-full items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">취향 저격, 스타일별 네일</h2>
            <button type="button" onClick={goStyleCuration} className="text-sm font-medium text-gray-500 cursor-pointer">
              전체보기 {">"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {styleItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={goStyleCuration}
                className="flex flex-col cursor-pointer border-0 bg-transparent p-0 text-left"
              >
                <img src={item.image} alt={item.label} className="w-full aspect-[4/5] object-cover object-center rounded-2xl shadow-sm" />
                <span className="mt-3 text-center text-sm font-medium text-gray-800">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex w-full items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">빛나는 순간, 맞춤 네일</h2>
            <button type="button" onClick={goTheme} className="text-sm font-medium text-gray-500 cursor-pointer">
              전체보기 {">"}
            </button>
          </div>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {CUSTOM_THEME_PILLS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={goTheme}
                className="flex-none px-5 py-2.5 bg-white rounded-full border border-stone-200 text-sm font-semibold shadow-sm hover:border-[#FF7F50]"
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex w-full items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">아트 & 패턴 트렌드</h2>
            <button type="button" onClick={goPattern} className="text-sm font-medium text-gray-500 cursor-pointer">
              전체보기 {">"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {patternTrends.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={goPattern}
                className="flex flex-col cursor-pointer text-left border-0 bg-transparent p-0"
              >
                <img src={item.image} alt={item.title} className="w-full aspect-[4/5] object-cover rounded-2xl shadow-sm" />
                <span className="mt-3 text-center text-sm font-medium text-gray-800">{item.title}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex w-full items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">텍스처 트렌드</h2>
            <button type="button" onClick={goTexture} className="text-sm font-medium text-gray-500 cursor-pointer">
              전체보기 {">"}
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {textureTrends.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={goTexture}
                className="flex w-[45%] flex-shrink-0 cursor-pointer flex-col border-0 bg-transparent p-0 text-left"
              >
                <img src={item.image} alt={item.title} className="w-full aspect-[4/5] object-cover rounded-2xl shadow-sm" />
                <span className="mt-3 text-center text-sm font-medium text-gray-800">{item.title}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex w-full items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">포인트 파츠 네일</h2>
            <button type="button" onClick={goParts} className="text-sm font-medium text-gray-500 cursor-pointer">
              전체보기 {">"}
            </button>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory space-x-4 pb-4 px-4 -mx-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {partTrends.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={goParts}
                className="flex w-32 shrink-0 snap-start flex-col text-left cursor-pointer border-0 bg-transparent p-0"
              >
                <img src={item.image} alt={item.title} className="w-full aspect-[4/5] object-cover rounded-2xl shadow-sm" />
                <span className="mt-2.5 text-center text-[13px] font-medium text-gray-800">{item.title}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
