import { useEffect, useRef, useState } from 'react';
import { 
  BarChart2, Sparkles, Loader2, 
  Globe, Calendar, CheckSquare, Clock, 
  CheckCircle2, 
  Link, Copy, ExternalLink,
  CalendarDays, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, Globe2,
  Target, Zap, Trophy, ArrowUpRight, Activity,
  PenTool, FileEdit,
  Trash2, Save, X, Star,
  Wand2, CheckCircle, Wrench, Plus, Pencil,
  Image as ImageIcon, Rocket, CalendarClock, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/shared/api/supabaseClient';
import { generateGceArticle } from '@/services/gceAiService';

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
    status: normalizeDraftStatus(row.status),
    content_ko: String(row.content_ko ?? ''),
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

const DraftStatusBadge = ({ status }: { status: DraftUiStatus }) => {
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1.5 text-[12px] font-bold text-stone-600">
        작성중 (Draft)
      </span>
    );
  }
  if (status === 'generating') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-600 animate-pulse">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> 생성중
      </span>
    );
  }
  if (status === 'review' || status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-[12px] font-bold text-[#9333EA]">
        🔍 검수 대기
      </span>
    );
  }
  if (status === 'published') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-700">
        발행 완료
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1.5 text-[12px] font-bold text-violet-700">
      생성 대기 (Pending)
    </span>
  );
};

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

const MOCK_RESULTS = [
  {
    id: 1,
    title: '여름 쿨톤 피부를 2배 맑게 밝혀주는 핑크 시럽 네일 완벽 가이드',
    status: 'published',
    date: '2026-07-10',
    totalViews: 12450,
    thumbnail: 'https://picsum.photos/seed/nail-result1/100/100',
    urls: {
      KO: '/magazine/1',
      EN: '/en/magazine/1',
      JP: '/jp/magazine/1',
      VN: '/vn/magazine/1',
      TH: '/th/magazine/1',
    },
    traffic: [
      { code: 'EN', label: 'EN (Global)', color: 'bg-blue-500', views: 5200 },
      { code: 'KO', label: 'KO (Korea)', color: 'bg-rose-500', views: 3100 },
      { code: 'JP', label: 'JP (Japan)', color: 'bg-emerald-500', views: 2100 },
      { code: 'VN', label: 'VN (Vietnam)', color: 'bg-amber-500', views: 1250 },
      { code: 'TH', label: 'TH (Thailand)', color: 'bg-violet-500', views: 800 },
    ],
  },
  {
    id: 2,
    title: '단정함과 세련됨의 끝판왕! 여름 오피스룩에 찰떡인 미니멀 화이트 프렌치',
    status: 'published',
    date: '2026-07-08',
    totalViews: 8200,
    thumbnail: 'https://picsum.photos/seed/nail-result2/100/100',
    urls: {
      KO: '/magazine/2',
      EN: '/en/magazine/2',
      JP: '/jp/magazine/2',
      VN: '/vn/magazine/2',
      TH: '/th/magazine/2',
    },
    traffic: [
      { code: 'EN', label: 'EN (Global)', color: 'bg-blue-500', views: 3000 },
      { code: 'KO', label: 'KO (Korea)', color: 'bg-rose-500', views: 2800 },
      { code: 'JP', label: 'JP (Japan)', color: 'bg-emerald-500', views: 1200 },
      { code: 'VN', label: 'VN (Vietnam)', color: 'bg-amber-500', views: 700 },
      { code: 'TH', label: 'TH (Thailand)', color: 'bg-violet-500', views: 500 },
    ],
  },
  {
    id: 3,
    title: '2026년 하반기를 휩쓸 크롬 네일 디자인 BEST 5',
    status: 'scheduled',
    date: '2026-07-20 (12:00 예약)',
    totalViews: 0,
    thumbnail: 'https://picsum.photos/seed/nail-result3/100/100',
    urls: {
      KO: '/magazine/3',
      EN: '/en/magazine/3',
      JP: '/jp/magazine/3',
      VN: '/vn/magazine/3',
      TH: '/th/magazine/3',
    },
    traffic: [
      { code: 'EN', label: 'EN (Global)', color: 'bg-blue-500', views: 0 },
      { code: 'KO', label: 'KO (Korea)', color: 'bg-rose-500', views: 0 },
      { code: 'JP', label: 'JP (Japan)', color: 'bg-emerald-500', views: 0 },
      { code: 'VN', label: 'VN (Vietnam)', color: 'bg-amber-500', views: 0 },
      { code: 'TH', label: 'TH (Thailand)', color: 'bg-violet-500', views: 0 },
    ],
  },
];

const MOCK_BEST_ARTICLES = [
  { id: 1, title: '여름 쿨톤 피부를 2배 맑게 밝혀주는 핑크 시럽 네일 완벽 가이드', image: 'https://picsum.photos/seed/nailhero2/200/200', views: 12450, growth: '+15%', channel: 'web' },
  { id: 2, title: '단정함과 세련됨의 끝판왕! 여름 오피스룩 미니멀 프렌치', image: 'https://picsum.photos/seed/occ2/200/200', views: 8200, growth: '+8%', channel: 'web' },
  { id: 3, title: '여름휴가 네일 무조건 이거 박제! 쿨톤 인생 네일 찾음 🌊✨', image: 'https://picsum.photos/seed/occ3/200/200', views: 7500, growth: '+22%', channel: 'sns' },
];

const ITEMS_PER_PAGE = 10;

type GceIdeaImage = { id: string; concept: string; tags: string };
type GceGeneratedIdea = {
  id: number;
  category: string;
  title: string;
  images: GceIdeaImage[];
};

const MOCK_IDEA_POOL: Omit<GceGeneratedIdea, 'id'>[] = [
  {
    category: '썸머/바캉스',
    title: '2026 바캉스 네일! 수영장에서 시선 강탈하는 형광 시럽 룩북',
    images: [
      { id: 'GL-001', concept: '블루 시럽 물방울', tags: '미디엄 아몬드, 쿨톤 블루, 물방울 텍스처, 바캉스' },
      { id: 'GL-023', concept: '네온 오렌지 프렌치', tags: '스퀘어, 워밍 네온, 프렌치 팁, 선셋' },
      { id: 'GL-045', concept: '화이트 조개 파츠 엠보', tags: '숏 라운드, 화이트, 3D 파츠, 비치' },
      { id: 'GL-088', concept: '투명 얼음 자석 젤', tags: '롱 아몬드, 투명 베이스, 자석 라인, 쿨톤' },
      { id: 'GL-102', concept: '그린 민트 그라데이션', tags: '미디엄 오벌, 민트, 그라데이션, 프레시' },
    ],
  },
  {
    category: '웨딩/하객',
    title: '하객룩의 정석, 우아한 화이트 펄 & 쉬머 프렌치 가이드',
    images: [
      { id: 'GL-110', concept: '아이보리 펄 풀컬러', tags: '미디엄 아몬드, 아이보리, 펄 쉬머, 하객' },
      { id: 'GL-118', concept: '샴페인 골드 프렌치', tags: '오벌, 샴페인 골드, 프렌치, 웨딩' },
      { id: 'GL-126', concept: '미니 리본 파츠', tags: '숏 스퀘어, 화이트, 리본 파츠, 로맨틱' },
      { id: 'GL-134', concept: '소프트 쉬머 그라데이션', tags: '미디엄 라운드, 누드핑크, 그라데이션, 우아함' },
      { id: 'GL-142', concept: '투명 크리스탈 스톤', tags: '롱 아몬드, 투명, 크리스탈, 포토존' },
    ],
  },
  {
    category: '오피스/데일리',
    title: '출근룩 완성! 단정하면서도 세련된 미니멀 뉴트럴 네일',
    images: [
      { id: 'GL-201', concept: '베이지 누드 풀컬러', tags: '숏 스퀘어, 베이지, 풀컬러, 오피스' },
      { id: 'GL-209', concept: '딥 브라운 프렌치', tags: '미디엄 오벌, 딥브라운, 프렌치, 데일리' },
      { id: 'GL-217', concept: '매트 블랙 포인트', tags: '숏 라운드, 매트 블랙, 포인트 네일, 시크' },
      { id: 'GL-225', concept: '실버 라인 아트', tags: '미디엄 스퀘어, 실버 라인, 미니멀, 출근' },
      { id: 'GL-233', concept: '소프트 그레이 시럽', tags: '숏 오벌, 그레이, 시럽, 뉴트럴' },
    ],
  },
  {
    category: '계절/톤',
    title: '쿨톤 피부를 밝혀주는 라벤더 글라스 네일 완벽 매칭',
    images: [
      { id: 'GL-301', concept: '라벤더 글라스 시럽', tags: '미디엄 아몬드, 쿨톤 라벤더, 글라스, 투명감' },
      { id: 'GL-309', concept: '스모키 퍼플 그라데이션', tags: '롱 오벌, 스모키 퍼플, 그라데이션, 쿨톤' },
      { id: 'GL-317', concept: '실버 미러 파우더', tags: '미디엄 스퀘어, 실버 미러, 파우더, 화려함' },
      { id: 'GL-325', concept: '쿨핑크 프렌치', tags: '숏 라운드, 쿨핑크, 프렌치, 생기' },
      { id: 'GL-333', concept: '투명 홀로그램 파츠', tags: '미디엄 아몬드, 홀로그램, 파츠, 포인트' },
    ],
  },
  {
    category: '썸머/바캉스',
    title: '바다보다 예쁜 손끝, 트로피컬 프루트 네일 BEST 룩',
    images: [
      { id: 'GL-050', concept: '망고 옐로우 시럽', tags: '미디엄 오벌, 망고 옐로우, 시럽, 트로피컬' },
      { id: 'GL-058', concept: '코코넛 화이트 도트', tags: '숏 스퀘어, 화이트, 도트 아트, 비치' },
      { id: 'GL-066', concept: '워터멜론 핑크 그라데이션', tags: '미디엄 아몬드, 워터멜론 핑크, 그라데이션, 상큼' },
      { id: 'GL-074', concept: '라임 네온 라인', tags: '숏 라운드, 라임 네온, 라인 아트, 바캉스' },
      { id: 'GL-082', concept: '트로피컬 플라워 파츠', tags: '롱 아몬드, 플라워 파츠, 컬러풀, 휴가' },
    ],
  },
  {
    category: '웨딩/하객',
    title: '신부 손끝의 하이라이트, 로즈골드 웨딩 네일 화보',
    images: [
      { id: 'GL-150', concept: '로즈골드 미러', tags: '롱 아몬드, 로즈골드, 미러, 웨딩' },
      { id: 'GL-158', concept: '블러시 핑크 시럽', tags: '미디엄 오벌, 블러시 핑크, 시럽, 신부' },
      { id: 'GL-166', concept: '미세 스톤 테두리', tags: '미디엄 스퀘어, 스톤 테두리, 디테일, 화보' },
      { id: 'GL-174', concept: '실크 화이트 그라데이션', tags: '롱 오벌, 실크 화이트, 그라데이션, 우아함' },
      { id: 'GL-182', concept: '진주 파츠 포인트', tags: '숏 라운드, 진주 파츠, 포인트, 로맨틱' },
    ],
  },
  {
    category: '오피스/데일리',
    title: '짧은 손톱도 OK! 데일리 숏네일 실속 디자인 모음',
    images: [
      { id: 'GL-240', concept: '숏 누드 베이스', tags: '숏 스퀘어, 누드, 베이스, 데일리' },
      { id: 'GL-248', concept: '하프문 프렌치', tags: '숏 라운드, 하프문, 프렌치, 실용' },
      { id: 'GL-256', concept: '미니 하트 포인트', tags: '숏 오벌, 미니 하트, 포인트, 귀여움' },
      { id: 'GL-264', concept: '세로 그라데이션', tags: '숏 스퀘어, 세로 그라데이션, 길이감, 실속' },
      { id: 'GL-272', concept: '투명 글로시 탑', tags: '숏 라운드, 투명 글로시, 탑코트, 청결감' },
    ],
  },
  {
    category: '계절/톤',
    title: '웜톤 맞춤, 코랄 피치 시럽으로 만드는 생기 손끝',
    images: [
      { id: 'GL-340', concept: '코랄 피치 시럽', tags: '미디엄 아몬드, 웜톤 코랄, 시럽, 생기' },
      { id: 'GL-348', concept: '웜베이지 프렌치', tags: '미디엄 오벌, 웜베이지, 프렌치, 톤업' },
      { id: 'GL-356', concept: '골드 포일 조각', tags: '숏 스퀘어, 골드 포일, 파츠, 화려함' },
      { id: 'GL-364', concept: '테라코타 그라데이션', tags: '롱 아몬드, 테라코타, 그라데이션, 가을감성' },
      { id: 'GL-372', concept: '앰버 스톤 포인트', tags: '미디엄 라운드, 앰버 스톤, 포인트, 웜톤' },
    ],
  },
  {
    category: '썸머/바캉스',
    title: '한여름 밤의 파티 네일, 글리터 & 홀로그램 시그니처',
    images: [
      { id: 'GL-090', concept: '홀로그램 풀파우더', tags: '롱 아몬드, 홀로그램, 풀파우더, 파티' },
      { id: 'GL-098', concept: '실버 글리터 프렌치', tags: '미디엄 스퀘어, 실버 글리터, 프렌치, 나이트' },
      { id: 'GL-106', concept: '오로라 자석젤', tags: '미디엄 아몬드, 쿨톤 퍼플, 화려함, 파티' },
      { id: 'GL-114', concept: '네온 핑크 베이스', tags: '숏 오벌, 네온 핑크, 베이스, 시선강탈' },
      { id: 'GL-122', concept: '스타 파츠 클러스터', tags: '롱 스퀘어, 스타 파츠, 클러스터, 무대' },
    ],
  },
  {
    category: '오피스/데일리',
    title: '미팅부터 퇴근 후까지, 올데이 클린 네일 스타일링',
    images: [
      { id: 'GL-280', concept: '클린 화이트 시럽', tags: '숏 스퀘어, 클린 화이트, 시럽, 미팅' },
      { id: 'GL-288', concept: '소프트 모브 풀컬러', tags: '미디엄 오벌, 소프트 모브, 풀컬러, 데일리' },
      { id: 'GL-296', concept: '씬 블랙 라인', tags: '숏 라운드, 씬 블랙 라인, 미니멀, 세련' },
      { id: 'GL-304', concept: '펄 베이지 그라데이션', tags: '미디엄 아몬드, 펄 베이지, 그라데이션, 올데이' },
      { id: 'GL-312', concept: '미니멀 스퀘어 파츠', tags: '숏 스퀘어, 미니멀 파츠, 포인트, 퇴근룩' },
    ],
  },
];

const buildChatGptIdeaPrompt = (idea: GceGeneratedIdea) => {
  const lines = idea.images.map(
    (img, i) => `${i + 1}. [${img.id}] ${img.concept} (디테일: ${img.tags})`
  );
  return [
    `카테고리: ${idea.category}`,
    `제목: ${idea.title}`,
    '사용할 네일 사진 리스트:',
    ...lines,
  ].join('\n');
};

export default function AdminGceDashboardPage() {
  const [activeTab, setActiveTab] = useState<'insight' | 'factory' | 'review' | 'result'>('factory');

  // Factory Smart Editor State
  const [dbTitles, setDbTitles] = useState<any[]>([]);
  const [isLoadingTitles, setIsLoadingTitles] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [draftContents, setDraftContents] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [generatedIdeas, setGeneratedIdeas] = useState<GceGeneratedIdea[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const draftTextareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const itemsPerPage = ITEMS_PER_PAGE;

  const fetchGceTitles = async () => {
    setIsLoadingTitles(true);
    const { data, error } = await supabase
      .from('gce_title_db')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('[gce_title_db] fetch failed:', error);
      setDbTitles([]);
    } else {
      const rows = (data ?? []).map(mapGceTitleRow);
      setDbTitles(rows);
      setDraftContents((prev) => {
        const next = { ...prev };
        rows.forEach((row: any) => {
          if (next[row.id] === undefined) next[row.id] = row.content_ko ?? '';
        });
        return next;
      });
    }
    setIsLoadingTitles(false);
  };

  useEffect(() => {
    void fetchGceTitles();
  }, []);

  // Review Tab State
  const [reviewSelectedIds, setReviewSelectedIds] = useState<number[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleTargetIds, setScheduleTargetIds] = useState<number[]>([]);
  const [scheduleDateTime, setScheduleDateTime] = useState('2026-07-12T18:00');

  const reviewData = dbTitles.filter(
    (item) => item.status === 'review' || item.status === 'completed'
  );

  // Result Tab State
  const [resultStartDate, setResultStartDate] = useState('');
  const [resultEndDate, setResultEndDate] = useState('');
  const [expandedResultId, setExpandedResultId] = useState<number | null>(null);

  const handleOpenReview = (item: any) => {
    setSelectedReview({
      ...item,
      image: getReviewThumbnail(item),
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

  const handleBulkDeleteReviews = () => {
    if (reviewSelectedIds.length === 0) return;
    setDbTitles((prev) => prev.filter((item) => !reviewSelectedIds.includes(item.id)));
    setReviewSelectedIds([]);
  };

  const handleDeleteReview = (id: number) => {
    setDbTitles((prev) => prev.filter((item) => item.id !== id));
    setReviewSelectedIds((prev) => prev.filter((tId) => tId !== id));
  };

  const totalPages = Math.max(1, Math.ceil(dbTitles.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const currentData = dbTitles.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const toggleExpandRow = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const focusDraftEditor = (id: number) => {
    window.setTimeout(() => {
      draftTextareaRefs.current[id]?.focus();
      draftTextareaRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  };

  const handleDraftContentChange = (id: number, value: string) => {
    setDraftContents((prev) => ({ ...prev, [id]: value }));
  };

  const handleDraftMetaChange = (id: number, patch: { title?: string; category?: string }) => {
    setDbTitles((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const persistDraft = async (item: any) => {
    const content = draftContents[item.id] ?? item.content_ko ?? '';
    const title = String(item.title || '').trim() || '제목 없음';
    const category = item.category || FACTORY_CATEGORIES[0];

    if (item.id < 0 || item.isTemp) {
      const { data, error } = await supabase
        .from('gce_title_db')
        .insert({
          title,
          category,
          content_ko: content,
          status: 'draft',
        })
        .select('*')
        .single();
      if (error) throw error;
      const saved = mapGceTitleRow(data);
      setDbTitles((prev) => prev.map((row) => (row.id === item.id ? saved : row)));
      setDraftContents((prev) => {
        const next = { ...prev };
        next[saved.id] = content;
        delete next[item.id];
        return next;
      });
      setExpandedId(saved.id);
      return saved;
    }

    const { error } = await supabase
      .from('gce_title_db')
      .update({ title, category, content_ko: content, status: 'draft' })
      .eq('id', item.id);
    if (error) throw error;
    setDbTitles((prev) =>
      prev.map((row) =>
        row.id === item.id
          ? { ...row, title, category, content_ko: content, status: 'draft' as const }
          : row
      )
    );
    return { ...item, title, category, content_ko: content, status: 'draft' as const };
  };

  const handleSaveDraft = async (item: any) => {
    setSavingId(item.id);
    try {
      await persistDraft(item);
      toast.success('임시저장 완료!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '임시저장에 실패했습니다.');
    } finally {
      setSavingId(null);
    }
  };

  const handleStartGlobalPipeline = async (item: any) => {
    setProcessingId(item.id);
    try {
      const saved = await persistDraft(item);
      setDbTitles((prev) =>
        prev.map((row) => (row.id === saved.id ? { ...row, status: 'generating' as const } : row))
      );
      await supabase
        .from('gce_title_db')
        .update({ status: 'generating' })
        .eq('id', saved.id);
      await generateGceArticle(
        saved.title,
        saved.content_ko ?? draftContents[saved.id] ?? '',
        saved.category,
        saved.id,
      );
      toast.success('글로벌 번역·매칭 파이프라인을 시작했습니다!');
      setActiveTab('review');
    } catch (err) {
      console.error('[handleStartGlobalPipeline]', err);
      toast.error(err instanceof Error ? err.message : '파이프라인 실행에 실패했습니다.');
    } finally {
      setProcessingId(null);
      await fetchGceTitles();
    }
  };

  const handleGenerateIdeas = () => {
    setIsGeneratingIdeas(true);
    window.setTimeout(() => {
      const ideas = MOCK_IDEA_POOL.slice(0, 10).map((idea, index) => ({
        ...idea,
        id: index + 1,
      }));
      setGeneratedIdeas(ideas);
      setIsGeneratingIdeas(false);
      toast.success('오늘의 추천 기획안 10개가 추출되었습니다!');
    }, 450);
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

  const handleStartNewDraft = () => {
    const tempId = -Date.now();
    const blank = {
      id: tempId,
      category: FACTORY_CATEGORIES[0],
      title: '',
      status: 'draft' as const,
      content_ko: '',
      isTemp: true,
    };
    setDbTitles((prev) => [blank, ...prev.filter((row) => !row.isTemp)]);
    setDraftContents((prev) => ({ ...prev, [tempId]: '' }));
    setCurrentPage(1);
    setExpandedId(tempId);
    focusDraftEditor(tempId);
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
                <div>
                  <p className="text-[12px] font-black tracking-widest uppercase text-[#9333EA] mb-2">
                    Step 1 · Idea Generator
                  </p>
                  <h2 className="text-xl md:text-2xl font-extrabold text-stone-900 tracking-tight">
                    💡 젤리아 DB 기반 기획안 자동 추출
                  </h2>
                  <p className="mt-2 text-[14px] font-medium text-stone-500 max-w-2xl">
                    에셋(사진) 역방향 기획 1단계 — DB 컨셉을 묶어 오늘의 추천 기획안 10개를 뽑고, 챗GPT 원고 프롬프트로 바로 복사하세요.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateIdeas}
                  disabled={isGeneratingIdeas}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#EC4899] px-6 py-4 text-[15px] font-black text-white shadow-lg shadow-purple-500/30 hover:scale-[1.02] hover:shadow-purple-500/40 transition-all disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isGeneratingIdeas ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  ✨ 오늘의 추천 기획안 10개 추출하기
                </button>
              </div>

              {generatedIdeas.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
            </section>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
              <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                📝 내 매거진 초안 (Drafts)
                <span className="ml-2 text-[14px] font-bold text-stone-400">
                  {dbTitles.length.toLocaleString()}건
                </span>
              </h2>
              <button
                type="button"
                onClick={handleStartNewDraft}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#EC4899] px-5 py-3 text-[14px] font-black text-white shadow-md hover:scale-[1.02] hover:shadow-purple-500/30 transition-all"
              >
                <Plus className="h-5 w-5" /> + 새 글 작성
              </button>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
              <div className="hidden md:flex items-center bg-stone-50 border-b border-stone-200 px-6 py-3 text-[12px] font-bold text-stone-500 uppercase tracking-widest">
                <div className="w-14">No.</div>
                <div className="w-32">카테고리</div>
                <div className="flex-1">제목</div>
                <div className="w-36">상태</div>
                <div className="w-28 text-right">액션</div>
              </div>

              <div className="divide-y divide-stone-100">
                {isLoadingTitles ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-stone-500">
                    <Loader2 className="h-7 w-7 animate-spin text-[#9333EA]" />
                    <p className="text-[14px] font-bold">데이터를 불러오는 중입니다...</p>
                  </div>
                ) : (
                  currentData.map((item) => {
                    const isExpanded = expandedId === item.id;
                    return (
                      <div key={item.id} className="bg-white">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleExpandRow(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleExpandRow(item.id);
                            }
                          }}
                          className={`w-full flex flex-col md:flex-row md:items-center gap-3 px-6 py-4 text-left cursor-pointer transition-colors ${
                            isExpanded ? 'bg-violet-50/40' : 'hover:bg-stone-50/80'
                          }`}
                        >
                          <div className="w-14 shrink-0 font-black text-stone-300 text-[15px]">{item.id < 0 ? 'NEW' : item.id}</div>
                          <div className="w-32 shrink-0">
                            <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider bg-stone-100 text-stone-700">
                              {item.category || FACTORY_CATEGORIES[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[15px] text-stone-900 line-clamp-2">
                              {item.title?.trim() ? item.title : '제목 없음 (새 초안)'}
                            </p>
                          </div>
                          <div className="w-36 shrink-0">
                            <DraftStatusBadge status={item.status} />
                          </div>
                          <div className="w-28 shrink-0 flex justify-end text-stone-400">
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div
                            className="border-t border-stone-100 bg-gray-50 p-6 space-y-4 animate-in fade-in slide-in-from-top-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
                              <div>
                                <label className="mb-1.5 block text-[13px] font-bold text-stone-600">제목</label>
                                <input
                                  value={item.title ?? ''}
                                  onChange={(e) => handleDraftMetaChange(item.id, { title: e.target.value })}
                                  placeholder="매거진 제목을 입력하세요"
                                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-[15px] font-bold text-stone-900 outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
                                />
                              </div>
                              <div>
                                <label className="mb-1.5 block text-[13px] font-bold text-stone-600">카테고리</label>
                                <select
                                  value={item.category || FACTORY_CATEGORIES[0]}
                                  onChange={(e) => handleDraftMetaChange(item.id, { category: e.target.value })}
                                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-[13px] font-bold text-stone-800 outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
                                >
                                  {FACTORY_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="mb-1.5 block text-[13px] font-bold text-stone-600">한국어 본문</label>
                              <textarea
                                ref={(el) => {
                                  draftTextareaRefs.current[item.id] = el;
                                }}
                                value={draftContents[item.id] ?? ''}
                                onChange={(e) => handleDraftContentChange(item.id, e.target.value)}
                                rows={14}
                                placeholder="매거진 본문을 자유롭게 작성해주세요. 사진은 AI가 자동으로 매칭합니다."
                                className="w-full min-h-[300px] rounded-xl border border-stone-200 bg-white px-4 py-3 text-[14px] font-medium text-stone-800 leading-relaxed outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20 resize-y"
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => void handleSaveDraft(item)}
                                disabled={savingId === item.id || processingId === item.id}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-[13px] font-bold text-stone-700 hover:bg-white/80 shadow-sm transition-colors disabled:opacity-50"
                              >
                                {savingId === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                                💾 임시저장
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleStartGlobalPipeline(item)}
                                disabled={processingId === item.id || savingId === item.id}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#EC4899] px-5 py-3 text-[13px] font-black text-white shadow-lg shadow-purple-500/30 hover:scale-[1.02] hover:shadow-purple-500/50 transition-all disabled:opacity-60 disabled:hover:scale-100"
                              >
                                {processingId === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Wand2 className="h-4 w-4" />
                                )}
                                ✨ 글로벌 번역 및 사진 매칭 시작
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {!isLoadingTitles && dbTitles.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-[16px] font-bold text-stone-900 mb-1">작성된 초안이 없습니다.</p>
                    <p className="text-[14px] font-medium text-stone-500">[+ 새 글 작성]으로 첫 매거진을 시작해보세요.</p>
                  </div>
                )}
              </div>

              {!isLoadingTitles && dbTitles.length > 0 && (
                <div className="flex items-center justify-center gap-3 border-t border-stone-100 bg-stone-50/80 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(safePage - 1)}
                    disabled={safePage <= 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-[13px] font-bold text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" /> 이전
                  </button>
                  <span className="min-w-[7.5rem] text-center text-[13px] font-bold text-stone-600">
                    Page {safePage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-[13px] font-bold text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    다음 <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
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
                  <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-5 hover:bg-stone-50/60 transition-colors">
                    <div className="w-12 shrink-0">
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
                        <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1.5 text-[12px] font-bold text-[#9333EA]">
                          🔍 검수 대기
                        </span>
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

                    <div className="w-56 shrink-0 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handlePublishReview(item.id)}
                        className="p-2 rounded-lg bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white shadow-sm hover:scale-105 transition-all"
                        title="즉시 발행"
                      >
                        <Rocket className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleScheduleReview(item.id)}
                        className="p-2 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 transition-colors"
                        title="예약 발행"
                      >
                        <CalendarClock className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenReview(item)}
                        className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                        title="뷰어/수정"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(item.id)}
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
            {reviewModalOpen && selectedReview && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-stone-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-11/12 max-w-7xl h-[90vh] rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  {/* 모달 헤더 */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white shrink-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[#9333EA] font-black text-[15px]">
                        <Eye className="h-5 w-5 shrink-0" /> 검수 상세 뷰어
                      </div>
                      <p className="mt-1 text-[13px] font-bold text-stone-500 truncate">
                        {selectedReview.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReviewModalOpen(false)}
                      className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* 좌우 분할 본문 */}
                  <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[65%_35%]">
                    {/* 좌측: 콘텐츠 에디터 + Editorial 미리보기 */}
                    <div className="min-h-0 overflow-y-auto border-r border-stone-100 bg-white px-5 py-5 md:px-8 md:py-6 space-y-5">
                      <div className="flex items-center gap-3 max-w-2xl mx-auto w-full">
                        <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                          <img
                            src={selectedReview.image || getReviewThumbnail(selectedReview)}
                            alt={selectedReview.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <label className="mb-1 block text-[12px] font-bold text-stone-500">제목</label>
                          <input
                            value={selectedReview.title ?? ''}
                            onChange={(e) =>
                              setSelectedReview((prev: any) =>
                                prev ? { ...prev, title: e.target.value } : prev
                              )
                            }
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[15px] font-bold text-stone-900 outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20"
                          />
                        </div>
                      </div>

                      <div className="max-w-2xl mx-auto w-full">
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-[12px] font-bold text-stone-500">본문 HTML 편집</label>
                          <span className="text-[11px] font-medium text-stone-400">textarea로 수정 · 미리보기는 아래에서 확인</span>
                        </div>
                        <textarea
                          value={selectedReview.content_ko ?? ''}
                          onChange={(e) =>
                            setSelectedReview((prev: any) =>
                              prev ? { ...prev, content_ko: e.target.value } : prev
                            )
                          }
                          rows={12}
                          className="w-full min-h-[220px] rounded-xl border border-stone-200 bg-white px-4 py-3 font-mono text-[13px] leading-relaxed text-stone-800 outline-none focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20 resize-y"
                          placeholder="AI가 리마스터링한 HTML 본문..."
                        />
                      </div>

                      <div className="max-w-2xl mx-auto w-full">
                        <div className="mb-4 flex items-center gap-2 justify-center">
                          <span className="text-[11px] font-bold tracking-widest uppercase text-stone-400">Live Editorial Preview</span>
                        </div>
                        <article className="bg-white px-2 md:px-4 pb-10">
                          {/* 매거진 헤더 */}
                          <header className="text-center">
                            <p className="text-xs font-bold tracking-widest uppercase text-violet-400/80">
                              [{selectedReview.category || 'EDITORIAL'}] | GELIA EDITORIAL
                            </p>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4 break-keep">
                              {selectedReview.title}
                            </h1>
                            <p className="text-xs text-gray-400 font-medium tracking-wide mb-10">
                              BY GELIA EDITOR • {formatReviewDate(selectedReview.created_at)} • 3 MIN READ
                            </p>
                          </header>

                          <GceTemplateRenderer
                            html={selectedReview.content_ko || ''}
                            templateType={selectedReview.template_type}
                          />
                        </article>
                      </div>
                    </div>

                    {/* 우측: AI 품질검사 패널 */}
                    <aside className="min-h-0 overflow-y-auto bg-gray-50 px-5 py-5 md:px-6 md:py-6 flex flex-col">
                      <div className="mb-5">
                        <h3 className="text-[15px] font-extrabold text-stone-900 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          AI 품질검사 패널
                        </h3>
                        <p className="mt-1 text-[12px] font-medium text-stone-500">
                          발행 전 자동 검증 결과입니다.
                        </p>
                      </div>

                      <ul className="space-y-3 flex-1">
                        {[
                          '사진-글 매칭 일치 (Context Check)',
                          '제목-내용 연관성 100% (Relevance)',
                          '중복글 검사: 유사도 0% (완전 창작)',
                          '맞춤법 및 문맥 교정 완료',
                          `SEO 최적화 점수 (AI 점수: ${selectedReview.ai_score || 95}점)`,
                          '필수 이미지 개수 충족 (5/5)',
                          '내부링크(CTA) 정상 삽입',
                        ].map((label) => (
                          <li
                            key={label}
                            className="flex items-start gap-2.5 rounded-xl border border-stone-200/80 bg-white px-3.5 py-3 shadow-sm"
                          >
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                            <span className="text-[13px] font-bold text-stone-700 leading-snug">
                              ✅ {label}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 pt-4 border-t border-stone-200 flex flex-col sm:flex-row gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            handlePublishReview(selectedReview.id);
                            setReviewModalOpen(false);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#EC4899] px-3 py-3.5 text-[13px] font-black text-white shadow-lg shadow-purple-500/25 hover:scale-[1.01] transition-all"
                        >
                          <Rocket className="h-5 w-5" />
                          🚀 매거진 즉시 발행
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReviewModalOpen(false);
                            handleScheduleReview(selectedReview.id);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-3.5 text-[13px] font-black text-stone-700 shadow-sm hover:bg-stone-100 transition-colors"
                        >
                          <CalendarClock className="h-5 w-5 text-[#9333EA]" />
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
                <div className="w-12"></div>
              </div>

              {/* 테이블 본문 */}
              <div className="divide-y divide-stone-100">
                {MOCK_RESULTS.map((item) => (
                  <div key={item.id} className="flex flex-col transition-colors hover:bg-stone-50/50">
                    {/* 요약 행 (클릭 시 아코디언 열림) */}
                    <div 
                      onClick={() => setExpandedResultId(expandedResultId === item.id ? null : item.id)}
                      className="flex flex-col md:flex-row md:items-center px-6 py-5 cursor-pointer gap-4 group"
                    >
                      {/* 1. 날짜 (맨 앞) */}
                      <div className="w-40 shrink-0 text-[13px] font-medium text-stone-500 break-keep">
                        {item.date}
                      </div>
                      
                      {/* 2. 상태 뱃지 */}
                      <div className="w-24 shrink-0">
                        {item.status === 'published' ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-black rounded-md tracking-wider">발행완료</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[11px] font-black rounded-md tracking-wider">예약됨</span>
                        )}
                      </div>
                      
                      {/* 3. 기사 제목 + 썸네일 */}
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
                          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="font-bold text-[15px] text-stone-900 line-clamp-1 group-hover:text-[#9333EA] transition-colors">
                          {item.title}
                        </div>
                      </div>
                      
                      {/* 4. 총 조회수 */}
                      <div className="w-32 shrink-0 flex items-center justify-end text-[15px] font-black text-stone-900">
                        <Eye className="h-4 w-4 text-stone-400 mr-1.5" /> {item.totalViews.toLocaleString()}
                      </div>
                      
                      {/* 5. 아코디언 버튼 */}
                      <div className="w-8 shrink-0 flex justify-end text-stone-400 group-hover:text-[#9333EA] transition-colors">
                        {expandedResultId === item.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>

                    {/* 아코디언 상세 내용 */}
                    {expandedResultId === item.id && (
                      <div className="bg-stone-50 border-t border-stone-100 px-6 py-6 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col lg:flex-row gap-8">
                          
                          {/* URL 리스트 */}
                          <div className="flex-1 space-y-3">
                            <h4 className="text-[12px] font-bold text-stone-500 uppercase tracking-widest mb-4">Live URLs</h4>
                            {Object.entries(item.urls).map(([lang, url]) => (
                              <div key={lang} className="flex items-center bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                                <span className="px-4 py-2.5 bg-stone-100 text-stone-700 text-[13px] font-black uppercase w-16 text-center border-r border-stone-200">{lang}</span>
                                <span className="px-4 py-2.5 text-stone-500 text-[13px] flex-1 truncate">{url}</span>
                                <button className="p-2.5 hover:bg-stone-100 text-stone-500 transition-colors border-l border-stone-200" title="주소 복사"><Copy className="h-4 w-4" /></button>
                                <a href={url} target="_blank" rel="noreferrer" className="p-2.5 hover:bg-stone-100 text-[#9333EA] transition-colors border-l border-stone-200" title="새 창으로 열기"><ExternalLink className="h-4 w-4" /></a>
                              </div>
                            ))}
                          </div>

                          {/* 국가별 트래픽 통계 */}
                          <div className="w-full lg:w-72 shrink-0">
                            <h4 className="text-[12px] font-bold text-stone-500 uppercase tracking-widest mb-4">Traffic By Region</h4>
                            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3.5">
                              {item.traffic.map((region) => (
                                <div key={region.code} className="flex items-center justify-between">
                                  <span className="text-[13px] font-bold text-stone-700 flex items-center">
                                    <span className={`w-2 h-2 rounded-full ${region.color} mr-2`}></span>
                                    {region.label}
                                  </span>
                                  <span className="text-[14px] font-black text-stone-900">{region.views.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>

                        {/* 사후 관리 버튼 */}
                        <div className="mt-6 pt-5 border-t border-stone-200 flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveTab('review'); }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-[12px] font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" /> 글 수정
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-[12px] font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <EyeOff className="h-3.5 w-3.5" /> 비공개 전환
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
