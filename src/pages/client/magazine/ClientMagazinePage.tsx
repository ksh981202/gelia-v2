import { useState } from 'react'
import { useLanguageContext } from '@/contexts/LanguageContext'
import ClientGlobalHeader from '@/widgets/layout/ClientGlobalHeader'
import BrandPickTab from './components/BrandPickTab'
import EditorPickTab from './components/EditorPickTab'
import ShoppingTab from './components/ShoppingTab'

type MagazineTab = 'editor' | 'brand' | 'shopping'

const MAGAZINE_TABS: Array<{
  id: MagazineTab
  labelKo: string
  labelEn: string
}> = [
  {
    id: 'editor',
    labelKo: '에디터 픽',
    labelEn: "Editor's Pick",
  },
  {
    id: 'brand',
    labelKo: '브랜드 픽',
    labelEn: 'Brand Pick',
  },
  {
    id: 'shopping',
    labelKo: '쇼핑',
    labelEn: 'Shopping',
  },
]

export default function ClientMagazinePage() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const [activeTab, setActiveTab] = useState<MagazineTab>('editor')

  return (
    <>
    <ClientGlobalHeader showBackButton={true} />

    <div className="mx-auto min-h-screen w-full max-w-6xl bg-background px-5 py-8 md:px-8">
      <h1 className="mb-8 text-center font-['Playfair_Display',_serif] text-[32px] font-extrabold tracking-wide text-stone-900 md:text-[36px]">
        GELIA Magazine
      </h1>

      <div className="mx-auto mt-6 grid max-w-md grid-cols-3 rounded-full bg-gray-100 p-1">
        {MAGAZINE_TABS.map((tab) => {
          const isActive = tab.id === activeTab

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'h-10 rounded-full px-2 text-[13px] font-semibold transition-colors',
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {isEnglish ? tab.labelEn : tab.labelKo}
            </button>
          )
        })}
      </div>

      {activeTab === 'editor' ? <EditorPickTab /> : null}
      {activeTab === 'brand' ? <BrandPickTab /> : null}
      {activeTab === 'shopping' ? <ShoppingTab /> : null}
    </div>
    </>
  )
}
