import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdminDashboard } from '../../features/admin-dashboard/useAdminDashboard'
import { PageContainer } from '../../shared/ui/PageContainer'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function AdminPage() {
  const {
    data: rows,
    isPending,
    isError,
    error,
    refetch,
    handleDelete,
    deleteError,
    deletingId,
    clearDeleteError,
  } = useAdminDashboard()

  return (
    <PageContainer className="max-w-6xl">
      <div className="flex flex-col gap-6 pb-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">대시보드</h1>
            <p className="mt-1 text-sm text-neutral-600">
              등록된 네일 디자인을 확인하고 삭제할 수 있습니다. 삭제 시{' '}
              <strong>R2 객체를 먼저 제거</strong>한 뒤 DB 행을 삭제합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin/upload"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              업로드로 이동
            </Link>
            <button
              type="button"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
              onClick={() => {
                void refetch()
              }}
            >
              새로고침
            </button>
          </div>
        </div>

        {deleteError && (
          <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            <span>{deleteError}</span>
            <button
              type="button"
              className="shrink-0 text-red-700 underline"
              onClick={() => {
                clearDeleteError()
              }}
            >
              닫기
            </button>
          </div>
        )}

        {isPending && (
          <p className="text-sm text-neutral-500">목록을 불러오는 중…</p>
        )}
        {isError && (
          <p className="text-sm text-red-600">
            {(error as Error)?.message ?? '목록을 불러오지 못했습니다.'}
          </p>
        )}

        {!isPending && !isError && rows && rows.length === 0 && (
          <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-600">
            등록된 디자인이 없습니다.
          </p>
        )}

        {!isPending && !isError && rows && rows.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-neutral-100 bg-neutral-50 text-xs font-medium uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">썸네일</th>
                    <th className="px-4 py-3">제목</th>
                    <th className="px-4 py-3">카테고리</th>
                    <th className="px-4 py-3">등록일</th>
                    <th className="w-24 px-4 py-3 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="bg-white hover:bg-neutral-50/80">
                      <td className="px-4 py-2">
                        <img
                          src={row.image_url}
                          alt=""
                          width={64}
                          height={64}
                          loading="lazy"
                          decoding="async"
                          className="h-14 w-14 rounded-md border border-neutral-200 object-cover"
                        />
                      </td>
                      <td className="max-w-[220px] px-4 py-2">
                        <p className="truncate font-medium text-neutral-900">
                          {row.title}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {row.tags.slice(0, 3).join(' · ')}
                          {row.tags.length > 3 ? ' …' : ''}
                        </p>
                      </td>
                      <td className="max-w-[120px] truncate px-4 py-2 text-neutral-700">
                        {row.category}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-neutral-600">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          disabled={deletingId === row.id}
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="삭제"
                          onClick={() => {
                            const ok = window.confirm(
                              `「${row.title}」을(를) 삭제할까요?\nR2 파일과 DB 레코드가 모두 제거됩니다.`,
                            )
                            if (!ok) return
                            void handleDelete(row.id, row.image_r2_key).catch(() => {
                              /* deleteError에 반영됨 */
                            })
                          }}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
