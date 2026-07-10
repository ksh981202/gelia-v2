/**
 * PRO 룩북(큐레이션/컬렉션) 제목 KO → EN 매핑.
 * DB `pro_lookbooks`에 title_en 컬럼이 아직 없으므로, 알려진 제목은 클라이언트에서 보강한다.
 */
const LOOKBOOK_TITLE_EN_BY_KO: Record<string, string> = {
  "데이트 네일": "Date Night Nails",
  "오피스 네일모음": "Office & Daily Collection",
  "오피스 네일 모음": "Office & Daily Collection",
  "여름 휴가 네일": "Summer Vacation Nails",
  "웨딩네일 모음": "Bridal & Wedding Collection",
  "웨딩 네일 모음": "Bridal & Wedding Collection",
  "페스티벌 네일 모음": "Festival & Party Nails",
};

function normalizeLookbookTitleKey(title: string): string {
  return title.trim().replace(/\s+/g, " ");
}

/** DB title_en 또는 로컬 맵에서 영문 제목을 해석한다. */
export function resolveLookbookTitleEn(
  title: string | null | undefined,
  titleEn?: string | null,
): string {
  const en = String(titleEn ?? "").trim();
  if (en) return en;

  const ko = normalizeLookbookTitleKey(String(title ?? ""));
  if (!ko) return "";

  return LOOKBOOK_TITLE_EN_BY_KO[ko] ?? LOOKBOOK_TITLE_EN_BY_KO[ko.replace(/\s/g, "")] ?? "";
}

/** 화면 표시용 룩북 제목 (EN 모드 폴백 포함) */
export function resolveLookbookDisplayTitle(
  title: string | null | undefined,
  titleEn: string | null | undefined,
  isEnglish: boolean,
): string {
  const ko = String(title ?? "").trim();
  const en = resolveLookbookTitleEn(ko, titleEn);
  if (isEnglish) return en || ko;
  return ko || en;
}

/** fetch 결과 객체에 title_en을 보강한다. */
export function withLookbookTitleEn<T extends { title: string; title_en?: string | null }>(
  item: T,
): T & { title_en: string } {
  return {
    ...item,
    title_en: resolveLookbookTitleEn(item.title, item.title_en),
  };
}
