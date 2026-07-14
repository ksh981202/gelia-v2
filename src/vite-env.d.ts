/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_R2_PUBLIC_URL: string
  readonly VITE_SITE_URL?: string
  readonly VITE_GEMINI_API_KEY?: string
  readonly VITE_GEMINI_MODEL?: string
  readonly VITE_ENABLE_CF_IMAGE_RESIZE?: string
  readonly VITE_ENABLE_SUPABASE_IMAGE_RENDER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
