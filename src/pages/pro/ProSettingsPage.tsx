import { fetchProShopByUserId, updateProShop } from '@/features/pro/api/proShopApi'
import { supabase } from '@/shared/api/supabaseClient'
import { Loader2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

const INPUT_CLASS =
  'w-full rounded-xl border border-stone-200 bg-[#FFFCF8] px-4 py-3 text-sm text-stone-800 outline-none transition-colors focus:border-stone-400 focus:bg-white focus:ring-1 focus:ring-stone-800'

export default function ProSettingsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [shopName, setShopName] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    const loadShopProfile = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError
        const currentUserId = user?.id?.trim()
        if (!currentUserId) {
          throw new Error('로그인이 필요합니다.')
        }

        const shop = await fetchProShopByUserId(currentUserId)
        if (cancelled) return

        if (!shop) {
          throw new Error('등록된 샵 프로필이 없습니다.')
        }

        setUserId(currentUserId)
        setShopName(shop.shop_name)
        setInstagramUrl(shop.instagram_url ?? '')
        setMapUrl(shop.map_url ?? '')
        setFormKey((prev) => prev + 1)
      } catch (error) {
        if (cancelled) return
        const message = error instanceof Error ? error.message : '샵 정보를 불러오지 못했습니다.'
        setErrorMessage(message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadShopProfile()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) return

    setErrorMessage('')
    const form = event.currentTarget
    const formData = new FormData(form)
    const nextShopName = String(formData.get('shop_name') ?? '').trim()
    const nextInstagramUrl = String(formData.get('instagram_url') ?? '')
    const nextMapUrl = String(formData.get('map_url') ?? '')

    if (!nextShopName) {
      setErrorMessage('샵 이름을 입력해 주세요.')
      return
    }

    setIsSaving(true)
    try {
      await updateProShop(userId, {
        shop_name: nextShopName,
        instagram_url: nextInstagramUrl,
        map_url: nextMapUrl,
      })
      setShopName(nextShopName)
      setInstagramUrl(nextInstagramUrl)
      setMapUrl(nextMapUrl)
      window.alert('샵 프로필이 성공적으로 업데이트되었습니다!')
    } catch (error) {
      const message = error instanceof Error ? error.message : '샵 프로필 저장에 실패했습니다.'
      setErrorMessage(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-stone-800">⚙️ 샵 프로필 설정</h1>
      <p className="mt-2 text-sm text-stone-500">고객에게 노출되는 샵 정보를 관리합니다.</p>

      {isLoading ? (
        <div className="mt-6 flex items-center justify-center rounded-2xl border border-stone-100 bg-white p-12 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-stone-400" aria-hidden />
          <span className="ml-2 text-sm text-stone-500">로딩 중...</span>
        </div>
      ) : null}

      {!isLoading && errorMessage && !userId ? (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && userId ? (
        <div className="mt-6 max-w-2xl rounded-2xl border border-stone-100 bg-white p-8 shadow-sm">
          <form key={formKey} className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">
                샵 이름 <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                name="shop_name"
                defaultValue={shopName}
                placeholder="예: 젤리아 네일 스튜디오"
                className={INPUT_CLASS}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">인스타그램 주소</span>
              <input
                type="url"
                name="instagram_url"
                defaultValue={instagramUrl}
                placeholder="https://instagram.com/your_shop"
                className={INPUT_CLASS}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-stone-700">네이버 지도 주소</span>
              <input
                type="url"
                name="map_url"
                defaultValue={mapUrl}
                placeholder="https://map.naver.com/..."
                className={INPUT_CLASS}
              />
            </label>

            {errorMessage ? (
              <p className="text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSaving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  저장 중...
                </>
              ) : (
                '💾 변경 사항 저장'
              )}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
