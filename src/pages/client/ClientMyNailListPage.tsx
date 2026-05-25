import { fetchNailDesignsByIds } from '@/entities/nail-design/api/fetchNailDesignsByIds'
import { useCurrentUserId } from '@/features/my-page/useCurrentUserId'
import { supabase } from '@/shared/api/supabaseClient'
import {
  LIKED_NAILS_CHANGED_EVENT,
  readLikedNailEntries,
} from '@/shared/lib/likedNailsStorage'
import {
  readRecentViewedIds,
  RECENT_VIEWED_CHANGED_EVENT,
} from '@/shared/lib/recentViewedStorage'
import {
  readSavedNailEntries,
  SAVED_NAILS_CHANGED_EVENT,
} from '@/shared/lib/savedNailsStorage'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { useEffect, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type ListType = 'recent' | 'liked' | 'saved'

const LIST_TITLES: Record<ListType, string> = {
  recent: '최근 본 디자인',
  liked: '좋아요 한 네일',
  saved: '내가 저장한 네일',
}

function isListType(value: string | undefined): value is ListType {
  return value === 'recent' || value === 'liked' || value === 'saved'
}

function listIdsForType(type: ListType, userId: string | null): string[] {
  if (type === 'recent') {
    return readRecentViewedIds(userId)
  }
  if (type === 'liked') {
    return readLikedNailEntries(userId)
      .sort((a, b) => b.likedAt.localeCompare(a.likedAt))
      .map((e) => e.id)
  }
  return readSavedNailEntries(userId)
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .map((e) => e.id)
}

export default function ClientMyNailListPage() {
  const navigate = useNavigate()
  const { type: typeParam } = useParams<{ type: string }>()
  const currentUserId = useCurrentUserId()
  const [, forceStorageRefresh] = useReducer((version: number) => version + 1, 0)

  const listType = isListType(typeParam) ? typeParam : null
  const pageTitle = listType ? LIST_TITLES[listType] : ''

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        navigate('/client/login', { replace: true })
      }
    }
    void checkAuth()
  }, [navigate])

  useEffect(() => {
    if (!isListType(typeParam)) {
      navigate('/client/my', { replace: true })
    }
  }, [typeParam, navigate])

  useEffect(() => {
    const onChanged = () => forceStorageRefresh()
    window.addEventListener(LIKED_NAILS_CHANGED_EVENT, onChanged)
    window.addEventListener(SAVED_NAILS_CHANGED_EVENT, onChanged)
    window.addEventListener(RECENT_VIEWED_CHANGED_EVENT, onChanged)
    window.addEventListener('storage', onChanged)
    return () => {
      window.removeEventListener(LIKED_NAILS_CHANGED_EVENT, onChanged)
      window.removeEventListener(SAVED_NAILS_CHANGED_EVENT, onChanged)
      window.removeEventListener(RECENT_VIEWED_CHANGED_EVENT, onChanged)
      window.removeEventListener('storage', onChanged)
    }
  }, [])

  const nailIds = listType ? listIdsForType(listType, currentUserId) : []

  const { data: nails = [] } = useQuery({
    queryKey: ['my-nail-list', listType, currentUserId, nailIds],
    queryFn: () => fetchNailDesignsByIds(nailIds),
    enabled: Boolean(listType) && nailIds.length > 0,
    staleTime: 30_000,
  })

  const openDetail = (nailId: string, title: string, imageUrl: string) => {
    navigate(`/client/detail/${nailId}`, {
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

  const handleEdit = () => {}

  if (!listType) {
    return null
  }

  const totalCount = nailIds.length

  return (
    <div className="min-h-screen w-full bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 mx-auto flex h-14 w-full max-w-md items-center border-b border-gray-100 bg-white px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-800 transition-colors hover:bg-gray-50"
          aria-label="뒤로 가기"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-bold text-gray-900">
          {pageTitle}
        </h1>
        <button
          type="button"
          onClick={handleEdit}
          className="flex h-10 shrink-0 items-center justify-center px-1 text-[15px] font-semibold text-gray-800"
        >
          편집
        </button>
      </header>

      <main className="w-full pb-10 pt-14">
        <p className="px-5 pb-4 pt-5 text-[14px] text-gray-600">
          총{' '}
          <span className="font-bold text-[#FF7D66]">{totalCount}</span>
          개의 디자인
        </p>

        <div className="grid grid-cols-2 gap-4 px-5">
          {nails.map((item) => {
            const title = String(item.title ?? '').trim() || '네일 디자인'
            const imageUrl = String(item.image_url ?? '').trim()
            return (
              <article
                key={item.id}
                className="flex cursor-pointer flex-col"
                role="button"
                tabIndex={0}
                onClick={() => openDetail(item.id, title, imageUrl)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openDetail(item.id, title, imageUrl)
                  }
                }}
              >
                <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl border border-black/5 bg-gray-100 shadow-sm">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="mt-2.5 flex w-full flex-col items-center justify-center">
                  <span className="line-clamp-1 w-full text-center text-sm font-medium tracking-tight text-gray-800">
                    {title}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}
