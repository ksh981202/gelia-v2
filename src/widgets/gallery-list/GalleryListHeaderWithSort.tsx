import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  GalleryListTypographyHeader,
  type GalleryListTypographyHeaderProps,
} from './GalleryListTypographyHeader'

type GalleryListHeaderWithSortProps = GalleryListTypographyHeaderProps & {
  sortControl: ReactNode
  rowClassName?: string
}

export function GalleryListHeaderWithSort({
  sortControl,
  rowClassName,
  className,
  ...headerProps
}: GalleryListHeaderWithSortProps) {
  return (
    <div
      className={cn(
        'relative flex w-full min-w-0 flex-col gap-3 px-4 pb-3 pt-2 sm:flex-row sm:items-end sm:justify-between',
        rowClassName,
      )}
    >
      <GalleryListTypographyHeader {...headerProps} className={cn('mb-0 md:mb-0', className)} />
      <div className="shrink-0 self-end sm:self-auto">{sortControl}</div>
    </div>
  )
}
