const DEFAULT_OG = {
  title: '젤리아 (GELIA) - 내 손에 찰떡인 네일 찾기',
  description: '젤리아에서 나만의 인생 네일을 찾아보세요. 트렌디한 네일 큐레이션 서비스',
  image: 'https://gelia.app/ogimage/og-image.webp',
  siteName: '젤리아 (GELIA)',
}

const BOT_UA_PATTERN =
  /bot|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegram|kakaotalk-scrap|applebot|googlebot|bingbot|yandex|baiduspider|embedly|pinterest|preview|ia_archiver|curl|wget|python-requests|headless/i

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getSupabaseConfig() {
  const url = (process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
  if (!url || !anonKey) return null
  return { url, anonKey }
}

function getRequestUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'gelia.app'
  const originalPath =
    req.headers['x-vercel-original-path'] ||
    req.headers['x-invoke-path'] ||
    req.headers['x-matched-path'] ||
  ''

  if (originalPath && !originalPath.startsWith('/api/')) {
    return `${proto}://${host}${originalPath}`
  }

  const url = new URL(req.url || '/', `https://${host}`)
  const route = url.searchParams.get('route')
  const id = url.searchParams.get('id')
  if (route && id) {
    return `${proto}://${host}/${route}/${id}`
  }

  return `${proto}://${host}${url.pathname}${url.search}`
}

function parseRouteFromRequest(req) {
  const query = req.query ?? {}
  const routeFromQuery = query.route ? String(query.route) : ''
  const idFromQuery = query.id ? String(query.id) : ''
  if (routeFromQuery && idFromQuery) {
    return { route: routeFromQuery.toLowerCase(), id: idFromQuery }
  }

  const url = new URL(req.url || '/', 'https://gelia.app')
  const route = url.searchParams.get('route')
  const id = url.searchParams.get('id')
  if (route && id) {
    return { route: route.toLowerCase(), id }
  }

  const pathname =
    req.headers['x-vercel-original-path'] ||
    req.headers['x-invoke-path'] ||
    url.pathname

  const match = String(pathname).match(/^\/(collection|proposal|lookbook)\/([^/?#]+)/i)
  if (!match) return { route: null, id: null }
  return { route: match[1].toLowerCase(), id: decodeURIComponent(match[2]) }
}

function isOgFallbackRequest(req) {
  const query = req.query ?? {}
  if (query.og_fallback === 'true') return true
  const url = new URL(req.url || '/', 'https://gelia.app')
  return url.searchParams.get('og_fallback') === 'true'
}

function appendQueryParam(url, key, value) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`
}

function getDeploymentOrigin(req) {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'gelia.app'
  return `${proto}://${host}`
}

function buildSpaBootstrapRedirectHtml(fallbackUrl) {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(fallbackUrl)}" />
    <script>window.location.replace(${JSON.stringify(fallbackUrl)})</script>
  </head>
  <body></body>
</html>`
}

async function supabaseRequest(path, options = {}) {
  const config = getSupabaseConfig()
  if (!config) return null

  const headers = {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`,
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(`${config.url}/rest/v1${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    return null
  }

  if (response.status === 204) return null
  return response.json()
}

async function supabaseRpc(functionName, body) {
  const config = getSupabaseConfig()
  if (!config) return null

  const response = await fetch(`${config.url}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) return null
  return response.json()
}

async function fetchNailPreview(nailId) {
  const trimmedId = String(nailId || '').trim()
  if (!UUID_PATTERN.test(trimmedId)) return null

  const rows = await supabaseRequest(
    `/nail_designs?id=eq.${trimmedId}&select=title,title_en,image_url&limit=1`,
  )
  const nail = Array.isArray(rows) ? rows[0] : null
  if (!nail) return null

  return {
    title: String(nail.title || nail.title_en || '').trim() || null,
    image: String(nail.image_url || '').trim() || DEFAULT_OG.image,
  }
}

async function fetchCollectionOg(id) {
  if (!UUID_PATTERN.test(id)) return null

  const folders = await supabaseRequest(
    `/client_folders?id=eq.${id}&select=name,is_public&limit=1`,
  )
  const folder = Array.isArray(folders) ? folders[0] : null
  if (!folder || folder.is_public !== true) return null

  const folderName = String(folder.name || '').trim() || '젤리아 컬렉션'
  const items = await supabaseRequest(
    `/client_folder_items?folder_id=eq.${id}&select=nail_id&order=created_at.desc&limit=1`,
  )
  const firstNailId = Array.isArray(items) ? items[0]?.nail_id : null
  const nailPreview = firstNailId ? await fetchNailPreview(firstNailId) : null

  return {
    title: `${folderName} | 젤리아 컬렉션`,
    description: `젤리아에서 '${folderName}' 컬렉션을 확인해 보세요.`,
    image: nailPreview?.image || DEFAULT_OG.image,
  }
}

async function fetchProposalOg(id) {
  if (!UUID_PATTERN.test(id)) return null

  const rows = await supabaseRpc('get_public_proposal_share', { p_proposal_id: id })
  const proposal = Array.isArray(rows) ? rows[0] : rows
  if (!proposal || proposal.is_active === false) return null

  const customerName = String(proposal.customer_name || '').trim() || '고객님'
  const nailIds = Array.isArray(proposal.nail_ids) ? proposal.nail_ids : []
  const firstNailId = nailIds.find((nailId) => String(nailId || '').trim())
  const nailPreview = firstNailId ? await fetchNailPreview(firstNailId) : null
  const greeting = String(proposal.greeting_message || '').trim()

  return {
    title: `${customerName}님을 위한 네일 제안 | 젤리아`,
    description: greeting || '젤리아에서 나만의 인생 네일을 찾아보세요.',
    image: nailPreview?.image || DEFAULT_OG.image,
  }
}

async function fetchLookbookOg(id) {
  if (!UUID_PATTERN.test(id)) return null

  const rows = await supabaseRpc('get_public_lookbook', { p_id: id })
  const lookbook = Array.isArray(rows) ? rows[0] : rows
  if (!lookbook?.id) return null

  const lookbookTitle = String(lookbook.title || '').trim() || '룩북 컬렉션'
  const nailIds = Array.isArray(lookbook.nail_ids) ? lookbook.nail_ids : []
  const firstNailId = nailIds.find((nailId) => String(nailId || '').trim())
  const nailPreview = firstNailId ? await fetchNailPreview(firstNailId) : null

  return {
    title: `${lookbookTitle} | GELIA Lookbook`,
    description: `젤리아 PRO 룩북 '${lookbookTitle}'을 확인해 보세요.`,
    image: nailPreview?.image || DEFAULT_OG.image,
  }
}

async function resolveOgMeta(route, id) {
  try {
    if (route === 'collection') return (await fetchCollectionOg(id)) || DEFAULT_OG
    if (route === 'proposal') return (await fetchProposalOg(id)) || DEFAULT_OG
    if (route === 'lookbook') return (await fetchLookbookOg(id)) || DEFAULT_OG
  } catch {
    return DEFAULT_OG
  }
  return DEFAULT_OG
}

function buildBotHtml({ title, description, image, url }) {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(DEFAULT_OG.siteName)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
  </head>
  <body>
    <p>${escapeHtml(title)}</p>
  </body>
</html>`
}

function isCrawler(userAgent) {
  return BOT_UA_PATTERN.test(String(userAgent || ''))
}

async function fetchIndexHtml(req) {
  const origin = getDeploymentOrigin(req)
  const response = await fetch(`${origin}/index.html`, {
    headers: { Accept: 'text/html' },
  })
  if (!response.ok) {
    throw new Error(`index.html fetch failed: ${response.status}`)
  }
  return response.text()
}

async function serveSpaIndexHtml(req, res) {
  const indexHtml = await fetchIndexHtml(req)
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'private, no-cache')
  res.end(indexHtml)
}

export default async function handler(req, res) {
  // og_fallback=true: rewrite 우회 후 순수 SPA index.html만 반환 (무한 루프 방지)
  if (isOgFallbackRequest(req)) {
    try {
      await serveSpaIndexHtml(req, res)
    } catch {
      res.statusCode = 502
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end('SPA bootstrap failed')
    }
    return
  }

  const { route, id } = parseRouteFromRequest(req)
  const pageUrl = getRequestUrl(req)

  if (!route || !id) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Not Found')
    return
  }

  const ogMeta = await resolveOgMeta(route, id)
  const meta = { ...DEFAULT_OG, ...ogMeta, url: pageUrl }
  const userAgent = req.headers['user-agent'] || ''

  // 크롤러: OG 메타만 담은 경량 HTML (JS 미실행 환경 대응)
  if (isCrawler(userAgent)) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    res.end(
      buildBotHtml({
        title: meta.title,
        description: meta.description,
        image: meta.image,
        url: pageUrl,
      }),
    )
    return
  }

  // 일반 유저: 빌드된 index.html을 그대로 반환 (OG 치환 없이 SPA 부팅 우선)
  try {
    await serveSpaIndexHtml(req, res)
  } catch {
    const fallbackUrl = appendQueryParam(pageUrl, 'og_fallback', 'true')
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(buildSpaBootstrapRedirectHtml(fallbackUrl))
  }
}
