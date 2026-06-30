export type SidebarFilterItem = {
  label: string;
  value: string;
};

function toSidebarItems(values: readonly string[]): SidebarFilterItem[] {
  return values.map((value) => ({ label: value, value }));
}

export const PC_TODAY_TREND_SIDEBAR = toSidebarItems([
  "치크/아우라",
  "자석",
  "유리알/얼음",
  "에어브러시",
  "3D/엠보",
  "리본",
]);

export const PC_COLOR_SIDEBAR = toSidebarItems([
  "화이트/누드",
  "핑크/코랄",
  "레드/버건디",
  "블루/네이비",
  "블랙/무채색",
  "파스텔",
  "글리터",
]);

export const PC_MOOD_SIDEBAR = toSidebarItems([
  "심플",
  "단아/청순",
  "러블리",
  "우아한",
  "화려한",
  "힙/스트릿",
  "발레코어",
  "올드머니/시크",
  "Y2K/키치",
]);

export const PC_POINT_SIDEBAR = toSidebarItems([
  "시럽",
  "무광",
  "프렌치",
  "마블",
  "그라데이션",
  "수채화/드로잉",
  "트위드",
  "스톤/큐빅",
  "풀스톤",
  "진주",
  "미러파우더",
  "애니멀(호피/지브라)",
]);

export const PC_SEASON_SIDEBAR = toSidebarItems([
  "봄",
  "여름",
  "가을",
  "겨울",
  "데일리",
  "데이트",
  "오피스",
  "웨딩/하객",
  "여행/바캉스",
  "파티/페스티벌",
]);

export const PC_SHAPE_SIDEBAR = toSidebarItems([
  "귀여운 숏네일",
  "우아한 롱/연장",
  "라운드",
  "스퀘어",
  "아몬드/오발",
  "코핀/발레리나",
  "스틸레토",
]);

export const PC_GALLERY_SORT_TABS = [
  { id: "인기순", label: "인기순" },
  { id: "최신순", label: "최신순" },
  { id: "추천순", label: "추천순" },
] as const;

export type PcGallerySortTab = (typeof PC_GALLERY_SORT_TABS)[number]["id"];

export const PC_QUICK_TREND_CHIP_FALLBACK = [
  "웨딩",
  "여름바캉스",
  "얼음네일",
  "발레코어",
  "시럽",
] as const;

export function mapPcGallerySortToQuery(sort: PcGallerySortTab): string {
  if (sort === "최신순") return "최신순";
  if (sort === "추천순") return "저장 많은 순";
  return "인기순";
}
