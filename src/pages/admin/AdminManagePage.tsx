import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search } from "lucide-react";
import { useState } from "react";

const DUMMY_ROWS = [
  { id: "1", filename: "GL-0000410.webp", title: "피치빛 봄날", title_en: "Peach Spring", date: "2026.04.13", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=100&q=80" },
  { id: "2", filename: "GL-0000409.webp", title: "귀여운 리본", title_en: "Cute Ribbon", date: "2026.04.13", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=100&q=80" },
  { id: "3", filename: "GL-0000408.webp", title: "청순한 파스텔", title_en: "Innocent Pastel", date: "2026.04.13", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=100&q=80" },
  { id: "4", filename: "GL-0000407.webp", title: "봄날의 데이트", title_en: "Spring Date", date: "2026.04.13", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?w=100&q=80" },
  { id: "5", filename: "GL-0000406.webp", title: "발레코어 화이트", title_en: "Balletcore White", date: "2026.04.13", image: "https://images.unsplash.com/photo-1516975080661-460ce4178550?w=100&q=80" },
];

export default function AdminManagePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleRowSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 bg-slate-50 min-h-screen">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="w-full">
          <p className="text-sm text-slate-600">
            Supabase <code className="rounded bg-slate-200 px-1">nail_photo_uploads</code>에 등록된 항목입니다. 삭제 시 Edge Function이 DB 행과 R2 객체를 정리합니다.<br/>
            (현재는 API가 연결되지 않은 순수 정적 UI 모드입니다.)
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between w-full mt-4 gap-2">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input type="search" placeholder="제목·영문 제목·파일명 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10 border-slate-200 pl-9 bg-white" />
          </div>
          <Button type="button" variant="outline" size="sm" className="shrink-0 border-slate-200 bg-white">
            <RefreshCw className="h-4 w-4 mr-2" /> 새로고침
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-12" />
              <col className="w-20" />
              <col className="w-32" />
              <col className="w-1/4" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-28" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3 text-center">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400" />
                </th>
                <th className="px-3 py-3 text-left">썸네일</th>
                <th className="px-3 py-3 text-left">파일명</th>
                <th className="px-3 py-3 text-left">썸네일 제목</th>
                <th className="px-3 py-3 text-left">등록일</th>
                <th className="px-3 py-3 text-left">상태</th>
                <th className="px-3 py-3 text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {DUMMY_ROWS.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-3 text-center align-middle">
                    <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleRowSelected(row.id)} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400" />
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      <img src={row.image} alt="" className="h-full w-full object-cover object-center" />
                    </div>
                  </td>
                  <td className="px-3 py-3 align-middle font-mono text-xs text-slate-700">
                    {row.filename}
                  </td>
                  <td className="px-3 py-3 align-middle text-slate-900">
                    <span className="block font-medium truncate">{row.title}</span>
                    <span className="block text-sm text-gray-400 truncate mt-0.5">{row.title_en}</span>
                  </td>
                  <td className="px-3 py-3 align-middle tabular-nums text-xs text-slate-600">
                    {row.date}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className="flex flex-col items-start gap-1">
                      <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                        정상 노출
                      </span>
                      <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-500">
                        EN
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-middle text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button type="button" variant="outline" size="sm" className="h-8 px-3 text-xs bg-white">수정</Button>
                      <Button type="button" variant="destructive" size="sm" className="h-8 px-3 text-xs bg-red-500 hover:bg-red-600">삭제</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 px-4 py-4 bg-white">
          <Button type="button" variant="outline" size="sm" className="min-w-[4rem] text-slate-500 bg-white border-slate-200">이전</Button>
          <Button type="button" variant="default" size="sm" className="h-9 min-w-9 px-2 bg-[#FF7E67] hover:bg-[#f2664c] text-white">1</Button>
          <Button type="button" variant="ghost" size="sm" className="h-9 min-w-9 px-2 text-slate-600">2</Button>
          <Button type="button" variant="ghost" size="sm" className="h-9 min-w-9 px-2 text-slate-600">3</Button>
          <span className="px-2 text-slate-400">...</span>
          <Button type="button" variant="ghost" size="sm" className="h-9 min-w-9 px-2 text-slate-600">41</Button>
          <Button type="button" variant="outline" size="sm" className="min-w-[4rem] text-slate-700 bg-white border-slate-200">다음</Button>
        </div>
      </div>
      <div className="text-center mt-4 text-xs text-slate-400">
        총 486건 · 12건씩
      </div>
    </div>
  );
}
