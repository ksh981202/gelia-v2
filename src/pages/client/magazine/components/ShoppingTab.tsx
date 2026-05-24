import { useLanguageContext } from '@/contexts/LanguageContext'

export default function ShoppingTab() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'

  return (
    <section className="mt-8 rounded-3xl border border-gray-100 bg-white px-5 py-12 text-center shadow-sm">
      <p className="text-sm font-semibold text-gray-500">
        {isEnglish ? 'Shopping coming soon' : '쇼핑 준비중'}
      </p>
    </section>
  )
}
