/** 공개 SEO 메타용 공통 유틸 (Helmet 문서 head) */

export const SITE_ORIGIN = (
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '') ||
  'https://gelia.app'
).replace(/\/$/, '')

export type MagazineSeoLang = 'ko' | 'en' | 'jp' | 'vn' | 'th'

/** BCP47 html lang — 라우트 jp/vn ≠ html lang */
export function magazineHtmlLang(lang: MagazineSeoLang): string {
  if (lang === 'jp') return 'ja'
  if (lang === 'vn') return 'vi'
  return lang
}

/** Open Graph locale (language_TERRITORY) */
export function magazineOgLocale(lang: MagazineSeoLang): string {
  if (lang === 'en') return 'en_US'
  if (lang === 'jp') return 'ja_JP'
  if (lang === 'vn') return 'vi_VN'
  if (lang === 'th') return 'th_TH'
  return 'ko_KR'
}

/** Helmet htmlAttributes 실패 대비 — documentElement.lang 강제 동기화 */
export function applyDocumentHtmlLang(langCode: string): () => void {
  if (typeof document === 'undefined') return () => undefined
  const root = document.documentElement
  const prev = root.getAttribute('lang')
  root.setAttribute('lang', langCode)
  return () => {
    if (prev == null || prev === '') root.setAttribute('lang', 'ko')
    else root.setAttribute('lang', prev)
  }
}

/** HTML/마크다운 찌꺼기 제거 → 한 줄 평문 */
export function stripHtmlToPlainText(input: string): string {
  return String(input ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** 구글 검색 스니펫용 description (기본 150자) */
export function buildSeoDescription(input: string, maxLen = 150): string {
  const plain = stripHtmlToPlainText(input)
  if (!plain) return ''
  if (plain.length <= maxLen) return plain

  const sliced = plain.slice(0, maxLen)
  const lastSpace = sliced.lastIndexOf(' ')
  const cut = lastSpace > Math.floor(maxLen * 0.55) ? sliced.slice(0, lastSpace) : sliced
  return `${cut.trim()}…`
}

export function toAbsoluteSeoUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null
  const u = url.trim()
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('//')) return `https:${u}`
  if (u.startsWith('/')) return `${SITE_ORIGIN}${u}`
  return u
}
