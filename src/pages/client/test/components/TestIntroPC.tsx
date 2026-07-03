import { useLanguageContext } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const INTRO_IMAGE = "/quiz/intro-main.jpg";

type TestIntroPCProps = {
  isProMode?: boolean;
};

const TestIntroPC = ({ isProMode = false }: TestIntroPCProps) => {
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const isEnglish = language === "en";
  const basePath = isProMode ? "/pro" : "";

  return (
    <main className="w-full max-w-3xl mx-auto bg-white border border-stone-200 rounded-2xl shadow-sm px-10 py-12 flex flex-col items-center text-center">

          <div className="flex flex-col items-center gap-6">
            {/* 둥근 네일 이미지 */}
            <div className="relative h-64 w-64">
              <div className="absolute right-4 top-0 h-48 w-48 rounded-full bg-[#E8C5B0] opacity-60" />
              <div className="absolute bottom-0 left-4 h-52 w-52 overflow-hidden rounded-full border-4 border-white">
                <img
                  src={INTRO_IMAGE}
                  alt={isEnglish ? "Beautifully done nail art" : "예쁜 네일 아트가 된 손"}
                  className="h-full w-full rounded-full object-cover object-center shadow-md"
                />
              </div>
            </div>

            {/* 타이틀 */}
            <h2 className="whitespace-pre-line break-keep font-sans text-[30px] font-bold leading-snug tracking-tight text-gray-900">
              {isEnglish
                ? "Find Your Perfect Match"
                : "내 손에 어울리는\n네일 디자인을 찾아보세요"}
            </h2>

            {/* 안내 텍스트 */}
            <p className="whitespace-pre-line break-keep font-sans text-[16px] font-medium tracking-tight text-gray-500">
              {isEnglish
                ? "Take a quick test to find your style"
                : "간단한 선택으로 나에게 어울리는\n퍼스널 네일을 추천해 드려요"}
            </p>

            {/* 안내 박스: 넓은 카드에서 찢어지지 않도록 max-w-sm 캡슐화 */}
            <div className="mt-2 flex w-full max-w-sm mx-auto items-center justify-center rounded-2xl bg-[#FFF7F2] px-5 py-6">
              <div className="flex flex-col items-start gap-y-3.5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-[18px] leading-none" aria-hidden>✨</span>
                  <span className="font-sans text-[14px] font-medium tracking-tight text-gray-800 sm:text-[15px]">
                    {isEnglish ? "Just 3 seconds! Quick custom diagnosis" : "딱 3초! 초간단 맞춤 진단"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-[18px] leading-none" aria-hidden>🤌</span>
                  <span className="font-sans text-[14px] font-medium tracking-tight text-gray-800 sm:text-[15px]">
                    {isEnglish ? "Perfect analysis of hand type & tone" : "내 손 타입/톤 완벽 분석"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-[18px] leading-none" aria-hidden>🎨</span>
                  <span className="font-sans text-[14px] font-medium tracking-tight text-gray-800 sm:text-[15px]">
                    {isEnglish ? "Trendy nail recommendations for you" : "나만의 트렌드 네일 추천"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 테스트 시작 버튼 */}
          <button
            type="button"
            onClick={() => navigate(`${basePath}/test-step1`)}
            className="w-full max-w-sm mt-10 h-14 flex-shrink-0 rounded-xl bg-[#FF7D66] px-4 py-4 font-sans text-[16px] font-bold text-white shadow-lg shadow-[#FF7D66]/30 transition-transform active:scale-95"
          >
            {isEnglish ? "Start Test" : "테스트 시작"}
          </button>

    </main>
  );
};

export default TestIntroPC;
