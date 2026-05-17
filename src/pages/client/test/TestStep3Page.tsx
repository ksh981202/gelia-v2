import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const COLOR_OPTIONS = [
  { id: 'pink', title: '핑크', tone: '🎀 쿨톤 추천', tags: '#여리여리 #러블리', src: '/color/color-pink.png' },
  { id: 'nude', title: '누드/베이지', tone: '🌞 웜톤 추천', tags: '#차분함 #오피스', src: '/color/color-nude.png' },
  { id: 'red', title: '레드/버건디', tone: '🍓 매혹적인 포인트', tags: '#치명적 #섹시 #포인트', src: '/color/color-red.png' },
  { id: 'black', title: '블랙/다크', tone: '🕶 시크한 매력', tags: '#시크 #도도 #걸크러쉬', src: '/color/color-black.png' },
  { id: 'pastel', title: '파스텔', tone: '🌸 몽몽 수채화', tags: '#몽환적 #유니크', src: '/color/color-pastel.png' },
  { id: 'glitter', title: '글리터', tone: '💎 화려한 끝판왕', tags: '#영롱 #반짝반짝 #시선집중', src: '/color/color-glitter.png' }
];

const COLOR_TIPS: Record<string, string> = {
  pink: "여리여리한 핑크는 손끝에 생기를 더해줘요.",
  nude: "차분한 누드/베이지는 데일리에 안성맞춤이에요.",
  red: "강렬한 레드는 포인트 네일로 강추예요.",
  black: "도도한 블랙은 시크한 무드를 완성해요.",
  pastel: "파스텔 톤은 부드럽고 유니크한 인상을 줘요.",
  glitter: "글리터는 특별한 날 분위기를 한껏 살려줘요.",
  default: "평소 즐겨 입는 옷이나 자주 바르는 립스틱 색상을 떠올려보세요. 나와 가장 친숙하고 편안한 컬러가 손끝에도 잘 어울려요."
};

export default function TestStep3Page() {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const tipText = selectedColor ? COLOR_TIPS[selectedColor] : COLOR_TIPS.default;

  return (
    <div className="relative mx-auto flex h-full min-h-screen max-w-md flex-col bg-white pb-[calc(4rem+130px)] font-sans overflow-y-scroll overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="flex h-14 w-full items-center justify-between px-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1 text-gray-700"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="whitespace-nowrap font-sans text-lg font-bold tracking-tight text-gray-900">
            퍼스널 네일 진단
          </h1>
          <div className="w-8" />
        </div>
        <div className="px-5 pb-3">
          <div className="mb-2 flex items-center justify-end">
            <span className="font-sans text-sm font-bold tracking-tight text-[#FF826E]">STEP 3 / 3</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-full rounded-full bg-[#FF826E] transition-all" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-8">
        <h2 className="mb-1 whitespace-pre-line font-sans text-[20px] font-bold leading-snug tracking-tight text-gray-900 sm:text-[22px]">
          {"좋아하는 컬러를\n선택하세요"}
        </h2>
        <p className="mb-8 mt-2 font-sans text-[13px] font-medium tracking-tight text-gray-500 sm:text-[14px]">
          가장 끌리는 네일 컬러 칩을 골라주세요.
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 w-full">
          {COLOR_OPTIONS.map((color) => {
            const isSelected = selectedColor === color.id;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColor(color.id)}
                className="group flex w-full flex-col items-center outline-none relative"
              >
                <div className="relative mx-auto mb-3 flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-transparent shadow-md sm:h-28 sm:w-28">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src={color.src}
                      alt={color.title}
                      className={`h-full w-full object-cover object-center transition-transform duration-200 ${
                        !isSelected && "group-hover:-translate-y-0.5"
                      }`}
                    />
                  </div>
                  
                  <div 
                    className={`pointer-events-none absolute inset-0 z-20 rounded-full border-[3.5px] border-[#FF826E] box-border transition-opacity duration-150 ${
                      isSelected ? "opacity-100" : "opacity-0"
                    }`} 
                  />

                  <span 
                    className={`absolute -right-1 -top-1 z-30 flex items-center justify-center rounded-full bg-[#FF826E] p-1 text-white shadow-sm transition-opacity duration-150 ${
                      isSelected ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
                  </span>
                </div>

                <div className="flex w-full flex-col items-center text-center">
                  <p className="mt-1 rounded-full bg-gray-100 px-3 py-0.5 font-sans text-[11px] font-semibold tracking-tight text-gray-600 sm:text-[12px]">
                    {color.tone}
                  </p>
                  <p className="mt-1 font-sans text-[16px] font-bold tracking-tight text-gray-900 sm:text-[17px]">
                    {color.title}
                  </p>
                  <p className="mt-0.5 font-sans text-[12px] font-medium tracking-tight text-gray-400 sm:text-[13px]">
                    {color.tags}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-orange-100 bg-orange-50/60 p-5">
          <p className="mb-2 flex items-center gap-1 font-sans text-[15px] font-bold tracking-tight text-[#FF826E]">
            <span aria-hidden>💡</span>
            수석 큐레이터의 컬러 팁
          </p>
          <p className="break-keep font-sans text-[14px] font-medium leading-relaxed tracking-tight text-gray-700">
            {tipText}
          </p>
        </div>
      </main>

      <div className="fixed left-0 right-0 z-40 mx-auto w-full max-w-md bg-white px-5 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] [bottom:calc(4rem+env(safe-area-inset-bottom,0px))]">
        <button
          type="button"
          disabled={!selectedColor}
          onClick={() => navigate("/client/test-result")}
          className="w-full rounded-xl bg-[#FF826E] py-3.5 font-sans text-[16px] font-bold tracking-tight text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          결과 보기
        </button>
      </div>
    </div>
  );
}
