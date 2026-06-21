import { NavLink } from "react-router-dom";

const PRO_MENU_ITEMS = [
  { id: "curation", label: "🏆 젤리아 큐레이션", to: "/pro/curation" },
  { id: "designs", label: "💅 전체 디자인", to: "/pro", end: true },
  { id: "collection", label: "⭐ 내 컬렉션", to: "/pro/collections" },
  { id: "proposals", label: "📋 보낸 제안서", to: "/pro/proposals" },
  { id: "growth", label: "📈 샵 성장 팁", to: "/pro/growth" },
] as const;

const proNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
    isActive
      ? "bg-[#EDE4D8] text-stone-900 shadow-sm"
      : "text-stone-600 hover:bg-[#F3EDE4] hover:text-stone-800",
  ].join(" ");

export default function ProSidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-stone-200/80 bg-[#FAF7F2]">
      <div className="border-b border-stone-200/60 px-6 py-7">
        <p className="text-xs font-medium tracking-[0.28em] text-stone-400">GELIA</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-stone-800">GELIA PRO</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5" aria-label="PRO 메인 메뉴">
        {PRO_MENU_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={"end" in item ? item.end : false}
            className={proNavLinkClass}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-stone-200/60 p-3">
        <NavLink to="/pro/settings" className={proNavLinkClass}>
          ⚙️ 샵 프로필 설정
        </NavLink>
      </div>
    </aside>
  );
}
