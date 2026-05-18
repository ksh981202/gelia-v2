import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../shared/api/supabaseClient'
import type { NailDesignRow } from '../../shared/types/database.types'

const GALLERY_COLUMNS =
  'id,created_at,title,title_en,image_url,category,tags,tags_en,popularity,saves'

const GALLERY_FETCH_LIMIT = 300

export function useGalleryNailsQuery() {
  return useQuery({
    queryKey: ['nail-designs', 'gallery', 'latest', GALLERY_FETCH_LIMIT],
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }): Promise<NailDesignRow[]> => {
      const { data, error } = await supabase
        .from('nail_designs')
        .select(GALLERY_COLUMNS)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(GALLERY_FETCH_LIMIT)
        .abortSignal(signal)

      if (error) throw error
      return (data ?? []) as NailDesignRow[]
    },
  })
}
