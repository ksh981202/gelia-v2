import { r2PublicBaseUrl } from '@/shared/api/r2Public'

const DEFAULT_THUMB_WIDTH = 400

/** Cloudflare /cdn-cgi/image 리사이즈 — 명시적 opt-in 필요 */
const ENABLE_CF_IMAGE_RESIZE = import.meta.env.VITE_ENABLE_CF_IMAGE_RESIZE === 'true'
/** Supabase storage render API — 명시적 opt-in 필요 */
const ENABLE_SUPABASE_IMAGE_RENDER = import.meta.env.VITE_ENABLE_SUPABASE_IMAGE_RENDER === 'true'

function isUnsafeForCloudflareResize(url: URL): boolean {
  if (url.hostname.endsWith('.r2.dev')) return true
  if (url.pathname.startsWith('/cdn-cgi/image/')) return true
  return false
}

function trySupabaseRenderUrl(url: URL, width: number): string | null {
  if (!ENABLE_SUPABASE_IMAGE_RENDER) return null

  const marker = '/storage/v1/object/public/'
  const path = url.pathname
  const markerIndex = path.indexOf(marker)
  if (markerIndex === -1) return null

  const objectPath = path.slice(markerIndex + marker.length)
  const renderPath = path.slice(0, markerIndex) + '/storage/v1/render/image/public/' + objectPath
  const renderUrl = new URL(renderPath, url.origin)
  renderUrl.searchParams.set('width', String(width))
  renderUrl.searchParams.set('quality', '80')
  return renderUrl.toString()
}

function tryCloudflareImageResize(url: URL, width: number): string | null {
  if (!ENABLE_CF_IMAGE_RESIZE) return null
  if (isUnsafeForCloudflareResize(url)) return null

  const base = r2PublicBaseUrl.trim().replace(/\/$/, '')
  if (!base) return null

  let baseUrl: URL
  try {
    baseUrl = new URL(base)
  } catch {
    return null
  }

  if (url.origin !== baseUrl.origin) return null

  const objectPath = url.pathname.replace(/^\//, '')
  return `${url.origin}/cdn-cgi/image/width=${width},quality=80,format=auto/${objectPath}${url.search}`
}

export type OptimizedNailImageOptions = {
  width?: number
}

/** 썸네일용 URL 최적화 — 미지원 호스트·미설정 환경변수는 원본 URL 유지 */
export function getOptimizedNailImageUrl(
  src: string | null | undefined,
  options?: OptimizedNailImageOptions,
): string {
  const trimmed = String(src ?? '').trim()
  if (!trimmed) return ''

  const width = options?.width ?? DEFAULT_THUMB_WIDTH

  try {
    const url = new URL(trimmed)
    return (
      trySupabaseRenderUrl(url, width) ??
      tryCloudflareImageResize(url, width) ??
      trimmed
    )
  } catch {
    return trimmed
  }
}
