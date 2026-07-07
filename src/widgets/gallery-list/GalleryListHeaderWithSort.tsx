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
        'relative flex w-full min-w-0 items-center justify-between px-4 pb-2 pt-2 md:items-end md:pb-3',
        rowClassName,
      )}
    >
      {/* PC 전용: 창이 커지면 무조건 나타남 */}
      <div className="hidden w-full min-w-0 flex-1 md:flex">
        <GalleryListTypographyHeader
          {...headerProps}
          embedded
          className={cn('mb-0', className)}
        />
      </div>

      {/* 모바일 전용 카운터: 창이 커지면 무조건 사라짐 */}
      {headerProps.totalCount ? (
        <div className="flex min-w-0 flex-1 items-center text-[13px] text-stone-500 md:hidden">
          총{' '}
          <span className="mx-1 font-bold text-stone-700">
            {headerProps.totalCount.toLocaleString()}
          </span>
          개의 디자인
        </div>
      ) : (
        <div className="min-w-0 flex-1 md:hidden" />
      )}

      <div className="shrink-0">{sortControl}</div>
    </div>
  )
}
