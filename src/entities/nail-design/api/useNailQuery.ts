import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '../../../shared/api/supabaseClient'
import type { NailDesignRow } from '../../../shared/types/database.types'
import { filterByTab, isAllTab } from '../lib/nailListSelectors'

const PAGE_SIZE = 6

const NAIL_DESIGN_COLUMNS =
  'id,created_at,title,title_en,image_url,image_r2_key,category,tags,tags_en,popularity,saves'

/** 헌법 3조: 1차 정렬 + 항상 `id` 내림차순 2차 고정핀 */
function orderedNailDesignsQuery(sort: string) {
  let q = supabase.from('nail_designs').select(NAIL_DESIGN_COLUMNS)
  if (sort === '최신순') {
    q = q.order('created_at', { ascending: false })
  } else if (sort === '저장순') {
    q = q.order('saves', { ascending: false })
  } else {
    q = q.order('popularity', { ascending: false })
  }
  return q.order('id', { ascending: false })
}

export type NailListQueryScope = 'theme' | 'gallery' | 'ranking'

export function useNailQuery(
  tab: string,
  sort: string,
  scope: NailListQueryScope = 'theme',
) {
  const allTab = scope === 'ranking' ? true : isAllTab(tab)

  return useInfiniteQuery({
    queryKey: ['nail-designs', 'infinite', 'supabase', scope, { tab, sort }],
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      if (allTab) {
        const from = pageParam * PAGE_SIZE
        const to = from + PAGE_SIZE - 1
        const { data, error } = await orderedNailDesignsQuery(sort)
          .range(from, to)
          .abortSignal(signal)
        if (error) throw error
        return (data ?? []) as NailDesignRow[]
      }

      if (pageParam > 0) {
        return []
      }

      /** 탭 필터: DB에 정규화 표현이 없으므로 헌법 4조는 클라이언트 `filterByTab`으로 적용 (상한 500건) */
      const CAP = 500
      const { data, error } = await orderedNailDesignsQuery(sort)
        .limit(CAP)
        .abortSignal(signal)
      if (error) throw error
      return filterByTab((data ?? []) as NailDesignRow[], tab)
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      if (allTab) {
        if (lastPage.length < PAGE_SIZE) return undefined
        return lastPageParam + 1
      }
      return undefined
    },
  })
}
