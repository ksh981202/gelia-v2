import { LanguageProvider } from "@/contexts/LanguageContext";
import { useProUIStore } from "@/features/pro/store/useProUIStore";
import { isProFocusModeBlockedPath } from "@/features/pro/proFocusModeRoutes";
import { useEffect, useState } from "react";
import { Outlet, useMatch, useLocation, useNavigate } from "react-router-dom";
import ProHeader from "./components/ProHeader";
import ProRightPanel from "./components/ProRightPanel";
import ProSidebar from "./components/ProSidebar";

const PRO_MIN_VIEWPORT_WIDTH = 1024;

function isProViewportSupported(): boolean {
  return typeof window !== "undefined" && window.innerWidth >= PRO_MIN_VIEWPORT_WIDTH;
}

export default function ProLayout() {
  const [isDesktop, setIsDesktop] = useState(isProViewportSupported);
  const isGalleryRoute = Boolean(useMatch({ path: "/pro", end: true }));
  const isFocusMode = useProUIStore((state) => state.isFocusMode);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= PRO_MIN_VIEWPORT_WIDTH);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isFocusMode) return;
    if (!isProFocusModeBlockedPath(location.pathname)) return;
    navigate("/pro", { replace: true });
  }, [isFocusMode, location.pathname, navigate]);

  if (!isDesktop) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white px-6">
        <p className="max-w-md text-center text-base leading-relaxed text-gray-600">
          💻 젤리아 PRO 대시보드는 PC 및 태블릿(가로) 환경에 최적화되어 있습니다. 넓은 화면에서 접속해
          주세요.
        </p>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="flex min-h-screen bg-gray-50">
        <ProSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <ProHeader />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>

        {isGalleryRoute && !isFocusMode ? <ProRightPanel /> : null}
      </div>
    </LanguageProvider>
  );
}
