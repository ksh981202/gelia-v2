import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function QuizPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedLength, setSelectedLength] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  const canProceedStep1 = selectedLength !== null && selectedType !== null
  const canProceedStep2 = selectedMood !== null
  const canProceedStep3 = selectedColor !== null

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-center bg-white px-5">
        <button
          type="button"
          onClick={() =>
            currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate(-1)
          }
          className="absolute left-5 -ml-2 p-2"
          aria-label="뒤로 가기"
        >
          <svg
            className="h-5 w-5 text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-[16px] font-bold text-gray-900">
          {currentStep === 4 ? '진단 결과' : '퍼스널 네일 진단'}
        </h1>
        {currentStep === 4 && (
          <button
            type="button"
            className="absolute right-5 p-2"
            aria-label="공유하기"
          >
            <svg
              className="h-5 w-5 text-gray-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        )}
      </header>

      {currentStep === 0 && (
        <main className="flex flex-1 flex-col items-center px-5 pb-[120px] pt-8">
          <div className="relative mb-10 h-[220px] w-[220px]">
            <div className="absolute right-0 top-0 -z-10 h-[180px] w-[180px] translate-x-4 -translate-y-2 rounded-full bg-[#fdf5f1]" />
            <div className="mx-auto h-[180px] w-[180px] overflow-hidden rounded-full bg-gray-200 shadow-sm">
              <img
                src="https://picsum.photos/400/400?hands"
                alt="네일 예시"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="mb-10 w-full text-center">
            <h2 className="text-[22px] font-bold leading-[1.4] text-gray-900">
              내 손에 어울리는
              <br />
              네일 디자인을 찾아보세요
            </h2>
            <p className="mt-3 break-keep text-[14px] text-gray-500">
              간단한 선택으로 나에게 어울리는
              <br />
              퍼스널 네일을 추천해 드려요
            </p>
          </div>

          <div className="mx-auto w-full max-w-[320px] space-y-4 rounded-[16px] bg-[#fcf8f5] p-6">
            <div className="flex items-center gap-3 text-[14px] font-bold text-gray-800">
              <span className="text-[18px]">✨</span> 딱 3초! 초간단 맞춤 진단
            </div>
            <div className="flex items-center gap-3 text-[14px] font-bold text-gray-800">
              <span className="text-[18px]">💅</span> 내 손 타입/톤 완벽 분석
            </div>
            <div className="flex items-center gap-3 text-[14px] font-bold text-gray-800">
              <span className="text-[18px]">🎨</span> 나만의 트렌드 네일 추천
            </div>
          </div>
        </main>
      )}

      {currentStep === 0 && (
        <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-gradient-to-t from-white via-white/90 to-transparent px-5 pb-5 pt-8">
          <div className="mx-auto w-full max-w-md">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="h-[56px] w-full rounded-xl bg-[#ff765e] text-[16px] font-bold text-white shadow-md shadow-[#ff765e]/20 transition-transform active:scale-95"
            >
              테스트 시작
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 1: 길이 및 타입 선택 (정적 UI) --- */}
      {currentStep === 1 && (
        <main className="flex w-full flex-1 flex-col px-5 pb-[120px] pt-4">
          <div className="mb-8 w-full">
            <div className="mb-2 flex justify-end">
              <span className="text-[12px] font-bold text-[#ff765e]">STEP 1 / 3</span>
            </div>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-1/3 rounded-full bg-[#ff765e]" />
            </div>
          </div>

          <div className="mb-10 w-full">
            <h2 className="text-[18px] font-bold leading-snug text-gray-900">
              손톱 길이를 골라주세요
            </h2>
            <p className="mb-5 mt-1 text-[13px] text-gray-500">
              가장 가까운 스타일을 선택하면 돼요.
            </p>

            <div className="grid w-full grid-cols-3 gap-3">
              {[
                {
                  id: 'short',
                  name: '짧은 손톱',
                  img: 'https://picsum.photos/200/200?random=1',
                },
                {
                  id: 'medium',
                  name: '중간 길이',
                  img: 'https://picsum.photos/200/200?random=2',
                },
                {
                  id: 'long',
                  name: '긴 손톱',
                  img: 'https://picsum.photos/200/200?random=3',
                },
              ].map((item) => {
                const isSelected = selectedLength === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedLength(item.id)}
                    className="flex w-full flex-col items-center"
                  >
                    <div
                      className={`mb-2 aspect-square w-full overflow-hidden rounded-xl bg-gray-100 ring-inset ${
                        isSelected
                          ? 'ring-2 ring-[#ff765e]'
                          : 'ring-1 ring-gray-100'
                      }`}
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span
                      className={`text-[13px] font-medium ${
                        isSelected ? 'text-[#ff765e]' : 'text-gray-700'
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-10 w-full">
            <h2 className="text-[18px] font-bold leading-snug text-gray-900">
              손 타입은 어떤가요?
            </h2>
            <p className="mb-5 mt-1 text-[13px] text-gray-500">
              가장 가까운 타입을 하나만 선택해 주세요.
            </p>

            <div className="flex w-full flex-col gap-3">
              {[
                { id: 'short_finger', icon: '🌷', name: '손가락이 짧은 편' },
                { id: 'long_finger', icon: '🦢', name: '손가락이 긴 편' },
                { id: 'chubby', icon: '☁️', name: '손이 통통한 편' },
                { id: 'skinny', icon: '💅', name: '손이 마른 편' },
              ].map((item) => {
                const isSelected = selectedType === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedType(item.id)}
                    className={`flex h-[52px] w-full items-center rounded-2xl border px-4 ${
                      isSelected
                        ? 'border-2 border-[#ff765e] bg-[#fff5f4]'
                        : 'border border-gray-200 bg-white'
                    }`}
                  >
                    <span className="mr-3 text-[16px]">{item.icon}</span>
                    <span
                      className={`text-[14px] font-medium ${
                        isSelected ? 'text-[#ff765e]' : 'text-gray-800'
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </main>
      )}

      {currentStep === 1 && (
        <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-gradient-to-t from-white via-white/90 to-transparent px-5 pb-5 pt-8">
          <div className="mx-auto w-full max-w-md">
            <button
              type="button"
              disabled={!canProceedStep1}
              onClick={() => setCurrentStep(2)}
              className={`h-[56px] w-full rounded-xl text-[16px] font-bold text-white ${
                canProceedStep1
                  ? 'bg-[#ff765e] transition-transform active:scale-95'
                  : 'cursor-not-allowed bg-[#ffd1c8]'
              }`}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 2: 무드 선택 (정적 UI) --- */}
      {currentStep === 2 && (
        <main className="flex w-full flex-1 flex-col px-5 pb-[120px] pt-4">
          <div className="mb-8 w-full">
            <div className="mb-2 flex justify-end">
              <span className="text-[12px] font-bold text-[#ff765e]">STEP 2 / 3</span>
            </div>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-2/3 rounded-full bg-[#ff765e]" />
            </div>
          </div>

          <div className="mb-8 w-full">
            <h2 className="text-[18px] font-bold leading-snug text-gray-900">
              어떤 무드가 가장 끌려요?
            </h2>
            <p className="mt-1 text-[13px] text-gray-500">
              내 취향에 가장 가까운 무드를 하나 골라주세요.
            </p>
          </div>

          <div className="mb-10 grid w-full grid-cols-2 gap-3">
            {[
              {
                id: 'simple',
                name: '심플·깔끔',
                img: 'https://picsum.photos/300/400?random=4',
              },
              {
                id: 'pure',
                name: '여리여리·청순',
                img: 'https://picsum.photos/300/400?random=5',
              },
              {
                id: 'cute',
                name: '귀엽고 사랑스러운',
                img: 'https://picsum.photos/300/400?random=6',
              },
              {
                id: 'elegant',
                name: '우아·고급스러운',
                img: 'https://picsum.photos/300/400?random=7',
              },
              {
                id: 'glam',
                name: '화려한·블링블링',
                img: 'https://picsum.photos/300/400?random=8',
              },
              {
                id: 'unique',
                name: '유니크·힙한',
                img: 'https://picsum.photos/300/400?random=9',
              },
            ].map((item) => {
              const isSelected = selectedMood === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedMood(item.id)}
                  className={`relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-gray-100 ring-inset ${
                    isSelected
                      ? 'ring-2 ring-[#ff765e]'
                      : 'ring-1 ring-black/5'
                  }`}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="pointer-events-none absolute bottom-4 left-4 z-10 text-[14px] font-bold text-white">
                    {item.name}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="w-full rounded-[16px] bg-[#fffaf5] p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[16px]">💡</span>
              <span className="text-[13px] font-bold text-[#ff765e]">
                수석 큐레이터의 무드 팁
              </span>
            </div>
            <p className="break-keep text-[13px] leading-relaxed text-gray-700">
              평소 즐겨 입는 옷이나 자주 바르는 립스틱 색상을 떠올려보세요. 나와
              가장 친숙하고 편안한 무드가 손끝에도 잘 어울려요.
            </p>
          </div>
        </main>
      )}

      {currentStep === 2 && (
        <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-gradient-to-t from-white via-white/90 to-transparent px-5 pb-5 pt-8">
          <div className="mx-auto w-full max-w-md">
            <button
              type="button"
              disabled={!canProceedStep2}
              onClick={() => setCurrentStep(3)}
              className={`h-[56px] w-full rounded-xl text-[16px] font-bold text-white ${
                canProceedStep2
                  ? 'bg-[#ff765e] transition-transform active:scale-95'
                  : 'cursor-not-allowed bg-[#ffd1c8]'
              }`}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 3: 컬러 선택 (정적 UI - 레이아웃 절대 방어벽) --- */}
      {currentStep === 3 && (
        <main className="flex flex-1 w-full flex-col px-5 pb-[120px] pt-4">
          <div className="mb-8 w-full">
            <div className="mb-2 flex justify-end">
              <span className="text-[12px] font-bold text-[#ff765e]">STEP 3 / 3</span>
            </div>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-full rounded-full bg-[#ff765e]" />
            </div>
          </div>

          <div className="mb-8 w-full">
            <h2 className="text-[24px] font-bold text-gray-900 leading-snug">
              좋아하는 컬러를
              <br />
              선택하세요
            </h2>
            <p className="text-[15px] text-gray-500 mt-2">
              가장 끌리는 네일 컬러 칩을 골라주세요.
            </p>
          </div>

          <div className="mb-10 grid w-full grid-cols-2 gap-x-4 gap-y-8">
            {[
              {
                id: 'pink',
                name: '핑크',
                desc: '#여리여리 #러블리',
                tag: '쿨톤 추천',
                icon: '🎀',
                img: 'https://picsum.photos/200/200?random=10',
              },
              {
                id: 'nude',
                name: '누드/베이지',
                desc: '#차분함 #오피스',
                tag: '웜톤 추천',
                icon: '☀️',
                img: 'https://picsum.photos/200/200?random=11',
              },
              {
                id: 'red',
                name: '레드/버건디',
                desc: '#강렬함 #섹시 #포인트',
                tag: '매혹적인 포인트',
                icon: '🍓',
                img: 'https://picsum.photos/200/200?random=12',
              },
              {
                id: 'black',
                name: '블랙/다크',
                desc: '#시크 #도도 #걸크러쉬',
                tag: '시크한 매력',
                icon: '🖤',
                img: 'https://picsum.photos/200/200?random=13',
              },
              {
                id: 'pastel',
                name: '파스텔',
                desc: '#몽환적 #유니크',
                tag: '쿨톤 추천',
                icon: '🎀',
                img: 'https://picsum.photos/200/200?random=14',
              },
              {
                id: 'glitter',
                name: '글리터',
                desc: '#영롱 #반짝반짝 #시선집중',
                tag: '화려함 끝판왕',
                icon: '💎',
                img: 'https://picsum.photos/200/200?random=15',
              },
            ].map((item) => {
              const isSelected = selectedColor === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedColor(item.id)}
                  className="flex w-full flex-col items-center"
                >
                <div className="relative w-[128px] h-[128px] flex items-center justify-center flex-shrink-0">
                  <div className="w-[120px] h-[120px] rounded-full bg-gray-100 shadow-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-full border-[3px] ${
                      isSelected ? 'border-[#ff765e]' : 'border-transparent'
                    }`}
                  />
                </div>

                <div className="mt-3 flex flex-col items-center text-center">
                  <div className="flex items-center gap-1 mb-2 bg-gray-50 px-3 py-1.5 rounded-md">
                    <span className="text-[16px]">{item.icon}</span>
                    <span
                      className={`text-[12px] font-bold ${
                        isSelected ? 'text-[#ff765e]' : 'text-gray-500'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p
                    className={`text-[18px] font-bold ${
                      isSelected ? 'text-[#ff765e]' : 'text-gray-900'
                    }`}
                  >
                    {item.name}
                  </p>
                  <p className="text-[13px] text-gray-400 mt-1">{item.desc}</p>
                </div>
                </button>
              )
            })}
          </div>

          <div className="w-full rounded-[16px] bg-[#fffaf5] p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[18px]">💡</span>
              <span className="text-[14px] font-bold text-[#ff765e]">
                수석 큐레이터의 컬러 팁
              </span>
            </div>
            <p className="break-keep text-[14px] leading-relaxed text-gray-700">
              평소 즐겨 입는 옷이나 자주 바르는 립스틱 색상을 떠올려보세요. 나와
              가장 친숙하고 편안한 컬러가 손끝에도 잘 어울려요.
            </p>
          </div>
        </main>
      )}

      {currentStep === 3 && (
        <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-gradient-to-t from-white via-white/90 to-transparent px-5 pb-5 pt-8">
          <div className="mx-auto w-full max-w-md">
            <button
              type="button"
              disabled={!canProceedStep3}
              onClick={() => setCurrentStep(4)}
              className={`h-[56px] w-full rounded-xl text-[16px] font-bold text-white ${
                canProceedStep3
                  ? 'bg-[#ff765e] transition-transform active:scale-95'
                  : 'cursor-not-allowed bg-[#ffd1c8]'
              }`}
            >
              결과 보기
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 4: 진단 결과 (정적 UI) --- */}
      {currentStep === 4 && (
        <main className="flex w-full flex-1 flex-col bg-white px-5 pb-[120px] pt-8">
          <div className="mb-8 flex w-full flex-col items-center">
            <h2 className="mb-3 text-[22px] font-bold text-gray-900">
              당신에게 어울리는 네일
            </h2>
            <div className="flex items-center gap-1.5 rounded-full bg-[#fff5f4] px-4 py-1.5">
              <span className="text-[14px]">🖤</span>
              <span className="text-[14px] font-bold text-[#ff765e]">
                {selectedColor} & {selectedMood} Vibe
              </span>
            </div>
          </div>

          <div className="mb-10 w-full rounded-[16px] border border-[#ffefeb] bg-[#fffbfb] p-5">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="text-[16px]">💡</span>
              <span className="text-[14px] font-bold text-[#ff765e]">추천 이유</span>
            </div>
            <p className="break-keep text-[14px] leading-[1.6] text-gray-700">
              세련되고 도회적인 무드를 살리는 스타일이 가장 잘 어울려요. 깔끔한
              라인과 대비감 있는 컬러를 활용하면 손끝에 또렷한 존재감과 분위기를
              줄 수 있습니다.
            </p>
          </div>

          <div className="mb-12 grid w-full grid-cols-2 gap-x-3 gap-y-8">
            {[
              {
                id: 1,
                name: '유니크 실버 리본',
                img: 'https://picsum.photos/300/400?random=20',
              },
              {
                id: 2,
                name: '시크 블랙 드로잉',
                img: 'https://picsum.photos/300/400?random=21',
              },
              {
                id: 3,
                name: '피치 무광 자개',
                img: 'https://picsum.photos/300/400?random=22',
              },
              {
                id: 4,
                name: '라벤더 미러 체인',
                img: 'https://picsum.photos/300/400?random=23',
              },
            ].map((item) => (
              <div key={item.id} className="flex w-full flex-col">
                <div className="mb-3 aspect-[3/4] w-full overflow-hidden rounded-[16px] bg-gray-100">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-center text-[14px] font-medium text-gray-800">
                  {item.name}
                </span>
              </div>
            ))}
          </div>

          <div className="mb-10 w-full">
            <h3 className="mb-4 text-[18px] font-bold text-gray-900">
              이런 스타일은 어때요?
            </h3>
            <div className="grid w-full grid-cols-3 gap-2">
              {[
                {
                  id: 1,
                  name: '카키 마그넷 자개',
                  img: 'https://picsum.photos/200/250?random=24',
                },
                {
                  id: 2,
                  name: '핑크 옴브레 체인',
                  img: 'https://picsum.photos/200/250?random=25',
                },
                {
                  id: 3,
                  name: '투명 무광 라인테이프',
                  img: 'https://picsum.photos/200/250?random=26',
                },
              ].map((item) => (
                <div key={item.id} className="flex w-full flex-col">
                  <div className="mb-2 aspect-[4/5] w-full overflow-hidden rounded-[12px] bg-gray-100">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="break-keep text-center text-[11px] tracking-tight text-gray-600">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {currentStep === 4 && (
        <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-gradient-to-t from-white via-white/90 to-transparent px-5 pb-5 pt-8">
          <div className="mx-auto w-full max-w-md">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(0)
                setSelectedLength(null)
                setSelectedType(null)
                setSelectedMood(null)
                setSelectedColor(null)
              }}
              className="h-[56px] w-full rounded-xl bg-gray-900 text-[16px] font-bold text-white shadow-md transition-transform active:scale-95"
            >
              테스트 다시하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
