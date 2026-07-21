import { supabase } from '@/shared/api/supabaseClient'

export type MagazineViewLang = 'ko' | 'en' | 'jp' | 'vn' | 'th'

/** 매거진 상세 진입 시 조회수 +1 (RPC — anon UPDATE 불가 우회) */
export async function incrementMagazineViewCount(
  postId: string,
  viewLang: MagazineViewLang,
): Promise<void> {
  const id = String(postId ?? '').trim()
  if (!id) return

  const { error } = await supabase.rpc('increment_view_count', {
    post_id: id,
    view_lang: viewLang,
  })

  if (error) {
    console.warn('[incrementMagazineViewCount]', error.message)
  }
}
