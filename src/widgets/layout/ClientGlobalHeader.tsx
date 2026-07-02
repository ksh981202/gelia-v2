import { ChevronLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ClientHeaderUtilityIcons from '@/components/client/ClientHeaderUtilityIcons'
import { useLanguageContext } from '@/contexts/LanguageContext'
import { useClientPcFilterStore } from '@/features/client-home/useClientPcFilterStore'

type ClientGlobalHeaderProps = {
  /** 좌측 뒤로 가기 버튼 노출 여부 (기본값 true) */
  showBackButton?: boolean
  /** 메인 홈 여부: true면 스토어에 연결된 실제 input, false면 /search 라우팅 버튼 (기본값 false) */
  isMainHome?: boolean
}

export default function ClientGlobalHeader({
  showBackButton = true,
  isMainHome = false,
}: ClientGlobalHeaderProps) {
  const navigate = useNavigate()
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const searchKeyword = useClientPcFilterStore((state) => state.searchKeyword)
  const setSearchKeyword = useClientPcFilterStore((state) => state.setSearchKeyword)
  const resetFilters = useClientPcFilterStore((state) => state.resetFilters)

  const placeholder = isEnglish
    ? 'What nail design are you looking for?'
    : '어떤 네일을 찾고 계신가요?'

  const handleBack = () => {
    if (isMainHome) {
      resetFilters()
      return
    }
    navigate(-1)
  }

  return (
    <header className="sticky top-0 z-40 hidden h-[70px] w-full items-center justify-between border-b border-stone-100 bg-white/95 px-8 backdrop-blur-sm md:flex">
      <div className="flex flex-1 justify-start">
        {showBackButton ? (
          <button
            type="button"
            onClick={handleBack}
            className="-ml-2 flex cursor-pointer items-center justify-center rounded-full p-1.5 text-stone-800 transition-colors hover:bg-stone-100"
            aria-label={isEnglish ? 'Go back' : '뒤로 가기'}
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>
        ) : null}
      </div>

      <div className="mx-4 w-full max-w-2xl">
        {isMainHome ? (
          <label className="relative block w-full">
            <Search
              size={20}
              strokeWidth={2}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-stone-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder={placeholder}
              aria-label={isEnglish ? 'Search' : '검색'}
              className="w-full rounded-full bg-stone-50 py-3.5 pl-12 pr-6 text-[15px] text-stone-900 transition-all placeholder:text-[15px] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
            />
          </label>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="flex h-11 w-full items-center gap-2 rounded-full bg-stone-100 px-4 text-left text-stone-400 transition-colors hover:bg-stone-200/70"
            aria-label={isEnglish ? 'Search' : '검색'}
          >
            <Search className="h-5 w-5 shrink-0 text-stone-400" strokeWidth={2} aria-hidden />
            <span className="truncate text-[15px]">{placeholder}</span>
          </button>
        )}
      </div>

      <div className="flex flex-1 justify-end">
        <ClientHeaderUtilityIcons />
      </div>
    </header>
  )
}
