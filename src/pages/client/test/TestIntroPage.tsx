import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const INTRO_IMAGE = "/quiz/intro-main.jpg";

const TestIntroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col overflow-y-auto bg-white font-sans">
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white px-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="p-1 text-gray-700"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="whitespace-nowrap font-sans text-lg font-bold tracking-tight text-gray-900">
          퍼스널 네일 진단
        </h1>
        <div className="w-8" />
      </header>

      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col px-6 pt-8 pb-44 text-center">
        <div className="relative w-72 h-72 mx-auto mb-10 mt-6">
          <div className="absolute top-0 right-4 w-56 h-56 rounded-full bg-[#E8C5B0] opacity-60" />
          <div className="absolute bottom-0 left-4 h-60 w-60 overflow-hidden rounded-full border-4 border-white">
            <img
              src={INTRO_IMAGE}
              alt="예쁜 네일 아트가 된 손"
              className="h-full w-full rounded-full object-cover object-center shadow-md"
            />
          </div>
        </div>

        <h2 className="whitespace-pre-line break-keep font-sans text-[22px] font-bold leading-snug tracking-tight text-gray-900 sm:text-[24px]">
          {"내 손에 어울리는\n네일 디자인을 찾아보세요"}
        </h2>
        <p className="mb-8 mt-3 whitespace-pre-line break-keep font-sans text-[14px] font-medium tracking-tight text-gray-500 sm:text-[15px]">
          {"간단한 선택으로 나에게 어울리는\n퍼스널 네일을 추천해 드려요"}
        </p>

        <div className="mx-auto mt-8 flex w-full max-w-sm items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 px-4 py-8">
          <div className="flex flex-col items-start gap-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-base leading-none" aria-hidden>
                ✨
              </span>
              <span className="font-sans text-[14px] font-medium tracking-tight text-gray-700 sm:text-[15px]">
                딱 3초! 초간단 맞춤 진단
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-base leading-none" aria-hidden>
                💅
              </span>
              <span className="font-sans text-[14px] font-medium tracking-tight text-gray-700 sm:text-[15px]">
                내 손 타입/톤 완벽 분석
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-base leading-none" aria-hidden>
                🎨
              </span>
              <span className="font-sans text-[14px] font-medium tracking-tight text-gray-700 sm:text-[15px]">
                나만의 트렌드 네일 추천
              </span>
            </div>
          </div>
        </div>

        </main>
      </div>

      <div className="sticky bottom-[64px] z-40 w-full bg-white px-4 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={() => navigate("/client/test-step1")}
          className="h-14 w-full flex-shrink-0 rounded-xl bg-primary px-4 py-4 font-sans text-lg font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
        >
          테스트 시작
        </button>
      </div>

    </div>
  );
};

export default TestIntroPage;
