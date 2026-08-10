import { useLanguageContext } from '@/contexts/LanguageContext'
import { buildNailImageSeoAlt } from '@/entities/nail-design/lib/nailDisplayText'
// import SavedFoldersGrid from '@/features/collection/components/SavedFoldersGrid'
// import { useCurrentUserId } from '@/features/my-page/useCurrentUserId'
// import { useUserSavedCountQuery } from '@/features/my-page/useUserSavedCountQuery'
import { supabase } from '@/shared/api/supabaseClient'
import {
  LIKED_NAILS_CHANGED_EVENT,
  readLikedNailEntries,
} from '@/shared/lib/likedNailsStorage'
import {
  RECENT_VIEWED_CHANGED_EVENT,
  readRecentViewedIds,
} from '@/shared/lib/recentViewedStorage'
import type { NailDesignRow } from '@/shared/types/database.types'
import { useQuery } from '@tanstack/react-query'
// import { Bell, Camera, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

type ActiveTab = 'recent' | 'liked'
// type ActiveTab = 'recent' | 'liked' | 'saved' // 638: saved 탭 게스트 숨김

const GALLERY_PREVIEW_LIMIT = 10

const tabLabels: Record<ActiveTab, { ko: string; en: string }> = {
  recent: { ko: '최근 본 디자인', en: 'Recently Viewed' },
  liked: { ko: '좋아요 한 네일', en: 'Liked Nails' },
  // saved: { ko: '내 컬렉션 보관함', en: 'My Collections' },
}

const MY_PAGE_NAIL_COLUMNS =
  'id,title,title_en,image_url,color,color_en,nail_length,length_en,styles,styles_en'

function isActiveTab(value: string | null): value is ActiveTab {
  return value === 'recent' || value === 'liked'
}

async function fetchNailsByOrderedIds(ids: string[]): Promise<NailDesignRow[]> {
  if (ids.length === 0) return []

  const { data: nailRows, error } = await supabase
    .from('nail_designs')
    .select(MY_PAGE_NAIL_COLUMNS)
    .in('id', ids)

  if (error) throw error

  const byId = new Map<string, NailDesignRow>()
  for (const row of nailRows ?? []) {
    const id = String(row.id ?? '').trim()
    if (id) byId.set(id, row as NailDesignRow)
  }

  return ids.map((id) => byId.get(id)).filter((row): row is NailDesignRow => Boolean(row))
}

export default function ClientMyPage() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  // const currentUserId = useCurrentUserId()
  const currentTab = searchParams.get('tab')
  const activeTab: ActiveTab = isActiveTab(currentTab) ? currentTab : 'recent'
  const [storageTick, setStorageTick] = useState(0)

  // 638: 게스트 서랍장 — 프로필/설정 모달 상태 비활성
  // const [isModalOpen, setIsModalOpen] = useState(false)
  // const [profileImg, setProfileImg] = useState('/avatar/default_profile_heart.png')
  // const [tempImg, setTempImg] = useState('/avatar/default_profile_heart.png')
  // const [nickname, setNickname] = useState("")
  // const [tempNickname, setTempNickname] = useState("")
  // const fileInputRef = useRef<HTMLInputElement>(null)
  // const [isUploading, setIsUploading] = useState(false)

  // const settingsTileClass =
  //   'flex w-full items-center gap-3 rounded-xl bg-stone-50 p-5 text-[15px] font-medium text-stone-700 transition-all hover:bg-stone-100'
  const previewGridClass = 'grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5'
  // const folderPreviewGridClass = 'grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5'

  const statButtonClass = (isActive: boolean) =>
    `flex cursor-pointer flex-col items-center gap-0.5 px-3 py-2 transition-colors md:items-end md:px-4 ${
      isActive ? 'rounded-xl bg-stone-100' : ''
    }`

  const statNumberClass = (isActive: boolean) =>
    `text-[24px] font-black tabular-nums leading-none ${
      isActive ? 'text-orange-600' : 'text-stone-900'
    }`
  const activeTabLabel = isEnglish ? tabLabels[activeTab].en : tabLabels[activeTab].ko
  // const defaultNickname = isEnglish ? 'Nailiever' : '네일리버'

  // 638: localStorage 변경 시 카운트/프리뷰 즉시 갱신
  useEffect(() => {
    const bump = () => setStorageTick((n) => n + 1)
    window.addEventListener(RECENT_VIEWED_CHANGED_EVENT, bump)
    window.addEventListener(LIKED_NAILS_CHANGED_EVENT, bump)
    return () => {
      window.removeEventListener(RECENT_VIEWED_CHANGED_EVENT, bump)
      window.removeEventListener(LIKED_NAILS_CHANGED_EVENT, bump)
    }
  }, [])

  // 638: ?tab=saved 등 레거시 URL → recent 로 정규화
  useEffect(() => {
    if (currentTab && !isActiveTab(currentTab)) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', 'recent')
          return next
        },
        { replace: true },
      )
    }
  }, [currentTab, setSearchParams])

  const recentIds = useMemo(() => readRecentViewedIds(null), [storageTick])
  const likedIds = useMemo(
    () => readLikedNailEntries(null).map((entry) => entry.id),
    [storageTick],
  )
  const recentCount = recentIds.length
  const likedCount = likedIds.length

  const previewIds = useMemo(() => {
    const source = activeTab === 'liked' ? likedIds : recentIds
    return source.slice(0, GALLERY_PREVIEW_LIMIT)
  }, [activeTab, likedIds, recentIds])

  const { data: galleryNails = [], isLoading: isGalleryLoading } = useQuery({
    queryKey: ['my-page-gallery-guest', activeTab, previewIds.join(',')],
    queryFn: () => fetchNailsByOrderedIds(previewIds),
    enabled: previewIds.length > 0,
    staleTime: 30_000,
  })

  // 638: 세션 가드 제거 — 비회원도 /my 서랍장 접근 가능
  // useEffect(() => { ... getSession → navigate('/') ... }, [navigate])

  // 638: 회원 프로필 로드 숨김
  // useEffect(() => { ... loadUserProfile ... }, [defaultNickname])

  // const { data: savedCount = 0, isLoading: isSavedCountLoading } = useUserSavedCountQuery(currentUserId)

  const handleTabChange = (tab: ActiveTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('tab', tab)
        return next
      },
      { replace: true },
    )
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-white px-5 border-b border-gray-50">
        <div className="w-8" />
        <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">
          {isEnglish ? 'My Vault' : '내 서랍장'}
        </h1>
        <div className="w-8" />
        {/* 638: 회원 전용 알림 버튼 숨김
        <button
          type="button"
          aria-label={isEnglish ? 'Notifications' : '알림'}
          className="relative p-2 text-gray-600"
          onClick={() => navigate('/notification-list')}
        >
          <Bell className="h-6 w-6 text-current" strokeWidth={2} />
          <span className="absolute right-1.5 top-1.5 h-[9px] w-[9px] rounded-full border-[2px] border-white bg-red-500" />
        </button>
        */}
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-6 md:px-8 lg:px-10">
        {/* 638: 회원 전용 프로필 카드 숨김 — 스탯만 유지
        <div className="mb-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:flex md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-5">
            ... profile avatar / nickname ...
          </div>
        */}
        <div className="mb-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex w-full justify-between md:justify-end md:gap-2">
            <button
              type="button"
              className={statButtonClass(activeTab === 'recent')}
              onClick={() => handleTabChange('recent')}
            >
              <span className={statNumberClass(activeTab === 'recent')}>{recentCount}</span>
              <span className="text-[14px] font-semibold text-stone-700">
                {isEnglish ? 'Recently Viewed' : '최근 본 디자인'}
              </span>
            </button>

            <button
              type="button"
              className={statButtonClass(activeTab === 'liked')}
              onClick={() => handleTabChange('liked')}
            >
              <span className={statNumberClass(activeTab === 'liked')}>{likedCount}</span>
              <span className="text-[14px] font-semibold text-stone-700">
                {isEnglish ? 'Liked Nails' : '좋아요 한 네일'}
              </span>
            </button>

            {/* 638: 내 컬렉션 보관함(Saved) 탭 숨김
            <button
              type="button"
              className={statButtonClass(activeTab === 'saved')}
              onClick={() => handleTabChange('saved')}
            >
              ...
            </button>
            */}
          </div>
        </div>

        <section className="mb-12 md:mb-16">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">{activeTabLabel}</h2>
            <button
              type="button"
              className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
              onClick={() => navigate(`/my/list/${activeTab}`)}
            >
              {isEnglish ? 'View All >' : '전체보기 >'}
            </button>
          </div>

          {/* 638: SavedFoldersGrid 숨김
          {activeTab === 'saved' ? (
            <SavedFoldersGrid ... />
          ) : (
          */}
          <div className={previewGridClass}>
            {isGalleryLoading && previewIds.length > 0 ? (
              Array.from({ length: Math.min(previewIds.length, 4) }, (_, index) => (
                <div key={`guest-vault-skel-${index}`} className="flex flex-col" aria-hidden>
                  <div className="aspect-[4/5] w-full animate-pulse rounded-xl bg-gray-100 md:rounded-2xl" />
                  <div className="mx-auto mt-2 h-3.5 w-3/4 animate-pulse rounded bg-gray-100" />
                </div>
              ))
            ) : galleryNails.length === 0 ? (
              <p className="col-span-full py-10 text-center text-sm text-stone-500">
                {isEnglish ? 'No designs yet.' : '아직 등록된 디자인이 없어요.'}
              </p>
            ) : (
              galleryNails.map((item) => {
                const titleKo = String(item.title ?? '').trim()
                const titleEn = String(item.title_en ?? '').trim()
                const title =
                  (isEnglish && titleEn ? titleEn : titleKo) ||
                  titleEn ||
                  (isEnglish ? 'Nail Design' : '네일 디자인')
                const imageUrl = String(item.image_url ?? '').trim()
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
                    className="flex cursor-pointer flex-col"
                  >
                    <div className="aspect-[4/5] w-full overflow-hidden rounded-xl border border-black/5 bg-gray-100 shadow-sm md:rounded-2xl">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={buildNailImageSeoAlt(item, isEnglish)}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="mt-2 w-full truncate text-center text-[13px] font-semibold text-stone-800">
                      {title}
                    </div>
                  </Link>
                )
              })
            )}
          </div>
          {/* )} */}
        </section>

        {/* 638: 회원 전용 설정 메뉴 숨김
        <section className="border-t border-stone-100 pb-12 pt-8">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            ... notifications / account / support / pro ...
          </div>
        </section>
        */}
      </main>

      {/* 638: 프로필 변경 모달 숨김
      {isModalOpen && ( ... )}
      */}
    </div>
  )
}
