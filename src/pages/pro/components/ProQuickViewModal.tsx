import { useNailDetailQuery } from "@/entities/nail-design/api/useNailDetailQuery";
import type { NailDesignRow } from "@/shared/types/database.types";
import { Brush, Circle, Droplets, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ProQuickViewModalProps = {
  nail: NailDesignRow | null;
  isSelected: boolean;
  onClose: () => void;
  onToggleSelect: (item: NailDesignRow) => void;
};

const DESIGN_ICONS = [Brush, Droplets, Circle, Sparkles] as const;

type ProcedureSection = {
  title: string;
  content: string;
};

function safeTrimText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  return "";
}

function apiLongTextField(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (Array.isArray(value)) {
    return value
      .map((item) => safeTrimText(item))
      .filter(Boolean)
      .join(", ");
  }
  return "";
}

function collectShapeColorMoodTags(nail: NailDesignRow, detail: NailDesignRow | null | undefined): string[] {
  const source = detail ?? nail;
  const chips = [
    safeTrimText(source.nail_length),
    safeTrimText(source.color),
    safeTrimText(source.mood),
  ].filter(Boolean);

  return [...new Set(chips)];
}

function splitDesignElements(raw: string | null | undefined): string[] {
  const text = safeTrimText(raw);
  if (!text) return [];

  return text
    .split(/[,\s・;|/]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function splitProcedureSteps(raw: string | null | undefined): ProcedureSection[] {
  const text = safeTrimText(raw);
  if (!text) return [];

  const normalized = text.replace(/\r\n/g, "\n").trim();
  const markerPattern = /\[\s*(베이스|base|아트|art|마무리|finishing|finish|final)\s*\]/gi;
  const matches = Array.from(normalized.matchAll(markerPattern));
  const stepTitles = ["베이스", "아트", "마무리"];
  const stepContents = ["", "", ""];

  const markerToStepIndex = (markerRaw: string): 0 | 1 | 2 | null => {
    const marker = markerRaw.trim().toLowerCase();
    if (marker === "베이스" || marker === "base") return 0;
    if (marker === "아트" || marker === "art") return 1;
    if (marker === "마무리" || marker === "finishing" || marker === "finish" || marker === "final") return 2;
    return null;
  };

  if (matches.length > 0) {
    const firstStart = matches[0]?.index ?? 0;
    const preface = normalized.slice(0, firstStart).trim();
    if (preface) stepContents[0] = preface;

    for (let index = 0; index < matches.length; index += 1) {
      const current = matches[index];
      const next = matches[index + 1];
      const stepIndex = markerToStepIndex(current[1] ?? "");
      if (stepIndex == null) continue;

      const sectionStart = (current.index ?? 0) + current[0].length;
      const sectionEnd = next?.index ?? normalized.length;
      const content = normalized.slice(sectionStart, sectionEnd).trim();
      if (!content) continue;

      stepContents[stepIndex] = stepContents[stepIndex]
        ? `${stepContents[stepIndex]}\n${content}`.trim()
        : content;
    }
  } else {
    const lines = normalized
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    stepContents[0] = lines[0] ?? normalized;
    stepContents[1] = lines[1] ?? "";
    stepContents[2] = lines.slice(2).join("\n").trim();
  }

  return stepTitles
    .map((title, index) => ({ title, content: stepContents[index] ?? "" }))
    .filter((step) => step.content.trim().length > 0);
}

function formatEditorNote(raw: string): string {
  if (!raw.trim()) return "등록된 상세 설명이 없어요.";
  return raw.replace(/\. +/g, ".\n\n");
}

export default function ProQuickViewModal({
  nail,
  isSelected,
  onClose,
  onToggleSelect,
}: ProQuickViewModalProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const { data: detail, isLoading: isDetailLoading } = useNailDetailQuery(nail?.id);

  useEffect(() => {
    if (!nail) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isZoomOpen) {
        setIsZoomOpen(false);
        return;
      }
      onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [nail, onClose, isZoomOpen]);

  useEffect(() => {
    if (!nail) setIsZoomOpen(false);
  }, [nail]);

  const resolvedDetail = detail ?? nail;

  const title = useMemo(
    () => safeTrimText(resolvedDetail?.title) || "네일 디자인",
    [resolvedDetail?.title],
  );
  const imageUrl = safeTrimText(resolvedDetail?.image_url);
  const tagChips = useMemo(
    () => (resolvedDetail ? collectShapeColorMoodTags(nail!, detail) : []),
    [nail, detail, resolvedDetail],
  );
  const editorNote = useMemo(() => {
    const raw =
      safeTrimText(detail?.description) ||
      safeTrimText(nail?.description) ||
      safeTrimText(detail?.design_elements) ||
      safeTrimText(nail?.design_elements);
    return formatEditorNote(isDetailLoading ? "에디터 노트를 불러오는 중..." : raw);
  }, [detail, isDetailLoading, nail]);
  const designPoints = useMemo(
    () =>
      splitDesignElements(
        apiLongTextField(detail?.design_elements) || apiLongTextField(nail?.design_elements),
      ),
    [detail?.design_elements, nail?.design_elements],
  );
  const procedureSteps = useMemo(
    () =>
      splitProcedureSteps(
        apiLongTextField(detail?.procedure_guide) || apiLongTextField(nail?.procedure_guide),
      ),
    [detail?.procedure_guide, nail?.procedure_guide],
  );
  const procedureGuideFallback = useMemo(() => {
    const raw =
      apiLongTextField(detail?.procedure_guide) || apiLongTextField(nail?.procedure_guide);
    return raw.trim();
  }, [detail?.procedure_guide, nail?.procedure_guide]);

  if (!nail) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        role="presentation"
        onClick={onClose}
      >
        <div
          className="flex h-[85vh] w-[1100px] max-w-[95vw] overflow-hidden rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pro-quick-view-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative w-[45%] shrink-0 bg-[#F8F6F4]">
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="group/image block h-full w-full"
              aria-label={`${title} 이미지 확대`}
            >
              {imageUrl ? (
                <img src={imageUrl} alt={title} className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-stone-200 text-sm text-stone-400">
                  이미지 없음
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsZoomOpen(true);
              }}
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-base text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              aria-label="이미지 확대"
            >
              🔍
            </button>
          </div>

          <div className="flex min-w-0 flex-1 flex-col bg-white">
            <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 pb-4 pt-6">
              <h2 id="pro-quick-view-title" className="text-2xl font-semibold leading-snug text-gray-900">
                {title}
              </h2>

              <section className="mt-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">태그</p>
                {tagChips.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tagChips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full bg-orange-50 px-3.5 py-1.5 text-sm font-medium tracking-tight text-gray-700"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">표시할 태그가 없어요.</p>
                )}
              </section>

              <section className="mt-6">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Editor&apos;s Note
                </p>
                <div className="rounded-2xl bg-[#FFF9F5] p-5 shadow-sm">
                  <p className="whitespace-pre-line text-[15px] font-medium leading-loose tracking-wide text-gray-800">
                    {editorNote}
                  </p>
                </div>
              </section>

              <section className="mt-6">
                <p className="mb-3 text-lg font-bold text-slate-900">디자인 포인트</p>
                {designPoints.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {designPoints.map((point, index) => {
                      const Icon = DESIGN_ICONS[index % DESIGN_ICONS.length];
                      return (
                        <div
                          key={`${point}-${index}`}
                          className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white p-4"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7D66]/10 text-[#FF7D66]">
                            <Icon className="h-5 w-5" aria-hidden />
                          </div>
                          <p className="min-w-0 flex-1 text-sm font-medium leading-snug tracking-tight text-gray-800">
                            {point}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-orange-100 bg-[#FFF9F5] p-4 text-center text-sm text-gray-500">
                    등록된 디자인 포인트가 없어요.
                  </p>
                )}
              </section>

              <section className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                  <p className="text-lg font-bold text-gray-900">네일 원장님을 위한 시술 가이드</p>
                  <span className="rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white">PRO</span>
                </div>

                <div className="rounded-2xl bg-[#FFF9F5] p-5">
                  {isDetailLoading ? (
                    <p className="text-sm text-gray-500">시술 가이드를 불러오는 중...</p>
                  ) : procedureSteps.length > 0 ? (
                    <div className="space-y-5">
                      {procedureSteps.map((step, index) => (
                        <div key={`${step.title}-${index}`}>
                          {index > 0 ? <div className="mb-5 h-px w-full bg-orange-100" /> : null}
                          <div className="flex gap-3">
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-base font-bold tracking-tight text-gray-900">{step.title}</h4>
                              <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed tracking-tight text-gray-600">
                                {step.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : procedureGuideFallback ? (
                    <p className="whitespace-pre-line text-[15px] leading-relaxed text-gray-600">
                      {procedureGuideFallback}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">등록된 시술 가이드가 없어요.</p>
                  )}

                  <p className="mt-4 border-t border-orange-100 pt-4 text-xs leading-relaxed text-gray-400">
                    본 가이드는 참고용 디자인 레퍼런스로, 실제 시술 방식과 다를 수 있습니다.
                  </p>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 flex shrink-0 gap-3 border-t border-orange-100/80 bg-white px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-orange-100 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-orange-50/40"
              >
                [ 닫기 ]
              </button>
              <button
                type="button"
                onClick={() => onToggleSelect(nail)}
                className={[
                  "flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                  isSelected
                    ? "bg-[#EDE4D8] text-[#5C4A3A]"
                    : "bg-[#5C4A3A] text-[#FAF7F2] hover:bg-[#4A3B2E]",
                ].join(" ")}
              >
                {isSelected ? "[ ☑️ 담김 ]" : "[ ☑️ 이 디자인 담기 ]"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isZoomOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="이미지 확대 보기"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute right-4 top-4 z-[70] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="확대 이미지 닫기"
          >
            <X className="h-6 w-6" strokeWidth={2.5} aria-hidden />
          </button>

          <div
            className="h-full w-full overflow-auto [touch-action:pan-x_pan-y_pinch-zoom]"
            onClick={(event) => event.stopPropagation()}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="mx-auto block h-auto min-h-full w-auto max-w-none cursor-zoom-out object-contain"
                onClick={() => setIsZoomOpen(false)}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
