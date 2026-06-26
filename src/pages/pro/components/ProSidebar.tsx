import { useProUIStore } from "@/features/pro/store/useProUIStore";
import { NavLink } from "react-router-dom";

const PRO_MENU_ITEMS = [
  { id: "curation", label: "🏆 젤리아 큐레이션", to: "/pro/curation" },
  { id: "designs", label: "💅 전체 디자인", to: "/pro", end: true },
  { id: "collection", label: "⭐ 내 컬렉션", to: "/pro/collections" },
  { id: "proposals", label: "📋 상담 제안서", to: "/pro/proposals" },
  // 런칭 초기 UX 집중: 임시 숨김 — 복구 시 아래 주석 해제
  // { id: "growth", label: "📈 샵 성장 팁", to: "/pro/growth" },
] as const;

const PRO_FOCUS_MENU_ITEMS = [
  { id: "designs", label: "💅 프리미엄 디자인", to: "/pro", end: true },
  { id: "collection", label: "⭐ VIP 룩북", to: "/pro/collections" },
  { id: "proposals", label: "💌 고객 맞춤 제안서", to: "/pro/proposals" },
] as const;

const proNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
    isActive
      ? "bg-[#EDE4D8] text-stone-900 shadow-sm"
      : "text-stone-600 hover:bg-[#F3EDE4] hover:text-stone-800",
  ].join(" ");

export default function ProSidebar() {
  const isFocusMode = useProUIStore((state) => state.isFocusMode);
  const menuItems = isFocusMode ? PRO_FOCUS_MENU_ITEMS : PRO_MENU_ITEMS;

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-stone-200/80 bg-[#FAF7F2]">
      <div className="border-b border-stone-200/60 px-6 py-7">
        <span className="text-2xl font-black tracking-tighter text-stone-800">GELIA PRO</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5" aria-label="PRO 메인 메뉴">
        {menuItems.map((item) => (
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

      {!isFocusMode ? (
        <div className="mt-auto border-t border-stone-200/60 p-3">
          <a
            href="https://pf.kakao.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            💡 기능 제안 / 문의하기
          </a>
          <NavLink to="/pro/faq" className={proNavLinkClass}>
            ❓ 자주 묻는 질문 (FAQ)
          </NavLink>
          <NavLink to="/pro/settings" className={proNavLinkClass}>
            ⚙️ 샵 프로필 설정
          </NavLink>
        </div>
      ) : null}
    </aside>
  );
}
