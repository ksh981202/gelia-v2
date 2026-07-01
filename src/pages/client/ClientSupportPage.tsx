import { useLanguageContext } from '@/contexts/LanguageContext'
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

function ActionRow({
  label,
  onClick,
  trailing,
}: {
  label: string
  onClick?: () => void
  trailing?: ReactNode
}) {
  const className =
    'flex w-full items-center justify-between border-b border-gray-50 px-5 py-4 text-left last:border-b-0 active:bg-gray-50'

  if (!onClick) {
    return (
      <div className={className}>
        <span className="text-[15px] font-medium text-gray-900">{label}</span>
        {trailing}
      </div>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <span className="text-[15px] font-medium text-gray-900">{label}</span>
      {trailing ?? <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" strokeWidth={2} aria-hidden />}
    </button>
  )
}

export default function ClientSupportPage() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(false)

  const handleEmailCopy = async () => {
    try {
      await navigator.clipboard.writeText("k981202@naver.com")
      setShowToast(true)
      setTimeout(() => {
        setShowToast(false)
      }, 2500)
    } catch (error) {
      console.error("클립보드 복사 실패:", error)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#fdfaf7] md:bg-white">
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="mb-8 flex w-full items-center gap-2 border-b border-stone-200 pb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="-ml-2 cursor-pointer rounded-full p-1.5 text-stone-800 transition-colors hover:bg-stone-100"
            aria-label={isEnglish ? 'Go back' : '뒤로 가기'}
          >
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-extrabold tracking-tight text-stone-900">
            {isEnglish ? 'Customer Service' : '고객센터'}
          </h1>
        </div>

        <section className="pb-8">
          <h2 className="text-[20px] font-bold text-stone-900">
            {isEnglish ? 'How can we help you?' : '무엇을 도와드릴까요?'}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-stone-500">
            {isEnglish
              ? 'Please email us your inquiries and we will respond quickly.'
              : '문의 사항은 이메일로 보내주시면 빠르게 답변드릴게요.'}
          </p>
          <button
            type="button"
            onClick={() => void handleEmailCopy()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-stone-800 shadow-sm transition-colors hover:bg-stone-50"
          >
            <Mail className="h-5 w-5 text-[#FF7D66]" strokeWidth={2} aria-hidden />
            <span>{isEnglish ? 'Contact via Email' : '이메일로 문의하기'}</span>
          </button>
        </section>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <ActionRow label={isEnglish ? 'Notice' : '공지사항'} onClick={() => navigate('/notice')} />
          <ActionRow label={isEnglish ? 'FAQ' : '자주 묻는 질문 (FAQ)'} onClick={() => navigate('/faq')} />
          <ActionRow label={isEnglish ? 'Terms of Service' : '서비스 이용약관'} onClick={() => navigate('/terms')} />
          <ActionRow label={isEnglish ? 'Privacy Policy' : '개인정보 처리방침'} onClick={() => navigate('/privacy')} />
          <ActionRow
            label={isEnglish ? 'App Version' : '앱 버전'}
            trailing={
              <span className="text-[14px] font-semibold text-rose-500">
                1.0.0 {isEnglish ? '(Latest)' : '(최신)'}
              </span>
            }
          />
        </section>
      </div>

      {showToast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-xl bg-gray-800/95 px-5 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
          {isEnglish ? "Email address copied." : "이메일 주소가 복사되었습니다."}
        </div>
      )}
    </div>
  )
}
