export const ADMIN_EMAILS = ['k981202@naver.com'] as const

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false
  return (ADMIN_EMAILS as readonly string[]).includes(email.trim().toLowerCase())
}
