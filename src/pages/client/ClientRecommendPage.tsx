import { ChevronLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/** V1 `NailOverlayTitle` — 히어로 배너 제목 */
const NAIL_HERO_BANNER_TITLE_CLASS =
  'text-white font-sans font-bold text-[18px] sm:text-[20px] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'

function publicAssetUrl(rootRelative: string): string {
  const path = rootRelative.replace(/^\//, '')
  const base = import.meta.env.BASE_URL || '/'
  if (base === '/') return `/${path}`
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base
  return `${prefix}/${path}`
}

/** V1 `formatTodayPickBadgeLabel` */
function formatTodayPickBadgeLabel(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `TODAY. ${m}.${day}`
}

const categories = [
  {
    label: '봄 네일',
    nameEn: 'Spring Nails',
    bgColor: 'bg-red-50',
    imageSrc: '/seasoncategory/ic-season-spring.png',
    imageAlt: '봄 네일',
    imageAltEn: 'Spring nails',
  },
  {
    label: '여름 네일',
    nameEn: 'Summer Nails',
    bgColor: 'bg-blue-50',
    imageSrc: '/seasoncategory/ic-season-summer.png',
    imageAlt: '여름 네일',
    imageAltEn: 'Summer nails',
  },
  {
    label: '가을 네일',
    nameEn: 'Autumn Nails',
    bgColor: 'bg-orange-50',
    imageSrc: '/seasoncategory/ic-season-autumn.png',
    imageAlt: '가을 네일',
    imageAltEn: 'Autumn nails',
  },
  {
    label: '겨울 네일',
    nameEn: 'Winter Nails',
    bgColor: 'bg-slate-50',
    cardBorderClass: 'border-gray-100',
    imageSrc: '/seasoncategory/ic-season-winter.png',
    imageAlt: '겨울 네일',
    imageAltEn: 'Winter nails',
  },
]

const colorChips = [
  { label: '핑크', nameEn: 'Pink', dotClassName: 'bg-pink-400' },
  { label: '레드', nameEn: 'Red', dotClassName: 'bg-red-700' },
  { label: '누드', nameEn: 'Nude', dotClassName: 'bg-[#D2B48C]' },
  { label: '파스텔', nameEn: 'Pastel', dotClassName: 'bg-purple-300' },
  { label: '블루', nameEn: 'Blue', dotClassName: 'bg-blue-500' },
  {
    label: '화이트',
    nameEn: 'White',
    dotClassName: 'bg-white border border-gray-200',
  },
  { label: '블랙', nameEn: 'Black', dotClassName: 'bg-black' },
  { label: '글리터', nameEn: 'Glitter', dotClassName: 'bg-gray-300' },
]

/** V1 `OCCASION_HUB_CARDS` — UI만 (데이터 매칭 제외) */
const OCCASION_HUB_UI = [
  { cardTitle: '데일리 네일', cardTitleEn: 'Daily Nails', tabQueryValue: '데일리' },
  { cardTitle: '웨딩 네일', cardTitleEn: 'Wedding Nails', tabQueryValue: '웨딩' },
  { cardTitle: '데이트 네일', cardTitleEn: 'Date Nails', tabQueryValue: '데이트' },
  { cardTitle: '오피스 네일', cardTitleEn: 'Office Nails', tabQueryValue: '오피스' },
  { cardTitle: '여행 네일', cardTitleEn: 'Travel Nails', tabQueryValue: '여행' },
  { cardTitle: '파티 네일', cardTitleEn: 'Party Nails', tabQueryValue: '파티' },
] as const

/** V1 `STYLE_HUB_CARDS` — UI만 */
const STYLE_HUB_UI = [
  { cardTitle: '심플 네일', cardTitleEn: 'Simple Nails', tabIndex: 1 },
  { cardTitle: '화려한 네일', cardTitleEn: 'Glamorous Nails', tabIndex: 2 },
  { cardTitle: '프렌치 네일', cardTitleEn: 'French Nails', tabIndex: 3 },
  { cardTitle: '드로잉 네일', cardTitleEn: 'Drawing Nails', tabIndex: 4 },
  { cardTitle: '그라데이션 네일', cardTitleEn: 'Gradient Nails', tabIndex: 5 },
] as const

/**
 * V1 `RecommendPage.tsx` UI 이식 (framer-motion → active 스케일).
 * 썸네일·전체보기 네비는 추후 V2 라우트에 맞게 연결 가능; 현재는 갤러리 등으로 스텁.
 */
export default function ClientRecommendPage() {
  const navigate = useNavigate()
  const isEnglish = false

  const viewAllLabel = isEnglish ? 'View All' : '전체보기'
  const cardLabel = (name: string, nameEn?: string) =>
    isEnglish && nameEn ? nameEn : name

  const heroCard = {
    tag: formatTodayPickBadgeLabel(),
    title: isEnglish ? "Today's Recommended Nails" : '오늘의 추천 네일',
    image: null as string | null,
  }

  const goGallery = () => navigate('/client/gallery')

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative mx-auto max-w-md">
        <header className="sticky top-0 z-50 relative flex h-14 w-full shrink-0 items-center justify-between border-b border-[#F2E8DA]/40 bg-background px-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="-ml-2 rounded-full p-2 text-gray-900 transition-colors hover:bg-primary/10"
            aria-label={isEnglish ? 'Go back' : '뒤로 가기'}
          >
            <ChevronLeft className="h-6 w-6 text-gray-900" strokeWidth={2} />
          </button>
          <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-lg font-bold text-gray-900">
            {isEnglish ? 'Recommended' : '추천 네일'}
          </h1>
          <button
            type="button"
            className="-mr-2 rounded-full p-2 text-gray-900 transition-colors hover:bg-primary/10"
            aria-label={isEnglish ? 'Search' : '검색'}
            onClick={goGallery}
          >
            <Search className="h-6 w-6 text-gray-900" strokeWidth={2} />
          </button>
        </header>

        <main>
          {/* 빛나는 순간, 맞춤 네일 */}
          <section className="pt-6">
            <div className="mb-5 flex items-center justify-between px-4">
              <h2
                className="cursor-pointer text-[20px] font-bold tracking-tight text-gray-900"
                onClick={goGallery}
              >
                {isEnglish
                  ? 'Shining Moments, Custom Nails'
                  : '빛나는 순간, 맞춤 네일'}
              </h2>
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-gray-500"
                onClick={goGallery}
              >
                {viewAllLabel} {'>'}
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto px-4 pb-1 scrollbar-hide">
              {OCCASION_HUB_UI.map((card) => (
                <div
                  key={card.cardTitle}
                  className="flex w-[45%] flex-shrink-0 cursor-pointer flex-col active:scale-[0.97]"
                  onClick={goGallery}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      goGallery()
                    }
                  }}
                  aria-label={`${cardLabel(card.cardTitle, card.cardTitleEn)} — ${isEnglish ? 'move to custom nail theme page' : '맞춤 네일 테마 페이지로 이동'}`}
                >
                  <div
                    className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-gray-100 shadow-sm"
                    aria-hidden
                  />
                  <span className="mt-3 line-clamp-2 w-full text-center text-sm font-medium text-gray-800">
                    {cardLabel(card.cardTitle, card.cardTitleEn)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 추천 베이직 스타일 */}
          <section className="mt-12">
            <div className="mb-5 flex items-center justify-between px-4">
              <h2
                className="cursor-pointer text-[20px] font-bold tracking-tight text-gray-900"
                onClick={goGallery}
              >
                {isEnglish
                  ? 'Style Perfect, Nails by Vibe'
                  : '취향 저격, 스타일별 네일'}
              </h2>
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-gray-500"
                onClick={goGallery}
              >
                {viewAllLabel} {'>'}
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
              {STYLE_HUB_UI.map((card) => (
                <div
                  key={card.cardTitle}
                  className="flex w-32 flex-shrink-0 cursor-pointer flex-col active:scale-[0.95]"
                  onClick={goGallery}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      goGallery()
                    }
                  }}
                  aria-label={`${cardLabel(card.cardTitle, card.cardTitleEn)} — ${isEnglish ? 'move to style nail page' : '스타일별 네일 페이지로 이동'}`}
                >
                  <div
                    className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-gray-100 shadow-sm"
                    aria-hidden
                  />
                  <p className="mt-3 line-clamp-2 w-full text-center text-sm font-medium tracking-tight text-gray-800">
                    {cardLabel(card.cardTitle, card.cardTitleEn)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 계절별 맞춤 네일 */}
          <section className="mt-12 px-4">
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                className="m-0 cursor-pointer bg-transparent p-0 text-left text-[20px] font-bold tracking-tight text-gray-900"
                onClick={goGallery}
                aria-label="계절별 맞춤 네일 페이지로 이동"
              >
                {isEnglish ? 'Seasonal Custom Nails' : '계절별 맞춤 네일'}
              </button>
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-gray-500"
                onClick={goGallery}
              >
                {viewAllLabel} {'>'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((season) => (
                <button
                  key={season.label}
                  type="button"
                  className={`${season.bgColor} ${season.cardBorderClass ?? 'border-primary/5'} flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border px-4 py-5 active:scale-[0.95]`}
                  onClick={goGallery}
                >
                  <img
                    src={publicAssetUrl(season.imageSrc)}
                    alt={isEnglish ? season.imageAltEn : season.imageAlt}
                    className="h-20 w-20 object-contain"
                  />
                  <span className="text-[14px] font-medium text-gray-800">
                    {isEnglish ? season.nameEn : season.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 추천 컬러 네일 */}
          <section className="mt-12">
            <div className="mb-5 flex items-center justify-between px-4">
              <h2
                className="cursor-pointer text-[20px] font-bold tracking-tight text-gray-900"
                onClick={goGallery}
              >
                {isEnglish ? 'Recommended Colors' : '추천 컬러 네일'}
              </h2>
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-gray-500"
                onClick={goGallery}
              >
                {viewAllLabel} {'>'}
              </button>
            </div>
            <div className="scrollbar-hide flex gap-4 overflow-x-auto px-4">
              {colorChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className="flex flex-shrink-0 cursor-pointer items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-4 py-2 shadow-sm active:scale-[0.95]"
                  onClick={() =>
                    navigate('/client/gallery', {
                      state: {
                        selectedColor: chip.label,
                        from: 'recommend-color-chip',
                      },
                    })
                  }
                >
                  <span className={`h-3 w-3 rounded-full ${chip.dotClassName}`} />
                  <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                    {isEnglish && chip.nameEn ? chip.nameEn : chip.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 오늘의 특별한 네일 */}
          <section className="mb-0 mt-12 px-4">
            <div className="mb-5 flex items-center justify-between">
              <h2
                className="m-0 cursor-pointer text-[20px] font-bold tracking-tight text-gray-900"
                onClick={goGallery}
              >
                {isEnglish ? "Today's Special Nails" : '오늘의 특별한 네일'}
              </h2>
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-gray-500"
                onClick={goGallery}
              >
                {viewAllLabel} {'>'}
              </button>
            </div>
            <div>
              <div
                className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl shadow-sm active:scale-[0.98]"
                onClick={goGallery}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    goGallery()
                  }
                }}
                aria-label={
                  isEnglish
                    ? "Today's special nails — move to editor pick list"
                    : '오늘의 특별한 네일 — 에디터 픽 목록으로 이동'
                }
              >
                {heroCard.image ? (
                  <img
                    src={heroCard.image}
                    alt={heroCard.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0 animate-pulse bg-gray-100"
                    aria-hidden
                  />
                )}
                <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 z-10 w-full p-5">
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">
                      {heroCard.tag}
                    </span>
                    <h4
                      className={`${NAIL_HERO_BANNER_TITLE_CLASS} line-clamp-2`}
                    >
                      {heroCard.title}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
