import { cn } from '@/lib/utils'

export type GalleryListTypographyHeaderProps = {
  breadcrumb: string
  mainTitle: string
  totalCount?: number | null
  isEnglish?: boolean
  className?: string
}

export function GalleryListTypographyHeader({
  breadcrumb,
  mainTitle,
  totalCount,
  isEnglish = false,
  className,
}: GalleryListTypographyHeaderProps) {
  const count = totalCount ?? 0
  const badgeText = isEnglish
    ? `${count.toLocaleString()} designs`
    : `${count.toLocaleString()}개의 디자인`

  return (
    <div className={cn('mb-8 flex flex-col gap-1.5 md:mb-10 md:gap-2', className)}>
      <span className="text-[13px] font-medium tracking-wide text-stone-500">{breadcrumb}</span>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-800 md:text-[28px]">
          {mainTitle}
        </h1>
        {count > 0 ? (
          <span className="rounded-full border border-stone-200/60 bg-stone-100/80 px-3 py-1 text-[12px] font-bold text-stone-600 shadow-sm">
            {badgeText}
          </span>
        ) : null}
      </div>
    </div>
  )
}
