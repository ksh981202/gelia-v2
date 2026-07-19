import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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

/** Provider 마운트 시 1회 — LocalStorage 우선, 없으면 브라우저 언어 → Non-KR은 en */
function resolveInitialLanguage(): Language {
  const stored = readStoredLanguage();
  if (stored) return stored;

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
