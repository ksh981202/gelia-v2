import {
  CLIENT_FOLDER_DETAIL_QUERY_KEY,
  DEFAULT_COLLECTION_FOLDER_ID,
  DEFAULT_SAVE_COVER_QUERY_KEY,
} from '@/features/collection/api/useClientFolderApi'
import { supabase } from '@/shared/api/supabaseClient'
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'

function normalizeNailIds(nailIds: string[]): string[] {
  return [...new Set(nailIds.map((id) => id.trim()).filter(Boolean))]
}

function invalidateRecentActivityQueries(queryClient: QueryClient, userId: string) {
  void queryClient.invalidateQueries({ queryKey: ['my-page-count', 'recent', userId] })
  void queryClient.invalidateQueries({ queryKey: ['my-page-gallery', 'recent', userId] })
  void queryClient.invalidateQueries({ queryKey: ['my-nail-list', 'recent', userId] })
}

function invalidateLikedActivityQueries(queryClient: QueryClient, userId: string) {
  void queryClient.invalidateQueries({ queryKey: ['my-page-count', 'liked', userId] })
  void queryClient.invalidateQueries({ queryKey: ['my-page-gallery', 'liked', userId] })
  void queryClient.invalidateQueries({ queryKey: ['my-nail-list', 'liked', userId] })
}

function invalidateSavedActivityQueries(queryClient: QueryClient, userId: string) {
  void queryClient.invalidateQueries({ queryKey: ['my-page-count', 'saved', userId] })
  void queryClient.invalidateQueries({ queryKey: ['my-page-gallery', 'saved', userId] })
  void queryClient.invalidateQueries({ queryKey: ['my-nail-list', 'saved', userId] })
  void queryClient.invalidateQueries({ queryKey: [DEFAULT_SAVE_COVER_QUERY_KEY, userId] })
  void queryClient.invalidateQueries({
    queryKey: [CLIENT_FOLDER_DETAIL_QUERY_KEY, DEFAULT_COLLECTION_FOLDER_ID, userId],
  })
}

export function useDeleteRecentViewsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      nailIds,
    }: {
      userId: string
      nailIds: string[]
    }): Promise<void> => {
      const trimmedUserId = userId.trim()
      const normalizedNailIds = normalizeNailIds(nailIds)
      if (!trimmedUserId || normalizedNailIds.length === 0) {
        throw new Error('삭제할 항목 정보가 올바르지 않습니다.')
      }

      const { error } = await supabase
        .from('user_recent_views')
        .delete()
        .eq('user_id', trimmedUserId)
        .in('nail_id', normalizedNailIds)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      invalidateRecentActivityQueries(queryClient, variables.userId)
    },
  })
}

export function useDeleteLikesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      nailIds,
    }: {
      userId: string
      nailIds: string[]
    }): Promise<void> => {
      const trimmedUserId = userId.trim()
      const normalizedNailIds = normalizeNailIds(nailIds)
      if (!trimmedUserId || normalizedNailIds.length === 0) {
        throw new Error('삭제할 항목 정보가 올바르지 않습니다.')
      }

      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', trimmedUserId)
        .in('nail_id', normalizedNailIds)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      invalidateLikedActivityQueries(queryClient, variables.userId)
    },
  })
}

export function useDeleteDefaultSavesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      nailIds,
    }: {
      userId: string
      nailIds: string[]
    }): Promise<void> => {
      const trimmedUserId = userId.trim()
      const normalizedNailIds = normalizeNailIds(nailIds)
      if (!trimmedUserId || normalizedNailIds.length === 0) {
        throw new Error('삭제할 항목 정보가 올바르지 않습니다.')
      }

      const { error } = await supabase
        .from('user_saves')
        .delete()
        .eq('user_id', trimmedUserId)
        .in('nail_id', normalizedNailIds)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      invalidateSavedActivityQueries(queryClient, variables.userId)
    },
  })
}
