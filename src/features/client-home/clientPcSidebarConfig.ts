export type SidebarFilterItem = {
  label: string;
  value: string;
};

export type PcSidebarCategoryId =
  | "ranking"
  | "season"
  | "color"
  | "mood"
  | "shape"
  | "technique";

export type PcSidebarCategoryFilterKey =
  | "rankingFilter"
  | "themeFilter"
  | "colorFilter"
  | "moodFilter"
  | "shapeFilter"
  | "pointFilter";

export const PC_SIDEBAR_RANKING_VALUES = [
  "ranking_weekly",
  "ranking_saves",
  "ranking_views",
] as const;

export type PcSidebarRankingValue = (typeof PC_SIDEBAR_RANKING_VALUES)[number];

export type PcSidebarCategory = {
  id: PcSidebarCategoryId;
  title: string;
  label: string;
  filterKey: PcSidebarCategoryFilterKey;
  items: SidebarFilterItem[];
};

function toSidebarItems(values: readonly string[]): SidebarFilterItem[] {
  return values.map((value) => ({ label: value, value }));
}

export const PC_SIDEBAR_CATEGORIES: readonly PcSidebarCategory[] = [
  {
    id: "ranking",
    title: "TOP RANKING",
    label: "젤리아 TOP 100",
    filterKey: "rankingFilter",
    items: [
      { label: "주간 베스트 디자인", value: "ranking_weekly" },
      { label: "유저 반응 랭킹", value: "ranking_saves" },
      { label: "가장 많이 본 디자인", value: "ranking_views" },
    ],
  },
  {
    id: "season",
    title: "SEASON",
    label: "시즌 / 상황",
    filterKey: "themeFilter",
    items: toSidebarItems([
      "봄",
      "여름",
      "가을",
      "겨울",
      "웨딩/하객",
      "여행/바캉스",
      "데일리",
      "오피스",
      "데이트",
      "파티/페스티벌",
    ]),
  },
  {
    id: "color",
    title: "COLOR",
    label: "컬러",
    filterKey: "colorFilter",
    items: toSidebarItems([
      "화이트/누드",
      "핑크/코랄",
      "레드/버건디",
      "글리터",
      "블루/네이비",
      "파스텔",
      "블랙/무채색",
    ]),
  },
  {
    id: "mood",
    title: "MOOD & STYLE",
    label: "무드 / 스타일",
    filterKey: "moodFilter",
    items: toSidebarItems([
      "심플",
      "러블리",
      "발레코어",
      "올드머니/시크",
      "Y2K/키치",
      "단아/청순",
      "우아한",
      "화려한",
      "힙/스트릿",
    ]),
  },
  {
    id: "shape",
    title: "SHAPE & LENGTH",
    label: "쉐입 / 길이",
    filterKey: "shapeFilter",
    items: toSidebarItems([
      "라운드",
      "아몬드/오발",
      "스퀘어",
      "귀여운 숏네일",
      "우아한 롱/연장",
      "코핀/발레리나",
      "스틸레토",
    ]),
  },
  {
    id: "technique",
    title: "TECHNIQUE",
    label: "포인트 / 기법",
    filterKey: "pointFilter",
    items: toSidebarItems([
      "시럽",
      "그라데이션",
      "프렌치",
      "마블",
      "미러파우더",
      "무광",
      "스톤/큐빅",
      "풀스톤",
      "진주",
      "수채화/드로잉",
      "트위드",
      "애니멀(호피/지브라)",
    ]),
  },
] as const;

export const PC_SIDEBAR_DEFAULT_OPEN_IDS: readonly PcSidebarCategoryId[] = ["ranking", "color"];

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

export function mapRankingFilterToGallerySort(rankingFilter: string): string | null {
  if (rankingFilter === "ranking_weekly") return "인기순";
  if (rankingFilter === "ranking_saves") return "저장 많은 순";
  if (rankingFilter === "ranking_views") return "조회 많은 순";
  return null;
}

export function findRankingSidebarFilter(rankingFilter: string): ActivePcSidebarFilter | null {
  const normalized = rankingFilter.trim();
  if (!normalized || normalized === "전체") return null;

  const rankingCategory = PC_SIDEBAR_CATEGORIES.find((category) => category.id === "ranking");
  const matchedItem = rankingCategory?.items.find((item) => item.value === normalized);
  if (!matchedItem || !rankingCategory) return null;

  return { categoryLabel: rankingCategory.label, filterName: matchedItem.label };
}

export type ActivePcSidebarFilter = {
  categoryLabel: string;
  filterName: string;
};

/** 필터 문자열이 실제로 속한 부모 카테고리를 items 배열 기준으로 탐색 */
export function findPcSidebarCategoryByFilterValue(
  filterValue: string,
): ActivePcSidebarFilter | null {
  const normalized = filterValue.trim();
  if (!normalized || normalized === "전체") return null;

  const parent = PC_SIDEBAR_CATEGORIES.find((category) =>
    category.items.some((item) => item.value === normalized),
  );

  if (!parent) return null;
  return { categoryLabel: parent.label, filterName: normalized };
}

export function findActivePcSidebarFilter(
  filterValues: Record<PcSidebarCategoryFilterKey, string>,
  searchKeyword = "",
  quickChipKeyword: string | null = null,
): ActivePcSidebarFilter | null {
  const trimmedSearch = searchKeyword.trim();
  if (trimmedSearch) {
    return { categoryLabel: "검색", filterName: trimmedSearch };
  }

  const trimmedChip = quickChipKeyword?.trim();
  if (trimmedChip) {
    return findPcSidebarCategoryByFilterValue(trimmedChip) ?? {
      categoryLabel: "트렌드",
      filterName: trimmedChip,
    };
  }

  const rankingMatch = findRankingSidebarFilter(filterValues.rankingFilter ?? "전체");
  if (rankingMatch) return rankingMatch;

  // 여러 카테고리가 동시에 활성일 때, 하단(최근) 카테고리를 우선 매칭
  for (let index = PC_SIDEBAR_CATEGORIES.length - 1; index >= 0; index -= 1) {
    const category = PC_SIDEBAR_CATEGORIES[index];
    if (category.id === "ranking") continue;
    const value = filterValues[category.filterKey]?.trim();
    if (!value || value === "전체") continue;

    const matched = findPcSidebarCategoryByFilterValue(value);
    if (matched && matched.categoryLabel === category.label) {
      return matched;
    }
  }

  return null;
}

export function formatGalleryCount(count: number | null | undefined): string {
  if (count == null || !Number.isFinite(count)) return "—";
  return count.toLocaleString("ko-KR");
}
