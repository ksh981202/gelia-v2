import { useLanguageContext } from '@/contexts/LanguageContext'
import { SeoHead } from '@/shared/ui/SeoHead'
import { supabase } from '@/shared/api/supabaseClient'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const montserratStyle = { fontFamily: "'Montserrat', sans-serif" } as const

function useAboutEditorialImages() {
  return useQuery({
    queryKey: ['about-editorial-images', 'popularity-top3'],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nail_designs')
        .select('id, image_url, title')
        .not('image_url', 'is', null)
        .order('popularity', { ascending: false })
        .order('id', { ascending: false })
        .limit(3)

      if (error) throw error
      return (data ?? [])
        .map((row) => String(row.image_url ?? '').trim())
        .filter(Boolean)
    },
  })
}

function FramedEditorialImage({
  src,
  alt,
  orderClass,
}: {
  src: string | undefined
  alt: string
  orderClass: string
}) {
  return (
    <div
      className={`relative z-10 h-[350px] rounded-2xl border border-stone-100 bg-white p-2 shadow-2xl shadow-stone-200/50 transition-transform duration-700 hover:scale-[1.02] md:h-[500px] ${orderClass}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full rounded-xl object-cover grayscale-[10%]"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : null}
    </div>
  )
}

export default function ClientAboutPage() {
  const { language } = useLanguageContext()
  const isEnglish = language === 'en'
  const navigate = useNavigate()
  const { data: images = [] } = useAboutEditorialImages()

  return (
    <div className="w-full overflow-hidden bg-white pb-6 font-sans text-stone-900 selection:bg-stone-200 md:pb-16">
      <SeoHead
        title={isEnglish ? 'About GELIA | GELIA' : '젤리아 소개 | GELIA'}
        description="하이엔드 네일 아트의 새로운 기준. 수천 개의 영감이 당신의 손끝에서 조용히 완성되기를 기다립니다."
        canonical="/about"
      />

      <header className="fixed top-0 left-0 right-0 z-50 mx-auto flex h-14 w-full max-w-md items-center border-b border-gray-100 bg-white px-4 md:static md:mb-6 md:max-w-full md:border-b-0 md:bg-transparent md:px-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-800 transition-colors hover:bg-gray-50"
          aria-label={isEnglish ? 'Go back' : '뒤로 가기'}
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <h1 className="min-w-0 flex-1 text-center text-[17px] font-bold text-gray-900 pr-10">
          {isEnglish ? 'About GELIA' : '젤리아 소개'}
        </h1>
      </header>

      {/* 1. Header Area */}
      <div className="mx-auto max-w-4xl break-keep px-6 pb-6 pt-[72px] text-center md:pb-12 md:pt-24">
        <h1
          className="mb-8 text-4xl font-normal leading-tight tracking-tight text-stone-800 md:text-6xl"
          style={montserratStyle}
        >
          The Art of
          <br />
          Nail Curation
        </h1>
        <p className="mx-auto max-w-xl text-base font-normal leading-relaxed text-gray-700">
          {isEnglish ? (
            <>
              The new standard of high-end nail art.
              <br className="hidden md:block" />
              Thousands of inspirations silently await at your fingertips.
            </>
          ) : (
            <>
              하이엔드 네일 아트의 새로운 기준.
              <br className="hidden md:block" />
              수천 개의 영감이 당신의 손끝에서 조용히 완성되기를 기다립니다.
            </>
          )}
        </p>
      </div>

      <hr className="mx-auto my-8 max-w-5xl border-stone-200 md:mb-24 md:mt-12" />

      {/* 2. Philosophy 01 — mobile: image → text */}
      <div className="mx-auto mb-12 max-w-5xl px-6 md:mb-32">
        <div className="grid grid-cols-1 items-center gap-8 break-keep md:grid-cols-2 md:gap-20">
          <FramedEditorialImage
            src={images[0]}
            alt="Tech meets Aesthetics"
            orderClass="order-2 md:order-1"
          />
          <div className="relative order-1 md:order-2 md:pl-10">
            <span className="absolute -top-20 -left-2 z-0 hidden select-none text-[6rem] leading-none tracking-tighter text-stone-100 opacity-60 md:block md:-top-12 md:-left-4 md:text-[9rem]">
              01
            </span>
            <div className="relative z-10 pt-16 md:pt-4">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-stone-400">
                — Technology & Art
              </p>
              <h2
                className="mb-8 text-2xl font-light tracking-tight text-stone-800 md:text-4xl"
                style={montserratStyle}
              >
                Tech meets Aesthetics
              </h2>
              <div className="border-l border-stone-300 py-2 pl-6">
                <p className="text-base font-normal leading-relaxed text-gray-700">
                  {isEnglish
                    ? 'Every GELIA design begins with the boundless imagination of AI and is refined through the strict aesthetic standards of professional beauty curators. From vast amounts of data, we curate only the most exquisite and trendy designs for you.'
                    : 'GELIA의 모든 디자인은 AI의 무한한 상상력에서 출발하여, 하이엔드 뷰티 큐레이터의 엄격한 시선으로 정제됩니다. 수만 개의 데이터 속에서 오직 가장 아름답고 트렌디한 감각만을 선별하여 당신의 손끝에 제안합니다.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Philosophy 02 — mobile: image → text / desktop: text ← image */}
      <div className="mx-auto mb-12 max-w-5xl px-6 md:mb-32">
        <div className="grid grid-cols-1 items-center gap-8 break-keep md:grid-cols-2 md:gap-20">
          <FramedEditorialImage
            src={images[1]}
            alt="Narrative of Mood"
            orderClass="order-2 md:order-2"
          />
          <div className="relative order-1 text-left md:order-1 md:pr-10 md:text-right">
            <span className="absolute -top-20 -right-2 z-0 hidden select-none text-[6rem] leading-none tracking-tighter text-stone-100 opacity-60 md:block md:-top-12 md:-right-4 md:text-[9rem]">
              02
            </span>
            <div className="relative z-10 flex flex-col pt-16 md:items-end md:pt-4">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-stone-400">
                — Personal Style
              </p>
              <h2
                className="mb-8 text-2xl font-light tracking-tight text-stone-800 md:text-4xl"
                style={montserratStyle}
              >
                Narrative of Mood
              </h2>
              <div className="border-l border-stone-300 py-2 pl-6 md:border-l-0 md:border-r md:pl-0 md:pr-6">
                <p className="text-base font-normal leading-relaxed text-gray-700">
                  {isEnglish
                    ? "We perceive nail art not merely as coloring, but as a definitive fashion statement expressing your personal taste and the season's mood. Complete your unrivaled aura through subtle variations in shape, texture, and color."
                    : '우리는 네일을 단순한 컬러링이 아닌, 개인의 취향과 계절의 무드를 표현하는 하나의 패션 아이템으로 바라봅니다. 쉐입, 텍스처, 컬러의 미세한 변주를 통해 당신만의 독보적인 분위기를 완성하세요.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Philosophy 03 — mobile: image → text */}
      <div className="mx-auto mb-12 max-w-5xl px-6 md:mb-32">
        <div className="grid grid-cols-1 items-center gap-8 break-keep md:grid-cols-2 md:gap-20">
          <FramedEditorialImage
            src={images[2]}
            alt="Inspiration to Reality"
            orderClass="order-2 md:order-1"
          />
          <div className="relative order-1 md:order-2 md:pl-10">
            <span className="absolute -top-20 -left-2 z-0 hidden select-none text-[6rem] leading-none tracking-tighter text-stone-100 opacity-60 md:block md:-top-12 md:-left-4 md:text-[9rem]">
              03
            </span>
            <div className="relative z-10 pt-16 md:pt-4">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-stone-400">
                — Professional Guide
              </p>
              <h2
                className="mb-8 text-2xl font-light tracking-tight text-stone-800 md:text-4xl"
                style={montserratStyle}
              >
                Inspiration to Reality
              </h2>
              <div className="border-l border-stone-300 py-2 pl-6">
                <p className="text-base font-normal leading-relaxed text-gray-700">
                  {isEnglish
                    ? 'Beyond visually striking art, we meticulously consider the details applicable in actual salons. We provide a new benchmark for beauty references and practical styling guides to satisfy both professional nail artists and clients.'
                    : '눈으로 보기에만 아름다운 아트를 넘어, 실제 살롱에서 구현 가능한 디테일을 고민합니다. 네일 원장님과 고객 모두가 만족할 수 있도록, 뷰티 레퍼런스의 새로운 기준과 실무적인 스타일링 가이드를 제공합니다.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="mx-auto mb-8 mt-6 max-w-5xl border-stone-200 md:mb-16 md:mt-12" />

      {/* 5. Contact */}
      <div className="mx-auto mb-4 max-w-4xl break-keep px-6 pb-2 text-center md:mb-8 md:pb-4">
        <h3
          className="mb-4 text-base font-light text-stone-800 md:text-2xl"
          style={montserratStyle}
        >
          Contact GELIA
        </h3>
        <p className="mb-10 text-base font-normal leading-relaxed text-gray-700">
          {isEnglish
            ? 'The new standard of high-end nail art, GELIA. If you have any inquiries regarding our service, please feel free to reach out to us at any time.'
            : '하이엔드 네일 아트의 새로운 기준, GELIA. 서비스 이용 중 궁금하신 내용은 언제든 하단 연락처로 편하게 연락주세요.'}
        </p>
        <a
          href="mailto:k981202@naver.com"
          className="mb-8 inline-block border-b border-stone-900 pb-1 text-base font-normal text-stone-800 transition-all hover:border-stone-400 hover:text-stone-400 md:mb-12 md:text-xl"
          style={montserratStyle}
        >
          k981202@naver.com
        </a>
      </div>
    </div>
  )
}
