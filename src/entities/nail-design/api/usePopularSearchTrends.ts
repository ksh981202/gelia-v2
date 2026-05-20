import { supabase } from '@/shared/api/supabaseClient'
import { useQuery } from '@tanstack/react-query'

export type PopularSearchTrendRow = {
  keyword: string
  search_count: number
}

export function usePopularSearchTrends() {
  return useQuery({
    queryKey: ['popular-search-trends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_stats')
        .select('keyword, search_count')
        .order('search_count', { ascending: false })
        .limit(5)

      if (error) throw error
      return (data ?? []) as PopularSearchTrendRow[]
    },
    staleTime: 3 * 60 * 1000,
  })
}
