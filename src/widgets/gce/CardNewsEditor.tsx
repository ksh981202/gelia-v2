import { useCallback, useEffect, useRef, useState } from "react";
import { Download, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import JSZip from "jszip";

export type CardNewsAsset = {
  glId: string;
  imageUrl: string;
};

export type CardNewsEditorProps = {
  imageAssets: CardNewsAsset[];
  ideaTitle?: string;
  /** false면 이미지 로드/렌더 일시 중지 */
  active?: boolean;
};

const CANVAS_W = 1080;
const CANVAS_H = 1350;
const GRADIENT_START_Y = CANVAS_H * 0.6;

type TextAlign = "left" | "center" | "right";

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

function drawComposite(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  subTitle: string,
  mainTitle: string,
  gradientOpacity: number,
  textAlign: TextAlign,
  textYPosition: number,
  isCoverMode: boolean,
  titleFontSize: number,
) {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

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
    grad.addColorStop(0, `rgba(0,0,0,${gradientOpacity})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
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
      ctx.font = "500 48px 'Pretendard', 'Noto Sans KR', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      subLineH = wrapText(ctx, subTitle, x, baseY, maxW, 60);
    }

    if (mainTitle.trim()) {
      ctx.font = `bold ${titleFontSize}px 'Pretendard', 'Noto Sans KR', sans-serif`;
      ctx.fillStyle = "white";
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
  }
}

function resolveDownloadFileName(glId: string, index: number): string {
  const normalized = glId.trim() || `GELIA_CardNews_${index + 1}`;
  return `${normalized}.png`;
}

export default function CardNewsEditor({
  imageAssets,
  ideaTitle = "",
  active = true,
}: CardNewsEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [subTitle, setSubTitle] = useState("");
  const [mainTitle, setMainTitle] = useState(ideaTitle);
  const [gradientOpacity, setGradientOpacity] = useState(0.75); // UI 75%
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const [textAlign, setTextAlign] = useState<TextAlign>("left");
  const [textYPosition, setTextYPosition] = useState(70);
  const [coverModes, setCoverModes] = useState<boolean[]>(() =>
    Array(5).fill(false).map((_, i) => i === 0),
  );
  const isCoverMode = coverModes[selectedIdx] ?? false;
  const [titleFontSize, setTitleFontSize] = useState(70);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    setMainTitle(ideaTitle);
  }, [ideaTitle]);

  useEffect(() => {
    if (selectedIdx >= imageAssets.length) {
      setSelectedIdx(0);
    }
  }, [imageAssets.length, selectedIdx]);

  useEffect(() => {
    const currentAsset = imageAssets[selectedIdx];
    if (!active || !currentAsset?.imageUrl) return;
    setLoadedImg(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    const currentUrl = currentAsset.imageUrl;
    const urlWithCacheBuster = currentUrl.includes("?")
      ? `${currentUrl}&t=${Date.now()}`
      : `${currentUrl}?t=${Date.now()}`;

    img.onload = () => setLoadedImg(img);
    img.onerror = () => {
      const fallback = new Image();
      fallback.crossOrigin = "anonymous";
      fallback.onload = () => setLoadedImg(fallback);
      fallback.src = urlWithCacheBuster;
    };
    img.src = urlWithCacheBuster;
  }, [active, selectedIdx, imageAssets]);

  useEffect(() => {
    if (!canvasRef.current || !loadedImg || !active) return;
    let cancelled = false;

    const renderWithFontReady = async () => {
      try {
        await document.fonts.ready;
      } catch {
        // fonts API 미지원/실패 시에도 렌더는 계속 진행
      }
      if (cancelled || !canvasRef.current) return;
      drawComposite(
        canvasRef.current,
        loadedImg,
        subTitle,
        mainTitle,
        gradientOpacity,
        textAlign,
        textYPosition,
        isCoverMode,
        titleFontSize,
      );
    };

    void renderWithFontReady();

    return () => {
      cancelled = true;
    };
  }, [
    loadedImg,
    subTitle,
    mainTitle,
    gradientOpacity,
    textAlign,
    textYPosition,
    isCoverMode,
    titleFontSize,
    active,
  ]);

  const handleDownloadAll = useCallback(async () => {
    const totalCount = Math.min(5, imageAssets.length);
    if (totalCount === 0) return;

    setIsDownloadingAll(true);
    setDownloadProgress(0);
    try {
      const zip = new JSZip();
      const usedFileNames = new Set<string>();

      for (let i = 0; i < totalCount; i += 1) {
        setDownloadProgress(i + 1);
        const asset = imageAssets[i];
        const currentUrl = asset.imageUrl;
        const urlWithCacheBuster = currentUrl.includes("?")
          ? `${currentUrl}&t=${Date.now()}`
          : `${currentUrl}?t=${Date.now()}`;

        const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => {
            const fallback = new Image();
            fallback.crossOrigin = "anonymous";
            fallback.onload = () => resolve(fallback);
            fallback.onerror = () => reject(new Error(`image load failed: ${currentUrl}`));
            fallback.src = urlWithCacheBuster;
          };
          img.src = urlWithCacheBuster;
        });

        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = CANVAS_W;
        offscreenCanvas.height = CANVAS_H;

        drawComposite(
          offscreenCanvas,
          loaded,
          subTitle,
          mainTitle,
          gradientOpacity,
          textAlign,
          textYPosition,
          coverModes[i] ?? false,
          titleFontSize,
        );

        const blob = await new Promise<Blob | null>((resolve) =>
          offscreenCanvas.toBlob(resolve, "image/png"),
        );
        if (blob) {
          let fileName = resolveDownloadFileName(asset.glId, i);
          if (usedFileNames.has(fileName)) {
            fileName = `${asset.glId}_${i + 1}.png`;
          }
          usedFileNames.add(fileName);
          zip.file(fileName, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.download = `GELIA_CardNews_${Date.now()}.zip`;
      link.href = zipUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);
    } catch (error) {
      console.error("Canvas Download Error:", error);
      alert("이미지 일괄 다운로드에 실패했습니다. (CORS 보안 정책 문제일 수 있습니다.)");
    } finally {
      setIsDownloadingAll(false);
      setDownloadProgress(0);
    }
  }, [
    imageAssets,
    subTitle,
    mainTitle,
    gradientOpacity,
    textAlign,
    textYPosition,
    coverModes,
    titleFontSize,
  ]);

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:flex-row lg:min-h-[720px]">
      {/* Left: Canvas Preview */}
      <div className="flex w-full items-center justify-center bg-stone-100 p-6 lg:w-1/2">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="h-auto w-full max-h-[70vh] rounded-lg object-contain shadow-inner"
        />
      </div>

      {/* Right: Controller */}
      <div className="flex w-full flex-col gap-5 overflow-y-auto p-8 lg:w-1/2">
        <h3 className="text-lg font-extrabold text-stone-900">🎨 카드뉴스 썸네일 제작</h3>

        <div>
          <p className="mb-2 text-xs font-bold text-stone-500">배경 사진 선택</p>
          {imageAssets.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {imageAssets.map((asset, idx) => (
                <button
                  key={`${asset.glId}-${idx}`}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    idx === selectedIdx
                      ? "border-violet-500 ring-2 ring-violet-300"
                      : "border-stone-200 hover:border-violet-300"
                  }`}
                  title={asset.glId}
                >
                  <img
                    src={asset.imageUrl}
                    alt={`${asset.glId}-thumb`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400">세트를 선택하면 썸네일이 표시됩니다.</p>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
          <input
            type="checkbox"
            checked={isCoverMode}
            onChange={() =>
              setCoverModes((prev) => prev.map((v, i) => (i === selectedIdx ? !v : v)))
            }
            className="h-4 w-4 accent-violet-600"
          />
          <span className="text-sm font-bold text-stone-700">
            표지 효과 적용 (텍스트 &amp; 그라데이션)
          </span>
        </label>

        <div className={`flex flex-col gap-5 ${isCoverMode ? "" : "pointer-events-none opacity-40"}`}>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-stone-500">서브 타이틀 (선택)</span>
            <input
              type="text"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              placeholder="예: GELIA PICK"
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-stone-500">메인 타이틀 (엔터로 줄바꿈)</span>
            <textarea
              rows={3}
              value={mainTitle}
              onChange={(e) => setMainTitle(e.target.value)}
              placeholder="메인 타이틀 입력&#10;엔터로 줄바꿈"
              className="resize-none rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
            />
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
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>작게</span>
              <span>크게</span>
            </div>
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-stone-500">텍스트 정렬</span>
            <div className="flex gap-2">
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
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>최상단</span>
              <span>최하단</span>
            </div>
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

        {!loadedImg && active && imageAssets.length > 0 && (
          <p className="animate-pulse text-xs text-stone-400">이미지 로딩 중...</p>
        )}

        <button
          type="button"
          onClick={() => void handleDownloadAll()}
          disabled={isDownloadingAll || imageAssets.length === 0}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          {isDownloadingAll
            ? `⏳ 생성 중... (${downloadProgress}/${Math.min(5, imageAssets.length)})`
            : "⬇️ 5장 일괄 다운로드"}
        </button>
      </div>
    </div>
  );
}
