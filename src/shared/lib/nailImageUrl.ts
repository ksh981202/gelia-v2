import { r2PublicBaseUrl } from '@/shared/api/r2Public'

const DEFAULT_THUMB_WIDTH = 400

function trySupabaseRenderUrl(url: URL, width: number): string | null {
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
  const base = r2PublicBaseUrl.trim().replace(/\/$/, '')
  if (!base) return null

  let baseUrl: URL
  try {
    baseUrl = new URL(base)
  } catch {
    return null
  }

  if (url.origin !== baseUrl.origin) return null
  if (url.pathname.startsWith('/cdn-cgi/image/')) return null

  const objectPath = url.pathname.replace(/^\//, '')
  return `${url.origin}/cdn-cgi/image/width=${width},quality=80,format=auto/${objectPath}${url.search}`
}

export type OptimizedNailImageOptions = {
  width?: number
}

/** 썸네일용 URL 최적화 — 미지원 호스트는 원본 URL 유지 */
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
