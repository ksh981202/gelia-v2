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
  const bodyHtml = buildNailArticleHtml(nail, { preferEnglish })
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

  const excerpt = buildSeoDescription(localized.content, 400)
  const heroImg = ogImage
    ? `<img src="${escapeHtml(ogImage)}" alt="${escapeHtml(title)}" width="800" height="450" />`
    : ''

  const bodyHtml = `<main>
    <article>
      <h1>${escapeHtml(title)}</h1>
      ${heroImg}
      ${excerpt ? `<p>${escapeHtml(excerpt)}</p>` : ''}
    </article>
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
