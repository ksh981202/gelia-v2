import { ChevronDown, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type NoticeItem = {
  id: string
  title: string
  date: string
  content: string
}

const NOTICE_ITEMS: NoticeItem[] = [
  {
    id: '1',
    title: '[안내] 젤리아 V2 업데이트',
    date: '2026.05.18',
    content: '앱이 더 빠르고 가벼워졌습니다.',
  },
  {
    id: '2',
    title: '서비스 이용약관 개정 안내',
    date: '2026.05.10',
    content: '이용약관이 일부 변경되었습니다.',
  },
]

export default function ClientNoticePage() {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
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
          공지사항
        </h1>
      </header>

      <main className="w-full px-5 pb-10 pt-14">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {NOTICE_ITEMS.map((item) => {
            const isOpen = expandedId === item.id
            return (
              <div key={item.id} className="border-b border-gray-50 last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left active:bg-gray-50"
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-[12px] text-gray-400">{item.date}</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
                {isOpen ? (
                  <div className="border-t border-gray-50 bg-gray-50/80 px-5 py-4">
                    <p className="text-[14px] leading-relaxed text-gray-600">{item.content}</p>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
