import { useLanguageContext } from '@/contexts/LanguageContext'
import { supabase } from '@/shared/api/supabaseClient'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Share2 } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type MagazineDetailPost = {
  id: string
  title: string | null
  title_en: string | null
  content: string | null
  content_en: string | null
  thumbnail_url: string | null
  created_at: string | null
}

async function fetchMagazinePost(id: string): Promise<MagazineDetailPost | null> {
  const { data, error } = await supabase
    .from('board_posts')
    .select('id, title, title_en, content, content_en, thumbnail_url, created_at')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as MagazineDetailPost | null
}

function formatCreatedAt(raw: string | null, isEnglish: boolean): string {
  if (!raw) return ''

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function getPlainTextSummary(html: string | null): string {
  if (!html) return ''

  const container = document.createElement('div')
  container.innerHTML = html
  return (container.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 150)
}

function createManagedMeta(attribute: 'name' | 'property', key: string, content: string) {
  const meta = document.createElement('meta')
  meta.setAttribute(attribute, key)
  meta.setAttribute('content', content)
  meta.setAttribute('data-gelia-magazine-seo', 'true')
  document.head.appendChild(meta)
}

async function copyCurrentUrl() {
  const url = window.location.href

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = url
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export default function ClientMagazineDetailPage() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const navigate = useNavigate()
  const { id } = useParams()
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['magazine-post', id],
    queryFn: () => fetchMagazinePost(id ?? ''),
    enabled: Boolean(id),
  })

  const handleShareClick = async () => {
    try {
      await copyCurrentUrl()
      alert(isEnglish ? 'Link copied to clipboard.' : '링크가 복사되었습니다')
    } catch (error) {
      console.error('링크 복사 실패:', error)
      alert(isEnglish ? 'Failed to copy the link.' : '링크 복사에 실패했습니다.')
    }
  }

  const title =
    (isEnglish && post?.title_en ? post.title_en : post?.title)?.trim() ||
    (isEnglish ? 'Untitled' : '제목 없음')
  const content = isEnglish && post?.content_en ? post.content_en : post?.content
  const createdAt = formatCreatedAt(post?.created_at ?? null, isEnglish)

  useEffect(() => {
    if (!post) return

    const originalTitle = document.title
    const localizedTitle = isEnglish && post.title_en ? post.title_en : post.title
    const localizedContent = isEnglish && post.content_en ? post.content_en : post.content
    const seoTitle = `${localizedTitle?.trim() || (isEnglish ? 'Untitled' : '제목 없음')} | GELIA Magazine`
    const description = getPlainTextSummary(localizedContent)
    const ogImage = post.thumbnail_url ?? ''
    const ogUrl = window.location.href

    document.title = seoTitle
    createManagedMeta('name', 'description', description)
    createManagedMeta('property', 'og:title', seoTitle)
    createManagedMeta('property', 'og:description', description)
    createManagedMeta('property', 'og:image', ogImage)
    createManagedMeta('property', 'og:url', ogUrl)

    return () => {
      document
        .querySelectorAll('meta[data-gelia-magazine-seo="true"]')
        .forEach((meta) => meta.remove())
      document.title = originalTitle
    }
  }, [post, isEnglish])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-background/90 px-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-sm"
          aria-label={isEnglish ? 'Go back' : '뒤로가기'}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
        </button>
        <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900">
          {isEnglish ? "Editor's Pick" : '에디터 픽'}
        </h2>
        <button
          type="button"
          onClick={() => void handleShareClick()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-sm"
          aria-label={isEnglish ? 'Share' : '공유하기'}
        >
          <Share2 className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </header>

      <main className="px-5 pb-10 pt-5">
        {isLoading ? (
          <p className="py-16 text-center text-sm font-semibold text-gray-500">
            {isEnglish ? 'Loading...' : '로딩 중...'}
          </p>
        ) : isError ? (
          <p className="py-16 text-center text-sm font-semibold text-gray-500">
            {isEnglish ? 'Unable to load the article.' : '게시글을 불러오지 못했습니다.'}
          </p>
        ) : post ? (
          <article>
            <h1 className="text-2xl font-bold leading-snug text-gray-900">{title}</h1>
            {createdAt ? (
              <time dateTime={post.created_at ?? undefined} className="mt-3 block text-xs font-medium text-gray-400">
                {createdAt}
              </time>
            ) : null}
            <div
              className="mt-8 whitespace-pre-wrap break-words break-all overflow-hidden text-[15px] leading-7 text-gray-700 [&_a]:text-[#FF7D66] [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-2xl [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-4 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: content ?? '' }}
            />
          </article>
        ) : (
          <p className="py-16 text-center text-sm font-semibold text-gray-500">
            {isEnglish ? 'Article not found.' : '게시글을 찾을 수 없습니다.'}
          </p>
        )}
      </main>
    </div>
  )
}
