import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AlignCenter, AlignLeft, AlignRight, Download } from "lucide-react";
import JSZip from "jszip";

export type InstaStudioEditorProps = {
  imageUrls: string[];
  selectedIdx: number;
  onSelectIdx: (idx: number) => void;
  /** false면 이미지 로드/렌더 일시 중지 */
  active?: boolean;
  children?: (parts: { canvas: ReactNode; controls: ReactNode }) => ReactNode;
};

const CANVAS_W = 1080;
const CANVAS_H = 1350;
const GRADIENT_START_Y = CANVAS_H * 0.6;
const MAX_TEXT_SLOTS = 10;

type InstaStudioFont = "Pretendard" | "Noto Serif KR" | "Gowun Dodum";

const MULTILINGUAL_FONT_FALLBACK =
  "'Noto Sans KR', 'Noto Sans JP', 'Noto Sans Thai', sans-serif";

const FONT_OPTIONS: { value: InstaStudioFont; label: string }[] = [
  { value: "Pretendard", label: "Pretendard (모던 고딕)" },
  { value: "Noto Serif KR", label: "Noto Serif KR (우아한 명조)" },
  { value: "Gowun Dodum", label: "Gowun Dodum (감성 돋움)" },
];

function quoteFontFamily(font: string): string {
  return font.includes(" ") ? `'${font}'` : font;
}

function buildCanvasFont(weight: string | number, sizePx: number, selectedFont: string): string {
  const primary = quoteFontFamily(selectedFont);
  return `${weight} ${sizePx}px ${primary}, ${MULTILINGUAL_FONT_FALLBACK}`;
}

async function ensureCanvasFontsLoaded(
  selectedFont: string,
  titleFontSize: number,
): Promise<void> {
  const primary = quoteFontFamily(selectedFont);
  const stack = `${primary}, ${MULTILINGUAL_FONT_FALLBACK}`;
  try {
    await Promise.all([
      document.fonts.load(`500 48px ${stack}`),
      document.fonts.load(`bold ${titleFontSize}px ${stack}`),
      document.fonts.load(`600 32px ${stack}`),
    ]);
    await document.fonts.ready;
  } catch {
    // fonts API 미지원/실패 시에도 렌더는 계속 진행
  }
}

type TextAlign = "left" | "center" | "right";

type DrawOptions = {
  subTitle: string;
  mainTitle: string;
  gradientOpacity: number;
  textAlign: TextAlign;
  textYPosition: number;
  isCoverMode: boolean;
  titleFontSize: number;
  titleColor: string;
  subTitleColor: string;
  gradientColor: string;
  watermarkText: string;
  textShadowEnabled: boolean;
  selectedFont: string;
};

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const chars = text.split("");
  let line = "";
  const lines: string[] = [];

  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineHeight);
  }

  return lines.length * lineHeight;
}

function resolveTextX(align: TextAlign): number {
  if (align === "center") return CANVAS_W / 2;
  if (align === "right") return CANVAS_W - 80;
  return 80;
}

function applyTextShadow(ctx: CanvasRenderingContext2D, enabled: boolean) {
  if (enabled) {
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  watermarkText: string,
  titleColor: string,
  selectedFont: string,
) {
  const trimmed = watermarkText.trim();
  if (!trimmed) return;

  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.font = buildCanvasFont(600, 32, selectedFont);
  ctx.fillStyle = titleColor;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  applyTextShadow(ctx, false);
  ctx.fillText(trimmed, CANVAS_W - 40, 36);
  ctx.restore();
}

function drawComposite(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  options: DrawOptions,
) {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const {
    subTitle,
    mainTitle,
    gradientOpacity,
    textAlign,
    textYPosition,
    isCoverMode,
    titleFontSize,
    titleColor,
    subTitleColor,
    gradientColor,
    watermarkText,
    textShadowEnabled,
    selectedFont,
  } = options;

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  const canvasRatio = canvas.width / canvas.height;
  const imgRatio = img.naturalWidth / img.naturalHeight;
  let renderWidth = canvas.width;
  let renderHeight = canvas.height;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > canvasRatio) {
    renderWidth = canvas.height * imgRatio;
    offsetX = (canvas.width - renderWidth) / 2;
  } else {
    renderHeight = canvas.width / imgRatio;
    offsetY = (canvas.height - renderHeight) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);

  if (isCoverMode) {
    const grad = ctx.createLinearGradient(0, CANVAS_H, 0, GRADIENT_START_Y);
    grad.addColorStop(0, hexToRgba(gradientColor, gradientOpacity));
    grad.addColorStop(1, hexToRgba(gradientColor, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, GRADIENT_START_Y, CANVAS_W, CANVAS_H - GRADIENT_START_Y);

    ctx.textAlign = textAlign;
    ctx.textBaseline = "top";
    ctx.globalAlpha = 1;

    const x = resolveTextX(textAlign);
    const maxW = CANVAS_W - 160;
    const baseY = CANVAS_H * (textYPosition / 100);

    let subLineH = 0;
    if (subTitle.trim()) {
      applyTextShadow(ctx, textShadowEnabled);
      ctx.font = buildCanvasFont(500, 48, selectedFont);
      ctx.fillStyle = subTitleColor;
      subLineH = wrapText(ctx, subTitle, x, baseY, maxW, 60);
    }

    if (mainTitle.trim()) {
      applyTextShadow(ctx, textShadowEnabled);
      ctx.font = buildCanvasFont("bold", titleFontSize, selectedFont);
      ctx.fillStyle = titleColor;
      const lineHeight = Math.round(titleFontSize * 1.3);
      const subGap = subTitle.trim() ? subLineH + 12 : 0;
      let cursorY = baseY + subGap;
      const paragraphs = mainTitle.split("\n");
      for (const para of paragraphs) {
        if (para.trim()) {
          const h = wrapText(ctx, para, x, cursorY, maxW, lineHeight);
          cursorY += h;
        } else {
          cursorY += lineHeight;
        }
      }
    }

    applyTextShadow(ctx, false);
    drawWatermark(ctx, watermarkText, titleColor, selectedFont);
  } else {
    drawWatermark(ctx, watermarkText, titleColor, selectedFont);
  }
}

export default function InstaStudioEditor({
  imageUrls,
  selectedIdx,
  active = true,
  children,
}: InstaStudioEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mainTitles, setMainTitles] = useState<string[]>(() => Array(MAX_TEXT_SLOTS).fill(""));
  const [subTitles, setSubTitles] = useState<string[]>(() => Array(MAX_TEXT_SLOTS).fill(""));
  const [gradientOpacity, setGradientOpacity] = useState(0.75);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const [textAlign, setTextAlign] = useState<TextAlign>("left");
  const [textYPosition, setTextYPosition] = useState(70);
  const [coverModes, setCoverModes] = useState<boolean[]>([]);
  const [titleFontSize, setTitleFontSize] = useState(70);
  const [titleColor, setTitleColor] = useState("#FFFFFF");
  const [subTitleColor, setSubTitleColor] = useState("#FFFFFF");
  const [gradientColor, setGradientColor] = useState("#000000");
  const [watermarkText, setWatermarkText] = useState("@gelia_official");
  const [textShadowEnabled, setTextShadowEnabled] = useState(true);
  const [selectedFont, setSelectedFont] = useState<InstaStudioFont>("Pretendard");
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const isCoverMode = coverModes[selectedIdx] ?? true;
  const currentMainTitle = mainTitles[selectedIdx] ?? "";
  const currentSubTitle = subTitles[selectedIdx] ?? "";

  const handleMainTitleChange = useCallback((idx: number, value: string) => {
    setMainTitles((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }, []);

  const handleSubTitleChange = useCallback((idx: number, value: string) => {
    setSubTitles((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }, []);

  useEffect(() => {
    setCoverModes((prev) => {
      const next: boolean[] = [];
      for (let i = 0; i < imageUrls.length; i += 1) {
        next.push(prev[i] ?? true);
      }
      return next;
    });
  }, [imageUrls.length]);

  useEffect(() => {
    const currentUrl = imageUrls[selectedIdx];
    if (!active || !currentUrl) {
      setLoadedImg(null);
      return;
    }

    let isCancelled = false;
    setLoadedImg(null);
    const img = new Image();
    img.onload = () => {
      if (!isCancelled) setLoadedImg(img);
    };
    img.onerror = () => {
      if (!isCancelled) setLoadedImg(null);
    };
    img.src = currentUrl;

    return () => {
      isCancelled = true;
    };
  }, [active, selectedIdx, imageUrls]);

  const drawOptions: DrawOptions = {
    subTitle: currentSubTitle,
    mainTitle: currentMainTitle,
    gradientOpacity,
    textAlign,
    textYPosition,
    isCoverMode,
    titleFontSize,
    titleColor,
    subTitleColor,
    gradientColor,
    watermarkText,
    textShadowEnabled,
    selectedFont,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!loadedImg) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let cancelled = false;

    const renderWithFontReady = async () => {
      try {
        await ensureCanvasFontsLoaded(selectedFont, titleFontSize);
      } catch {
        // fonts API 미지원/실패 시에도 렌더는 계속 진행
      }
      if (cancelled || !canvasRef.current) return;
      drawComposite(canvasRef.current, loadedImg, drawOptions);
    };

    void renderWithFontReady();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- drawOptions fields listed explicitly
  }, [
    loadedImg,
    active,
    selectedIdx,
    currentMainTitle,
    currentSubTitle,
    gradientOpacity,
    textAlign,
    textYPosition,
    isCoverMode,
    titleFontSize,
    titleColor,
    subTitleColor,
    gradientColor,
    watermarkText,
    textShadowEnabled,
    selectedFont,
  ]);

  const handleDownloadAll = useCallback(async () => {
    const totalCount = imageUrls.length;
    if (totalCount === 0) return;

    setIsDownloadingAll(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      await ensureCanvasFontsLoaded(selectedFont, titleFontSize);

      for (let i = 0; i < totalCount; i += 1) {
        setDownloadProgress(i + 1);
        const currentUrl = imageUrls[i];

        const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`image load failed: ${currentUrl}`));
          img.src = currentUrl;
        });

        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = CANVAS_W;
        offscreenCanvas.height = CANVAS_H;

        drawComposite(offscreenCanvas, loaded, {
          subTitle: subTitles[i] ?? "",
          mainTitle: mainTitles[i] ?? "",
          gradientOpacity,
          textAlign,
          textYPosition,
          isCoverMode: coverModes[i] ?? true,
          titleFontSize,
          titleColor,
          subTitleColor,
          gradientColor,
          watermarkText,
          textShadowEnabled,
          selectedFont,
        });

        const blob = await new Promise<Blob | null>((resolve) =>
          offscreenCanvas.toBlob(resolve, "image/png"),
        );
        if (blob) {
          zip.file(`Insta_Card_${i + 1}.png`, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.download = `Insta_Studio_Set_${Date.now()}.zip`;
      link.href = zipUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);
    } catch (error) {
      console.error("[InstaStudio] ZIP download failed:", error);
      alert("이미지 일괄 다운로드에 실패했습니다.");
    } finally {
      setIsDownloadingAll(false);
      setDownloadProgress(0);
    }
  }, [
    imageUrls,
    coverModes,
    mainTitles,
    subTitles,
    gradientOpacity,
    textAlign,
    textYPosition,
    titleFontSize,
    titleColor,
    subTitleColor,
    gradientColor,
    watermarkText,
    textShadowEnabled,
    selectedFont,
  ]);

  const canvasPanel = (
    <div className="flex h-full w-full items-center justify-center">
      {imageUrls.length === 0 ? (
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <p className="text-sm font-medium">미리보기 대기 중</p>
          <p className="text-xs text-slate-500">좌측 패널에서 이미지를 업로드하세요</p>
        </div>
      ) : (
        <div className="relative flex max-h-full max-w-full items-center justify-center">
          {!loadedImg && (
            <p className="absolute inset-0 flex items-center justify-center animate-pulse text-xs text-slate-400">
              이미지 로딩 중...
            </p>
          )}
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="max-h-[calc(100vh-140px)] w-auto max-w-full rounded-lg shadow-2xl ring-1 ring-white/10"
          />
        </div>
      )}
    </div>
  );

  const controlsPanel = (
    <div className="flex flex-col gap-3">
      <div className="border-b border-stone-100 pb-3">
        <h3 className="text-base font-extrabold text-stone-900">에디터 설정</h3>
        <p className="mt-0.5 text-xs text-stone-400">1080 × 1350 · 인스타 4:5</p>
      </div>

      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5">
        <input
          type="checkbox"
          checked={isCoverMode}
          onChange={() =>
            setCoverModes((prev) => prev.map((v, i) => (i === selectedIdx ? !v : v)))
          }
          className="h-4 w-4 accent-violet-600"
        />
        <span className="text-xs font-bold text-stone-700">
          표지 효과 적용 (텍스트 &amp; 그라데이션)
        </span>
      </label>

      <div className={`flex flex-col gap-3 ${isCoverMode ? "" : "pointer-events-none opacity-40"}`}>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-stone-500">서브 타이틀 (선택)</span>
          <input
            type="text"
            value={currentSubTitle}
            onChange={(e) => handleSubTitleChange(selectedIdx, e.target.value)}
            placeholder="예: GELIA PICK"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-stone-500">
            메인 타이틀 (엔터로 줄바꿈) · {selectedIdx + 1}번 이미지
          </span>
          <textarea
            rows={3}
            value={currentMainTitle}
            onChange={(e) => handleMainTitleChange(selectedIdx, e.target.value)}
            placeholder="메인 타이틀 입력&#10;엔터로 줄바꿈"
            className="resize-none rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-1 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-stone-500">메인 타이틀 색상</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={titleColor}
                onChange={(e) => setTitleColor(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-stone-300"
              />
              <input
                type="text"
                value={titleColor}
                onChange={(e) => setTitleColor(e.target.value)}
                className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-xs"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-stone-500">서브 타이틀 색상</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={subTitleColor}
                onChange={(e) => setSubTitleColor(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-stone-300"
              />
              <input
                type="text"
                value={subTitleColor}
                onChange={(e) => setSubTitleColor(e.target.value)}
                className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-xs"
              />
            </div>
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-stone-500">그라데이션 색상</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={gradientColor}
              onChange={(e) => setGradientColor(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-stone-300"
            />
            <input
              type="text"
              value={gradientColor}
              onChange={(e) => setGradientColor(e.target.value)}
              className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-xs"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-stone-500">워터마크 텍스트</span>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            placeholder="@gelia_official"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
          />
        </label>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5">
          <input
            type="checkbox"
            checked={textShadowEnabled}
            onChange={(e) => setTextShadowEnabled(e.target.checked)}
            className="h-4 w-4 accent-violet-600"
          />
          <span className="text-xs font-bold text-stone-700">텍스트 그림자 효과</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-stone-500">폰트 선택</span>
          <select
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value as InstaStudioFont)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
          >
            {FONT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-stone-500">
            메인 타이틀 크기 ({titleFontSize}px)
          </span>
          <input
            type="range"
            min={40}
            max={150}
            step={2}
            value={titleFontSize}
            onChange={(e) => setTitleFontSize(Number(e.target.value))}
            className="accent-violet-500"
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-stone-500">텍스트 정렬</span>
          <div className="flex gap-1.5">
            {(["left", "center", "right"] as TextAlign[]).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => setTextAlign(align)}
                className={`flex flex-1 items-center justify-center rounded-lg border py-2 transition ${
                  textAlign === align
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-stone-200 bg-white text-stone-500 hover:border-violet-300"
                }`}
              >
                {align === "left" && <AlignLeft className="h-4 w-4" />}
                {align === "center" && <AlignCenter className="h-4 w-4" />}
                {align === "right" && <AlignRight className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-stone-500">
            텍스트 상하 위치 ({textYPosition}%)
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={textYPosition}
            onChange={(e) => setTextYPosition(Number(e.target.value))}
            className="accent-violet-500"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-stone-500">
            그라데이션 농도 ({Math.round(gradientOpacity * 100)}%)
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={gradientOpacity}
            onChange={(e) => setGradientOpacity(Number(e.target.value))}
            className="accent-violet-500"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => void handleDownloadAll()}
        disabled={isDownloadingAll || imageUrls.length === 0}
        className="sticky bottom-0 mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Download className="h-4 w-4" />
        {isDownloadingAll
          ? `⏳ 생성 중... (${downloadProgress}/${imageUrls.length})`
          : imageUrls.length > 0
            ? `⬇️ ${imageUrls.length}장 일괄 다운로드 (ZIP)`
            : "⬇️ 일괄 다운로드 (ZIP)"}
      </button>
    </div>
  );

  if (children) {
    return <>{children({ canvas: canvasPanel, controls: controlsPanel })}</>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:flex-row">
      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-800 p-4">
        {canvasPanel}
      </div>
      <div className="flex min-h-0 w-full flex-col overflow-y-auto p-5 lg:w-80">{controlsPanel}</div>
    </div>
  );
}
