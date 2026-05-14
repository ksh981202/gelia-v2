import { NailListExplore } from '../../widgets/nail-list/NailListExplore'

const THEME_TABS = [
  '전체',
  '오피스',
  '파티',
  '데일리',
  '웨딩',
  '시즌',
] as const

export default function ClientPage() {
  return (
    <NailListExplore
      tabs={THEME_TABS}
      tabsSectionLabel="테마"
      queryScope="theme"
    />
  )
}
