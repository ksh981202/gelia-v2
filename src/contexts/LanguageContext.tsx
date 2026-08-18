import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import i18n from "@/shared/i18n/i18n";

export type Language = "ko" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  isEnglish: boolean;
};

const STORAGE_KEY = "gelia-language";

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ko") return saved;
  } catch {
    // private mode / blocked storage
  }
  return null;
}

function mapLangParamToLanguage(raw: string | null): Language | null {
  const v = String(raw ?? "").toLowerCase().trim();
  if (!v) return null;
  if (v === "ko") return "ko";
  // gelia i18n(네일 상세)는 ko/en만 있으므로 jp/vn/th는 en으로 매핑
  if (v === "en" || v === "jp" || v === "vn" || v === "th") return "en";
  return null;
}

function detectBrowserLanguage(): Language {
  try {
    const raw =
      (typeof navigator !== "undefined" &&
        (navigator.languages?.[0] || navigator.language)) ||
      "";
    const normalized = String(raw).toLowerCase();
    if (normalized.startsWith("ko")) return "ko";
  } catch {
    // ignore
  }
  return "en";
}

/** Provider 마운트 시 1회 — URL 쿼리 > URL 경로 > localStorage > 브라우저 */
function resolveInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";

  // 1) URL 쿼리 우선: ?lang=en|ko|jp|vn|th
  try {
    const url = new URL(window.location.href);
    const fromQuery = mapLangParamToLanguage(url.searchParams.get("lang"));
    if (fromQuery) {
      try {
        localStorage.setItem(STORAGE_KEY, fromQuery);
      } catch {
        // ignore
      }
      return fromQuery;
    }
  } catch {
    // ignore
  }

  // 2) URL 경로 감지: /en/... (그 외 로케일은 en으로 처리)
  try {
    const pathname = window.location.pathname;
    const fromPath = pathname.startsWith("/en/")
      ? "en"
      : pathname.startsWith("/ko/")
        ? "ko"
        : pathname.startsWith("/jp/") || pathname.startsWith("/vn/") || pathname.startsWith("/th/")
          ? "en"
          : null;
    if (fromPath === "en" || fromPath === "ko") {
      try {
        localStorage.setItem(STORAGE_KEY, fromPath);
      } catch {
        // ignore
      }
      return fromPath;
    }
  } catch {
    // ignore
  }

  // 3) localStorage
  const stored = readStoredLanguage();
  if (stored) return stored;

  // 4) 브라우저 기본 언어
  const detected = detectBrowserLanguage();
  try {
    localStorage.setItem(STORAGE_KEY, detected);
  } catch {
    // ignore
  }
  return detected;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(resolveInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore
    }
    void i18n.changeLanguage(language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      isEnglish: language === "en",
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within LanguageProvider");
  }
  return context;
}
