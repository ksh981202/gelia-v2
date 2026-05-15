import { Bookmark, ChevronLeft, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

function formatTodayBadgeLabel(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `TODAY. ${m}.${day}`
}

const img = (w: number, h: number) => `https://placehold.co/${w}x${h}/e8e8e8/666666?text=+`

const EDITOR_PICKS = [
  {
    id: 1,
    title: '심플 피치 마블',
    comment:
      '중요한 하객으로 참석하는 날, 단정하면서도 고급스러움을 잃지 않는 심플 피치 마블 디자인을 만나보세요.',
  },
  {
    id: 2,
    title: '로맨틱 로즈 글리터',
    comment:
      '은은한 로즈 톤과 글리터 포인트가 어우러져 데이트나 기념일에도 부담 없이 어울리는 조합이에요.',
  },
  {
    id: 3,
    title: '클린 누드 프렌치',
    comment:
      '오피스부터 일상까지 두루 활용하기 좋은 누드 프렌치로, 손끝을 깔끔하고 세련되게 연출해 보세요.',
  },
] as const

/** V1 에디토리얼 — 정적 매거진 UI (탭·무한 스크롤 없음) */
export default function ClientTodaySpecialPage() {
  const navigate = useNavigate()
  const todayLabel = formatTodayBadgeLabel()

  return (
    <div className="relative mx-auto w-full max-w-md bg-white pb-20">
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="-ml-2 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </button>

        <h1 className="pointer-events-none absolute left-1/2 max-w-[min(100%-5rem,16rem)] -translate-x-1/2 truncate text-center text-[17px] font-bold text-gray-900">
          오늘의 특별한 네일
        </h1>

        <Link
          to="/client/gallery"
          className="-mr-2 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
          aria-label="검색"
        >
          <Search className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </Link>
      </header>

      <div className="px-5 pb-6 pt-6">
        <span className="inline-block rounded-sm bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-600">
          {todayLabel}
        </span>
        <h2 className="mt-2 text-2xl font-bold leading-snug text-gray-900">
          오늘 하루, 에디터가 고른
          <br />
          네일 세 가지 ✨
        </h2>
        <p className="mt-2 text-[13px] text-gray-500">
          매일 자정마다 조회·저장이 높은 작품 풀에서 새로운 조합으로 만나요.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {EDITOR_PICKS.map((pick) => (
          <article key={pick.id} className="px-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
              <img
                src={img(600, 800)}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <button
                type="button"
                className="absolute right-4 top-4 rounded-full bg-white/70 p-2 backdrop-blur-sm"
                aria-label="북마크"
              >
                <Bookmark className="h-4 w-4 text-gray-800" strokeWidth={2} />
              </button>
              <span className="absolute bottom-10 left-4 rounded-sm bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                PICK
              </span>
              <h3 className="absolute bottom-4 left-4 text-lg font-bold text-white">
                {pick.title}
              </h3>
            </div>

            <div className="mt-4 rounded-xl border border-orange-50 bg-[#fdfaf8] p-4">
              <h4 className="mb-2 text-sm font-bold text-gray-900">
                💅 추천 포인트
              </h4>
              <p className="text-[13px] leading-relaxed text-gray-600">
                &ldquo;{pick.comment}&rdquo;
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
