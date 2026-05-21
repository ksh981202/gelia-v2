import { useLanguageContext } from '@/contexts/LanguageContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/shared/api/supabaseClient'

const SIGN_OUT_TIMEOUT_MS = 5000

function clearSupabaseAuthLocalStorage(): void {
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (!key) continue
      if (
        key === 'supabase.auth.token' ||
        (key.startsWith('sb-') && key.includes('auth'))
      ) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  } catch {
    /* ignore */
  }
}

async function signOutWithTimeout(ms: number) {
  return Promise.race([
    supabase.auth.signOut(),
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('SIGN_OUT_TIMEOUT')), ms)
    }),
  ])
}

function InfoRow({
  label,
  value,
  valueClassName = 'text-[14px] text-gray-500',
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4 last:border-b-0">
      <span className="text-[15px] font-medium text-gray-900">{label}</span>
      <span className={`max-w-[58%] truncate text-right ${valueClassName}`}>{value}</span>
    </div>
  )
}

function ActionRow({
  label,
  labelClassName = 'text-[15px] font-medium text-gray-900',
  onClick,
}: {
  label: string
  labelClassName?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-gray-50 px-5 py-4 text-left last:border-b-0 active:bg-gray-50"
    >
      <span className={labelClassName}>{label}</span>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" strokeWidth={2} aria-hidden />
    </button>
  )
}

export default function ClientAccountSettingsPage() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (cancelled) return
        if (error) return
        setEmail(data.user?.email?.trim() ?? '')
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = async () => {
    try {
      const { error } = await signOutWithTimeout(SIGN_OUT_TIMEOUT_MS)
      if (error) {
        console.warn('로그아웃 통신 에러:', error)
        alert(
          `로그아웃 중 문제가 발생했어요. 로컬 세션을 지우고 메인으로 이동할게요.\n(${error.message})`,
        )
      }
    } catch (err) {
      console.error('로그아웃 예외 발생:', err)
      const message =
        err instanceof Error && err.message === 'SIGN_OUT_TIMEOUT'
          ? '로그아웃 요청이 시간 초과됐어요. 로컬 세션을 지우고 메인으로 이동할게요.'
          : '로그아웃 중 예외가 발생했어요. 로컬 세션을 지우고 메인으로 이동할게요.'
      alert(message)
    } finally {
      clearSupabaseAuthLocalStorage()
      window.location.href = '/client'
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50 mx-auto flex h-14 w-full max-w-md items-center border-b border-gray-100 bg-white px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-800 transition-colors hover:bg-gray-50"
          aria-label="뒤로 가기"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <h1 className="min-w-0 flex-1 text-center text-[17px] font-bold text-gray-900 pr-10">
          {isEnglish ? 'Account Management' : '계정 관리'}
        </h1>
      </header>

      <main className="w-full px-5 pb-10 pt-14">
        <section className="mb-6">
          <h2 className="mb-2 text-[12px] font-medium text-gray-500">{isEnglish ? 'Login Information' : '로그인 정보'}</h2>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <InfoRow label={isEnglish ? 'Connected Account' : '연결된 계정'} value={isEnglish ? 'Email' : '이메일'} />
            <InfoRow
              label={isEnglish ? 'Email' : '이메일'}
              value={email || (isEnglish ? 'No signed-in email' : '로그인된 이메일이 없어요')}
              valueClassName="text-[14px] font-medium text-gray-800"
            />
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-[12px] font-medium text-gray-500">{isEnglish ? 'Account Information' : '계정 정보'}</h2>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <ActionRow label={isEnglish ? 'Logout' : '로그아웃'} onClick={() => void handleLogout()} />
            <ActionRow label={isEnglish ? 'Delete Account' : '회원탈퇴'} labelClassName="text-[15px] font-medium text-rose-500" />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-[12px] font-medium text-gray-500">{isEnglish ? 'Security' : '보안'}</h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-gray-800 transition-colors active:bg-gray-50"
            >
              <span aria-hidden>🔒</span>
              <span>{isEnglish ? 'Change Password' : '비밀번호 변경'}</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
