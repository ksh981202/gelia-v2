import { useCallback, useEffect, useRef, useState } from "react";
import { X, Download } from "lucide-react";

export type CardNewsEditorModalProps = {
  open: boolean;
  onClose: () => void;
  imageUrls: string[];
  ideaTitle: string;
};

const CANVAS_W = 1080;
const CANVAS_H = 1350;
const GRADIENT_RATIO = 0.4;

function drawComposite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  subTitle: string,
  mainTitle: string,
  gradientOpacity: number,
) {
  const { width: cw, height: ch } = ctx.canvas;

  ctx.clearRect(0, 0, cw, ch);

  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const sw = img.naturalWidth * scale;
  const sh = img.naturalHeight * scale;
  ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);

  const gradTop = ch * (1 - GRADIENT_RATIO);
  const grad = ctx.createLinearGradient(0, ch, 0, gradTop);
  grad.addColorStop(0, `rgba(0,0,0,${gradientOpacity})`);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, gradTop, cw, ch - gradTop);

  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";

  const padX = 60;
  const padY = 60;

  if (subTitle.trim()) {
    ctx.font = "bold 32px 'Pretendard', sans-serif";
    ctx.globalAlpha = 0.85;
    ctx.fillText(subTitle, padX, ch - padY - 60);
    ctx.globalAlpha = 1;
  }

  if (mainTitle.trim()) {
    ctx.font = "900 52px 'Pretendard', sans-serif";
    const maxW = cw - padX * 2;
    const words = mainTitle.split("");
    let line = "";
    const lines: string[] = [];
    for (const ch2 of words) {
      const test = line + ch2;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = ch2;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);

    const lineH = 64;
    const startY = ch - padY;
    for (let i = lines.length - 1; i >= 0; i--) {
      ctx.fillText(lines[i], padX, startY - (lines.length - 1 - i) * lineH);
    }
  }
}

export default function CardNewsEditorModal({
  open,
  onClose,
  imageUrls,
  ideaTitle,
}: CardNewsEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [subTitle, setSubTitle] = useState("");
  const [mainTitle, setMainTitle] = useState(ideaTitle);
  const [gradientOpacity, setGradientOpacity] = useState(0.75);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedIdx(0);
    setSubTitle("");
    setMainTitle(ideaTitle);
    setGradientOpacity(0.75);
  }, [open, ideaTitle]);

  useEffect(() => {
    if (!open || !imageUrls[selectedIdx]) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setLoadedImg(img);
    img.src = imageUrls[selectedIdx];
  }, [open, selectedIdx, imageUrls]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImg) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawComposite(ctx, loadedImg, subTitle, mainTitle, gradientOpacity);
  }, [loadedImg, subTitle, mainTitle, gradientOpacity]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `card-news-${selectedIdx + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [selectedIdx]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative flex w-full max-w-[1100px] max-h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-stone-100 p-2 hover:bg-stone-200"
        >
          <X className="h-5 w-5 text-stone-700" />
        </button>

        {/* Left: Canvas Preview */}
        <div className="flex w-1/2 items-center justify-center bg-stone-100 p-6">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="max-h-[75vh] w-auto rounded-lg shadow-lg"
            style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
          />
        </div>

        {/* Right: Controller */}
        <div className="flex w-1/2 flex-col gap-5 overflow-y-auto p-8">
          <h3 className="text-lg font-extrabold text-stone-900">🎨 카드뉴스 썸네일 제작</h3>

          {/* Thumbnail selector */}
          <div>
            <p className="mb-2 text-xs font-bold text-stone-500">배경 사진 선택</p>
            <div className="flex gap-2">
              {imageUrls.map((url, idx) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    idx === selectedIdx ? "border-violet-500 ring-2 ring-violet-300" : "border-stone-200"
                  }`}
                >
                  <img src={url} alt={`thumb-${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Sub title */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-stone-500">서브 타이틀</span>
            <input
              type="text"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              placeholder="예: GELIA PICK"
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
            />
          </label>

          {/* Main title */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-stone-500">메인 타이틀</span>
            <input
              type="text"
              value={mainTitle}
              onChange={(e) => setMainTitle(e.target.value)}
              placeholder="메인 타이틀 입력"
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
            />
          </label>

          {/* Gradient slider */}
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

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            ⬇️ 이미지 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}
