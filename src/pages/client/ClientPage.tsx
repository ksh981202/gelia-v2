import { ChevronLeft, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

/** V1 `NailOverlayTitle` 히어로 제목 */
const NAIL_HERO_BANNER_TITLE_CLASS =
  'text-white font-sans font-bold text-[18px] sm:text-[20px] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'

const OCCASION_HERO_BANNER_FRAME =
  'relative mb-0 aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-lg'

type OccasionThemeTab = {
  id: string
  label: string
  nameEn: string
  filterKeywords: string[]
}

const THEME_TABS: OccasionThemeTab[] = [
  { id: 'all', label: '전체', nameEn: 'All', filterKeywords: ['전체'] },
  {
    id: 'daily',
    label: '🌿 데일리',
    nameEn: '🌿 Daily',
    filterKeywords: ['데일리', 'daily'],
  },
  {
    id: 'wedding',
    label: '💍 웨딩',
    nameEn: '💍 Wedding',
    filterKeywords: ['웨딩'],
  },
  {
    id: 'date',
    label: '💖 데이트',
    nameEn: '💖 Date',
    filterKeywords: ['데이트'],
  },
  {
    id: 'office',
    label: '💼 오피스',
    nameEn: '💼 Office',
    filterKeywords: ['오피스', '면접'],
  },
  {
    id: 'travel',
    label: '✈️ 여행',
    nameEn: '✈️ Travel',
    filterKeywords: ['여행', '트립', '바캉스'],
  },
  {
    id: 'party',
    label: '🎉 파티',
    nameEn: '🎉 Party',
    filterKeywords: ['파티'],
  },
]

function extractPureThemeKeyword(raw: string): string {
  return String(raw ?? '')
    .replace(/[^\u3131-\u318E\uAC00-\uD7A3a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** V1 `OccasionNailThumb` — 퍼블리싱만 (이미지 영역은 플레이스홀더) */
function OccasionNailThumbShell({
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

  const frameExtra = variant === 'carousel' ? 'bg-muted shadow-sm' : 'shadow-sm'

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
 * V1 `OccasionPage.tsx` UI 이식 — `/client/theme`.
 * 데이터·필터·목록 API는 연결하지 않음(플레이스홀더). 전체보기/검색은 갤러리 스텁.
 */
export default function ClientPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [active, setActive] = useState<number | null>(0)
  const tabContainerRef = useRef<HTMLDivElement | null>(null)

  const isEnglish = false
  const viewAllLabel = isEnglish ? 'View All >' : '전체보기 >'

  useEffect(() => {
    const rawTheme = searchParams.get('theme')?.trim()
    if (rawTheme) {
      const pureTheme = extractPureThemeKeyword(rawTheme)
      const byTheme = THEME_TABS.findIndex(
        (tab) =>
          tab.label === pureTheme ||
          tab.filterKeywords.includes(rawTheme) ||
          tab.filterKeywords.includes(pureTheme),
      )
      if (byTheme >= 0) {
        setActive(byTheme)
        return
      }
    }

    const rawTab = searchParams.get('tab')?.trim()
    if (rawTab) {
      const pureTab = extractPureThemeKeyword(rawTab)
      const byTab = THEME_TABS.findIndex(
        (tab) =>
          tab.label === pureTab ||
          tab.id === rawTab ||
          tab.filterKeywords.includes(rawTab) ||
          tab.filterKeywords.includes(pureTab),
      )
      if (byTab >= 0) {
        setActive(byTab)
        return
      }
    }

    if (!rawTab) {
      setActive(0)
      return
    }

    setActive(0)
  }, [searchParams])

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
  })

  const tabIndex =
    active !== null && active >= 0 && active < THEME_TABS.length ? active : 0
  const activeTabDef = THEME_TABS[tabIndex]!

  const stubGallery = () => navigate('/client/gallery')

  const situationDemoCaptions = ['🌿 데일리', '✈️ 여행', '🎉 파티']

  return (
    <div className="relative mx-auto max-w-md bg-white pb-24">
      <header className="sticky top-0 z-50 relative flex h-14 w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white/95 px-5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={isEnglish ? 'Go back' : '뒤로 가기'}
          className="-ml-2 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </button>

        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-lg font-bold tracking-tight text-gray-900">
          {isEnglish
            ? 'Shining Moments, Custom Nails'
            : '빛나는 순간, 맞춤 네일'}
        </h1>

        <button
          type="button"
          aria-label={isEnglish ? 'Search' : '검색'}
          className="-mr-2 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
          onClick={stubGallery}
        >
          <Search className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </button>
      </header>

      <main className="px-0">
        <div className="mb-5 mt-6 flex items-end justify-between px-4">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            {isEnglish ? 'View by Theme' : '테마별 모아보기'}
          </h2>
          <Link
            to="/client/theme-list"
            className="cursor-pointer text-sm font-medium text-gray-500"
          >
            {viewAllLabel}
          </Link>
        </div>

        <nav
          ref={tabContainerRef}
          className="flex w-full flex-nowrap gap-2 overflow-x-auto whitespace-nowrap border-b border-gray-100 px-4 pb-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {THEME_TABS.map((tab, idx) => {
            const isActive = active === idx
            return (
              <button
                key={tab.label}
                type="button"
                data-active-tab={isActive ? 'true' : 'false'}
                onClick={() => {
                  setActive(idx)
                  setSearchParams(
                    (prev) => {
                      const next = new URLSearchParams(prev)
                      const tabValue = tab.label
                      next.set('tab', tabValue)
                      next.delete('theme')
                      return next
                    },
                    { replace: true },
                  )
                }}
                className={`shrink-0 px-2 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-b-2 border-gray-900 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label={`${isEnglish && tab.nameEn ? tab.nameEn : tab.label} ${isEnglish ? 'tab' : '탭'}`}
              >
                {isEnglish && tab.nameEn ? tab.nameEn : tab.label}
              </button>
            )
          })}
          <div className="w-10 shrink-0" aria-hidden="true" />
        </nav>

        <section className="mb-0 mt-5 px-4" aria-label="테마 히어로">
          <div
            className={`${OCCASION_HERO_BANNER_FRAME} cursor-pointer`}
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
                    ? `Theme preview — ${activeTabDef.nameEn}`
                    : `테마 미리보기 — ${extractPureThemeKeyword(activeTabDef.label)}`}
                </h2>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-0">
          <div className="mb-5 mt-12 flex items-center justify-between px-4">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              {isEnglish ? 'Recommended by Occasion' : '상황별 추천 네일'}
            </h2>
            <Link
              to="/client/situation-list"
              className="cursor-pointer text-sm font-medium text-gray-500"
            >
              {viewAllLabel}
            </Link>
          </div>

          <section className="mb-0 overflow-x-auto px-4 pb-0 scrollbar-hide">
            <div className="mb-0 flex items-center gap-4 pb-0">
              {situationDemoCaptions.map((cap) => (
                <OccasionNailThumbShell
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
              {isEnglish ? 'Explore Gallery' : '갤러리 탐색'}
            </h2>
            <Link
              to="/client/gallery-explore-list"
              className="cursor-pointer text-sm font-medium text-gray-500"
            >
              {viewAllLabel}
            </Link>
          </div>

          <div className="mb-0 grid grid-cols-2 gap-4 px-4 pb-0">
            {[0, 1, 2, 3].map((i) => (
              <OccasionNailThumbShell
                key={i}
                variant="grid"
                caption={isEnglish ? `Gallery ${i + 1}` : `갤러리 ${i + 1}`}
                onActivate={stubGallery}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
