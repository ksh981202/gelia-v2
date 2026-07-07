import { isAdminEmail } from '@/shared/constants/auth'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '@/shared/api/supabaseClient'

export default function AdminGuard() {
  const navigate = useNavigate()
  const [isAllowed, setIsAllowed] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    const kickOut = (showAlert = false) => {
      if (cancelled) return
      if (showAlert) {
        alert('최고 관리자만 접근할 수 있습니다.')
      }
      setIsAllowed(false)
      setIsChecking(false)
      navigate('/', { replace: true })
    }

    const checkAdminSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (cancelled) return

      if (!isAdminEmail(data.session?.user?.email)) {
        kickOut(true)
        return
      }

      setIsAllowed(true)
      setIsChecking(false)
    }

    void checkAdminSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return

      if (event === 'SIGNED_OUT' || !isAdminEmail(session?.user?.email)) {
        kickOut()
        return
      }

      setIsAllowed(true)
      setIsChecking(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [navigate])

  if (isChecking || !isAllowed) return null

  return <Outlet />
}
