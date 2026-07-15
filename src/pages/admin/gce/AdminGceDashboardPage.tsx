import { useEffect, useState, type ChangeEvent } from 'react';
import { 
  BarChart2, Sparkles, Loader2, 
  Globe, Calendar, CheckSquare, Clock, 
  Link, Copy, ExternalLink,
  CalendarDays, ChevronDown, ChevronUp, Eye, Globe2,
  Target, Zap, Trophy, ArrowUpRight, Activity,
  PenTool, FileEdit,
  Trash2, X, Star,
  Wrench, Pencil,
  Rocket, CalendarClock,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import { supabase } from '@/shared/api/supabaseClient';

type DraftUiStatus = 'draft' | 'pending' | 'generating' | 'completed' | 'review' | 'published';

const FACTORY_CATEGORIES = [
  '썸머/바캉스',
  '웨딩/하객',
  '오피스/데일리',
  '계절/톤',
] as const;

const REVIEW_FALLBACK_THUMB =
  'https://picsum.photos/seed/gelia-review/100/100';

const GLOBAL_LANGUAGES = ['KR', 'EN', 'JP', 'VN', 'TH'] as const;

type GcePreviewLang = (typeof GLOBAL_LANGUAGES)[number];

const PREVIEW_LANG_TABS: Array<{
  id: GcePreviewLang;
  label: string;
  field: 'content_ko' | 'content_en' | 'content_jp' | 'content_vn' | 'content_th';
  titleField: 'title' | 'title_en' | 'title_jp' | 'title_vn' | 'title_th';
}> = [
  { id: 'KR', label: 'KR', field: 'content_ko', titleField: 'title' },
  { id: 'EN', label: 'EN', field: 'content_en', titleField: 'title_en' },
  { id: 'JP', label: 'JP', field: 'content_jp', titleField: 'title_jp' },
  { id: 'VN', label: 'VN', field: 'content_vn', titleField: 'title_vn' },
  { id: 'TH', label: 'TH', field: 'content_th', titleField: 'title_th' },
];

const EDITOR_TO_CONTENT_FIELD: Record<
  (typeof GLOBAL_LANGUAGES)[number],
  'content_ko' | 'content_en' | 'content_jp' | 'content_vn' | 'content_th'
> = {
  KR: 'content_ko',
  EN: 'content_en',
  JP: 'content_jp',
  VN: 'content_vn',
  TH: 'content_th',
};

const EDITOR_TO_TITLE_FIELD: Record<
  (typeof GLOBAL_LANGUAGES)[number],
  'title' | 'title_en' | 'title_jp' | 'title_vn' | 'title_th'
> = {
  KR: 'title',
  EN: 'title_en',
  JP: 'title_jp',
  VN: 'title_vn',
  TH: 'title_th',
};

type PublishMetaState = {
  KR: string;
  EN: string;
  JP: string;
  VN: string;
  TH: string;
};

const EMPTY_PUBLISH_META: PublishMetaState = {
  KR: '',
  EN: '',
  JP: '',
  VN: '',
  TH: '',
};

const normalizeDraftStatus = (status: string | null | undefined): DraftUiStatus => {
  const s = String(status ?? '').trim().toLowerCase();
  if (s === 'draft' || s === '작성중') return 'draft';
  if (s === 'generating' || s === '생성중') return 'generating';
  if (s === 'review' || s === '검수 대기') return 'review';
  if (s === 'completed' || s === '완료') return 'completed';
  if (s === 'published' || s === '발행' || s === '발행완료' || s === '발행 완료') return 'published';
  return 'pending'; // pending / 대기중
};

const mapGceTitleRow = (row: any) => {
  const languages =
    Array.isArray(row.languages) && row.languages.length > 0
      ? row.languages.map((lang: unknown) => String(lang).toUpperCase())
      : null;

  return {
    id: Number(row.id),
    category: String(row.category ?? ''),
    title: String(row.title ?? ''),
    title_en: String(row.title_en ?? ''),
    title_jp: String(row.title_jp ?? ''),
    title_vn: String(row.title_vn ?? ''),
    title_th: String(row.title_th ?? ''),
    status: normalizeDraftStatus(row.status),
    content_ko: String(row.content_ko ?? ''),
    content_en: String(row.content_en ?? ''),
    content_jp: String(row.content_jp ?? ''),
    content_vn: String(row.content_vn ?? ''),
    content_th: String(row.content_th ?? ''),
    slug: String(row.slug ?? ''),
    meta_ko: String(row.meta_ko ?? ''),
    meta_en: String(row.meta_en ?? ''),
    meta_jp: String(row.meta_jp ?? ''),
    meta_vn: String(row.meta_vn ?? ''),
    meta_th: String(row.meta_th ?? ''),
    template_type: String(row.template_type ?? '1').replace(/[^\d]/g, '') || '1',
    created_at: row.created_at ?? null,
    ai_score: row.ai_score == null || row.ai_score === '' ? null : Number(row.ai_score),
    image_urls: Array.isArray(row.image_urls) ? row.image_urls.filter(Boolean) : [],
    languages,
    scheduled_at: row.scheduled_at
      ? String(row.scheduled_at).replace('T', ' ').slice(0, 16)
      : null,
  };
};

const formatReviewDate = (value: string | null | undefined) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    const m = String(value).match(/(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : '-';
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getReviewThumbnail = (item: { image_urls?: string[] }) =>
  item.image_urls && item.image_urls.length > 0
    ? item.image_urls[0]
    : REVIEW_FALLBACK_THUMB;

const getReviewLanguages = (item: { languages?: string[] | null }) =>
  item.languages && item.languages.length > 0
    ? item.languages
    : [...GLOBAL_LANGUAGES];

const getLocalizedReviewTitle = (
  review: Record<string, unknown> | null | undefined,
  lang: GcePreviewLang,
) => {
  const tab = PREVIEW_LANG_TABS.find((t) => t.id === lang) ?? PREVIEW_LANG_TABS[0];
  const localized = String(review?.[tab.titleField] ?? '').trim();
  if (localized) return localized;
  return String(review?.title ?? '').trim();
};

type GceParsedSection = {
  title: string;
  badge: string;
  desc: string[];
  images: number[];
  features: string[];
};

type GceParsedArticle = {
  mainTitle: string;
  intro: string[];
  sections: GceParsedSection[];
};

const extractImageNums = (text: string): { clean: string; images: number[] } => {
  const images: number[] = [];
  const clean = text.replace(/\[IMAGE_(\d+)\]/gi, (_m, n: string) => {
    images.push(Number(n));
    return '';
  });
  return { clean: clean.replace(/\s+/g, ' ').trim(), images };
};

const parseGceHtmlContent = (html: string): GceParsedArticle => {
  if (typeof DOMParser === 'undefined' || !html?.trim()) {
    return { mainTitle: '', intro: html ? [html] : [], sections: [] };
  }

  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, 'text/html');
  const root = doc.getElementById('root');
  if (!root) return { mainTitle: '', intro: [], sections: [] };

  let mainTitle = '';
  const intro: string[] = [];
  const sections: GceParsedSection[] = [];
  let current: GceParsedSection | null = null;

  const pushDesc = (raw: string) => {
    const { clean, images } = extractImageNums(raw);
    if (images.length) {
      if (current) current.images.push(...images);
    }
    if (!clean) return;
    if (current) current.desc.push(clean);
    else intro.push(clean);
  };

  Array.from(root.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = (node.textContent || '').trim();
      if (t) pushDesc(t);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === 'h2') {
      mainTitle = el.textContent?.trim() || '';
      return;
    }
    if (tag === 'h3') {
      const rawTitle = el.textContent?.trim() || '';
      const sceneMatch = rawTitle.match(/^(Scene\s*\d+|SCENE\s*\d+|Type\s*[AB]|TYPE\s*[AB])[.\s:-]*(.*)$/i);
      current = {
        title: sceneMatch ? (sceneMatch[2] || rawTitle).trim() || rawTitle : rawTitle,
        badge: sceneMatch ? sceneMatch[1].trim() : '',
        desc: [],
        images: [],
        features: [],
      };
      sections.push(current);
      return;
    }
    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.querySelectorAll('li'))
        .map((li) => li.textContent?.trim() || '')
        .filter(Boolean);
      if (current) current.features.push(...items);
      else items.forEach((item) => pushDesc(item));
      return;
    }
    if (tag === 'p' || tag === 'div') {
      pushDesc(el.textContent || '');
      return;
    }
    pushDesc(el.textContent || '');
  });

  return { mainTitle, intro, sections };
};

const GceDescBlocks = ({ desc }: { desc: string[] }) => (
  <>
    {desc.map((text, i) => (
      <p key={i} className="mb-6 leading-[2.0] text-gray-700 break-keep">
        {text}
      </p>
    ))}
  </>
);

const GceSectionImages = ({ images }: { images: number[] }) => (
  <>
    {images.map((num) => (
      <div key={num} className="my-10">
        <img
          src={`https://picsum.photos/seed/nail${num}/800/500`}
          alt={`nail design ${num}`}
          className="w-full rounded-2xl shadow-lg object-cover"
        />
      </div>
    ))}
  </>
);

const isConclusionSection = (title: string, index: number, total: number) => {
  const t = title.toLowerCase();
  return (
    index === total - 1 ||
    t.includes('에디터') ||
    t.includes('한 줄') ||
    t.includes('결론') ||
    t.includes('맞는 스타일') ||
    t.includes('매칭') ||
    t.includes('꿀팁')
  );
};

/** template_type(1~5)별 하이엔드 매거진 UI 분기 렌더러 */
function GceTemplateRenderer({
  html,
  templateType,
}: {
  html: string;
  templateType?: string | number | null;
}) {
  const type = String(Math.min(5, Math.max(1, Number(String(templateType ?? '1').replace(/[^\d]/g, '') || '1') || 1)));
  const parsed = parseGceHtmlContent(html);
  const sections = parsed.sections;

  const renderIntro = () => (
    <>
      {parsed.mainTitle && (
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2 mb-8 break-keep">
          {parsed.mainTitle}
        </h2>
      )}
      <GceDescBlocks desc={parsed.intro} />
    </>
  );

  if (!html?.trim()) {
    return <p className="mb-6 leading-[2.0] text-gray-400 break-keep">본문이 아직 없습니다.</p>;
  }

  // Template 1: Deep Dive
  if (type === '1') {
    return (
      <div className="max-w-none">
        {renderIntro()}
        {sections.map((section, index) => {
          const conclusion = isConclusionSection(section.title, index, sections.length);
          if (conclusion) {
            return (
              <div key={index} className="border-l-4 border-purple-500 bg-gray-50 p-6 my-10 rounded-r-xl">
                <h3 className="text-xl font-extrabold text-gray-900 mb-4">{section.title}</h3>
                <GceDescBlocks desc={section.desc} />
                <GceSectionImages images={section.images} />
              </div>
            );
          }
          return (
            <div key={index}>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-12 mb-6 border-b-2 border-black pb-2 inline-block">
                {section.title}
              </h3>
              <GceDescBlocks desc={section.desc} />
              <GceSectionImages images={section.images} />
            </div>
          );
        })}
      </div>
    );
  }

  // Template 2: Listicle
  if (type === '2') {
    return (
      <div className="max-w-none">
        {renderIntro()}
        {sections.map((section, index) => (
          <div key={index}>
            <div className="flex items-center gap-3 mt-14 mb-6">
              <span className="flex items-center justify-center w-8 h-8 bg-black text-white font-bold rounded-full">
                {index + 1}
              </span>
              <h3 className="text-2xl font-bold m-0">{section.title}</h3>
            </div>
            <GceDescBlocks desc={section.desc} />
            <GceSectionImages images={section.images} />
          </div>
        ))}
      </div>
    );
  }

  // Template 3: VS Compare
  if (type === '3') {
    return (
      <div className="max-w-none">
        {renderIntro()}
        {sections.map((section, index) => {
          const conclusion = isConclusionSection(section.title, index, sections.length);
          const features =
            section.features.length > 0
              ? section.features
              : section.desc.slice(1);

          if (conclusion) {
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 my-10 text-white shadow-xl"
              >
                <h3 className="text-2xl font-extrabold mb-4">{section.title}</h3>
                {section.desc.map((text, i) => (
                  <p key={i} className="mb-4 leading-[2.0] text-white/95 break-keep">
                    {text}
                  </p>
                ))}
                <GceSectionImages images={section.images} />
              </div>
            );
          }

          return (
            <div key={index} className="mt-12">
              <div className="mb-6 flex items-center gap-3 flex-wrap">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-bold">
                  {section.badge || (index === 0 ? 'Type A' : 'Type B')}
                </span>
                <h3 className="text-2xl font-extrabold text-gray-900 m-0">{section.title}</h3>
              </div>
              <GceDescBlocks desc={section.features.length ? section.desc : section.desc.slice(0, 1)} />
              {features.length > 0 && (
                <ul className="bg-gray-50 rounded-xl p-6 my-6 space-y-3">
                  {features.map((feature, fi) => (
                    <li key={fi} className="flex gap-2 text-gray-700 break-keep">
                      <span className="text-purple-500 font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              <GceSectionImages images={section.images} />
            </div>
          );
        })}
      </div>
    );
  }

  // Template 4: By Occasion Lookbook
  if (type === '4') {
    return (
      <div className="max-w-none">
        {renderIntro()}
        {sections.map((section, index) => (
          <div key={index}>
            <div className="mt-12 mb-6">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                {section.badge || `Scene ${index + 1}`}
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900">{section.title}</h3>
            </div>
            <GceDescBlocks desc={section.desc} />
            <GceSectionImages images={section.images} />
          </div>
        ))}
      </div>
    );
  }

  // Template 5: Perfect Fit
  return (
    <div className="max-w-none">
      {renderIntro()}
      {sections.map((section, index) => (
        <div key={index} className="bg-pink-50/50 rounded-2xl p-8 my-8 border border-pink-100">
          <h3 className="text-2xl font-extrabold text-gray-900 mb-4">{section.title}</h3>
          <GceDescBlocks desc={section.desc} />
          <GceSectionImages images={section.images} />
        </div>
      ))}
    </div>
  );
}

const LANG_BADGE: Record<string, string> = {
  KR: '🇰🇷 KR',
  EN: '🇺🇸 EN',
  JP: '🇯🇵 JP',
  VN: '🇻🇳 VN',
  TH: '🇹🇭 TH',
};

const formatScheduledLabel = (scheduledAt: string) => {
  // '2026-07-12 18:00' → '7/12 18:00'
  const m = scheduledAt.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2})/);
  if (!m) return scheduledAt;
  return `${Number(m[2])}/${Number(m[3])} ${m[4]}`;
};

const toDatetimeLocalValue = (scheduledAt: string | null) => {
  if (!scheduledAt) return '2026-07-12T18:00';
  return scheduledAt.replace(' ', 'T');
};

const fromDatetimeLocalValue = (value: string) => value.replace('T', ' ');

const buildMagazineLiveUrls = (slug: string | null | undefined) => {
  const s = String(slug ?? '').trim() || 'untitled';
  return {
    KO: `/magazine/${s}`,
    EN: `/en/magazine/${s}`,
    JP: `/jp/magazine/${s}`,
    VN: `/vn/magazine/${s}`,
    TH: `/th/magazine/${s}`,
  } as const;
};

const MOCK_BEST_ARTICLES = [
  { id: 1, title: '여름 쿨톤 피부를 2배 맑게 밝혀주는 핑크 시럽 네일 완벽 가이드', image: 'https://picsum.photos/seed/nailhero2/200/200', views: 12450, growth: '+15%', channel: 'web' },
  { id: 2, title: '단정함과 세련됨의 끝판왕! 여름 오피스룩 미니멀 프렌치', image: 'https://picsum.photos/seed/occ2/200/200', views: 8200, growth: '+8%', channel: 'web' },
  { id: 3, title: '여름휴가 네일 무조건 이거 박제! 쿨톤 인생 네일 찾음 🌊✨', image: 'https://picsum.photos/seed/occ3/200/200', views: 7500, growth: '+22%', channel: 'sns' },
];

type GceIdeaImage = { id: string; concept: string; design_name: string; tags: string };
type GceGeneratedIdea = {
  id: number;
  category: string;
  title: string;
  images: GceIdeaImage[];
};

/** 카테고리별 하이엔드 매거진 제목 템플릿 */
const IDEA_TITLE_TEMPLATES: Record<string, string[]> = {
  '썸머/바캉스': [
    '2026 바캉스 네일! 수영장에서 시선 강탈하는 {keyword} 룩북',
    '여름휴가 준비 끝! 청량감 100% {keyword} 네일 5선',
    '뜨거운 태양 아래 더 빛나는 {keyword} 바캉스 큐레이션',
  ],
  '웨딩/하객': [
    '하객룩의 정석! 단정하고 우아한 {keyword} 네일 가이드',
    '가장 눈부신 신부를 위한 {keyword} 웨딩 네일 룩북',
    '식장에서 은은하게 빛나는 고급스러운 {keyword} 스타일링',
  ],
  '오피스/데일리': [
    '출근룩 완성! 단정하면서도 세련된 {keyword} 데일리 네일',
    '키보드 칠 때마다 기분 좋아지는 {keyword} 오피스 룩북',
    '꾸안꾸의 정석! 은은하고 세련된 {keyword} 무드 5선',
  ],
  '계절/톤': [
    '이번 시즌 가장 핫한 트렌드! {keyword} 맞춤 큐레이션',
    '내 피부톤에 찰떡같이 어울리는 {keyword} 퍼스널 네일',
    '분위기 여신으로 만들어줄 {keyword} 감성 네일 룩북',
  ],
};

const IDEA_TITLE_FALLBACK_TEMPLATES = [
  '에디터 픽! 지금 가장 주목받는 {keyword} 네일 룩북',
  '손끝부터 완성되는 분위기, {keyword} 매거진 큐레이션',
  '오늘의 추천! 세련미 가득한 {keyword} 스타일 5선',
];

const pickMagazineIdeaTitle = (category: string, keyword: string) => {
  const pool = IDEA_TITLE_TEMPLATES[category] ?? IDEA_TITLE_FALLBACK_TEMPLATES;
  const template = pool[Math.floor(Math.random() * pool.length)] ?? pool[0] ?? '{keyword} 네일 룩북';
  const safeKeyword = String(keyword ?? '').trim() || '네일';
  return template.replace(/\{keyword\}/g, safeKeyword);
};

/** DB source_filename 규칙: GL- + 숫자 7자리 (예: GL-0005520) */
const GL_ID_DIGIT_LEN = 7;

/** 화면·프롬프트용 GL-XXXXXXX (7자리) 포맷 */
const formatGlAssetId = (rawId: string | number | null | undefined, sourceFilename?: string | null) => {
  const fromFile = String(sourceFilename ?? '').match(/GL-(\d+)/i);
  if (fromFile?.[1]) {
    return `GL-${fromFile[1].padStart(GL_ID_DIGIT_LEN, '0')}`;
  }

  const idStr = String(rawId ?? '').trim();
  if (/^\d+$/.test(idStr)) {
    return `GL-${idStr.padStart(GL_ID_DIGIT_LEN, '0')}`;
  }

  const digits = idStr.match(/(\d+)/)?.[1];
  if (digits) {
    return `GL-${digits.padStart(GL_ID_DIGIT_LEN, '0')}`;
  }

  return `GL-${'0'.repeat(GL_ID_DIGIT_LEN)}`;
};

const joinIdeaTagParts = (...parts: Array<string | string[] | null | undefined>) => {
  const flat: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (Array.isArray(part)) {
      for (const item of part) {
        const t = String(item ?? '').trim();
        if (t) flat.push(t);
      }
      continue;
    }
    const t = String(part).trim();
    if (t) flat.push(t);
  }
  return [...new Set(flat)].slice(0, 6).join(', ') || '젤리아 네일 디자인';
};

const buildIdeasFromNailDesigns = (
  rows: Array<{
    id?: string | number | null;
    title?: string | null;
    tags?: string[] | string | null;
    source_filename?: string | null;
    situations?: string[] | null;
    styles?: string[] | null;
    category?: string | null;
    color?: string | null;
    mood?: string | null;
    nail_length?: string | null;
  }>,
): GceGeneratedIdea[] => {
  const usable = rows
    .map((row) => {
      const glId = formatGlAssetId(row.id, row.source_filename);
      if (!glId || glId === `GL-${'0'.repeat(GL_ID_DIGIT_LEN)}`) return null;
      const concept = String(row.title ?? '').trim() || '네일 디자인';
      const tags = joinIdeaTagParts(
        row.nail_length,
        row.color,
        row.mood,
        row.tags,
        row.styles,
        row.situations,
        row.category,
      );
      return { glId, concept, tags };
    })
    .filter(Boolean) as Array<{ glId: string; concept: string; tags: string }>;

  // 동일 GL 중복 제거
  const unique: typeof usable = [];
  const seen = new Set<string>();
  for (const item of usable) {
    if (seen.has(item.glId)) continue;
    seen.add(item.glId);
    unique.push(item);
  }

  const ideas: GceGeneratedIdea[] = [];
  const maxIdeas = 10;
  for (let i = 0; i < maxIdeas; i += 1) {
    const chunk = unique.slice(i * 5, i * 5 + 5);
    if (chunk.length < 5) break;
    const category = FACTORY_CATEGORIES[i % FACTORY_CATEGORIES.length];
    const images: GceIdeaImage[] = chunk.map((item) => ({
      id: item.glId,
      concept: item.concept,
      design_name: item.concept,
      tags: item.tags,
    }));
    const keyword = images[0]?.design_name || images[0]?.concept || '네일';
    ideas.push({
      id: i + 1,
      category,
      title: pickMagazineIdeaTitle(category, keyword),
      images,
    });
  }

  return ideas;
};

const buildChatGptIdeaPrompt = (idea: GceGeneratedIdea) => {
  const lines = idea.images.map(
    (img, i) => `${i + 1}. [IMAGE_${img.id}] ${img.concept} (디테일: ${img.tags})`,
  );
  return [
    `카테고리: ${idea.category}`,
    `제목: ${idea.title}`,
    '사용할 네일 사진 리스트:',
    ...lines,
    '',
    '원고 작성 시 사진 태그는 반드시 [IMAGE_GL-XXXXXXX] 7자리 포맷을 그대로 사용하세요.',
  ].join('\n');
};

const escapeGceHtmlText = (value: string) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // SECURITY: 속성값 인젝션 차단용 단일따옴표까지 이스케이프
    .replace(/'/g, '&#39;');

/**
 * SECURITY (XSS): 관리자 미리보기/발행 HTML에 스크립트·이벤트핸들러·javascript: URL이
 * 섞이지 않도록 DOMPurify로 허용 태그만 남긴다.
 */
const sanitizeGceMagazineHtml = (html: string) =>
  DOMPurify.sanitize(String(html ?? ''), {
    ALLOWED_TAGS: [
      'p',
      'div',
      'span',
      'strong',
      'em',
      'b',
      'i',
      'br',
      'h3',
      'h4',
      'h5',
      'ul',
      'ol',
      'li',
      'img',
    ],
    ALLOWED_ATTR: ['class', 'src', 'alt', 'style'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  });

/** SECURITY: img src는 http(s)만 허용해 속성 탈출·javascript: 인젝션을 차단 */
const isSafeHttpUrl = (rawUrl: string): boolean => {
  const trimmed = String(rawUrl ?? '').trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const sanitizeHttpUrlForAttr = (rawUrl: string): string => {
  const trimmed = String(rawUrl ?? '').trim();
  if (!isSafeHttpUrl(trimmed)) return '';
  try {
    return escapeGceHtmlText(new URL(trimmed).toString());
  } catch {
    return '';
  }
};

/**
 * SECURITY (ReDoS): `\s*`/`.*` 같은 개행 포함 탐욕 패턴 대신
 * 동일 줄(`[\t ]*`, `[^\n\r]*`)만 매칭해 백트래킹을 제한한다.
 */
const EDITOR_TITLE_LINE_RE = /^제목[\t ]*:[\t ]*([^\n\r]*)/;
const EDITOR_TITLE_STRIP_RE = /^제목[\t ]*:[\t ]*[^\n\r]*(?:\r?\n)*/;

/** SECURITY (DB): 슬러그는 영소문자/숫자/하이픈만, 길이 제한 */
const sanitizePublishSlug = (raw: string): string =>
  String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

/**
 * SECURITY (DB): 메타 설명에서 HTML/제어문자 제거 후 길이 제한
 * (Supabase는 파라미터 바인딩이라 SQL 인젝션은 완화되나, XSS 페이로드 저장을 막는다)
 */
const sanitizeMetaDescription = (raw: string): string =>
  String(raw ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, 320);

type NormalizedGlId = {
  raw: string;
  padded: string;
  numeric: string;
};

const normalizeGlId = (rawId: string): NormalizedGlId => {
  const raw = String(rawId ?? '').toUpperCase().trim();
  const numericRaw = (raw.match(/(\d+)/)?.[1] ?? '0').replace(/^0+/, '') || '0';
  const padded = `GL-${numericRaw.padStart(GL_ID_DIGIT_LEN, '0')}`;
  return {
    raw: raw.startsWith('GL-') ? raw : `GL-${raw}`,
    padded,
    numeric: numericRaw,
  };
};

/** GL-XXXX → nail_designs.image_url 맵 (실 R2 경로, UUID 포함) */
const resolveGceNailImageUrls = async (
  glIds: string[],
): Promise<{ urlByKey: Record<string, string>; fallbackUrls: string[] }> => {
  const urlByKey: Record<string, string> = {};
  const normalized = glIds.map(normalizeGlId);
  const paddedIds = Array.from(new Set(normalized.map((n) => n.padded)));

  if (paddedIds.length > 0) {
    const filenames = paddedIds.flatMap((id) => [
      `${id}.webp`,
      `${id}.jpg`,
      `${id}.jpeg`,
      `${id}.png`,
    ]);

    const { data, error } = await supabase
      .from('nail_designs')
      .select('source_filename, image_url, image_r2_key')
      .in('source_filename', filenames);

    if (error) {
      console.warn('[resolveGceNailImageUrls] source_filename 조회 실패:', error.message);
    }

    for (const row of data ?? []) {
      const url = String(row.image_url ?? '').trim();
      if (!url) continue;
      const filename = String(row.source_filename ?? '').trim();
      const stem = filename.replace(/\.[^.]+$/, '').toUpperCase();
      if (stem) {
        urlByKey[stem] = url;
        // 짧은 키도 함께 등록 (GL-201 ↔ GL-0000201)
        const shortKey = `GL-${(stem.match(/(\d+)/)?.[1] ?? '').replace(/^0+/, '') || '0'}`;
        urlByKey[shortKey] = url;
      }
    }

    // 파일명 미매칭 → image_r2_key에 패딩 ID 포함 여부로 보조 조회
    const missingPadded = paddedIds.filter((id) => !urlByKey[id]);
    for (const padded of missingPadded) {
      const { data: rows, error: keyErr } = await supabase
        .from('nail_designs')
        .select('image_url, source_filename, image_r2_key')
        .ilike('image_r2_key', `%${padded}%`)
        .limit(1);
      if (keyErr) {
        console.warn('[resolveGceNailImageUrls] image_r2_key 조회 실패:', keyErr.message);
        continue;
      }
      const url = String(rows?.[0]?.image_url ?? '').trim();
      if (!url) continue;
      urlByKey[padded] = url;
      const shortKey = `GL-${(padded.match(/(\d+)/)?.[1] ?? '').replace(/^0+/, '') || '0'}`;
      urlByKey[shortKey] = url;
    }
  }

  // 엑박 방지용: DB에 실존하는 image_url 풀 (UUID 없는 /uploads/{id}.webp 폴백 금지)
  const { data: fallbackRows } = await supabase
    .from('nail_designs')
    .select('image_url')
    .not('image_url', 'is', null)
    .neq('image_url', '')
    .limit(30);

  const fallbackUrls = (fallbackRows ?? [])
    .map((row) => String(row.image_url ?? '').trim())
    .filter(Boolean);

  return { urlByKey, fallbackUrls };
};

const pickFallbackImageUrl = (glId: string, fallbackUrls: string[]): string => {
  if (fallbackUrls.length === 0) return '';
  const digits = Number((glId.match(/(\d+)/)?.[1] ?? '0').replace(/^0+/, '') || '0');
  return fallbackUrls[digits % fallbackUrls.length] ?? fallbackUrls[0] ?? '';
};

/** 최상위 <div>...</div> 블록을 플레이스홀더로 보호 (중첩 div 안전) */
const protectTopLevelDivBlocks = (input: string) => {
  const islands: string[] = [];
  let out = '';
  let i = 0;
  const src = String(input ?? '');

  while (i < src.length) {
    if (src.startsWith('<div', i)) {
      let depth = 0;
      let j = i;
      let closed = false;
      while (j < src.length) {
        if (src.startsWith('<div', j)) {
          depth += 1;
          const gt = src.indexOf('>', j);
          j = gt === -1 ? src.length : gt + 1;
          continue;
        }
        if (src.startsWith('</div>', j)) {
          depth -= 1;
          j += 6;
          if (depth === 0) {
            islands.push(src.slice(i, j));
            out += `\n\n@@GELIA_HTML_${islands.length - 1}@@\n\n`;
            i = j;
            closed = true;
            break;
          }
          continue;
        }
        j += 1;
      }
      if (!closed) {
        out += src[i];
        i += 1;
      }
      continue;
    }
    out += src[i];
    i += 1;
  }

  return { text: out, islands };
};

const HIGHLIGHT_STRONG_CLASS = 'text-purple-700 font-bold bg-purple-50 px-1';

type GceThemeType = '1' | '2' | '3' | '4';

type GceThemeSkin = {
  id: GceThemeType;
  label: string;
  badge: string;
  tipBox: string;
  tipLabel: string;
  summaryCard: string;
  summaryTitle: string;
  summaryDot: string;
  summaryCheck: string;
  highlight: string;
};

/** Type 1 로맨틱 바이올렛 / 2 시크 모던 블랙 / 3 프레시 아쿠아 / 4 웜 베이지 */
const GCE_THEME_SKINS: Record<GceThemeType, GceThemeSkin> = {
  '1': {
    id: '1',
    label: '로맨틱 바이올렛',
    badge: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md',
    tipBox: 'bg-purple-50/80 border-purple-100',
    tipLabel: 'text-purple-700',
    summaryCard: 'bg-gray-50',
    summaryTitle: 'text-purple-700',
    summaryDot: 'bg-purple-600',
    summaryCheck: 'text-purple-500',
    highlight: 'text-purple-700 font-bold bg-purple-50 px-1',
  },
  '2': {
    id: '2',
    label: '시크 모던 블랙',
    badge: 'bg-gradient-to-br from-stone-900 to-black text-white shadow-md',
    tipBox: 'bg-stone-100 border-stone-200',
    tipLabel: 'text-stone-900',
    summaryCard: 'bg-stone-100',
    summaryTitle: 'text-stone-900',
    summaryDot: 'bg-stone-900',
    summaryCheck: 'text-stone-700',
    highlight: 'text-stone-900 font-bold bg-stone-100 px-1',
  },
  '3': {
    id: '3',
    label: '프레시 아쿠아',
    badge: 'bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-md',
    tipBox: 'bg-cyan-50/90 border-cyan-100',
    tipLabel: 'text-cyan-800',
    summaryCard: 'bg-sky-50',
    summaryTitle: 'text-cyan-800',
    summaryDot: 'bg-cyan-600',
    summaryCheck: 'text-cyan-600',
    highlight: 'text-cyan-800 font-bold bg-cyan-50 px-1',
  },
  '4': {
    id: '4',
    label: '웜 베이지',
    badge: 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-md',
    tipBox: 'bg-amber-50/90 border-amber-100',
    tipLabel: 'text-amber-900',
    summaryCard: 'bg-orange-50/80',
    summaryTitle: 'text-amber-900',
    summaryDot: 'bg-amber-700',
    summaryCheck: 'text-amber-700',
    highlight: 'text-amber-900 font-bold bg-amber-50 px-1',
  },
};

const detectTheme = (text: string): GceThemeType => {
  const source = String(text ?? '');
  if (/여름|바캉스|바다|수영장|휴가|아쿠아|청량|시원|블루|해변/.test(source)) return '3';
  if (/오피스|출근|시크|블랙|모던|정장|미니멀|회사|데일리/.test(source)) return '2';
  if (/가을|겨울|베이지|브라운|니트|웜톤|차분|트렌치/.test(source)) return '4';
  return '1';
};

const resolveThemeSkin = (themeType?: string | number | null): GceThemeSkin => {
  const key = String(themeType ?? '1').replace(/[^\d]/g, '') || '1';
  if (key === '2' || key === '3' || key === '4') return GCE_THEME_SKINS[key];
  return GCE_THEME_SKINS['1'];
};

const formatGceInlineText = (value: string, highlightClass = GCE_THEME_SKINS['1'].highlight) => {
  const islands: string[] = [];
  // 이미 치환된 ✨ 하이라이트 <strong> 보호 (escape 방지)
  let withProtected = String(value ?? '').replace(
    new RegExp(
      `<strong class="${highlightClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">([^<]*)</strong>`,
      'g',
    ),
    (_m, inner: string) => {
      islands.push(`<strong class="${highlightClass}">${inner}</strong>`);
      return `§§HL_ISLAND_${islands.length - 1}§§`;
    },
  );
  withProtected = withProtected
    .replace(/✨([^✨\n]+)✨/g, '§§HL§§$1§§/HL§§')
    .replace(/\*\*([^*\n]+)\*\*/g, '§§BOLD§§$1§§/BOLD§§');
  return escapeGceHtmlText(withProtected)
    .replace(/§§HL§§/g, `<strong class="${highlightClass}">`)
    .replace(/§§\/HL§§/g, '</strong>')
    .replace(/§§BOLD§§/g, '<strong class="font-semibold text-gray-900">')
    .replace(/§§\/BOLD§§/g, '</strong>')
    .replace(/§§HL_ISLAND_(\d+)§§/g, (_m, idx: string) => islands[Number(idx)] ?? '');
};

const restoreHtmlIslands = (input: string, islands: string[]) =>
  String(input ?? '').replace(/@@GELIA_HTML_(\d+)@@/g, (_m, idx: string) => {
    return islands[Number(idx)] ?? '';
  });

/** Tailwind JIT: 클래스 조각을 변수로 합치면 빌드에서 누락되므로, 테마별 태그 전체를 하드코딩 */
const resolveThemeHighlightClass = (theme: GceThemeType): string => {
  if (theme === '2') return 'text-stone-900 font-bold bg-stone-100 px-1';
  if (theme === '3') return 'text-cyan-800 font-bold bg-cyan-50 px-1';
  if (theme === '4') return 'text-amber-900 font-bold bg-amber-50 px-1';
  return 'text-purple-700 font-bold bg-purple-50 px-1';
};

/** 💎 넘버링 제목 — items-center로 번호·제목 광학적 수직 중앙 정렬 */
const buildDiamondHeadingHtml = (_theme: GceThemeType, badgeIndex: number, title: string): string => {
  return `\n\n<div class="flex items-center gap-3 mt-12 mb-6 min-w-0 w-full"><span style="background-color: #2b2b2b; color: #ffffff;" class="flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-[15px] font-bold leading-none">${badgeIndex}</span><h3 class="min-w-0 flex-1 text-[20px] md:text-[22px] font-bold text-[#2b2b2b] m-0 break-words whitespace-normal leading-tight">${title}</h3></div>\n\n`;
};

const buildTipBoxHtml = (theme: GceThemeType, label: string, bodyHtml: string): string => {
  if (theme === '2') {
    return `\n\n<div class="my-8 p-5 bg-stone-100 border-stone-200 rounded-2xl border"><strong class="block text-stone-900 mb-1 text-[15px] break-words">${label}</strong>${bodyHtml}</div>\n\n`;
  }
  if (theme === '3') {
    return `\n\n<div class="my-8 p-5 bg-cyan-50/90 border-cyan-100 rounded-2xl border"><strong class="block text-cyan-800 mb-1 text-[15px] break-words">${label}</strong>${bodyHtml}</div>\n\n`;
  }
  if (theme === '4') {
    return `\n\n<div class="my-8 p-5 bg-amber-50/90 border-amber-100 rounded-2xl border"><strong class="block text-amber-900 mb-1 text-[15px] break-words">${label}</strong>${bodyHtml}</div>\n\n`;
  }
  return `\n\n<div class="my-8 p-5 bg-purple-50/80 border-purple-100 rounded-2xl border"><strong class="block text-purple-700 mb-1 text-[15px] break-words">${label}</strong>${bodyHtml}</div>\n\n`;
};

const buildCheckCardOpenHtml = (theme: GceThemeType, titleText: string): string => {
  if (theme === '2') {
    return `<div class="bg-stone-100 rounded-2xl p-6 mb-5"><h5 class="text-stone-900 font-bold text-lg mb-4 flex items-center gap-2"><span class="w-2 h-2 bg-stone-900 rounded-full"></span>${titleText}</h5><ul class="space-y-3">`;
  }
  if (theme === '3') {
    return `<div class="bg-sky-50 rounded-2xl p-6 mb-5"><h5 class="text-cyan-800 font-bold text-lg mb-4 flex items-center gap-2"><span class="w-2 h-2 bg-cyan-600 rounded-full"></span>${titleText}</h5><ul class="space-y-3">`;
  }
  if (theme === '4') {
    return `<div class="bg-orange-50/80 rounded-2xl p-6 mb-5"><h5 class="text-amber-900 font-bold text-lg mb-4 flex items-center gap-2"><span class="w-2 h-2 bg-amber-700 rounded-full"></span>${titleText}</h5><ul class="space-y-3">`;
  }
  return `<div class="bg-gray-50 rounded-2xl p-6 mb-5"><h5 class="text-purple-700 font-bold text-lg mb-4 flex items-center gap-2"><span class="w-2 h-2 bg-purple-600 rounded-full"></span>${titleText}</h5><ul class="space-y-3">`;
};

const buildCheckListItemHtml = (theme: GceThemeType, itemHtml: string): string => {
  if (theme === '2') {
    return `\n<li class="flex items-start gap-3 text-gray-700 text-[15px] leading-relaxed"><span class="text-stone-700 font-bold mt-0.5">✓</span> <span class="break-words">${itemHtml}</span></li>`;
  }
  if (theme === '3') {
    return `\n<li class="flex items-start gap-3 text-gray-700 text-[15px] leading-relaxed"><span class="text-cyan-600 font-bold mt-0.5">✓</span> <span class="break-words">${itemHtml}</span></li>`;
  }
  if (theme === '4') {
    return `\n<li class="flex items-start gap-3 text-gray-700 text-[15px] leading-relaxed"><span class="text-amber-700 font-bold mt-0.5">✓</span> <span class="break-words">${itemHtml}</span></li>`;
  }
  return `\n<li class="flex items-start gap-3 text-gray-700 text-[15px] leading-relaxed"><span class="text-purple-500 font-bold mt-0.5">✓</span> <span class="break-words">${itemHtml}</span></li>`;
};

const buildHighlightStrongHtml = (theme: GceThemeType, inner: string): string => {
  // SECURITY (XSS): ✨ 마커 안 텍스트는 이스케이프 후 삽입 (원시 HTML 주입 차단)
  const safeInner = escapeGceHtmlText(inner);
  if (theme === '2') {
    return `<strong class="text-stone-900 font-bold bg-stone-100 px-1">${safeInner}</strong>`;
  }
  if (theme === '3') {
    return `<strong class="text-cyan-800 font-bold bg-cyan-50 px-1">${safeInner}</strong>`;
  }
  if (theme === '4') {
    return `<strong class="text-amber-900 font-bold bg-amber-50 px-1">${safeInner}</strong>`;
  }
  return `<strong class="text-purple-700 font-bold bg-purple-50 px-1">${safeInner}</strong>`;
};

/** 📝 총평 + ✅ 체크리스트 → 올드머니 요약 박스 (테마 스킨 적용) */
const buildSummaryBoxHtml = (heading: string, body: string, skin: GceThemeSkin) => {
  const theme = skin.id;
  const highlightClass = resolveThemeHighlightClass(theme);
  const safeHeading = escapeGceHtmlText(String(heading ?? '').trim() || '한눈에 보는 총평');
  const rawBody = String(body ?? '').trim();

  // 1) ✅ 블록 단위로 분리
  const checkBlocks = rawBody.split(/(?=✅)/).map((s) => s.trim()).filter(Boolean);
  const cardHtmlParts: string[] = [];

  for (const block of checkBlocks) {
    if (!block.startsWith('✅')) {
      const intro = escapeGceHtmlText(block).replace(/\n/g, '<br/>');
      cardHtmlParts.push(
        `<p class="text-gray-600 text-[15px] leading-relaxed mb-5 break-words whitespace-pre-wrap">${intro}</p>`,
      );
      continue;
    }

    // 2) ✅ 제목 줄 + 이하 설명 줄들 (이모지 미렌더)
    const withoutMark = block.replace(/^✅\s*/, '');
    const lines = withoutMark
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) continue;

    const titleLine = lines[0];
    const titled = titleLine.match(/^(.+?)\s*[:：]\s*(.*)$/);
    const titleText = formatGceInlineText((titled?.[1] ?? titleLine).trim(), highlightClass);
    const sameLineRest = (titled?.[2] ?? '').trim();

    // 3) 설명 줄 → <li> 강제 ( - / • 유무 무관 )
    const itemLines: string[] = [];
    if (sameLineRest) itemLines.push(sameLineRest.replace(/^[-•*·]\s*/, '').trim());
    for (let i = 1; i < lines.length; i += 1) {
      const item = lines[i].replace(/^[-•*·]\s*/, '').trim();
      if (item) itemLines.push(item);
    }

    const listItems = itemLines
      .map((item) => buildCheckListItemHtml(theme, formatGceInlineText(item, highlightClass)))
      .join('');

    cardHtmlParts.push(
      `${buildCheckCardOpenHtml(theme, titleText)}${
        listItems ? listItems : ''
      }</ul></div>`,
    );
  }

  const inner = cardHtmlParts.length
    ? cardHtmlParts.join('')
    : `<p class="text-gray-500 text-[15px] text-center break-words whitespace-pre-wrap">요약 내용이 없습니다.</p>`;

  // 4) 화이트 베이스 올드머니 뼈대 (📝 이모지 미렌더)
  return `\n\n<div class="my-16 p-8 bg-white border border-gray-200 rounded-3xl shadow-sm"><h4 class="text-2xl font-extrabold text-black mb-8 text-center pb-6 border-b border-gray-100 m-0 break-words">${safeHeading}</h4>${inner}</div>\n\n`;
};

const MAGAZINE_BODY_P_CLASS =
  'mb-5 md:mb-7 text-[16px] md:text-[17px] leading-[1.8] font-light text-[#2b2b2b] break-words whitespace-pre-wrap';

const wrapMagazinePlainParagraph = (text: string, highlightClass: string): string => {
  const formatted = formatGceInlineText(text, highlightClass).replace(/\n/g, '<br/>');
  return `<p class="${MAGAZINE_BODY_P_CLASS}">${formatted}</p>`;
};

/**
 * Dumb Pipe: AI 원본 줄바꿈만 존중 — 마침표 문장 쪼개기/묶기 없음
 * 상위 split(/\n\s*\n/)으로 나뉜 단락 덩어리를 그대로 1개 <p>로 출력
 */
const wrapPlainTextBlockByLang = (
  block: string,
  _langKey: string,
  highlightClass: string,
): string => {
  const trimmed = block.trim();
  if (!trimmed) return '';

  // 블록 내부에 남은 \\n\\n 도 단락으로 재분리 (이중 안전)
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim());
  if (paragraphs.length === 0) return '';

  return paragraphs
    .map((p) => wrapMagazinePlainParagraph(p.trim(), highlightClass))
    .join('\n');
};

/** 템플릿 2(큐레이션 리스트형) — 하이엔드 정규식 파이프라인 + 이미지 해석 */
const buildMagazineHtml = async (
  markdown: string,
  themeType: string | number = '1',
  lang: string = 'KR',
  currentTitle: string = '',
): Promise<string> => {
  console.log('R2 Public URL 환경변수: ', import.meta.env.VITE_R2_PUBLIC_URL);
  const skin = resolveThemeSkin(themeType);
  const theme = skin.id;
  const highlightClass = resolveThemeHighlightClass(theme);
  const langKey = String(lang ?? 'KR').toUpperCase() || 'KR';
  console.log('[buildMagazineHtml] 자동 테마:', skin.id, skin.label, '| lang:', langKey);
  let html = String(markdown ?? '');
  let index = 1;

  // 1. 모든 종류의 연속된 선(하이픈, 밑줄, 엠대시, 엔대시, 희귀 유니코드 선) 제거
  html = html.replace(/^[\s\-_─—–=~━―－]{3,}\s*$/gm, '');

  // 2. 혹시라도 HTML <hr> 태그로 변환된 찌꺼기가 있다면 파괴
  html = html.replace(/<hr\s*\/?>/gi, '');

  html = html.replace(/\n{3,}/g, '\n\n');

  // SEO 마커는 본문에서 제거 (우측 SEO 폼으로만 사용)
  html = html.replace(/\[SEO_SLUG\]\s*:\s*[^\n]*/gi, '');
  html = html.replace(/\[SEO_DESC\]\s*:\s*[^\n]*/gi, '');

  // 다국어 이미지 SEO: 해당 언어 제목 → alt (없으면 Fallback)
  const titleForAlt = String(currentTitle ?? '').trim();
  const imgAlt = escapeGceHtmlText(
    titleForAlt ? `${titleForAlt} - GELIA` : 'GELIA Magazine',
  );

  // ── 0. 마커 줄 단위 격리 (💎 / 📌 / 📝 / [IMAGE_…])
  html = html.replace(/(💎\s*[^\n]+)/g, '\n\n$1\n\n');
  html = html.replace(/(📌\s*[^\n]+)/g, '\n\n$1\n\n');
  html = html.replace(/(📝\s*[^\n]+)/g, '\n\n$1\n\n');
  html = html.replace(/(\[IMAGE_.*?\])/gi, '\n\n$1\n\n');

  // ── 1. ✨ 형광펜 (테마별 <strong> 태그 전체 하드코딩)
  html = html.replace(/✨([^✨\n]+)✨/g, (_m, inner: string) => buildHighlightStrongHtml(theme, inner));

  // ── 2. 💎 소제목 (그라데이션 뱃지 — 테마별 span 전체 하드코딩)
  html = html.replace(/💎\s*([^\n]+)/g, (_match, p1: string) => {
    const title = formatGceInlineText(String(p1).trim(), highlightClass);
    return buildDiamondHeadingHtml(theme, index++, title);
  });

  // ── 3. 📌 팁 박스 (테마별 박스 태그 전체 하드코딩)
  html = html.replace(/📌\s*([^:\n]+)(?::\s*([^\n]+))?/g, (_match, label: string, body?: string) => {
    const safeLabel = formatGceInlineText(String(label ?? '').trim(), highlightClass);
    const safeBody =
      body != null && String(body).trim()
        ? formatGceInlineText(String(body).trim(), highlightClass)
        : '';
    const bodyHtml = safeBody
      ? `<span class="text-gray-700 text-[15px] leading-relaxed break-words">${safeBody}</span>`
      : '';
    return buildTipBoxHtml(theme, safeLabel, bodyHtml);
  });

  // ── 4. [IMAGE_GL-…] → R2/DB URL 치환 (+ 언어별 제목 alt)
  const imageMatches = Array.from(html.matchAll(/\[IMAGE_GL-([a-zA-Z0-9_-]+)\]/gi));
  const parsedIds = imageMatches.map((m) => {
    // SECURITY: capture 그룹을 화이트리스트 문자만 남긴 뒤 ID로 조립
    const token = String(m[1] ?? '').replace(/[^a-zA-Z0-9_-]/g, '');
    return token ? `GL-${token}` : '';
  }).filter(Boolean);
  const { urlByKey, fallbackUrls } = await resolveGceNailImageUrls(parsedIds);

  let rebuilt = '';
  let cursor = 0;
  const imageRe = /\[IMAGE_GL-([a-zA-Z0-9_-]+)\]/gi;
  let match: RegExpExecArray | null;
  while ((match = imageRe.exec(html)) !== null) {
    rebuilt += html.slice(cursor, match.index);
    const token = String(match[1] ?? '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!token) {
      cursor = match.index + match[0].length;
      continue;
    }
    const id = `GL-${token}`;
    const { raw, padded } = normalizeGlId(id);
    const dbUrl = urlByKey[padded] || urlByKey[raw] || urlByKey[id] || urlByKey[id.toUpperCase()] || '';
    const finalUrl = dbUrl || pickFallbackImageUrl(padded, fallbackUrls);
    // SECURITY (속성 인젝션): src/alt 모두 이스케이프 + http(s)만 허용
    const safeSrc = sanitizeHttpUrlForAttr(finalUrl);
    const safeMissingId = escapeGceHtmlText(padded);

    console.log('1. 파싱된 ID:', id, '(정규화:', padded + ')');
    console.log('2. DB 조회 결과(image_url):', dbUrl || null);
    console.log('3. 최종 조립된 <img> src URL:', finalUrl);
    console.log('3-1. img alt:', imgAlt);

    if (safeSrc) {
      rebuilt += `\n\n<div class="my-12 w-full"><img src="${safeSrc}" alt="${imgAlt}" class="w-full rounded-2xl shadow-xl object-cover" /></div>\n\n`;
    } else {
      rebuilt += `\n\n<div class="my-12 w-full rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-10 text-center text-sm text-stone-500">이미지를 찾을 수 없습니다 (${safeMissingId})</div>\n\n`;
    }
    cursor = match.index + match[0].length;
  }
  rebuilt += html.slice(cursor);
  html = rebuilt;

  // ── 5. 📝 전체 요약 박스 (외곽)
  html = html.replace(/📝\s*([^\n]+)([\s\S]*)/g, (_match, heading: string, body: string) => {
    const safeHeading = formatGceInlineText(String(heading ?? '').trim() || '한눈에 보는 총평', highlightClass);
    return `\n\n<div class="my-12 p-8 bg-white border border-gray-200 rounded-3xl shadow-sm"><h4 class="text-2xl font-extrabold text-black mb-8 text-center pb-6 border-b border-gray-100 break-words">${safeHeading}</h4>${body ?? ''}</div>\n\n`;
  });

  // ── 6. ✅ 내부 타겟 박스 (테마별 카드 태그 전체 하드코딩)
  html = html.replace(/✅\s*([^\n]+)\n([\s\S]*?)(?=(✅|$))/g, (_match, title: string, rest: string) => {
    const titled = String(title ?? '').trim();
    const titledParts = titled.match(/^(.+?)\s*[:：]\s*(.*)$/);
    const titleText = formatGceInlineText((titledParts?.[1] ?? titled).trim(), highlightClass);
    const sameLineRest = (titledParts?.[2] ?? '').trim();
    const restBody = sameLineRest ? `${sameLineRest}\n${rest ?? ''}` : String(rest ?? '');
    return `${buildCheckCardOpenHtml(theme, titleText)}${restBody}</ul></div>`;
  });

  // ── 7. `-` / `•` 체크리스트 → li (불릿 있는 줄만 — 본문 문단 보호)
  html = html.replace(/(?:^|\n)\s*[-•]\s*([^\n]+)/g, (_match, item: string) =>
    buildCheckListItemHtml(
      theme,
      formatGceInlineText(String(item ?? '').trim(), highlightClass),
    ),
  );

  // ── 8. Dumb Pipe: AI 원본 \\n\\n 단락만 <p> 래핑 (마침표 강제 분리 없음)
  const protectedHtml = protectTopLevelDivBlocks(html);
  const textForSplit = protectedHtml.text;

  const shouldDiagnoseKrBreak = langKey === 'KR';
  if (shouldDiagnoseKrBreak) {
    console.log('=== [KR 줄바꿈 진단 시작] ===');
    console.log('1. 치환 전 원본 텍스트 조각:', textForSplit);
  }

  const blocks = textForSplit.split(/\n\s*\n/).filter((p) => p.trim());

  if (shouldDiagnoseKrBreak) {
    console.log("2. split('\\n\\n') 결과 단락 배열:", blocks);
    console.log('=== [KR 줄바꿈 진단 끝] ===');
  }

  const wrapped = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^@@GELIA_HTML_\d+@@$/.test(trimmed)) return trimmed;
      if (/^<(div|img|section|article|header|ul|ol|li|h[1-6]|strong)\b/i.test(trimmed)) {
        return trimmed;
      }
      return wrapPlainTextBlockByLang(trimmed, langKey, highlightClass);
    })
    .filter(Boolean)
    .join('\n');

  html = restoreHtmlIslands(wrapped, protectedHtml.islands);
  // SECURITY (XSS): 최종 HTML을 DOMPurify로 정화 후 반환 (스크립트/이벤트 속성 제거)
  const sanitized = sanitizeGceMagazineHtml(html);
  console.log('4. 최종 조립된 HTML:', sanitized);
  return sanitized;
};

export default function AdminGceDashboardPage() {
  const [activeTab, setActiveTab] = useState<'insight' | 'factory' | 'review' | 'result'>('factory');

  // GCE titles (검수 데스크용) + Planning & Editor state
  const [dbTitles, setDbTitles] = useState<any[]>([]);
  const [generatedIdeas, setGeneratedIdeas] = useState<GceGeneratedIdea[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isStep1Expanded, setIsStep1Expanded] = useState(true);
  const [editorTitles, setEditorTitles] = useState({
    KR: '',
    EN: '',
    JP: '',
    VN: '',
    TH: '',
  });
  const [editorContents, setEditorContents] = useState({
    KR: '',
    EN: '',
    JP: '',
    VN: '',
    TH: '',
  });
  const [selectedLangs, setSelectedLangs] = useState<Array<'KR' | 'EN' | 'JP' | 'VN' | 'TH'>>([
    'KR',
    'EN',
    'JP',
    'VN',
    'TH',
  ]);

  const fetchGceTitles = async () => {
    const { data, error } = await supabase
      .from('gce_title_db')
      .select('*')
      .in('status', ['review', 'completed'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[gce_title_db] fetch failed:', error);
      setDbTitles([]);
    } else {
      setDbTitles((data ?? []).map(mapGceTitleRow));
    }
  };

  useEffect(() => {
    void fetchGceTitles();
  }, []);

  // Review Tab State
  const [reviewSelectedIds, setReviewSelectedIds] = useState<number[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [previewLang, setPreviewLang] = useState<GcePreviewLang>('KR');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleTargetIds, setScheduleTargetIds] = useState<number[]>([]);
  const [scheduleDateTime, setScheduleDateTime] = useState('2026-07-12T18:00');
  const [isPublishingMagazine, setIsPublishingMagazine] = useState(false);
  const [publishSlug, setPublishSlug] = useState('');
  const [publishMeta, setPublishMeta] = useState<PublishMetaState>({ ...EMPTY_PUBLISH_META });

  // 검수 데스크 리스트는 fetchGceTitles(DB) SSOT — 더미/로컬 폴백 금지
  const reviewData = dbTitles;

  // Result Tab State
  const [resultStartDate, setResultStartDate] = useState('');
  const [resultEndDate, setResultEndDate] = useState('');
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const [publishedPosts, setPublishedPosts] = useState<any[]>([]);
  const [isLoadingPublishedPosts, setIsLoadingPublishedPosts] = useState(false);

  const fetchPublishedPosts = async () => {
    setIsLoadingPublishedPosts(true);
    try {
      // 실제 발행은 magazine_editor — 요청 magazine 과 함께 조회해 누락 방지
      const { data, error } = await supabase
        .from('board_posts')
        .select('*')
        .in('post_type', ['magazine', 'magazine_editor'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = [...(data ?? [])].sort((a, b) => {
        const ta = new Date(a.published_at || a.created_at || 0).getTime();
        const tb = new Date(b.published_at || b.created_at || 0).getTime();
        return tb - ta;
      });
      setPublishedPosts(rows);
    } catch (err) {
      console.error('[fetchPublishedPosts]', err);
      setPublishedPosts([]);
      toast.error('발행 결과 불러오기에 실패했습니다.');
    } finally {
      setIsLoadingPublishedPosts(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'result') return;
    void fetchPublishedPosts();
  }, [activeTab]);

  const handleDeletePublishedPost = async (postId: string) => {
    const ok = window.confirm(
      '정말로 이 매거진을 삭제하시겠습니까? 라이브 웹사이트에서도 즉시 삭제됩니다.',
    );
    if (!ok) return;

    try {
      const { error } = await supabase.from('board_posts').delete().eq('id', postId);
      if (error) throw error;

      toast.success('매거진이 성공적으로 삭제되었습니다.');
      if (expandedResultId === postId) setExpandedResultId(null);
      await fetchPublishedPosts();
    } catch (err) {
      console.error('[handleDeletePublishedPost]', err);
      toast.error(err instanceof Error ? err.message : '매거진 삭제에 실패했습니다.');
    }
  };

  const handleOpenReview = (item: any) => {
    setSelectedReview({
      ...item,
      image: getReviewThumbnail(item),
    });
    setPreviewLang('KR');
    setPublishSlug(String(item.slug ?? '').trim());
    setPublishMeta({
      KR: String(item.meta_ko ?? '').trim(),
      EN: String(item.meta_en ?? '').trim(),
      JP: String(item.meta_jp ?? '').trim(),
      VN: String(item.meta_vn ?? '').trim(),
      TH: String(item.meta_th ?? '').trim(),
    });
    setReviewModalOpen(true);
  };

  const handleToggleReviewCheck = (id: number) => {
    setReviewSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((tId) => tId !== id) : [...prev, id]
    );
  };

  const handleToggleReviewSelectAll = () => {
    const allIds = reviewData.map((i) => i.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => reviewSelectedIds.includes(id));
    setReviewSelectedIds(allSelected ? [] : allIds);
  };

  const handleBulkApproveReviews = () => {
    if (reviewSelectedIds.length === 0) return;
    setDbTitles((prev) =>
      prev.map((item) =>
        reviewSelectedIds.includes(item.id)
          ? { ...item, status: 'generating' as const, scheduled_at: null }
          : item
      )
    );
    setReviewSelectedIds([]);
  };

  const openScheduleModal = (ids: number[]) => {
    if (ids.length === 0) return;
    const first = reviewData.find((item) => item.id === ids[0]);
    setScheduleTargetIds(ids);
    setScheduleDateTime(toDatetimeLocalValue(first?.scheduled_at ?? null));
    setScheduleModalOpen(true);
  };

  const handleBulkScheduleReviews = () => {
    openScheduleModal(reviewSelectedIds);
  };

  const handlePublishReview = (id: number) => {
    setDbTitles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'generating' as const, scheduled_at: null } : item
      )
    );
  };

  const handlePublishMagazine = async () => {
    if (!selectedReview?.id) {
      toast.error('발행할 검수 항목이 없습니다.');
      return;
    }
    if (isPublishingMagazine) return;

    // SECURITY (DB): 슬러그 화이트리스트 재검증 — 비정상 문자·과장이 섞인 값 차단
    const slug = sanitizePublishSlug(publishSlug);
    if (!slug) {
      toast.error('URL 슬러그를 입력해주세요. (영문/숫자/하이픈만 가능)');
      return;
    }

    const contentKo = sanitizeGceMagazineHtml(String(selectedReview.content_ko ?? '').trim());
    if (!String(selectedReview.title ?? '').trim() || !contentKo) {
      toast.error('제목과 KR 본문이 있어야 발행할 수 있습니다.');
      return;
    }

    // KR HTML에서 첫 번째 이미지 URL 추출 → 썸네일
    const imgMatch = contentKo.match(/<img[^>]+src=["']([^"']+)["']/i);
    const thumbnailFromHtml = imgMatch?.[1]?.trim() || '';
    const thumbnailFromList =
      Array.isArray(selectedReview.image_urls) && selectedReview.image_urls.length > 0
        ? String(selectedReview.image_urls[0] ?? '').trim()
        : '';
    const thumbnailCandidate = thumbnailFromHtml || thumbnailFromList || '';
    // SECURITY: DB에 저장하는 썸네일도 http(s)만 허용
    const thumbnail_url = isSafeHttpUrl(thumbnailCandidate) ? thumbnailCandidate : null;

    // SECURITY (DB): 메타 설명 HTML/제어문자 제거 후 저장
    const metaKo = sanitizeMetaDescription(publishMeta.KR) || null;
    const metaEn = sanitizeMetaDescription(publishMeta.EN) || null;
    const metaJp = sanitizeMetaDescription(publishMeta.JP) || null;
    const metaVn = sanitizeMetaDescription(publishMeta.VN) || null;
    const metaTh = sanitizeMetaDescription(publishMeta.TH) || null;

    const publishedAt = new Date().toISOString();
    const livePayload = {
      // 라이브 클라이언트는 magazine_editor 조회 — 스키마 호환 유지
      post_type: 'magazine_editor',
      is_active: true,
      slug,
      thumbnail_url,
      title: String(selectedReview.title ?? '').trim(),
      title_en: String(selectedReview.title_en ?? '').trim() || null,
      title_jp: String(selectedReview.title_jp ?? '').trim() || null,
      title_vn: String(selectedReview.title_vn ?? '').trim() || null,
      title_th: String(selectedReview.title_th ?? '').trim() || null,
      // 레거시 content + content_ko 동시 기록 (저장 직전 XSS 정화)
      content: contentKo,
      content_ko: contentKo,
      content_en: sanitizeGceMagazineHtml(String(selectedReview.content_en ?? '').trim()) || null,
      content_jp: sanitizeGceMagazineHtml(String(selectedReview.content_jp ?? '').trim()) || null,
      content_vn: sanitizeGceMagazineHtml(String(selectedReview.content_vn ?? '').trim()) || null,
      content_th: sanitizeGceMagazineHtml(String(selectedReview.content_th ?? '').trim()) || null,
      // DB 실컬럼: meta_ko ~ meta_th (요청의 meta_desc_* 매핑)
      meta_ko: metaKo,
      meta_en: metaEn,
      meta_jp: metaJp,
      meta_vn: metaVn,
      meta_th: metaTh,
      sub_category: String(selectedReview.category ?? '').trim() || null,
      published_at: publishedAt,
    };

    setIsPublishingMagazine(true);
    try {
      const { data: boardRow, error: boardError } = await supabase
        .from('board_posts')
        .insert(livePayload)
        .select('id')
        .single();

      if (boardError) throw boardError;
      if (!boardRow?.id) throw new Error('발행된 매거진 ID를 확인할 수 없습니다.');

      const { error: gceError } = await supabase
        .from('gce_title_db')
        .update({
          status: 'published',
          published_at: publishedAt,
          slug,
          meta_ko: livePayload.meta_ko,
          meta_en: livePayload.meta_en,
          meta_jp: livePayload.meta_jp,
          meta_vn: livePayload.meta_vn,
          meta_th: livePayload.meta_th,
          content_ko: contentKo,
          content_en: livePayload.content_en,
          content_jp: livePayload.content_jp,
          content_vn: livePayload.content_vn,
          content_th: livePayload.content_th,
        })
        .eq('id', selectedReview.id);

      if (gceError) throw gceError;

      toast.success('🎉 글로벌 매거진이 라이브 서버에 성공적으로 발행되었습니다!');
      setReviewModalOpen(false);
      setSelectedReview(null);
      setPublishSlug('');
      setPublishMeta({ ...EMPTY_PUBLISH_META });
      setReviewSelectedIds((prev) => prev.filter((id) => id !== Number(selectedReview.id)));
      await fetchGceTitles();
    } catch (err) {
      console.error('[handlePublishMagazine]', err);
      toast.error(err instanceof Error ? err.message : '매거진 발행에 실패했습니다.');
    } finally {
      setIsPublishingMagazine(false);
    }
  };

  const handleScheduleReview = (id: number) => {
    openScheduleModal([id]);
  };

  const handleConfirmSchedule = () => {
    if (scheduleTargetIds.length === 0 || !scheduleDateTime) return;
    const base = fromDatetimeLocalValue(scheduleDateTime);
    const baseMatch = scheduleDateTime.match(/(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
    setDbTitles((prev) =>
      prev.map((item) => {
        if (!scheduleTargetIds.includes(item.id)) return item;
        if (scheduleTargetIds.length === 1 || !baseMatch) {
          return { ...item, status: 'published' as const, scheduled_at: base };
        }
        // 일괄 예약: 2시간 간격 시차 발행
        const selectedIndex = scheduleTargetIds.indexOf(item.id);
        const hour = Number(baseMatch[2]) + selectedIndex * 2;
        const dayCarry = Math.floor(hour / 24);
        const finalHour = hour % 24;
        const [y, m, d] = baseMatch[1].split('-').map(Number);
        const date = new Date(y, m - 1, d + dayCarry, finalHour, Number(baseMatch[3]));
        const pad = (n: number) => String(n).padStart(2, '0');
        const stamped = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
        return { ...item, status: 'published' as const, scheduled_at: stamped };
      })
    );
    setScheduleModalOpen(false);
    setScheduleTargetIds([]);
    setReviewSelectedIds((prev) => prev.filter((id) => !scheduleTargetIds.includes(id)));
  };

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
    setScheduleTargetIds([]);
  };

  const handleBulkDeleteReviews = async () => {
    const selectedIds = [...reviewSelectedIds];
    if (selectedIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('gce_title_db')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      setReviewSelectedIds([]);
      await fetchGceTitles();
      toast.success(`${selectedIds.length}개 항목을 삭제했습니다.`);
    } catch (err) {
      console.error('[handleBulkDeleteReviews]', err);
      toast.error(err instanceof Error ? err.message : '일괄 삭제에 실패했습니다.');
    }
  };

  const handleDeleteReview = async (id: number) => {
    try {
      const { error } = await supabase
        .from('gce_title_db')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReviewSelectedIds((prev) => prev.filter((tId) => tId !== id));
      if (selectedReview?.id === id) {
        setReviewModalOpen(false);
        setSelectedReview(null);
      }
      await fetchGceTitles();
      toast.success('항목을 삭제했습니다.');
    } catch (err) {
      console.error('[handleDeleteReview]', err);
      toast.error(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleEditorContentChange = (
    langCode: 'KR' | 'EN' | 'JP' | 'VN' | 'TH',
    text: string,
  ) => {
    // SECURITY (ReDoS): 첫 줄만 분리한 뒤 선형 정규식으로 제목 추출
    const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
    const titleMatch = firstLine.match(EDITOR_TITLE_LINE_RE);

    if (titleMatch) {
      const extractedTitle = String(titleMatch[1] ?? '').trim().slice(0, 200);
      const bodyOnly = text.replace(EDITOR_TITLE_STRIP_RE, '').trim();

      setEditorTitles((prev) => ({
        ...prev,
        [langCode]: extractedTitle,
      }));
      setEditorContents((prev) => ({
        ...prev,
        [langCode]: bodyOnly,
      }));
      return;
    }

    setEditorContents((prev) => ({
      ...prev,
      [langCode]: text,
    }));
  };

  /** 통합 SEO([SEO_SLUG]/[DESC_xx]) 붙여넣기 → 슬러그·5개국어 메타 State 자동 분배 */
  const handleMetaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;

    // SEO 뭉치 텍스트를 붙여넣은 경우 감지
    if (text.includes('[SEO_SLUG]') || text.includes('[DESC_KR]')) {
      const slugMatch = text.match(/\[SEO_SLUG\]\s*:\s*([^\n]+)/);
      const krMatch = text.match(/\[DESC_KR\]\s*:\s*([^\n]+)/);
      const enMatch = text.match(/\[DESC_EN\]\s*:\s*([^\n]+)/);
      const jpMatch = text.match(/\[DESC_JP\]\s*:\s*([^\n]+)/);
      const vnMatch = text.match(/\[DESC_VN\]\s*:\s*([^\n]+)/);
      const thMatch = text.match(/\[DESC_TH\]\s*:\s*([^\n]+)/);

      // SECURITY: 슬러그는 영문/숫자/하이픈만 허용
      if (slugMatch) setPublishSlug(sanitizePublishSlug(slugMatch[1].trim()));

      setPublishMeta((prev) => ({
        ...prev,
        KR: krMatch ? sanitizeMetaDescription(krMatch[1].trim()) : prev.KR,
        EN: enMatch ? sanitizeMetaDescription(enMatch[1].trim()) : prev.EN,
        JP: jpMatch ? sanitizeMetaDescription(jpMatch[1].trim()) : prev.JP,
        VN: vnMatch ? sanitizeMetaDescription(vnMatch[1].trim()) : prev.VN,
        TH: thMatch ? sanitizeMetaDescription(thMatch[1].trim()) : prev.TH,
      }));
    } else {
      // 일반적인 타이핑의 경우 (현재 언어만 업데이트)
      setPublishMeta((prev) => ({
        ...prev,
        [previewLang]: text,
      }));
    }
  };

  const handleApplySmartTemplate = async () => {
    console.log('1. 에디터에서 넘어온 원본 텍스트:', editorContents.KR);
    const title = editorTitles.KR.trim();
    const sourceMarkdown = editorContents.KR.trim();

    if (!title) {
      toast.error('KR 매거진 제목을 입력해주세요.');
      return;
    }
    if (!sourceMarkdown) {
      toast.error('KR 원고를 입력해주세요.');
      return;
    }

    toast.success('5개국어 템플릿 동시 조립을 시작합니다!');

    try {
      const themeType = detectTheme(sourceMarkdown);
      console.log('[handleApplySmartTemplate] 자동 감지 테마:', themeType);

      // 각 언어 원고에서 SEO_DESC 추출, KR에서 SEO_SLUG 추출
      const nextMeta: PublishMetaState = { ...EMPTY_PUBLISH_META };
      for (const lang of GLOBAL_LANGUAGES) {
        const raw = String(editorContents[lang] ?? '');
        const descMatch = raw.match(/\[SEO_DESC\]\s*:\s*([^\n]+)/i);
        if (descMatch?.[1]) nextMeta[lang] = descMatch[1].trim();
      }
      const slugMatch = editorContents.KR.match(/\[SEO_SLUG\]\s*:\s*([^\n]+)/i);
      const cleanedSlug = slugMatch?.[1]
        ? slugMatch[1]
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-{2,}/g, '-')
            .replace(/^-|-$/g, '')
        : '';
      if (cleanedSlug) setPublishSlug(cleanedSlug);
      setPublishMeta(nextMeta);

      const seoDbPayload = {
        slug: cleanedSlug || null,
        meta_ko: nextMeta.KR || null,
        meta_en: nextMeta.EN || null,
        meta_jp: nextMeta.JP || null,
        meta_vn: nextMeta.VN || null,
        meta_th: nextMeta.TH || null,
      };

      const renderedEntries = await Promise.all(
        GLOBAL_LANGUAGES.map(async (lang) => {
          const text = String(editorContents[lang] ?? '').trim();
          if (!text) return [lang, ''] as const;
          const langTitle = String(editorTitles[lang] ?? '').trim() || title;
          const html = await buildMagazineHtml(text, themeType, lang, langTitle);
          return [lang, html] as const;
        }),
      );

      const contentPayload = {
        content_ko: '',
        content_en: '',
        content_jp: '',
        content_vn: '',
        content_th: '',
      };
      for (const [lang, html] of renderedEntries) {
        contentPayload[EDITOR_TO_CONTENT_FIELD[lang]] = html;
      }

      if (!contentPayload.content_ko.trim()) {
        toast.error('파싱된 KR HTML이 비어 있습니다. 원고 형식을 확인해주세요.');
        return;
      }

      const titlePayload = {
        title: '',
        title_en: null as string | null,
        title_jp: null as string | null,
        title_vn: null as string | null,
        title_th: null as string | null,
      };
      for (const lang of GLOBAL_LANGUAGES) {
        const field = EDITOR_TO_TITLE_FIELD[lang];
        const value = String(editorTitles[lang] ?? '').trim();
        if (field === 'title') {
          titlePayload.title = value;
        } else {
          titlePayload[field] = value || null;
        }
      }

      const templateType = themeType;
      const { data, error } = await supabase
        .from('gce_title_db')
        .insert({
          ...titlePayload,
          category: 'EDITORIAL',
          ...contentPayload,
          ...seoDbPayload,
          template_type: templateType,
          status: 'review',
        })
        .select('id')
        .single();

      if (error) throw error;
      if (!data?.id) throw new Error('저장된 타이틀 ID를 확인할 수 없습니다.');

      const { error: updateError } = await supabase
        .from('gce_title_db')
        .update({
          ...titlePayload,
          ...contentPayload,
          ...seoDbPayload,
          template_type: templateType,
          status: 'review',
        })
        .eq('id', data.id);
      if (updateError) throw updateError;

      const renderedCount = renderedEntries.filter(([, html]) => html.trim()).length;
      await fetchGceTitles();
      toast.success(`${renderedCount}개 언어 템플릿 조립 완료! 검수 데스크로 이동합니다.`);
      setActiveTab('review');
    } catch (err) {
      console.error('[handleApplySmartTemplate]', err);
      toast.error(err instanceof Error ? err.message : '템플릿 적용에 실패했습니다.');
    }
  };

  const handleGenerateIdeas = async () => {
    if (isGeneratingIdeas) return;
    setIsGeneratingIdeas(true);
    try {
      // design_name 컬럼 없음 → title / source_filename 사용 (실 GL 코드는 source_filename)
      const { data, error } = await supabase
        .from('nail_designs')
        .select(
          'id, title, tags, source_filename, situations, styles, category, color, mood, nail_length, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const ideas = buildIdeasFromNailDesigns(data ?? []);
      if (ideas.length === 0) {
        toast.error('기획안을 만들 수 있는 네일 데이터가 부족합니다. (최소 5컷 필요)');
        setGeneratedIdeas([]);
        return;
      }

      setGeneratedIdeas(ideas);
      setIsStep1Expanded(true);
      toast.success(`오늘의 추천 기획안 ${ideas.length}개가 실DB에서 추출되었습니다!`);
    } catch (err) {
      console.error('[handleGenerateIdeas]', err);
      toast.error(err instanceof Error ? err.message : '기획안 추출에 실패했습니다.');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleCopyIdeaPrompt = async (idea: GceGeneratedIdea) => {
    try {
      await navigator.clipboard.writeText(buildChatGptIdeaPrompt(idea));
      toast.success('챗GPT에 붙여넣을 기획안이 복사되었습니다!');
    } catch (err) {
      console.error('[handleCopyIdeaPrompt]', err);
      toast.error('클립보드 복사에 실패했습니다.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 bg-[#FAFAFA] min-h-screen">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 md:text-3xl flex items-center">
            <Sparkles className="h-8 w-8 text-[#9333EA] mr-2" />
            GELIA Growth Engine (GGE)
          </h1>
          <p className="mt-2 text-[14px] font-medium text-stone-500">트래픽 창출 오토파일럿 · 글로벌 다국어 마케팅 성장 엔진</p>
        </div>
      </div>

      {/* Styled Tabs */}
      <div className="mb-8 flex gap-2 rounded-2xl bg-white p-2 shadow-sm border border-stone-200">
        <button onClick={() => setActiveTab('insight')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold transition-all ${activeTab === 'insight' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}>
          <BarChart2 className="h-5 w-5" /> 인사이트
        </button>
        <button onClick={() => setActiveTab('factory')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold transition-all ${activeTab === 'factory' ? 'bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}>
          <Wrench className="h-5 w-5" /> 기획 & 에디터
        </button>
        <button onClick={() => setActiveTab('review')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold transition-all ${activeTab === 'review' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}>
          <FileEdit className="h-5 w-5" /> 검수 데스크
        </button>
        <button onClick={() => setActiveTab('result')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold transition-all ${activeTab === 'result' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}>
          <Link className="h-5 w-5" /> 발행 결과
        </button>
      </div>

      <div className="min-h-[500px]">
        {/* TAB 1: INSIGHT */}
        {activeTab === 'insight' && (
          <div className="animate-in fade-in space-y-8 pb-20">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-bold text-stone-500 uppercase tracking-widest">Global Traffic</h3>
                  <div className="p-2 bg-blue-50 rounded-full"><Globe className="h-4 w-4 text-blue-500" /></div>
                </div>
                <div>
                  <div className="flex items-end gap-2"><span className="text-3xl font-black text-stone-900">24,892</span></div>
                  <p className="mt-2 text-[12px] font-bold text-emerald-500 flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" /> +18.2% vs last week</p>
                </div>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-bold text-stone-500 uppercase tracking-widest">Published</h3>
                  <div className="p-2 bg-purple-50 rounded-full"><Target className="h-4 w-4 text-[#9333EA]" /></div>
                </div>
                <div>
                  <div className="flex items-end gap-2"><span className="text-3xl font-black text-stone-900">1,240</span><span className="text-[14px] font-bold text-stone-400 mb-1">posts</span></div>
                  <p className="mt-2 text-[12px] font-medium text-stone-500">5 Languages across 3 platforms</p>
                </div>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-bold text-stone-500 uppercase tracking-widest">Queue</h3>
                  <div className="p-2 bg-amber-50 rounded-full"><Activity className="h-4 w-4 text-amber-500" /></div>
                </div>
                <div>
                  <div className="flex items-end gap-2"><span className="text-3xl font-black text-stone-900">45</span><span className="text-[14px] font-bold text-stone-400 mb-1">waiting</span></div>
                  <p className="mt-2 text-[12px] font-medium text-stone-500">Content bank ready to generate</p>
                </div>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between bg-stone-900 text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#9333EA] blur-3xl opacity-30"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-[13px] font-bold text-stone-400 uppercase tracking-widest">GCE Engine</h3>
                  <div className="p-2 bg-white/10 rounded-full"><Zap className="h-4 w-4 text-amber-400" /></div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span><span className="text-xl font-black text-white">Active</span></div>
                  <p className="mt-3 text-[12px] font-medium text-stone-400">All automation systems online</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                <h3 className="text-[16px] font-extrabold text-stone-900 mb-6 flex items-center"><Globe className="h-5 w-5 text-stone-400 mr-2" /> Traffic by Region</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[13px] font-bold mb-2"><span>🇺🇸 English (Global)</span><span>45%</span></div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full w-[45%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[13px] font-bold mb-2"><span>🇯🇵 Japanese</span><span>25%</span></div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full w-[25%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[13px] font-bold mb-2"><span>🇰🇷 Korean</span><span>15%</span></div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-rose-500 rounded-full w-[15%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[13px] font-bold mb-2"><span>🌏 Others (TH, VI)</span><span>15%</span></div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-stone-800 rounded-full w-[15%]"></div></div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                <h3 className="text-[16px] font-extrabold text-stone-900 mb-6 flex items-center"><Trophy className="h-5 w-5 text-amber-500 mr-2" /> Weekly Top Performing Articles</h3>
                <div className="space-y-4">
                  {MOCK_BEST_ARTICLES.map((article, idx) => (
                    <div key={article.id} className="flex items-center gap-5 p-4 rounded-2xl border border-stone-100 bg-stone-50 transition-colors hover:bg-white hover:border-[#9333EA]/30 hover:shadow-sm">
                      <div className="flex items-center justify-center w-8 font-black text-[18px] text-stone-300">{idx + 1}</div>
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0"><img src={article.image} alt={article.title} className="w-full h-full object-cover" /></div>
                      <div className="flex-1">
                        <span className={`inline-block mb-1.5 px-2 py-0.5 text-[10px] font-black tracking-wider rounded uppercase ${article.channel === 'web' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>{article.channel}</span>
                        <h4 className="text-[14px] font-bold text-stone-900 line-clamp-1">{article.title}</h4>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[15px] font-black text-stone-900">{article.views.toLocaleString()}</div>
                        <div className="text-[12px] font-bold text-emerald-500">{article.growth}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Planning & Editor — Idea Generator + Smart Editor */}
        {activeTab === 'factory' && (
          <div className="animate-in fade-in space-y-6 pb-20">
            {/* 💡 DB 기반 기획안 자동 추출 */}
            <section className="rounded-3xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-pink-50 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <button
                  type="button"
                  onClick={() => setIsStep1Expanded((prev) => !prev)}
                  className="min-w-0 flex-1 text-left group"
                >
                  <p className="text-[12px] font-black tracking-widest uppercase text-[#9333EA] mb-2">
                    Step 1 · Idea Generator
                  </p>
                  <h2 className="text-xl md:text-2xl font-extrabold text-stone-900 tracking-tight inline-flex items-center gap-2">
                    💡 젤리아 DB 기반 기획안 자동 추출
                    {isStep1Expanded ? (
                      <ChevronUp className="h-5 w-5 text-stone-400 group-hover:text-[#9333EA] transition-colors shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-stone-400 group-hover:text-[#9333EA] transition-colors shrink-0" />
                    )}
                  </h2>
                  <p className="mt-2 text-[14px] font-medium text-stone-500 max-w-2xl">
                    에셋(사진) 역방향 기획 1단계 — DB 컨셉을 묶어 오늘의 추천 기획안 10개를 뽑고, 챗GPT 원고 프롬프트로 바로 복사하세요.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleGenerateIdeas();
                  }}
                  disabled={isGeneratingIdeas}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#EC4899] px-6 py-4 text-[15px] font-black text-white shadow-lg shadow-purple-500/30 hover:scale-[1.02] hover:shadow-purple-500/40 transition-all disabled:opacity-60 disabled:hover:scale-100 shrink-0"
                >
                  {isGeneratingIdeas ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  ✨ 오늘의 추천 기획안 10개 추출하기
                </button>
              </div>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isStep1Expanded ? 'max-h-[5000px] opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'
                }`}
              >
                {generatedIdeas.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {generatedIdeas.map((idea) => (
                      <article
                        key={idea.id}
                        className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="mb-3">
                          <span className="inline-block mb-2 px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider bg-violet-50 text-[#9333EA]">
                            {idea.category}
                          </span>
                          <h3 className="text-[15px] font-extrabold text-stone-900 leading-snug break-keep line-clamp-3">
                            {idea.title}
                          </h3>
                        </div>

                        <div className="flex-1 rounded-xl bg-stone-50 border border-stone-100 px-3.5 py-3 mb-4">
                          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                            매칭된 사진 5장
                          </p>
                          <ul className="space-y-2.5">
                            {idea.images.map((img) => (
                              <li key={img.id} className="text-[12px] font-medium text-stone-600">
                                <div className="flex gap-2">
                                  <span className="shrink-0 font-bold text-stone-800">[{img.id}]</span>
                                  <span className="break-keep">{img.concept}</span>
                                </div>
                                <p className="mt-0.5 pl-0.5 text-xs text-gray-400 break-keep">
                                  - 디테일: {img.tags}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleCopyIdeaPrompt(idea)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-900 px-4 py-3 text-[13px] font-black text-white hover:bg-stone-800 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                          📋 챗GPT용 원고 작성 프롬프트 복사
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* STEP 2. 스마트 매거진 에디터 */}
            <section className="bg-white rounded-2xl shadow-sm p-8 mt-8 border border-stone-200">
              <span className="text-purple-600 font-bold text-sm">STEP 2 . SMART EDITOR</span>
              <h2 className="mt-2 text-xl md:text-2xl font-extrabold text-stone-900 tracking-tight">
                AI원고 입력 및 템플릿 렌더링
              </h2>
              <p className="mt-2 text-[14px] font-medium text-stone-500 max-w-3xl">
                챗GPT가 작성한 원고를 붙여넣으세요. 키워드 자동 감지 엔진이 글맥락에 맞는 테마 스킨을 0.1초 만에 입혀 하이엔드 웹진으로 조립합니다.
              </p>

              <div className="mt-8 flex flex-col gap-6">
                <div className="w-full">
                  <label className="mb-1.5 block text-[13px] font-bold text-stone-600">본문 (AI 원고 · 다국어 세로 입력)</label>
                  <div className="space-y-4">
                    {(
                      [
                        { code: 'KR', label: '🇰🇷 KR' },
                        { code: 'EN', label: '🇺🇸 EN' },
                        { code: 'JP', label: '🇯🇵 JP' },
                        { code: 'VN', label: '🇻🇳 VN' },
                        { code: 'TH', label: '🇹🇭 TH' },
                      ] as const
                    ).map((lang) => {
                      const isSelected = selectedLangs.includes(lang.code);
                      return (
                        <div
                          key={lang.code}
                          className="flex flex-col sm:flex-row gap-3 sm:gap-4 rounded-xl border border-stone-200 bg-white p-3"
                        >
                          <div className="w-full sm:w-32 shrink-0 flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedLangs((prev) =>
                                  prev.includes(lang.code)
                                    ? prev.filter((code) => code !== lang.code)
                                    : [...prev, lang.code]
                                );
                              }}
                              className="h-5 w-5 rounded border-stone-300 text-[#9333EA] focus:ring-[#9333EA] cursor-pointer"
                            />
                            <span className="inline-flex items-center rounded-lg bg-stone-100 px-2.5 py-1 text-[12px] font-black text-stone-700">
                              {lang.label}
                            </span>
                          </div>
                          <div className="flex-1 flex flex-col gap-2 min-w-0">
                            <input
                              type="text"
                              value={editorTitles[lang.code]}
                              disabled={!isSelected}
                              onChange={(e) =>
                                setEditorTitles((prev) => ({
                                  ...prev,
                                  [lang.code]: e.target.value,
                                }))
                              }
                              placeholder={`${lang.code} 제목을 입력하세요`}
                              className={`w-full rounded-xl border border-stone-200 px-3 py-2.5 text-[14px] font-bold text-stone-900 outline-none ${
                                isSelected
                                  ? 'bg-stone-50 focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20'
                                  : 'bg-gray-100 opacity-50 cursor-not-allowed'
                              }`}
                            />
                            <textarea
                              value={editorContents[lang.code]}
                              disabled={!isSelected}
                              onChange={(e) => handleEditorContentChange(lang.code, e.target.value)}
                              placeholder={`${lang.label} 원고를 붙여넣으세요. ('💎 소제목', '📌 팁:', '[IMAGE_GL-XXX]' 포함)`}
                              className={`w-full min-h-[150px] whitespace-pre-wrap rounded-xl border border-stone-200 px-3 py-3 text-[13px] font-medium leading-relaxed text-stone-800 outline-none resize-y ${
                                isSelected
                                  ? 'bg-stone-50 focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20'
                                  : 'bg-gray-100 opacity-50 cursor-not-allowed'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplySmartTemplate}
                  disabled={selectedLangs.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#EC4899] px-6 py-3.5 text-[14px] font-black text-white shadow-lg shadow-purple-500/30 hover:scale-[1.02] hover:shadow-purple-500/45 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-5 w-5" />
                  {`✨ 선택된 ${selectedLangs.length}개 국어 템플릿 적용 및 자동 매칭 (0.1초)`}
                </button>
              </div>
            </section>

          </div>
        )}

        {/* TAB: REVIEW DESK */}
        {activeTab === 'review' && (
          <div className="animate-in fade-in space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-stone-900 flex items-center">
                  <PenTool className="h-6 w-6 text-[#9333EA] mr-2" /> AI 초안 검수 데스크
                </h2>
                <p className="mt-1 text-[14px] text-stone-500">AI가 작성한 원본을 확인하고 불필요한 건 삭제, 완벽한 글은 승인하여 번역을 시작하세요.</p>
              </div>
            </div>

            {/* 매거진 검수 대시보드 리스트 */}
            <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-sm">
              {/* 상단 일괄 처리 컨트롤 바 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/80">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={reviewData.length > 0 && reviewData.every((i) => reviewSelectedIds.includes(i.id))}
                    onChange={handleToggleReviewSelectAll}
                    className="h-5 w-5 rounded border-stone-300 text-[#9333EA] focus:ring-[#9333EA] cursor-pointer"
                  />
                  <span className="flex items-center gap-2 text-[14px] font-bold text-stone-600">
                    <CheckSquare className="h-5 w-5 text-[#9333EA]" />
                    {reviewSelectedIds.length > 0 ? `${reviewSelectedIds.length}개 선택됨` : '전체 선택'}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    onClick={handleBulkDeleteReviews}
                    disabled={reviewSelectedIds.length === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="일괄 삭제"
                  >
                    <Trash2 className="h-4 w-4" /> 일괄 삭제
                  </button>
                  <button
                    onClick={handleBulkScheduleReviews}
                    disabled={reviewSelectedIds.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                    title="선택 항목 시차 일괄 예약"
                  >
                    <CalendarClock className="h-4 w-4" /> ⏰ 선택 항목 일괄 예약
                  </button>
                  <button
                    onClick={handleBulkApproveReviews}
                    disabled={reviewSelectedIds.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#EC4899] px-3 py-2 text-xs font-black text-white shadow-md hover:scale-[1.02] transition-all disabled:opacity-45 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    title="선택 항목 일괄 발행"
                  >
                    <Rocket className="h-4 w-4" /> 🚀 선택 항목 일괄 발행
                  </button>
                </div>
              </div>

              <div className="hidden md:flex items-center bg-stone-50 border-b border-stone-200 px-6 py-3 text-[12px] font-bold text-stone-500 uppercase tracking-widest">
                <div className="w-12"></div>
                <div className="flex-1">썸네일 & 타이틀</div>
                <div className="w-36">AI 품질</div>
                <div className="w-36">상태</div>
                <div className="w-56 text-right">액션</div>
              </div>

              <div className="divide-y divide-stone-100">
                {reviewData.map((item) => {
                  const thumbnail = getReviewThumbnail(item);
                  const languages = getReviewLanguages(item);
                  const score = item.ai_score;
                  const dateLabel = formatReviewDate(item.created_at);

                  return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenReview(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenReview(item);
                      }
                    }}
                    className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={reviewSelectedIds.includes(item.id)}
                        onChange={() => handleToggleReviewCheck(item.id)}
                        className="h-5 w-5 rounded border-stone-300 text-[#9333EA] focus:ring-[#9333EA] cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 flex items-start gap-4 min-w-0">
                      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
                        <img src={thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="inline-block mb-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider bg-stone-100 text-stone-700">
                          {item.category || '미분류'}
                        </span>
                        <h3 className="font-bold text-[15px] text-stone-900 line-clamp-2 leading-snug">{item.title}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Globe2 className="h-3.5 w-3.5 text-stone-400 mr-0.5" />
                          {languages.map((lang) => (
                            <span
                              key={lang}
                              className="inline-flex items-center rounded-full border border-stone-200/80 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-stone-500"
                            >
                              {LANG_BADGE[lang] ?? lang}
                            </span>
                          ))}
                        </div>
                        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-stone-400">
                          <Clock className="h-3.5 w-3.5" /> {dateLabel}
                        </p>
                      </div>
                    </div>

                    <div className="w-36 shrink-0">
                      {score == null || Number.isNaN(score) ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1.5 text-[12px] font-bold text-stone-500">
                          <Star className="h-3.5 w-3.5" /> 심사중
                        </span>
                      ) : score >= 95 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-700">
                          <Star className="h-3.5 w-3.5 fill-current" /> 우수 {score}점
                        </span>
                      ) : score >= 80 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-[12px] font-bold text-amber-700">
                          <Star className="h-3.5 w-3.5" /> 보통 {score}점
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-[12px] font-bold text-rose-600">
                          <Star className="h-3.5 w-3.5" /> 보완 {score}점
                        </span>
                      )}
                    </div>

                    <div className="w-36 shrink-0">
                      {(item.status === 'review' || item.status === 'completed') && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReview(item);
                          }}
                          className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1.5 text-[12px] font-bold text-[#9333EA] cursor-pointer hover:bg-violet-100 transition-colors"
                          title="검수 상세 보기"
                        >
                          🔍 검수 대기
                        </button>
                      )}
                      {item.status === 'generating' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-600 animate-pulse">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> 번역중
                        </span>
                      )}
                      {item.status === 'published' && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-[12px] font-bold text-[#9333EA]">
                            <Clock className="h-3.5 w-3.5" /> 예약됨
                          </span>
                          {item.scheduled_at && (
                            <p className="mt-1.5 text-[11px] font-medium text-stone-400">
                              (⏰ {formatScheduledLabel(item.scheduled_at)} 오픈)
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div
                      className="w-56 shrink-0 flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handlePublishReview(item.id)}
                        className="p-2 rounded-lg bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white shadow-sm hover:scale-105 transition-all"
                        title="즉시 발행"
                      >
                        <Rocket className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScheduleReview(item.id)}
                        className="p-2 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 transition-colors"
                        title="예약 발행"
                      >
                        <CalendarClock className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenReview(item)}
                        className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                        title="뷰어/수정"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteReview(item.id)}
                        className="p-2 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  );
                })}
                {reviewData.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-[16px] font-bold text-stone-900 mb-1">검수 대기 항목이 없습니다.</p>
                    <p className="text-[14px] font-medium text-stone-500">오토 팩토리에서 생성된 초안이 이곳에 표시됩니다.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 예약 발행 캘린더 모달 */}
            {scheduleModalOpen && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80">
                    <h3 className="text-[16px] font-extrabold text-stone-900 flex items-center gap-2">
                      <CalendarClock className="h-5 w-5 text-[#9333EA]" /> ⏰ 예약 발행 시간 설정
                    </h3>
                    <button
                      onClick={handleCloseScheduleModal}
                      className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
                      title="닫기"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="px-6 py-6 space-y-4">
                    <p className="text-[13px] font-medium text-stone-500">
                      {scheduleTargetIds.length > 1
                        ? `선택된 ${scheduleTargetIds.length}개 항목을 기준 시각부터 2시간 간격으로 순차 예약합니다.`
                        : '발행할 날짜와 시간을 선택해주세요.'}
                    </p>
                    <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                      <Calendar className="h-5 w-5 text-stone-400 shrink-0" />
                      <input
                        type="datetime-local"
                        value={scheduleDateTime}
                        onChange={(e) => setScheduleDateTime(e.target.value)}
                        className="w-full bg-transparent text-[15px] font-bold text-stone-800 outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex items-center justify-end gap-2">
                    <button
                      onClick={handleCloseScheduleModal}
                      className="px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold text-[13px] hover:bg-stone-100 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleConfirmSchedule}
                      disabled={!scheduleDateTime}
                      className="px-5 py-2.5 rounded-xl bg-[#9333EA] text-white font-black text-[13px] shadow-md hover:bg-purple-600 transition-colors disabled:opacity-50"
                    >
                      예약 확정
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 풀스크린 하이엔드 검수 모달 */}
            {selectedReview && reviewModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-stone-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-11/12 max-w-7xl h-[90vh] rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  {/* 모달 헤더 + 다국어 탭 */}
                  <div className="shrink-0 border-b border-stone-100 bg-white">
                    <div className="flex items-center justify-between gap-4 px-6 py-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[#9333EA] font-black text-[15px]">
                          <Eye className="h-5 w-5 shrink-0" /> 검수 상세 뷰어
                        </div>
                        <p className="mt-1 text-[13px] font-bold text-stone-500 truncate">
                          {getLocalizedReviewTitle(selectedReview, previewLang)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReviewModalOpen(false)}
                        className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors shrink-0"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="px-6 pb-4">
                      <div className="flex items-center gap-2 overflow-x-auto">
                        <span className="mr-1 shrink-0 text-[11px] font-black uppercase tracking-widest text-stone-400">
                          Language
                        </span>
                        {PREVIEW_LANG_TABS.map((tab) => {
                          const hasContent = Boolean(
                            String(selectedReview[tab.field] ?? '').trim() ||
                              String(selectedReview[tab.titleField] ?? '').trim(),
                          );
                          const isActive = previewLang === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              disabled={!hasContent}
                              onClick={() => setPreviewLang(tab.id)}
                              className={`min-w-[58px] shrink-0 rounded-xl px-4 py-2.5 text-[13px] font-black tracking-wide transition-all ${
                                isActive
                                  ? 'bg-[#9333EA] text-white shadow-md shadow-purple-500/25 scale-[1.02]'
                                  : hasContent
                                    ? 'border border-stone-200 bg-stone-50 text-stone-700 hover:border-[#9333EA]/40 hover:bg-violet-50 hover:text-[#9333EA]'
                                    : 'cursor-not-allowed border border-stone-100 bg-stone-50 text-stone-300'
                              }`}
                              title={hasContent ? `${tab.label} 미리보기` : `${tab.label} 데이터 없음`}
                            >
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 좌우 분할 본문 */}
                  <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[65%_35%]">
                    {/* 좌측: 콘텐츠 에디터 + Editorial 미리보기 */}
                    <div className="min-h-0 overflow-y-auto border-r border-stone-100 bg-white px-5 py-5 md:px-8 md:py-6 space-y-5">
                      <div className="flex items-center gap-3 max-w-2xl mx-auto w-full">
                        <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                          <img
                            src={selectedReview.image || getReviewThumbnail(selectedReview)}
                            alt={getLocalizedReviewTitle(selectedReview, previewLang)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <label className="mb-1 block text-[12px] font-bold text-stone-500">
                            제목 ({previewLang})
                          </label>
                          <input
                            value={
                              selectedReview[
                                PREVIEW_LANG_TABS.find((t) => t.id === previewLang)?.titleField ?? 'title'
                              ] ?? ''
                            }
                            onChange={(e) => {
                              const titleField =
                                PREVIEW_LANG_TABS.find((t) => t.id === previewLang)?.titleField ?? 'title';
                              setSelectedReview((prev: any) =>
                                prev ? { ...prev, [titleField]: e.target.value } : prev
                              );
                            }}
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[15px] font-bold text-stone-900 outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
                          />
                        </div>
                      </div>

                      <div className="max-w-2xl mx-auto w-full">
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-[12px] font-bold text-stone-500">
                            본문 HTML 편집 ({previewLang})
                          </label>
                          <span className="text-[11px] font-medium text-stone-400">textarea로 수정 · 미리보기는 아래에서 확인</span>
                        </div>
                        <textarea
                          value={
                            selectedReview[
                              PREVIEW_LANG_TABS.find((t) => t.id === previewLang)?.field ?? 'content_ko'
                            ] ?? ''
                          }
                          onChange={(e) => {
                            const field =
                              PREVIEW_LANG_TABS.find((t) => t.id === previewLang)?.field ?? 'content_ko';
                            setSelectedReview((prev: any) =>
                              prev ? { ...prev, [field]: e.target.value } : prev
                            );
                          }}
                          rows={12}
                          className="w-full min-h-[220px] rounded-xl border border-stone-200 bg-white px-4 py-3 font-mono text-[13px] leading-relaxed text-stone-800 outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20 resize-y"
                          placeholder="AI가 리마스터링한 HTML 본문..."
                        />
                      </div>

                      <div className="max-w-2xl mx-auto w-full">
                        <div className="mb-4 flex items-center gap-2 justify-center">
                          <span className="text-[11px] font-bold tracking-widest uppercase text-stone-400">
                            Live Editorial Preview · {previewLang}
                          </span>
                        </div>
                        <article className="bg-white px-2 md:px-4 pb-10">
                          {/* 매거진 헤더 */}
                          <header className="text-center">
                            <p className="text-xs font-bold tracking-widest uppercase text-violet-400/80">
                              [{selectedReview.category || 'EDITORIAL'}] | GELIA EDITORIAL
                            </p>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4 break-words whitespace-pre-wrap">
                              {getLocalizedReviewTitle(selectedReview, previewLang)}
                            </h1>
                            <p className="text-xs text-gray-400 font-medium tracking-wide mb-10">
                              BY GELIA EDITOR • {formatReviewDate(selectedReview.created_at)} • 3 MIN READ
                            </p>
                          </header>

                          {/* 뷰어 영역 (HTML 렌더링) — whitespace-pre-wrap 금지: <p> 블록이 여백 담당 */}
                          {/* SECURITY (XSS): dangerouslySetInnerHTML 직전에 DOMPurify 정화 */}
                          <div
                            className="mt-6 magazine-editorial-body font-['Pretendard'] text-[#2b2b2b] tracking-[-0.02em]"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeGceMagazineHtml(
                                selectedReview[
                                  PREVIEW_LANG_TABS.find((t) => t.id === previewLang)?.field ?? 'content_ko'
                                ] || '',
                              ),
                            }}
                          />
                        </article>
                      </div>
                    </div>

                    {/* 우측: SEO 및 발행 설정 패널 */}
                    <aside className="min-h-0 overflow-y-auto bg-gray-50 px-5 py-5 md:px-6 md:py-6 flex flex-col">
                      <div className="mb-5">
                        <h3 className="text-[15px] font-extrabold text-stone-900 flex items-center gap-2">
                          ⚙️ SEO 및 발행 설정
                        </h3>
                        <p className="mt-1 text-[12px] font-medium text-stone-500">
                          검색엔진 노출과 URL 구조를 발행 전에 확정하세요.
                        </p>
                      </div>

                      <div className="flex-1 space-y-5">
                        <div>
                          <label className="mb-1.5 block text-[12px] font-bold text-stone-600">
                            URL 슬러그
                          </label>
                          <p className="mb-2 text-[11px] font-medium text-stone-400 leading-relaxed">
                            영문/숫자/하이픈만 입력 (예: summer-vacation-nail)
                          </p>
                          <input
                            type="text"
                            value={publishSlug}
                            onChange={(e) => setPublishSlug(sanitizePublishSlug(e.target.value))}
                            placeholder="summer-vacation-nail"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-[13px] font-bold text-stone-800 outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-[12px] font-bold text-stone-600">
                            검색 요약문 ({previewLang} Meta Description)
                          </label>
                          <p className="mb-2 text-[11px] font-medium text-stone-400 leading-relaxed">
                            구글 검색 시 노출될 1~2줄 요약 · 상단 언어 탭과 동기화
                          </p>
                          <textarea
                            rows={3}
                            value={publishMeta[previewLang] || ''}
                            onChange={handleMetaChange}
                            placeholder={`${previewLang} 검색 결과에 보여질 매거진 요약을 입력하세요.`}
                            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-[13px] font-medium leading-relaxed text-stone-800 outline-none resize-y focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
                          />
                          <p className="mt-1.5 text-right text-[11px] font-medium text-stone-400">
                            {(publishMeta[previewLang] || '').trim().length}자
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-stone-200 flex flex-col gap-3 shrink-0">
                        <button
                          type="button"
                          disabled={isPublishingMagazine}
                          onClick={() => void handlePublishMagazine()}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#EC4899] px-4 py-4 text-[15px] md:text-[16px] font-black text-white shadow-xl shadow-purple-500/30 hover:scale-[1.01] transition-all disabled:opacity-60 disabled:hover:scale-100"
                        >
                          {isPublishingMagazine ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Rocket className="h-5 w-5" />
                          )}
                          🚀 젤리아 매거진 최종 라이브 발행
                        </button>
                        <button
                          type="button"
                          disabled={isPublishingMagazine}
                          onClick={() => {
                            setReviewModalOpen(false);
                            handleScheduleReview(selectedReview.id);
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-3 text-[13px] font-bold text-stone-600 shadow-sm hover:bg-stone-100 transition-colors disabled:opacity-50"
                        >
                          <CalendarClock className="h-4 w-4 text-[#9333EA]" />
                          ⏰ 예약 발행
                        </button>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PUBLISH RESULTS */}
        {activeTab === 'result' && (
          <div className="animate-in fade-in space-y-6 pb-20">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-extrabold text-stone-900 flex items-center">
                  <Globe2 className="h-6 w-6 text-[#9333EA] mr-2" /> 글로벌 발행 현황
                </h2>
                <div className="hidden md:block w-px h-6 bg-stone-200"></div>
                <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1 border border-stone-100">
                  <button className="px-4 py-1.5 text-[13px] font-bold bg-white text-stone-900 shadow-sm rounded-md">전체</button>
                  <button className="px-4 py-1.5 text-[13px] font-bold text-stone-500 hover:text-stone-900">발행됨</button>
                  <button className="px-4 py-1.5 text-[13px] font-bold text-stone-500 hover:text-stone-900">예약됨</button>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                <CalendarDays className="h-5 w-5 text-stone-400 ml-2" />
                <input type="date" value={resultStartDate} onChange={(e) => setResultStartDate(e.target.value)} className="bg-transparent text-[13px] font-bold text-stone-700 outline-none cursor-pointer" />
                <span className="text-stone-400">~</span>
                <input type="date" value={resultEndDate} onChange={(e) => setResultEndDate(e.target.value)} className="bg-transparent text-[13px] font-bold text-stone-700 outline-none cursor-pointer" />
              </div>
            </div>

            {/* 고밀도 데이터 테이블 (리스트) */}
            <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-sm">
              {/* 테이블 헤더 (날짜 맨 앞으로 이동 및 너비 조정) */}
              <div className="hidden md:flex items-center bg-stone-50 border-b border-stone-200 px-6 py-4 text-[13px] font-bold text-stone-500 uppercase tracking-widest">
                <div className="w-40">Date</div>
                <div className="w-24">Status</div>
                <div className="flex-1">Article Title</div>
                <div className="w-32 text-right">Total Views</div>
                <div className="w-20"></div>
              </div>

              {/* 테이블 본문 */}
              <div className="divide-y divide-stone-100">
                {isLoadingPublishedPosts && (
                  <div className="py-16 text-center text-[14px] font-bold text-stone-500">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-[#9333EA]" />
                    발행 결과를 불러오는 중…
                  </div>
                )}

                {!isLoadingPublishedPosts && publishedPosts.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-[16px] font-bold text-stone-900 mb-1">발행된 매거진이 없습니다.</p>
                    <p className="text-[14px] font-medium text-stone-500">검수 데스크에서 라이브 발행하면 이곳에 표시됩니다.</p>
                  </div>
                )}

                {!isLoadingPublishedPosts &&
                  publishedPosts.map((post) => {
                    const postId = String(post.id);
                    const title = String(post.title || post.title_ko || '').trim() || '(제목 없음)';
                    const thumbnail = String(post.thumbnail_url ?? '').trim() || REVIEW_FALLBACK_THUMB;
                    const dateLabel = formatReviewDate(post.published_at || post.created_at);
                    const isActive = post.is_active !== false;
                    const urls = buildMagazineLiveUrls(post.slug);
                    const isExpanded = expandedResultId === postId;

                    return (
                      <div key={postId} className="flex flex-col transition-colors hover:bg-stone-50/50">
                        <div
                          onClick={() => setExpandedResultId(isExpanded ? null : postId)}
                          className="flex flex-col md:flex-row md:items-center px-6 py-5 cursor-pointer gap-4 group"
                        >
                          <div className="w-40 shrink-0 text-[13px] font-medium text-stone-500">
                            {dateLabel}
                          </div>

                          <div className="w-24 shrink-0">
                            {isActive ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-black rounded-md tracking-wider">
                                발행완료
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-stone-200 text-stone-600 text-[11px] font-black rounded-md tracking-wider">
                                비공개
                              </span>
                            )}
                          </div>

                          <div className="flex-1 flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
                              <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[15px] text-stone-900 line-clamp-1 group-hover:text-[#9333EA] transition-colors">
                                {title}
                              </div>
                              {post.slug ? (
                                <p className="mt-0.5 text-[11px] font-medium text-stone-400 truncate">
                                  /magazine/{String(post.slug)}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="w-32 shrink-0 flex items-center justify-end text-[15px] font-black text-stone-900">
                            <Eye className="h-4 w-4 text-stone-400 mr-1.5" /> —
                          </div>

                          <div className="w-20 shrink-0 flex items-center justify-end gap-0.5 text-stone-400">
                            <button
                              type="button"
                              title="매거진 삭제"
                              aria-label="매거진 삭제"
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDeletePublishedPost(postId);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <span className="group-hover:text-[#9333EA] transition-colors p-1">
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="bg-stone-50 border-t border-stone-100 px-6 py-6 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col lg:flex-row gap-8">
                              <div className="flex-1 space-y-3">
                                <h4 className="text-[12px] font-bold text-stone-500 uppercase tracking-widest mb-4">
                                  Live URLs
                                </h4>
                                {Object.entries(urls).map(([lang, url]) => (
                                  <div
                                    key={lang}
                                    className="flex items-center bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm"
                                  >
                                    <span className="px-4 py-2.5 bg-stone-100 text-stone-700 text-[13px] font-black uppercase w-16 text-center border-r border-stone-200">
                                      {lang}
                                    </span>
                                    <span className="px-4 py-2.5 text-stone-500 text-[13px] flex-1 truncate">
                                      {url}
                                    </span>
                                    <button
                                      type="button"
                                      className="p-2.5 hover:bg-stone-100 text-stone-500 transition-colors border-l border-stone-200"
                                      title="주소 복사"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void navigator.clipboard.writeText(`${window.location.origin}${url}`);
                                        toast.success('URL이 복사되었습니다.');
                                      }}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-2.5 hover:bg-stone-100 text-[#9333EA] transition-colors border-l border-stone-200"
                                      title="새 창으로 열기"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </div>
                                ))}
                              </div>

                              <div className="w-full lg:w-72 shrink-0">
                                <h4 className="text-[12px] font-bold text-stone-500 uppercase tracking-widest mb-4">
                                  SEO Summary
                                </h4>
                                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-2.5 text-[12px] text-stone-600">
                                  <p>
                                    <span className="font-black text-stone-800">Slug</span>:{' '}
                                    {String(post.slug ?? '—')}
                                  </p>
                                  <p className="line-clamp-3">
                                    <span className="font-black text-stone-800">Meta KR</span>:{' '}
                                    {String(post.meta_ko ?? '—')}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-stone-200 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTab('review');
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-[12px] font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" /> 검수 데스크로
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
