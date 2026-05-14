import { S3Client } from '@aws-sdk/client-s3'

let warnedAboutViteSecrets = false
let client: S3Client | null = null

/**
 * Cloudflare R2 (S3 호환) 클라이언트.
 *
 * ⚠️ 관리자 전용 빌드 타협: `VITE_*` 환경 변수는 브라우저 번들에 포함됩니다.
 * 운영에서는 Edge Function + Presigned URL 등으로 키를 서버에만 두는 것을 권장합니다.
 *
 * `.env` 예시 (기존 `R2_*`만 있으면 동일 값을 `VITE_R2_*`로 복사):
 *   VITE_R2_ACCESS_KEY_ID=...
 *   VITE_R2_SECRET_ACCESS_KEY=...
 *   VITE_R2_ENDPOINT=https://....r2.cloudflarestorage.com
 *   VITE_R2_PUBLIC_URL=https://pub-....r2.dev
 */
export function getR2S3Client(): S3Client {
  if (import.meta.env.DEV && !warnedAboutViteSecrets) {
    warnedAboutViteSecrets = true
    console.warn(
      '[GELIA] R2 키는 VITE_ 접두사로 클라이언트에 노출됩니다. ' +
        '`.env`에 `VITE_R2_ACCESS_KEY_ID`, `VITE_R2_SECRET_ACCESS_KEY`, `VITE_R2_ENDPOINT`를 설정하세요.',
    )
  }

  if (client) return client

  const accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID ?? ''
  const secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY ?? ''
  const endpoint = import.meta.env.VITE_R2_ENDPOINT ?? ''

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error(
      'R2 설정이 없습니다. .env에 VITE_R2_ACCESS_KEY_ID, VITE_R2_SECRET_ACCESS_KEY, VITE_R2_ENDPOINT를 추가하세요. (기존 R2_* 값을 VITE_R2_* 로 복사)',
    )
  }

  client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  })

  return client
}
