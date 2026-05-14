import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../shared/api/supabaseClient'
import type { NailDesignRow } from '../../../shared/types/database.types'

const NAIL_DESIGN_COLUMNS =
  'id,created_at,title,title_en,image_url,image_r2_key,category,tags,tags_en,popularity,saves'

export function useNailDetailQuery(nailId: string | undefined) {
  return useQuery({
    queryKey: ['nail-design', 'detail', 'supabase', nailId],
    queryFn: async (): Promise<NailDesignRow | null> => {
      if (!nailId) return null
      const { data, error } = await supabase
        .from('nail_designs')
        .select(NAIL_DESIGN_COLUMNS)
        .eq('id', nailId)
        .single()
      if (error) {
        if (error.code === 'PGRST116') return null
        throw new Error(error.message)
      }
      return data as NailDesignRow
    },
    enabled: Boolean(nailId),
  })
}
