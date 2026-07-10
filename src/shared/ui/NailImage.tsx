import { cn } from '@/lib/utils'
import { getOptimizedNailImageUrl } from '@/shared/lib/nailImageUrl'
import { useEffect, useMemo, useState } from 'react'
import type { ImgHTMLAttributes } from 'react'

export type NailImageProps = {
  src: string | null | undefined
  alt: string
  className?: string
  /** LCP 후보(상위 1~4장): eager + fetchPriority high */
  priority?: boolean
  /** 썸네일 리사이즈 폭(px). 미지원 CDN은 원본 유지 */
  thumbWidth?: number
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'loading' | 'decoding' | 'fetchPriority'>

export function NailImage({
  src,
  alt,
  className,
  priority = false,
  thumbWidth,
  onError,
  ...rest
}: NailImageProps) {
  const originalSrc = useMemo(() => String(src ?? '').trim(), [src])
  const optimizedSrc = useMemo(
    () => (originalSrc ? getOptimizedNailImageUrl(originalSrc, { width: thumbWidth }) : ''),
    [originalSrc, thumbWidth],
  )

  const [resolvedSrc, setResolvedSrc] = useState(optimizedSrc)

  useEffect(() => {
    setResolvedSrc(optimizedSrc)
  }, [optimizedSrc])

  if (!originalSrc) return null

  const displaySrc = resolvedSrc || originalSrc

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={cn(className)}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? undefined : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      onError={(event) => {
        if (originalSrc && displaySrc !== originalSrc) {
          setResolvedSrc(originalSrc)
        }
        onError?.(event)
      }}
      {...rest}
    />
  )
}
