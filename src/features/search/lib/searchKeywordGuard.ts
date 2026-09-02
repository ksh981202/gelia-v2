import { isRecognizedNailSynonymTerm } from '@/entities/nail-design/api/useGalleryInfiniteQuery'
import { ALLOWED_NAIL_KEYWORDS } from '@/shared/constants/allowedNailKeywords'
import { inferUiLanguageFromSearchTerm, resolveSearchQueryForGallery } from '@/shared/constants/nailKeywords'

function matchesAllowedNailKeywords(term: string): boolean {
  return ALLOWED_NAIL_KEYWORDS.some((kw) => term.includes(kw))
}

/**
 * 통합 검색 화이트리스트 방어막.
 * - KO: ALLOWED_NAIL_KEYWORDS / NAIL_SYNONYMS 엄격 검사
 * - EN literal: 사전 미등록 자유 영문(해시태그·design_point_en 분할어) 허용
 */
export function isAllowedSearchKeyword(term: string): boolean {
  const trimmed = term.trim()
  if (!trimmed) return false

  if (/[가-힣]/.test(trimmed)) {
    if (matchesAllowedNailKeywords(trimmed)) return true
    if (isRecognizedNailSynonymTerm(trimmed)) return true

    const resolved = resolveSearchQueryForGallery(trimmed)
    if (resolved !== trimmed) {
      if (matchesAllowedNailKeywords(resolved)) return true
      if (isRecognizedNailSynonymTerm(resolved)) return true
    }

    return false
  }

  if (inferUiLanguageFromSearchTerm(trimmed) === 'en') return true

  return false
}
