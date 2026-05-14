/** URL `tab` 값 — `pages/client/galleryStyleTabs.ts`와 동일해야 합니다 */
export type QuizGalleryTab =
  | '🍒 귀여운 숏네일'
  | '🦢 우아한 롱/연장'
  | '💧 아몬드/오발'

export type QuizQuestion = {
  id: string
  prompt: string
  options: readonly { label: string; value: string }[]
}

/** Q1 스타일 성향, Q2 길이, Q3 분위기 — value는 결과 매핑에 사용 */
export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'style',
    prompt: '평소 선호하는 스타일은?',
    options: [
      { label: '심플', value: 'simple' },
      { label: '화려한', value: 'glam' },
    ],
  },
  {
    id: 'length',
    prompt: '현재 손톱 길이는?',
    options: [
      { label: '숏네일', value: 'short' },
      { label: '롱 / 연장', value: 'long' },
    ],
  },
  {
    id: 'vibe',
    prompt: '좋아하는 분위기는?',
    options: [
      { label: '귀여운', value: 'cute' },
      { label: '우아한', value: 'elegant' },
    ],
  },
] as const

export const QUIZ_TOTAL_STEPS = QUIZ_QUESTIONS.length

/**
 * 답변(단계 인덱스 → option value)을 갤러리 `tab` 쿼리 문자열로 매핑합니다.
 * 없는 조합은 `전체` 대신 가장 가까운 테마 탭으로 보냅니다.
 */
export function resolveQuizGalleryTab(
  answers: Readonly<Record<number, string>>,
): QuizGalleryTab {
  const style = answers[0]
  const length = answers[1]
  const vibe = answers[2]

  if (length === 'short' && vibe === 'cute') return '🍒 귀여운 숏네일'
  if (length === 'long' && vibe === 'elegant') return '🦢 우아한 롱/연장'

  if (length === 'short' && vibe === 'elegant') {
    return style === 'glam' ? '🦢 우아한 롱/연장' : '💧 아몬드/오발'
  }
  if (length === 'long' && vibe === 'cute') {
    return style === 'glam' ? '🍒 귀여운 숏네일' : '💧 아몬드/오발'
  }

  if (style === 'glam') return '🦢 우아한 롱/연장'
  if (style === 'simple') return '💧 아몬드/오발'
  return '🍒 귀여운 숏네일'
}
