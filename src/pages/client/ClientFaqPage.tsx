import { ChevronDown, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type FaqItem = {
  id: string
  q: string
  a: string
}

const FAQ_DATA: FaqItem[] = [
  {
    id: '1',
    q: '휴대폰을 바꾸면 제가 저장한 네일 사진들은 다 지워지나요?',
    a: '로그인을 하셨다면 데이터는 안전하게 보관됩니다.',
  },
  {
    id: '2',
    q: '새로운 네일 디자인 사진은 얼마나 자주 업데이트되나요?',
    a: '매주 새로운 트렌드 네일이 업데이트됩니다.',
  },
  {
    id: '3',
    q: '마음에 드는 네일 디자인은 어떻게 저장하고 어디서 보나요?',
    a: '상세 페이지 하단의 저장 버튼을 누르고, 마이페이지에서 확인하세요.',
  },
]

export default function ClientFaqPage() {
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
          자주 묻는 질문
        </h1>
      </header>

      <main className="w-full px-5 pb-10 pt-14">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {FAQ_DATA.map((item) => {
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
                    <p className="text-[15px] font-semibold text-gray-900">{item.q}</p>
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
                    <p className="text-[14px] leading-relaxed text-gray-600">{item.a}</p>
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
