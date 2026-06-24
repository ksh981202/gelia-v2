import { supabase } from '@/shared/api/supabaseClient'

export type ProShopRow = {
  user_id: string
  shop_name: string
  instagram_url: string | null
  map_url: string | null
  created_at: string
}

export async function fetchProShopByUserId(userId: string): Promise<ProShopRow | null> {
  const { data, error } = await supabase
    .from('pro_shops')
    .select('user_id, shop_name, instagram_url, map_url, created_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data as ProShopRow | null
}

export async function createProShop(input: {
  shopName: string
  instagramUrl?: string
  mapUrl?: string
}): Promise<void> {
  const shopName = input.shopName.trim()
  if (!shopName) {
    throw new Error('샵 이름을 입력해 주세요.')
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user?.id) {
    throw new Error('로그인이 필요합니다.')
  }

  const { error } = await supabase.from('pro_shops').insert({
    user_id: user.id,
    shop_name: shopName,
    instagram_url: input.instagramUrl?.trim() || null,
    map_url: input.mapUrl?.trim() || null,
  })

  if (error) throw error
}

export async function updateProShop(
  userId: string,
  data: {
    shop_name: string
    instagram_url?: string
    map_url?: string
  },
): Promise<void> {
  const normalizedUserId = userId.trim()
  if (!normalizedUserId) {
    throw new Error('사용자 정보를 확인할 수 없습니다.')
  }

  const shopName = data.shop_name.trim()
  if (!shopName) {
    throw new Error('샵 이름을 입력해 주세요.')
  }

  const { data: updated, error } = await supabase
    .from('pro_shops')
    .update({
      shop_name: shopName,
      instagram_url: data.instagram_url?.trim() || null,
      map_url: data.map_url?.trim() || null,
    })
    .eq('user_id', normalizedUserId)
    .select('user_id')
    .maybeSingle()

  if (error) throw error
  if (!updated?.user_id) {
    throw new Error('샵 프로필을 찾을 수 없습니다.')
  }
}
