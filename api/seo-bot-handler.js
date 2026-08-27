import {
  DEFAULT_OG,
  MAGAZINE_POST_TYPES,
  SITE_ORIGIN,
  UUID_PATTERN,
  buildSeoDescription,
  escapeHtml,
  getOriginalPathname,
  getPageUrl,
  isCrawler,
  magazineHtmlLang,
  magazineOgLocale,
  stripHtmlToPlainText,
  supabaseRequest,
  toAbsoluteSeoUrl,
} from './seo-bot-shared.js'

const HREFLANG_ALTERNATES = [
  { hreflang: 'ko', pathPrefix: '' },
  { hreflang: 'en', pathPrefix: '/en' },
  { hreflang: 'ja', pathPrefix: '/jp' },
  { hreflang: 'vi', pathPrefix: '/vn' },
  { hreflang: 'th', pathPrefix: '/th' },
  { hreflang: 'x-default', pathPrefix: '' },
]

function normalizeMagazineLang(raw) {
  const v = String(raw || 'ko').toLowerCase()
  if (v === 'en' || v === 'jp' || v === 'vn' || v === 'th') return v
  return 'ko'
}

function pickMagazineFields(post, lang) {
  if (lang === 'en') {
    return {
      title: (post.title_en || post.title || '').trim(),
      content: (post.content_en || post.content_ko || post.content || '').trim(),
      description: (post.meta_en || post.meta_ko || '').trim(),
    }
  }
  if (lang === 'jp') {
    return {
      title: (post.title_jp || post.title || '').trim(),
      content: (post.content_jp || post.content_ko || post.content || '').trim(),
      description: (post.meta_jp || post.meta_ko || '').trim(),
    }
  }
  if (lang === 'vn') {
    return {
      title: (post.title_vn || post.title || '').trim(),
      content: (post.content_vn || post.content_ko || post.content || '').trim(),
      description: (post.meta_vn || post.meta_ko || '').trim(),
    }
  }
  if (lang === 'th') {
    return {
      title: (post.title_th || post.title || '').trim(),
      content: (post.content_th || post.content_ko || post.content || '').trim(),
      description: (post.meta_th || post.meta_ko || '').trim(),
    }
  }
  return {
    title: (post.title || '').trim(),
    content: (post.content_ko || post.content || '').trim(),
    description: (post.meta_ko || '').trim(),
  }
}

function extractFirstImageUrl(html) {
  if (!html) return null
  const match = String(html).match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1]?.trim() || null
}

function magazineCanonicalPath(lang, slug) {
  if (lang === 'ko') return `/magazine/${slug}`
  return `/${lang}/magazine/${slug}`
}

function buildSeoHtmlDocument({
  htmlLang = 'ko',
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogLocale = 'ko_KR',
  ogImage,
  robots,
  hreflangLinks = [],
  bodyHtml,
}) {
  const image = ogImage || DEFAULT_OG.image
  const desc = description || DEFAULT_OG.description
  const hreflangBlock = hreflangLinks
    .map(
      (link) =>
        `<link rel="alternate" hreflang="${escapeHtml(link.hreflang)}" href="${escapeHtml(link.href)}" />`,
    )
    .join('\n    ')

  const robotsTag = robots ? `<meta name="robots" content="${escapeHtml(robots)}" />` : ''

  return `<!doctype html>
<html lang="${escapeHtml(htmlLang)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(desc)}" />
    ${robotsTag}
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    ${hreflangBlock ? `${hreflangBlock}\n    ` : ''}
    <meta property="og:type" content="${escapeHtml(ogType)}" />
    <meta property="og:site_name" content="${escapeHtml(DEFAULT_OG.siteName)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(desc)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:locale" content="${escapeHtml(ogLocale)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(desc)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
  </head>
  <body>
    ${bodyHtml}
  </body>
</html>`
}

async function fetchMagazinePost(slug) {
  const key = String(slug || '').trim()
  if (!key) return null

  const typeIn = MAGAZINE_POST_TYPES.map((t) => `"${t}"`).join(',')
  let rows = await supabaseRequest(
    `/board_posts?slug=eq.${encodeURIComponent(key)}&post_type=in.(${typeIn})&select=*&limit=1`,
  )
  let post = Array.isArray(rows) ? rows[0] : null

  if (!post && UUID_PATTERN.test(key)) {
    rows = await supabaseRequest(
      `/board_posts?id=eq.${encodeURIComponent(key)}&post_type=in.(${typeIn})&select=*&limit=1`,
    )
    post = Array.isArray(rows) ? rows[0] : null
  }

  return post
}

const NAIL_DETAIL_SELECT = [
  'id',
  'title',
  'title_en',
  'description',
  'description_en',
  'image_url',
  'procedure_guide',
  'guide_en',
  'design_elements',
  'design_point_en',
].join(',')

function safeTrimText(value) {
  if (typeof value === 'string') return value.replace(/\r\n/g, '\n').trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim()
  return ''
}

function paragraphsFromText(raw) {
  const plain = stripHtmlToPlainText(raw)
  if (!plain) return ''
  return plain
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('\n      ')
}

function designPointsListHtml(raw) {
  const plain = stripHtmlToPlainText(raw)
  if (!plain) return ''
  const items = plain
    .split(/[,|·•;/\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
  if (items.length <= 1) return `<p>${escapeHtml(plain)}</p>`
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
}

function markerToStepIndex(markerRaw) {
  const m = String(markerRaw ?? '').trim().toLowerCase()
  if (m === '베이스' || m === 'base') return 0
  if (m === '아트' || m === 'art') return 1
  if (m === '마무리' || m === 'finishing' || m === 'finish' || m === 'final') return 2
  return null
}

function splitProcedureSteps(raw, language) {
  const s = safeTrimText(raw)
  if (!s) return []
  const markerPattern = /\[\s*(베이스|base|아트|art|마무리|finishing|finish|final)\s*\]/gi
  const matches = Array.from(s.matchAll(markerPattern))
  const stepTitles = language === 'en' ? ['Base', 'Art', 'Finish'] : ['베이스', '아트', '마무리']
  const stepContents = ['', '', '']

  if (matches.length > 0) {
    const firstStart = matches[0]?.index ?? 0
    const preface = s.slice(0, firstStart).trim()
    if (preface) stepContents[0] = preface

    for (let i = 0; i < matches.length; i += 1) {
      const current = matches[i]
      const next = matches[i + 1]
      const stepIdx = markerToStepIndex(current[1] ?? '')
      if (stepIdx == null) continue
      const sectionStart = (current.index ?? 0) + current[0].length
      const sectionEnd = next?.index ?? s.length
      const content = s.slice(sectionStart, sectionEnd).trim()
      if (!content) continue
      stepContents[stepIdx] = stepContents[stepIdx]
        ? `${stepContents[stepIdx]}\n${content}`.trim()
        : content
    }
  } else {
    const fallbackByLine = s.split(/\n+/).map((x) => String(x ?? '').trim()).filter(Boolean)
    stepContents[0] = fallbackByLine[0] ?? s
    stepContents[1] = fallbackByLine[1] ?? ''
    stepContents[2] = fallbackByLine.slice(2).join('\n').trim()
  }

  return [
    { title: stepTitles[0], content: stepContents[0] ?? '' },
    { title: stepTitles[1], content: stepContents[1] ?? '' },
    { title: stepTitles[2], content: stepContents[2] ?? '' },
  ].filter((step) => step.content)
}

function procedureGuideHtml(raw, language) {
  const steps = splitProcedureSteps(raw, language)
  if (steps.length === 0) return paragraphsFromText(raw)
  return steps
    .map(
      (step) => `<section>
        <h3>${escapeHtml(step.title)}</h3>
        ${paragraphsFromText(step.content)}
      </section>`,
    )
    .join('\n      ')
}

function preferEnglishFromHeaders(headers = {}) {
  const accept = String(headers['accept-language'] || headers['Accept-Language'] || '').toLowerCase()
  if (!accept) return false
  const first = accept.split(',')[0]?.trim() || ''
  return first.startsWith('en') && !first.startsWith('ko')
}

export function buildNailArticleHtml(nail, options = {}) {
  const preferEn = Boolean(options.preferEnglish)
  const title = String(nail.title || nail.title_en || '네일 디자인').trim()
  const ogImage = toAbsoluteSeoUrl(nail.image_url)
  const imgTag = ogImage
    ? `<img src="${escapeHtml(ogImage)}" alt="${escapeHtml(title)}" width="600" height="750" />`
    : ''

  const descKo = stripHtmlToPlainText(nail.description)
  const descEn = stripHtmlToPlainText(nail.description_en)
  const guideKo = safeTrimText(nail.procedure_guide)
  const guideEn = safeTrimText(nail.guide_en)
  const pointsKo = safeTrimText(nail.design_elements || nail.design_point)
  const pointsEn = safeTrimText(nail.design_point_en)

  const ordered = (koHtml, enHtml) => (preferEn ? [enHtml, koHtml] : [koHtml, enHtml]).filter(Boolean)

  const descriptionBlocks = ordered(
    descKo ? `<div lang="ko">${paragraphsFromText(descKo)}</div>` : '',
    descEn ? `<div lang="en">${paragraphsFromText(descEn)}</div>` : '',
  ).join('\n      ')

  const guideBlocks = ordered(
    guideKo ? `<div lang="ko">${procedureGuideHtml(guideKo, 'ko')}</div>` : '',
    guideEn ? `<div lang="en">${procedureGuideHtml(guideEn, 'en')}</div>` : '',
  ).join('\n      ')

  const guideSection = guideBlocks
    ? `<section>
      <h2>시술 가이드 (Styling Guide)</h2>
      ${guideBlocks}
    </section>`
    : ''

  const pointsBlocks = ordered(
    pointsKo ? `<div lang="ko">${designPointsListHtml(pointsKo)}</div>` : '',
    pointsEn ? `<div lang="en">${designPointsListHtml(pointsEn)}</div>` : '',
  ).join('\n      ')

  const pointsSection = pointsBlocks
    ? `<section>
      <h2>디자인 포인트 (Design Points)</h2>
      ${pointsBlocks}
    </section>`
    : ''

  return `<main>
    <article>
      <h1>${escapeHtml(title)}</h1>
      ${imgTag}
      ${descriptionBlocks}
      ${guideSection}
      ${pointsSection}
    </article>
  </main>`
}

async function fetchNailDetail(nailId) {
  const id = String(nailId || '').trim()
  if (!UUID_PATTERN.test(id)) return null

  const rows = await supabaseRequest(
    `/nail_designs?id=eq.${encodeURIComponent(id)}&select=${NAIL_DETAIL_SELECT}&limit=1`,
  )
  return Array.isArray(rows) ? rows[0] : null
}

async function fetchHomePreviewNails() {
  const rows = await supabaseRequest(
    `/nail_designs?select=id,title,title_en,image_url&order=created_at.desc,id.desc&limit=8`,
  )
  return Array.isArray(rows) ? rows : []
}

/** E-E-A-T: 봇용 사이트 내비게이션 footer */
function buildBotFooterNav() {
  const links = [
    { href: `${SITE_ORIGIN}/`, label: 'Home' },
    { href: `${SITE_ORIGIN}/gallery`, label: 'Gallery' },
    { href: `${SITE_ORIGIN}/trend`, label: 'Trend' },
    { href: `${SITE_ORIGIN}/magazine`, label: 'Magazine' },
    { href: `${SITE_ORIGIN}/about`, label: 'About Us' },
    { href: `${SITE_ORIGIN}/terms`, label: 'Terms' },
    { href: `${SITE_ORIGIN}/privacy`, label: 'Privacy' },
  ]
  const items = links
    .map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
    .join(' · ')
  return `<footer><nav aria-label="Site navigation">${items}</nav></footer>`
}

function sanitizeMagazineHtml(html) {
  return String(html ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
}

/** 사이트맵 허브 경로 — 300~500자 SEO copy + 하위 링크 */
const HUB_PAGES = {
  '/gallery': {
    title: '네일 갤러리 탐색 | GELIA',
    heading: 'GELIA Nail Gallery',
    description:
      '젤리아 갤러리에서 2,500장 이상의 프리미엄 네일 디자인을 탐색하세요. 컬러·무드·쉐입·시즌별 필터와 트렌드 정렬로 원하는 스타일을 빠르게 찾을 수 있습니다.',
    body: `GELIA Gallery는 AI 크리에이티브와 전문 큐레이션으로 제작된 네일 디자인 아카이브입니다. 
      데일리·오피스·데이트·시즌 테마 등 상황별 큐레이션과 인기순·최신순 정렬을 지원합니다. 
      각 디자인 카드에서 상세 페이지로 이동하면 시술 가이드, 디자인 포인트, 유사 스타일 추천까지 확인할 수 있습니다. 
      네일숍 방문 전 레퍼런스 수집, SNS 영감 보드, PRO 상담용 룩북 제작에 활용해 보세요.`,
    subLinks: [
      { href: '/trend', label: 'Trend Reports' },
      { href: '/color-curation', label: 'Color Curation' },
      { href: '/style-curation', label: 'Style Curation' },
      { href: '/season-curation', label: 'Season Curation' },
    ],
  },
  '/trend': {
    title: '네일 트렌드 & 랭킹 | GELIA',
    heading: 'GELIA Trend & Ranking',
    description:
      '실시간·주간·월간 네일 트렌드와 반응 랭킹을 확인하세요. GELIA가 분석한 인기 무드, 아트, 텍스처, 파츠 베스트를 한곳에서.',
    body: `GELIA Trend 허브는 유저 반응 데이터와 큐레이션 신호를 결합한 네일 트렌드 대시보드입니다. 
      기간별 베스트, 검색 급상승 키워드, 무드·쉐입·파츠 카테고리별 인기 디자인을 제공합니다. 
      매주 업데이트되는 랭킹과 시즌 리포트로 다음 네일 아이디어를 선제적으로 확보하세요. 
      트렌드 리스트에서 상세 디자인으로 바로 이동해 시술 가이드와 메타데이터를 참고할 수 있습니다.`,
    subLinks: [
      { href: '/gallery', label: 'Full Gallery' },
      { href: '/reaction-best-list', label: 'Reaction Best' },
      { href: '/search-trend-list', label: 'Search Trends' },
      { href: '/popular-mood-list', label: 'Popular Mood' },
    ],
  },
  '/magazine': {
    title: 'GELIA Magazine — 뷰티 에디토리얼',
    heading: 'GELIA Magazine',
    description:
      '네일 트렌드, 쉐입 가이드, 시즌 컬러 리포트 등 하이엔드 뷰티 매거진. GELIA 에디토리얼 팀의 전문 콘텐츠.',
    body: `GELIA Magazine은 네일과 뷰티를 다루는 디지털 에디토리얼 플랫폼입니다. 
      쉐입 비교, 컬러 psychology, PRO를 위한 상담 가이드, 시즌 lookbook 등 깊이 있는 아티클을 발행합니다. 
      한국어를 기본으로 English 및 Asia-Pacific 로케일을 지원하며, hreflang SEO로 글로벌 검색에 최적화되어 있습니다. 
      매거진 아티클은 갤러리 디자인과 연결되어 실제 레퍼런스로 바로 활용할 수 있습니다.`,
    subLinks: [
      { href: '/en/magazine', label: 'English Magazine' },
      { href: '/about', label: 'About GELIA' },
      { href: '/gallery', label: 'Nail Gallery' },
    ],
  },
  '/en/magazine': {
    title: 'GELIA Magazine (English) — Beauty Editorial',
    heading: 'GELIA Magazine — English',
    description:
      'English-language nail trend editorials, shape guides, and seasonal reports from GELIA Magazine.',
    body: `GELIA Magazine in English delivers high-end beauty editorials for a global audience. 
      Explore shape comparisons, color stories, PRO consultation guides, and seasonal lookbooks. 
      Each article connects to the GELIA nail gallery for instant reference. 
      We combine AI creative assets with human curation for trustworthy, contextual content.`,
    subLinks: [
      { href: '/magazine', label: 'Korean Magazine' },
      { href: '/about', label: 'About GELIA' },
      { href: '/gallery', label: 'Gallery' },
    ],
  },
  '/about': {
    title: 'About GELIA — Premium Nail Curation',
    heading: 'About GELIA Studio',
    description:
      'GELIA is a premium nail curation platform and beauty magazine. Our mission, AI creative pipeline, and global editorial vision.',
    body: `GELIA (젤리아) helps you find nail designs that truly fit your mood, hand shape, and occasion. 
      We curate thousands of premium nail visuals with rich metadata — color, mood, technique, and procedure guides. 
      Our AI creative pipeline expands style variation while human curation ensures search quality and trust. 
      GELIA Magazine publishes editorial content in multiple languages. All images are reference designs; consult a licensed professional before treatment. 
      Explore Gallery, Trend, and Magazine to discover your next nail inspiration.`,
    subLinks: [
      { href: '/gallery', label: 'Gallery' },
      { href: '/magazine', label: 'Magazine' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
    ],
  },
  '/terms': {
    title: 'Terms of Service | GELIA',
    heading: 'Terms of Service',
    description: 'GELIA 서비스 이용약관. 서비스 이용 조건, 콘텐츠 저작권, 면책 사항을 확인하세요.',
    body: `GELIA Terms of Service define the conditions for using our nail curation platform and magazine. 
      Users may browse, save references, and share links for personal inspiration. 
      All nail design images are AI-generated references and not guaranteed to replicate exactly in salon treatment. 
      Commercial reuse of assets requires separate permission. 
      By accessing GELIA you agree to these terms and our Privacy Policy.`,
    subLinks: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/about', label: 'About GELIA' },
      { href: '/support', label: 'Support' },
    ],
  },
  '/privacy': {
    title: 'Privacy Policy | GELIA',
    heading: 'Privacy Policy',
    description: 'GELIA 개인정보 처리방침. 수집 항목, 이용 목적, 보관 기간, 이용자 권리를 안내합니다.',
    body: `GELIA Privacy Policy explains how we collect and process personal information when you use our service. 
      We may collect account email, usage analytics, and saved preferences to improve curation quality. 
      Data is stored securely via Supabase infrastructure with industry-standard encryption. 
      You may request access, correction, or deletion of your data by contacting GELIA Studio. 
      We do not sell personal information to third parties.`,
    subLinks: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/about', label: 'About GELIA' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
}

const HUB_FALLBACK_BODY =
  'GELIA is a premium nail curation platform and beauty magazine. Browse curated galleries, trend rankings, and editorial articles to find your perfect nail style.'

function normalizeHubPath(pathname) {
  const path = String(pathname || '/').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/'
  return path.toLowerCase()
}

function resolveHubConfig(pathname) {
  const path = normalizeHubPath(pathname)
  if (HUB_PAGES[path]) return { path, ...HUB_PAGES[path] }

  const segment = path.replace(/^\//, '').replace(/-/g, ' ')
  const titleName = segment ? segment.replace(/\b\w/g, (c) => c.toUpperCase()) : 'GELIA'
  return {
    path,
    title: `${titleName} | GELIA`,
    heading: titleName,
    description: `Explore ${titleName} on GELIA — premium nail curation and beauty magazine.`,
    body: `${HUB_FALLBACK_BODY} This section (${path}) offers curated nail designs and editorial content related to ${titleName}.`,
    subLinks: [
      { href: '/gallery', label: 'Gallery' },
      { href: '/trend', label: 'Trend' },
      { href: '/magazine', label: 'Magazine' },
      { href: '/about', label: 'About' },
    ],
  }
}

function renderHubPage(pathname, pageUrl) {
  const hub = resolveHubConfig(pathname)
  const subLinkItems = (hub.subLinks || [])
    .map(
      (link) =>
        `<li><a href="${escapeHtml(SITE_ORIGIN)}${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`,
    )
    .join('\n        ')

  const bodyHtml = `<main>
    <header>
      <h1>${escapeHtml(hub.heading)}</h1>
      <p>${escapeHtml(hub.description)}</p>
    </header>
    <section>
      ${paragraphsFromText(hub.body)}
    </section>
    <section aria-label="Related sections">
      <h2>Explore GELIA</h2>
      <ul>
        ${subLinkItems}
      </ul>
    </section>
    ${buildBotFooterNav()}
  </main>`

  return buildSeoHtmlDocument({
    htmlLang: 'ko',
    title: hub.title,
    description: buildSeoDescription(hub.body, 150) || hub.description,
    canonicalUrl: pageUrl,
    ogImage: DEFAULT_OG.image,
    ogLocale: 'ko_KR',
    bodyHtml,
  })
}

function parseRoute(pathname) {
  if (pathname === '/' || pathname === '') {
    return { kind: 'home' }
  }

  const detailMatch = pathname.match(/^\/detail\/([^/?#]+)/i)
  if (detailMatch) {
    return { kind: 'detail', id: decodeURIComponent(detailMatch[1]) }
  }

  const globalMagMatch = pathname.match(/^\/(en|jp|vn|th)\/magazine\/([^/?#]+)/i)
  if (globalMagMatch) {
    return {
      kind: 'magazine',
      lang: normalizeMagazineLang(globalMagMatch[1]),
      slug: decodeURIComponent(globalMagMatch[2]),
    }
  }

  const magMatch = pathname.match(/^\/magazine\/([^/?#]+)/i)
  if (magMatch) {
    return { kind: 'magazine', lang: 'ko', slug: decodeURIComponent(magMatch[1]) }
  }

  const hubPath = normalizeHubPath(pathname)
  if (hubPath !== '/' && !hubPath.startsWith('/detail/') && !hubPath.startsWith('/admin') && !hubPath.startsWith('/pro') && !hubPath.startsWith('/my') && !hubPath.startsWith('/login')) {
    return { kind: 'hub', pathname: hubPath }
  }

  return { kind: 'unknown' }
}

async function renderHome(pageUrl) {
  const nails = await fetchHomePreviewNails()
  const listItems = nails
    .map((nail) => {
      const title = String(nail.title || nail.title_en || 'GELIA Nail Design').trim()
      const img = toAbsoluteSeoUrl(nail.image_url)
      const detailUrl = `${SITE_ORIGIN}/detail/${nail.id}`
      const imgTag = img
        ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" width="400" height="533" loading="lazy" />`
        : ''
      return `<li><a href="${escapeHtml(detailUrl)}"><article><h3>${escapeHtml(title)}</h3>${imgTag}</article></a></li>`
    })
    .join('\n        ')

  const bodyHtml = `<main>
    <header>
      <h1>${escapeHtml(DEFAULT_OG.title)}</h1>
      <p>${escapeHtml(DEFAULT_OG.description)}</p>
    </header>
    <section aria-label="Recommended nail designs">
      <h2>추천 네일 디자인</h2>
      <ul>
        ${listItems || '<li><p>젤리아 프리미엄 네일 큐레이션</p></li>'}
      </ul>
    </section>
    <nav><a href="${escapeHtml(SITE_ORIGIN)}/magazine">GELIA Magazine</a></nav>
    ${buildBotFooterNav()}
  </main>`

  return buildSeoHtmlDocument({
    htmlLang: 'ko',
    title: DEFAULT_OG.title,
    description: DEFAULT_OG.description,
    canonicalUrl: pageUrl,
    ogImage: DEFAULT_OG.image,
    ogLocale: 'ko_KR',
    bodyHtml,
  })
}

async function renderNailDetail(id, pageUrl, headers = {}) {
  const nail = await fetchNailDetail(id)
  if (!nail) {
    return buildSeoHtmlDocument({
      htmlLang: 'ko',
      title: '페이지를 찾을 수 없습니다 | GELIA',
      description: DEFAULT_OG.description,
      canonicalUrl: pageUrl,
      robots: 'noindex',
      bodyHtml: '<main><h1>네일 디자인을 찾을 수 없습니다</h1></main>',
    })
  }

  const title = String(nail.title || nail.title_en || '네일 디자인').trim()
  const pageTitle = `${title} | GELIA`
  const rawDesc = String(nail.description || nail.description_en || '').trim()
  const description =
    buildSeoDescription(rawDesc, 150) || `${title} 네일 디자인 | 젤리아에서 찾아보세요`
  const ogImage = toAbsoluteSeoUrl(nail.image_url) || DEFAULT_OG.image
  const preferEnglish = preferEnglishFromHeaders(headers)
  const bodyHtml = `${buildNailArticleHtml(nail, { preferEnglish })}
    ${buildBotFooterNav()}`
  const canonicalUrl = preferEnglish
    ? `${pageUrl}${pageUrl.includes('?') ? '&' : '?'}lang=en`
    : pageUrl

  return buildSeoHtmlDocument({
    htmlLang: preferEnglish ? 'en' : 'ko',
    title: pageTitle,
    description,
    canonicalUrl,
    ogImage,
    ogLocale: preferEnglish ? 'en_US' : 'ko_KR',
    bodyHtml,
  })
}

async function renderMagazine(lang, slug, pageUrl) {
  const post = await fetchMagazinePost(slug)
  const htmlLang = magazineHtmlLang(lang)
  const ogLocale = magazineOgLocale(lang)

  if (!post) {
    return buildSeoHtmlDocument({
      htmlLang,
      title: '페이지를 찾을 수 없습니다 | GELIA',
      description: DEFAULT_OG.description,
      canonicalUrl: pageUrl,
      ogLocale,
      robots: 'noindex',
      bodyHtml: '<main><h1>매거진을 찾을 수 없습니다</h1></main>',
    })
  }

  const seoSlug = String(post.slug || slug).trim()
  const localized = pickMagazineFields(post, lang)
  const title = localized.title || 'GELIA Magazine'
  const pageTitle = `${title} | GELIA Magazine`
  const description =
    buildSeoDescription(localized.description || localized.content, 150) ||
    `${title} — GELIA Magazine`
  const canonicalPath = magazineCanonicalPath(lang, seoSlug)
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`
  const thumb = toAbsoluteSeoUrl(post.thumbnail_url)
  const contentImg = toAbsoluteSeoUrl(extractFirstImageUrl(localized.content))
  const ogImage = thumb || contentImg || DEFAULT_OG.image

  const hreflangLinks = HREFLANG_ALTERNATES.map(({ hreflang, pathPrefix }) => ({
    hreflang,
    href: `${SITE_ORIGIN}${pathPrefix}/magazine/${encodeURIComponent(seoSlug)}`,
  }))

  const heroImg = ogImage
    ? `<img src="${escapeHtml(ogImage)}" alt="${escapeHtml(title)}" width="800" height="450" />`
    : ''

  const sanitizedContent = sanitizeMagazineHtml(localized.content)
  const contentBlock = sanitizedContent
    ? `<div class="article-body">${sanitizedContent}</div>`
    : `<p>${escapeHtml(buildSeoDescription(localized.content, 400))}</p>`

  const bodyHtml = `<main>
    <article>
      <h1>${escapeHtml(title)}</h1>
      ${heroImg}
      ${contentBlock}
    </article>
    ${buildBotFooterNav()}
  </main>`

  return buildSeoHtmlDocument({
    htmlLang,
    title: pageTitle,
    description,
    canonicalUrl,
    ogType: 'article',
    ogLocale,
    ogImage,
    hreflangLinks,
    bodyHtml,
  })
}

function sendHtml(res, html) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  res.end(html)
}

export default async function handler(req, res) {
  const userAgent = req.headers['user-agent'] || ''
  if (!isCrawler(userAgent)) {
    res.statusCode = 403
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Forbidden')
    return
  }

  const pathname = getOriginalPathname(req)
  const pageUrl = getPageUrl(req)
  const route = parseRoute(pathname)

  try {
    if (route.kind === 'home') {
      sendHtml(res, await renderHome(pageUrl))
      return
    }
    if (route.kind === 'detail') {
      sendHtml(res, await renderNailDetail(route.id, pageUrl, req.headers || {}))
      return
    }
    if (route.kind === 'magazine') {
      sendHtml(res, await renderMagazine(route.lang, route.slug, pageUrl))
      return
    }
    if (route.kind === 'hub') {
      sendHtml(res, renderHubPage(route.pathname, pageUrl))
      return
    }

    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Not Found')
  } catch {
    sendHtml(
      res,
      buildSeoHtmlDocument({
        title: DEFAULT_OG.title,
        description: DEFAULT_OG.description,
        canonicalUrl: pageUrl,
        bodyHtml: `<main><h1>${escapeHtml(DEFAULT_OG.title)}</h1><p>${escapeHtml(DEFAULT_OG.description)}</p></main>`,
      }),
    )
  }
}
