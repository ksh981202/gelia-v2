import { useLanguageContext } from '@/contexts/LanguageContext'
import { supabase } from '@/shared/api/supabaseClient'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type BoardPostRow = {
  id: string
  title: string | null
  content: string | null
  title_en: string | null
  content_en: string | null
}

export default function ClientPrivacyPage() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const navigate = useNavigate()

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['board-posts', 'privacy'],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from('board_posts')
        .select('*')
        .eq('is_active', true)
        .eq('post_type', 'privacy')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error
      return (rows ?? []) as BoardPostRow[]
    },
    staleTime: 30_000,
  })

  const post = data[0]
  const title = post ? (isEnglish && post.title_en ? post.title_en : post.title) : ''
  const content = post ? (isEnglish && post.content_en ? post.content_en : post.content) : ''

  return (
    <div className="min-h-screen w-full bg-white">
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
          {isEnglish ? 'Privacy Policy' : '개인정보 처리방침'}
        </h1>
      </header>

      <main className="w-full px-5 pb-10 pt-14 leading-relaxed">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {isEnglish ? 'Loading content...' : '내용을 불러오는 중입니다.'}
          </div>
        ) : isError || !post ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {isEnglish ? 'No content available.' : '등록된 내용이 없습니다.'}
          </div>
        ) : (
          <section>
            <h2 className="mb-4 mt-6 text-base font-bold text-gray-900">{title}</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{content}</p>
          </section>
        )}
      </main>
    </div>
  )
}
