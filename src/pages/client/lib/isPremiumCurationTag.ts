import { isRecognizedNailSynonymTerm } from '@/entities/nail-design/api/useGalleryInfiniteQuery'
import { ALLOWED_NAIL_KEYWORDS } from '@/shared/constants/allowedNailKeywords'
import { NAIL_KEYWORD_EN_DICTIONARY } from '@/shared/constants/nailKeywords'

/** EN 사전 공식 라벨만 허용 (대소문자 무시). raw literal 폴백 금지. */
const EN_DICTIONARY_VALUE_SET = new Set(
  Object.values(NAIL_KEYWORD_EN_DICTIONARY).map((value) => value.trim().toLowerCase()).filter(Boolean),
)

function matchesAllowedNailKeywords(term: string): boolean {
  return ALLOWED_NAIL_KEYWORDS.some((kw) => term === kw || term.includes(kw))
}

/**
 * 상세 페이지 전용 프리미엄 큐레이션 태그 가드.
 * - KO: ALLOWED_NAIL_KEYWORDS 또는 NAIL_SYNONYMS 인정 용어만
 * - EN: NAIL_KEYWORD_EN_DICTIONARY value만 (seeking 등 미등록 literal 거부)
 */
export function isPremiumCurationTag(tag: string): boolean {
  const bare = String(tag ?? '')
    .replace(/^#+/, '')
    .trim()
  if (!bare) return false

  if (/[가-힣]/.test(bare)) {
    if (matchesAllowedNailKeywords(bare)) return true
    if (isRecognizedNailSynonymTerm(bare)) return true
    return false
  }

  if (/^[a-zA-Z0-9][a-zA-Z0-9\s'-]*$/.test(bare)) {
    return EN_DICTIONARY_VALUE_SET.has(bare.toLowerCase())
  }

  return false
}
