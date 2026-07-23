import { supabase } from '@/shared/api/supabaseClient'
import { useEffect, useState } from 'react'

/** Supabase 세션 사용자 ID. 비로그인 시 `null`(게스트 스토리지 키 사용). */
export function useCurrentUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const apply = (id: string | null) => {
      if (!cancelled) setUserId(id)
    }

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        apply(data.session?.user?.id?.trim() || null)
      })
      .catch((err) => {
        console.warn('[useCurrentUserId] getSession failed', err)
        apply(null)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        apply(session?.user?.id?.trim() || null)
      } catch (err) {
        console.warn('[useCurrentUserId] onAuthStateChange failed', err)
        apply(null)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return userId
}
