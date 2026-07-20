import {
  BarChart2,
  BookOpen,
  CalendarHeart,
  ChevronDown,
  ChevronUp,
  Heart,
  Home,
  Palette,
  Scissors,
  Search,
  Sparkles,
  Trophy,
  Wand2,
  type LucideIcon,
} from 'lucide-react'
import { Suspense, useEffect, useState, type ReactNode } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom'
import { LanguageProvider, useLanguageContext } from '@/contexts/LanguageContext'
import ClientHeaderUtilityIcons from '@/components/client/ClientHeaderUtilityIcons'
import GeliaWordmark from '@/components/client/GeliaWordmark'
import {
  useClientPcFilterStore,
  type ClientPcFilterKey,
} from '@/features/client-home/useClientPcFilterStore'
import {
  PC_SIDEBAR_CATEGORIES,
  PC_SIDEBAR_DEFAULT_OPEN_IDS,
  resolveSidebarLabel,
  type PcSidebarCategoryFilterKey,
  type PcSidebarCategoryId,
  type SidebarFilterItem,
} from '@/features/client-home/clientPcSidebarConfig'
import { useCurrentUserId } from '@/features/my-page/useCurrentUserId'
import { useUserSavedCountQuery } from '@/features/my-page/useUserSavedCountQuery'
import { cn } from '@/lib/utils'
import { ClientRouteSuspenseFallback } from '@/widgets/layout/ClientRouteSuspenseFallback'

const bottomNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'm-0 flex h-full w-full min-w-0 cursor-pointer appearance-none flex-col items-center justify-center gap-0.5 border-0 bg-transparent px-1 pt-1 pb-1.5 [-webkit-tap-highlight-color:transparent]',
    isActive ? 'text-[#FF7E67]' : 'text-gray-400',
  ].join(' ')

const MD_BREAKPOINT_PX = 768

/** md(768px) 이상 여부 — 리사이즈 시 실시간 동기화 */
function useIsMdUp(): boolean {
  const [isMdUp, setIsMdUp] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(`(min-width: ${MD_BREAKPOINT_PX}px)`).matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${MD_BREAKPOINT_PX}px)`)
    const handleChange = (event: MediaQueryListEvent) => setIsMdUp(event.matches)

    setIsMdUp(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isMdUp
}

/** PC 리사이즈 시에도 유지할 경로 (PC 사이드바·전용 뷰 보유) */
function isPcResizeSafeRoute(pathname: string): boolean {
  if (pathname === '/') return true
  if (pathname === '/search') return true
  if (pathname === '/magazine' || pathname.startsWith('/magazine/')) return true
  if (pathname === '/my' || pathname.startsWith('/my/')) return true
  if (pathname.startsWith('/collection/')) return true
  if (pathname.startsWith('/detail/')) return true
  if (pathname.startsWith('/test-')) return true
  if (
    pathname === '/login' ||
    pathname === '/account' ||
    pathname === '/terms' ||
    pathname === '/privacy' ||
    pathname === '/support' ||
    pathname === '/faq' ||
    pathname === '/notice' ||
    pathname === '/notifications' ||
    pathname === '/notification-list' ||
    pathname === '/update-password'
  ) {
    return true
  }
  return false
}

/** PC 사이드바에 없는 모바일 전용·하단 탭 랜딩 경로 */
function isMobileOnlyRoute(pathname: string): boolean {
  if (isPcResizeSafeRoute(pathname)) return false

  const mobileOnlyExact = new Set([
    '/trend',
    '/popular-design',
    '/period-best-list',
    '/reaction-best-list',
    '/shape-best-list',
    '/search-trend-list',
    '/texture',
    '/parts',
    '/pattern',
    '/mood',
    '/art',
    '/ranking',
    '/gallery',
    '/recommend',
    '/category',
    '/today-special',
    '/color-curation',
    '/style-curation',
    '/season-curation',
    '/theme',
  ])

  if (mobileOnlyExact.has(pathname)) return true

  const mobileOnlyPrefixes = [
    '/color-',
    '/style-',
    '/theme-list',
    '/season-',
    '/situation-',
    '/vacation-',
    '/texture-',
    '/parts-',
    '/pattern-',
    '/mood-',
    '/popular-',
    '/stone-',
    '/marble-',
    '/chic-',
    '/full-parts',
    '/syrup-',
  ]

  return mobileOnlyPrefixes.some((prefix) => pathname.startsWith(prefix))
}

function isCollectionNavActive(_match: unknown, location: { pathname: string; search: string }) {
  if (location.pathname.startsWith('/collection/')) return true
  if (location.pathname === '/my/list/saved') return true
  if (location.pathname === '/my') {
    return new URLSearchParams(location.search).get('tab') === 'saved'
  }
  return false
}

const SIDEBAR_ITEM_BASE_CLASS =
  'w-full cursor-pointer py-2 text-left text-[15px] font-medium text-stone-700 transition-colors hover:text-black'

const SIDEBAR_ITEM_ACTIVE_CLASS = 'font-bold text-black'

const SIDEBAR_CATEGORY_TEXT_CLASS = 'text-[16px] font-bold text-stone-900'

const SIDEBAR_CATEGORY_BUTTON_CLASS =
  'flex w-full cursor-pointer items-center justify-between'

const SIDEBAR_CATEGORY_ICONS = {
  ranking: Trophy,
  season: CalendarHeart,
  color: Palette,
  mood: Sparkles,
  shape: Scissors,
  technique: Wand2,
} as const satisfies Record<PcSidebarCategoryId, LucideIcon>

const DEFAULT_OPEN_CATEGORIES: Record<string, boolean> = Object.fromEntries(
  PC_SIDEBAR_CATEGORIES.map((category) => [
    category.id,
    PC_SIDEBAR_DEFAULT_OPEN_IDS.includes(category.id),
  ]),
)

function SidebarAccordionSection({
  label,
  englishTitle,
  icon: Icon,
  isOpen,
  onToggleOpen,
  children,
  showDivider = true,
  isFirst = false,
}: {
  label: string
  englishTitle: string
  icon: LucideIcon
  isOpen: boolean
  onToggleOpen: () => void
  children: ReactNode
  showDivider?: boolean
  isFirst?: boolean
}) {
  const ChevronIcon = isOpen ? ChevronUp : ChevronDown

  return (
    <>
      <section>
        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={isOpen}
          aria-label={`${englishTitle} ${label}`}
          className={[isFirst ? 'mt-4' : 'mt-6', 'mb-4', SIDEBAR_CATEGORY_BUTTON_CLASS].join(' ')}
        >
          <span className="flex items-center gap-2.5">
            <Icon size={20} strokeWidth={2} className="shrink-0 text-stone-400" aria-hidden />
            <span className={SIDEBAR_CATEGORY_TEXT_CLASS}>{label}</span>
          </span>
          <ChevronIcon size={18} strokeWidth={1.5} className="shrink-0 text-stone-400" aria-hidden />
        </button>
        {isOpen ? <div className="mb-2 flex flex-col gap-0.5 pl-8">{children}</div> : null}
      </section>
      {showDivider ? <div className="my-4 border-t border-stone-100" aria-hidden /> : null}
    </>
  )
}

function SidebarFilterItems({
  items,
  selected,
  onSelect,
  isEnglish,
}: {
  items: readonly SidebarFilterItem[]
  selected: string
  onSelect: (value: string) => void
  isEnglish: boolean
}) {
  return (
    <>
      {items.map((item) => {
        const isSelected = selected === item.value
        return (
          <span
            key={item.value}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(item.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              onSelect(item.value)
            }}
            className={[
              SIDEBAR_ITEM_BASE_CLASS,
              isSelected ? SIDEBAR_ITEM_ACTIVE_CLASS : '',
            ].join(' ')}
          >
            {resolveSidebarLabel(item.label, isEnglish)}
          </span>
        )
      })}
    </>
  )
}

function PcSidebarFilters({
  filterValues,
  toggleRankingFilter,
  togglePcFilter,
  isEnglish,
}: {
  filterValues: Record<PcSidebarCategoryFilterKey, string>
  toggleRankingFilter: (option: string) => void
  togglePcFilter: (key: ClientPcFilterKey, option: string) => void
  isEnglish: boolean
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(DEFAULT_OPEN_CATEGORIES)

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }))
  }

  const handleSelect = (filterKey: PcSidebarCategoryFilterKey, value: string) => {
    if (filterKey === 'rankingFilter') {
      toggleRankingFilter(value)
    } else {
      togglePcFilter(filterKey, value)
    }

    if (location.pathname !== '/') {
      navigate('/')
    }

    // 필터 메뉴 클릭 시 화면 맨 위로 강제 이동 (SPA 스크롤 버그 해결)
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <>
      {PC_SIDEBAR_CATEGORIES.map((category, index) => (
        <SidebarAccordionSection
          key={category.id}
          label={resolveSidebarLabel(category.label, isEnglish)}
          englishTitle={category.title}
          icon={SIDEBAR_CATEGORY_ICONS[category.id]}
          isOpen={Boolean(openCategories[category.id])}
          onToggleOpen={() => toggleCategory(category.id)}
          isFirst={index === 0}
          showDivider={index < PC_SIDEBAR_CATEGORIES.length - 1}
        >
          <SidebarFilterItems
            items={category.items}
            selected={filterValues[category.filterKey]}
            onSelect={(value) => handleSelect(category.filterKey, value)}
            isEnglish={isEnglish}
          />
        </SidebarAccordionSection>
      ))}
    </>
  )
}

export default function ClientLayout() {
  return (
    <LanguageProvider>
      <ClientLayoutContent />
    </LanguageProvider>
  )
}

function ClientLayoutContent() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const location = useLocation()
  const navigate = useNavigate()
  const { pathname } = location
  const isMdUp = useIsMdUp()
  const collectionNavActive = isCollectionNavActive(null, location)
  const navigationType = useNavigationType()
  const themeFilter = useClientPcFilterStore((state) => state.themeFilter)
  const colorFilter = useClientPcFilterStore((state) => state.colorFilter)
  const moodFilter = useClientPcFilterStore((state) => state.moodFilter)
  const shapeFilter = useClientPcFilterStore((state) => state.shapeFilter)
  const pointFilter = useClientPcFilterStore((state) => state.pointFilter)
  const rankingFilter = useClientPcFilterStore((state) => state.rankingFilter)
  const togglePcFilter = useClientPcFilterStore((state) => state.toggleFilter)
  const toggleRankingFilter = useClientPcFilterStore((state) => state.toggleRankingFilter)
  const resetPcFilters = useClientPcFilterStore((state) => state.resetFilters)
  const currentUserId = useCurrentUserId()
  const { data: savedCount = 0 } = useUserSavedCountQuery(currentUserId)

  const handleLogoClick = () => {
    resetPcFilters()
  }

  useEffect(() => {
    if (navigationType === 'POP') return
    window.scrollTo(0, 0)
  }, [pathname, navigationType])

  useEffect(() => {
    if (!isMdUp) return
    if (!isMobileOnlyRoute(pathname)) return
    resetPcFilters()
    navigate('/', { replace: true })
  }, [isMdUp, pathname, navigate, resetPcFilters])

  const hideTopHeader =
    pathname.startsWith('/test') ||
    pathname.includes('/detail/') ||
    pathname === '/category' ||
    pathname.startsWith('/gallery') ||
    pathname === '/my' ||
    pathname.startsWith('/my/list') ||
    pathname === '/notifications' ||
    pathname === '/notification-list' ||
    pathname === '/support' ||
    pathname === '/faq' ||
    pathname === '/terms' ||
    pathname === '/privacy' ||
    pathname === '/notice' ||
    pathname === '/account' ||
    pathname === '/recommend' ||
    pathname === '/color-curation' ||
    pathname === '/color-list' ||
    pathname === '/color-theme-list' ||
    pathname === '/color-popular-list' ||
    pathname === '/theme' ||
    pathname === '/season-curation' ||
    pathname === '/season-list' ||
    pathname === '/vacation-list' ||
    pathname === '/season-popular-list' ||
    pathname === '/style-curation' ||
    pathname === '/style-list' ||
    pathname === '/style-best-list' ||
    pathname === '/style-gallery-list' ||
    pathname === '/theme-list' ||
    pathname === '/situation-list' ||
    pathname === '/today-special' ||
    pathname === '/popular-design' ||
    pathname === '/period-best-list' ||
    pathname === '/reaction-best-list' ||
    pathname === '/shape-best-list' ||
    pathname === '/search-trend-list' ||
    pathname === '/trend' ||
    /^(\/(en|jp|vn|th))?\/magazine(\/|$)/.test(pathname) ||
    pathname === '/texture' ||
    pathname === '/texture-list' ||
    pathname === '/syrup-best' ||
    pathname === '/parts' ||
    pathname === '/parts-list' ||
    pathname === '/stone-best-list' ||
    pathname === '/marble-best-list' ||
    pathname === '/popular-art-list' ||
    pathname === '/chic-best-list' ||
    pathname === '/full-parts-list' ||
    pathname === '/art' ||
    pathname === '/pattern' ||
    pathname === '/pattern-list' ||
    pathname === '/mood-list' ||
    pathname === '/popular-mood-list' ||
    pathname === '/mood'

  const hideBottomNav = false

  const mainPbClass = hideBottomNav
    ? 'pb-[env(safe-area-inset-bottom,0px)]'
    : 'pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0'

  return (
    <div className="min-h-[100dvh] bg-background font-sans antialiased text-stone-900">
      <div className="relative mx-auto min-h-[100dvh] w-full max-w-md md:flex md:max-w-[1600px] md:flex-row md:items-start">
        {/* PC 전용 좌측 사이드바 (모바일은 숨김) */}
        <aside className="hidden md:z-50 md:sticky md:top-0 md:flex md:h-screen md:w-[260px] md:shrink-0 md:flex-col md:border-r md:border-stone-200 md:bg-[#FCFAF8] md:shadow-[2px_0_15px_-3px_rgba(0,0,0,0.03)]">
          <div className="p-6 pb-2">
            <GeliaWordmark className="mb-8" onClick={handleLogoClick} />
          </div>

          <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-6 pb-8 pt-1">
            <PcSidebarFilters
              filterValues={{
                rankingFilter,
                themeFilter,
                colorFilter,
                moodFilter,
                shapeFilter,
                pointFilter,
              }}
              toggleRankingFilter={toggleRankingFilter}
              togglePcFilter={togglePcFilter}
              isEnglish={isEnglish}
            />

            <div className="mt-6 mb-2 h-px w-full bg-stone-100" aria-hidden />
            <div className="flex w-full flex-col">
              <Link
                to="/my?tab=saved"
                className="flex items-center justify-between py-3 transition-opacity hover:opacity-80"
              >
                <div className="flex items-center gap-2 text-[16px] font-bold text-stone-900">
                  <Heart className="h-5 w-5 fill-red-500 text-red-500" strokeWidth={2} aria-hidden />
                  <span>{isEnglish ? 'My Collections' : '내 컬렉션 보관함'}</span>
                </div>
                {savedCount > 0 ? (
                  <span className="text-sm font-semibold tabular-nums text-stone-400">({savedCount})</span>
                ) : null}
              </Link>
              <Link
                to="/test-intro"
                className="flex items-center gap-2 py-3 text-[16px] font-bold text-stone-900 transition-colors hover:text-orange-600"
              >
                <span aria-hidden>✨</span>
                <span>{isEnglish ? 'Find Personal Nail' : '퍼스널 네일 찾기'}</span>
              </Link>
              <Link
                to="/magazine"
                className="flex items-center gap-2 py-3 font-['Playfair_Display',_serif] text-[17px] font-bold tracking-widest text-stone-900 transition-colors hover:text-orange-600"
              >
                <span className="font-sans text-[15px]" aria-hidden>📖</span>
                <span>GELIA Magazine</span>
              </Link>
            </div>

            <div className="mt-12 mb-10 w-full">
              <div className="mb-6 w-full break-keep rounded-xl border border-stone-200 bg-stone-50 p-4 text-[13px] leading-relaxed text-stone-500">
                {isEnglish ? (
                  <>
                    All GELIA images are AI designs 😉
                    <br />
                    Use them to find your own style!
                  </>
                ) : (
                  <>
                    GELIA의 모든 이미지는 AI로 만든 디자인이에요 😉
                    <br />
                    나만의 네일 스타일 찾는 데 참고해 보세요!
                  </>
                )}
              </div>
              <div className="mb-3 flex items-center gap-2 text-[13px] text-stone-500">
                <Link to="/terms" className="transition-colors hover:text-stone-800">
                  {isEnglish ? 'Terms of Service' : '이용약관'}
                </Link>
                <span className="text-[10px] text-stone-300">|</span>
                <Link
                  to="/privacy"
                  className="font-bold text-stone-700 transition-colors hover:text-stone-900"
                >
                  {isEnglish ? 'Privacy Policy' : '개인정보처리방침'}
                </Link>
              </div>
              <div className="flex flex-col gap-0.5 break-keep text-[12px] text-stone-400">
                <p className="mb-0.5 font-semibold text-stone-500">
                  {isEnglish ? 'GELIA Studio' : '젤리아 스튜디오 (GELIA Studio)'}
                </p>
                <p>© 2026 GELIA Studio. All rights reserved.</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col w-full">
        {!hideTopHeader && pathname !== '/search' && (
        <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-background/80 px-5 backdrop-blur-xl md:hidden">
          <GeliaWordmark className="md:hidden" onClick={handleLogoClick} />
          <ClientHeaderUtilityIcons className="gap-2" />
        </header>
        )}

        <main className={`flex min-h-0 flex-1 flex-col ${mainPbClass}`}>
          <Suspense fallback={<ClientRouteSuspenseFallback />}>
            <Outlet />
          </Suspense>
        </main>
        </div>

        {!hideBottomNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto grid h-[60px] w-full max-w-md grid-cols-5 border-t border-gray-200 bg-white pb-safe md:hidden"
          aria-label="하단 탭"
        >
          <NavLink
            to="/"
            end
            className={bottomNavLinkClass}
            aria-label={isEnglish ? 'Home tab' : '홈 탭'}
          >
            <Home
              className="h-6 w-6 shrink-0"
              strokeWidth={2.5}
              aria-hidden
            />
            <span className="text-[9px] font-medium leading-none sm:text-[10px]">{isEnglish ? 'Home' : '홈'}</span>
          </NavLink>
          <NavLink
            to="/trend"
            className={bottomNavLinkClass}
            aria-label={isEnglish ? 'Trend tab' : '트렌드 탭'}
          >
            <BarChart2
              className="h-6 w-6 shrink-0"
              strokeWidth={2.5}
              aria-hidden
            />
            <span className="text-[9px] font-medium leading-none sm:text-[10px]">{isEnglish ? 'Trend' : '트렌드'}</span>
          </NavLink>
          <NavLink
            to="/magazine"
            className={bottomNavLinkClass}
            aria-label={isEnglish ? 'Magazine tab' : '매거진 탭'}
          >
            <BookOpen
              className="h-6 w-6 shrink-0"
              strokeWidth={2.5}
              aria-hidden
            />
            <span className="text-[9px] font-medium leading-none sm:text-[10px]">{isEnglish ? 'Magazine' : '매거진'}</span>
          </NavLink>
          <NavLink
            to="/search"
            className={bottomNavLinkClass}
            aria-label={isEnglish ? 'Search tab' : '검색 탭'}
          >
            <Search
              className="h-6 w-6 shrink-0"
              strokeWidth={2.5}
              aria-hidden
            />
            <span className="text-[9px] font-medium leading-none sm:text-[10px]">{isEnglish ? 'Search' : '검색'}</span>
          </NavLink>
          <NavLink
            to="/my?tab=saved"
            className={({ isActive }) =>
              cn(
                'm-0 flex h-full w-full min-w-0 cursor-pointer appearance-none flex-col items-center justify-center gap-0.5 border-0 bg-transparent px-1 pt-1 pb-1.5 [-webkit-tap-highlight-color:transparent]',
                isActive || collectionNavActive ? 'text-[#FF7E67]' : 'text-gray-400',
              )
            }
            aria-label={isEnglish ? 'Collection tab' : '컬렉션 탭'}
          >
            {({ isActive }) => {
              const active = isActive || collectionNavActive
              return (
              <>
                <Heart
                  className={cn('h-6 w-6 shrink-0', active ? 'fill-current' : '')}
                  strokeWidth={2.5}
                  aria-hidden
                />
                <span className="text-[9px] font-medium leading-none sm:text-[10px]">
                  {isEnglish ? 'Collection' : '컬렉션'}
                </span>
              </>
              )
            }}
          </NavLink>
        </nav>
        )}
      </div>
    </div>
  )
}
