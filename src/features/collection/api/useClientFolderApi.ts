import { trackNailActivity } from '@/features/nail-activity/trackNailActivity'
import { supabase } from '@/shared/api/supabaseClient'
import type { NailDesignRow } from '@/shared/types/database.types'
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'

export type ClientFolderRow = {
  id: string
  user_id: string
  name: string
  is_public: boolean
  created_at: string
}

export const CLIENT_FOLDERS_QUERY_KEY = 'client-folders'
export const CLIENT_FOLDER_DETAIL_QUERY_KEY = 'client-folder-detail'
export const DEFAULT_COLLECTION_FOLDER_ID = 'default'
export const CLIENT_FOLDER_COVERS_QUERY_KEY = 'client-folder-covers'
export const DEFAULT_SAVE_COVER_QUERY_KEY = 'default-save-cover'

const NAIL_DETAIL_QUERY_KEY_PREFIX = ['nail-design', 'detail', 'supabase'] as const

async function incrementNailSavesCount(nailId: string): Promise<void> {
  const trimmedNailId = nailId.trim()
  if (!trimmedNailId) return

  const { error } = await supabase.rpc('increment_saves', {
    nail_id: trimmedNailId,
    increment_value: 1,
  })
  if (error) throw error
}

export function invalidateNailDetailQuery(queryClient: QueryClient, nailId: string): void {
  const trimmedNailId = nailId.trim()
  if (!trimmedNailId) return

  void queryClient.invalidateQueries({
    queryKey: [...NAIL_DETAIL_QUERY_KEY_PREFIX, trimmedNailId],
  })
}

const CLIENT_FOLDER_COLUMNS = 'id,user_id,name,is_public,created_at'
const FOLDER_NAIL_COLUMNS = 'id,title,title_en,image_url,category'
const COVER_NAIL_COLUMNS = 'id,image_url'

async function fetchNailCoverImage(nailId: string): Promise<string | null> {
  const trimmedId = nailId.trim()
  if (!trimmedId) return null

  const { data, error } = await supabase
    .from('nail_designs')
    .select(COVER_NAIL_COLUMNS)
    .eq('id', trimmedId)
    .maybeSingle()

  if (error) throw error
  return String(data?.image_url ?? '').trim() || null
}

export type ClientFolderDetail = {
  folder: ClientFolderRow
  nails: NailDesignRow[]
}

export function useClientFoldersQuery(userId: string | null) {
  return useQuery({
    queryKey: [CLIENT_FOLDERS_QUERY_KEY, userId],
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
    queryFn: async (): Promise<ClientFolderRow[]> => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('client_folders')
        .select(CLIENT_FOLDER_COLUMNS)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as ClientFolderRow[]
    },
  })
}

export function useClientFolderDetailQuery(
  folderId: string | undefined,
  options?: { userId?: string | null },
) {
  const normalizedId = folderId?.trim() ?? ''
  const isDefaultFolder = normalizedId === DEFAULT_COLLECTION_FOLDER_ID
  const userId = options?.userId ?? null

  return useQuery({
    queryKey: [CLIENT_FOLDER_DETAIL_QUERY_KEY, normalizedId, isDefaultFolder ? userId : null],
    enabled: Boolean(normalizedId) && (!isDefaultFolder || Boolean(userId)),
    staleTime: 60 * 1000,
    queryFn: async (): Promise<ClientFolderDetail | null> => {
      if (isDefaultFolder) {
        if (!userId) return null

        const { data: activityRows, error: activityError } = await supabase
          .from('user_saves')
          .select('nail_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (activityError) throw activityError

        const nailIds =
          activityRows
            ?.map((row) => String((row as { nail_id?: unknown }).nail_id ?? '').trim())
            .filter(Boolean) ?? []

        let nails: NailDesignRow[] = []
        if (nailIds.length > 0) {
          const { data: nailRows, error: nailError } = await supabase
            .from('nail_designs')
            .select(FOLDER_NAIL_COLUMNS)
            .in('id', nailIds)

          if (nailError) throw nailError

          const byId = new Map<string, NailDesignRow>()
          for (const row of nailRows ?? []) {
            const id = String(row.id ?? '').trim()
            if (id) byId.set(id, row as NailDesignRow)
          }

          nails = nailIds
            .map((id) => byId.get(id))
            .filter((row): row is NailDesignRow => Boolean(row))
        }

        const virtualFolder: ClientFolderRow = {
          id: DEFAULT_COLLECTION_FOLDER_ID,
          user_id: userId,
          name: '기본 보관함',
          is_public: false,
          created_at: new Date(0).toISOString(),
        }

        return { folder: virtualFolder, nails }
      }

      const { data: folder, error: folderError } = await supabase
        .from('client_folders')
        .select(CLIENT_FOLDER_COLUMNS)
        .eq('id', normalizedId)
        .maybeSingle()

      if (folderError) throw folderError
      if (!folder) return null

      const { data: itemRows, error: itemsError } = await supabase
        .from('client_folder_items')
        .select('nail_id, created_at')
        .eq('folder_id', normalizedId)
        .order('created_at', { ascending: false })

      if (itemsError) throw itemsError

      const nailIds =
        itemRows
          ?.map((row) => String((row as { nail_id?: unknown }).nail_id ?? '').trim())
          .filter(Boolean) ?? []

      if (nailIds.length === 0) {
        return { folder: folder as ClientFolderRow, nails: [] }
      }

      const { data: nailRows, error: nailError } = await supabase
        .from('nail_designs')
        .select(FOLDER_NAIL_COLUMNS)
        .in('id', nailIds)

      if (nailError) throw nailError

      const byId = new Map<string, NailDesignRow>()
      for (const row of nailRows ?? []) {
        const id = String(row.id ?? '').trim()
        if (id) byId.set(id, row as NailDesignRow)
      }

      const nails = nailIds
        .map((id) => byId.get(id))
        .filter((row): row is NailDesignRow => Boolean(row))

      return {
        folder: folder as ClientFolderRow,
        nails,
      }
    },
  })
}

export function useDefaultSaveCoverQuery(userId: string | null) {
  return useQuery({
    queryKey: [DEFAULT_SAVE_COVER_QUERY_KEY, userId],
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
    queryFn: async (): Promise<string | null> => {
      if (!userId) return null

      const { data, error } = await supabase
        .from('user_saves')
        .select('nail_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      const nailId = String((data as { nail_id?: unknown } | null)?.nail_id ?? '').trim()
      if (!nailId) return null

      return fetchNailCoverImage(nailId)
    },
  })
}

export function useClientFolderCoverMapQuery(userId: string | null, folderIds: string[]) {
  const normalizedIds = folderIds.map((id) => id.trim()).filter(Boolean)

  return useQuery({
    queryKey: [CLIENT_FOLDER_COVERS_QUERY_KEY, userId, normalizedIds],
    enabled: Boolean(userId) && normalizedIds.length > 0,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<Record<string, string | null>> => {
      const { data: itemRows, error: itemsError } = await supabase
        .from('client_folder_items')
        .select('folder_id, nail_id, created_at')
        .in('folder_id', normalizedIds)
        .order('created_at', { ascending: false })

      if (itemsError) throw itemsError

      const latestNailByFolder = new Map<string, string>()
      for (const row of itemRows ?? []) {
        const folderId = String((row as { folder_id?: unknown }).folder_id ?? '').trim()
        const nailId = String((row as { nail_id?: unknown }).nail_id ?? '').trim()
        if (!folderId || !nailId || latestNailByFolder.has(folderId)) continue
        latestNailByFolder.set(folderId, nailId)
      }

      const coverMap: Record<string, string | null> = {}
      for (const folderId of normalizedIds) {
        const nailId = latestNailByFolder.get(folderId)
        coverMap[folderId] = nailId ? await fetchNailCoverImage(nailId) : null
      }

      return coverMap
    },
  })
}

export function useCreateFolderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      name,
    }: {
      userId: string
      name: string
    }): Promise<ClientFolderRow> => {
      const trimmedName = name.trim()
      if (!trimmedName) {
        throw new Error('폴더 이름을 입력해 주세요.')
      }

      const { data, error } = await supabase
        .from('client_folders')
        .insert({
          user_id: userId,
          name: trimmedName,
          is_public: false,
        })
        .select(CLIENT_FOLDER_COLUMNS)
        .single()

      if (error) throw error
      return data as ClientFolderRow
    },
    onSuccess: (_folder, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [CLIENT_FOLDERS_QUERY_KEY, variables.userId],
      })
    },
  })
}

export function useMakeFolderPublicMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ folderId }: { folderId: string }): Promise<void> => {
      const trimmedFolderId = folderId.trim()
      if (!trimmedFolderId) {
        throw new Error('폴더 정보가 올바르지 않습니다.')
      }

      const { error } = await supabase
        .from('client_folders')
        .update({ is_public: true })
        .eq('id', trimmedFolderId)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [CLIENT_FOLDER_DETAIL_QUERY_KEY, variables.folderId.trim()],
      })
      void queryClient.invalidateQueries({ queryKey: [CLIENT_FOLDERS_QUERY_KEY] })
    },
  })
}

export function useDeleteFolderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      folderId,
      userId,
    }: {
      folderId: string
      userId: string
    }): Promise<void> => {
      const trimmedFolderId = folderId.trim()
      const trimmedUserId = userId.trim()
      if (!trimmedFolderId || !trimmedUserId) {
        throw new Error('폴더 정보가 올바르지 않습니다.')
      }

      const { error } = await supabase
        .from('client_folders')
        .delete()
        .eq('id', trimmedFolderId)
        .eq('user_id', trimmedUserId)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [CLIENT_FOLDERS_QUERY_KEY, variables.userId],
      })
      void queryClient.invalidateQueries({
        queryKey: [CLIENT_FOLDER_DETAIL_QUERY_KEY, variables.folderId.trim()],
      })
      void queryClient.invalidateQueries({ queryKey: [CLIENT_FOLDER_COVERS_QUERY_KEY] })
    },
  })
}

export function useRemoveFolderItemsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      folderId,
      nailIds,
    }: {
      folderId: string
      nailIds: string[]
    }): Promise<void> => {
      const trimmedFolderId = folderId.trim()
      const normalizedNailIds = nailIds.map((id) => id.trim()).filter(Boolean)
      if (!trimmedFolderId || normalizedNailIds.length === 0) {
        throw new Error('삭제할 항목 정보가 올바르지 않습니다.')
      }

      const { error } = await supabase
        .from('client_folder_items')
        .delete()
        .eq('folder_id', trimmedFolderId)
        .in('nail_id', normalizedNailIds)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [CLIENT_FOLDER_DETAIL_QUERY_KEY, variables.folderId.trim()],
      })
      void queryClient.invalidateQueries({ queryKey: [CLIENT_FOLDER_COVERS_QUERY_KEY] })
    },
  })
}

export function useSaveToFolderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      folderId,
      nailId,
    }: {
      folderId: string
      nailId: string
    }): Promise<void> => {
      const trimmedFolderId = folderId.trim()
      const trimmedNailId = nailId.trim()
      if (!trimmedFolderId || !trimmedNailId) {
        throw new Error('폴더 또는 네일 정보가 올바르지 않습니다.')
      }

      const { error } = await supabase.from('client_folder_items').insert({
        folder_id: trimmedFolderId,
        nail_id: trimmedNailId,
      })

      if (error) {
        if (error.code === '23505') return
        throw error
      }

      await incrementNailSavesCount(trimmedNailId)
    },
    onSuccess: (_data, variables) => {
      const trimmedFolderId = variables.folderId.trim()
      const trimmedNailId = variables.nailId.trim()

      invalidateNailDetailQuery(queryClient, trimmedNailId)
      void queryClient.invalidateQueries({ queryKey: [CLIENT_FOLDERS_QUERY_KEY] })
      if (trimmedFolderId) {
        void queryClient.invalidateQueries({
          queryKey: [CLIENT_FOLDER_DETAIL_QUERY_KEY, trimmedFolderId],
        })
      }
      void queryClient.invalidateQueries({ queryKey: [CLIENT_FOLDER_COVERS_QUERY_KEY] })
    },
  })
}

/** 기존 user_saves + increment_saves 파이프라인 (기본 저장) */
export async function saveToDefaultUserSaves(
  userId: string,
  nailId: string,
  queryClient: QueryClient,
): Promise<void> {
  const trimmedUserId = userId.trim()
  const trimmedNailId = nailId.trim()
  if (!trimmedUserId || !trimmedNailId) {
    throw new Error('저장 정보가 올바르지 않습니다.')
  }

  const { error } = await supabase.from('user_saves').insert({
    user_id: trimmedUserId,
    nail_id: trimmedNailId,
  })

  if (error && error.code !== '23505') {
    throw error
  }

  const { error: saveCountError } = await supabase.rpc('increment_saves', {
    nail_id: trimmedNailId,
    increment_value: 1,
  })
  if (saveCountError) throw saveCountError

  void trackNailActivity(trimmedNailId, 'save', trimmedUserId)

  invalidateNailDetailQuery(queryClient, trimmedNailId)
  void queryClient.invalidateQueries({ queryKey: ['nail-designs', 'reaction-best'] })
  void queryClient.invalidateQueries({ queryKey: ['my-page-count', 'saved', trimmedUserId] })
  void queryClient.invalidateQueries({ queryKey: ['my-page-gallery', 'saved', trimmedUserId] })
  void queryClient.invalidateQueries({ queryKey: ['my-nail-list', 'saved', trimmedUserId] })
}
