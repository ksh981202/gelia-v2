import { useGalleryNailsQuery } from '@/features/client-gallery/useGalleryNailsQuery'
import type { NailDesignRow } from '@/shared/types/database.types'
import { normalizeForFilter } from '@/shared/utils/normalizeForFilter'
import { ChevronDown, ChevronLeft, Loader2, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const GALLERY_TABS = [
  { ko: '전체', en: 'All', keyword: '' },
  { ko: '시럽', en: 'Syrup', keyword: '시럽' },
  { ko: '프렌치', en: 'French', keyword: '프렌치' },
  { ko: '글리터', en: 'Glitter', keyword: '글리터' },
  { ko: '파츠', en: 'Parts', keyword: '파츠' },
  { ko: '그라데이션', en: 'Gradient', keyword: '그라데이션' },
] as const

type GalleryTab = (typeof GALLERY_TABS)[number]

const SORT_VALUES = ['인기순', '최신순', '저장 많은 순'] as const
type SortValue = (typeof SORT_VALUES)[number]

function sortGalleryItems(items: NailDesignRow[], sort: SortValue): NailDesignRow[] {
  const copy = [...items]
  copy.sort((a, b) => {
    if (sort === '최신순') {
      const byTime = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (byTime !== 0) return byTime
    } else if (sort === '저장 많은 순') {
      if (b.saves !== a.saves) return b.saves - a.saves
    } else {
      if (b.popularity !== a.popularity) return b.popularity - a.popularity
    }
    return b.id.localeCompare(a.id)
  })
  return copy
}

function filterGalleryByTab(items: NailDesignRow[], tab: GalleryTab): NailDesignRow[] {
  if (!tab.keyword) return items
  const needle = normalizeForFilter(tab.keyword)
  if (!needle) return items
  return items.filter((item) => {
    const haystacks = [item.category, item.title, item.title_en, ...item.tags]
    return haystacks.some((h) => normalizeForFilter(h).includes(needle))
  })
}

function displayItemTitle(item: NailDesignRow, isEnglish: boolean): string {
  const ko = String(item.title ?? '').trim()
  const en = String(item.title_en ?? '').trim()
  if (isEnglish && en) return en
  return ko || en || (isEnglish ? 'Nail Design' : '네일 디자인')
}

export default function ClientGalleryPage() {
  const navigate = useNavigate()
  const [isEnglish, setIsEnglish] = useState(false)
  const [activeTabKo, setActiveTabKo] = useState<string>(GALLERY_TABS[0].ko)
  const [sortType, setSortType] = useState<SortValue>('인기순')
  const [isSortOpen, setIsSortOpen] = useState(false)

  const tabContainerRef = useRef<HTMLDivElement>(null)
  const sortMenuRef = useRef<HTMLDivElement>(null)

  const { data: rows = [], isLoading, isError } = useGalleryNailsQuery()

  const activeTab = useMemo(
    () => GALLERY_TABS.find((t) => t.ko === activeTabKo) ?? GALLERY_TABS[0],
    [activeTabKo],
  )

  const filteredItems = useMemo(() => {
    const tabFiltered = filterGalleryByTab(rows, activeTab)
    return sortGalleryItems(tabFiltered, sortType)
  }, [rows, activeTab, sortType])

  const pageTitle = isEnglish ? 'Explore Gallery' : '갤러리 탐색'

  const sortLabel = (value: SortValue) => {
    if (value === '인기순') return isEnglish ? 'Popular' : '인기순'
    if (value === '최신순') return isEnglish ? 'Newest' : '최신순'
    return isEnglish ? 'Most Saved' : '저장 많은 순'
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = tabContainerRef.current?.querySelector('[data-active-tab="true"]')
      el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }, 150)
    return () => clearTimeout(timer)
  }, [activeTabKo])

  useEffect(() => {
    if (!isSortOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const root = sortMenuRef.current
      if (!root || root.contains(e.target as Node)) return
      setIsSortOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSortOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isSortOpen])

  return (
    <div className="mx-auto min-h-screen max-w-md bg-white text-slate-900">
      <div className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
        <header className="relative flex h-14 w-full items-center justify-between bg-white px-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="-ml-2 z-10 p-2"
            aria-label={isEnglish ? 'Go back' : '뒤로 가기'}
          >
            <ChevronLeft className="h-6 w-6 text-gray-900" />
          </button>
          <h1 className="absolute left-1/2 top-1/2 max-w-[52%] -translate-x-1/2 -translate-y-1/2 truncate whitespace-nowrap text-center text-lg font-bold text-gray-900">
            {pageTitle}
          </h1>
          <div className="-mr-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsEnglish((v) => !v)}
              className="rounded-full px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
              aria-label={isEnglish ? 'Switch to Korean' : 'Switch to English'}
            >
              {isEnglish ? 'KO' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/client/search')}
              className="p-2"
              aria-label={isEnglish ? 'Search' : '검색'}
            >
              <Search className="h-6 w-6 text-gray-900" />
            </button>
          </div>
        </header>

        <section
          ref={tabContainerRef}
          className="scrollbar-hide flex w-full flex-nowrap gap-2 overflow-x-auto scroll-smooth whitespace-nowrap px-4 pb-2 pt-1 [-webkit-overflow-scrolling:touch]"
        >
          {GALLERY_TABS.map((tab) => {
            const isActive = activeTabKo === tab.ko
            return (
              <button
                key={tab.ko}
                type="button"
                data-active-tab={isActive ? 'true' : 'false'}
                onClick={() => setActiveTabKo(tab.ko)}
                className={
                  isActive
                    ? 'shrink-0 whitespace-nowrap rounded-full bg-[#FF7E67] px-4 py-1.5 text-sm font-medium text-white'
                    : 'shrink-0 whitespace-nowrap rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600'
                }
              >
                {isEnglish ? tab.en : tab.ko}
              </button>
            )
          })}
          <div className="w-10 shrink-0" aria-hidden="true" />
        </section>

        <div className="relative flex items-center justify-between px-4 pb-3 pt-2">
          <span className="text-sm text-gray-500">
            {isEnglish ? 'Total ' : '총 '}
            <span className="font-bold text-pink-500">{filteredItems.length}</span>{' '}
            {isEnglish ? 'designs' : '개의 디자인'}
          </span>
          <div ref={sortMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors active:bg-gray-100"
              aria-haspopup="menu"
              aria-expanded={isSortOpen}
              aria-label={isEnglish ? 'Sort' : '정렬'}
            >
              <span>{sortLabel(sortType)}</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
            {isSortOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-[60] min-w-[120px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                {SORT_VALUES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSortType(option)
                      setIsSortOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm ${
                      sortType === option
                        ? 'bg-gray-100 font-medium text-gray-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {sortLabel(option)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="grid grid-cols-2 gap-4 px-4 pb-6 pt-4">
        {isLoading ? (
          <div className="col-span-2 flex flex-col items-center justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF7E67]" aria-hidden />
            <p className="text-sm">{isEnglish ? 'Loading designs…' : '디자인을 불러오는 중…'}</p>
          </div>
        ) : isError ? (
          <p className="col-span-2 py-12 text-center text-sm text-gray-500">
            {isEnglish ? 'Could not load designs.' : '디자인을 불러오지 못했습니다.'}
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="col-span-2 py-12 text-center text-sm text-gray-500">
            {isEnglish ? 'No designs to show.' : '표시할 네일이 없습니다.'}
          </p>
        ) : (
          filteredItems.map((item) => (
            <article
              key={item.id}
              className="flex cursor-pointer flex-col gap-2"
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate(`/client/detail/${item.id}`, {
                  state: {
                    initialNailData: {
                      id: item.id,
                      imageUrl: item.image_url,
                      title: displayItemTitle(item, isEnglish),
                      color: '',
                      mood: '',
                    },
                  },
                })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/client/detail/${item.id}`, {
                    state: {
                      initialNailData: {
                        id: item.id,
                        imageUrl: item.image_url,
                        title: displayItemTitle(item, isEnglish),
                        color: '',
                        mood: '',
                      },
                    },
                  })
                }
              }}
            >
              <div className="aspect-[3/4] w-full min-h-0 overflow-hidden rounded-xl bg-gray-100">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={displayItemTitle(item, isEnglish)}
                    className="h-full w-full min-h-0 object-cover object-center rounded-xl"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </div>
              <div className="mt-2 flex w-full flex-col items-center justify-center px-1">
                <p className="line-clamp-2 w-full text-center text-sm font-medium tracking-tight text-gray-800">
                  {displayItemTitle(item, isEnglish)}
                </p>
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  )
}
