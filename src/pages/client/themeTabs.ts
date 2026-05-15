/** 테마별 모아보기 전용 리스트(`ClientThemeListPage`) 탭 라벨 — V1 Occasion 탭과 동일 순서 */
export const THEME_TAB_LABELS = [
  '전체',
  '🌿 데일리',
  '💍 웨딩',
  '💖 데이트',
  '💼 오피스',
  '✈️ 여행',
  '🎉 파티',
] as const

export type ThemeTabLabel = (typeof THEME_TAB_LABELS)[number]
