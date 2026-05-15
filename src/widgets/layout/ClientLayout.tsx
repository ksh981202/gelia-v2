import { BarChart2, Home, Languages, Search, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigationType,
} from 'react-router-dom'

const bottomNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'm-0 flex h-full w-full min-w-0 cursor-pointer appearance-none flex-col items-center justify-center gap-1 border-0 bg-transparent px-1 py-0 [-webkit-tap-highlight-color:transparent]',
    isActive ? 'text-[#FF7E67]' : 'text-gray-400',
  ].join(' ')

const bottomNavItemInactive =
  'm-0 flex h-full w-full min-w-0 cursor-pointer appearance-none flex-col items-center justify-center gap-1 border-0 bg-transparent px-1 py-0 text-gray-400 [-webkit-tap-highlight-color:transparent]'

export default function ClientLayout() {
  const [headerLang, setHeaderLang] = useState<'ko' | 'en'>('ko')
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return
    window.scrollTo(0, 0)
  }, [pathname, navigationType])

  const hideTopHeader =
    pathname.includes('/client/detail/') ||
    pathname === '/client/recommend' ||
    pathname === '/client/color-curation' ||
    pathname === '/client/color-list' ||
    pathname === '/client/color-theme-list' ||
    pathname === '/client/color-popular-list' ||
    pathname === '/client/theme' ||
    pathname === '/client/season-curation' ||
    pathname === '/client/season-list' ||
    pathname === '/client/vacation-list' ||
    pathname === '/client/season-popular-list' ||
    pathname === '/client/style-curation' ||
    pathname === '/client/style-list' ||
    pathname === '/client/style-best-list' ||
    pathname === '/client/style-gallery-list' ||
    pathname === '/client/theme-list' ||
    pathname === '/client/situation-list' ||
    pathname === '/client/gallery-explore-list' ||
    pathname === '/client/today-special' ||
    pathname === '/client/quiz'

  const hideBottomNav =
    pathname.includes('/client/detail/') ||
    pathname === '/client/recommend' ||
    pathname === '/client/theme'

  const mainPbClass = hideBottomNav
    ? 'pb-[env(safe-area-inset-bottom,0px)]'
    : 'pb-[calc(5rem+env(safe-area-inset-bottom,0px))]'

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto min-h-screen w-full max-w-md">
        {!hideTopHeader && (
        <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-background/80 px-5 backdrop-blur-xl">
          <NavLink
            to="/client"
            end
            className="cursor-pointer whitespace-nowrap text-[28px] font-bold tracking-widest text-gray-900 sm:text-[30px]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            GELIA
          </NavLink>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setHeaderLang((prev) => (prev === 'ko' ? 'en' : 'ko'))
              }
              className="inline-flex h-10 min-w-[64px] items-center justify-center gap-1 rounded-full bg-secondary px-3 text-[12px] font-semibold text-foreground transition-opacity hover:opacity-90"
              aria-label={
                headerLang === 'en'
                  ? 'Switch language to Korean'
                  : '언어를 영어로 변경'
              }
              title={
                headerLang === 'en' ? 'Switch to Korean' : 'Switch to English'
              }
            >
              <Languages size={14} aria-hidden />
              <span>{headerLang === 'en' ? 'EN' : 'KO'}</span>
            </button>
            <NavLink
              to="/client/gallery"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-opacity hover:opacity-90"
              aria-label="검색"
            >
              <Search size={18} className="text-foreground" />
            </NavLink>
            <NavLink
              to="/client/theme"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-opacity hover:opacity-90"
              aria-label="마이페이지"
            >
              <User size={18} className="text-foreground" />
            </NavLink>
          </div>
        </header>
        )}

        <main className={`flex min-h-0 flex-1 flex-col ${mainPbClass}`}>
          <Outlet />
        </main>

        {!hideBottomNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto grid h-[64px] w-full max-w-md grid-cols-4 border-t border-gray-200 bg-white pb-safe"
          aria-label="하단 탭"
        >
          <NavLink
            to="/client"
            end
            className={bottomNavLinkClass}
            aria-label="홈 탭"
          >
            <Home
              className="h-6 w-6 shrink-0"
              strokeWidth={2.5}
              aria-hidden
            />
            <span className="text-[10px] font-medium leading-none">홈</span>
          </NavLink>
          <NavLink
            to="/client/ranking"
            className={bottomNavLinkClass}
            aria-label="트렌드 탭"
          >
            <BarChart2
              className="h-6 w-6 shrink-0"
              strokeWidth={2.5}
              aria-hidden
            />
            <span className="text-[10px] font-medium leading-none">트렌드</span>
          </NavLink>
          <NavLink
            to="/client/gallery"
            className={bottomNavLinkClass}
            aria-label="검색 탭"
          >
            <Search
              className="h-6 w-6 shrink-0"
              strokeWidth={2.5}
              aria-hidden
            />
            <span className="text-[10px] font-medium leading-none">검색</span>
          </NavLink>
          <Link
            to="/client"
            className={bottomNavItemInactive}
            aria-label="마이 탭"
          >
            <User
              className="h-6 w-6 shrink-0"
              strokeWidth={2.5}
              aria-hidden
            />
            <span className="text-[10px] font-medium leading-none">마이</span>
          </Link>
        </nav>
        )}
      </div>
    </div>
  )
}
