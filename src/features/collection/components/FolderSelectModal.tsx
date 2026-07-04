import {
  saveToDefaultUserSaves,
  useClientFoldersQuery,
  useCreateFolderMutation,
  useSaveToFolderMutation,
} from '@/features/collection/api/useClientFolderApi'
import { useCurrentUserId } from '@/features/my-page/useCurrentUserId'
import { Folder, FolderPlus, Loader2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type FolderSelectModalProps = {
  isOpen: boolean
  onClose: () => void
  nailId: string
}

export default function FolderSelectModal({ isOpen, onClose, nailId }: FolderSelectModalProps) {
  const queryClient = useQueryClient()
  const currentUserId = useCurrentUserId()
  const { data: folders = [], isLoading, isError } = useClientFoldersQuery(currentUserId)
  const createFolderMutation = useCreateFolderMutation()
  const saveToFolderMutation = useSaveToFolderMutation()

  const [newFolderName, setNewFolderName] = useState('')
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const isBusy =
    pendingAction != null || createFolderMutation.isPending || saveToFolderMutation.isPending

  useEffect(() => {
    if (!isOpen) {
      setNewFolderName('')
      setPendingAction(null)
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isBusy, isOpen, onClose])

  const handleSaveError = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : '저장에 실패했습니다.'
    window.alert(message)
  }, [])

  const handleDefaultSave = useCallback(async () => {
    if (!currentUserId) {
      window.alert('로그인이 필요한 기능입니다.')
      return
    }

    setPendingAction('default')
    try {
      await saveToDefaultUserSaves(currentUserId, nailId, queryClient)
      toast.success("'기본 저장'에 저장되었습니다.")
      onClose()
    } catch (error) {
      handleSaveError(error)
    } finally {
      setPendingAction(null)
    }
  }, [currentUserId, handleSaveError, nailId, onClose, queryClient])

  const handleFolderSelect = useCallback(
    async (folderId: string, folderName: string) => {
      if (!currentUserId) {
        window.alert('로그인이 필요한 기능입니다.')
        return
      }

      setPendingAction(folderId)
      try {
        await saveToFolderMutation.mutateAsync({ folderId, nailId })
        toast.success(`'${folderName}' 폴더에 저장되었습니다.`)
        onClose()
      } catch (error) {
        handleSaveError(error)
      } finally {
        setPendingAction(null)
      }
    },
    [currentUserId, handleSaveError, nailId, onClose, saveToFolderMutation],
  )

  const handleCreateFolderAndSave = useCallback(async () => {
    if (!currentUserId) {
      window.alert('로그인이 필요한 기능입니다.')
      return
    }

    const trimmedName = newFolderName.trim()
    if (!trimmedName) {
      window.alert('폴더 이름을 입력해 주세요.')
      return
    }

    setPendingAction('create')
    try {
      const folder = await createFolderMutation.mutateAsync({
        userId: currentUserId,
        name: trimmedName,
      })
      await saveToFolderMutation.mutateAsync({ folderId: folder.id, nailId })
      toast.success(`'${trimmedName}' 폴더에 저장되었습니다.`)
      setNewFolderName('')
      onClose()
    } catch (error) {
      handleSaveError(error)
    } finally {
      setPendingAction(null)
    }
  }, [
    createFolderMutation,
    currentUserId,
    handleSaveError,
    nailId,
    newFolderName,
    onClose,
    saveToFolderMutation,
  ])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={isBusy ? undefined : onClose}
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="folder-select-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative px-5 pt-4 pb-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 disabled:opacity-50"
            aria-label="닫기"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="mb-2 text-center">
            <h2
              id="folder-select-modal-title"
              className="mb-2 text-[20px] font-extrabold tracking-tight text-stone-900"
            >
              어느 컬렉션에 담아볼까요?
            </h2>
            <p className="break-keep text-[13px] font-medium leading-relaxed text-stone-500">
              마음에 드는 디자인을 폴더별로 모아,
              <br />
              네일샵 원장님이나 친구에게 링크로 쉽게 공유해 보세요!
            </p>
          </div>
        </div>

        <div className="max-h-[min(50vh,320px)] overflow-y-auto px-3 py-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void handleDefaultSave()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-stone-50 disabled:opacity-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF7E67]/10 text-[#FF7E67]">
              {pendingAction === 'default' ? (
                <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
              ) : (
                <span className="text-lg" aria-hidden>
                  📂
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-stone-900">기본 저장</span>
              <span className="block text-xs text-stone-500">저장한 네일 목록에 바로 담기</span>
            </span>
          </button>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-stone-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              폴더 불러오는 중…
            </div>
          ) : isError ? (
            <p className="px-3 py-6 text-center text-sm text-red-500">
              폴더 목록을 불러오지 못했습니다.
            </p>
          ) : folders.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-stone-400">
              아직 만든 폴더가 없어요. 아래에서 새 폴더를 만들어 보세요.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {folders.map((folder) => {
                const isItemPending = pendingAction === folder.id
                return (
                  <li key={folder.id}>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleFolderSelect(folder.id, folder.name)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-stone-50 disabled:opacity-50"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                        {isItemPending ? (
                          <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
                        ) : (
                          <Folder className="h-5 w-5" strokeWidth={1.75} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800">
                        {folder.name}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-stone-100 bg-stone-50/80 px-4 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !isBusy) {
                  event.preventDefault()
                  void handleCreateFolderAndSave()
                }
              }}
              placeholder="새 폴더 이름 (예: 웨딩 네일)"
              disabled={isBusy}
              maxLength={40}
              className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#FF7E67] focus:outline-none focus:ring-2 focus:ring-[#FF7E67]/20 disabled:opacity-50"
            />
            <button
              type="button"
              disabled={isBusy || !newFolderName.trim()}
              onClick={() => void handleCreateFolderAndSave()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#FF7E67] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pendingAction === 'create' ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <FolderPlus className="h-4 w-4" strokeWidth={2} />
              )}
              + 새 폴더 만들기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
