import { useProSearchStore } from "@/features/pro/store/useProSearchStore";
import { Clock, Search } from "lucide-react";

export default function ProHeader() {
  const searchKeyword = useProSearchStore((state) => state.searchKeyword);
  const setSearchKeyword = useProSearchStore((state) => state.setSearchKeyword);

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-stone-200/80 bg-[#FFFCF8] px-6">
      <div className="mx-auto flex w-full max-w-2xl items-center">
        <div className="relative w-full">
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
      </div>

      <button
        type="button"
        className="ml-4 flex shrink-0 items-center gap-2 rounded-full border border-stone-200/80 bg-[#FAF7F2] px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-300 hover:bg-[#F3EDE4]"
        aria-label="최근 사용 디자인"
      >
        <Clock className="h-4 w-4 text-stone-500" aria-hidden />
        <span className="hidden sm:inline">🕒 최근 사용 디자인</span>
        <span className="sm:hidden">🕒</span>
      </button>
    </header>
  );
}
