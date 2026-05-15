/** 스타일별 모아보기 전용 리스트(`ClientStyleListPage`) 탭 라벨 */
export const STYLE_TAB_LABELS = [
  '전체',
  '✨ 심플',
  '💎 화려한',
  '🌙 프렌치',
  '🌈 그라데이션',
  '🖍️ 드로잉',
] as const

export type StyleTabLabel = (typeof STYLE_TAB_LABELS)[number]
