import {
  BarChart2,
  BookOpen,
  CalendarHeart,
  ChevronDown,
  ChevronUp,
  Home,
  Palette,
  Scissors,
  Search,
  Sparkles,
  Trophy,
  User,
  Wand2,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
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
  type PcSidebarCategoryFilterKey,
  type PcSidebarCategoryId,
  type SidebarFilterItem,
} from '@/features/client-home/clientPcSidebarConfig'

const bottomNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'm-0 flex h-full w-full min-w-0 cursor-pointer appearance-none flex-col items-center justify-center gap-0.5 border-0 bg-transparent px-1 pt-1 pb-1.5 [-webkit-tap-highlight-color:transparent]',
    isActive ? 'text-[#FF7E67]' : 'text-gray-400',
  ].join(' ')

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
              isSelected ? SIDEBAR_ITEM_ACTIVE_CLASS : '',
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
  filterValues,
  toggleRankingFilter,
  togglePcFilter,
}: {
  filterValues: Record<PcSidebarCategoryFilterKey, string>
  toggleRankingFilter: (option: string) => void
  togglePcFilter: (key: ClientPcFilterKey, option: string) => void
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
  }

  return (
    <>
      {PC_SIDEBAR_CATEGORIES.map((category, index) => (
        <SidebarAccordionSection
          key={category.id}
          label={category.label}
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
  const { pathname } = useLocation()
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

  const handleLogoClick = () => {
    resetPcFilters()
  }

  useEffect(() => {
    if (navigationType === 'POP') return
    window.scrollTo(0, 0)
  }, [pathname, navigationType])

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
    <div className="min-h-[100dvh] overflow-clip bg-background font-sans antialiased text-stone-900">
      <div className="relative mx-auto min-h-[100dvh] w-full max-w-md md:flex md:max-w-[1600px] md:flex-row md:items-start">
        {/* PC 전용 좌측 사이드바 (모바일은 숨김) */}
        <aside className="hidden md:z-50 md:sticky md:top-0 md:flex md:h-screen md:w-[260px] md:shrink-0 md:flex-col md:border-r md:border-stone-200 md:bg-[#FCFAF8] md:shadow-[2px_0_15px_-3px_rgba(0,0,0,0.03)]">
          <div className="p-6 pb-2">
            <GeliaWordmark className="mb-8" onClick={handleLogoClick} />
          </div>

          <div className="mb-2 mt-4 flex w-full flex-col px-5">
            <Link
              to="/magazine"
              className="flex items-center gap-2 py-3 text-[16px] font-extrabold tracking-tight text-stone-900 transition-colors hover:text-orange-600"
            >
              <span aria-hidden>📖</span>
              <span>GELIA Magazine</span>
            </Link>
          </div>
          <div className="mb-2 h-px w-full bg-stone-100" aria-hidden />

          <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-8 pt-1">
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
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col w-full">
        {!hideTopHeader && (
        <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-background/80 px-5 backdrop-blur-xl md:hidden">
          <GeliaWordmark className="md:hidden" onClick={handleLogoClick} />
          <ClientHeaderUtilityIcons className="gap-2" />
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
