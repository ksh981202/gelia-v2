import type { NailDesignRow } from '@/shared/types/database.types'

type NailTitleFields = Pick<NailDesignRow, 'title' | 'title_en'>

type NailSeoAltFields = NailTitleFields &
  Partial<
    Pick<
      NailDesignRow,
      'color' | 'color_en' | 'nail_length' | 'length_en' | 'styles' | 'styles_en'
    >
  >

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = String(value ?? '').trim()
    if (trimmed) return trimmed
  }
  return ''
}

function firstArrayItem(values: string[] | null | undefined): string {
  if (!Array.isArray(values)) return ''
  for (const value of values) {
    const trimmed = String(value ?? '').trim()
    if (trimmed) return trimmed
  }
  return ''
}

/** 리스트/카드에 보이는 짧은 제목 */
export function displayItemTitle(item: NailTitleFields, isEnglish: boolean): string {
  const ko = String(item.title ?? '').trim()
  const en = String(item.title_en ?? '').trim()
  if (isEnglish && en) return en
  return ko || en || (isEnglish ? 'Nail Design' : '네일 디자인')
}

/**
 * 구글 이미지 검색용 롱테일 alt
 * 예) "라벤더 마블 데일리 - 보라색 코핀 네일 디자인 | GELIA"
 */
export function buildNailImageSeoAlt(item: NailSeoAltFields, isEnglish: boolean): string {
  const title = displayItemTitle(item, isEnglish)
  const color = isEnglish
    ? firstNonEmpty(item.color_en, item.color)
    : firstNonEmpty(item.color, item.color_en)
  const shape = isEnglish
    ? firstNonEmpty(item.length_en, item.nail_length)
    : firstNonEmpty(item.nail_length, item.length_en)
  const style = isEnglish
    ? firstNonEmpty(firstArrayItem(item.styles_en), firstArrayItem(item.styles))
    : firstNonEmpty(firstArrayItem(item.styles), firstArrayItem(item.styles_en))

  const metaBits = [color, shape, style].filter(Boolean)
  if (metaBits.length === 0) {
    return isEnglish ? `${title} nail design | GELIA` : `${title} 네일 디자인 | GELIA`
  }

  const meta = metaBits.join(' ')
  return isEnglish
    ? `${title} - ${meta} nail design | GELIA`
    : `${title} - ${meta} 네일 디자인 | GELIA`
}
