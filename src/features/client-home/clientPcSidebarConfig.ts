export type SidebarLocalizedLabel = {
  ko: string;
  en: string;
};

export type SidebarFilterItem = {
  label: SidebarLocalizedLabel;
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
] as const;

export type PcSidebarRankingValue = (typeof PC_SIDEBAR_RANKING_VALUES)[number];

export type PcSidebarCategory = {
  id: PcSidebarCategoryId;
  title: string;
  label: SidebarLocalizedLabel;
  filterKey: PcSidebarCategoryFilterKey;
  items: SidebarFilterItem[];
};

export function resolveSidebarLabel(
  label: SidebarLocalizedLabel | string,
  isEnglish: boolean,
): string {
  if (typeof label === "string") return label;
  return isEnglish ? label.en : label.ko;
}

function localizedItem(ko: string, en: string, value?: string): SidebarFilterItem {
  return { label: { ko, en }, value: value ?? ko };
}

function localizedItems(entries: readonly (readonly [ko: string, en: string])[]): SidebarFilterItem[] {
  return entries.map(([ko, en]) => localizedItem(ko, en));
}

export const PC_SIDEBAR_CATEGORIES: readonly PcSidebarCategory[] = [
  {
    id: "ranking",
    title: "TOP RANKING",
    label: { ko: "젤리아 TOP 100", en: "GELIA TOP 100" },
    filterKey: "rankingFilter",
    items: [
      localizedItem("주간 베스트 디자인", "Weekly Best", "ranking_weekly"),
      localizedItem("유저 반응 랭킹", "User Reaction Ranking", "ranking_saves"),
    ],
  },
  {
    id: "season",
    title: "SEASON",
    label: { ko: "시즌 / 상황", en: "Season / Occasion" },
    filterKey: "themeFilter",
    items: localizedItems([
      ["봄", "Spring"],
      ["여름", "Summer"],
      ["가을", "Fall"],
      ["겨울", "Winter"],
      ["웨딩/하객", "Wedding / Guest"],
      ["여행/바캉스", "Travel / Vacation"],
      ["데일리", "Daily"],
      ["오피스", "Office"],
      ["데이트", "Date"],
      ["파티/페스티벌", "Party / Festival"],
    ]),
  },
  {
    id: "color",
    title: "COLOR",
    label: { ko: "컬러", en: "Color" },
    filterKey: "colorFilter",
    items: localizedItems([
      ["화이트/누드", "White / Nude"],
      ["핑크/코랄", "Pink / Coral"],
      ["레드/버건디", "Red / Burgundy"],
      ["글리터", "Glitter"],
      ["블루/네이비", "Blue / Navy"],
      ["파스텔", "Pastel"],
      ["블랙/무채색", "Black / Neutral"],
    ]),
  },
  {
    id: "mood",
    title: "MOOD & STYLE",
    label: { ko: "무드 / 스타일", en: "Mood / Style" },
    filterKey: "moodFilter",
    items: localizedItems([
      ["심플", "Simple"],
      ["러블리", "Lovely"],
      ["발레코어", "Balletcore"],
      ["올드머니/시크", "Old Money / Chic"],
      ["Y2K/키치", "Y2K / Kitsch"],
      ["단아/청순", "Elegant / Innocent"],
      ["우아한", "Graceful"],
      ["화려한", "Glamorous"],
      ["힙/스트릿", "Hip / Street"],
    ]),
  },
  {
    id: "shape",
    title: "SHAPE & LENGTH",
    label: { ko: "쉐입 / 길이", en: "Shape / Length" },
    filterKey: "shapeFilter",
    items: localizedItems([
      ["라운드", "Round"],
      ["아몬드/오발", "Almond / Oval"],
      ["스퀘어", "Square"],
      ["귀여운 숏네일", "Cute Short Nails"],
      ["우아한 롱/연장", "Elegant Long / Extensions"],
      ["코핀/발레리나", "Coffin / Ballerina"],
      ["스틸레토", "Stiletto"],
    ]),
  },
  {
    id: "technique",
    title: "TECHNIQUE",
    label: { ko: "포인트 / 기법", en: "Point / Technique" },
    filterKey: "pointFilter",
    items: localizedItems([
      ["시럽", "Syrup"],
      ["그라데이션", "Gradient"],
      ["프렌치", "French"],
      ["마블", "Marble"],
      ["미러파우더", "Mirror Powder"],
      ["무광", "Matte"],
      ["스톤/큐빅", "Stone / Rhinestone"],
      ["풀스톤", "Full Stone"],
      ["진주", "Pearl"],
      ["수채화/드로잉", "Watercolor / Drawing"],
      ["트위드", "Tweed"],
    ]),
  },
] as const;

export const PC_SIDEBAR_DEFAULT_OPEN_IDS: readonly PcSidebarCategoryId[] = ["ranking"];

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
  categoryLabel: SidebarLocalizedLabel;
  filterName: SidebarLocalizedLabel | string;
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

  const matchedItem = parent.items.find((item) => item.value === normalized);
  return {
    categoryLabel: parent.label,
    filterName: matchedItem?.label ?? { ko: normalized, en: normalized },
  };
}

export function findActivePcSidebarFilter(
  filterValues: Record<PcSidebarCategoryFilterKey, string>,
  searchKeyword = "",
  quickChipKeyword: string | null = null,
): ActivePcSidebarFilter | null {
  const trimmedSearch = searchKeyword.trim();
  if (trimmedSearch) {
    return {
      categoryLabel: { ko: "검색", en: "Search" },
      filterName: trimmedSearch,
    };
  }

  const trimmedChip = quickChipKeyword?.trim();
  if (trimmedChip) {
    return (
      findPcSidebarCategoryByFilterValue(trimmedChip) ?? {
        categoryLabel: { ko: "트렌드", en: "Trend" },
        filterName: trimmedChip,
      }
    );
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
    if (matched && matched.categoryLabel.ko === category.label.ko) {
      return matched;
    }
  }

  return null;
}

export function formatGalleryCount(count: number | null | undefined): string {
  if (count == null || !Number.isFinite(count)) return "—";
  return count.toLocaleString("ko-KR");
}
