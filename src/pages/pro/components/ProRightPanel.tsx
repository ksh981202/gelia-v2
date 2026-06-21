export default function ProRightPanel() {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-stone-200/80 bg-[#FAF7F2]">
      <div className="border-b border-stone-200/60 px-5 py-6">
        <h2 className="text-base font-semibold text-stone-800">상담 제안서 세팅</h2>
        <p className="mt-1 text-xs tracking-wide text-stone-400">Consultation Setup</p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-stone-300/80 bg-[#FFFCF8] px-4 py-10 text-center">
          <p className="text-sm leading-relaxed text-stone-400">선택된 디자인이 없습니다</p>
        </div>
      </div>

      <div className="border-t border-stone-200/60 p-5">
        <button
          type="button"
          className="w-full rounded-xl bg-[#5C4A3A] px-4 py-3.5 text-sm font-semibold text-[#FAF7F2] shadow-sm transition-colors hover:bg-[#4A3B2E]"
        >
          [ 🔗 링크 생성 및 복사 ]
        </button>
      </div>
    </aside>
  );
}
