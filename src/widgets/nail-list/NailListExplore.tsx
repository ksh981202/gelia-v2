import { useEffect, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  DEFAULT_LIST_SORT,
  DEFAULT_LIST_TAB,
  useListSearchParams,
} from '../../features/list-url-state/useListSearchParams'
import {
  listInfiniteKey,
  useListScrollRestore,
} from '../../features/list-scroll-restore/useListScrollRestore'
import {
  type NailListQueryScope,
  useNailQuery,
} from '../../entities/nail-design/api/useNailQuery'
import { isAllTab } from '../../entities/nail-design/lib/nailListSelectors'
import { PageContainer } from '../../shared/ui/PageContainer'
import { normalizeForFilter } from '../../shared/utils/normalizeForFilter'

export type NailListExploreProps = {
  tabs: readonly string[]
  tabsSectionLabel: string
  queryScope: NailListQueryScope
  /** 랭킹: 첫 줄 버튼이 `sort`(인기순/저장순)만 바꿈 */
  rankingSortTabs?: boolean
  /** 순위 배지(1, 2, 3…) */
  showRankBadge?: boolean
}

export function NailListExplore({
  tabs,
  tabsSectionLabel,
  queryScope,
  rankingSortTabs = false,
  showRankBadge = false,
}: NailListExploreProps) {
  const location = useLocation()
  const { tab, sort, setTab, setSort } = useListSearchParams()

  const scrollKey = useMemo(
    () => listInfiniteKey(location.pathname, location.search),
    [location.pathname, location.search],
  )
  useListScrollRestore(scrollKey)

  const {
    data,
    isPending,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useNailQuery(tab, sort, queryScope)

  const flat = useMemo(
    () => data?.pages.flatMap((p) => p) ?? [],
    [data],
  )

  const showResetFilters =
    !rankingSortTabs && flat.length === 0 && !isPending && !isAllTab(tab)

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting)
        if (hit && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { root: null, rootMargin: '240px 0px', threshold: 0 },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <PageContainer className="mx-auto max-w-full bg-white px-0 py-0 sm:px-0 lg:px-0">
      <div className="w-full bg-white text-slate-900">
        <p className="sr-only">{tabsSectionLabel}</p>
        <div className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
          {tabs.length > 0 && (
            <section
              className="scrollbar-hide flex w-full flex-nowrap gap-2 overflow-x-auto scroll-smooth whitespace-nowrap px-4 pb-2 pt-1 [-webkit-overflow-scrolling:touch]"
              aria-label={tabsSectionLabel}
            >
              {tabs.map((label) => {
                const active = rankingSortTabs
                  ? sort === label
                  : normalizeForFilter(tab) === normalizeForFilter(label) ||
                    tab === label
                return (
                  <button
                    key={label}
                    type="button"
                    data-active-tab={active ? 'true' : 'false'}
                    onClick={() => {
                      if (rankingSortTabs) {
                        setSort(label)
                      } else {
                        setTab(label)
                      }
                    }}
                    className={
                      active
                        ? 'shrink-0 whitespace-nowrap rounded-full bg-[#FF7E67] px-4 py-1.5 text-sm font-medium text-white'
                        : 'shrink-0 whitespace-nowrap rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600'
                    }
                  >
                    {label}
                  </button>
                )
              })}
              <div className="w-10 shrink-0" aria-hidden="true" />
            </section>
          )}

          {!rankingSortTabs && (
            <div className="relative flex items-center justify-between px-4 pb-3 pt-2">
              <span className="text-sm text-gray-500">
                총{' '}
                <span className="font-bold text-pink-500">{flat.length}</span>{' '}
                개의 디자인
              </span>
              <div className="flex flex-nowrap items-center gap-1">
                {([DEFAULT_LIST_SORT, '최신순'] as const).map((label) => {
                  const active = sort === label
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setSort(label)
                      }}
                      className={
                        active
                          ? 'rounded-md bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-900'
                          : 'rounded-md bg-gray-50 px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors active:bg-gray-100'
                      }
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {isPending && (
          <p className="px-4 pt-4 text-sm text-gray-500">목록 불러오는 중…</p>
        )}
        {isError && (
          <p className="px-4 pt-4 text-sm text-red-600">
            목록을 불러오지 못했습니다.
          </p>
        )}

        {showResetFilters && (
          <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="mb-2">조건에 맞는 디자인이 없습니다.</p>
            <button
              type="button"
              className="rounded-md bg-amber-800 px-3 py-1 text-white hover:bg-amber-900"
              onClick={() => {
                setTab(DEFAULT_LIST_TAB)
              }}
            >
              필터 초기화 (전체 보기)
            </button>
          </div>
        )}

        {!isPending && !isError && flat.length > 0 && (
          <>
            <ul className="grid grid-cols-2 gap-4 px-4 pb-6 pt-4">
              {flat.map((item, index) => (
                <li key={item.id}>
                  <Link
                    to={`/client/detail/${item.id}`}
                    className={`flex cursor-pointer flex-col gap-2 ${
                      showRankBadge ? 'relative' : ''
                    }`}
                  >
                    {showRankBadge && (
                      <div className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-gray-900 text-xs font-semibold text-white shadow-sm">
                        {index + 1}
                      </div>
                    )}
                    <div className="aspect-[3/4] w-full min-h-0">
                      <img
                        src={item.image_url}
                        alt=""
                        width={400}
                        height={400}
                        loading={index < 6 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="h-full w-full min-h-0 rounded-xl object-cover object-center"
                      />
                    </div>
                    <div className="mt-2 flex w-full flex-col items-center justify-center px-1">
                      <p className="line-clamp-2 w-full text-center text-sm font-medium tracking-tight text-gray-800">
                        {item.title}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div
              ref={sentinelRef}
              className="flex h-10 items-center justify-center text-xs text-gray-400"
              aria-hidden
            >
              {isFetchingNextPage ? '더 불러오는 중…' : '\u00a0'}
            </div>
          </>
        )}

        {!isPending && !isError && flat.length === 0 && !showResetFilters && (
          <p className="px-4 py-12 text-center text-sm text-gray-500">
            표시할 네일이 없습니다.
          </p>
        )}
      </div>
    </PageContainer>
  )
}
