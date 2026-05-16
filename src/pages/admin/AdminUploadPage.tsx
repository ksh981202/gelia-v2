import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  ImageIcon,
  UploadCloud,
  XCircle,
} from 'lucide-react'

const CSV_COLUMN_LABELS = [
  '파일명',
  '썸네일 제목',
  '썸네일 제목(EN)',
  '상세 설명',
  '상세 설명(EN)',
  '컬러',
  '컬러(EN)',
  '손톱길이',
  '손톱 길이(EN)',
  '추천 손타입',
  '추천 손타입(EN)',
  '무드/분위기',
  '무드/분위기(EN)',
  '상황',
  '상황(EN)',
  '디자인/기법',
  '디자인 요소',
]

const DUMMY_ROWS = [
  {
    id: 1,
    matched: true,
    filename: 'GL-000401.jpg',
    title: '시크 핑크 데이트',
    titleEn: 'Chic Pink Date',
    image:
      'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=100&q=80',
  },
  {
    id: 2,
    matched: false,
    filename: 'GL-000402.jpg',
    title: '트렌디 누드 오피스',
    titleEn: 'Trendy Nude Office',
    image: null,
  },
  {
    id: 3,
    matched: false,
    filename: 'GL-000403.jpg',
    title: '힙한 베이지 여행',
    titleEn: 'Hip Beige Travel',
    image: null,
  },
  {
    id: 4,
    matched: false,
    filename: 'GL-000404.jpg',
    title: '키치 파스텔 파티',
    titleEn: 'Kitsch Pastel Party',
    image: null,
  },
]

export default function AdminUploadPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            대량 자동 업로드
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            정적 UI 템플릿입니다. 실제 파일 업로드 및 압축 로직은 제거되었습니다.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-800">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">CSV 파일</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              컬럼 (총 {CSV_COLUMN_LABELS.length}개):{' '}
              {CSV_COLUMN_LABELS.slice(0, 5).join(', ')} ...
            </p>
            <div className="mt-4 flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-slate-400">
              <UploadCloud className="h-8 w-8 text-slate-400" />
              <span className="mt-2 text-sm font-medium text-slate-700">
                CSV 파일을 여기에 놓거나 클릭
              </span>
            </div>
            <div className="mt-3 max-h-24 overflow-auto rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
              선택됨: 네일북 저장 샘플.csv · 10행
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-800">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">다중 이미지</h2>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              드래그 앤 드롭 또는 클릭으로 추가 ·{' '}
              <span className="text-blue-600 underline">전체 비우기</span>
            </p>
            <div className="mt-4 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-8 transition hover:border-slate-400">
              <UploadCloud className="h-8 w-8 text-slate-400" />
              <span className="mt-2 text-sm font-medium text-slate-700">
                이미지를 여기에 놓거나 클릭
              </span>
              <span className="mt-1 text-xs text-slate-500">여러 장 선택 가능</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              등록된 이미지: <span className="font-semibold text-slate-900">0</span>장
            </p>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              미리보기 · 매칭 결과
            </h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> 매칭 1
              </span>
              <span className="flex items-center gap-1 font-medium text-red-600">
                <XCircle className="h-4 w-4" /> 미매칭 3
              </span>
            </div>
          </div>

          <div className="max-h-[520px] overflow-x-auto overflow-y-auto">
            <table className="w-max min-w-max border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="sticky left-0 z-20 min-w-[6.5rem] bg-slate-50/95 px-4 py-3">
                    상태
                  </th>
                  <th className="sticky left-[6.5rem] z-20 min-w-[5.75rem] border-r border-slate-200/80 bg-slate-50/95 px-4 py-3">
                    썸네일
                  </th>
                  <th className="px-4 py-3">파일명</th>
                  <th className="px-4 py-3">썸네일 제목</th>
                  <th className="px-4 py-3">썸네일 제목(EN)</th>
                  <th className="px-4 py-3">상세 설명</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_ROWS.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-50 ${!row.matched ? 'bg-red-50/60' : ''}`}
                  >
                    <td
                      className={`sticky left-0 z-10 min-w-[6.5rem] px-4 py-3 ${row.matched ? 'bg-white' : 'bg-red-50'}`}
                    >
                      {row.matched ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" /> 성공
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          <AlertTriangle className="h-3.5 w-3.5" /> 미매칭
                        </span>
                      )}
                    </td>
                    <td
                      className={`sticky left-[6.5rem] z-10 min-w-[5.75rem] border-r border-slate-100 px-4 py-3 ${row.matched ? 'bg-white' : 'bg-red-50'}`}
                    >
                      {row.image ? (
                        <img
                          src={row.image}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-cover object-center"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-100 text-xs text-slate-400">
                          없음
                        </div>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 font-mono ${!row.matched ? 'font-semibold text-red-700' : 'text-slate-700'}`}
                    >
                      {row.filename}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.title}</td>
                    <td className="px-4 py-3 text-slate-700">{row.titleEn}</td>
                    <td className="px-4 py-3 text-slate-700">
                      상세 설명 더미 텍스트입니다.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <button
            type="button"
            className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-400 text-sm font-semibold text-white shadow-md"
          >
            <UploadCloud className="h-4 w-4" />
            일괄 업로드 실행 (0건)
          </button>
          <p className="text-center text-xs text-slate-500">
            매칭된 행이 있어야 실행할 수 있습니다. 미매칭 행은 빨간색으로 표시됩니다.
          </p>
        </section>
      </div>
    </div>
  )
}
