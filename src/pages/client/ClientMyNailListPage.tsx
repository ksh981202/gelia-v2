import { useLanguageContext } from '@/contexts/LanguageContext'
import { buildNailImageSeoAlt } from '@/entities/nail-design/lib/nailDisplayText'
// import SavedFoldersGrid from '@/features/collection/components/SavedFoldersGrid'
// import { useCurrentUserId } from '@/features/my-page/useCurrentUserId'
import { supabase } from '@/shared/api/supabaseClient'
import {
  LIKED_NAILS_CHANGED_EVENT,
  readLikedNailEntries,
  removeLikedNailIds,
} from '@/shared/lib/likedNailsStorage'
import {
  RECENT_VIEWED_CHANGED_EVENT,
  readRecentViewedIds,
  removeRecentViewedNailIds,
} from '@/shared/lib/recentViewedStorage'
import type { NailDesignRow } from '@/shared/types/database.types'
import { useInfiniteQuery } from '@tanstack/react-query'
import { CheckCircle2, ChevronLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

type ListType = 'recent' | 'liked'
// type ListType = 'recent' | 'liked' | 'saved' // 638: saved 게스트 숨김

const LIST_TITLES: Record<ListType, { ko: string; en: string }> = {
  recent: { ko: '최근 본 디자인', en: 'Recently Viewed' },
  liked: { ko: '좋아요 한 네일', en: 'Liked Nails' },
  // saved: { ko: '내 컬렉션 보관함', en: 'My Collections' },
}

/** 프로젝트 SSOT: 무한 스크롤 페이지 단위 */
const GALLERY_PAGE_SIZE = 10
const MY_LIST_NAIL_COLUMNS =
  'id,title,title_en,image_url,color,color_en,nail_length,length_en,styles,styles_en'
const GALLERY_GRID_CLASS = 'grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-4'

type MyNailListPage = {
  items: NailDesignRow[]
  totalCount: number
}

function isListType(value: string | undefined): value is ListType {
  return value === 'recent' || value === 'liked'
}

function nailDisplayTitle(item: NailDesignRow, isEnglish: boolean): string {
  const ko = String(item.title ?? '').trim()
  const en = String(item.title_en ?? '').trim()
  return (isEnglish && en ? en : ko || en) || (isEnglish ? 'Nail Design' : '네일 디자인')
}

function readGuestVaultIds(type: ListType): string[] {
  if (type === 'liked') {
    return readLikedNailEntries(null).map((entry) => entry.id)
  }
  return readRecentViewedIds(null)
}

async function fetchGuestVaultPage(type: ListType, page: number): Promise<MyNailListPage> {
  const allIds = readGuestVaultIds(type)
  const from = (page - 1) * GALLERY_PAGE_SIZE
  const pageIds = allIds.slice(from, from + GALLERY_PAGE_SIZE)

  if (pageIds.length === 0) {
    return { items: [], totalCount: allIds.length }
  }

  const { data: nailRows, error } = await supabase
    .from('nail_designs')
    .select(MY_LIST_NAIL_COLUMNS)
    .in('id', pageIds)

  if (error) throw error

  const byId = new Map<string, NailDesignRow>()
  for (const row of nailRows ?? []) {
    const id = String(row.id ?? '').trim()
    if (id) byId.set(id, row as NailDesignRow)
  }

  return {
    items: pageIds.map((id) => byId.get(id)).filter((row): row is NailDesignRow => Boolean(row)),
    totalCount: allIds.length,
  }
}

export default function ClientMyNailListPage() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const navigate = useNavigate()
  const { type: typeParam } = useParams<{ type: string }>()
  // const currentUserId = useCurrentUserId()
  const observerRef = useRef<HTMLDivElement | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeletePending, setIsDeletePending] = useState(false)
  const [storageTick, setStorageTick] = useState(0)

  const listType = isListType(typeParam) ? typeParam : null
  const pageTitle = listType ? LIST_TITLES[listType][isEnglish ? 'en' : 'ko'] : ''

  // 638: 세션 가드 제거 — 비회원도 전체보기 접근 가능
  // useEffect(() => { ... getSession → navigate('/') ... }, [navigate])

  useEffect(() => {
    const bump = () => setStorageTick((n) => n + 1)
    window.addEventListener(RECENT_VIEWED_CHANGED_EVENT, bump)
    window.addEventListener(LIKED_NAILS_CHANGED_EVENT, bump)
    return () => {
      window.removeEventListener(RECENT_VIEWED_CHANGED_EVENT, bump)
      window.removeEventListener(LIKED_NAILS_CHANGED_EVENT, bump)
    }
  }, [])

  useEffect(() => {
    if (!isListType(typeParam)) {
      navigate('/my', { replace: true })
    }
  }, [typeParam, navigate])

  useEffect(() => {
    setIsEditing(false)
    setSelectedIds([])
  }, [listType])

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['my-nail-list-guest', listType, storageTick],
    queryFn: ({ pageParam }) =>
      listType
        ? fetchGuestVaultPage(listType, pageParam as number)
        : Promise.resolve({ items: [], totalCount: 0 }),
    enabled: Boolean(listType),
    initialPageParam: 1,
    staleTime: 30_000,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.items.length, 0)
      if (loadedCount >= lastPage.totalCount || lastPage.items.length < GALLERY_PAGE_SIZE) {
        return undefined
      }
      return (lastPageParam as number) + 1
    },
  })

  const nails = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])
  const totalCount = data?.pages[0]?.totalCount ?? 0

  useEffect(() => {
    const target = observerRef.current
    if (!target || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || isFetchingNextPage) return
        void fetchNextPage()
      },
      { root: null, rootMargin: '200px', threshold: 0 },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setSelectedIds([])
  }, [])

  const handleSelect = useCallback((nailId: string) => {
    setSelectedIds((prev) =>
      prev.includes(nailId) ? prev.filter((id) => id !== nailId) : [...prev, nailId],
    )
  }, [])

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0 || !listType || isDeletePending) return

    const confirmed = window.confirm(
      isEnglish
        ? `Are you sure you want to delete ${selectedIds.length} selected items?`
        : `선택한 ${selectedIds.length}개의 네일 디자인을 정말 삭제하시겠습니까?`,
    )
    if (!confirmed) return

    setIsDeletePending(true)
    try {
      if (listType === 'recent') {
        removeRecentViewedNailIds(selectedIds, null)
      } else {
        removeLikedNailIds(selectedIds, null)
      }
      setIsEditing(false)
      setSelectedIds([])
      setStorageTick((n) => n + 1)
      await refetch()
    } catch (error) {
      const message = error instanceof Error ? error.message : '삭제에 실패했습니다.'
      window.alert(message)
    } finally {
      setIsDeletePending(false)
    }
  }, [isDeletePending, isEnglish, listType, refetch, selectedIds])

  const showEditControls = listType === 'recent' || listType === 'liked'

  if (!listType) {
    return null
  }

  return (
    <div className="min-h-screen w-full bg-[#fdfaf7] md:bg-white">
      <main className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:px-8 md:pt-10">
        <div className="mb-6 flex w-full flex-row items-center gap-1 border-b border-stone-100 pb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="-ml-2 flex shrink-0 cursor-pointer items-center justify-center rounded-full p-1.5 text-stone-800 transition-colors hover:bg-stone-100"
            aria-label={isEnglish ? 'Go back' : '뒤로 가기'}
          >
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
          <div className="mt-1 flex min-w-0 flex-1 items-baseline gap-2">
            <h1 className="truncate text-[24px] font-extrabold tracking-tight text-stone-900">
              {pageTitle}
            </h1>
            <span className="shrink-0 text-[16px] font-medium text-stone-500">
              {isEnglish ? (
                <>
                  (Total <span className="font-semibold text-orange-500">{totalCount || 0}</span>{' '}
                  designs)
                </>
              ) : (
                <>
                  (총 <span className="font-semibold text-orange-500">{totalCount || 0}</span>개)
                </>
              )}
            </span>
          </div>
          {showEditControls ? (
            <div className="flex shrink-0 items-center gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading || nails.length === 0}
                  className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-[13px] font-medium text-stone-600 transition-all hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isEnglish ? 'Edit' : '편집'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => void handleBulkDelete()}
                    disabled={selectedIds.length === 0 || isDeletePending}
                    className={[
                      'rounded-full px-4 py-1.5 text-[13px] font-medium transition-all',
                      selectedIds.length > 0
                        ? 'bg-red-500 text-white shadow-sm hover:bg-red-600'
                        : 'cursor-not-allowed bg-stone-200 text-stone-400 shadow-none',
                    ].join(' ')}
                  >
                    {isEnglish
                      ? `Delete (${selectedIds.length})`
                      : `삭제 (${selectedIds.length})`}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isDeletePending}
                    className="rounded-full bg-stone-100 px-4 py-1.5 text-[13px] font-medium text-stone-600 transition-all hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isEnglish ? 'Cancel' : '취소'}
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* 638: SavedFoldersGrid 숨김
        {listType === 'saved' ? (
          <SavedFoldersGrid ... />
        ) : (
        */}
        <>
          <div className={GALLERY_GRID_CLASS}>
            {isLoading ? (
              Array.from({ length: 10 }, (_, index) => (
                <article key={`my-nail-list-skel-${index}`} className="flex flex-col" aria-hidden>
                  <div className="aspect-[4/5] w-full animate-pulse overflow-hidden rounded-xl border border-black/5 bg-gray-100 shadow-sm md:rounded-2xl" />
                  <div className="mx-auto mt-2 h-3.5 w-3/4 animate-pulse rounded bg-gray-100" />
                </article>
              ))
            ) : isError ? (
              <p className="col-span-full py-12 text-center text-sm text-stone-500">
                {isEnglish ? 'Failed to load designs.' : '디자인을 불러오지 못했어요.'}
              </p>
            ) : nails.length === 0 ? (
              <p className="col-span-full py-12 text-center text-sm text-stone-500">
                {isEnglish ? 'No designs yet.' : '아직 등록된 디자인이 없어요.'}
              </p>
            ) : (
              nails.map((item) => {
                const title = nailDisplayTitle(item, isEnglish)
                const imageUrl = String(item.image_url ?? '').trim()
                const isSelected = selectedIds.includes(item.id)
                const cardClassName = `flex cursor-pointer flex-col ${isEditing && isSelected ? 'rounded-xl ring-2 ring-stone-800 ring-offset-2 md:rounded-2xl' : ''}`
                const cardContent = (
                  <>
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-black/5 bg-gray-100 shadow-sm md:rounded-2xl">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={buildNailImageSeoAlt(item, isEnglish)}
                          className={`h-full w-full object-cover transition-transform ${isEditing ? '' : 'hover:scale-105'}`}
                        />
                      ) : null}
                      {isEditing ? (
                        <span
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center"
                          aria-hidden
                        >
                          {isSelected ? (
                            <CheckCircle2
                              className="h-7 w-7 fill-stone-800 text-white drop-shadow-md"
                              strokeWidth={2}
                            />
                          ) : (
                            <span className="h-6 w-6 rounded-full border-2 border-white bg-black/25 shadow-sm" />
                          )}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 w-full truncate text-center text-[13px] font-semibold text-stone-800">
                      {title}
                    </div>
                  </>
                )

                if (isEditing) {
                  return (
                    <article
                      key={item.id}
                      className={cardClassName}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelect(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSelect(item.id)
                        }
                      }}
                    >
                      {cardContent}
                    </article>
                  )
                }

                return (
                  <Link
                    key={item.id}
                    to={`/detail/${item.id}`}
                    state={{
                      initialNailData: {
                        id: item.id,
                        imageUrl,
                        title,
                        color: '',
                        mood: '',
                      },
                    }}
                    className={cardClassName}
                  >
                    {cardContent}
                  </Link>
                )
              })
            )}
            {isFetchingNextPage
              ? [0, 1, 2, 3, 4].map((index) => (
                  <article key={`my-nail-list-next-skel-${index}`} className="flex flex-col" aria-hidden>
                    <div className="aspect-[4/5] w-full animate-pulse overflow-hidden rounded-xl border border-black/5 bg-gray-100 shadow-sm md:rounded-2xl" />
                    <div className="mx-auto mt-2 h-3.5 w-3/4 animate-pulse rounded bg-gray-100" />
                  </article>
                ))
              : null}
          </div>
          <div ref={observerRef} className="h-10 pb-4" aria-hidden />
        </>
        {/* )} */}
      </main>
    </div>
  )
}
