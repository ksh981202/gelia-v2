import { supabase } from '@/shared/api/supabaseClient'

const MAGAZINE_POST_TYPES = [
  'magazine',
  'magazine_editor',
  'Magazine',
  'magazine_curation',
] as const

export type MagazineLangViewRow = {
  key: 'en' | 'jp' | 'ko' | 'others'
  label: string
  flag: string
  views: number
  percent: number
  barClass: string
}

export type MagazineTopArticleRow = {
  id: string
  title: string
  thumbnail: string
  langBadge: string
  views: number
}

export type MagazineGceInsight = {
  totalViews: number
  viewsByLanguage: MagazineLangViewRow[]
  topArticles: MagazineTopArticleRow[]
  publishedCount: number
}

export const EMPTY_MAGAZINE_GCE_INSIGHT: MagazineGceInsight = {
  totalViews: 0,
  viewsByLanguage: [],
  topArticles: [],
  publishedCount: 0,
}

type BoardPostInsightRow = {
  id: string
  title: string | null
  title_en: string | null
  thumbnail_url: string | null
  view_count?: number | null
  view_count_ko?: number | null
  view_count_en?: number | null
  view_count_jp?: number | null
  view_count_vn?: number | null
  view_count_th?: number | null
}

const FALLBACK_THUMB = 'https://gelia.app/ogimage/og-image.webp'

const VIEW_COUNT_SELECT =
  'id, title, title_en, thumbnail_url, view_count, view_count_ko, view_count_en, view_count_jp, view_count_vn, view_count_th'

const BASE_SELECT = 'id, title, title_en, thumbnail_url'

/** null / undefined / NaN → 0 */
function safeCount(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function sanitizeBoardPostRow(row: unknown): BoardPostInsightRow | null {
  if (!row || typeof row !== 'object') return null
  const r = row as Record<string, unknown>
  const id = r.id
  if (id == null || id === '') return null

  return {
    id: String(id),
    title: r.title == null ? null : String(r.title),
    title_en: r.title_en == null ? null : String(r.title_en),
    thumbnail_url: r.thumbnail_url == null ? null : String(r.thumbnail_url),
    view_count: safeCount(r.view_count),
    view_count_ko: safeCount(r.view_count_ko),
    view_count_en: safeCount(r.view_count_en),
    view_count_jp: safeCount(r.view_count_jp),
    view_count_vn: safeCount(r.view_count_vn),
    view_count_th: safeCount(r.view_count_th),
  }
}

function pickPrimaryLangBadge(row: BoardPostInsightRow): string {
  const ranked = [
    { badge: 'KR', v: safeCount(row.view_count_ko) },
    { badge: 'EN', v: safeCount(row.view_count_en) },
    { badge: 'JP', v: safeCount(row.view_count_jp) },
    { badge: 'VN', v: safeCount(row.view_count_vn) },
    { badge: 'TH', v: safeCount(row.view_count_th) },
  ].sort((a, b) => b.v - a.v)
  return (ranked[0]?.v ?? 0) > 0 ? (ranked[0]?.badge ?? 'KR') : 'KR'
}

function buildInsightFromRows(rows: unknown[]): MagazineGceInsight {
  const safeRows = (Array.isArray(rows) ? rows : [])
    .map(sanitizeBoardPostRow)
    .filter((row): row is BoardPostInsightRow => row != null)
  const publishedCount = safeRows.length

  let totalKo = 0
  let totalEn = 0
  let totalJp = 0
  let totalVn = 0
  let totalTh = 0
  let totalViews = 0

  for (const row of safeRows) {
    totalViews += safeCount(row.view_count)
    totalKo += safeCount(row.view_count_ko)
    totalEn += safeCount(row.view_count_en)
    totalJp += safeCount(row.view_count_jp)
    totalVn += safeCount(row.view_count_vn)
    totalTh += safeCount(row.view_count_th)
  }

  const langBuckets = [
    { key: 'en' as const, label: 'English (Global)', flag: '🇺🇸', views: totalEn, barClass: 'bg-blue-500' },
    { key: 'jp' as const, label: 'Japanese', flag: '🇯🇵', views: totalJp, barClass: 'bg-emerald-500' },
    { key: 'ko' as const, label: 'Korean', flag: '🇰🇷', views: totalKo, barClass: 'bg-rose-500' },
    {
      key: 'others' as const,
      label: 'Others (TH, VI)',
      flag: '🌏',
      views: totalVn + totalTh,
      barClass: 'bg-stone-800',
    },
  ]

  const langTotal = langBuckets.reduce((sum, b) => sum + safeCount(b.views), 0)
  const viewsByLanguage: MagazineLangViewRow[] = langBuckets.map((b) => ({
    ...b,
    views: safeCount(b.views),
    percent: langTotal > 0 ? Math.round((safeCount(b.views) / langTotal) * 100) : 0,
  }))

  const topArticles: MagazineTopArticleRow[] = [...safeRows]
    .sort((a, b) => safeCount(b.view_count) - safeCount(a.view_count))
    .slice(0, 3)
    .map((row, index) => ({
      id: String(row.id || `magazine-${index}`),
      title: String(row.title || row.title_en || 'GELIA Magazine').trim() || 'GELIA Magazine',
      thumbnail: String(row.thumbnail_url || '').trim() || FALLBACK_THUMB,
      langBadge: pickPrimaryLangBadge(row),
      views: safeCount(row.view_count),
    }))

  return normalizeMagazineGceInsight({
    totalViews,
    viewsByLanguage,
    topArticles,
    publishedCount,
  })
}

async function fetchMagazineRows(select: string): Promise<unknown[]> {
  const { data, error } = await supabase
    .from('board_posts')
    .select(select)
    .in('post_type', [...MAGAZINE_POST_TYPES])

  if (error) {
    throw error
  }

  return Array.isArray(data) ? data : []
}

/** GCE 인사이트 — view_count 컬럼 미적용 DB도 0으로 안전 폴백 */
export async function fetchMagazineGceInsight(): Promise<MagazineGceInsight> {
  try {
    const rows = await fetchMagazineRows(VIEW_COUNT_SELECT)
    return buildInsightFromRows(rows)
  } catch (primaryError) {
    console.warn('[fetchMagazineGceInsight] view_count columns unavailable, falling back:', primaryError)
    try {
      const rows = await fetchMagazineRows(BASE_SELECT)
      return buildInsightFromRows(rows)
    } catch (fallbackError) {
      console.error('[fetchMagazineGceInsight]', fallbackError)
      return normalizeMagazineGceInsight(EMPTY_MAGAZINE_GCE_INSIGHT)
    }
  }
}

const LANG_VIEW_DEFAULTS: Record<MagazineLangViewRow['key'], Omit<MagazineLangViewRow, 'views' | 'percent'>> = {
  en: { key: 'en', label: 'English (Global)', flag: '🇺🇸', barClass: 'bg-blue-500' },
  jp: { key: 'jp', label: 'Japanese', flag: '🇯🇵', barClass: 'bg-emerald-500' },
  ko: { key: 'ko', label: 'Korean', flag: '🇰🇷', barClass: 'bg-rose-500' },
  others: { key: 'others', label: 'Others (TH, VI)', flag: '🌏', barClass: 'bg-stone-800' },
}

function normalizeLangViewRow(
  row: Partial<MagazineLangViewRow> | null | undefined,
): MagazineLangViewRow {
  const key = row?.key
  const defaults =
    key && key in LANG_VIEW_DEFAULTS
      ? LANG_VIEW_DEFAULTS[key]
      : {
          key: 'others' as const,
          label: String(row?.label ?? 'Unknown'),
          flag: String(row?.flag ?? '🌏'),
          barClass: String(row?.barClass ?? 'bg-stone-400'),
        }

  return {
    ...defaults,
    views: safeCount(row?.views),
    percent: Math.min(100, Math.max(0, safeCount(row?.percent))),
  }
}

export function normalizeMagazineGceInsight(
  raw: MagazineGceInsight | null | undefined,
): MagazineGceInsight {
  if (!raw) return { ...EMPTY_MAGAZINE_GCE_INSIGHT }

  return {
    totalViews: safeCount(raw.totalViews),
    publishedCount: safeCount(raw.publishedCount),
    viewsByLanguage: Array.isArray(raw.viewsByLanguage)
      ? raw.viewsByLanguage.map((row) => normalizeLangViewRow(row))
      : [],
    topArticles: Array.isArray(raw.topArticles)
      ? raw.topArticles.map((article, index) => ({
          id: String(article?.id ?? `top-${index}`),
          title: String(article?.title ?? 'GELIA Magazine'),
          thumbnail: String(article?.thumbnail ?? FALLBACK_THUMB),
          langBadge: String(article?.langBadge ?? 'KR'),
          views: safeCount(article?.views),
        }))
      : [],
  }
}
