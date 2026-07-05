import {
  DEFAULT_COLLECTION_FOLDER_ID,
  useClientFolderDetailQuery,
  useDeleteFolderMutation,
  useMakeFolderPublicMutation,
  useRemoveFolderItemsMutation,
} from '@/features/collection/api/useClientFolderApi'
import { useDeleteDefaultSavesMutation } from '@/features/nail-activity/api/useClientActivityApi'
import { useCurrentUserId } from '@/features/my-page/useCurrentUserId'
import { useLanguageContext } from '@/contexts/LanguageContext'
import ClientGlobalHeader from '@/widgets/layout/ClientGlobalHeader'
import { supabase } from '@/shared/api/supabaseClient'
import type { NailDesignRow } from '@/shared/types/database.types'
import { CheckCircle2, ChevronLeft, Link as LinkIcon, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
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
  isEditing,
  isSelected,
  onInteract,
}: {
  item: NailDesignRow
  isEnglish: boolean
  isEditing: boolean
  isSelected: boolean
  onInteract: (id: string, title: string, imageUrl: string) => void
}) {
  const imageUrl = String(item.image_url ?? '').trim()
  const title = nailTitle(item, isEnglish)

  return (
    <article
      className={`mb-4 break-inside-avoid cursor-pointer ${isEditing && isSelected ? 'rounded-2xl ring-2 ring-stone-800 ring-offset-2' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onInteract(item.id, title, imageUrl)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onInteract(item.id, title, imageUrl)
        }
      }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-gray-100 shadow-sm">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className={`h-auto w-full object-cover ${isEditing ? '' : 'transition-transform hover:scale-[1.02]'}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="aspect-[4/5] w-full bg-gray-100" aria-hidden />
        )}
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

  const [isEditing, setIsEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading, isError } = useClientFolderDetailQuery(folderId || undefined, {
    userId: currentUserId,
  })
  const makeFolderPublicMutation = useMakeFolderPublicMutation()
  const deleteFolderMutation = useDeleteFolderMutation()
  const removeFolderItemsMutation = useRemoveFolderItemsMutation()
  const deleteDefaultSavesMutation = useDeleteDefaultSavesMutation()

  const folder = data?.folder
  const nails = data?.nails ?? []
  const nailCount = nails.length

  const isOwner =
    Boolean(currentUserId) && Boolean(folder) && folder!.user_id === currentUserId
  const canDeleteFolder = isOwner && !isDefaultFolder

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

  useEffect(() => {
    setIsEditing(false)
    setSelectedIds([])
  }, [folderId])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setSelectedIds([])
  }, [])

  const handleShare = useCallback(async () => {
    const url = window.location.href
    const shareTitle = folder?.name ?? (isEnglish ? 'GELIA Collection' : '젤리아 컬렉션')

    try {
      if (!isDefaultFolder && folderId && isOwner) {
        await makeFolderPublicMutation.mutateAsync({ folderId })
      }

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
  }, [folder?.name, folderId, isDefaultFolder, isEnglish, isOwner, makeFolderPublicMutation])

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

  const handleCardInteract = useCallback(
    (nailId: string, title: string, imageUrl: string) => {
      if (isEditing) {
        setSelectedIds((prev) =>
          prev.includes(nailId) ? prev.filter((id) => id !== nailId) : [...prev, nailId],
        )
        return
      }
      openDetail(nailId, title, imageUrl)
    },
    [isEditing, openDetail],
  )

  const handleDeleteFolder = useCallback(async () => {
    if (!folderId || isDefaultFolder) return

    const confirmed = window.confirm(
      isEnglish ? 'Are you sure you want to delete this folder?' : '정말 이 폴더를 삭제하시겠습니까?',
    )
    if (!confirmed) return

    if (!currentUserId) {
      window.alert(isEnglish ? 'Please sign in to delete this folder.' : '폴더를 삭제하려면 로그인이 필요합니다.')
      return
    }

    try {
      await deleteFolderMutation.mutateAsync({ folderId, userId: currentUserId })
      toast.success(isEnglish ? 'Folder deleted.' : '폴더가 삭제되었습니다.')
      navigate('/my', { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : '폴더 삭제에 실패했습니다.'
      window.alert(message)
    }
  }, [currentUserId, deleteFolderMutation, folderId, isDefaultFolder, isEnglish, navigate])

  const handleRemoveSelected = useCallback(async () => {
    if (!currentUserId || selectedIds.length === 0) return

    const confirmed = window.confirm(
      isEnglish
        ? `Are you sure you want to remove ${selectedIds.length} selected items?`
        : `선택한 ${selectedIds.length}개의 네일 디자인을 정말 빼시겠습니까?`,
    )
    if (!confirmed) return

    const isRemoving =
      removeFolderItemsMutation.isPending || deleteDefaultSavesMutation.isPending
    if (isRemoving) return

    try {
      if (isDefaultFolder) {
        await deleteDefaultSavesMutation.mutateAsync({
          userId: currentUserId,
          nailIds: selectedIds,
        })
      } else {
        await removeFolderItemsMutation.mutateAsync({
          folderId,
          nailIds: selectedIds,
        })
      }
      toast.success(
        isEnglish
          ? `Removed ${selectedIds.length} design(s).`
          : `${selectedIds.length}개의 디자인을 폴더에서 뺐어요.`,
      )
      setIsEditing(false)
      setSelectedIds([])
    } catch (error) {
      const message = error instanceof Error ? error.message : '삭제에 실패했습니다.'
      window.alert(message)
    }
  }, [
    currentUserId,
    deleteDefaultSavesMutation,
    folderId,
    isDefaultFolder,
    isEnglish,
    removeFolderItemsMutation,
    selectedIds,
  ])

  const isRemovePending =
    removeFolderItemsMutation.isPending || deleteDefaultSavesMutation.isPending
  const isFolderDeletePending = deleteFolderMutation.isPending

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

          <div className="flex shrink-0 items-center gap-2">
            {canDeleteFolder ? (
              <button
                type="button"
                onClick={() => void handleDeleteFolder()}
                disabled={isFolderDeletePending}
                className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-1.5 text-[13px] font-medium text-red-500 shadow-sm transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isEnglish ? '🗑️ Delete Folder' : '🗑️ 폴더 삭제'}
              </button>
            ) : null}
          </div>
        </div>

        {canDeleteFolder && folder ? (
          <div className="mb-8 flex w-full flex-col">
            <button
              type="button"
              onClick={() => void handleShare()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-4 text-[15px] font-semibold text-stone-800 shadow-sm transition-colors hover:bg-stone-50"
            >
              <LinkIcon className="h-5 w-5 text-stone-500" strokeWidth={2.25} aria-hidden />
              컬렉션 링크 공유하기
            </button>
            <p className="mt-3 text-center text-[12px] text-stone-500 tracking-wide">
              💡 좋아하는 디자인을 모아 간편하게 전달해 보세요.
            </p>
          </div>
        ) : null}

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
          <>
            {isOwner ? (
              <div className="mb-4 flex items-center justify-end gap-3">
                <div className="flex shrink-0 items-center gap-2">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-[13px] font-medium text-stone-600 shadow-sm transition-all hover:bg-stone-50"
                    >
                      {isEnglish ? 'Edit' : '편집'}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleRemoveSelected()}
                        disabled={selectedIds.length === 0 || isRemovePending}
                        className={[
                          'rounded-full px-4 py-1.5 text-[13px] font-medium transition-all',
                          selectedIds.length > 0
                            ? 'bg-red-500 text-white shadow-sm hover:bg-red-600'
                            : 'cursor-not-allowed bg-stone-200 text-stone-400',
                        ].join(' ')}
                      >
                        {isEnglish
                          ? `Remove (${selectedIds.length})`
                          : `빼기 (${selectedIds.length})`}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isRemovePending}
                        className="rounded-full bg-stone-100 px-4 py-1.5 text-[13px] font-medium text-stone-600 transition-all hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isEnglish ? 'Cancel' : '취소'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : null}

            <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
              {nails.map((item) => (
                <CollectionNailCard
                  key={item.id}
                  item={item}
                  isEnglish={isEnglish}
                  isEditing={isEditing && isOwner}
                  isSelected={selectedIds.includes(item.id)}
                  onInteract={handleCardInteract}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
