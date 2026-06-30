import { BarChart2, BookOpen, ChevronDown, Home, Search, Settings, User } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom'
import { LanguageProvider, useLanguageContext } from '@/contexts/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'
import {
  useClientPcFilterStore,
  type ClientPcFilterKey,
} from '@/features/client-home/useClientPcFilterStore'
import {
  PC_COLOR_SIDEBAR,
  PC_MOOD_SIDEBAR,
  PC_POINT_SIDEBAR,
  PC_SEASON_SIDEBAR,
  PC_SHAPE_SIDEBAR,
  PC_TODAY_TREND_SIDEBAR,
  type SidebarFilterItem,
} from '@/features/client-home/clientPcSidebarConfig'
import { supabase } from '@/shared/api/supabaseClient'

const bottomNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'm-0 flex h-full w-full min-w-0 cursor-pointer appearance-none flex-col items-center justify-center gap-0.5 border-0 bg-transparent px-1 pt-1 pb-1.5 [-webkit-tap-highlight-color:transparent]',
    isActive ? 'text-[#FF7E67]' : 'text-gray-400',
  ].join(' ')

const SIDEBAR_ITEM_BASE_CLASS =
  'w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[13px] font-medium text-stone-600 transition-all hover:bg-stone-100 hover:text-stone-900'

const SIDEBAR_ACCORDION_HEADER_CLASS =
  'flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-3 text-[12px] font-bold uppercase tracking-widest text-stone-800 transition-colors hover:bg-stone-50'

const SIDEBAR_CATEGORY_TITLES = {
  todayTrend: "🔥 Today's Trend",
  color: '🎨 컬러',
  mood: '✨ 무드',
  point: '💎 포인트/기법',
  season: '🌸 시즌/상황',
  shape: '💅 쉐입/길이',
} as const

const DEFAULT_OPEN_CATEGORIES: Record<string, boolean> = {
  [SIDEBAR_CATEGORY_TITLES.todayTrend]: true,
  [SIDEBAR_CATEGORY_TITLES.color]: true,
}

function SidebarAccordionSection({
  title,
  isOpen,
  onToggleOpen,
  children,
}: {
  title: string
  isOpen: boolean
  onToggleOpen: () => void
  children: ReactNode
}) {
  return (
    <section className="mb-1 border-b border-stone-100/80 last:border-b-0">
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        className={SIDEBAR_ACCORDION_HEADER_CLASS}
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          strokeWidth={2.25}
          className={[
            'shrink-0 text-stone-400 transition-transform duration-200',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden
        />
      </button>
      {isOpen ? (
        <div className="mb-4 flex flex-col gap-0.5 pb-2 pl-1">{children}</div>
      ) : null}
    </section>
  )
}

function SidebarFilterItems({
  items,
  selected,
  onSelect,
}: {
  items: readonly SidebarFilterItem[]
  selected: string
  onSelect: (value: string) => void
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
              isSelected ? 'bg-stone-100 font-semibold text-stone-900' : '',
            ].join(' ')}
          >
            {item.label}
          </span>
        )
      })}
    </>
  )
}

function PcSidebarFilters({
  todayTrendFilter,
  colorFilter,
  moodFilter,
  pointFilter,
  themeFilter,
  shapeFilter,
  toggleTodayTrend,
  togglePcFilter,
}: {
  todayTrendFilter: string
  colorFilter: string
  moodFilter: string
  pointFilter: string
  themeFilter: string
  shapeFilter: string
  toggleTodayTrend: (option: string) => void
  togglePcFilter: (key: ClientPcFilterKey, option: string) => void
}) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(DEFAULT_OPEN_CATEGORIES)

  const toggleCategory = (title: string) => {
    setOpenCategories((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <>
      <SidebarAccordionSection
        title={SIDEBAR_CATEGORY_TITLES.todayTrend}
        isOpen={Boolean(openCategories[SIDEBAR_CATEGORY_TITLES.todayTrend])}
        onToggleOpen={() => toggleCategory(SIDEBAR_CATEGORY_TITLES.todayTrend)}
      >
        <SidebarFilterItems
          items={PC_TODAY_TREND_SIDEBAR}
          selected={todayTrendFilter}
          onSelect={toggleTodayTrend}
        />
      </SidebarAccordionSection>
      <SidebarAccordionSection
        title={SIDEBAR_CATEGORY_TITLES.color}
        isOpen={Boolean(openCategories[SIDEBAR_CATEGORY_TITLES.color])}
        onToggleOpen={() => toggleCategory(SIDEBAR_CATEGORY_TITLES.color)}
      >
        <SidebarFilterItems
          items={PC_COLOR_SIDEBAR}
          selected={colorFilter}
          onSelect={(value) => togglePcFilter('colorFilter', value)}
        />
      </SidebarAccordionSection>
      <SidebarAccordionSection
        title={SIDEBAR_CATEGORY_TITLES.mood}
        isOpen={Boolean(openCategories[SIDEBAR_CATEGORY_TITLES.mood])}
        onToggleOpen={() => toggleCategory(SIDEBAR_CATEGORY_TITLES.mood)}
      >
        <SidebarFilterItems
          items={PC_MOOD_SIDEBAR}
          selected={moodFilter}
          onSelect={(value) => togglePcFilter('moodFilter', value)}
        />
      </SidebarAccordionSection>
      <SidebarAccordionSection
        title={SIDEBAR_CATEGORY_TITLES.point}
        isOpen={Boolean(openCategories[SIDEBAR_CATEGORY_TITLES.point])}
        onToggleOpen={() => toggleCategory(SIDEBAR_CATEGORY_TITLES.point)}
      >
        <SidebarFilterItems
          items={PC_POINT_SIDEBAR}
          selected={pointFilter}
          onSelect={(value) => togglePcFilter('pointFilter', value)}
        />
      </SidebarAccordionSection>
      <SidebarAccordionSection
        title={SIDEBAR_CATEGORY_TITLES.season}
        isOpen={Boolean(openCategories[SIDEBAR_CATEGORY_TITLES.season])}
        onToggleOpen={() => toggleCategory(SIDEBAR_CATEGORY_TITLES.season)}
      >
        <SidebarFilterItems
          items={PC_SEASON_SIDEBAR}
          selected={themeFilter}
          onSelect={(value) => togglePcFilter('themeFilter', value)}
        />
      </SidebarAccordionSection>
      <SidebarAccordionSection
        title={SIDEBAR_CATEGORY_TITLES.shape}
        isOpen={Boolean(openCategories[SIDEBAR_CATEGORY_TITLES.shape])}
        onToggleOpen={() => toggleCategory(SIDEBAR_CATEGORY_TITLES.shape)}
      >
        <SidebarFilterItems
          items={PC_SHAPE_SIDEBAR}
          selected={shapeFilter}
          onSelect={(value) => togglePcFilter('shapeFilter', value)}
        />
      </SidebarAccordionSection>
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
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const themeFilter = useClientPcFilterStore((state) => state.themeFilter)
  const colorFilter = useClientPcFilterStore((state) => state.colorFilter)
  const moodFilter = useClientPcFilterStore((state) => state.moodFilter)
  const shapeFilter = useClientPcFilterStore((state) => state.shapeFilter)
  const pointFilter = useClientPcFilterStore((state) => state.pointFilter)
  const todayTrendFilter = useClientPcFilterStore((state) => state.todayTrendFilter)
  const togglePcFilter = useClientPcFilterStore((state) => state.toggleFilter)
  const toggleTodayTrend = useClientPcFilterStore((state) => state.toggleTodayTrend)

  useEffect(() => {
    if (navigationType === 'POP') return
    window.scrollTo(0, 0)
  }, [pathname, navigationType])

  useEffect(() => {
    let cancelled = false

    const applyAdminEmail = (email: string | undefined) => {
      if (!cancelled) setIsAdminUser(email?.trim().toLowerCase() === 'k981202@naver.com')
    }

    void supabase.auth.getUser().then(({ data }) => {
      applyAdminEmail(data.user?.email)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyAdminEmail(session?.user?.email)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const hideTopHeader =
    pathname.startsWith('/test') ||
    pathname.includes('/detail/') ||
    pathname === '/category' ||
    pathname === '/search' ||
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
    pathname === '/magazine' ||
    pathname.startsWith('/magazine/') ||
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
    <div className="min-h-[100dvh] overflow-clip bg-background">
      <div className="relative mx-auto min-h-[100dvh] w-full max-w-md md:flex md:max-w-[1600px] md:flex-row md:items-start">
        {/* PC 전용 좌측 사이드바 (모바일은 숨김) */}
        <aside className="hidden md:z-50 md:sticky md:top-0 md:flex md:h-screen md:w-[260px] md:shrink-0 md:flex-col md:border-r md:border-stone-200 md:bg-[#FAF8F5]">
          <div className="p-6 pb-2">
            <div className="mb-8 text-3xl font-black tracking-tighter text-stone-900">GELIA</div>
            <nav className="mb-6 flex flex-col gap-1">
              <NavLink
                to="/"
                end
                className="flex items-center gap-3 rounded-xl border border-stone-100 bg-white px-4 py-2.5 text-[14px] font-bold text-stone-900 shadow-sm"
              >
                🏠 홈
              </NavLink>
              <NavLink
                to="/curation"
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-stone-500 transition-all hover:bg-white hover:text-stone-900"
              >
                🏆 젤리아 큐레이션
              </NavLink>
              <NavLink
                to="/my"
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-stone-500 transition-all hover:bg-white hover:text-stone-900"
              >
                👤 마이페이지
              </NavLink>
            </nav>
          </div>

          <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-8 pt-1">
            <PcSidebarFilters
              todayTrendFilter={todayTrendFilter}
              colorFilter={colorFilter}
              moodFilter={moodFilter}
              pointFilter={pointFilter}
              themeFilter={themeFilter}
              shapeFilter={shapeFilter}
              toggleTodayTrend={toggleTodayTrend}
              togglePcFilter={togglePcFilter}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col w-full">
        {!hideTopHeader && (
        <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-background/80 px-5 backdrop-blur-xl md:hidden">
          <h1
            className="shrink-0 cursor-pointer whitespace-nowrap text-[28px] font-bold tracking-wide text-gray-900 sm:text-[30px]"
            style={{ fontFamily: "'Playfair Display', serif" }}
            onClick={() => navigate('/')}
          >
            GELIA
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageToggle compact />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary sm:h-10 sm:w-10"
              onClick={() => navigate('/search')}
              aria-label="검색"
            >
              <Search size={18} className="text-foreground" />
            </button>
            {isAdminUser && import.meta.env.DEV ? (
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground transition-opacity hover:opacity-90 sm:h-10 sm:w-10"
                onClick={() => navigate('/admin')}
                aria-label="관리자 페이지"
              >
                <Settings size={18} className="text-foreground" strokeWidth={2} />
              </button>
            ) : null}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary sm:h-10 sm:w-10"
              onClick={() => navigate('/my')}
              aria-label="마이페이지"
            >
              <User size={18} className="text-foreground" />
            </button>
          </div>
        </header>
        )}

        <main className={`flex min-h-0 flex-1 flex-col ${mainPbClass}`}>
          <Outlet />
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
            to="/my"
            className={bottomNavLinkClass}
            aria-label={isEnglish ? 'My tab' : '마이 탭'}
          >
            <User
              className="h-6 w-6 shrink-0"
              strokeWidth={2.5}
              aria-hidden
            />
            <span className="text-[9px] font-medium leading-none sm:text-[10px]">{isEnglish ? 'My' : '마이'}</span>
          </NavLink>
        </nav>
        )}
      </div>
    </div>
  )
}
