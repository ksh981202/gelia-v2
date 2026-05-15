import { ChevronLeft, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { NailListExplore } from '../../widgets/nail-list/NailListExplore'
import { VACATION_TABS } from './vacationTabs'

export default function ClientVacationListPage() {
  const navigate = useNavigate()

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 bg-white/95 backdrop-blur-md">
        <div className="relative flex h-full w-full min-w-0 items-center justify-between px-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="-ml-2 shrink-0 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-6 w-6 text-gray-900" strokeWidth={2} />
          </button>

          <h1 className="pointer-events-none absolute left-1/2 max-w-[min(100%-5rem,16rem)] -translate-x-1/2 truncate text-center text-lg font-bold tracking-tight text-gray-900">
            바캉스 네일
          </h1>

          <Link
            to="/client/gallery"
            className="-mr-2 shrink-0 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
            aria-label="검색"
          >
            <Search className="h-6 w-6 text-gray-900" strokeWidth={2} />
          </Link>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <NailListExplore
          tabs={[...VACATION_TABS]}
          tabsSectionLabel="바캉스"
          queryScope="vacation"
        />
      </div>
    </div>
  )
}
