/** lazy 라우트 청크 로드 중 — ClientLayout 크롬(헤더/탭)은 유지, 본문만 홈과 동일 pulse 스켈레톤 */
export function ClientRouteSuspenseFallback() {
  return (
    <div className="flex w-full flex-col bg-[#fdfaf7] pb-4 md:bg-white md:pb-0">
      <section className="mt-2 px-5 md:hidden" aria-busy="true" aria-label="Loading">
        <div className="relative w-full flex-none snap-center">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5 shadow-sm bg-gray-200 animate-pulse" />
        </div>
      </section>
      <div className="hidden min-w-0 px-4 pb-8 pt-4 md:block" aria-busy="true" aria-label="Loading">
        <div className="mb-6 h-10 w-2/3 max-w-md animate-pulse rounded bg-gray-200" />
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={`route-chunk-skel-${i}`}
              className="w-full animate-pulse rounded-2xl bg-gray-200"
              style={{ height: `${11 + (i % 4) * 2.5}rem` }}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  )
}
