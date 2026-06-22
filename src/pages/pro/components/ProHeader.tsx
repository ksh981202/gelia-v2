import { useProSearchStore } from "@/features/pro/store/useProSearchStore";
import { useProUIStore } from "@/features/pro/store/useProUIStore";
import { isProFocusModeBlockedPath } from "@/features/pro/proFocusModeRoutes";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ProHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchKeyword = useProSearchStore((state) => state.searchKeyword);
  const setSearchKeyword = useProSearchStore((state) => state.setSearchKeyword);
  const isFocusMode = useProUIStore((state) => state.isFocusMode);
  const toggleFocusMode = useProUIStore((state) => state.toggleFocusMode);

  const handleFocusModeToggle = () => {
    const nextFocusMode = !isFocusMode;
    if (nextFocusMode && isProFocusModeBlockedPath(location.pathname)) {
      navigate("/pro", { replace: true });
    }
    toggleFocusMode();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-stone-200/80 bg-white px-6">
      <div className="relative min-w-0 flex-1 max-w-2xl">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          aria-hidden
        />
        <input
          type="search"
          value={searchKeyword}
          onChange={(event) => setSearchKeyword(event.target.value)}
          placeholder="디자인 검색 (예: 글리터, 웨딩, 숏네일)"
          className="w-full rounded-full border border-stone-200/80 bg-[#FAF7F2] py-2.5 pl-11 pr-4 text-sm text-stone-700 placeholder:text-stone-400 outline-none transition-colors focus:border-stone-300 focus:bg-white"
          aria-label="PRO 디자인 검색"
        />
      </div>

      <button
        type="button"
        onClick={handleFocusModeToggle}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
          isFocusMode
            ? "border-stone-800 bg-stone-800 text-white hover:bg-stone-900"
            : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100",
        )}
        aria-pressed={isFocusMode}
        aria-label={isFocusMode ? "고객 상담 모드 끄기" : "고객 상담 모드 켜기"}
      >
        {isFocusMode ? "✨ 고객 상담 모드 ON" : "💬 고객 상담 모드"}
      </button>
    </header>
  );
}
