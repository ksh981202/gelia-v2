import { Heart, Search, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguageContext } from '@/contexts/LanguageContext'
import { supabase } from '@/shared/api/supabaseClient'
import { isAdminEmail } from '@/shared/constants/auth'

type ClientHeaderUtilityIconsProps = {
  className?: string
}

export default function ClientHeaderUtilityIcons({ className = '' }: ClientHeaderUtilityIconsProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    let cancelled = false

    const applyAdminEmail = (email: string | undefined) => {
      if (!cancelled) setIsAdminUser(isAdminEmail(email))
    }

    void supabase.auth.getUser().then(({ data }) => {
      applyAdminEmail(data.user?.email)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyAdminEmail(session?.user?.email)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className={['flex shrink-0 items-center justify-end gap-4', className].join(' ')}>
      <LanguageToggle compact />
      {location.pathname !== '/search' ? (
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary sm:h-10 sm:w-10"
          onClick={() => navigate('/search')}
          aria-label={isEnglish ? 'Search' : '검색'}
        >
          <Search size={18} className="text-foreground" />
        </button>
      ) : null}
      {isAdminUser && import.meta.env.DEV ? (
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground transition-opacity hover:opacity-90 sm:h-10 sm:w-10"
          onClick={() => navigate('/admin')}
          aria-label={isEnglish ? 'Admin' : '관리자 페이지'}
        >
          <Settings size={18} className="text-foreground" strokeWidth={2} />
        </button>
      ) : null}
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary sm:h-10 sm:w-10"
        onClick={() => navigate('/my')}
        aria-label={isEnglish ? 'My Collection' : '내 컬렉션'}
      >
        <Heart size={18} className="text-foreground" strokeWidth={2} />
      </button>
    </div>
  )
}
