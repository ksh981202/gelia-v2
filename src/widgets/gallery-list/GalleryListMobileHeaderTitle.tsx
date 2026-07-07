type GalleryListMobileHeaderTitleProps = {
  children: string
}

export function GalleryListMobileHeaderTitle({ children }: GalleryListMobileHeaderTitleProps) {
  return (
    <h1 className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 truncate px-12 text-center text-[16px] font-bold tracking-tight text-stone-800 md:hidden">
      {children}
    </h1>
  )
}
