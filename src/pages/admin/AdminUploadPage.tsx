import { useId } from 'react'
import { FileSpreadsheet, ImagePlus, Trash2, Upload } from 'lucide-react'
import { useAdminUpload } from '../../features/admin-upload/useAdminUpload'
import { PageContainer } from '../../shared/ui/PageContainer'

function preventDefaults(e: React.DragEvent) {
  e.preventDefault()
  e.stopPropagation()
}

export default function AdminUploadPage() {
  const id = useId()
  const {
    imageFiles,
    csvRows,
    csvError,
    csvParseState,
    matchedRows,
    matchedCount,
    eligibleCount,
    progress,
    phase,
    uploadError,
    addImageFiles,
    removeImageFile,
    clearImageFiles,
    parseCsvFile,
    clearCsv,
    startUpload,
    resetUpload,
  } = useAdminUpload()

  const canStartUpload =
    eligibleCount > 0 && phase !== 'uploading'

  return (
    <PageContainer className="max-w-6xl">
      <div className="flex flex-col gap-8 pb-12">
        <header>
          <h1 className="text-2xl font-semibold text-neutral-900">
            대량 업로드
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            CSV의 <code className="rounded bg-neutral-100 px-1">image_filename</code>
            과 동일한 파일명의 이미지를 올리면 짝이 맞습니다.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div
            className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 text-center transition hover:border-violet-400 hover:bg-violet-50/40"
            onDragEnter={preventDefaults}
            onDragOver={preventDefaults}
            onDragLeave={preventDefaults}
            onDrop={(e) => {
              preventDefaults(e)
              if (e.dataTransfer.files?.length) {
                addImageFiles(e.dataTransfer.files)
              }
            }}
          >
            <ImagePlus className="h-10 w-10 text-neutral-400" aria-hidden />
            <p className="text-sm font-medium text-neutral-800">
              이미지 다중 선택 또는 드래그 앤 드롭
            </p>
            <p className="text-xs text-neutral-500">PNG, JPG, WebP 등</p>
            <input
              id={`${id}-images`}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                if (e.target.files?.length) {
                  addImageFiles(e.target.files)
                }
                e.target.value = ''
              }}
            />
            <div className="flex flex-wrap justify-center gap-2">
              <label
                htmlFor={`${id}-images`}
                className="cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                파일 선택
              </label>
              {imageFiles.length > 0 && (
                <button
                  type="button"
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => {
                    clearImageFiles()
                  }}
                >
                  이미지 비우기
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              선택됨: {imageFiles.length}개
            </p>
          </div>

          <div
            className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 text-center transition hover:border-violet-400 hover:bg-violet-50/40"
            onDragEnter={preventDefaults}
            onDragOver={preventDefaults}
            onDragLeave={preventDefaults}
            onDrop={(e) => {
              preventDefaults(e)
              const f = e.dataTransfer.files?.[0]
              if (f && (f.name.endsWith('.csv') || f.type === 'text/csv')) {
                parseCsvFile(f)
              }
            }}
          >
            <FileSpreadsheet className="h-10 w-10 text-neutral-400" aria-hidden />
            <p className="text-sm font-medium text-neutral-800">
              CSV 업로드
            </p>
            <p className="text-xs text-neutral-500">
              헤더: image_filename, title, category, tags
            </p>
            <input
              id={`${id}-csv`}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) parseCsvFile(f)
                e.target.value = ''
              }}
            />
            <div className="flex flex-wrap justify-center gap-2">
              <label
                htmlFor={`${id}-csv`}
                className="cursor-pointer rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                CSV 선택
              </label>
              {csvRows.length > 0 && (
                <button
                  type="button"
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => {
                    clearCsv()
                  }}
                >
                  CSV 비우기
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              상태:{' '}
              {csvParseState === 'idle' && '대기'}
              {csvParseState === 'parsing' && '파싱 중…'}
              {csvParseState === 'done' && `행 ${csvRows.length}개`}
              {csvParseState === 'error' && '오류'}
            </p>
            {csvError && (
              <p className="max-w-xs text-xs text-red-600">{csvError}</p>
            )}
          </div>
        </div>

        {imageFiles.length > 0 && (
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="mb-2 text-sm font-medium text-neutral-800">
              선택된 이미지
            </p>
            <ul className="flex max-h-32 flex-wrap gap-2 overflow-y-auto text-xs text-neutral-600">
              {imageFiles.map((f) => (
                <li
                  key={f.name}
                  className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1"
                >
                  <span className="max-w-[180px] truncate">{f.name}</span>
                  <button
                    type="button"
                    className="rounded p-0.5 text-neutral-500 hover:bg-neutral-200 hover:text-red-600"
                    aria-label={`${f.name} 제거`}
                    onClick={() => {
                      removeImageFile(f.name)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {matchedRows.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-4 py-3">
              <h2 className="text-sm font-semibold text-neutral-900">
                매칭 결과
              </h2>
              <p className="text-xs text-neutral-600">
                매칭 {matchedCount} / {matchedRows.length}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-neutral-50 text-xs font-medium uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">image_filename</th>
                    <th className="px-4 py-3">제목</th>
                    <th className="px-4 py-3">카테고리</th>
                    <th className="px-4 py-3">태그</th>
                    <th className="px-4 py-3">로컬 파일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {matchedRows.map((row, index) => (
                    <tr
                      key={`${row.csv.image_filename}-${index}`}
                      className={
                        row.matched ? 'bg-white' : 'bg-amber-50/60'
                      }
                    >
                      <td className="px-4 py-3 text-lg" aria-label={row.matched ? '매칭됨' : '미매칭'}>
                        {row.matched ? '✅' : '❌'}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-neutral-800">
                        {row.csv.image_filename}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-neutral-800">
                        {row.csv.title || '—'}
                      </td>
                      <td className="max-w-[120px] truncate px-4 py-3 text-neutral-600">
                        {row.csv.category || '—'}
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-neutral-600">
                        {row.csv.tags || '—'}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-xs text-neutral-500">
                        {row.imageFile?.name ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                R2 업로드 및 Supabase 저장
              </p>
              <p className="text-xs text-neutral-500">
                매칭 완료 {eligibleCount}건 ·{' '}
                {phase === 'idle' && '대기'}
                {phase === 'uploading' && '업로드 중…'}
                {phase === 'complete' && '완료'}
                {phase === 'error' && '오류'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!canStartUpload}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  void startUpload()
                }}
              >
                <Upload className="h-4 w-4" aria-hidden />
                업로드 시작
              </button>
              {phase !== 'idle' && (
                <button
                  type="button"
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => {
                    resetUpload()
                  }}
                >
                  진행 초기화
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-violet-500 transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs tabular-nums text-neutral-500">
            {progress}%
          </p>
          {uploadError && (
            <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {uploadError}
            </p>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
