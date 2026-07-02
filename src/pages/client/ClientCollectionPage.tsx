import {
  DEFAULT_COLLECTION_FOLDER_ID,
  useClientFolderDetailQuery,
} from '@/features/collection/api/useClientFolderApi'
import { useCurrentUserId } from '@/features/my-page/useCurrentUserId'
import { useLanguageContext } from '@/contexts/LanguageContext'
import ClientGlobalHeader from '@/widgets/layout/ClientGlobalHeader'
import { supabase } from '@/shared/api/supabaseClient'
import type { NailDesignRow } from '@/shared/types/database.types'
import { ChevronLeft, Link as LinkIcon, Loader2 } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

function nailTitle(item: NailDesignRow, isEnglish: boolean): string {
  const ko = String(item.title ?? '').trim()
  const en = String(item.title_en ?? '').trim()
  return (isEnglish && en ? en : ko || en) || (isEnglish ? 'Nail Design' : '네일 디자인')
}

function CollectionNailCard({
  item,
  isEnglish,
  onOpen,
}: {
  item: NailDesignRow
  isEnglish: boolean
  onOpen: (id: string, title: string, imageUrl: string) => void
}) {
  const imageUrl = String(item.image_url ?? '').trim()
  const title = nailTitle(item, isEnglish)

  return (
    <article
      className="mb-4 break-inside-avoid cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item.id, title, imageUrl)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(item.id, title, imageUrl)
        }
      }}
    >
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-gray-100 shadow-sm">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-auto w-full object-cover transition-transform hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="aspect-[4/5] w-full bg-gray-100" aria-hidden />
        )}
      </div>
      <p className="mt-2 truncate px-1 text-center text-[13px] font-semibold text-stone-800">
        {title}
      </p>
    </article>
  )
}

export default function ClientCollectionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const currentUserId = useCurrentUserId()
  const folderId = (id ?? '').trim()
  const isDefaultFolder = folderId === DEFAULT_COLLECTION_FOLDER_ID

  const { data, isLoading, isError } = useClientFolderDetailQuery(folderId || undefined, {
    userId: currentUserId,
  })

  useEffect(() => {
    if (!isDefaultFolder) return

    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login', { replace: true })
      }
    }

    void checkAuth()
  }, [isDefaultFolder, navigate])

  const handleShare = useCallback(async () => {
    const url = window.location.href
    const shareTitle = data?.folder.name ?? (isEnglish ? 'GELIA Collection' : '젤리아 컬렉션')

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: shareTitle,
          text: isEnglish
            ? 'Check out this nail collection on GELIA.'
            : '젤리아에서 이 네일 컬렉션을 확인해 보세요.',
          url,
        })
        return
      }

      await navigator.clipboard.writeText(url)
      toast.success(isEnglish ? 'Share link copied!' : '공유 링크가 복사되었습니다!')
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        toast.success(isEnglish ? 'Share link copied!' : '공유 링크가 복사되었습니다!')
      } catch {
        window.alert(isEnglish ? 'Failed to copy the link.' : '링크 복사에 실패했습니다.')
      }
    }
  }, [data?.folder.name, isEnglish])

  const openDetail = useCallback(
    (nailId: string, title: string, imageUrl: string) => {
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
    },
    [navigate],
  )

  const folder = data?.folder
  const nails = data?.nails ?? []
  const nailCount = nails.length

  return (
    <div className="min-h-screen w-full bg-[#fdfaf7] md:bg-white">
      <ClientGlobalHeader showBackButton />
      <main className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:px-8 md:pt-10">
        <div className="mb-6 flex w-full items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 pr-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="-ml-2 flex cursor-pointer items-center justify-center rounded-full p-1.5 text-stone-800 transition-colors hover:bg-stone-100 md:hidden"
              aria-label={isEnglish ? 'Go back' : '뒤로 가기'}
            >
              <ChevronLeft size={26} strokeWidth={2.5} />
            </button>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEnglish ? 'Loading…' : '불러오는 중…'}
              </div>
            ) : folder ? (
              <div className="flex min-w-0 items-baseline gap-2">
                <h1 className="truncate text-[20px] font-bold tracking-tight text-stone-900">
                  {folder.name}
                </h1>
                <span className="shrink-0 text-[15px] font-medium text-stone-500">
                  {isEnglish ? (
                    <>
                      (Total{' '}
                      <span className="font-semibold text-orange-500">{nailCount}</span> designs)
                    </>
                  ) : (
                    <>
                      (총 <span className="font-semibold text-orange-500">{nailCount}</span>개)
                    </>
                  )}
                </span>
              </div>
            ) : (
              <h1 className="truncate text-[20px] font-bold tracking-tight text-stone-900">
                {isEnglish ? 'Collection' : '컬렉션'}
              </h1>
            )}
          </div>

          <button
            type="button"
            onClick={() => void handleShare()}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-[13px] font-medium text-stone-700 transition-all hover:bg-stone-50"
          >
            <LinkIcon size={14} className="text-stone-500" strokeWidth={2.25} aria-hidden />
            {isEnglish ? 'Copy Share Link' : '공유 링크 복사'}
          </button>
        </div>

        {isLoading ? (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={`collection-skel-${index}`}
                className="mb-4 aspect-[4/5] break-inside-avoid animate-pulse rounded-2xl bg-gray-100"
                aria-hidden
              />
            ))}
          </div>
        ) : isError || !folder ? (
          <p className="py-12 text-center text-sm text-stone-500">
            {isEnglish ? 'Failed to load this collection.' : '컬렉션을 불러오지 못했어요.'}
          </p>
        ) : nails.length === 0 ? (
          <p className="py-12 text-center text-sm text-stone-500">
            {isEnglish ? 'No designs in this folder yet.' : '이 폴더에 담긴 디자인이 아직 없어요.'}
          </p>
        ) : (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {nails.map((item) => (
              <CollectionNailCard
                key={item.id}
                item={item}
                isEnglish={isEnglish}
                onOpen={openDetail}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
