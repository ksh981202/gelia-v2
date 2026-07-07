import { cn } from '@/lib/utils'
import { getOptimizedNailImageUrl } from '@/shared/lib/nailImageUrl'
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
  ...rest
}: NailImageProps) {
  const optimizedSrc = getOptimizedNailImageUrl(src, { width: thumbWidth })

  if (!optimizedSrc) return null

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={cn(className)}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? undefined : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      {...rest}
    />
  )
}
