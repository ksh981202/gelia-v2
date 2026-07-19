import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../shared/api/supabaseClient'
import type { NailDesignRow } from '../../../shared/types/database.types'

const SIMILAR_COLUMNS =
  'id,title,title_en,image_url,created_at,color,color_en,nail_length,length_en,styles,styles_en'
const SIMILAR_LIMIT = 5
const MAX_SIMILAR_TAGS = 6

/** 유사도 매칭 대상 스칼라 컬럼 (부분 일치 ilike) */
const SIMILAR_ILIKE_COLUMNS = ['color', 'mood', 'design_technique', 'nail_length', 'title'] as const
/** 유사도 매칭 대상 text[] 컬럼 (배열 포함 cs) */
const SIMILAR_ARRAY_CS_COLUMNS = ['styles', 'situations'] as const

export type SimilarNailRow = Pick<
  NailDesignRow,
  | 'id'
  | 'title'
  | 'title_en'
  | 'image_url'
  | 'created_at'
  | 'color'
  | 'color_en'
  | 'nail_length'
  | 'length_en'
  | 'styles'
  | 'styles_en'
>

export type UseSimilarNailsOptions = {
  /** 현재 네일의 대표 태그들(color/mood/styles/design_technique 등). 있으면 태그 매칭 우선 */
  tags?: string[]
}

function normalizeTags(tags: string[] | undefined): string[] {
  if (!tags || tags.length === 0) return []
  const seen = new Set<string>()
  for (const raw of tags) {
    const trimmed = String(raw ?? '').trim()
    // or() 구문(콤마/괄호)을 깨뜨리는 토큰은 제외해 쿼리 안정성 확보
    if (!trimmed || /[(),]/.test(trimmed)) continue
    seen.add(trimmed)
    if (seen.size >= MAX_SIMILAR_TAGS) break
  }
  return [...seen]
}

function escapeIlikePattern(raw: string): string {
  return raw.replace(/[%_\\"/]/g, '\\$&').trim()
}

function buildIlikeCondition(column: string, escaped: string): string {
  if (/\s/.test(escaped)) return `${column}.ilike.*"${escaped}"*`
  return `${column}.ilike.*${escaped}*`
}

function escapeCsArrayToken(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/[",{}\\\s]/.test(trimmed)) {
    return `"${trimmed.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return trimmed
}

/** 대표 태그 목록으로 PostgREST or() 필터 문자열 생성 */
export function buildSimilarOrFilter(tags: string[]): string | null {
  const conditions: string[] = []

  for (const tag of tags) {
    const escaped = escapeIlikePattern(tag)
    if (escaped) {
      for (const column of SIMILAR_ILIKE_COLUMNS) {
        conditions.push(buildIlikeCondition(column, escaped))
      }
    }

    const csToken = escapeCsArrayToken(tag)
    if (csToken) {
      for (const column of SIMILAR_ARRAY_CS_COLUMNS) {
        conditions.push(`${column}.cs.{${csToken}}`)
      }
    }
  }

  return conditions.length > 0 ? conditions.join(',') : null
}

/**
 * 현재 네일과 실제로 비슷한(태그 일치) 네일 N건.
 * - tags가 있으면 color/mood/styles/design_technique 등에 하나라도 걸리는 디자인을 우선 조회
 * - tags가 없으면 최신순(created_at desc) fallback
 */
export function useSimilarNailsQuery(
  excludeId: string | undefined,
  options?: UseSimilarNailsOptions,
) {
  const trimmedExclude = excludeId?.trim() || undefined
  const tags = normalizeTags(options?.tags)
  const orFilter = tags.length > 0 ? buildSimilarOrFilter(tags) : null

  return useQuery({
    queryKey: ['nail-designs', 'similar', trimmedExclude, orFilter, SIMILAR_LIMIT],
    enabled: Boolean(trimmedExclude),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }): Promise<SimilarNailRow[]> => {
      // 자기 자신이 매칭돼 잘려나갈 수 있으므로 넉넉히 fetch 후 슬라이스
      const fetchLimit = SIMILAR_LIMIT + 5

      let query = supabase.from('nail_designs').select(SIMILAR_COLUMNS)

      if (orFilter) {
        query = query.or(orFilter)
      }

      if (trimmedExclude) {
        query = query.neq('id', trimmedExclude)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(fetchLimit)
        .abortSignal(signal)

      if (error) throw error

      const rows = (data ?? []).filter((row) => row.id !== trimmedExclude) as SimilarNailRow[]

      // 태그 매칭 결과가 비어 있으면 최신순으로 안전하게 대체
      if (rows.length === 0 && orFilter) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('nail_designs')
          .select(SIMILAR_COLUMNS)
          .neq('id', trimmedExclude ?? '')
          .order('created_at', { ascending: false })
          .limit(fetchLimit)
          .abortSignal(signal)

        if (fallbackError) throw fallbackError
        return (fallbackData ?? [])
          .filter((row) => row.id !== trimmedExclude)
          .slice(0, SIMILAR_LIMIT) as SimilarNailRow[]
      }

      return rows.slice(0, SIMILAR_LIMIT)
    },
  })
}
