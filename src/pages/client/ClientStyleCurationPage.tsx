import { ChevronLeft, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/** V1 `NailOverlayTitle` 히어로 제목 — `ClientPage`와 동일 */
const NAIL_HERO_BANNER_TITLE_CLASS =
  'text-white font-sans font-bold text-[18px] sm:text-[20px] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'

const STYLE_HERO_BANNER_FRAME =
  'relative mb-0 aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-lg'

type StyleCurationTab = {
  id: string
  label: string
  nameEn: string
}

const STYLE_TABS: StyleCurationTab[] = [
  { id: 'all', label: '전체', nameEn: 'All' },
  { id: 'simple', label: '✨ 심플', nameEn: '✨ Simple' },
  { id: 'glam', label: '💎 화려한', nameEn: '💎 Glam' },
  { id: 'trendy', label: '💅 트렌디', nameEn: '💅 Trendy' },
  { id: 'chic', label: '🌙 시크', nameEn: '🌙 Chic' },
  { id: 'romantic', label: '🌸 로맨틱', nameEn: '🌸 Romantic' },
  { id: 'casual', label: '☕ 캐주얼', nameEn: '☕ Casual' },
]

/** V1 `OccasionNailThumb` — `ClientPage`와 동일 퍼블리싱 */
function StyleNailThumbShell({
  caption,
  variant,
  onActivate,
}: {
  caption: string
  variant: 'carousel' | 'grid'
  onActivate: () => void
}) {
  const FRAME =
    'aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5'
  const CAPTION =
    'w-full min-w-0 truncate text-center text-sm font-medium tracking-tight text-gray-800'
  const CAPTION_GAP = 'mt-2'

  const outerClass =
    variant === 'carousel'
      ? 'w-32 flex-shrink-0 cursor-pointer'
      : 'flex cursor-pointer flex-col gap-0'

  const frameExtra =
    variant === 'carousel' ? 'bg-muted shadow-sm' : 'shadow-sm'

  return (
    <div
      className={outerClass}
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onActivate()
        }
      }}
    >
      <div className={`${FRAME} ${frameExtra}`}>
        <div className="h-full w-full animate-pulse bg-gray-100" aria-hidden />
      </div>
      <div
        className={`${CAPTION_GAP} flex w-full min-w-0 flex-col items-center justify-center`}
      >
        <span className={CAPTION}>{caption}</span>
      </div>
    </div>
  )
}

/**
 * V1 스타일 큐레이션 서브 홈 UI (`/client/style-curation`).
 * 데이터·필터·목록 API 미연결 — 플레이스홀더만.
 */
export default function ClientStyleCurationPage() {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const tabContainerRef = useRef<HTMLDivElement | null>(null)

  const isEnglish = false
  const viewAllLabel = isEnglish ? 'View All >' : '전체보기 >'

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!tabContainerRef.current) return
      const activeElement = tabContainerRef.current.querySelector(
        '[data-active-tab="true"]',
      )
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        })
      }
    }, 150)
    return () => window.clearTimeout(timer)
  }, [active])

  const tabIndex =
    active >= 0 && active < STYLE_TABS.length ? active : 0
  const activeTabDef = STYLE_TABS[tabIndex]!

  const stubGallery = () => navigate('/client/gallery')

  const bestStyleCaptions = ['✨ 심플', '💎 화려한', '💅 트렌디', '🌸 로맨틱']

  return (
    <div className="relative mx-auto max-w-md bg-white pb-24">
      <header className="sticky top-0 z-[100] flex h-14 w-full shrink-0 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="relative flex h-full w-full min-w-0 items-center justify-between px-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={isEnglish ? 'Go back' : '뒤로 가기'}
            className="-ml-2 shrink-0 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-6 w-6 text-gray-900" strokeWidth={2} />
          </button>

          <h1 className="pointer-events-none absolute left-1/2 max-w-[min(100%-5rem,18rem)] -translate-x-1/2 truncate text-center text-lg font-bold tracking-tight text-gray-900">
            {isEnglish
              ? 'Style Perfect, Nails by Vibe'
              : '취향 저격, 스타일별 네일'}
          </h1>

          <Link
            to="/client/gallery"
            className="-mr-2 shrink-0 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
            aria-label={isEnglish ? 'Search' : '검색'}
          >
            <Search className="h-6 w-6 text-gray-900" strokeWidth={2} />
          </Link>
        </div>
      </header>

      <main className="px-0">
        <div className="mb-5 mt-6 flex items-end justify-between px-4">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            {isEnglish ? 'Browse by Style' : '스타일별 모아보기'}
          </h2>
          <Link
            to="/client/style-list"
            className="cursor-pointer text-sm font-medium text-gray-500"
          >
            {viewAllLabel}
          </Link>
        </div>

        <nav
          ref={tabContainerRef}
          className="flex w-full flex-nowrap gap-2 overflow-x-auto whitespace-nowrap border-b border-gray-100 px-4 pb-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {STYLE_TABS.map((tab, idx) => {
            const isActive = active === idx
            return (
              <button
                key={tab.id}
                type="button"
                data-active-tab={isActive ? 'true' : 'false'}
                onClick={() => setActive(idx)}
                className={`shrink-0 px-2 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-b-2 border-gray-900 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label={`${isEnglish ? tab.nameEn : tab.label} ${isEnglish ? 'tab' : '탭'}`}
              >
                {isEnglish ? tab.nameEn : tab.label}
              </button>
            )
          })}
          <div className="w-10 shrink-0" aria-hidden="true" />
        </nav>

        <section className="mb-0 mt-5 px-4" aria-label="스타일 히어로">
          <div
            className={`${STYLE_HERO_BANNER_FRAME} cursor-pointer`}
            onClick={stubGallery}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                stubGallery()
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="absolute inset-0">
              <div
                className="h-full w-full animate-pulse bg-gray-200"
                aria-hidden
              />
            </div>
            <div className="absolute inset-x-5 bottom-5 z-10">
              <div className="relative z-10">
                <h2
                  className={`${NAIL_HERO_BANNER_TITLE_CLASS} truncate leading-tight`}
                >
                  {isEnglish
                    ? `Style preview — ${activeTabDef.nameEn}`
                    : `스타일 미리보기 — ${activeTabDef.label}`}
                </h2>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-0">
          <div className="mb-5 mt-12 flex items-center justify-between px-4">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              {isEnglish
                ? 'Most Searched Styles BEST ✨'
                : '가장 많이 찾은 스타일 BEST ✨'}
            </h2>
            <Link
              to="/client/style-best-list"
              className="cursor-pointer text-sm font-medium text-gray-500"
            >
              {viewAllLabel}
            </Link>
          </div>

          <section className="mb-0 overflow-x-auto px-4 pb-0 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="mb-0 flex items-center gap-4 pb-0">
              {bestStyleCaptions.map((cap) => (
                <StyleNailThumbShell
                  key={cap}
                  variant="carousel"
                  caption={cap}
                  onActivate={stubGallery}
                />
              ))}
            </div>
          </section>
        </div>

        <section className="mb-0">
          <div className="mb-5 mt-12 flex items-center justify-between px-4">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              {isEnglish ? 'Style Nail Gallery' : '스타일별 네일 갤러리'}
            </h2>
            <Link
              to="/client/style-gallery-list"
              className="cursor-pointer text-sm font-medium text-gray-500"
            >
              {viewAllLabel}
            </Link>
          </div>

          <div className="mb-0 grid grid-cols-2 gap-4 px-4 pb-0">
            {[0, 1, 2, 3].map((i) => (
              <StyleNailThumbShell
                key={i}
                variant="grid"
                caption={
                  isEnglish ? `Style gallery ${i + 1}` : `스타일 갤러리 ${i + 1}`
                }
                onActivate={stubGallery}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
