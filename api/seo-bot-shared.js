export const SITE_ORIGIN = (process.env.VITE_SITE_URL || 'https://gelia.app').replace(/\/+$/, '')

export const DEFAULT_OG = {
  title: '젤리아 (GELIA) - 내 손에 찰떡인 네일 찾기',
  description: '젤리아에서 나만의 인생 네일을 찾아보세요. 트렌디한 네일 큐레이션 서비스',
  image: `${SITE_ORIGIN}/ogimage/og-image.webp`,
  siteName: '젤리아 (GELIA)',
}

export const BOT_UA_PATTERN =
  /bot|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegram|kakaotalk-scrap|applebot|googlebot|bingbot|yandex|baiduspider|embedly|pinterest|preview|ia_archiver|curl|wget|python-requests|headless/i

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const MAGAZINE_POST_TYPES = ['magazine', 'magazine_editor', 'Magazine', 'magazine_curation']

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function stripHtmlToPlainText(input) {
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

export function buildSeoDescription(input, maxLen = 150) {
  const plain = stripHtmlToPlainText(input)
  if (!plain) return ''
  if (plain.length <= maxLen) return plain
  const sliced = plain.slice(0, maxLen)
  const lastSpace = sliced.lastIndexOf(' ')
  const cut = lastSpace > Math.floor(maxLen * 0.55) ? sliced.slice(0, lastSpace) : sliced
  return `${cut.trim()}…`
}

export function toAbsoluteSeoUrl(url) {
  if (!url?.trim()) return null
  const u = url.trim()
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('//')) return `https:${u}`
  if (u.startsWith('/')) return `${SITE_ORIGIN}${u}`
  return u
}

export function magazineHtmlLang(lang) {
  if (lang === 'jp') return 'ja'
  if (lang === 'vn') return 'vi'
  return lang
}

export function magazineOgLocale(lang) {
  if (lang === 'en') return 'en_US'
  if (lang === 'jp') return 'ja_JP'
  if (lang === 'vn') return 'vi_VN'
  if (lang === 'th') return 'th_TH'
  return 'ko_KR'
}

export function isCrawler(userAgent) {
  return BOT_UA_PATTERN.test(String(userAgent || ''))
}

export function getSupabaseConfig() {
  const url = (process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
  if (!url || !anonKey) return null
  return { url, anonKey }
}

export async function supabaseRequest(path, options = {}) {
  const config = getSupabaseConfig()
  if (!config) return null

  const headers = {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`,
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(`${config.url}/rest/v1${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) return null
  if (response.status === 204) return null
  return response.json()
}

export function getOriginalPathname(req) {
  const url = new URL(req.url || '/', `https://${req.headers.host || 'gelia.app'}`)
  const fromHeader =
    req.headers['x-vercel-original-path'] ||
    req.headers['x-invoke-path'] ||
    req.headers['x-matched-path'] ||
    ''
  const raw = fromHeader && !String(fromHeader).startsWith('/api/') ? fromHeader : url.pathname
  const pathOnly = String(raw).split('?')[0].split('#')[0]
  return pathOnly || '/'
}

export function getPageUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'gelia.app'
  const pathname = getOriginalPathname(req)
  const search = req.url?.includes('?') ? `?${req.url.split('?')[1]?.split('#')[0]}` : ''
  return `${proto}://${host}${pathname}${search === '?' ? '' : search}`
}
