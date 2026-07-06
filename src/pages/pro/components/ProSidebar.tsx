import { useLanguageContext } from "@/contexts/LanguageContext";
import { useProUIStore } from "@/features/pro/store/useProUIStore";
import { Link, NavLink } from "react-router-dom";

const PRO_MENU_ITEMS = [
  { id: "curation", labelKo: "🏆 젤리아 큐레이션", labelEn: "🏆 GELIA Curation", to: "/pro/curation" },
  { id: "designs", labelKo: "💅 전체 디자인", labelEn: "💅 All Designs", to: "/pro", end: true },
  { id: "collection", labelKo: "⭐ 내 컬렉션", labelEn: "⭐ My Collection", to: "/pro/collections" },
  { id: "proposals", labelKo: "📋 상담 제안서", labelEn: "📋 Proposals", to: "/pro/proposals" },
] as const;

const PRO_FOCUS_MENU_ITEMS = [
  { id: "designs", labelKo: "💅 프리미엄 디자인", labelEn: "💅 Premium Designs", to: "/pro", end: true },
  { id: "collection", labelKo: "⭐ VIP 룩북", labelEn: "⭐ VIP Lookbook", to: "/pro/collections" },
  { id: "test", labelKo: "✨ 퍼스널 네일 찾기", labelEn: "✨ Find Personal Nail", to: "/pro/test-intro" },
] as const;

const proNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
    isActive
      ? "bg-[#EDE4D8] text-stone-900 shadow-sm"
      : "text-stone-600 hover:bg-[#F3EDE4] hover:text-stone-800",
  ].join(" ");

export default function ProSidebar() {
  const { isEnglish } = useLanguageContext();
  const isFocusMode = useProUIStore((state) => state.isFocusMode);
  const menuItems = isFocusMode ? PRO_FOCUS_MENU_ITEMS : PRO_MENU_ITEMS;

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-stone-200/80 bg-[#FAF7F2]">
      <div className="border-b border-stone-200/60 px-6 py-7">
        <Link
          to="/pro"
          className="text-2xl font-black tracking-tighter text-stone-800 transition-colors hover:text-stone-900"
        >
          GELIA PRO
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5" aria-label={isEnglish ? "PRO main menu" : "PRO 메인 메뉴"}>
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={"end" in item ? item.end : false}
            className={proNavLinkClass}
          >
            {isEnglish ? item.labelEn : item.labelKo}
          </NavLink>
        ))}
      </nav>

      {!isFocusMode ? (
        <div className="mt-auto border-t border-stone-200/60 p-3">
          <Link
            to="/"
            className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            {isEnglish ? "🏠 Go to GELIA Home" : "🏠 일반 젤리아 홈으로"}
          </Link>
          <a
            href="https://pf.kakao.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            {isEnglish ? "💡 Suggestions / Inquiries" : "💡 기능 제안 / 문의하기"}
          </a>
          <NavLink to="/pro/faq" className={proNavLinkClass}>
            {isEnglish ? "❓ FAQ" : "❓ 자주 묻는 질문 (FAQ)"}
          </NavLink>
          <NavLink to="/pro/settings" className={proNavLinkClass}>
            {isEnglish ? "⚙️ Shop Profile Settings" : "⚙️ 샵 프로필 설정"}
          </NavLink>
        </div>
      ) : null}
    </aside>
  );
}
