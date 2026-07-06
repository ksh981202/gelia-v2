import { useLanguageContext } from '@/contexts/LanguageContext'
import SavedFoldersGrid from '@/features/collection/components/SavedFoldersGrid'
import { useCurrentUserId } from '@/features/my-page/useCurrentUserId'
import { useUserSavedCountQuery } from '@/features/my-page/useUserSavedCountQuery'
import { supabase } from '@/shared/api/supabaseClient'
import type { NailDesignRow } from '@/shared/types/database.types'
import { useQuery } from '@tanstack/react-query'
import { Bell, Camera, X } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

type ActiveTab = 'recent' | 'liked' | 'saved'
type UserActivityTable = 'user_recent_views' | 'user_likes' | 'user_saves'

const GALLERY_PREVIEW_LIMIT = 10

const tabLabels: Record<ActiveTab, { ko: string; en: string }> = {
  recent: { ko: '최근 본 디자인', en: 'Recently Viewed' },
  liked: { ko: '좋아요 한 네일', en: 'Liked Nails' },
  saved: { ko: '내 컬렉션 보관함', en: 'My Collections' },
}

const ACTIVITY_TABLE_BY_TAB: Record<ActiveTab, { table: UserActivityTable; orderColumn: string }> = {
  recent: { table: 'user_recent_views', orderColumn: 'viewed_at' },
  liked: { table: 'user_likes', orderColumn: 'created_at' },
  saved: { table: 'user_saves', orderColumn: 'created_at' },
}

const MY_PAGE_NAIL_COLUMNS = 'id,title,title_en,image_url'

function isActiveTab(value: string | null): value is ActiveTab {
  return value === 'recent' || value === 'liked' || value === 'saved'
}

async function fetchActivityCount(table: UserActivityTable, userId: string | null): Promise<number> {
  if (!userId) return 0

  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count ?? 0
}

async function fetchActivityPreview(tab: ActiveTab, userId: string | null): Promise<NailDesignRow[]> {
  if (!userId) return []

  const { table, orderColumn } = ACTIVITY_TABLE_BY_TAB[tab]
  const { data: activityRows, error: activityError } = await supabase
    .from(table)
    .select('nail_id')
    .eq('user_id', userId)
    .order(orderColumn, { ascending: false })
    .limit(GALLERY_PREVIEW_LIMIT)

  if (activityError) throw activityError

  const nailIds =
    activityRows
      ?.map((row) => String((row as { nail_id?: unknown }).nail_id ?? '').trim())
      .filter(Boolean) ?? []

  if (nailIds.length === 0) return []

  const { data: nailRows, error: nailError } = await supabase
    .from('nail_designs')
    .select(MY_PAGE_NAIL_COLUMNS)
    .in('id', nailIds)

  if (nailError) throw nailError

  const byId = new Map<string, NailDesignRow>()
  for (const row of nailRows ?? []) {
    const id = String(row.id ?? '').trim()
    if (id) byId.set(id, row as NailDesignRow)
  }

  return nailIds
    .map((id) => byId.get(id))
    .filter((row): row is NailDesignRow => Boolean(row))
}

export default function ClientMyPage() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUserId = useCurrentUserId()
  const currentTab = searchParams.get('tab')
  const activeTab: ActiveTab = isActiveTab(currentTab) ? currentTab : 'recent'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [profileImg, setProfileImg] = useState('/avatar/default_profile_heart.png')
  const [tempImg, setTempImg] = useState('/avatar/default_profile_heart.png')
  const [nickname, setNickname] = useState("")
  const [tempNickname, setTempNickname] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const settingsTileClass =
    'flex w-full items-center gap-3 rounded-xl bg-stone-50 p-5 text-[15px] font-medium text-stone-700 transition-all hover:bg-stone-100'
  const previewGridClass = 'grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5'
  const folderPreviewGridClass = 'grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5'

  const statButtonClass = (isActive: boolean) =>
    `flex cursor-pointer flex-col items-center gap-0.5 px-3 py-2 transition-colors md:items-end md:px-4 ${
      isActive ? 'rounded-xl bg-stone-100' : ''
    }`

  const statNumberClass = (isActive: boolean) =>
    `text-[24px] font-black tabular-nums leading-none ${
      isActive ? 'text-orange-600' : 'text-stone-900'
    }`
  const activeTabLabel = isEnglish ? tabLabels[activeTab].en : tabLabels[activeTab].ko
  const { data: recentCount = 0, isLoading: isRecentCountLoading } = useQuery({
    queryKey: ['my-page-count', 'recent', currentUserId],
    queryFn: () => fetchActivityCount('user_recent_views', currentUserId),
    enabled: Boolean(currentUserId),
    staleTime: 30_000,
  })
  const { data: likedCount = 0, isLoading: isLikedCountLoading } = useQuery({
    queryKey: ['my-page-count', 'liked', currentUserId],
    queryFn: () => fetchActivityCount('user_likes', currentUserId),
    enabled: Boolean(currentUserId),
    staleTime: 30_000,
  })
  const { data: savedCount = 0, isLoading: isSavedCountLoading } = useUserSavedCountQuery(currentUserId)

  useEffect(() => {
    let cancelled = false

    const initCheck = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!cancelled && !session) {
        navigate('/login', { replace: true })
      }
    }

    void initCheck()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login', { replace: true })
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [navigate])

  useEffect(() => {
    let cancelled = false

    const loadUserProfile = async () => {
      const { data } = await supabase.auth.getUser()
      const metadata = data.user?.user_metadata ?? {}
      const displayName = typeof metadata.display_name === 'string' ? metadata.display_name.trim() : ''
      const avatarUrl = typeof metadata.avatar_url === 'string' ? metadata.avatar_url.trim() : ''

      if (cancelled) return

      setNickname(displayName || '네일리버')
      if (avatarUrl) setProfileImg(avatarUrl)
    }

    void loadUserProfile()

    return () => {
      cancelled = true
    }
  }, [])

  const { data: galleryNails = [] } = useQuery({
    queryKey: ['my-page-gallery', activeTab, currentUserId],
    queryFn: () => fetchActivityPreview(activeTab, currentUserId),
    enabled: Boolean(currentUserId) && activeTab !== 'saved',
    staleTime: 30_000,
  })

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

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return
    if (!currentUserId) {
      alert('로그인 후 이용해 주세요.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('5MB 이하의 이미지만 업로드할 수 있습니다.')
      return
    }

    setIsUploading(true)
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${currentUserId}_${Date.now()}.${extension}`
      const { data, error } = await supabase.storage.from('avatars').upload(fileName, file)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(data.path)
      setTempImg(publicUrlData.publicUrl)
    } catch (error) {
      const message = error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.'
      alert(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-white px-5 border-b border-gray-50">
        <div className="w-8" />
        <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">
          {isEnglish ? 'My Page' : '마이페이지'}
        </h1>
        <button
          type="button"
          aria-label="알림"
          className="relative p-2 text-gray-600"
          onClick={() => navigate('/notification-list')}
        >
          <Bell className="h-6 w-6 text-current" strokeWidth={2} />
          <span className="absolute right-1.5 top-1.5 h-[9px] w-[9px] rounded-full border-[2px] border-white bg-red-500" />
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-6 md:px-8 lg:px-10">
        <div className="mb-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:flex md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-5">
            <div
              className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-full border border-stone-200 bg-white md:h-20 md:w-20"
              onClick={() => {
                setTempImg(profileImg)
                setTempNickname(nickname || '네일리버')
                setIsModalOpen(true)
              }}
            >
              <img src={profileImg} alt="프로필" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 text-left">
              <div className="truncate text-xl font-bold text-stone-900 md:text-2xl">
                {nickname || '네일리버'}
              </div>
              <p className="mt-1 text-[13px] text-stone-600">
                {isEnglish ? 'Have a great day 🌷' : '좋은 하루 보내세요 🌷'}
              </p>
            </div>
          </div>

          <div className="mt-8 flex w-full justify-between border-t border-stone-100 pt-6 md:mt-0 md:w-auto md:justify-end md:gap-2 md:border-t-0 md:pt-0">
            <button
              type="button"
              className={statButtonClass(activeTab === 'recent')}
              onClick={() => handleTabChange('recent')}
            >
              <span className={statNumberClass(activeTab === 'recent')}>
                {isRecentCountLoading ? '...' : recentCount}
              </span>
              <span className="text-[14px] font-semibold text-stone-700">
                {isEnglish ? 'Recently Viewed' : '최근 본 디자인'}
              </span>
            </button>

            <button
              type="button"
              className={statButtonClass(activeTab === 'liked')}
              onClick={() => handleTabChange('liked')}
            >
              <span className={statNumberClass(activeTab === 'liked')}>
                {isLikedCountLoading ? '...' : likedCount}
              </span>
              <span className="text-[14px] font-semibold text-stone-700">
                {isEnglish ? 'Liked Nails' : '좋아요 한 네일'}
              </span>
            </button>

            <button
              type="button"
              className={statButtonClass(activeTab === 'saved')}
              onClick={() => handleTabChange('saved')}
            >
              <span className={statNumberClass(activeTab === 'saved')}>
                {isSavedCountLoading ? '...' : savedCount}
              </span>
              <span className="text-[14px] font-semibold text-stone-700">
                {isEnglish ? tabLabels.saved.en : tabLabels.saved.ko}
              </span>
            </button>
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

          {activeTab === 'saved' ? (
            <SavedFoldersGrid
              userId={currentUserId}
              isEnglish={isEnglish}
              gridClassName={folderPreviewGridClass}
            />
          ) : (
            <div className={previewGridClass}>
              {galleryNails.map((item) => {
                const titleKo = String(item.title ?? '').trim()
                const titleEn = String(item.title_en ?? '').trim()
                const title =
                  (isEnglish && titleEn ? titleEn : titleKo) ||
                  titleEn ||
                  (isEnglish ? 'Nail Design' : '네일 디자인')
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
                    <div className="aspect-[4/5] w-full overflow-hidden rounded-xl border border-black/5 bg-gray-100 shadow-sm md:rounded-2xl">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="mt-2 w-full truncate text-center text-[13px] font-semibold text-stone-800">
                      {title}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="border-t border-stone-100 pb-12 pt-8">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            <button
              type="button"
              className={settingsTileClass}
              onClick={() => navigate('/notifications')}
            >
              <span className="text-xl" aria-hidden>
                🔔
              </span>
              {isEnglish ? 'Notification Settings' : '알림 설정'}
            </button>
            <button
              type="button"
              className={settingsTileClass}
              onClick={() => navigate('/account')}
            >
              <span className="text-xl" aria-hidden>
                ⚙️
              </span>
              {isEnglish ? 'Account Management' : '계정 관리'}
            </button>
            <button
              type="button"
              className={settingsTileClass}
              onClick={() => navigate('/support')}
            >
              <span className="text-xl" aria-hidden>
                🎧
              </span>
              {isEnglish ? 'Customer Service / Notice' : '고객센터 / 공지사항'}
            </button>
            <Link to="/pro" className={settingsTileClass}>
              <span className="text-xl" aria-hidden>
                👑
              </span>
              GELIA PRO (원장님 전용)
            </Link>
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-center items-end bg-black/60">
          <div className="w-full max-w-md bg-white rounded-t-[32px] p-6 pb-10 animate-in slide-in-from-bottom-4 duration-300">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-gray-900">프로필 사진 변경</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-gray-500"><X size={22} /></button>
            </div>

            <div className="mb-6">
              <p className="mb-3 text-[13px] font-medium text-gray-500">기본 프로필 선택</p>
              <div className="flex items-center justify-between px-1">
                {['tulip', 'pearl', 'heart', 'drop'].map((type) => {
                  const isSelected = tempImg.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => setTempImg(`/avatar/default_profile_${type}.png`)}
                      className={`relative w-[68px] h-[68px] shrink-0 overflow-hidden rounded-full bg-white transition-all outline-none ${
                        isSelected
                          ? 'ring-[2.5px] ring-[#9baef3] ring-offset-[3px] ring-offset-white'
                          : 'border border-black/5'
                      }`}
                    >
                      <img
                        src={`/avatar/default_profile_${type}.png`}
                        alt={type}
                        className="w-full h-full object-cover rounded-full block bg-white"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 py-3.5 text-[14px] font-bold text-rose-500 transition-colors active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Camera size={18} /> {isUploading ? '업로드 중...' : '내 앨범에서 사진 선택'}
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />

            <div className="mb-8">
              <p className="mb-2 text-[13px] font-medium text-gray-500">닉네임 변경</p>
              <input type="text" value={tempNickname} onChange={(e) => setTempNickname(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
            </div>

            <button
              type="button"
              onClick={async () => {
                setProfileImg(tempImg);
                setNickname(tempNickname);
                setIsModalOpen(false);
                await supabase.auth.updateUser({ data: { display_name: tempNickname, avatar_url: tempImg } });
              }}
              className="w-full rounded-2xl bg-gray-900 py-4 text-[15px] font-bold text-white transition-transform active:scale-[0.98]"
            >
              닉네임 저장
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
