import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { deleteFromR2 } from '../admin-upload/api/uploadService'
import { supabase } from '../../shared/api/supabaseClient'
import type { NailDesignRow } from '../../shared/types/database.types'

const NAIL_DESIGN_COLUMNS = [
  'id',
  'created_at',
  'title',
  'title_en',
  'image_url',
  'image_r2_key',
  'source_filename',
  'description',
  'description_en',
  'color',
  'color_en',
  'nail_length',
  'length_en',
  'hand_type',
  'hand_type_en',
  'mood',
  'mood_en',
  'situations',
  'occasion_en',
  'styles',
  'styles_en',
  'design_technique',
  'technique_en',
  'design_elements',
  'design_point_en',
  'procedure_guide',
  'guide_en',
  'category',
  'tags',
  'tags_en',
  'popularity',
  'saves',
].join(',')

export type AdminDashboardListParams = {
  searchQuery: string
  page: number
  pageSize?: number
}

export type AdminDashboardListResult = {
  items: NailDesignRow[]
  totalCount: number
}

/** PostgREST `.or()` 구분자(`,`) 및 `ilike` 와일드카드 충돌 방지 */
function escapePostgrestIlikePattern(raw: string): string {
  return raw
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/,/g, ' ')
    .trim()
}

function buildAdminSearchOrFilter(searchQuery: string): string | null {
  const pattern = escapePostgrestIlikePattern(searchQuery)
  if (!pattern) return null

  return [
    `title.ilike.%${pattern}%`,
    `title_en.ilike.%${pattern}%`,
    `color.ilike.%${pattern}%`,
    `mood.ilike.%${pattern}%`,
    `source_filename.ilike.%${pattern}%`,
  ].join(',')
}

export function useAdminDashboard({ searchQuery, page, pageSize = 12 }: AdminDashboardListParams) {
  const queryClient = useQueryClient()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const normalizedSearch = searchQuery.trim()
  const normalizedPage = Math.max(1, page)
  const normalizedPageSize = Math.max(1, pageSize)
  const from = (normalizedPage - 1) * normalizedPageSize
  const to = from + normalizedPageSize - 1

  const listQuery = useQuery({
    queryKey: [
      'admin',
      'nail-designs',
      'list',
      { searchQuery: normalizedSearch, page: normalizedPage, pageSize: normalizedPageSize },
    ],
    queryFn: async (): Promise<AdminDashboardListResult> => {
      let query = supabase
        .from('nail_designs')
        .select(NAIL_DESIGN_COLUMNS, { count: 'exact' })
        .order('source_filename', { ascending: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })

      const searchFilter = buildAdminSearchOrFilter(normalizedSearch)
      if (searchFilter) {
        query = query.or(searchFilter)
      }

      const { data, error, count } = await query.range(from, to)
      if (error) throw new Error(error.message)

      return {
        items: (data ?? []) as unknown as NailDesignRow[],
        totalCount: count ?? 0,
      }
    },
  })

  const handleDelete = useCallback(
    async (id: string, imageR2Key: string, options: { invalidate?: boolean } = {}) => {
      const shouldInvalidate = options.invalidate ?? true
      setDeleteError(null)
      setDeletingId(id)
      try {
        await deleteFromR2(imageR2Key)
        const { error } = await supabase.from('nail_designs').delete().eq('id', id)
        if (error) throw new Error(error.message)
        if (shouldInvalidate) {
          await queryClient.invalidateQueries({ queryKey: ['admin', 'nail-designs', 'list'] })
          await queryClient.invalidateQueries({ queryKey: ['nail-designs'] })
        }
      } catch (e) {
        const message =
          e instanceof Error ? e.message : '삭제 중 알 수 없는 오류가 발생했습니다.'
        setDeleteError(message)
        throw e
      } finally {
        setDeletingId(null)
      }
    },
    [queryClient],
  )

  const clearDeleteError = useCallback(() => {
    setDeleteError(null)
  }, [])

  return {
    ...listQuery,
    handleDelete,
    deleteError,
    deletingId,
    clearDeleteError,
  }
}
