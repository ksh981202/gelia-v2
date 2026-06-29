import { createProShop } from '@/features/pro/api/proShopApi'
import { Loader2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

const ONBOARDING_STORAGE_KEYS = {
  shopName: 'gelia_pro_shop_name',
  instagramUrl: 'gelia_pro_shop_insta',
  mapUrl: 'gelia_pro_shop_map',
} as const

function readOnboardingDraft(key: string): string {
  try {
    return sessionStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

function clearOnboardingDraft(): void {
  try {
    Object.values(ONBOARDING_STORAGE_KEYS).forEach((key) => sessionStorage.removeItem(key))
  } catch {
    // sessionStorage unavailable (e.g. private mode)
  }
}

type ProOnboardingPageProps = {
  onCompleted: () => void
}

export default function ProOnboardingPage({ onCompleted }: ProOnboardingPageProps) {
  const [shopName, setShopName] = useState(
    () => readOnboardingDraft(ONBOARDING_STORAGE_KEYS.shopName) || '',
  )
  const [instagramUrl, setInstagramUrl] = useState(
    () => readOnboardingDraft(ONBOARDING_STORAGE_KEYS.instagramUrl) || '',
  )
  const [mapUrl, setMapUrl] = useState(
    () => readOnboardingDraft(ONBOARDING_STORAGE_KEYS.mapUrl) || '',
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // 리마운트 시 입력 드래프트 복구 (제출 성공 시 clearOnboardingDraft)
  useEffect(() => {
    try {
      sessionStorage.setItem(ONBOARDING_STORAGE_KEYS.shopName, shopName)
      sessionStorage.setItem(ONBOARDING_STORAGE_KEYS.instagramUrl, instagramUrl)
      sessionStorage.setItem(ONBOARDING_STORAGE_KEYS.mapUrl, mapUrl)
    } catch {
      // sessionStorage unavailable (e.g. private mode)
    }
  }, [shopName, instagramUrl, mapUrl])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    const trimmedName = shopName.trim()
    if (!trimmedName) {
      setErrorMessage('샵 이름을 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      await createProShop({
        shopName: trimmedName,
        instagramUrl: instagramUrl,
        mapUrl: mapUrl,
      })
      clearOnboardingDraft()
      onCompleted()
    } catch (error) {
      const message = error instanceof Error ? error.message : '샵 정보 저장에 실패했습니다.'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-stone-100 bg-white p-10 shadow-lg">
        <p className="text-xs font-semibold tracking-[0.28em] text-stone-400">GELIA PRO ONBOARDING</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-800">
          환영합니다! 샵 정보를 입력하고
          <br />
          젤리아 PRO를 시작하세요.
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          기존 젤리아 계정이 PRO로 연동됩니다. 샵 이름만 필수이며, 나머지는 나중에 수정할 수
          있습니다.
        </p>

        <form className="mt-8 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">
              샵 이름 <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={shopName}
              onChange={(event) => setShopName(event.target.value)}
              placeholder="예: 젤리아 네일 스튜디오"
              className="w-full rounded-xl border border-stone-200 bg-[#FFFCF8] px-4 py-3 text-sm text-stone-800 outline-none transition-colors focus:border-stone-400 focus:bg-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">인스타그램 주소</span>
            <input
              type="url"
              value={instagramUrl}
              onChange={(event) => setInstagramUrl(event.target.value)}
              placeholder="https://instagram.com/your_shop"
              className="w-full rounded-xl border border-stone-200 bg-[#FFFCF8] px-4 py-3 text-sm text-stone-800 outline-none transition-colors focus:border-stone-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">네이버 지도 주소</span>
            <input
              type="url"
              value={mapUrl}
              onChange={(event) => setMapUrl(event.target.value)}
              placeholder="https://map.naver.com/..."
              className="w-full rounded-xl border border-stone-200 bg-[#FFFCF8] px-4 py-3 text-sm text-stone-800 outline-none transition-colors focus:border-stone-400 focus:bg-white"
            />
          </label>

          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#5C4A3A] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                등록 중...
              </>
            ) : (
              'GELIA PRO 시작하기'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
