import { supabase } from '@/shared/api/supabaseClient'
import { useQuery } from '@tanstack/react-query'

export const USER_SAVED_COUNT_QUERY_KEY = 'my-page-count' as const

export async function fetchUserSavesCount(userId: string | null): Promise<number> {
  if (!userId) return 0

  const { count, error } = await supabase
    .from('user_saves')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count ?? 0
}

export function useUserSavedCountQuery(userId: string | null) {
  return useQuery({
    queryKey: [USER_SAVED_COUNT_QUERY_KEY, 'saved', userId],
    queryFn: () => fetchUserSavesCount(userId),
    enabled: Boolean(userId),
    staleTime: 30_000,
  })
}
