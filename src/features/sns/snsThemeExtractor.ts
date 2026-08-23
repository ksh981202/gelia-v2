import type { NailDesignRow } from "@/shared/types/database.types";
import { PC_SIDEBAR_CATEGORIES, PC_QUICK_TREND_CHIP_FALLBACK } from "@/features/client-home/clientPcSidebarConfig";
import { NAIL_KEYWORD_EN_DICTIONARY } from "@/shared/constants/nailKeywords";
import { SEASON_TABS } from "@/pages/client/seasonTabs";
import { SITUATION_TAB_LABELS } from "@/pages/client/situationTabs";
import { THEME_TAB_LABELS } from "@/pages/client/themeTabs";
import { COLOR_LIST_TABS } from "@/pages/client/colorTabs";
import { COLOR_POPULAR_TABS } from "@/pages/client/colorPopularTabs";
import { COLOR_THEME_TABS } from "@/pages/client/colorThemeTabs";
import { STYLE_TAB_LABELS } from "@/pages/client/styleTabs";
import { VACATION_TABS } from "@/pages/client/vacationTabs";
import { SEASON_POPULAR_TABS } from "@/pages/client/seasonPopularTabs";
import { normalizeForFilter } from "@/shared/utils/normalizeForFilter";

export type SnsSourceNail = Pick<
  NailDesignRow,
  | "id"
  | "title"
  | "title_en"
  | "image_url"
  | "source_filename"
  | "category"
  | "situations"
  | "styles"
  | "tags"
  | "design_elements"
  | "popularity"
>;

const GL_ID_DIGIT_LEN = 7;

const PINTEREST_PIN_SLOTS = [
  { flag: "🇺🇸", ordinal: 1, langLabel: "영어(EN)", langHint: "영문" },
  { flag: "🇯🇵", ordinal: 2, langLabel: "일본어(JP)", langHint: "일본어" },
  { flag: "🇻🇳", ordinal: 3, langLabel: "베트남어(VN)", langHint: "베트남어" },
  { flag: "🇹🇭", ordinal: 4, langLabel: "태국어(TH)", langHint: "태국어" },
  { flag: "🇰🇷", ordinal: 5, langLabel: "한국어(KR)", langHint: "한국어" },
] as const;

/** GCE AdminGceDashboardPage formatGlAssetId 동기화 */
export function formatGlAssetId(
  rawId: string | number | null | undefined,
  sourceFilename?: string | null,
): string {
  const fromFile = String(sourceFilename ?? "").match(/GL-(\d+)/i);
  if (fromFile?.[1]) {
    return `GL-${fromFile[1].padStart(GL_ID_DIGIT_LEN, "0")}`;
  }

  const idStr = String(rawId ?? "").trim();
  if (/^\d+$/.test(idStr)) {
    return `GL-${idStr.padStart(GL_ID_DIGIT_LEN, "0")}`;
  }

  const digits = idStr.match(/(\d+)/)?.[1];
  if (digits) {
    return `GL-${digits.padStart(GL_ID_DIGIT_LEN, "0")}`;
  }

  return `GL-${"0".repeat(GL_ID_DIGIT_LEN)}`;
}

export type SnsThemeBasis =
  | "season"
  | "situation"
  | "color"
  | "mood"
  | "style"
  | "shape"
  | "texture"
  | "technique"
  | "trend";

export type SnsThemeSet = {
  id: string;
  basis: SnsThemeBasis;
  key: string;
  title: string;
  nails: SnsSourceNail[];
};

type ThemePoolEntry = {
  basis: SnsThemeBasis;
  display: string;
  includeKeywords: string[];
  excludeKeywords: string[];
};

const SET_TARGET_COUNT = 5;
const NAILS_PER_SET = 5;

const SEASON_CORE_KEYS = ["봄", "여름", "가을", "겨울"] as const;

/** ClientSeasonPopularListPage SEASON_BASE_KEYWORD_MAPPING 동기화 */
const SEASON_BASE_KEYWORD_MAPPING: Record<string, string[]> = {
  봄: ["봄", "spring", "스프링", "파스텔", "웜톤", "화사한", "벚꽃"],
  여름: ["여름", "summer", "썸머", "바다", "휴양지", "바캉스", "청량"],
  가을: ["가을", "autumn", "fall", "무화과", "버건디", "브라운", "웜톤", "단풍"],
  겨울: ["겨울", "winter", "눈", "크리스마스", "니트", "트위드", "쿨톤"],
};

const SEASON_EXCLUDE_KEYWORDS: Record<string, string[]> = {
  봄: ["여름", "가을", "겨울", "바캉스", "수영장", "해변", "썸머", "summer", "winter", "크리스마스", "니트"],
  여름: ["겨울", "눈꽃", "크리스마스", "니트", "겨울밤", "winter", "눈", "트위드", "스노우"],
  가을: ["여름", "바캉스", "수영장", "해변", "썸머", "summer", "네온", "비치", "리조트"],
  겨울: ["여름", "바캉스", "수영장", "해변", "썸머", "summer", "바다", "휴양지", "비치", "청량"],
};

const SEASON_SUBTAB_INCLUDE_MAPPING: Record<string, string[]> = {
  "벚꽃/플라워": ["벚꽃", "플라워", "꽃", "생화", "봄꽃", "플로럴"],
  "피치/코랄": ["피치", "코랄", "살구", "복숭아", "오렌지"],
  "파스텔/생기": ["파스텔", "생기", "민트", "연보라", "레몬", "마카롱"],
  "바다/해변": ["바다", "해변", "오션", "휴양지", "바캉스", "파도", "청량"],
  "시럽/투명": ["시럽", "투명", "클리어", "젤리", "맑은", "물방울"],
  "네온/비비드": ["네온", "비비드", "형광", "팝", "원색", "썸머"],
  "낙엽/브릭": ["낙엽", "브릭", "단풍", "테라코타", "어텀", "오렌지"],
  "매트/무광": ["매트", "무광", "벨벳", "보송한", "가을"],
  "레오파드/호피": ["레오파드", "호피", "애니멀", "표범"],
  "눈꽃/니트": ["눈꽃", "니트", "스노우", "눈", "화이트", "포근한"],
  크리스마스: ["크리스마스", "연말", "홀리데이", "트리"],
  "버건디/벨벳": ["버건디", "벨벳", "와인", "딥", "레드", "겨울"],
};

const SEASON_SUBTAB_EXCLUDE_KEYWORDS: Record<string, string[]> = {
  "벚꽃/플라워": ["여름", "바캉스", "수영장", "겨울", "크리스마스", "summer", "winter"],
  "피치/코랄": ["겨울", "눈꽃", "니트", "winter"],
  "파스텔/생기": ["겨울", "다크", "블랙", "winter"],
  "바다/해변": ["겨울", "눈꽃", "크리스마스", "니트", "겨울밤", "winter", "눈"],
  "시럽/투명": ["겨울", "니트", "트위드"],
  "네온/비비드": ["겨울", "눈꽃", "니트", "winter", "크리스마스"],
  "낙엽/브릭": ["여름", "바캉스", "수영장", "summer", "해변"],
  "매트/무광": ["여름", "바캉스", "네온", "summer"],
  "레오파드/호피": ["웨딩", "하객", "청순"],
  "눈꽃/니트": ["여름", "바캉스", "수영장", "해변", "썸머", "summer", "바다"],
  크리스마스: ["여름", "바캉스", "수영장", "해변", "summer"],
  "버건디/벨벳": ["여름", "바캉스", "수영장", "summer", "해변"],
};

const SITUATION_EXCLUDE_KEYWORDS: Record<string, string[]> = {
  웨딩: ["할로윈", "바캉스", "다크", "힙한", "파티", "클럽", "네온", "할로윈"],
  하객: ["할로윈", "바캉스", "다크", "힙한", "파티", "클럽"],
  "웨딩/하객": ["할로윈", "바캉스", "다크", "힙한", "파티", "클럽"],
  "여행/바캉스": ["겨울", "눈꽃", "크리스마스", "니트", "winter", "오피스", "출근"],
  바캉스: ["겨울", "눈꽃", "크리스마스", "니트", "겨울밤", "winter", "눈", "오피스"],
  여행: ["겨울", "크리스마스", "니트", "오피스", "출근"],
  오피스: ["파티", "클럽", "할로윈", "바캉스", "수영장", "네온", "풀스톤"],
  "파티/페스티벌": ["오피스", "출근", "데일리", "웨딩", "하객"],
  파티: ["오피스", "출근", "데일리", "웨딩"],
  페스티벌: ["오피스", "웨딩", "하객"],
  데이트: ["할로윈", "오피스", "출근"],
  데일리: ["파티", "클럽", "웨딩", "할로윈"],
  "데일리/오피스": ["파티", "클럽", "바캉스", "할로윈"],
};

const MOOD_EXCLUDE_KEYWORDS: Record<string, string[]> = {
  심플: ["화려한", "풀스톤", "블링", "블링블링", "파티"],
  화려한: ["심플", "미니멀", "데일리", "오피스"],
  러블리: ["다크", "시크", "블랙", "힙한"],
  "올드머니/시크": ["키치", "Y2K", "네온", "귀여운"],
  "Y2K/키치": ["올드머니", "우아한", "웨딩", "청순"],
  "단아/청순": ["힙한", "다크", "파티", "클럽"],
  우아한: ["키치", "Y2K", "힙한", "할로윈"],
  "힙/스트릿": ["웨딩", "하객", "청순", "우아한"],
  발레코어: ["힙한", "Y2K", "다크", "할로윈"],
};

const SEASON_DICTIONARY_BLOCKLIST = new Set<string>([...SEASON_CORE_KEYS, "spring", "summer", "autumn", "winter"]);

const SIDEBAR_BASIS_MAP: Record<string, SnsThemeBasis> = {
  season: "season",
  color: "color",
  mood: "mood",
  shape: "shape",
  technique: "technique",
};

function stripDecorations(raw: string): string {
  return String(raw ?? "")
    .replace(/[^\u3131-\u318E\uAC00-\uD7A3a-zA-Z0-9\s/·]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywordsFromLabel(raw: string): string[] {
  const cleaned = stripDecorations(raw);
  if (!cleaned || cleaned === "전체") return [];

  const slashParts = cleaned
    .split(/[/·]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (slashParts.length > 1) {
    return Array.from(new Set([cleaned, ...slashParts]));
  }

  return [cleaned];
}

function resolveExcludeKeywords(basis: SnsThemeBasis, display: string): string[] {
  const normalizedDisplay = normalizeForFilter(display);

  if (basis === "season") {
    for (const [seasonKey, excludes] of Object.entries(SEASON_EXCLUDE_KEYWORDS)) {
      if (normalizeForFilter(seasonKey) === normalizedDisplay) return excludes;
    }
    for (const [subKey, excludes] of Object.entries(SEASON_SUBTAB_EXCLUDE_KEYWORDS)) {
      if (normalizeForFilter(subKey) === normalizedDisplay) return excludes;
    }
  }

  if (basis === "situation") {
    for (const [situationKey, excludes] of Object.entries(SITUATION_EXCLUDE_KEYWORDS)) {
      const normalizedKey = normalizeForFilter(situationKey);
      if (
        normalizedKey === normalizedDisplay ||
        normalizedDisplay.includes(normalizedKey) ||
        normalizedKey.includes(normalizedDisplay)
      ) {
        return excludes;
      }
    }
  }

  if (basis === "mood") {
    for (const [moodKey, excludes] of Object.entries(MOOD_EXCLUDE_KEYWORDS)) {
      const normalizedKey = normalizeForFilter(moodKey);
      if (
        normalizedKey === normalizedDisplay ||
        normalizedDisplay.includes(normalizedKey) ||
        normalizedKey.includes(normalizedDisplay)
      ) {
        return excludes;
      }
    }
  }

  return [];
}

function resolveSeasonIncludeKeywords(display: string): string[] | null {
  const normalizedDisplay = normalizeForFilter(display);

  for (const seasonKey of SEASON_CORE_KEYS) {
    if (normalizeForFilter(seasonKey) === normalizedDisplay) {
      return SEASON_BASE_KEYWORD_MAPPING[seasonKey];
    }
  }

  for (const [subKey, includes] of Object.entries(SEASON_SUBTAB_INCLUDE_MAPPING)) {
    if (normalizeForFilter(subKey) === normalizedDisplay) {
      return includes;
    }
  }

  return null;
}

function addPoolEntry(
  pool: ThemePoolEntry[],
  seen: Set<string>,
  basis: SnsThemeBasis,
  rawLabel: string,
  options?: {
    includeKeywords?: string[];
    excludeKeywords?: string[];
  },
) {
  const parsedIncludes = options?.includeKeywords ?? extractKeywordsFromLabel(rawLabel);
  if (parsedIncludes.length === 0) return;

  const display = stripDecorations(rawLabel).split(/[/·]/)[0]?.trim() || parsedIncludes[0];
  const dedupeKey = `${basis}:${normalizeForFilter(display)}`;
  if (seen.has(dedupeKey)) return;

  seen.add(dedupeKey);
  pool.push({
    basis,
    display,
    includeKeywords: parsedIncludes,
    excludeKeywords: options?.excludeKeywords ?? resolveExcludeKeywords(basis, display),
  });
}

function addStrictSeasonEntries(pool: ThemePoolEntry[], seen: Set<string>) {
  for (const seasonKey of SEASON_CORE_KEYS) {
    addPoolEntry(pool, seen, "season", seasonKey, {
      includeKeywords: SEASON_BASE_KEYWORD_MAPPING[seasonKey],
      excludeKeywords: SEASON_EXCLUDE_KEYWORDS[seasonKey],
    });
  }

  for (const [subKey, includeKeywords] of Object.entries(SEASON_SUBTAB_INCLUDE_MAPPING)) {
    addPoolEntry(pool, seen, "season", subKey, {
      includeKeywords,
      excludeKeywords: SEASON_SUBTAB_EXCLUDE_KEYWORDS[subKey] ?? [],
    });
  }
}

function buildAllThemesPool(): ThemePoolEntry[] {
  const pool: ThemePoolEntry[] = [];
  const seen = new Set<string>();

  addStrictSeasonEntries(pool, seen);

  for (const category of PC_SIDEBAR_CATEGORIES) {
    if (category.id === "ranking") continue;
    const basis = SIDEBAR_BASIS_MAP[category.id] ?? "trend";

    for (const item of category.items) {
      if (basis === "season") {
        const strictIncludes = resolveSeasonIncludeKeywords(item.label.ko);
        if (strictIncludes) {
          addPoolEntry(pool, seen, basis, item.label.ko, {
            includeKeywords: strictIncludes,
            excludeKeywords: resolveExcludeKeywords(basis, stripDecorations(item.label.ko)),
          });
          continue;
        }
      }
      addPoolEntry(pool, seen, basis, item.label.ko);
    }
  }

  const tabSources: Array<[SnsThemeBasis, readonly string[]]> = [
    ["season", SEASON_TABS],
    ["situation", SITUATION_TAB_LABELS],
    ["situation", THEME_TAB_LABELS],
    ["color", COLOR_LIST_TABS],
    ["color", COLOR_POPULAR_TABS],
    ["color", COLOR_THEME_TABS],
    ["style", STYLE_TAB_LABELS],
    ["situation", VACATION_TABS],
  ];

  for (const [basis, tabs] of tabSources) {
    for (const tab of tabs) {
      if (basis === "season") {
        const label = stripDecorations(tab);
        const strictIncludes = resolveSeasonIncludeKeywords(label);
        if (strictIncludes) {
          addPoolEntry(pool, seen, basis, label, {
            includeKeywords: strictIncludes,
            excludeKeywords: resolveExcludeKeywords(basis, label),
          });
          continue;
        }
      }
      addPoolEntry(pool, seen, basis, tab);
    }
  }

  for (const seasonTabs of Object.values(SEASON_POPULAR_TABS)) {
    for (const tab of seasonTabs) {
      const label = stripDecorations(tab);
      const strictIncludes = resolveSeasonIncludeKeywords(label);
      if (strictIncludes) {
        addPoolEntry(pool, seen, "season", label, {
          includeKeywords: strictIncludes,
          excludeKeywords: resolveExcludeKeywords("season", label),
        });
      }
    }
  }

  for (const chip of PC_QUICK_TREND_CHIP_FALLBACK) {
    if (SEASON_DICTIONARY_BLOCKLIST.has(chip.trim())) continue;
    addPoolEntry(pool, seen, "trend", chip);
  }

  for (const keyword of Object.keys(NAIL_KEYWORD_EN_DICTIONARY)) {
    if (SEASON_DICTIONARY_BLOCKLIST.has(keyword.trim())) continue;
    addPoolEntry(pool, seen, "trend", keyword);
  }

  const extraTechnique = ["시럽", "무광", "글리터", "자석", "미러파우더", "마블", "프렌치", "그라데이션"];
  for (const keyword of extraTechnique) {
    addPoolEntry(pool, seen, "texture", keyword);
  }

  return pool;
}

export const ALL_THEMES_POOL: ThemePoolEntry[] = buildAllThemesPool();

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function joinSearchHaystack(row: SnsSourceNail): string {
  const parts = [
    row.title,
    row.title_en,
    row.category,
    ...(Array.isArray(row.situations) ? row.situations : []),
    ...(Array.isArray(row.styles) ? row.styles : []),
    ...(Array.isArray(row.tags) ? row.tags : []),
    row.design_elements,
  ];
  return parts
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesThemeKeywords(
  haystack: string,
  includeKeywords: string[],
  excludeKeywords: string[] = [],
): boolean {
  const hasExcluded = excludeKeywords.some((keyword) => {
    const normalized = keyword.trim().toLowerCase();
    return normalized.length > 0 && haystack.includes(normalized);
  });
  if (hasExcluded) return false;

  return includeKeywords.some((keyword) => {
    const normalized = keyword.trim().toLowerCase();
    return normalized.length > 0 && haystack.includes(normalized);
  });
}

function buildSetTitle(entry: ThemePoolEntry): string {
  switch (entry.basis) {
    case "season":
      return `${entry.display} 시즌 테마 세트`;
    case "situation":
      return `${entry.display} 테마 세트`;
    case "color":
      return `${entry.display} 컬러 테마 세트`;
    case "mood":
      return `${entry.display} 무드 테마 세트`;
    case "style":
      return `${entry.display} 스타일 테마 세트`;
    case "shape":
      return `${entry.display} 쉐입 테마 세트`;
    case "texture":
      return `${entry.display} 텍스처 테마 세트`;
    case "technique":
      return `${entry.display} 기법 테마 세트`;
    default:
      return `${entry.display} 트렌드 테마 세트`;
  }
}

function pickRandomNails(rows: SnsSourceNail[], entry: ThemePoolEntry): SnsSourceNail[] | null {
  const matched = rows.filter((row) =>
    matchesThemeKeywords(
      joinSearchHaystack(row),
      entry.includeKeywords,
      entry.excludeKeywords,
    ),
  );
  if (matched.length < NAILS_PER_SET) return null;
  return shuffleArray(matched).slice(0, NAILS_PER_SET);
}

export function buildSnsThemeSets(rows: SnsSourceNail[]): SnsThemeSet[] {
  const shuffledRows = shuffleArray(rows);
  const shuffledPool = shuffleArray(ALL_THEMES_POOL);
  const sets: SnsThemeSet[] = [];
  const usedThemeKeys = new Set<string>();

  let poolIndex = 0;
  while (sets.length < SET_TARGET_COUNT && poolIndex < shuffledPool.length) {
    const entry = shuffledPool[poolIndex];
    poolIndex += 1;

    const themeKey = `${entry.basis}:${normalizeForFilter(entry.display)}`;
    if (usedThemeKeys.has(themeKey)) continue;

    const picked = pickRandomNails(shuffledRows, entry);
    if (!picked) continue;

    usedThemeKeys.add(themeKey);
    sets.push({
      id: `${entry.basis}:${entry.display}:${Date.now()}-${sets.length}`,
      basis: entry.basis,
      key: entry.display,
      title: buildSetTitle(entry),
      nails: picked,
    });
  }

  return sets;
}

export const SNS_THEME_BASIS_BADGE: Record<SnsThemeBasis, string> = {
  season: "SEASON",
  situation: "THEME",
  color: "COLOR",
  mood: "MOOD",
  style: "STYLE",
  shape: "SHAPE",
  texture: "TEXTURE",
  technique: "TECHNIQUE",
  trend: "TREND",
};

function buildNailDataList(set: SnsThemeSet): string {
  return set.nails
    .map((nail, index) => {
      const glId = formatGlAssetId(nail.id, nail.source_filename);
      const situations = Array.isArray(nail.situations) ? nail.situations.join(", ") : "";
      const styles = Array.isArray(nail.styles) ? nail.styles.join(", ") : "";
      const tags = Array.isArray(nail.tags) ? nail.tags.join(", ") : "";
      const title = String(nail.title ?? "").trim() || "네일 디자인";
      const titleEn = String(nail.title_en ?? "").trim();

      return [
        `${index + 1}. [IMAGE_${glId}] ${title}`,
        `   - GL ID: ${glId}`,
        `   - title: ${title}`,
        titleEn ? `   - title_en: ${titleEn}` : null,
        `   - category: ${nail.category}`,
        situations ? `   - situations: ${situations}` : null,
        styles ? `   - styles: ${styles}` : null,
        tags ? `   - tags: ${tags}` : null,
        nail.design_elements ? `   - design_elements: ${nail.design_elements}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function buildPinterestPinSections(nails: SnsSourceNail[]): string {
  return nails
    .slice(0, NAILS_PER_SET)
    .map((nail, index) => {
      const slot = PINTEREST_PIN_SLOTS[index];
      const glId = formatGlAssetId(nail.id, nail.source_filename);
      const name = String(nail.title ?? "").trim() || "네일 디자인";
      const imageTag = `[IMAGE_${glId}]`;

      if (index === 0) {
        return [
          "",
          "",
          imageTag,
          "",
          "",
          `${slot.flag} ${slot.ordinal}번 사진: ${name} - ${slot.langLabel}`,
          "- [썸네일 텍스트] : (사진에 얹을 초간결 영문 카피)",
          "- [제목] : (검색 최적화 영문 핀 제목)",
          "- [짧은 본문] : (디자인 특징을 담은 아주 짧은 1줄 영문 설명)",
          "- [해시태그] : (영문 해시태그 10개)",
        ].join("\n");
      }

      return [
        "",
        "",
        imageTag,
        "",
        "",
        `${slot.flag} ${slot.ordinal}번 사진: ${name} - ${slot.langLabel}`,
        `- (1번 사진과 동일한 초간결 포맷으로 '${slot.langHint}'로 작성)`,
      ].join("\n");
    })
    .join("\n");
}

export function buildSnsMarketingPrompt(set: SnsThemeSet): string {
  const nailDataList = buildNailDataList(set);
  const pinterestSections = buildPinterestPinSections(set.nails);

  return `당신은 하이엔드 뷰티 매거진 '젤리아(GELIA)'의 수석 글로벌 SNS 마케터입니다.
아래 제공되는 [네일 사진 리스트 5장]을 바탕으로, 인스타그램(한/영 버전)과 핀터레스트(다국어 개별 핀) 업로드용 텍스트를 작성해 주세요.

[출력 절대 규칙 🚨🚨🚨]
1. "안녕하세요", "여기 준비했습니다" 등 인사말이나 부연 설명은 단 한 글자도 쓰지 마세요.
2. 절대 마크다운 코드 블록(\`\`\`)으로 감싸지 말고 일반 텍스트 상태로 바로 출력하세요.
3. 시스템이 사진을 정상적으로 인식할 수 있도록, 핀터레스트 영역의 \`[IMAGE_GL-XXXXXXX]\` 태그는 다른 글자와 섞지 말고 단독으로 한 줄에 적어야 하며, 위아래로 무조건 빈 줄(엔터 2번)을 넣어야 합니다.

──────────────────────
[SNS 채널별 출력 포맷]

📱 1. 인스타그램 & 레몬8 (카드뉴스 슬라이드용 - 한/영 2가지 버전)

[🇰🇷 한국어 버전]
- [썸네일 텍스트] : (인스타 스크롤을 멈추게 할 강렬한 후킹(Hook) 카피. 단순한 디자인 묘사를 피하고, '실패 없는', '요즘 대세', '손가락이 길어 보이는' 등 유저의 호기심과 이득을 자극하는 10~15자 내외의 짧고 매력적인 문구로 작성할 것)
- [본문 캡션] : (5장 사진의 컨셉을 아우르는 트렌디하고 세련된 3줄 요약 + 이모지)
- [해시태그] : (#GELIA #젤리아 를 포함한 한국어 인기 네일 해시태그 15개)

[🇺🇸 영어(EN) 버전]
- [썸네일 텍스트_EN] : (Click-baiting hook copy under 5 words. e.g., "Fail-Proof Old Money Nails", "Must-Try Summer Look")
- [본문 캡션_EN] : (Short, trendy 2-3 line English summary + emojis)
- [해시태그_EN] : (15 English hashtags including #GELIA)

──────────────────────
📌 2. 핀터레스트 (글로벌 다국어 타겟, 5장 개별 핀 업로드용)
${pinterestSections}

──────────────────────
[네일 사진 리스트]
[테마 컨셉] ${set.title} (${SNS_THEME_BASIS_BADGE[set.basis]} / ${set.key})

${nailDataList}`;
}
