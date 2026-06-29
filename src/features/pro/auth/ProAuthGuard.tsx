import { fetchProShopByUserId } from '@/features/pro/api/proShopApi'
import ProLandingPage from '@/pages/pro/ProLandingPage'
import ProOnboardingPage from '@/pages/pro/ProOnboardingPage'
import { supabase } from '@/shared/api/supabaseClient'
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

type ProGuardPhase = 'loading' | 'guest' | 'onboarding' | 'pro'

function isProtectedPhase(phase: ProGuardPhase): boolean {
  return phase === 'onboarding' || phase === 'pro'
}

export default function ProAuthGuard() {
  const [phase, setPhase] = useState<ProGuardPhase>('loading')
  const phaseRef = useRef<ProGuardPhase>('loading')

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const resolvePhase = useCallback(async () => {
    setPhase((current) => {
      if (isProtectedPhase(current)) return current
      return 'loading'
    })

    const { data, error } = await supabase.auth.getSession()
    const session = data.session

    if (error || !session?.user) {
      if (isProtectedPhase(phaseRef.current)) return
      setPhase('guest')
      return
    }

    const userId = session.user.id?.trim()
    if (!userId) {
      if (isProtectedPhase(phaseRef.current)) return
      setPhase('guest')
      return
    }

    try {
      const shop = await fetchProShopByUserId(userId)
      setPhase(shop ? 'pro' : 'onboarding')
    } catch {
      if (phaseRef.current === 'pro') return
      setPhase('onboarding')
    }
  }, [])

  useEffect(() => {
    void resolvePhase()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setPhase('guest')
        return
      }

      if (isProtectedPhase(phaseRef.current)) return

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        void resolvePhase()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [resolvePhase])

  if (phase === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5C4A3A]" aria-hidden />
        <span className="sr-only">PRO 접근 권한 확인 중</span>
      </div>
    )
  }

  if (phase === 'guest') {
    return <ProLandingPage />
  }

  if (phase === 'onboarding') {
    return <ProOnboardingPage onCompleted={() => void resolvePhase()} />
  }

  return <Outlet />
}
