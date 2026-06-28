export const PRO_FOCUS_MODE_ALLOWED_PATHS = new Set(["/pro", "/pro/collections"]);

const PRO_FOCUS_MODE_BLOCKED_PREFIXES = [
  "/pro/curation",
  "/pro/proposals",
  "/pro/growth",
  "/pro/settings",
  "/pro/faq",
] as const;

export function isProFocusModeBlockedPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/pro";
  if (PRO_FOCUS_MODE_ALLOWED_PATHS.has(normalized)) return false;
  return PRO_FOCUS_MODE_BLOCKED_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}
