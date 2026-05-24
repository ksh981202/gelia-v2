import { useLanguageContext } from '@/contexts/LanguageContext'

export default function BrandPickTab() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'

  return (
    <section className="mt-8 rounded-3xl border border-gray-100 bg-white px-5 py-12 text-center shadow-sm">
      <p className="text-sm font-semibold text-gray-500">
        {isEnglish ? 'Brand pick coming soon' : '브랜드 픽 준비중'}
      </p>
    </section>
  )
}
