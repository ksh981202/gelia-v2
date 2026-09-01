import { isRecognizedNailSynonymTerm } from '@/entities/nail-design/api/useGalleryInfiniteQuery'
import { ALLOWED_NAIL_KEYWORDS } from '@/shared/constants/allowedNailKeywords'
import { resolveSearchQueryForGallery } from '@/shared/constants/nailKeywords'

function matchesAllowedNailKeywords(term: string): boolean {
  return ALLOWED_NAIL_KEYWORDS.some((kw) => term.includes(kw))
}

/**
 * 통합 검색 화이트리스트 방어막.
 * ALLOWED_NAIL_KEYWORDS 또는 NAIL_SYNONYMS(및 EN 역매핑 후 KO)에 해당할 때만 DB 조회 허용.
 */
export function isAllowedSearchKeyword(term: string): boolean {
  const trimmed = term.trim()
  if (!trimmed) return false

  if (matchesAllowedNailKeywords(trimmed)) return true
  if (isRecognizedNailSynonymTerm(trimmed)) return true

  const resolved = resolveSearchQueryForGallery(trimmed)
  if (resolved !== trimmed) {
    if (matchesAllowedNailKeywords(resolved)) return true
    if (isRecognizedNailSynonymTerm(resolved)) return true
  }

  return false
}
