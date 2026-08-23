import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical, ImagePlus, Trash2, Upload } from "lucide-react";
import InstaStudioEditor from "@/widgets/gce/InstaStudioEditor";

const MAX_IMAGES = 10;

type LocalImageItem = {
  id: string;
  blobUrl: string;
  file: File;
};

function createImageItem(file: File): LocalImageItem {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    blobUrl: URL.createObjectURL(file),
    file,
  };
}

export default function AdminInstaStudioPage() {
  const [items, setItems] = useState<LocalImageItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragReorderIdx, setDragReorderIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        URL.revokeObjectURL(item.blobUrl);
      }
    };
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setItems((prev) => {
      const remaining = MAX_IMAGES - prev.length;
      if (remaining <= 0) return prev;
      const nextItems = imageFiles.slice(0, remaining).map(createImageItem);
      return [...prev, ...nextItems];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const removeIdx = prev.findIndex((item) => item.id === id);
      if (removeIdx === -1) return prev;

      const target = prev[removeIdx];
      if (target) URL.revokeObjectURL(target.blobUrl);
      const next = prev.filter((item) => item.id !== id);

      setSelectedIdx((current) => {
        if (next.length === 0) return 0;
        if (current > removeIdx) return current - 1;
        if (current === removeIdx) return Math.min(removeIdx, next.length - 1);
        return current;
      });

      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      for (const item of prev) URL.revokeObjectURL(item.blobUrl);
      return [];
    });
    setSelectedIdx(0);
  }, []);

  const handleDropFiles = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      if (event.dataTransfer.files?.length) {
        addFiles(event.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const handleReorderDrop = useCallback(
    (targetIdx: number) => {
      if (dragReorderIdx === null || dragReorderIdx === targetIdx) return;
      setItems((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragReorderIdx, 1);
        next.splice(targetIdx, 0, moved);
        return next;
      });
      setDragReorderIdx(null);
    },
    [dragReorderIdx],
  );

  useEffect(() => {
    if (items.length === 0) {
      setSelectedIdx(0);
    } else if (selectedIdx >= items.length) {
      setSelectedIdx(items.length - 1);
    }
  }, [items.length, selectedIdx]);

  const blobUrls = items.map((item) => item.blobUrl);

  const assetPanel = (
    <>
      <div className="shrink-0 border-b border-stone-100 px-4 py-3">
        <h2 className="text-sm font-extrabold text-stone-900">에셋</h2>
        <p className="text-[11px] text-stone-400">최대 {MAX_IMAGES}장 · 드래그로 순서 변경</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click();
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDropFiles}
          className={`flex shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-5 transition ${
            isDragOver
              ? "border-violet-500 bg-violet-50"
              : "border-stone-300 bg-stone-50 hover:border-violet-400 hover:bg-violet-50/50"
          }`}
        >
          <Upload className="mb-1.5 h-5 w-5 text-violet-500" />
          <p className="text-xs font-bold text-stone-700">드래그 앤 드롭</p>
          <p className="mt-0.5 text-[10px] text-stone-500">클릭하여 파일 선택</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        <div className="flex shrink-0 items-center justify-between px-0.5">
          <p className="text-[11px] font-bold text-stone-500">
            목록 ({items.length}/{MAX_IMAGES})
          </p>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[11px] font-semibold text-red-500 hover:text-red-600"
            >
              전체 삭제
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-stone-200 bg-stone-50 py-8 text-center">
            <ImagePlus className="mb-1.5 h-6 w-6 text-stone-300" />
            <p className="text-xs text-stone-400">업로드된 이미지 없음</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {items.map((item, idx) => (
              <li
                key={item.id}
                draggable
                onClick={() => setSelectedIdx(idx)}
                onDragStart={() => setDragReorderIdx(idx)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleReorderDrop(idx);
                }}
                onDragEnd={() => setDragReorderIdx(null)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 transition ${
                  idx === selectedIdx
                    ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500"
                    : dragReorderIdx === idx
                      ? "border-violet-400 bg-white ring-1 ring-violet-200"
                      : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-stone-400" />
                <span className="w-4 shrink-0 text-center text-[10px] font-bold text-stone-400">
                  {idx + 1}
                </span>
                <img
                  src={item.blobUrl}
                  alt={item.file.name}
                  className="h-9 w-9 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-stone-700">{item.file.name}</p>
                  <p className="text-[10px] text-stone-400">
                    {(item.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="rounded p-1 text-stone-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="이미지 삭제"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-full flex-col bg-neutral-50">
      <header className="shrink-0 border-b border-stone-200 bg-white px-6 py-4">
        <h1 className="text-lg font-extrabold text-stone-900">📱 인스타 스튜디오</h1>
        <p className="mt-0.5 text-xs text-stone-500">
          로컬 이미지 업로드 → 미리보기 편집 → ZIP 일괄 다운로드
        </p>
      </header>

      <InstaStudioEditor
        imageUrls={blobUrls}
        active={items.length > 0}
        selectedIdx={selectedIdx}
        onSelectIdx={setSelectedIdx}
      >
        {({ canvas, controls }) => (
          <div className="grid h-[calc(100vh-100px)] min-h-0 flex-1 grid-cols-[2.5fr_4.5fr_3fr] gap-4 px-4 py-4 lg:gap-6 lg:px-6 lg:py-5">
            {/* 좌측: 에셋 패널 */}
            <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
              {assetPanel}
            </aside>

            {/* 중앙: 미리보기 캔버스 */}
            <main className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-slate-800 p-4 shadow-inner">
              {canvas}
            </main>

            {/* 우측: 에디터 컨트롤러 */}
            <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
              <div className="min-h-0 flex-1 overflow-y-auto p-4">{controls}</div>
            </aside>
          </div>
        )}
      </InstaStudioEditor>
    </div>
  );
}
