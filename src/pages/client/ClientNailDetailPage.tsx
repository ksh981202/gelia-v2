import { Bookmark, ChevronLeft, Heart, Share2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useNailDetailQuery } from '../../entities/nail-design/api/useNailDetailQuery'
import { useUserStore } from '../../features/user-actions/useUserStore'
import { supabase } from '../../shared/api/supabaseClient'
import { PageContainer } from '../../shared/ui/PageContainer'

export default function ClientNailDetailPage() {
  const { nailId } = useParams<{ nailId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isPending, isError } = useNailDetailQuery(nailId)

  const likedNails = useUserStore((s) => s.likedNails)
  const savedNails = useUserStore((s) => s.savedNails)
  const toggleLike = useUserStore((s) => s.toggleLike)
  const toggleSave = useUserStore((s) => s.toggleSave)

  const [shareHint, setShareHint] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleLike = useCallback(async () => {
    if (!data?.id) return
    const id = data.id
    const wasLiked = useUserStore.getState().likedNails.includes(id)
    const increment = wasLiked ? -1 : 1
    setActionError(null)
    toggleLike(id)
    try {
      const { error } = await supabase.rpc('increment_popularity', {
        nail_id: id,
        increment_value: increment,
      })
      if (error) throw error
      await queryClient.invalidateQueries({
        queryKey: ['nail-design', 'detail', 'supabase', nailId],
      })
    } catch (e) {
      toggleLike(id)
      setActionError(
        e instanceof Error ? e.message : '좋아요 반영에 실패했습니다.',
      )
    }
  }, [data, nailId, queryClient, toggleLike])

  const handleSave = useCallback(async () => {
    if (!data?.id) return
    const id = data.id
    const wasSaved = useUserStore.getState().savedNails.includes(id)
    const increment = wasSaved ? -1 : 1
    setActionError(null)
    toggleSave(id)
    try {
      const { error } = await supabase.rpc('increment_saves', {
        nail_id: id,
        increment_value: increment,
      })
      if (error) throw error
      await queryClient.invalidateQueries({
        queryKey: ['nail-design', 'detail', 'supabase', nailId],
      })
    } catch (e) {
      toggleSave(id)
      setActionError(
        e instanceof Error ? e.message : '저장 반영에 실패했습니다.',
      )
    }
  }, [data, nailId, queryClient, toggleSave])

  const handleShare = useCallback(async () => {
    setShareHint(null)
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setShareHint('링크가 클립보드에 복사되었습니다.')
    } catch {
      setShareHint('복사에 실패했습니다. 주소창의 URL을 직접 복사해 주세요.')
    }
  }, [])

  const liked = data ? likedNails.includes(data.id) : false
  const saved = data ? savedNails.includes(data.id) : false

  return (
    <PageContainer className="max-w-2xl">
      <div className="flex flex-col gap-0 pb-12">
        <div className="sticky top-0 z-10 -mx-4 mb-2 flex items-center border-b border-gelia-line/60 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-gelia-lineDark dark:bg-neutral-950/75 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <button
            type="button"
            onClick={() => {
              navigate(-1)
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200/90 bg-white/90 text-neutral-800 shadow-sm ring-1 ring-black/[0.03] transition hover:border-primary/25 hover:bg-white hover:text-primary dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-100 dark:hover:border-primary/40"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {isPending && (
          <div className="flex flex-col gap-6 pt-2" aria-busy="true">
            <div className="mx-auto w-full max-w-2xl">
              <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-neutral-200 shadow-inner dark:bg-neutral-800" />
            </div>
            <div className="h-9 w-4/5 max-w-md animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-20 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-7 w-24 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="h-14 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-14 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-14 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <p className="text-sm font-medium text-gelia-muted dark:text-gelia-mutedDark">
              로딩 중…
            </p>
          </div>
        )}

        {isError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            정보를 불러오지 못했습니다. 다시 시도해 주세요.
          </p>
        )}

        {!isPending && !isError && data == null && (
          <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300">
            해당 네일 디자인을 찾을 수 없습니다.
          </p>
        )}

        {!isPending && !isError && data != null && (
          <>
            <div className="mx-auto w-full max-w-2xl pt-1">
              <div className="overflow-hidden rounded-2xl bg-neutral-100 shadow-lg shadow-primary/10 ring-1 ring-black/[0.04] dark:bg-neutral-900 dark:ring-white/10">
                <img
                  src={data.image_url}
                  alt=""
                  width={800}
                  height={800}
                  loading="eager"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            </div>

            <div className="mt-8 space-y-5 px-0.5">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-neutral-50">
                {data.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {data.category ? (
                  <span className="inline-flex max-w-full items-center rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary dark:bg-primary/20">
                    <span className="truncate">{data.category}</span>
                  </span>
                ) : null}
                {data.tags.map((tag, index) => (
                  <span
                    key={`${data.id}-${tag}-${index}`}
                    className="inline-flex max-w-[12rem] items-center truncate rounded-full border border-gelia-line bg-white px-3 py-1 text-xs font-medium text-neutral-600 dark:border-gelia-lineDark dark:bg-neutral-900/80 dark:text-neutral-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {actionError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                {actionError}
              </p>
            )}

            <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  void handleLike()
                }}
                className={
                  liked
                    ? 'inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-100/90 dark:border-red-900/40 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/50'
                    : 'inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900'
                }
                aria-pressed={liked}
                aria-label="좋아요"
              >
                <Heart
                  className={
                    liked
                      ? 'h-6 w-6 shrink-0 fill-red-500 text-red-500'
                      : 'h-6 w-6 shrink-0 text-neutral-400 [&>path]:stroke-[1.75]'
                  }
                  aria-hidden
                />
                <span className="tabular-nums tracking-tight">
                  {data.popularity.toLocaleString('ko-KR')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSave()
                }}
                className={
                  saved
                    ? 'inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-xl border border-primary/35 bg-primary/10 px-4 py-3.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/[0.14] dark:border-primary/40 dark:bg-primary/15 dark:hover:bg-primary/20'
                    : 'inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900'
                }
                aria-pressed={saved}
                aria-label="저장"
              >
                <Bookmark
                  className={
                    saved
                      ? 'h-6 w-6 shrink-0 fill-primary text-primary'
                      : 'h-6 w-6 shrink-0 text-neutral-400 [&>path]:stroke-[1.75]'
                  }
                  aria-hidden
                />
                <span className="tabular-nums tracking-tight">
                  {data.saves.toLocaleString('ko-KR')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleShare()
                }}
                className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-primary/25 hover:bg-primary/[0.04] dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900"
                aria-label="공유하기"
              >
                <Share2
                  className="h-6 w-6 shrink-0 text-neutral-400 [&>path]:stroke-[1.75]"
                  aria-hidden
                />
                <span>공유</span>
              </button>
            </div>
            {shareHint && (
              <p className="mt-2 rounded-lg bg-neutral-100 px-3 py-2 text-center text-xs font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                {shareHint}
              </p>
            )}
          </>
        )}
      </div>
    </PageContainer>
  )
}
