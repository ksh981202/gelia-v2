import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useClientHomeFeed } from '../../features/client-home/useClientHomeFeed'
import type { NailDesignRow } from '../../shared/types/database.types'

const NAIL_THUMB_IMG_CLASS = 'h-full w-full object-cover object-center'

/** Vite `public/` — 항상 루트 기준 경로; `base` 배포 시 `import.meta.env.BASE_URL` 반영 */
function publicAssetUrl(rootRelative: string): string {
  const path = rootRelative.replace(/^\//, '')
  const base = import.meta.env.BASE_URL || '/'
  if (base === '/') return `/${path}`
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base
  return `${prefix}/${path}`
}

const NAIL_THUMB_IMAGE_FRAME =
  'aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5'

const RECOMMEND_HERO_BANNER_BASE =
  'aspect-[3/4] w-full overflow-hidden rounded-[20px] border border-black/5'

const NAIL_THUMB_TITLE_CORE =
  'w-full min-w-0 text-center font-sans text-[13px] font-medium tracking-tight text-gray-800 sm:text-[14px] truncate'

const NAIL_THUMB_TITLE_ON_CARD = NAIL_THUMB_TITLE_CORE

const NAIL_THUMB_TITLE_TREND =
  'w-full min-w-0 text-center font-sans text-[13px] font-medium leading-snug tracking-tight text-balance line-clamp-2 text-gray-800 sm:text-[14px]'

const NAIL_THUMB_TITLE_TOP_GAP = 'mt-2'

const NAIL_HERO_BANNER_TITLE_CLASS =
  'text-white font-sans font-bold text-[18px] sm:text-[20px] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'

type CategoryChip = {
  label: string
  nameEn: string
  to: string
  imageUrl: string
}

/** V1 `Index.tsx`와 동일 파일명 — 정적 에셋은 `public/images/maincategory/` */
const CATEGORY_CHIPS: CategoryChip[] = [
  {
    label: '컬러',
    nameEn: 'Color',
    to: '/client/gallery',
    imageUrl: '/images/maincategory/ic-category-color.png',
  },
  {
    label: '스타일',
    nameEn: 'Style',
    to: '/client/theme',
    imageUrl: '/images/maincategory/ic-category-style.png',
  },
  {
    label: '텍스처',
    nameEn: 'Texture',
    to: '/client/gallery',
    imageUrl: '/images/maincategory/ic-category-texture.png',
  },
  {
    label: '아트&패턴',
    nameEn: 'Art & Pattern',
    to: '/client/gallery',
    imageUrl: '/images/maincategory/ic-category-art-pattern.png',
  },
  {
    label: '계절',
    nameEn: 'Season',
    to: '/client/theme',
    imageUrl: '/images/maincategory/ic-category-season.png',
  },
  {
    label: '맞춤 네일',
    nameEn: 'Custom Nail',
    to: '/client/quiz',
    imageUrl: '/images/maincategory/ic-category-custom.png',
  },
]

function pickNailTitle(nail: NailDesignRow): string {
  const ko = nail?.title?.trim() || ''
  const en = nail?.title_en?.trim() || ''
  return ko || en || 'Modern Chic'
}

export default function ClientHomePage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isFooterOpen, setIsFooterOpen] = useState(false)
  const { data, isPending, isError } = useClientHomeFeed()

  const recommendNails = data?.recommend ?? []
  const trendNails = data?.trend ?? []
  const popularNails = data?.popular ?? []

  const showRecommendSkeleton = isPending && recommendNails.length === 0
  const showTrendSkeleton = isPending && trendNails.length === 0
  const showPopularSkeleton = isPending && popularNails.length === 0

  const viewAllLabel = '전체보기'

  return (
    <div className="w-full bg-background pb-4">
      <section className="mt-2 px-5" aria-busy={showRecommendSkeleton}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-gray-900">
            추천 네일
          </h2>
          <Link
            to="/client/recommend"
            className="cursor-pointer text-sm font-medium text-gray-500"
          >
            {viewAllLabel} {'>'}
          </Link>
        </div>
        {showRecommendSkeleton ? (
          <div
            className={`relative ${RECOMMEND_HERO_BANNER_BASE} animate-pulse bg-gray-200`}
            aria-hidden
          />
        ) : recommendNails.length > 0 ? (
          <div
            ref={scrollRef}
            className="scrollbar-hide -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pl-4 pr-4"
          >
            {recommendNails.map((nail, index) => {
              const title = pickNailTitle(nail)
              const image = nail?.image_url?.trim() || ''
              const hasPrev = index > 0
              const hasNext = index < recommendNails.length - 1
              return (
                <div
                  key={nail.id}
                  className="relative w-full flex-none snap-center"
                >
                  <Link
                    to={`/client/detail/${nail.id}`}
                    className={`relative block ${RECOMMEND_HERO_BANNER_BASE} cursor-pointer shadow-md`}
                    aria-label="추천 네일 상세 페이지로 이동"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        className={`${NAIL_THUMB_IMG_CLASS} h-full w-full`}
                        width={800}
                        height={1000}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    ) : (
                      <div
                        className="h-full w-full animate-pulse bg-gray-100"
                        aria-hidden
                      />
                    )}
                    {hasPrev && (
                      <button
                        type="button"
                        aria-label="이전 추천 네일로 이동"
                        className="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const el = scrollRef.current
                          if (!el) return
                          el.scrollBy({
                            left: -el.clientWidth,
                            behavior: 'smooth',
                          })
                        }}
                      >
                        <ChevronLeft size={18} strokeWidth={2} />
                      </button>
                    )}
                    {hasNext && (
                      <button
                        type="button"
                        aria-label="다음 추천 네일로 이동"
                        className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const el = scrollRef.current
                          if (!el) return
                          el.scrollBy({
                            left: el.clientWidth,
                            behavior: 'smooth',
                          })
                        }}
                      >
                        <ChevronRight size={18} strokeWidth={2} />
                      </button>
                    )}
                    <div className="absolute inset-x-0 bottom-0 z-10 p-4 pb-4 pt-0">
                      <div className="flex w-full min-w-0 flex-col items-start text-left">
                        <span className="mb-1.5 inline-block shrink-0 rounded-full bg-primary/90 px-3 py-1 font-sans text-[12px] font-semibold text-primary-foreground drop-shadow-md [text-shadow:_0_1px_3px_rgb(0_0_0_/_0.65)]">
                          PICK
                        </span>
                        <h3
                          className={`${NAIL_HERO_BANNER_TITLE_CLASS} min-w-0 w-full max-w-full shrink-0 truncate text-left leading-snug drop-shadow-lg [text-shadow:_0_1px_3px_rgb(0_0_0_/_0.65)]`}
                        >
                          {title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-secondary/60 px-4 py-10 text-center text-sm text-muted-foreground">
            {isError
              ? '목록을 불러오지 못했습니다.'
              : '업로드된 사진이 아직 없어요. 관리자 페이지에서 먼저 업로드해 주세요.'}
          </div>
        )}
      </section>

      <div className="my-8 w-full px-4">
        <Link
          to="/client/quiz"
          className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-orange-100/50 bg-gradient-to-br from-rose-50 via-orange-50 to-pink-100 p-6 shadow-sm"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-white/60 blur-2xl" />
          <div className="relative z-10 flex flex-col items-start">
            <h3 className="text-[1.15rem] font-bold leading-snug tracking-tight text-gray-900">
              내 손에 찰떡인 네일 찾기
            </h3>
            <p className="mt-1.5 text-xs font-medium text-gray-500">
              간단한 테스트로 인생 네일 찾기
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white shadow-md transition-transform group-hover:-translate-y-0.5">
              테스트 시작하기{' '}
              <span className="font-normal text-gray-400">→</span>
            </span>
          </div>
          <div className="relative z-10 mr-2">
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-white bg-white/90 shadow-lg backdrop-blur-md transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
              <span className="text-4xl drop-shadow-sm">💅</span>
            </div>
            <div className="absolute -right-3 -top-2 z-20 flex h-9 w-9 animate-bounce items-center justify-center rounded-full border border-white bg-white/95 shadow-md backdrop-blur-md delay-150">
              <span className="text-lg">✨</span>
            </div>
          </div>
        </Link>
      </div>

      <section className="mb-12 mt-8" aria-busy={showTrendSkeleton}>
        <div className="mb-5 flex items-center justify-between px-4">
          <h2 className="text-[20px] font-bold tracking-tight text-gray-900">
            트렌드 네일
          </h2>
          <Link
            to="/client/ranking"
            className="cursor-pointer text-sm font-medium text-gray-500"
          >
            {viewAllLabel} {'>'}
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 pb-2 sm:gap-3">
          {showTrendSkeleton ? (
            <>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`${NAIL_THUMB_IMAGE_FRAME} animate-pulse bg-gray-200 shadow-sm`}
                  aria-hidden
                />
              ))}
            </>
          ) : trendNails.length > 0 ? (
            trendNails.map((nail, index) => (
              <Link
                key={nail.id}
                to={`/client/detail/${nail.id}`}
                className="flex min-w-0 w-full flex-col items-center active:scale-95"
                aria-label={`${pickNailTitle(nail)} 상세로 이동`}
              >
                <div className={`${NAIL_THUMB_IMAGE_FRAME} shadow-sm`}>
                  <img
                    src={nail.image_url}
                    alt=""
                    className={NAIL_THUMB_IMG_CLASS}
                    width={400}
                    height={533}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </div>
                <div
                  className={`${NAIL_THUMB_TITLE_TOP_GAP} flex w-full flex-col items-center justify-center`}
                >
                  <span className={NAIL_THUMB_TITLE_TREND}>{pickNailTitle(nail)}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="w-full rounded-2xl bg-secondary/60 px-4 py-8 text-center text-sm text-muted-foreground">
              표시할 트렌드 네일이 없어요. 다른 네일이 더 등록되면 이곳에 보여 드릴게요.
            </div>
          )}
        </div>
      </section>

      <section className="px-5" aria-busy={showPopularSkeleton}>
        <Link
          to="/client/ranking"
          className="mb-5 flex cursor-pointer items-center justify-between"
          aria-label="인기 네일 전체보기"
        >
          <h2 className="text-[20px] font-bold tracking-tight text-gray-900">
            인기 네일 디자인
          </h2>
          <span className="cursor-pointer text-sm font-medium text-gray-500">
            {viewAllLabel} {'>'}
          </span>
        </Link>
        <div className="grid grid-cols-2 gap-3">
          {showPopularSkeleton ? (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`${NAIL_THUMB_IMAGE_FRAME} animate-pulse bg-gray-200`}
                  aria-hidden
                />
              ))}
            </>
          ) : popularNails.length > 0 ? (
            popularNails.map((nail, index) => (
              <Link
                key={nail.id}
                to={`/client/detail/${nail.id}`}
                className="flex w-full cursor-pointer flex-col items-center active:scale-[0.96]"
                aria-label="인기 네일 상세로 이동"
              >
                <div className={`${NAIL_THUMB_IMAGE_FRAME} shadow-sm`}>
                  <img
                    src={nail.image_url}
                    alt=""
                    className={NAIL_THUMB_IMG_CLASS}
                    width={400}
                    height={533}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </div>
                <div
                  className={`${NAIL_THUMB_TITLE_TOP_GAP} flex w-full flex-col items-center justify-center`}
                >
                  <span className={NAIL_THUMB_TITLE_ON_CARD}>{pickNailTitle(nail)}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-2 rounded-2xl bg-secondary/60 px-4 py-8 text-center text-sm text-muted-foreground">
              아직 보여 드릴 네일이 없어요. 네일이 등록되면 이곳에 나타날 거예요.
            </div>
          )}
        </div>
      </section>

      <section className="mb-10 mt-8 px-5">
        <div className="mb-5 flex w-full items-center justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-gray-900">
            카테고리 탐색
          </h2>
          <Link
            to="/client/gallery"
            className="cursor-pointer text-sm font-medium text-gray-500"
          >
            {viewAllLabel} {'>'}
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORY_CHIPS.map((cat) => (
            <Link
              key={cat.label}
              to={cat.to}
              className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-5 shadow-sm transition-colors hover:bg-secondary/40 active:scale-[0.93]"
            >
              <div className="mb-3 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-white shadow-sm">
                <img
                  src={publicAssetUrl(cat.imageUrl)}
                  alt={cat.label}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="mt-3 font-sans text-[14px] font-semibold tracking-tight text-gray-800">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-8 w-full break-keep border-t border-gray-200 bg-gray-50 px-5 pb-24 pt-10 text-left font-sans tracking-tight">
        <div className="mb-8 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-center text-[13px] font-medium leading-[1.6] text-gray-700">
            젤리아의 모든 이미지는 AI로 만든 디자인이에요 😉
            <br />
            나만의 네일 스타일 찾는 데 참고해보세요!
          </p>
        </div>

        <div className="mb-6">
          <button
            type="button"
            onClick={() => setIsFooterOpen((prev) => !prev)}
            className="flex items-center gap-1 text-[14px] font-bold text-gray-800"
            aria-expanded={isFooterOpen}
          >
            젤리아 스튜디오 (GELIA Studio)
            {isFooterOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {isFooterOpen && (
            <div className="mt-1.5 space-y-1.5 overflow-hidden transition-all duration-300">
              <p className="text-[13px] font-medium text-gray-500">
                나만의 네일 스타일을 찾는 새로운 기준, 젤리아
              </p>
              <p className="pt-1 text-[13px] font-medium text-gray-500">
                문의 :{' '}
                <a href="mailto:k981202@naver.com" className="hover:underline">
                  k981202@naver.com
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center justify-start space-x-3 text-[13px] text-gray-500">
          <span className="font-semibold text-gray-500">이용약관</span>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-gray-800">개인정보처리방침</span>
        </div>

        <p className="text-[11px] font-medium text-gray-400">
          &copy; 2026 GELIA Studio. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
