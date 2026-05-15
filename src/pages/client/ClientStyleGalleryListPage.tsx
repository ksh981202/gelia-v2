import { ChevronLeft, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { NailListExplore } from '../../widgets/nail-list/NailListExplore'
import { STYLE_GALLERY_TAB_LABELS } from './styleGalleryTabs'

export default function ClientStyleGalleryListPage() {
  const navigate = useNavigate()

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <header className="sticky top-0 z-50 relative flex h-14 w-full shrink-0 items-center justify-between bg-white/95 px-5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="-ml-2 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </button>

        <h1 className="pointer-events-none absolute left-1/2 max-w-[min(100%-5rem,16rem)] -translate-x-1/2 truncate text-center text-lg font-bold tracking-tight text-gray-900">
          스타일별 네일 갤러리
        </h1>

        <Link
          to="/client/gallery"
          className="-mr-2 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
          aria-label="검색"
        >
          <Search className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </Link>
      </header>

      <div className="min-h-0 flex-1">
        <NailListExplore
          tabs={[...STYLE_GALLERY_TAB_LABELS]}
          tabsSectionLabel="갤러리"
          queryScope="gallery"
        />
      </div>
    </div>
  )
}
