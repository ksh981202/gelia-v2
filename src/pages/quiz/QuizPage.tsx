import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../features/quiz-logic/useQuizStore';
import { ChevronLeft } from 'lucide-react';

export default function QuizPage() {
  const navigate = useNavigate();
  const { currentStep, nextStep, setAnswer } = useQuizStore();

  const [selectedLength, setSelectedLength] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // --------------------------------------------------------
  // STEP 0: 진단 인트로 화면
  // --------------------------------------------------------
  if (currentStep === 0) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
        <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-center bg-white px-5 border-b border-gray-100">
          <button onClick={() => navigate(-1)} className="absolute left-5 p-1 text-gray-700">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-[16px] font-bold text-gray-900 tracking-tight">퍼스널 네일 진단</h1>
        </header>

        <main className="flex flex-1 flex-col items-center px-6 pt-10 pb-32 text-center">
          <div className="relative mb-10 h-[240px] w-[240px]">
            <div className="absolute -right-2 -top-2 h-[200px] w-[200px] rounded-full bg-[#f8efe8] opacity-80" />
            <div className="relative z-10 h-[210px] w-[210px] overflow-hidden rounded-full border-[5px] border-white shadow-md bg-gray-100 mx-auto mt-4">
              <img src="/diagnosis/intro-main.jpg" onError={(e) => { e.currentTarget.src = "https://picsum.photos/400/400?blur=2" }} alt="네일 진단" className="h-full w-full object-cover" />
            </div>
          </div>

          <h2 className="text-[22px] font-extrabold leading-[1.35] tracking-tight text-gray-900">
            내 손에 어울리는<br />네일 디자인을 찾아보세요
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed tracking-tight text-gray-500 break-keep">
            간단한 선택으로 나에게 어울리는<br />퍼스널 네일을 추천해 드려요
          </p>

          <div className="mt-8 flex w-full max-w-[280px] flex-col gap-3 rounded-2xl bg-[#fef8f4] px-6 py-6 border border-orange-50">
            <div className="flex items-center gap-3 text-[14px] font-bold text-gray-800 tracking-tight">
              <span className="text-[18px]">✨</span> 딱 3초! 초간단 맞춤 진단
            </div>
            <div className="flex items-center gap-3 text-[14px] font-bold text-gray-800 tracking-tight">
              <span className="text-[18px]">💅</span> 내 손 타입/톤 완벽 분석
            </div>
            <div className="flex items-center gap-3 text-[14px] font-bold text-gray-800 tracking-tight">
              <span className="text-[18px]">🎨</span> 나만의 트렌드 네일 추천
            </div>
          </div>
        </main>

        <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-white px-5 pb-safe pt-2 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
          <div className="mx-auto w-full max-w-md pb-4">
            <button
              onClick={nextStep}
              className="h-[56px] w-full rounded-xl bg-[#ff765e] text-[16px] font-bold text-white shadow-lg shadow-[#ff765e]/30 transition-transform active:scale-95"
            >
              테스트 시작
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // STEP 1: 손톱 길이 및 손 타입 선택
  // --------------------------------------------------------
  if (currentStep === 1) {
    const LENGTHS = [
      { id: 'short', label: '짧은 손톱', img: '/diagnosis/length-short.jpg' },
      { id: 'medium', label: '중간 길이', img: '/diagnosis/length-medium.jpg' },
      { id: 'long', label: '긴 손톱', img: '/diagnosis/length-long.jpg' },
    ];
    const TYPES = [
      { id: 'type1', label: '🌷 손가락이 짧은 편' },
      { id: 'type2', label: '🦢 손가락이 긴 편' },
      { id: 'type3', label: '☁️ 손이 통통한 편' },
      { id: 'type4', label: '💅 손이 마른 편' },
    ];

    const handleNextStep1 = () => {
      setAnswer(1, JSON.stringify({ length: selectedLength, type: selectedType }));
      nextStep();
    };

    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white pb-32">
        <header className="sticky top-0 z-50 flex flex-col w-full bg-white">
          <div className="flex h-14 items-center justify-center px-5">
            <button onClick={() => navigate(-1)} className="absolute left-5 p-1 text-gray-700">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-[16px] font-bold text-gray-900 tracking-tight">퍼스널 네일 진단</h1>
          </div>
          <div className="px-5 pb-3">
            <div className="mb-2 flex justify-end">
              <span className="text-[12px] font-bold text-[#ff765e]">STEP 1 / 3</span>
            </div>
            <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-[#ff765e] transition-all" />
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col px-6 pt-6">
          <h2 className="text-[18px] font-bold text-gray-900 tracking-tight mb-1">손톱 길이를 골라주세요</h2>
          <p className="text-[13px] text-gray-500 mb-5">가장 가까운 스타일을 선택하면 돼요.</p>

          <div className="grid grid-cols-3 gap-3 mb-10">
            {LENGTHS.map((item) => {
              const isActive = selectedLength === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedLength(item.id)}
                  className={`flex flex-col items-center rounded-2xl border-2 overflow-hidden transition-all ${
                    isActive ? 'border-[#ff765e] bg-white' : 'border-transparent bg-gray-50'
                  }`}
                >
                  <div className="w-full aspect-[4/5] bg-gray-200">
                    <img src={item.img} onError={(e) => { e.currentTarget.src = "https://picsum.photos/200/250?blur=2" }} alt={item.label} className="w-full h-full object-cover" />
                  </div>
                  <div className={`py-3 text-[13px] font-bold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.label}
                  </div>
                </button>
              );
            })}
          </div>

          <h2 className="text-[18px] font-bold text-gray-900 tracking-tight mb-1">손 타입은 어떤가요?</h2>
          <p className="text-[13px] text-gray-500 mb-5">가장 가까운 타입을 하나만 선택해 주세요.</p>

          <div className="flex flex-col gap-3">
            {TYPES.map((item) => {
              const isActive = selectedType === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedType(item.id)}
                  className={`w-full py-4 px-5 rounded-2xl border transition-all text-left text-[14px] font-bold tracking-tight ${
                    isActive ? 'border-[#ff765e] bg-[#fff5f4] text-[#ff765e]' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </main>

        <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-white px-5 pb-safe pt-2 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
          <div className="mx-auto w-full max-w-md pb-4">
            <button
              onClick={handleNextStep1}
              disabled={!selectedLength || !selectedType}
              className={`h-[56px] w-full rounded-xl text-[16px] font-bold transition-transform active:scale-95 ${
                selectedLength && selectedType
                  ? 'bg-[#ff765e] text-white shadow-lg shadow-[#ff765e]/30'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // STEP 2: 무드 선택
  // --------------------------------------------------------
  if (currentStep === 2) {
    const MOODS = ['심플·깔끔', '여리여리·청순', '귀엽고 사랑스러운', '우아·고급스러운', '화려한·블링블링', '유니크·힙한'];

    const MOOD_TIPS: Record<string, string> = {
      '심플·깔끔': '깔끔한 셔츠나 슬랙스를 즐겨 입는다면, 군더더기 없는 심플 네일이 단정하고 세련된 인상을 완성해 줄 거예요.',
      '여리여리·청순': '파스텔톤 블라우스나 원피스를 좋아하시나요? 은은하게 비치는 시럽 네일이 맑고 청순한 분위기를 극대화해 줍니다.',
      '귀엽고 사랑스러운': '아기자기한 소품이나 캐주얼 룩을 즐긴다면, 귀여운 포인트가 들어간 네일로 일상에 기분 좋은 활력을 더해보세요.',
      '우아·고급스러운': '트위드 자켓이나 격식 있는 자리를 자주 간다면, 진주나 은은한 펄이 더해진 우아한 네일이 완벽한 매치입니다.',
      '화려한·블링블링': '포인트 액세서리나 시선을 사로잡는 룩을 즐긴다면, 빛나는 스톤과 파츠가 완벽한 주인공으로 만들어 줄 거예요.',
      '유니크·힙한': '트렌디한 스트릿 룩이나 나만의 개성을 중시한다면, 메탈이나 감각적인 드로잉이 들어간 힙한 네일로 개성을 뽐내보세요.',
    };

    const handleNextStep2 = () => {
      if (selectedMood) {
        setAnswer(2, selectedMood);
        nextStep();
      }
    };

    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white pb-32">
        <header className="sticky top-0 z-50 flex flex-col w-full bg-white">
          <div className="flex h-14 items-center justify-center px-5">
            <button onClick={() => navigate(-1)} className="absolute left-5 p-1 text-gray-700">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-[16px] font-bold text-gray-900 tracking-tight">퍼스널 네일 진단</h1>
          </div>
          <div className="px-5 pb-3">
            <div className="mb-2 flex justify-end">
              <span className="text-[12px] font-bold text-[#ff765e]">STEP 2 / 3</span>
            </div>
            <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-[#ff765e] transition-all" />
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col px-6 pt-6">
          <h2 className="text-[18px] font-bold text-gray-900 tracking-tight mb-1">어떤 무드가 가장 끌려요?</h2>
          <p className="text-[13px] text-gray-500 mb-6">내 취향에 가장 가까운 무드를 하나 골라주세요.</p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
            {MOODS.map((mood) => {
              const isActive = selectedMood === mood;
              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`relative aspect-square overflow-hidden rounded-2xl text-left transition-all ${
                    isActive ? 'ring-2 ring-[#ff765e] ring-offset-2' : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-300 font-bold text-sm" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                  <span className="absolute bottom-3 left-3 z-10 max-w-[85%] text-[15px] font-bold leading-snug tracking-tight text-white drop-shadow-md">
                    {mood}
                  </span>
                  {isActive && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff765e] text-white shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div
            className="w-full rounded-2xl border border-orange-100 bg-[#fff5f0] p-4 flex flex-col justify-start"
            style={{ height: '120px', minHeight: '120px', flexShrink: 0 }}
          >
            <div className="mb-2 flex items-center gap-1 text-[14px] font-bold tracking-tight text-orange-500 shrink-0">
              <span aria-hidden>💡</span>
              수석 큐레이터의 무드 팁
            </div>
            <p className="break-keep text-[13px] font-medium leading-relaxed tracking-tight text-gray-700 overflow-hidden h-full">
              {selectedMood ? MOOD_TIPS[selectedMood] : '평소 즐겨 입는 옷이나 자주 바르는 립스틱 색상을 떠올려보세요. 나와 가장 친숙하고 편안한 무드가 손끝에도 잘 어울려요.'}
            </p>
          </div>
        </main>

        <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-white px-5 pb-safe pt-2 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
          <div className="mx-auto w-full max-w-md pb-4">
            <button
              onClick={handleNextStep2}
              disabled={!selectedMood}
              className={`h-[56px] w-full rounded-xl text-[16px] font-bold transition-transform active:scale-95 ${
                selectedMood
                  ? 'bg-[#ff765e] text-white shadow-lg shadow-[#ff765e]/30'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // STEP 3: 좋아하는 컬러 선택 (절대 꿀렁거리지 않는 마스터 버전)
  // --------------------------------------------------------
  if (currentStep === 3) {
    const COLOR_OPTIONS = [
      { id: 'pink', src: '/diagnosis/color-pink.png', tone: '🎀 쿨톤 추천', title: '핑크', tags: '#여리여리 #러블리', tip: '여리여리한 핑크는 손끝에 생기를 더해줘요.' },
      { id: 'nude', src: '/diagnosis/color-nude.png', tone: '☀️ 웜톤 추천', title: '누드/베이지', tags: '#차분함 #오피스', tip: '차분한 누드/베이지는 데일리에 안성맞춤이에요.' },
      { id: 'red', src: '/diagnosis/color-red.png', tone: '🍎 매혹적인 포인트', title: '레드/버건디', tags: '#강렬함 #섹시 #포인트', tip: '강렬한 레드는 포인트 네일로 강추예요.' },
      { id: 'black', src: '/diagnosis/color-black.png', tone: '🖤 시크한 매력', title: '블랙/다크', tags: '#시크 #도도 #걸크러쉬', tip: '도도한 블랙은 시크한 무드를 완성해요.' },
      { id: 'pastel', src: '/diagnosis/color-pastel.png', tone: '🎀 쿨톤 추천', title: '파스텔', tags: '#몽환적 #유니크', tip: '파스텔 톤은 부드럽고 유니크한 인상을 줘요.' },
      { id: 'glitter', src: '/diagnosis/color-glitter.png', tone: '💎 화려함 끝판왕', title: '글리터', tags: '#영롱 #반짝반짝 #시선집중', tip: '글리터는 특별한 날 분위기를 한껏 살려줘요.' },
    ];

    const selectedOption = COLOR_OPTIONS.find((c) => c.id === selectedColor);
    const tipText = selectedOption?.tip || '평소 즐겨 입는 옷이나 자주 바르는 립스틱 색상을 떠올려보세요. 나와 가장 친숙하고 편안한 컬러가 손끝에도 잘 어울려요.';

    const handleComplete = () => {
      if (selectedColor) {
        setAnswer(3, selectedColor);
        nextStep();
      }
    };

    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white pb-32">
        <header className="sticky top-0 z-50 flex flex-col w-full bg-white border-b border-gray-100">
          <div className="flex h-14 items-center justify-center px-5">
            <button onClick={() => navigate(-1)} className="absolute left-5 p-1 text-gray-700">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-[16px] font-bold text-gray-900 tracking-tight">퍼스널 네일 진단</h1>
          </div>
          <div className="px-5 pb-3">
            <div className="mb-2 flex justify-end">
              <span className="text-[12px] font-bold text-[#ff765e]">STEP 3 / 3</span>
            </div>
            <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full w-full rounded-full bg-[#ff765e] transition-all" />
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col px-6 pt-6">
          <h2 className="text-[20px] font-bold text-gray-900 tracking-tight mb-1 leading-snug">
            좋아하는 컬러를<br />선택하세요
          </h2>
          <p className="text-[13px] text-gray-500 mb-8">가장 끌리는 네일 컬러 칩을 골라주세요.</p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 mb-8">
            {COLOR_OPTIONS.map((color) => {
              const isSelected = selectedColor === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.id)}
                  className="flex w-full flex-col items-center outline-none"
                >
                  <div
                    className={`relative mx-auto flex h-24 w-24 flex-shrink-0 items-center justify-center bg-transparent mb-3 transition-shadow duration-300 ${
                      isSelected ? 'rounded-full ring-2 ring-[#ff765e] ring-offset-4' : ''
                    }`}
                  >
                    <div
                      className={`h-full w-full rounded-full bg-gray-200 transition-transform duration-300 ${
                        isSelected ? 'scale-105 drop-shadow-lg' : 'drop-shadow-sm hover:-translate-y-1'
                      }`}
                      style={{ backgroundImage: `url(${color.src})`, backgroundSize: 'cover' }}
                    />
                    {isSelected && (
                      <div className="absolute right-0 top-0 z-10 rounded-full bg-[#ff765e] p-1 text-white shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex w-full flex-col items-center text-center justify-start shrink-0" style={{ height: '90px', minHeight: '90px' }}>
                    <p className="mt-2 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600 tracking-tight whitespace-nowrap">
                      {color.tone}
                    </p>
                    <p className="mt-1 text-[16px] font-bold text-gray-900 tracking-tight whitespace-nowrap">
                      {color.title}
                    </p>
                    <p className="mt-0.5 text-[12px] font-medium text-gray-400 tracking-tight whitespace-nowrap">
                      {color.tags}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            className="w-full rounded-2xl border border-orange-100 bg-[#fff5f0] p-4 flex flex-col justify-start shrink-0"
            style={{ height: '130px', minHeight: '130px', flexShrink: 0 }}
          >
            <div className="mb-2 flex items-center gap-1 text-[14px] font-bold tracking-tight text-orange-500 shrink-0">
              <span aria-hidden>💡</span>
              수석 큐레이터의 컬러 팁
            </div>
            <div className="w-full shrink-0" style={{ height: '60px', minHeight: '60px' }}>
              <p className="break-keep text-[13px] font-medium leading-relaxed tracking-tight text-gray-700 overflow-hidden h-full w-full">
                {tipText}
              </p>
            </div>
          </div>
        </main>

        <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-white px-5 pb-safe pt-2 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
          <div className="mx-auto w-full max-w-md pb-4">
            <button
              onClick={handleComplete}
              disabled={!selectedColor}
              className={`h-[56px] w-full rounded-xl text-[16px] font-bold transition-transform active:scale-95 ${
                selectedColor ? 'bg-[#ff765e] text-white shadow-lg shadow-[#ff765e]/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              결과 보기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // STEP 4: 진단 결과 화면 대기
  // --------------------------------------------------------
  return <div className="p-10 text-center text-gray-500">결과 분석 중... (다음 스텝 준비 중)</div>;
}
