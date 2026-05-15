import { ChevronLeft, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const SEASON_TABS = ['🌸 봄', '🌊 여름', '🍁 가을', '❄️ 겨울'] as const

const SEASON_KEYS = ['봄', '여름', '가을', '겨울'] as const

const SEASON_HERO_CAPTIONS = [
  '귀여운 소라 트위드',
  '시원한 오션 블루',
  '가을 무드 체크',
  '윈터 실버 글리터',
] as const

const VACATION_ITEMS = [
  { id: 1, label: '선셋 코랄 네일' },
  { id: 2, label: '바다 블루 그라데이션' },
  { id: 3, label: '트로피컬 파인 네일' },
  { id: 4, label: '리조트 골드 글리터' },
] as const

const POPULAR_ITEMS = [
  { id: 1, label: '봄벚꽃 핑크 네일' },
  { id: 2, label: '민트 그린 프렌치' },
  { id: 3, label: '코랄 오렌지 포인트' },
  { id: 4, label: '라벤더 파스텔 네일' },
] as const

const H_SCROLLBAR_HIDE =
  "scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"

const img = (w: number, h: number) => `https://placehold.co/${w}x${h}/e8e8e8/666666?text=+`

export default function ClientSeasonCurationPage() {
  const navigate = useNavigate()
  const [activeIdx, setActiveIdx] = useState(0)

  const viewAllLabel = '전체보기 >'
  const currentSeason = SEASON_KEYS[activeIdx] ?? SEASON_KEYS[0]
  const heroCaption =
    SEASON_HERO_CAPTIONS[activeIdx] ?? SEASON_HERO_CAPTIONS[0]

  return (
    <div className="relative mx-auto max-w-md bg-white pb-24">
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between bg-white/95 px-5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="-ml-2 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </button>

        <h1 className="pointer-events-none absolute left-1/2 max-w-[min(100%-5rem,18rem)] -translate-x-1/2 truncate text-center text-lg font-bold tracking-tight text-gray-900">
          계절별 맞춤 네일
        </h1>

        <Link
          to="/client/gallery"
          className="-mr-2 rounded-full p-2 text-gray-900 transition-colors hover:bg-gray-100"
          aria-label="검색"
        >
          <Search className="h-6 w-6 text-gray-900" strokeWidth={2} />
        </Link>
      </header>

      <main className="px-0">
        <section className="mb-0 mt-6 px-4" aria-label="시즌별 모아보기">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              시즌별 모아보기
            </h2>
            <Link to="/client/season-list" className="text-sm text-gray-500">
              {viewAllLabel}
            </Link>
          </div>

          <nav
            className="mb-4 flex w-full items-center justify-between border-b border-gray-100 px-6"
            aria-label="시즌"
          >
            {SEASON_TABS.map((t, idx) => {
              const isActive = idx === activeIdx
              return (
                <button
                  key={t}
                  type="button"
                  data-active-tab={isActive ? 'true' : 'false'}
                  onClick={() => setActiveIdx(idx)}
                  className="group relative flex flex-col items-center justify-center pb-2"
                >
                  <span
                    className={`text-[14px] ${
                      isActive
                        ? 'font-bold text-gray-900'
                        : 'font-medium text-gray-500'
                    }`}
                  >
                    {t}
                  </span>
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-[2px] ${
                      isActive ? 'bg-black' : 'bg-transparent'
                    }`}
                  />
                </button>
              )
            })}
          </nav>

          <div className="relative mt-5 aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-100 sm:aspect-[4/5]">
            <img
              src={img(600, 800)}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="truncate text-lg font-bold text-white drop-shadow-md md:text-xl">
                {heroCaption}
              </p>
            </div>
          </div>
        </section>

        <section
          className="mb-0 mt-12 px-4"
          aria-label="휴양지에서 인생샷 보장! 바캉스 네일"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              휴양지에서 인생샷 보장! 바캉스 네일 ✈️
            </h2>
            <Link to="/client/vacation-list" className="text-sm text-gray-500">
              {viewAllLabel}
            </Link>
          </div>

          <div
            className={`flex gap-3 overflow-x-auto pb-2 ${H_SCROLLBAR_HIDE}`}
          >
            {VACATION_ITEMS.map((item) => (
              <div
                key={item.id}
                className="flex w-[120px] flex-shrink-0 flex-col gap-2"
              >
                <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={img(300, 400)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="truncate text-center text-[13px] text-gray-800">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="mb-0 mt-12 px-4"
          aria-label="내 손끝에 찰떡, 계절 인기 네일 모음"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              내 손끝에 찰떡, 계절 인기 네일 모음
            </h2>
            <Link
              to={`/client/season-popular-list?season=${encodeURIComponent(currentSeason)}`}
              className="text-sm text-gray-500"
            >
              {viewAllLabel}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {POPULAR_ITEMS.map((item) => (
              <div key={item.id} className="flex flex-col gap-2">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={img(400, 500)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="truncate text-center text-sm text-gray-800">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
