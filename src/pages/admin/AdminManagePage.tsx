import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { editorPickNoteFromRow } from "@/lib/editorPickNote";
import { mapRecordToAdminNailListRow, type AdminNailListRow } from "@/lib/nailPhotoApi";
import imageCompression from "browser-image-compression";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  UploadCloud,
  XCircle,
} from "lucide-react";
import Papa from "papaparse";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface CsvRowData {
  파일명: string;
  썸네일제목: string;
  "썸네일제목(EN)": string;
  상세설명: string;
  "상세설명(EN)": string;
  컬러: string;
  "컬러(EN)": string;
  손톱길이: string;
  "손톱길이(EN)": string;
  추천손타입: string;
  "추천손타입(EN)": string;
  무드: string;
  "무드(EN)": string;
  상황: string;
  "상황(EN)": string;
  디자인기법: string;
  "디자인기법(EN)": string;
  디자인요소: string;
  "디자인요소(EN)": string;
  시술가이드: string;
  "시술가이드(EN)": string;
}

interface MergedMatchItem {
  status: "matched" | "mismatched";
  filename: string;
  csvData?: CsvRowData;
  imageFile?: File;
}


function formatListDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function AdminManagePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [listRows, setListRows] = useState<AdminNailListRow[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const fetchListRows = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setListRows([]);
      setListError("Supabase 연결이 설정되지 않았습니다.");
      return;
    }
    setListLoading(true);
    setListError(null);
    try {
      const { data, error } = await supabase
        .from("nail_photo_uploads")
        .select("id, source_filename, title, title_en, image_url, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setListRows((data ?? []).map((row) => mapRecordToAdminNailListRow(row as Record<string, unknown>)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "목록을 불러오지 못했습니다.";
      setListError(message);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchListRows();
  }, [fetchListRows]);


  const [csvRows, setCsvRows] = useState<CsvRowData[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const csvInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const sanitized = (results.data as any[]).map((row) => {
          const getVal = (keys: string[]) => {
            for (const k of keys) {
              if (row[k] !== undefined) return String(row[k]).trim();
            }
            return "";
          };
          return {
            파일명: getVal(["파일명", "﻿파일명"]),
            썸네일제목: getVal(["썸네일 제목", "썸네일제목"]),
            "썸네일제목(EN)": getVal(["썸네일 제목(EN)", "썸네일제목(EN)"]),
            상세설명: getVal(["상세 설명", "상세설명"]),
            "상세설명(EN)": getVal(["상세 설명(EN)", "상세설명(EN)"]),
            컬러: getVal(["컬러", "컬러(KR)"]),
            "컬러(EN)": getVal(["컬러(EN)"]),
            손톱길이: getVal(["손톱길이", "손톱 길이"]),
            "손톱길이(EN)": getVal(["손톱길이(EN)"]),
            추천손타입: getVal(["추천 손타입", "추천손타입"]),
            "추천손타입(EN)": getVal(["추천 손타입(EN)"]),
            무드: getVal(["무드"]),
            "무드(EN)": getVal(["무드(EN)"]),
            상황: getVal(["상황"]),
            "상황(EN)": getVal(["상황(EN)"]),
            디자인기법: getVal(["디자인 기법", "디자인기법"]),
            "디자인기법(EN)": getVal(["디자인 기법(EN)", "디자인기법(EN)"]),
            디자인요소: getVal(["디자인 요소", "디자인요소"]),
            "디자인요소(EN)": getVal(["디자인 요소(EN)"]),
            시술가이드: getVal(["시술 가이드", "시술가이드"]),
            "시술가이드(EN)": getVal(["시술 가이드(EN)"]),
          };
        });
        setCsvRows(sanitized);
      },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const imageMap = new Map<string, File>();
  imageFiles.forEach((f) => imageMap.set(f.name.trim().toLowerCase(), f));

  const mergedItems: MergedMatchItem[] = csvRows.map((row) => {
    const targetName = row.파일명.trim().toLowerCase();
    const imageFile = imageMap.get(targetName);
    return {
      status: imageFile ? "matched" : "mismatched",
      filename: row.파일명,
      csvData: row,
      imageFile,
    };
  });

  const matchCount = mergedItems.filter((i) => i.status === "matched").length;
  const mismatchCount = mergedItems.length - matchCount;

  const sortedMergedItems = [...mergedItems].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "mismatched" ? -1 : 1;
  });

  const handleBulkUploadSubmit = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return alert("Supabase 연결 해제");

    const targets = mergedItems.filter((item) => item.status === "matched" && item.imageFile && item.csvData);
    if (targets.length === 0) return alert("매칭 완료된 에셋이 없습니다.");

    if (!window.confirm(`정말 ${targets.length}건의 데이터를 공장에 일괄 입고하시겠습니까?`)) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < targets.length; i++) {
        const item = targets[i]!;
        setUploadProgress(`전체 ${targets.length}개 중 ${i + 1}번째 에셋 처리 중...`);

        const compressedFile = await imageCompression(item.imageFile!, {
          maxWidthOrHeight: 1024,
          maxSizeMB: 0.4,
          useWebWorker: true,
        });

        const storagePath = `uploads/${Date.now()}_${item.filename}`;
        const { error: storageErr } = await supabase.storage
          .from("nail-images")
          .upload(storagePath, compressedFile, { contentType: "image/jpeg", upsert: true });

        if (storageErr) throw new Error(`[R2 Error] ${item.filename}: ${storageErr.message}`);

        const { data: urlData } = supabase.storage.from("nail-images").getPublicUrl(storagePath);
        const publicUrl = urlData.publicUrl;

        // 에디터 팁 자동 연동
        const dummyRowForTip: any = {
          title: item.csvData!.썸네일제목,
          description: item.csvData!.상세설명,
          styles: item.csvData!.디자인요소,
        };
        const autoGeneratedTip = editorPickNoteFromRow(dummyRowForTip, i);

        const insertPayload = {
          image_url: publicUrl,
          source_filename: item.filename,
          title: item.csvData!.썸네일제목,
          description: item.csvData!.상세설명,
          color: item.csvData!.컬러,
          nail_length: item.csvData!.손톱길이,
          hand_type: item.csvData!.추천손타입,
          mood: item.csvData!.무드,
          design_technique: item.csvData!.디자인기법,
          design_elements: item.csvData!.디자인요소,
          procedure_guide: item.csvData!.시술가이드,
          occasion: item.csvData!.상황,
          keyword: autoGeneratedTip,
          
          title_en: item.csvData!["썸네일제목(EN)"] || null,
          description_en: item.csvData!["상세설명(EN)"] || null,
          color_en: item.csvData!["컬러(EN)"] || null,
          length_en: item.csvData!["손톱길이(EN)"] || null,
          hand_type_en: item.csvData!["추천손타입(EN)"] || null,
          mood_en: item.csvData!["무드(EN)"] || null,
          occasion_en: item.csvData!["상황(EN)"] || null,
          styles_en: item.csvData!["디자인요소(EN)"] || null,
          technique_en: item.csvData!["디자인기법(EN)"] || null,
          design_point_en: item.csvData!["디자인기법(EN)"] || null,
          guide_en: item.csvData!["시술가이드(EN)"] || null,
        };

        const { error: dbErr } = await supabase.from("nail_photo_uploads").insert([insertPayload]);
        if (dbErr) throw new Error(`[DB Error] ${item.filename}: ${dbErr.message}`);
      }

      alert("모든 네일 사진 및 다국어 코드가 업로드 완료되었습니다.");
      setCsvRows([]);
      setImageFiles([]);
      if (csvInputRef.current) csvInputRef.current.value = "";
      if (imageInputRef.current) imageInputRef.current.value = "";
      await fetchListRows();
    } catch (err: any) {
      alert(`공장 중단 에러 터짐: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };


  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return listRows;
    return listRows.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        (row.title_en?.toLowerCase().includes(q) ?? false) ||
        row.filename.toLowerCase().includes(q),
    );
  }, [listRows, searchQuery]);

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
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900">데이터 관리</h1>
        <p className="mt-2 text-sm text-slate-600">
          CSV와 이미지를 상단에서 매칭·검수한 뒤 일괄 업로드하고, 아래 목록에서 등록된 항목을 관리합니다.
          Supabase <code className="rounded bg-slate-200 px-1">nail_photo_uploads</code> 및 R2 스토리지와 연동됩니다.
        </p>
      </div>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex w-full flex-col gap-6">
          <div
            onClick={() => csvInputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition-colors hover:border-slate-400 hover:bg-slate-100"
          >
            <UploadCloud className="h-9 w-9 text-slate-400" />
            <span className="mt-3 text-sm font-semibold text-slate-700">CSV 파일을 여기에 놓거나 클릭</span>
            <span className="mt-1 text-xs text-slate-400">
              선택됨: {csvRows.length ? `${csvRows.length}행 데이터` : "없음"}
            </span>
            <input type="file" ref={csvInputRef} accept=".csv" className="hidden" onChange={handleCsvChange} />
          </div>

          <div className="w-full">
            <p className="mb-2 text-sm font-semibold text-slate-700">다중 이미지</p>
            <div
              onClick={() => imageInputRef.current?.click()}
              className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition-colors hover:border-slate-400 hover:bg-slate-100"
            >
              <UploadCloud className="h-9 w-9 text-slate-400" />
              <span className="mt-3 text-sm font-semibold text-slate-700">이미지들을 여기에 놓거나 클릭</span>
              <span className="mt-1 text-xs text-slate-400">등록된 이미지: {imageFiles.length}장</span>
              <input type="file" ref={imageInputRef} multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
          </div>

          {sortedMergedItems.length > 0 && (
            <div className="max-h-[min(20rem,50vh)] overflow-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                  <tr>
                    <th className="w-[100px] p-3">상태</th>
                    <th className="min-w-[180px] p-3">파일명</th>
                    <th className="min-w-[140px] p-3">썸네일 제목</th>
                    <th className="min-w-[140px] p-3">썸네일 제목(EN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  {sortedMergedItems.map((item, index) => {
                    const isMismatch = item.status === "mismatched";
                    return (
                      <tr key={`${item.filename}-${index}`} className={isMismatch ? "bg-rose-50/60 hover:bg-rose-50" : "hover:bg-slate-50"}>
                        <td className="p-3">
                          {isMismatch ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              미매칭
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              매칭
                            </span>
                          )}
                        </td>
                        <td className={`p-3 font-mono text-xs font-bold ${isMismatch ? "text-rose-600" : "text-slate-900"}`}>{item.filename}</td>
                        <td className="max-w-[200px] truncate p-3">{item.csvData?.썸네일제목}</td>
                        <td className="max-w-[200px] truncate p-3 font-mono text-xs">{item.csvData?.["썸네일제목(EN)"]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                매칭 완료: {matchCount}건
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                <XCircle className="h-4 w-4 shrink-0" />
                미매칭 오류: {mismatchCount}건
              </span>
            </div>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
              {isUploading && <p className="text-sm font-semibold text-[#FF7E67] animate-pulse">{uploadProgress}</p>}
              <button
                type="button"
                disabled={isUploading || matchCount === 0}
                onClick={() => void handleBulkUploadSubmit()}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 sm:w-auto"
              >
                {isUploading ? "업로드 중..." : `일괄 업로드 실행 (${matchCount}건)`}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input type="search" placeholder="제목·영문 제목·파일명 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10 border-slate-200 pl-9 bg-white" />
          </div>
          <Button type="button" variant="outline" size="sm" className="shrink-0 border-slate-200 bg-white" disabled={listLoading} onClick={() => void fetchListRows()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${listLoading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
        </div>
      </div>

      {listError && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{listError}</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-12" /><col className="w-20" /><col className="w-32" /><col className="w-1/4" /><col className="w-28" /><col className="w-28" /><col className="w-28" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3 text-center"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400" /></th>
                <th className="px-3 py-3 text-left">썸네일</th>
                <th className="px-3 py-3 text-left">파일명</th>
                <th className="px-3 py-3 text-left">썸네일 제목</th>
                <th className="px-3 py-3 text-left">등록일</th>
                <th className="px-3 py-3 text-left">상태</th>
                <th className="px-3 py-3 text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {listLoading && filteredRows.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-12 text-center text-slate-500">목록을 불러오는 중...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-12 text-center text-slate-500">{searchQuery.trim() ? "검색 결과가 없습니다." : "등록된 항목이 없습니다."}</td></tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-3 text-center align-middle">
                      <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleRowSelected(row.id)} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400" />
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        {row.image_url ? <img src={row.image_url} alt="" className="h-full w-full object-cover object-center" /> : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle font-mono text-xs text-slate-700">{row.filename}</td>
                    <td className="px-3 py-3 align-middle text-slate-900">
                      <span className="block font-medium truncate">{row.title}</span>
                      {row.title_en ? <span className="block text-sm text-gray-400 truncate mt-0.5">{row.title_en}</span> : null}
                    </td>
                    <td className="px-3 py-3 align-middle tabular-nums text-xs text-slate-600">{formatListDate(row.created_at)}</td>
                    <td className="px-3 py-3 align-middle">
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">정상 노출</span>
                        {row.title_en ? <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-500">EN</span> : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button type="button" variant="outline" size="sm" className="h-8 px-3 text-xs bg-white">수정</Button>
                        <Button type="button" variant="destructive" size="sm" className="h-8 px-3 text-xs bg-red-500 hover:bg-red-600">삭제</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center mt-4 text-xs text-slate-400">
        총 {listRows.length}건{searchQuery.trim() ? ` · 검색 결과 ${filteredRows.length}건` : null}
      </div>
    </div>
  );
}
