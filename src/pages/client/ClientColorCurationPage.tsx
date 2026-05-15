import { ChevronLeft, Search } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  COLOR_CURATION_TABS,
  COLOR_HERO_CAPTIONS,
  DEFAULT_COLOR_CURATION,
  resolveColorCurationIndex,
} from './colorCurationTabs'

const H_SCROLLBAR_HIDE =
  "scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"

const img = (w: number, h: number) => `https://placehold.co/${w}x${h}/e8e8e8/666666?text=+`

const THEME_SCROLL_ITEMS = [
  { id: 1, label: '벚꽃 핑크 그라데이션' },
  { id: 2, label: '피치 코랄 프렌치' },
  { id: 3, label: '로맨틱 플라워 아트' },
  { id: 4, label: '파스텔 핑크 글리터' },
] as const

const POPULAR_GRID_ITEMS = [
  { id: 1, label: '인기 핑크 네일' },
  { id: 2, label: '트렌드 누드 베이지' },
  { id: 3, label: '화이트 프렌치' },
  { id: 4, label: '레드 포인트' },
] as const

function HorizontalPreviewSection({
  title,
  viewAllTo,
  items,
  ariaLabel,
}: {
  title: string
  viewAllTo: string
  items: readonly { id: number; label: string }[]
  ariaLabel: string
}) {
  const viewAllLabel = '전체보기 >'

  return (
    <section className="mb-0 mt-12" aria-label={ariaLabel}>
      <div className="mb-4 flex items-center justify-between px-4">
        <h2 className="text-lg font-bold tracking-tight text-gray-900">{title}</h2>
        <Link to={viewAllTo} className="text-sm text-gray-500">
          {viewAllLabel}
        </Link>
      </div>
      <div className={`flex gap-3 overflow-x-auto px-4 pb-2 ${H_SCROLLBAR_HIDE}`}>
        {items.map((item) => (
          <div
            key={item.id}
            className="flex w-[120px] flex-shrink-0 flex-col gap-2"
          >
            <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
              <img
                src={img(300, 400)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <p className="truncate text-center text-[13px] text-gray-800">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * V1 `ColorPage.tsx` 큐레이션 서브 홈 — 미리보기·더미만 (리스트는 전체보기 → 별도 페이지).
 */
export default function ClientColorCurationPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabContainerRef = useRef<HTMLElement | null>(null)

  const colorParam = searchParams.get('color')
  const activeIdx = useMemo(
    () => resolveColorCurationIndex(colorParam),
    [colorParam],
  )
  const currentColor =
    COLOR_CURATION_TABS[activeIdx]?.value ?? DEFAULT_COLOR_CURATION
  const heroCaption =
    COLOR_HERO_CAPTIONS[currentColor] ?? COLOR_HERO_CAPTIONS['핑크']

  const colorListHref = `/client/color-list?tab=${encodeURIComponent(currentColor)}`

  const setColorTab = (idx: number) => {
    const next = COLOR_CURATION_TABS[idx]
    if (!next) return
    setSearchParams({ color: next.value }, { replace: true })
  }

  useEffect(() => {
    if (colorParam && resolveColorCurationIndex(colorParam) >= 0) return
    setSearchParams({ color: DEFAULT_COLOR_CURATION }, { replace: true })
  }, [colorParam, setSearchParams])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const el = tabContainerRef.current?.querySelector(
        '[data-active-tab="true"]',
      )
      el?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }, 150)
    return () => window.clearTimeout(timer)
  }, [activeIdx])

  const viewAllLabel = '전체보기 >'

  return (
    <div className="relative mx-auto max-w-md bg-[#FDFBF7] pb-24">
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between bg-white/95 px-5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="-ml-2 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </button>

        <h1 className="pointer-events-none absolute left-1/2 max-w-[min(100%-5rem,18rem)] -translate-x-1/2 truncate text-center text-lg font-bold tracking-tight text-gray-900">
          추천 컬러 네일
        </h1>

        <Link
          to="/client/gallery"
          className="-mr-2 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
          aria-label="검색"
        >
          <Search className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </Link>
      </header>

      <main className="px-0">
        <section className="mb-0 mt-6" aria-label="컬러별 모아보기">
          <div className="mb-4 flex items-end justify-between px-4">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              컬러별 모아보기
            </h2>
            <Link to={colorListHref} className="text-sm text-gray-500">
              {viewAllLabel}
            </Link>
          </div>

          <nav
            ref={tabContainerRef}
            className={`mb-4 flex w-full flex-nowrap gap-2 overflow-x-auto border-b border-gray-100 px-4 pb-0 ${H_SCROLLBAR_HIDE}`}
            aria-label="컬러"
          >
            {COLOR_CURATION_TABS.map((tab, idx) => {
              const isActive = idx === activeIdx
              return (
                <button
                  key={tab.value}
                  type="button"
                  data-active-tab={isActive ? 'true' : 'false'}
                  onClick={() => setColorTab(idx)}
                  className="group relative flex shrink-0 flex-col items-center justify-center px-1 pb-2"
                >
                  <span
                    className={`whitespace-nowrap text-[14px] ${
                      isActive
                        ? 'font-bold text-gray-900'
                        : 'font-medium text-gray-500'
                    }`}
                  >
                    {tab.label}
                  </span>
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-[2px] ${
                      isActive ? 'bg-black' : 'bg-transparent'
                    }`}
                  />
                </button>
              )
            })}
            <div className="w-10 shrink-0" aria-hidden="true" />
          </nav>

          <div className="relative mx-4 aspect-[3/4] w-[calc(100%-2rem)] overflow-hidden rounded-2xl bg-gray-100 shadow-xl sm:aspect-[4/5]">
            <img
              src={img(600, 800)}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="truncate text-lg font-bold text-white drop-shadow-md md:text-xl">
                {heroCaption}
              </p>
            </div>
          </div>
        </section>

        <HorizontalPreviewSection
          title="올봄을 강타한, 벚꽃 핑크 & 피치"
          viewAllTo="/client/color-theme-list"
          items={THEME_SCROLL_ITEMS}
          ariaLabel="특정 테마 추천"
        />

        <section
          className="mb-0 mt-12 px-4"
          aria-label="실시간 인기 컬러 네일"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              실시간 인기 컬러 네일
            </h2>
            <Link to="/client/color-popular-list" className="text-sm text-gray-500">
              {viewAllLabel}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {POPULAR_GRID_ITEMS.map((item) => (
              <div key={item.id} className="flex flex-col gap-2">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={img(400, 500)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="truncate text-center text-sm text-gray-800">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
