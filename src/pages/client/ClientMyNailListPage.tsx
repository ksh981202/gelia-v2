import {
  useDeleteLikesMutation,
  useDeleteRecentViewsMutation,
} from '@/features/nail-activity/api/useClientActivityApi'
import { useLanguageContext } from '@/contexts/LanguageContext'
import SavedFoldersGrid from '@/features/collection/components/SavedFoldersGrid'
import { useCurrentUserId } from '@/features/my-page/useCurrentUserId'
import { supabase } from '@/shared/api/supabaseClient'
import type { NailDesignRow } from '@/shared/types/database.types'
import { useInfiniteQuery } from '@tanstack/react-query'
import { CheckCircle2, ChevronLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type ListType = 'recent' | 'liked' | 'saved'
type UserActivityTable = 'user_recent_views' | 'user_likes' | 'user_saves'

const LIST_TITLES: Record<ListType, { ko: string; en: string }> = {
  recent: { ko: '최근 본 디자인', en: 'Recently Viewed' },
  liked: { ko: '좋아요 한 네일', en: 'Liked Nails' },
  saved: { ko: '저장한 네일', en: 'Saved Nails' },
}

const LIST_PAGE_SIZE = 10
const MY_LIST_NAIL_COLUMNS = 'id,title,title_en,image_url'
const GALLERY_GRID_CLASS = 'grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-4'

const ACTIVITY_TABLE_BY_TYPE: Record<ListType, { table: UserActivityTable; orderColumn: string }> = {
  recent: { table: 'user_recent_views', orderColumn: 'viewed_at' },
  liked: { table: 'user_likes', orderColumn: 'created_at' },
  saved: { table: 'user_saves', orderColumn: 'created_at' },
}

type MyNailListPage = {
  items: NailDesignRow[]
  totalCount: number
}

function isListType(value: string | undefined): value is ListType {
  return value === 'recent' || value === 'liked' || value === 'saved'
}

function nailDisplayTitle(item: NailDesignRow, isEnglish: boolean): string {
  const ko = String(item.title ?? '').trim()
  const en = String(item.title_en ?? '').trim()
  return (isEnglish && en ? en : ko || en) || (isEnglish ? 'Nail Design' : '네일 디자인')
}

async function fetchMyNailListPage(
  type: ListType,
  userId: string | null,
  page: number,
): Promise<MyNailListPage> {
  if (!userId) return { items: [], totalCount: 0 }

  const { table, orderColumn } = ACTIVITY_TABLE_BY_TYPE[type]
  const from = (page - 1) * LIST_PAGE_SIZE
  const to = page * LIST_PAGE_SIZE - 1

  const { data: activityRows, count, error: activityError } = await supabase
    .from(table)
    .select('nail_id', { count: 'exact' })
    .eq('user_id', userId)
    .order(orderColumn, { ascending: false })
    .range(from, to)

  if (activityError) throw activityError

  const nailIds =
    activityRows
      ?.map((row) => String((row as { nail_id?: unknown }).nail_id ?? '').trim())
      .filter(Boolean) ?? []

  if (nailIds.length === 0) return { items: [], totalCount: count ?? 0 }

  const { data: nailRows, error: nailError } = await supabase
    .from('nail_designs')
    .select(MY_LIST_NAIL_COLUMNS)
    .in('id', nailIds)

  if (nailError) throw nailError

  const byId = new Map<string, NailDesignRow>()
  for (const row of nailRows ?? []) {
    const id = String(row.id ?? '').trim()
    if (id) byId.set(id, row as NailDesignRow)
  }

  return {
    items: nailIds
      .map((id) => byId.get(id))
      .filter((row): row is NailDesignRow => Boolean(row)),
    totalCount: count ?? 0,
  }
}

export default function ClientMyNailListPage() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const navigate = useNavigate()
  const { type: typeParam } = useParams<{ type: string }>()
  const currentUserId = useCurrentUserId()
  const observerRef = useRef<HTMLDivElement | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const deleteRecentViewsMutation = useDeleteRecentViewsMutation()
  const deleteLikesMutation = useDeleteLikesMutation()

  const listType = isListType(typeParam) ? typeParam : null
  const pageTitle = listType ? LIST_TITLES[listType][isEnglish ? 'en' : 'ko'] : ''

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login', { replace: true })
      }
    }
    void checkAuth()
  }, [navigate])

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
  } = useInfiniteQuery({
    queryKey: ['my-nail-list', listType, currentUserId],
    queryFn: ({ pageParam }) =>
      listType && listType !== 'saved'
        ? fetchMyNailListPage(listType, currentUserId, pageParam as number)
        : Promise.resolve({ items: [], totalCount: 0 }),
    enabled: Boolean(listType) && listType !== 'saved' && Boolean(currentUserId),
    initialPageParam: 1,
    staleTime: 30_000,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.items.length, 0)
      if (loadedCount >= lastPage.totalCount || lastPage.items.length < LIST_PAGE_SIZE) return undefined
      return (lastPageParam as number) + 1
    },
  })

  const nails = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  )
  const totalCount = data?.pages[0]?.totalCount ?? 0

  useEffect(() => {
    const target = observerRef.current
    if (!target || !hasNextPage || listType === 'saved') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || isFetchingNextPage) return
        void fetchNextPage()
      },
      { root: null, rootMargin: '200px', threshold: 0 },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, listType])

  const openDetail = (nailId: string, title: string, imageUrl: string) => {
    navigate(`/detail/${nailId}`, {
      state: {
        initialNailData: {
          id: nailId,
          imageUrl,
          title,
          color: '',
          mood: '',
        },
      },
    })
  }

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setSelectedIds([])
  }, [])

  const handleCardClick = useCallback(
    (nailId: string, title: string, imageUrl: string) => {
      if (isEditing) {
        setSelectedIds((prev) =>
          prev.includes(nailId) ? prev.filter((id) => id !== nailId) : [...prev, nailId],
        )
        return
      }
      openDetail(nailId, title, imageUrl)
    },
    [isEditing, navigate],
  )

  const handleBulkDelete = useCallback(async () => {
    if (!currentUserId || selectedIds.length === 0 || !listType || listType === 'saved') return

    const confirmed = window.confirm(
      isEnglish
        ? `Are you sure you want to delete ${selectedIds.length} selected items?`
        : `선택한 ${selectedIds.length}개의 네일 디자인을 정말 삭제하시겠습니까?`,
    )
    if (!confirmed) return

    const isDeleting =
      deleteRecentViewsMutation.isPending || deleteLikesMutation.isPending
    if (isDeleting) return

    try {
      if (listType === 'recent') {
        await deleteRecentViewsMutation.mutateAsync({
          userId: currentUserId,
          nailIds: selectedIds,
        })
      } else if (listType === 'liked') {
        await deleteLikesMutation.mutateAsync({
          userId: currentUserId,
          nailIds: selectedIds,
        })
      }
      setIsEditing(false)
      setSelectedIds([])
    } catch (error) {
      const message = error instanceof Error ? error.message : '삭제에 실패했습니다.'
      window.alert(message)
    }
  }, [
    currentUserId,
    deleteLikesMutation,
    deleteRecentViewsMutation,
    isEnglish,
    listType,
    selectedIds,
  ])

  const isDeletePending =
    deleteRecentViewsMutation.isPending || deleteLikesMutation.isPending
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
            {listType !== 'saved' ? (
              <span className="shrink-0 text-[16px] font-medium text-stone-500">
                {isEnglish ? (
                  <>
                    (Total{' '}
                    <span className="font-semibold text-orange-500">{totalCount || 0}</span> designs)
                  </>
                ) : (
                  <>
                    (총 <span className="font-semibold text-orange-500">{totalCount || 0}</span>개)
                  </>
                )}
              </span>
            ) : null}
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
        {listType === 'saved' ? (
          <SavedFoldersGrid
            userId={currentUserId}
            isEnglish={isEnglish}
            gridClassName={GALLERY_GRID_CLASS}
          />
        ) : (
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
                  return (
                    <article
                      key={item.id}
                      className={`flex cursor-pointer flex-col ${isEditing && isSelected ? 'ring-2 ring-orange-500 ring-offset-2 rounded-xl md:rounded-2xl' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCardClick(item.id, title, imageUrl)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleCardClick(item.id, title, imageUrl)
                        }
                      }}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-black/5 bg-gray-100 shadow-sm md:rounded-2xl">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={title}
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
                                className="h-7 w-7 fill-orange-500 text-white drop-shadow-md"
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
                    </article>
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
        )}
      </main>
    </div>
  )
}
