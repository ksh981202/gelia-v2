import { supabase } from '@/shared/api/supabaseClient'

const MAGAZINE_POST_TYPES = ['magazine_editor', 'magazine'] as const

/** gce_title_db — 사용·대기 중인 제목 SSOT */
const GCE_TITLE_ACTIVE_STATUSES = [
  'draft',
  'pending',
  'generating',
  'review',
  'completed',
  'published',
] as const

const DETAIL_UUID_RE = /\/detail\/([0-9a-f-]{36})/gi
const IMAGE_GL_RE = /\[IMAGE_GL-([a-zA-Z0-9_-]+)\]/gi

const CONTENT_FIELDS = [
  'content',
  'content_ko',
  'content_en',
  'content_jp',
  'content_vn',
  'content_th',
] as const

const TITLE_FIELDS = ['title', 'title_en', 'title_jp', 'title_vn', 'title_th'] as const

/** 제목 비교용 정규화 — 공백·앞뒤 trim */
export function normalizeGceTitleKey(title: string): string {
  return String(title ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

function collectTitleKeys(row: Record<string, unknown>): string[] {
  const keys: string[] = []
  for (const field of TITLE_FIELDS) {
    const key = normalizeGceTitleKey(String(row[field] ?? ''))
    if (key) keys.push(key)
  }
  return keys
}

function extractUuidsFromText(text: string): string[] {
  const uuids = new Set<string>()
  const src = String(text ?? '')
  if (!src) return []

  DETAIL_UUID_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = DETAIL_UUID_RE.exec(src)) !== null) {
    const uuid = String(match[1] ?? '').trim().toLowerCase()
    if (uuid) uuids.add(uuid)
  }
  return [...uuids]
}

function extractGlTokensFromText(text: string): string[] {
  const tokens = new Set<string>()
  const src = String(text ?? '')
  if (!src) return []

  IMAGE_GL_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = IMAGE_GL_RE.exec(src)) !== null) {
    const token = String(match[1] ?? '').trim()
    if (token) tokens.add(token)
  }
  return [...tokens]
}

function collectUuidsFromRow(row: Record<string, unknown>): string[] {
  const uuids = new Set<string>()
  for (const field of CONTENT_FIELDS) {
    for (const uuid of extractUuidsFromText(String(row[field] ?? ''))) {
      uuids.add(uuid)
    }
  }
  return [...uuids]
}

/** 5장 세트 비교용 — UUID 정렬 join */
export function buildPhotoCombinationKey(nailUuids: string[]): string {
  return [...new Set(nailUuids.map((id) => id.trim().toLowerCase()).filter(Boolean))]
    .sort()
    .join('|')
}

/**
 * board_posts + gce_title_db 에서 이미 사용·대기 중인 KR/다국어 제목 Set
 */
export async function fetchUsedTitles(): Promise<Set<string>> {
  const used = new Set<string>()

  const [postsRes, gceRes] = await Promise.all([
    supabase
      .from('board_posts')
      .select('title, title_en, title_jp, title_vn, title_th')
      .in('post_type', [...MAGAZINE_POST_TYPES]),
    supabase
      .from('gce_title_db')
      .select('title, title_en, title_jp, title_vn, title_th')
      .in('status', [...GCE_TITLE_ACTIVE_STATUSES]),
  ])

  if (postsRes.error) {
    console.warn('[fetchUsedTitles] board_posts 조회 실패:', postsRes.error.message)
  }
  if (gceRes.error) {
    console.warn('[fetchUsedTitles] gce_title_db 조회 실패:', gceRes.error.message)
  }

  for (const row of [...(postsRes.data ?? []), ...(gceRes.data ?? [])]) {
    for (const key of collectTitleKeys(row as Record<string, unknown>)) {
      used.add(key)
    }
  }

  return used
}

export type UsedMagazinePhotoData = {
  /** Soft sort — 미사용 사진 우선 배치용 */
  usedNailIds: Set<string>
  /** 5장 동일 조합 Hard block */
  usedPhotoCombinations: Set<string>
}

/**
 * 발행·파이프라인 HTML/원고에서 사용된 nail UUID 및 5장 조합 추출
 */
export async function fetchUsedMagazinePhotoData(): Promise<UsedMagazinePhotoData> {
  const usedNailIds = new Set<string>()
  const usedPhotoCombinations = new Set<string>()

  const [postsRes, gceRes] = await Promise.all([
    supabase
      .from('board_posts')
      .select('content, content_ko, content_en, content_jp, content_vn, content_th')
      .in('post_type', [...MAGAZINE_POST_TYPES]),
    supabase
      .from('gce_title_db')
      .select('content_ko, content_en, content_jp, content_vn, content_th')
      .in('status', [...GCE_TITLE_ACTIVE_STATUSES]),
  ])

  if (postsRes.error) {
    console.warn('[fetchUsedMagazinePhotoData] board_posts 조회 실패:', postsRes.error.message)
  }
  if (gceRes.error) {
    console.warn('[fetchUsedMagazinePhotoData] gce_title_db 조회 실패:', gceRes.error.message)
  }

  for (const row of [...(postsRes.data ?? []), ...(gceRes.data ?? [])]) {
    const record = row as Record<string, unknown>
    const uuids = collectUuidsFromRow(record)

    for (const uuid of uuids) {
      usedNailIds.add(uuid)
    }

    if (uuids.length >= 5) {
      usedPhotoCombinations.add(buildPhotoCombinationKey(uuids))
    }

    // IMAGE_GL 태그만 있는 원고(미조립) — GL 토큰 기반 조합도 수집
    const glTokens: string[] = []
    for (const field of CONTENT_FIELDS) {
      glTokens.push(...extractGlTokensFromText(String(record[field] ?? '')))
    }
    if (glTokens.length >= 5) {
      const glKey = [...new Set(glTokens)].sort().join('|')
      usedPhotoCombinations.add(`gl:${glKey}`)
    }
  }

  return { usedNailIds, usedPhotoCombinations }
}
