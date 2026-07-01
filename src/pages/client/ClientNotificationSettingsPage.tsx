import { useLanguageContext } from '@/contexts/LanguageContext'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type ToggleProps = {
  enabled: boolean
  onChange: (next: boolean) => void
  label: string
}

function NotificationToggle({ enabled, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`relative h-[28px] w-[48px] shrink-0 rounded-full transition-colors duration-200 ease-out ${
        enabled ? 'bg-[#FF7D66]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none absolute top-[2px] left-[2px] h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-transform duration-200 ease-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

type NotificationRowProps = {
  title: string
  description: string
  enabled: boolean
  onChange: (next: boolean) => void
}

function NotificationRow({ title, description, enabled, onChange }: NotificationRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 bg-white px-5 py-4">
      <div className="min-w-0 flex-1 pr-4">
        <p className="text-[15px] font-medium text-gray-900">{title}</p>
        <p className="mt-1 text-[12px] text-gray-500">{description}</p>
      </div>
      <NotificationToggle enabled={enabled} onChange={onChange} label={title} />
    </div>
  )
}

export default function ClientNotificationSettingsPage() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const navigate = useNavigate()

  const [customRecommend, setCustomRecommend] = useState(true)
  const [weeklyTrend, setWeeklyTrend] = useState(true)
  const [eventPromo, setEventPromo] = useState(false)
  const [nightQuiet, setNightQuiet] = useState(true)

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
            {isEnglish ? 'Notification Settings' : '알림 설정'}
          </h1>
        </div>

        <section className="mb-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <h2 className="w-full bg-stone-50 px-5 py-2.5 text-[12px] font-medium text-stone-500">
            {isEnglish ? 'Service Notifications' : '서비스 알림'}
          </h2>
          <NotificationRow
            title={isEnglish ? 'Custom Nail Recommendation Alerts' : '맞춤 네일 추천 알림'}
            description={
              isEnglish
                ? 'Get notified when new nail designs matching your taste are uploaded.'
                : '내 취향에 맞는 새로운 네일 디자인이 올라오면 알려드려요'
            }
            enabled={customRecommend}
            onChange={setCustomRecommend}
          />
          <NotificationRow
            title={isEnglish ? 'Weekly Trend Updates' : '주간 트렌드 업데이트'}
            description={isEnglish ? 'Weekly summary of hot trend nails.' : '매주 핫한 트렌드 네일 결산 알림'}
            enabled={weeklyTrend}
            onChange={setWeeklyTrend}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <h2 className="w-full bg-stone-50 px-5 py-2.5 text-[12px] font-medium text-stone-500">
            {isEnglish ? 'Benefits & Event Notifications' : '혜택 및 이벤트 알림'}
          </h2>
          <NotificationRow
            title={isEnglish ? 'Event & Promotion Alerts' : '이벤트 및 프로모션 알림'}
            description={
              isEnglish
                ? 'Receive news about various events and benefits.'
                : '다양한 이벤트와 혜택 소식을 전해드려요'
            }
            enabled={eventPromo}
            onChange={setEventPromo}
          />
          <NotificationRow
            title={isEnglish ? 'Do Not Disturb at Night' : '야간 방해 금지'}
            description={
              isEnglish
                ? 'You will not receive marketing notifications from 21:00 to 08:00.'
                : '21:00 - 08:00 동안에는 마케팅 알림을 받지 않아요'
            }
            enabled={nightQuiet}
            onChange={setNightQuiet}
          />
        </section>
      </div>
    </div>
  )
}
