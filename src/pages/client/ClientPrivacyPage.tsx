import { useLanguageContext } from '@/contexts/LanguageContext'
import { supabase } from '@/shared/api/supabaseClient'
import { useQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
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
        .select('id,title,content,title_en,content_en')
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
  const sanitizedContent = DOMPurify.sanitize(content ?? '')

  return (
    <div className="min-h-screen min-w-0 w-full max-w-full overflow-x-hidden bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 mx-auto flex h-14 w-full max-w-md items-center border-b border-gray-100 bg-white px-4 md:static md:mb-6 md:max-w-full md:border-b-0 md:bg-transparent md:px-0">
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

      <main className="min-w-0 w-full max-w-full overflow-x-hidden px-5 pt-14 pb-10 md:mx-auto md:max-w-3xl md:px-0 md:pt-10 md:pb-20">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {isEnglish ? 'Loading content...' : '내용을 불러오는 중입니다.'}
          </div>
        ) : isError || !post ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {isEnglish ? 'No content available.' : '등록된 내용이 없습니다.'}
          </div>
        ) : (
          <section className="min-w-0 w-full max-w-full overflow-x-hidden py-6 md:rounded-2xl md:border md:border-stone-200 md:bg-white md:p-10 md:shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900 md:mt-0 md:text-lg">{title}</h2>
            <div
              className="min-w-0 w-full max-w-full overflow-x-hidden whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[14px] leading-loose text-stone-600 md:text-[15px] [&_a]:text-[#FF7D66] [&_a]:break-all [&_h1]:mb-3 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-2 [&_p]:min-w-0 [&_p]:break-words [&_span]:break-words [&_img]:max-w-full [&_img]:h-auto [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </section>
        )}
      </main>
    </div>
  )
}
