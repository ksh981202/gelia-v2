import { supabase } from '@/shared/api/supabaseClient'
import type { NailDesignRow } from '@/shared/types/database.types'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

export const GALLERY_PAGE_SIZE = 10
export const DEFAULT_GALLERY_TAB = '전체'
export const DEFAULT_GALLERY_SORT = '인기순'

const GALLERY_COLUMNS =
  'id,created_at,title,title_en,image_url,category,tags,tags_en,popularity,saves,situations,styles,nail_length'

/** PostgREST `.or()` 구분자(`,`) 및 `ilike` 와일드카드 충돌 방지 */
function escapePostgrestIlikePattern(raw: string): string {
  return raw
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/,/g, ' ')
    .trim()
}

/** PostgREST `.or()` 구분자(`,`) 및 `cs` 배열 원소 토큰 안전 처리 */
function escapePostgrestCsToken(raw: string): string {
  return String(raw ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildTabOrFilter(tab: string): string {
  const normalized = tab
    .replace(/\//g, ' ')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!normalized) return ''

  const tokens = [
    ...new Set(
      normalized
        .split(' ')
        .map((part) => ({
          ilike: escapePostgrestIlikePattern(part),
          cs: escapePostgrestCsToken(part),
        }))
        .filter(({ ilike, cs }) => ilike.length > 0 && cs.length > 0 && cs !== DEFAULT_GALLERY_TAB)
        .map(({ ilike, cs }) => `${ilike}\u0000${cs}`),
    ),
  ].map((token) => {
    const [ilike, cs] = token.split('\u0000')
    return { ilike, cs }
  })

  if (tokens.length === 0) return ''

  const parts: string[] = []
  for (const { ilike, cs } of tokens) {
    parts.push(
      `title.ilike.%${ilike}%`,
      `category.ilike.%${ilike}%`,
      `situations.cs.{${cs}}`,
      `styles.cs.{${cs}}`,
      `nail_length.ilike.%${ilike}%`,
    )
  }
  return parts.join(',')
}

function applyGallerySort<T extends { order: (column: string, options: { ascending: boolean }) => T }>(
  query: T,
  sort: string,
): T {
  if (sort === '최신순') {
    return query.order('created_at', { ascending: false }).order('id', { ascending: false })
  }
  if (sort === '저장 많은 순') {
    return query.order('saves', { ascending: false }).order('id', { ascending: false })
  }
  return query.order('popularity', { ascending: false }).order('id', { ascending: false })
}

export function normalizeGallerySort(raw: string | null): string {
  if (raw === 'realtime' || raw === 'weekly' || raw === 'monthly' || raw === 'alltime') {
    return raw
  }
  if (raw === '최신순' || raw === '저장 많은 순' || raw === '인기순') return raw
  return DEFAULT_GALLERY_SORT
}

export function useGalleryInfiniteQuery(tab: string, sort: string) {
  const normalizedTab = tab.trim() || DEFAULT_GALLERY_TAB
  const normalizedSort = normalizeGallerySort(sort)

  return useInfiniteQuery({
    queryKey: ['nail-designs', 'gallery', 'infinite', { tab: normalizedTab, sort: normalizedSort }],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const page = pageParam as number
      const from = (page - 1) * GALLERY_PAGE_SIZE
      const to = page * GALLERY_PAGE_SIZE - 1

      let query = supabase.from('nail_designs').select(GALLERY_COLUMNS)

      if (normalizedTab !== DEFAULT_GALLERY_TAB) {
        const orFilter = buildTabOrFilter(normalizedTab)
        if (orFilter) query = query.or(orFilter)
      }

      query = applyGallerySort(query, normalizedSort)

      const { data, error } = await query.range(from, to).abortSignal(signal)
      if (error) throw error
      return (data ?? []) as NailDesignRow[]
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < GALLERY_PAGE_SIZE) return undefined
      return (lastPageParam as number) + 1
    },
  })
}

export function useGalleryCountQuery(tab: string) {
  const normalizedTab = tab.trim() || DEFAULT_GALLERY_TAB

  return useQuery({
    queryKey: ['nail-designs', 'gallery', 'count', { tab: normalizedTab }],
    staleTime: 60 * 1000,
    queryFn: async ({ signal }) => {
      let query = supabase
        .from('nail_designs')
        .select('*', { count: 'exact', head: true })

      if (normalizedTab !== DEFAULT_GALLERY_TAB) {
        const orFilter = buildTabOrFilter(normalizedTab)
        if (orFilter) query = query.or(orFilter)
      }

      const { count, error } = await query.abortSignal(signal)
      if (error) throw error
      return count ?? 0
    },
  })
}
