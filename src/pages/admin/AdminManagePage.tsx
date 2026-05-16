import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Search } from "lucide-react";
import { useState } from "react";

const DUMMY_ROWS = [
  { id: "1", image_url: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=200&q=80", source_filename: "GL-000401.jpg", title: "시크 핑크 데이트", title_en: "Chic Pink Date", created_at: "2026.04.13" },
  { id: "2", image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80", source_filename: "GL-000402.jpg", title: "트렌디 누드 오피스", title_en: "Trendy Nude Office", created_at: "2026.04.13" },
  { id: "3", image_url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=200&q=80", source_filename: "GL-000403.jpg", title: "힙한 베이지 여행", title_en: "Hip Beige Travel", created_at: "2026.04.13" },
  { id: "4", image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?w=200&q=80", source_filename: "GL-000404.jpg", title: "키치 파스텔 파티", title_en: "Kitsch Pastel Party", created_at: "2026.04.13" },
  { id: "5", image_url: "https://images.unsplash.com/photo-1516975080661-460ce4178550?w=200&q=80", source_filename: "GL-000405.jpg", title: "올드머니 생화", title_en: "Old Money Floral", created_at: "2026.04.13" },
];

export default function AdminManagePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  const toggleRowSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10 bg-slate-50 min-h-screen">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-slate-900">등록 네일 관리</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            정적 UI 템플릿입니다. API 연동이 제거된 순수 마네킹 페이지입니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {selectedIds.size > 0 && (
            <Button type="button" variant="destructive" size="sm" className="shrink-0">
              선택 삭제 ({selectedIds.size})
            </Button>
          )}
          <div className="relative min-w-[10rem] max-w-xs flex-1 sm:min-w-[14rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input type="search" placeholder="제목·영문 제목·파일명 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10 border-slate-200 pl-9 bg-white" />
          </div>
          <Button type="button" variant="outline" size="sm" className="shrink-0 border-slate-200 bg-white">
            <RefreshCw className="h-4 w-4 mr-1" /> 새로고침
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-12" />
              <col className="w-20" />
              <col className="w-1/5" />
              <col />
              <col className="w-28" />
              <col className="w-24" />
              <col className="w-32" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-1 py-2.5 text-center sm:px-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400" />
                </th>
                <th className="whitespace-nowrap px-2 py-2.5 text-left">썸네일</th>
                <th className="whitespace-nowrap px-2 py-2.5 text-left">파일명</th>
                <th className="min-w-0 px-2 py-2.5 text-left">썸네일 제목</th>
                <th className="whitespace-nowrap px-2 py-2.5 text-left">등록일</th>
                <th className="min-w-0 px-2 py-2.5 text-left">상태</th>
                <th className="whitespace-nowrap px-2 py-2.5 text-right">작업</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_ROWS.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-1 py-2.5 text-center align-middle sm:px-2">
                    <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleRowSelected(row.id)} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400" />
                  </td>
                  <td className="px-2 py-2.5 align-middle">
                    <div className="mx-auto block h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:h-14 sm:w-14">
                      <img src={row.image_url} alt="" className="h-full w-full object-cover object-center" />
                    </div>
                  </td>
                  <td className="max-w-[120px] min-w-0 truncate px-2 py-2.5 align-middle font-mono text-xs text-slate-700 sm:max-w-[150px]">
                    {row.source_filename}
                  </td>
                  <td className="max-w-[150px] min-w-0 px-2 py-2.5 align-middle text-slate-900 md:max-w-[220px]">
                    <span className="block truncate font-medium">{row.title}</span>
                    <div className="mt-0.5 truncate text-sm text-gray-400">{row.title_en}</div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 align-middle tabular-nums text-xs text-slate-600">
                    {row.created_at}
                  </td>
                  <td className="min-w-0 px-2 py-2.5 align-middle">
                    <div className="flex min-w-0 flex-wrap items-center">
                      <span className="inline-block max-w-full truncate rounded-full bg-emerald-50 px-2 py-0.5 text-left text-xs font-medium text-emerald-800">
                        정상 노출
                      </span>
                      <span className="ml-2 shrink-0 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                        EN
                      </span>
                    </div>
                  </td>
                  <td className="px-1 py-2.5 align-middle text-right sm:px-2">
                    <div className="flex flex-nowrap items-center justify-end gap-1">
                      <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 border-slate-200 px-2 text-xs" onClick={() => setEditingId(row.id)}>
                        수정
                      </Button>
                      <Button type="button" variant="destructive" size="sm" className="h-8 shrink-0 px-2 text-xs">
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 px-4 py-4">
          <Button type="button" variant="outline" size="sm" className="min-w-[4rem] border-slate-200">이전</Button>
          <Button type="button" variant="default" size="sm" className="h-9 min-w-9 px-2">1</Button>
          <Button type="button" variant="outline" size="sm" className="h-9 min-w-9 border-slate-200 px-2">2</Button>
          <Button type="button" variant="outline" size="sm" className="h-9 min-w-9 border-slate-200 px-2">3</Button>
          <Button type="button" variant="outline" size="sm" className="min-w-[4rem] border-slate-200">다음</Button>
        </div>
      </div>

      <Sheet open={editingId !== null} onOpenChange={(open) => { if (!open) setEditingId(null); }}>
        <SheetContent side="right" className="flex h-full !w-[90vw] !max-w-6xl flex-col gap-0 overflow-hidden border-l p-0 sm:!max-w-6xl bg-white">
          <SheetHeader className="shrink-0 space-y-1 border-b border-slate-200 px-6 py-4 text-left bg-white">
            <SheetTitle>네일 전체 상세 수정</SheetTitle>
            <SheetDescription>
              사용자 앱은 기본 한글 노출을 유지하고, 관리자에서만 한글·영문 메타를 함께 편집합니다.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 bg-white">
            <div className="space-y-5">
              <div className="flex justify-center border-b border-slate-100 pb-4">
                <div className="block h-28 w-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm sm:h-32 sm:w-32">
                  <img src="https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=200&q=80" alt="" className="h-full w-full object-cover object-center" />
                </div>
              </div>

              <div className="min-w-0 overflow-x-auto pb-1">
                <div className="grid min-w-[720px] grid-cols-2 gap-8">
                  <div className="min-w-0 space-y-5">
                    <h3 className="border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">🇰🇷 한국어 (원본)</h3>
                    <div className="space-y-1.5">
                      <Label className="text-slate-700">썸네일 제목</Label>
                      <Input defaultValue="시크 핑크 데이트" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-700">상황</Label>
                      <Input defaultValue="데이트, 오피스" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-700">상세 설명</Label>
                      <Textarea defaultValue="시크하고 매력적인 핑크 디자인입니다." className="min-h-[240px] resize-y text-sm" />
                    </div>
                  </div>

                  <div className="min-w-0 space-y-5">
                    <h3 className="border-b border-blue-100 pb-2 text-base font-semibold text-blue-900">🇺🇸 English</h3>
                    <div className="space-y-1.5">
                      <Label className="text-slate-600">Thumbnail title · title_en</Label>
                      <Input defaultValue="Chic Pink Date" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-600">Occasion · occasion_en</Label>
                      <Input defaultValue="Date, Office" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-600">Description · description_en</Label>
                      <Textarea defaultValue="Chic and attractive pink design." className="min-h-[240px] resize-y text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="shrink-0 gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setEditingId(null)} className="bg-white">취소</Button>
            <Button type="button" onClick={() => setEditingId(null)} className="bg-slate-900 text-white">저장</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
