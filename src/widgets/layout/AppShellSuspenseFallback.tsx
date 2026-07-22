import { ClientRouteSuspenseFallback } from '@/widgets/layout/ClientRouteSuspenseFallback'

/** RouterProvider 바깥 Suspense fallback용 — react-router Link 금지 */
const FallbackWordmark = () => (
  <a
    href="/"
    className="block w-fit shrink-0 whitespace-nowrap text-[28px] font-bold tracking-wide text-gray-900 transition-opacity hover:opacity-80 sm:text-[30px]"
    style={{ fontFamily: "'Playfair Display', serif" }}
    aria-label="GELIA 홈"
  >
    GELIA
  </a>
)

/** 최상위 Suspense — 전역 흰 화면 대신 로고·셸 + 본문 스켈레톤 */
export function AppShellSuspenseFallback() {
  return (
    <div className="min-h-[100dvh] bg-background font-sans antialiased text-stone-900">
      <div className="relative mx-auto min-h-[100dvh] w-full max-w-md md:max-w-[1600px] md:flex md:flex-row md:items-start">
        <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-[260px] md:shrink-0 md:flex-col md:border-r md:border-stone-200 md:bg-[#FCFAF8] md:p-6">
          <FallbackWordmark />
        </aside>
        <div className="flex min-w-0 w-full flex-1 flex-col">
          <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-background/80 px-5 backdrop-blur-xl md:hidden">
            <FallbackWordmark />
          </header>
          <main className="flex min-h-0 flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            <ClientRouteSuspenseFallback />
          </main>
        </div>
      </div>
    </div>
  )
}
