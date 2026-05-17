import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const INTRO_IMAGE = "/quiz/intro-main.jpg";

const TestIntroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white font-sans">
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="p-1 text-gray-700"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="whitespace-nowrap font-sans text-lg font-bold tracking-tight text-gray-900">
          퍼스널 네일 진단
        </h1>
        <div className="w-8" />
      </header>

      <main className="flex flex-1 flex-col px-6 pt-8 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] text-center">
        <div className="relative mx-auto mb-10 mt-6 h-72 w-72">
          <div
            className="absolute right-4 top-0 h-56 w-56 rounded-full bg-[#E8C5B0] opacity-60"
            aria-hidden
          />
          <div className="absolute bottom-0 left-4 h-60 w-60 overflow-hidden rounded-full border-4 border-white shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
            <img
              src={INTRO_IMAGE}
              alt="예쁜 네일 아트가 된 손"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        <h2 className="whitespace-pre-line break-keep text-[22px] font-bold leading-[1.3] text-gray-900">
          {"내 손에 어울리는\n네일 디자인을 찾아보세요"}
        </h2>
        <p className="mb-8 mt-3 whitespace-pre-line break-keep text-[14px] font-medium leading-relaxed text-gray-500">
          {"간단한 선택으로 나에게 어울리는\n퍼스널 네일을 추천해 드려요"}
        </p>

        <div className="mx-auto w-full max-w-sm rounded-2xl bg-[#FFF9F5] p-6 text-left">
          <ul className="flex flex-col gap-3.5">
            <li className="flex items-center gap-3">
              <span className="shrink-0 text-[18px] leading-none" aria-hidden>
                ✨
              </span>
              <span className="text-[14px] font-medium leading-relaxed text-gray-700">
                딱 3초! 초간단 맞춤 진단
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="shrink-0 text-[18px] leading-none" aria-hidden>
                💅
              </span>
              <span className="text-[14px] font-medium leading-relaxed text-gray-700">
                내 손 타입/톤 완벽 분석
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="shrink-0 text-[18px] leading-none" aria-hidden>
                🎨
              </span>
              <span className="text-[14px] font-medium leading-relaxed text-gray-700">
                나만의 트렌드 네일 추천
              </span>
            </li>
          </ul>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-md border-t border-gray-100 bg-white px-4 pt-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
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
