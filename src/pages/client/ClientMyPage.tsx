import { useLanguageContext } from '@/contexts/LanguageContext'
import { fetchNailDesignsByIds } from '@/entities/nail-design/api/fetchNailDesignsByIds'
import { useCurrentUserId } from '@/features/my-page/useCurrentUserId'
import {
  getLikedNailsCount,
  LIKED_NAILS_CHANGED_EVENT,
  readLikedNailEntries,
} from '@/shared/lib/likedNailsStorage'
import {
  readRecentViewedIds,
  RECENT_VIEWED_CHANGED_EVENT,
} from '@/shared/lib/recentViewedStorage'
import {
  getSavedNailsCount,
  readSavedNailEntries,
  SAVED_NAILS_CHANGED_EVENT,
} from '@/shared/lib/savedNailsStorage'
import { supabase } from '@/shared/api/supabaseClient'
import { useQuery } from '@tanstack/react-query'
import { Bell, Bookmark, Camera, Heart, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type ActiveTab = 'recent' | 'liked' | 'saved'

const GALLERY_PREVIEW_LIMIT = 4

const tabLabels: Record<ActiveTab, { ko: string; en: string }> = {
  recent: { ko: '최근 본 디자인', en: 'Recently Viewed' },
  liked: { ko: '좋아요 한 네일', en: 'Liked Nails' },
  saved: { ko: '저장한 네일', en: 'Saved Nails' },
}

function galleryIdsForTab(tab: ActiveTab, userId: string | null): string[] {
  if (tab === 'recent') {
    return readRecentViewedIds(userId).slice(0, GALLERY_PREVIEW_LIMIT)
  }
  if (tab === 'liked') {
    return readLikedNailEntries(userId)
      .sort((a, b) => b.likedAt.localeCompare(a.likedAt))
      .map((e) => e.id)
      .slice(0, GALLERY_PREVIEW_LIMIT)
  }
  return readSavedNailEntries(userId)
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .map((e) => e.id)
    .slice(0, GALLERY_PREVIEW_LIMIT)
}

export default function ClientMyPage() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const navigate = useNavigate()
  const currentUserId = useCurrentUserId()
  const [activeTab, setActiveTab] = useState<ActiveTab>('recent')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [profileImg, setProfileImg] = useState('/avatar/default_profile_heart.png')
  const [tempImg, setTempImg] = useState('/avatar/default_profile_heart.png')
  const [recentCount, setRecentCount] = useState(0)
  const [likedCount, setLikedCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)

  const statBoxClass =
    'flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl px-1 sm:px-1.5 transition-[box-shadow,background-color]'
  const activeTabLabel = isEnglish ? tabLabels[activeTab].en : tabLabels[activeTab].ko

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

  const syncCounts = useCallback(() => {
    setRecentCount(readRecentViewedIds(currentUserId).slice(0, 20).length)
    setLikedCount(getLikedNailsCount(currentUserId))
    setSavedCount(getSavedNailsCount(currentUserId))
  }, [currentUserId])

  useEffect(() => {
    syncCounts()
    const onChanged = () => syncCounts()
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
  }, [syncCounts])

  const galleryIds = useMemo(
    () => galleryIdsForTab(activeTab, currentUserId),
    [activeTab, currentUserId, recentCount, likedCount, savedCount],
  )

  const { data: galleryNails = [] } = useQuery({
    queryKey: ['my-page-gallery', activeTab, currentUserId, galleryIds],
    queryFn: () => fetchNailDesignsByIds(galleryIds),
    enabled: galleryIds.length > 0,
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
          onClick={() => navigate('/client/notification-list')}
        >
          <Bell className="h-6 w-6 text-current" strokeWidth={2} />
          <span className="absolute right-1.5 top-1.5 h-[9px] w-[9px] rounded-full border-[2px] border-white bg-red-500" />
        </button>
      </header>

      <main className="pb-24">
        <section className="flex flex-col items-center py-10 border-b border-gray-50">
          <div
            className="relative h-[100px] w-[100px] shrink-0 cursor-pointer overflow-hidden rounded-full shadow-sm ring-[3px] ring-rose-100/80 ring-offset-2 ring-offset-white"
            onClick={() => {
              setTempImg(profileImg)
              setIsModalOpen(true)
            }}
          >
            <img
              src={profileImg}
              alt="프로필"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div className="mt-4 text-xl font-bold text-gray-900">네일리버</div>
          <span className="mt-1.5 inline-flex items-center justify-center rounded-full bg-rose-50 px-3.5 py-1 text-center text-[13px] font-semibold text-rose-400">
            좋은 하루 보내세요 🌷
          </span>
        </section>

        <section className="grid grid-cols-3 gap-3 px-5 mt-8 mb-10">
          <button
            type="button"
            className={`${statBoxClass} ${activeTab === "recent" ? "ring-2 ring-gray-400 ring-offset-2 bg-gray-100" : "bg-gray-50 border border-gray-100"}`}
            onClick={() => setActiveTab("recent")}
          >
            <span className="flex h-8 w-8 items-center justify-center text-[22px]" aria-hidden>⏱️</span>
            <span className="text-[22px] font-extrabold tabular-nums leading-none text-gray-800">{recentCount}</span>
            <span className="text-[13px] font-semibold text-gray-600">{isEnglish ? 'Recently Viewed' : '최근 본 디자인'}</span>
          </button>
          
          <button
            type="button"
            className={`${statBoxClass} ${activeTab === "liked" ? "ring-2 ring-rose-400 ring-offset-2 bg-rose-100" : "bg-rose-50 border border-rose-100"}`}
            onClick={() => setActiveTab("liked")}
          >
            <Heart className="h-7 w-7 fill-rose-500 text-rose-500" strokeWidth={1.5} aria-hidden />
            <span className="text-[22px] font-extrabold tabular-nums leading-none text-rose-500">{likedCount}</span>
            <span className="text-[13px] font-semibold text-rose-500">{isEnglish ? 'Liked Nails' : '좋아요 한 네일'}</span>
          </button>

          <button
            type="button"
            className={`${statBoxClass} ${activeTab === "saved" ? "ring-2 ring-indigo-400 ring-offset-2 bg-indigo-100" : "bg-indigo-50 border border-indigo-100"}`}
            onClick={() => setActiveTab("saved")}
          >
            <Bookmark className="h-[26px] w-[26px] text-indigo-500" strokeWidth={2.5} aria-hidden />
            <span className="text-[22px] font-extrabold tabular-nums leading-none text-indigo-500">{savedCount}</span>
            <span className="text-[13px] font-semibold text-indigo-500">{isEnglish ? 'Saved Nails' : '저장한 네일'}</span>
          </button>
        </section>

        <section className="mb-12">
          <div className="mb-5 flex items-center justify-between px-5">
            <h2 className="text-lg font-bold text-gray-900">
              {activeTabLabel}
            </h2>
            <button
              type="button"
              className="text-sm font-medium text-gray-500"
              onClick={() => navigate(`/client/my/list/${activeTab}`)}
            >
              {isEnglish ? 'View All >' : '전체보기 >'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 px-5">
            {galleryNails.map((item) => {
              const titleKo = String(item.title ?? '').trim()
              const titleEn = String(item.title_en ?? '').trim()
              const title = (isEnglish && titleEn ? titleEn : titleKo) || titleEn || (isEnglish ? 'Nail Design' : '네일 디자인')
              const imageUrl = String(item.image_url ?? '').trim()
              return (
                <article
                  key={item.id}
                  className="flex flex-col cursor-pointer"
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
                  <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 border border-black/5 shadow-sm">
                    {imageUrl ? (
                      <img src={imageUrl} alt={title} className="h-full w-full object-cover transition-transform hover:scale-105" />
                    ) : null}
                  </div>
                  <div className="mt-2.5 flex w-full flex-col items-center justify-center">
                    <span className="w-full text-center text-sm font-medium tracking-tight text-gray-800 line-clamp-1">
                      {title}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="pt-4">
          <div className="mb-8">
            <div className="text-[13px] font-bold text-gray-400 mb-2 px-5">{isEnglish ? 'Preferences' : '맞춤 설정'}</div>
            <button
              type="button"
              className="w-full flex items-center justify-between py-4 px-5 bg-white border-b border-gray-50 active:bg-gray-50"
              onClick={() => navigate('/client/notifications')}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔔</span>
                <span className="text-[15px] font-semibold text-gray-800">{isEnglish ? 'Notification Settings' : '알림 설정'}</span>
              </div>
              <span className="text-gray-300 font-bold">{">"}</span>
            </button>
          </div>
          
          <div className="mb-8">
            <div className="text-[13px] font-bold text-gray-400 mb-2 px-5">{isEnglish ? 'Account' : '계정'}</div>
            <button
              type="button"
              className="w-full flex items-center justify-between py-4 px-5 bg-white border-b border-gray-50 active:bg-gray-50"
              onClick={() => navigate('/client/account')}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚙️</span>
                <span className="text-[15px] font-semibold text-gray-800">{isEnglish ? 'Account Management' : '계정 관리'}</span>
              </div>
              <span className="text-gray-300 font-bold">{">"}</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-between py-4 px-5 bg-white border-b border-gray-50 active:bg-gray-50"
              onClick={() => navigate('/client/support')}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🎧</span>
                <span className="text-[15px] font-semibold text-gray-800">{isEnglish ? 'Customer Service / Notice' : '고객센터 / 공지사항'}</span>
              </div>
              <span className="text-gray-300 font-bold">{">"}</span>
            </button>
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
                      className={`relative w-[68px] h-[68px] shrink-0 rounded-full transition-all outline-none ${
                        isSelected
                          ? 'ring-[2.5px] ring-[#9baef3] ring-offset-[3px] ring-offset-white'
                          : 'border border-black/5'
                      }`}
                    >
                      <img
                        src={`/avatar/default_profile_${type}.png`}
                        alt={type}
                        className="w-full h-full object-cover rounded-full block"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="button" className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 py-3.5 text-[14px] font-bold text-rose-500 transition-colors active:bg-rose-100">
              <Camera size={18} /> 내 앨범에서 사진 선택
            </button>

            <div className="mb-8">
              <p className="mb-2 text-[13px] font-medium text-gray-500">닉네임 변경</p>
              <input type="text" defaultValue="수정가" className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" />
            </div>

            <button
              type="button"
              onClick={() => {
                setProfileImg(tempImg);
                setIsModalOpen(false);
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
