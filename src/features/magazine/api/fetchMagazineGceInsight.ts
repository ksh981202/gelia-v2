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

function pickPrimaryLangBadge(row: BoardPostInsightRow): string {
  const ranked = [
    { badge: 'KR', v: Number(row.view_count_ko) || 0 },
    { badge: 'EN', v: Number(row.view_count_en) || 0 },
    { badge: 'JP', v: Number(row.view_count_jp) || 0 },
    { badge: 'VN', v: Number(row.view_count_vn) || 0 },
    { badge: 'TH', v: Number(row.view_count_th) || 0 },
  ].sort((a, b) => b.v - a.v)
  return (ranked[0]?.v ?? 0) > 0 ? (ranked[0]?.badge ?? 'KR') : 'KR'
}

function buildInsightFromRows(rows: BoardPostInsightRow[]): MagazineGceInsight {
  const safeRows = Array.isArray(rows) ? rows : []
  const publishedCount = safeRows.length

  let totalKo = 0
  let totalEn = 0
  let totalJp = 0
  let totalVn = 0
  let totalTh = 0
  let totalViews = 0

  for (const row of safeRows) {
    totalViews += Number(row?.view_count) || 0
    totalKo += Number(row?.view_count_ko) || 0
    totalEn += Number(row?.view_count_en) || 0
    totalJp += Number(row?.view_count_jp) || 0
    totalVn += Number(row?.view_count_vn) || 0
    totalTh += Number(row?.view_count_th) || 0
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

  const langTotal = langBuckets.reduce((sum, b) => sum + b.views, 0)
  const viewsByLanguage: MagazineLangViewRow[] = langBuckets.map((b) => ({
    ...b,
    percent: langTotal > 0 ? Math.round((b.views / langTotal) * 100) : 0,
  }))

  const topArticles: MagazineTopArticleRow[] = [...safeRows]
    .sort((a, b) => (Number(b?.view_count) || 0) - (Number(a?.view_count) || 0))
    .slice(0, 3)
    .map((row, index) => ({
      id: String(row?.id ?? `magazine-${index}`),
      title: String(row?.title || row?.title_en || 'GELIA Magazine').trim(),
      thumbnail: String(row?.thumbnail_url || '').trim() || FALLBACK_THUMB,
      langBadge: pickPrimaryLangBadge(row),
      views: Number(row?.view_count) || 0,
    }))

  return {
    totalViews,
    viewsByLanguage,
    topArticles,
    publishedCount,
  }
}

async function fetchMagazineRows(select: string): Promise<BoardPostInsightRow[]> {
  const { data, error } = await supabase
    .from('board_posts')
    .select(select)
    .in('post_type', [...MAGAZINE_POST_TYPES])

  if (error) {
    throw error
  }

  return (data ?? []) as unknown as BoardPostInsightRow[]
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
      return buildInsightFromRows(
        rows.map((row) => ({
          ...row,
          view_count: 0,
          view_count_ko: 0,
          view_count_en: 0,
          view_count_jp: 0,
          view_count_vn: 0,
          view_count_th: 0,
        })),
      )
    } catch (fallbackError) {
      console.error('[fetchMagazineGceInsight]', fallbackError)
      return { ...EMPTY_MAGAZINE_GCE_INSIGHT }
    }
  }
}

export function normalizeMagazineGceInsight(
  raw: MagazineGceInsight | null | undefined,
): MagazineGceInsight {
  if (!raw) return { ...EMPTY_MAGAZINE_GCE_INSIGHT }

  return {
    totalViews: Number(raw.totalViews) || 0,
    publishedCount: Number(raw.publishedCount) || 0,
    viewsByLanguage: Array.isArray(raw.viewsByLanguage) ? raw.viewsByLanguage : [],
    topArticles: Array.isArray(raw.topArticles)
      ? raw.topArticles.map((article, index) => ({
          id: String(article?.id ?? `top-${index}`),
          title: String(article?.title ?? 'GELIA Magazine'),
          thumbnail: String(article?.thumbnail ?? FALLBACK_THUMB),
          langBadge: String(article?.langBadge ?? 'KR'),
          views: Number(article?.views) || 0,
        }))
      : [],
  }
}
