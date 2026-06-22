import { supabase } from '@/shared/api/supabaseClient'
import type { NailDesignRow } from '@/shared/types/database.types'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export const GALLERY_PAGE_SIZE = 20
export const DEFAULT_GALLERY_TAB = '전체'
export const DEFAULT_GALLERY_SORT = '인기순'

export const GALLERY_COLUMNS =
  'id,created_at,title,title_en,image_url,category,tags,tags_en,popularity,saves,situations,styles,nail_length,color,mood,design_elements'
const ARRAY_TEXT_FILTER_INDEXES = [0, 1, 2, 3, 4, 5] as const
const NAIL_SYNONYMS: Record<string, string[]> = {
  형광: ['네온', '비비드', '팝', '원색', 'neon', 'vivid', 'fluorescent', '형광'],
  올드머니: ['고급스러운', '클래식', '우아한', '심플한', '단정한', 'old money', '올드머니'],
  시크: ['모던', '블랙', '도도한', '무채색', '도시적인', 'chic', '시크'],
  은하수: ['우주', '별', '갤럭시', '글리터', '밤하늘', '마그네틱', '은하수'],
  소라: ['스카이블루', '하늘색', '연하늘', '파스텔블루', '소라'],
  '시크 파스텔': ['모던 파스텔', '톤다운 파스텔', '뮤트', '시크 파스텔'],
  겨울: ['니트', '눈', '크리스마스', '포근한', '연말', '겨울'],
  테라조: ['대리석', '메추리알', '도트', '점박이', '테라조'],
  딥한: ['다크', '진한', '가을', '블랙', '딥'],
  엠보: ['입체', '3D', '니트', '물방울', '볼록', '엠보'],
  맑은: ['시럽', '투명', '클리어', '유리알', '수채화', '맑은'],
  동물: ['호피', '레오파드', '고양이', '강아지', '곰돌이', '베어', '동물'],
  은박: ['호일', '메탈릭', '실버포인트', '은박'],
  데일리: ['일상', '심플', '기본', '무난한', '오피스', '꾸안꾸', '베이직'],
  데이트: ['러블리', '소개팅', '기념일', '여리여리', '사랑스러운'],
  오피스: ['단정', '깔끔', '심플', '데일리', '면접', '직장인'],
  웨딩: ['결혼', '신부', '본식', '웨딩촬영', '촬영', '청순', '화이트', '드레스'],
  하객: ['하객룩', '단정', '격식', '우아한'],
  바캉스: ['휴가', '여름휴가', '여행', '해변', '물놀이', '리조트', '호캉스', '바다'],
  파티: ['연말', '페스티벌', '클럽', '화려한', '블링블링', '이벤트'],
  누드: ['스킨톤', '베이지', '살구', '여리여리'],
  화이트: ['크림', '아이보리', '순백'],
  레드: ['버건디', '와인', '체리', '빨강'],
  블랙: ['다크', '무채색', '시크', '검정'],
  글리터: ['반짝이', '펄', '다이아', '은하수', '별빛', '스파클링'],
  파스텔: ['소라', '민트', '연보라', '솜사탕', '마카롱'],
  무광: ['매트', '벨벳', '보송'],
  시럽: ['맑은', '투명', '젤리', '물먹은', '과즙'],
  프렌치: ['그라데이션프렌치', '딥프렌치', '둥근프렌치', '라인'],
  마블: ['대리석', '물결', '수채화', '번짐'],
  그라데이션: ['그라', '옴브레', '치크', '시럽그라'],
  자석: ['마그넷', '자석젤', '도깨비젤', '오로라', '마그네틱'],
  미러파우더: ['메탈', '파우더', '크롬', '홀로그램', '오로라파우더'],
  스톤: ['큐빅', '스와로브스키', '보석', '스와', '다이아', '파츠'],
  리본: ['3D리본', '엠보리본', '발레코어'],
  숏네일: ['짧은', '귀여운', '조약돌', '동글'],
  연장: ['롱네일', '팁', '아크릴', '화려한'],
}

/** PostgREST `.or()` 구분자(`,`) 및 `ilike` 와일드카드 충돌 방지 */
function escapePostgrestIlikePattern(raw: string): string {
  return raw
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/,/g, ' ')
    .trim()
}

function expandSynonymTokens(normalizedTab: string, tokens: string[]): string[] {
  const expanded = new Set<string>(tokens)

  for (const synonym of NAIL_SYNONYMS[normalizedTab] ?? []) {
    const normalizedSynonym = synonym.trim()
    if (normalizedSynonym) expanded.add(normalizedSynonym)
  }

  for (const token of tokens) {
    for (const synonym of NAIL_SYNONYMS[token] ?? []) {
      const normalizedSynonym = synonym.trim()
      if (normalizedSynonym) expanded.add(normalizedSynonym)
    }
  }

  return [...expanded]
}

export function buildTabOrFilter(tab: string): string {
  const normalized = tab
    .replace(/\//g, ' ')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!normalized) return ''

  const baseTokens = normalized
    .split(' ')
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== DEFAULT_GALLERY_TAB)
  const tokens = [
    ...new Set(
      expandSynonymTokens(normalized, baseTokens)
        .map((part) => escapePostgrestIlikePattern(part))
        .filter((ilike) => ilike.length > 0),
    ),
  ]

  if (tokens.length === 0) return ''

  const parts: string[] = []
  for (const ilike of tokens) {
    parts.push(
      `title.ilike.%${ilike}%`,
      `category.ilike.%${ilike}%`,
      `nail_length.ilike.%${ilike}%`,
      `color.ilike.%${ilike}%`,
      `mood.ilike.%${ilike}%`,
      `design_elements.ilike.%${ilike}%`,
    )
    for (const index of ARRAY_TEXT_FILTER_INDEXES) {
      parts.push(
        `situations->>${index}.ilike.%${ilike}%`,
        `styles->>${index}.ilike.%${ilike}%`,
        `tags->>${index}.ilike.%${ilike}%`,
      )
    }
  }
  return parts.join(',')
}

export function applyGallerySort<T extends { order: (column: string, options: { ascending: boolean }) => T }>(
  query: T,
  sort: string,
): T {
  if (sort === '최신순') {
    return query.order('created_at', { ascending: false }).order('id', { ascending: false })
  }
  if (sort === '저장 많은 순') {
    return query.order('saves', { ascending: false }).order('id', { ascending: false })
  }
  return query.order('popularity', { ascending: false }).order('id', { ascending: false })
}

export function normalizeGallerySort(raw: string | null): string {
  if (raw === 'realtime' || raw === 'weekly' || raw === 'monthly' || raw === 'alltime') {
    return raw
  }
  if (raw === '최신순' || raw === '저장 많은 순' || raw === '인기순') return raw
  return DEFAULT_GALLERY_SORT
}

export type GalleryInfinitePage = {
  items: NailDesignRow[]
  totalCount: number | null
}

export function flattenGalleryPages(pages: GalleryInfinitePage[] | undefined): NailDesignRow[] {
  return pages?.flatMap((page) => page.items) ?? []
}

export function getGalleryTotalCount(pages: GalleryInfinitePage[] | undefined): number | null {
  if (!pages?.length) return null
  for (const page of pages) {
    if (page.totalCount != null) return page.totalCount
  }
  return null
}

type GalleryQueryOptions = {
  enabled?: boolean
  baseTab?: string
  extraTabs?: readonly string[]
}

function applyGalleryFilterTabs<T extends { or: (filters: string) => T }>(
  query: T,
  tabs: readonly string[],
): T {
  let next = query
  for (const tab of tabs) {
    const orFilter = buildTabOrFilter(tab)
    if (orFilter) next = next.or(orFilter)
  }
  return next
}

function collectGalleryFilterTabs(
  tab: string,
  baseTab: string,
  extraTabs: readonly string[] = [],
): string[] {
  const tabs: string[] = []

  if (baseTab && baseTab !== DEFAULT_GALLERY_TAB) tabs.push(baseTab)
  if (tab && tab !== DEFAULT_GALLERY_TAB && tab !== baseTab) tabs.push(tab)
  for (const extraTab of extraTabs) {
    const normalized = extraTab.trim()
    if (!normalized || normalized === DEFAULT_GALLERY_TAB || tabs.includes(normalized)) continue
    tabs.push(normalized)
  }

  return tabs
}

export function useGalleryInfiniteQuery(tab: string, sort: string, options?: GalleryQueryOptions) {
  const normalizedTab = tab.trim() || DEFAULT_GALLERY_TAB
  const normalizedSort = normalizeGallerySort(sort)
  const normalizedBaseTab = options?.baseTab?.trim() ?? ''
  const normalizedExtraTabs = options?.extraTabs ?? []
  const filterTabs = collectGalleryFilterTabs(normalizedTab, normalizedBaseTab, normalizedExtraTabs)

  const query = useInfiniteQuery({
    queryKey: [
      'nail-designs',
      'gallery',
      'infinite',
      { tab: normalizedTab, sort: normalizedSort, baseTab: normalizedBaseTab, extraTabs: normalizedExtraTabs },
    ],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const page = pageParam as number
      const from = (page - 1) * GALLERY_PAGE_SIZE
      const to = page * GALLERY_PAGE_SIZE - 1

      let query = supabase.from('nail_designs').select(GALLERY_COLUMNS, { count: 'exact' })
      query = applyGalleryFilterTabs(query, filterTabs)

      query = applyGallerySort(query, normalizedSort)

      const { data, error, count } = await query.range(from, to).abortSignal(signal)
      if (error) throw error
      return {
        items: (data ?? []) as NailDesignRow[],
        totalCount: page === 1 ? (count ?? null) : null,
      } satisfies GalleryInfinitePage
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.items.length < GALLERY_PAGE_SIZE) return undefined
      return (lastPageParam as number) + 1
    },
  })

  const galleryItems = useMemo(
    () => flattenGalleryPages(query.data?.pages),
    [query.data?.pages],
  )

  const totalCount = useMemo(
    () => getGalleryTotalCount(query.data?.pages),
    [query.data?.pages],
  )

  return { ...query, galleryItems, totalCount }
}

export function useGalleryCountQuery(tab: string, options?: GalleryQueryOptions) {
  const normalizedTab = tab.trim() || DEFAULT_GALLERY_TAB
  const normalizedBaseTab = options?.baseTab?.trim() ?? ''

  return useQuery({
    queryKey: ['nail-designs', 'gallery', 'count', { tab: normalizedTab, baseTab: normalizedBaseTab }],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
    queryFn: async ({ signal }) => {
      let query = supabase
        .from('nail_designs')
        .select('*', { count: 'exact', head: true })

      if (normalizedBaseTab && normalizedBaseTab !== DEFAULT_GALLERY_TAB) {
        const baseFilter = buildTabOrFilter(normalizedBaseTab)
        if (baseFilter) query = query.or(baseFilter)
      }

      if (normalizedTab !== DEFAULT_GALLERY_TAB) {
        const orFilter = buildTabOrFilter(normalizedTab)
        if (orFilter && normalizedTab !== normalizedBaseTab) query = query.or(orFilter)
      }

      const { count, error } = await query.abortSignal(signal)
      if (error) throw error
      return count ?? 0
    },
  })
}
