import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, Loader2, Share2, User } from 'lucide-react'
import { toast } from 'sonner'
import ClientGlobalHeader from '@/widgets/layout/ClientGlobalHeader'
import { supabase } from '@/shared/api/supabaseClient'
import { SITE_ORIGIN, buildSeoDescription, toAbsoluteSeoUrl } from '@/shared/lib/seoMeta'

type MagazineLang = 'ko' | 'en' | 'jp' | 'vn' | 'th'

type BoardPostRow = {
  id: string
  slug?: string | null
  post_type?: string | null
  title?: string | null
  title_en?: string | null
  title_jp?: string | null
  title_vn?: string | null
  title_th?: string | null
  content?: string | null
  content_ko?: string | null
  content_en?: string | null
  content_jp?: string | null
  content_vn?: string | null
  content_th?: string | null
  meta_ko?: string | null
  meta_en?: string | null
  meta_jp?: string | null
  meta_vn?: string | null
  meta_th?: string | null
  thumbnail_url?: string | null
  published_at?: string | null
  created_at?: string | null
}

const MAGAZINE_POST_TYPES = ['magazine', 'magazine_editor', 'Magazine', 'magazine_curation'] as const

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** hreflang BCP47 code → public path prefix (jp URL path, ja hreflang) */
const HREFLANG_ALTERNATES: { hreflang: string; pathPrefix: string }[] = [
  { hreflang: 'ko', pathPrefix: '' },
  { hreflang: 'en', pathPrefix: '/en' },
  { hreflang: 'ja', pathPrefix: '/jp' },
  { hreflang: 'vi', pathPrefix: '/vn' },
  { hreflang: 'th', pathPrefix: '/th' },
  { hreflang: 'x-default', pathPrefix: '' },
]

const LANG_SWITCH: { code: MagazineLang; label: string }[] = [
  { code: 'ko', label: 'KR' },
  { code: 'en', label: 'EN' },
  { code: 'jp', label: 'JP' },
  { code: 'vn', label: 'VN' },
  { code: 'th', label: 'TH' },
]

function normalizeLang(raw?: string | null): MagazineLang {
  const v = (raw || 'ko').toLowerCase()
  if (v === 'en' || v === 'jp' || v === 'vn' || v === 'th') return v
  return 'ko'
}

function pickLocalizedFields(
  post: BoardPostRow,
  lang: MagazineLang,
): { title: string; content: string; description: string } {
  if (lang === 'en') {
    return {
      title: (post.title_en || post.title || '').trim(),
      content: (post.content_en || post.content_ko || post.content || '').trim(),
      description: (post.meta_en || post.meta_ko || '').trim(),
    }
  }
  if (lang === 'jp') {
    return {
      title: (post.title_jp || post.title || '').trim(),
      content: (post.content_jp || post.content_ko || post.content || '').trim(),
      description: (post.meta_jp || post.meta_ko || '').trim(),
    }
  }
  if (lang === 'vn') {
    return {
      title: (post.title_vn || post.title || '').trim(),
      content: (post.content_vn || post.content_ko || post.content || '').trim(),
      description: (post.meta_vn || post.meta_ko || '').trim(),
    }
  }
  if (lang === 'th') {
    return {
      title: (post.title_th || post.title || '').trim(),
      content: (post.content_th || post.content_ko || post.content || '').trim(),
      description: (post.meta_th || post.meta_ko || '').trim(),
    }
  }
  return {
    title: (post.title || '').trim(),
    content: (post.content_ko || post.content || '').trim(),
    description: (post.meta_ko || '').trim(),
  }
}

function langFromPathname(pathname: string, langParam?: string): MagazineLang {
  if (langParam) return normalizeLang(langParam)
  const m = pathname.match(/^\/(en|jp|vn|th)\/magazine(?:\/|$)/i)
  return m ? normalizeLang(m[1]) : 'ko'
}

function extractFirstImageUrl(html: string): string | null {
  if (!html) return null
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1]?.trim() || null
}

function magazineCanonicalPath(lang: MagazineLang, slug: string): string {
  if (lang === 'ko') return `/magazine/${slug}`
  return `/${lang}/magazine/${slug}`
}

function magazineHref(pathPrefix: string, slug: string): string {
  return `${SITE_ORIGIN}${pathPrefix}/magazine/${slug}`
}

/** Open Graph locale (language_TERRITORY). 라우트 jp/vn ≠ BCP47. */
function ogLocaleFromLang(lang: MagazineLang): string {
  if (lang === 'en') return 'en_US'
  if (lang === 'jp') return 'ja_JP'
  if (lang === 'vn') return 'vi_VN'
  if (lang === 'th') return 'th_TH'
  return 'ko_KR'
}

export default function MagazineDetailPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { slug, lang: langParam } = useParams<{ slug: string; lang?: string }>()
  const lang = langFromPathname(pathname, langParam)

  const [post, setPost] = useState<BoardPostRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchPost() {
      if (!slug?.trim()) {
        if (!cancelled) {
          setNotFound(true)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setNotFound(false)
      setPost(null)

      try {
        const key = slug.trim()

        let { data, error } = await supabase
          .from('board_posts')
          .select('*')
          .in('post_type', [...MAGAZINE_POST_TYPES])
          .eq('slug', key)
          .maybeSingle()

        if ((!data || error) && UUID_RE.test(key)) {
          const byId = await supabase
            .from('board_posts')
            .select('*')
            .in('post_type', [...MAGAZINE_POST_TYPES])
            .eq('id', key)
            .maybeSingle()
          data = byId.data
          error = byId.error
        }

        if (cancelled) return

        if (error || !data) {
          setNotFound(true)
          setPost(null)
          return
        }

        setPost(data as BoardPostRow)
      } catch {
        if (!cancelled) {
          setNotFound(true)
          setPost(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchPost()
    return () => {
      cancelled = true
    }
  }, [slug])

  const { title, content, description } = useMemo(() => {
    if (!post) return { title: '', content: '', description: '' }
    const picked = pickLocalizedFields(post, lang)
    const description =
      picked.description || buildSeoDescription(picked.content, 150)
    return { ...picked, description }
  }, [post, lang])

  const seoSlug = (post?.slug || slug || '').trim()

  const ogImage = useMemo(() => {
    if (!post) return null
    const fromContent =
      extractFirstImageUrl(content) ||
      extractFirstImageUrl(post.content_ko || '') ||
      extractFirstImageUrl(post.content || '')
    return toAbsoluteSeoUrl(fromContent || post.thumbnail_url)
  }, [post, content])

  const canonicalUrl = seoSlug
    ? `${SITE_ORIGIN}${magazineCanonicalPath(lang, seoSlug)}`
    : undefined

  const pageTitle = title ? `${title} | GELIA` : 'GELIA Magazine'

  const handleShare = async () => {
    const shareData = {
      title: title || 'GELIA Magazine',
      text: description || '',
      url: window.location.href,
    }

    if (typeof navigator.share === 'function') {
      try {
        const canShare =
          typeof navigator.canShare !== 'function' || navigator.canShare(shareData)
        if (canShare) {
          await navigator.share(shareData)
          return
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('공유 실패:', err)
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('매거진 주소가 복사되었습니다. 친구에게 공유해보세요!')
    } catch {
      toast.error('주소 복사에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 font-['Pretendard']">
        <Helmet>
          <title>GELIA Magazine</title>
        </Helmet>
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p className="text-sm font-medium text-gray-400">매거진을 불러오는 중...</p>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6 font-['Pretendard']">
        <Helmet>
          <title>페이지를 찾을 수 없습니다 | GELIA</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <p className="text-6xl font-black text-gray-200">404</p>
        <h1 className="text-xl font-bold text-gray-900">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          요청하신 매거진이 없거나 아직 발행되지 않았습니다.
        </p>
        <button
          type="button"
          onClick={() => navigate(lang === 'ko' ? '/magazine' : `/${lang}/magazine`)}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          매거진으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <html lang={lang === 'jp' ? 'ja' : lang === 'vn' ? 'vi' : lang} />
        <title>{pageTitle}</title>
        {description ? <meta name="description" content={description} /> : null}
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="GELIA" />
        <meta property="og:title" content={title || pageTitle} />
        {description ? <meta property="og:description" content={description} /> : null}
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
        <meta property="og:locale" content={ogLocaleFromLang(lang)} />

        <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={title || pageTitle} />
        {description ? <meta name="twitter:description" content={description} /> : null}
        {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

        {seoSlug
          ? HREFLANG_ALTERNATES.map(({ hreflang, pathPrefix }) => (
              <link
                key={hreflang}
                rel="alternate"
                hrefLang={hreflang}
                href={magazineHref(pathPrefix, seoSlug)}
              />
            ))
          : null}
      </Helmet>

      <ClientGlobalHeader showBackButton />

      <nav className="relative flex items-center justify-between w-full h-[56px] px-4 bg-white sticky top-0 z-50 border-b border-gray-100 md:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-gray-100"
          aria-label="뒤로 가기"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold tracking-widest text-gray-900 leading-none"
          style={{ fontFamily: "'Playfair Display', serif" }}
          aria-label="GELIA 홈"
        >
          GELIA
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => void handleShare()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-gray-100"
            aria-label="공유하기"
          >
            <Share2 className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/my')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-gray-100"
            aria-label="마이페이지"
          >
            <User className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>
      </nav>

      <div className="w-full max-w-3xl mx-auto px-5 py-10 font-['Pretendard']">
        {seoSlug ? (
          <div className="mb-4 flex items-center justify-end gap-4">
            <div
              className="inline-flex items-center gap-0 rounded-full border border-gray-200 bg-gray-50/80 px-3 py-1"
              role="navigation"
              aria-label="Language"
            >
              {LANG_SWITCH.map(({ code, label }, index) => {
                const active = lang === code
                return (
                  <span key={code} className="inline-flex items-center">
                    {index > 0 ? (
                      <span className="mx-1.5 select-none text-[11px] text-gray-300" aria-hidden>
                        |
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        if (!active) navigate(magazineCanonicalPath(code, seoSlug))
                      }}
                      aria-current={active ? 'page' : undefined}
                      className={[
                        'text-[12px] tracking-wide transition-colors',
                        active
                          ? 'text-purple-600 font-bold cursor-default'
                          : 'text-gray-400 font-medium hover:text-gray-600',
                      ].join(' ')}
                    >
                      {label}
                    </button>
                  </span>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => void handleShare()}
              className="hidden md:flex items-center justify-center p-2 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="공유하기"
            >
              <Share2 className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>
        ) : null}
        <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-8 break-words whitespace-pre-wrap">
          {title || 'Untitled'}
        </h1>
        <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: content || '' }} />
      </div>
    </div>
  )
}
