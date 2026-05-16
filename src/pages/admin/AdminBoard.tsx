import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  notice: "공지사항",
  faq: "FAQ",
  terms: "이용약관",
  privacy: "개인정보처리방침",
};

const DUMMY_ROWS = [
  { id: "1", type: "notice", title: "젤리아 V2.0 업데이트 안내", is_active: true, created_at: "2026.05.16 10:30" },
  { id: "2", type: "faq", title: "네일 사진 업로드는 어떻게 하나요?", is_active: true, created_at: "2026.05.15 14:20" },
  { id: "3", type: "terms", title: "이용약관 개정 안내", is_active: false, created_at: "2026.05.10 09:00" },
];

export default function AdminBoard() {
  const [type, setType] = useState("notice");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 bg-slate-50 min-h-screen">
      <h2 className="text-xl font-bold text-slate-900">고객센터 글 등록 (정적 템플릿)</h2>
      <p className="mt-1 text-sm text-slate-500">
        공지·FAQ·약관·개인정보 처리방침을 등록하는 관리자 UI 뼈대입니다. API 통신은 연결되지 않았습니다.
      </p>

      <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-2">
          <label htmlFor="board-type" className="text-sm font-semibold text-gray-700">카테고리</label>
          <select
            id="board-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 w-full max-w-md rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-slate-500 focus:outline-none"
          >
            {Object.entries(TYPE_LABEL).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="board-title" className="text-sm font-semibold text-gray-700">제목</label>
          <input
            id="board-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="h-10 w-full max-w-2xl rounded-md border border-slate-200 px-3 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="board-content" className="text-sm font-semibold text-gray-700">본문</label>
          <textarea
            id="board-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="본문을 작성하세요."
            className="min-h-[220px] w-full rounded-md border border-slate-200 p-3 text-sm focus:border-slate-500 focus:outline-none resize-y"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" checked={isActive} onChange={() => setIsActive(!isActive)} />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">노출 (앱에서 보이기)</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2 pt-4">
          <button type="button" className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
            등록
          </button>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900">게시글 목록</h2>
        <button type="button" className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          새로고침
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">유형</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">노출</th>
              <th className="px-4 py-3">등록일</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {DUMMY_ROWS.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-700">{TYPE_LABEL[row.type]}</td>
                <td className="max-w-[240px] truncate px-4 py-3 text-slate-900" title={row.title}>
                  {row.title}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${row.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {row.is_active ? "Y" : "N"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {row.created_at}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button type="button" className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors" aria-label="수정">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" aria-label="삭제">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
