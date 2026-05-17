import { useEffect } from "react";
import { ChevronLeft, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DUMMY_RESULT = {
  styleTag: "✨ Elevated & Elegant Style",
  description:
    "차분하면서도 고급스러운 분위기를 가장 잘 소화하는 타입이에요.\n손끝 라인을 정돈해 보이는 디자인이 특히 잘 어울리고,\n은은한 누드 톤이나 미세한 펄 포인트가 세련미를 높여줘요.",
};

const MAIN_NAILS = [
  { id: "dummy-main-1", title: "누드 글로시 프렌치" },
  { id: "dummy-main-2", title: "샴페인 마블 포인트" },
  { id: "dummy-main-3", title: "밀키 베이지 그라데이션" },
  { id: "dummy-main-4", title: "골드 라인 미니멀" },
];

const SUB_NAILS = [
  { id: "dummy-sub-1", title: "진주 포인트 프렌치" },
  { id: "dummy-sub-2", title: "피치 베이지 시럽" },
  { id: "dummy-sub-3", title: "로즈골드 하프문" },
];

const TestResultPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-[#FCFAF7] pb-24">
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="p-1 text-gray-700"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="whitespace-nowrap text-lg font-bold text-gray-900">진단 결과</h1>
        <button type="button" aria-label="공유하기" className="p-1 text-gray-700">
          <Share2 className="h-5 w-5" />
        </button>
      </header>

      <main className="flex-1 px-4 pb-8">
        <h2 className="mt-8 text-center text-[22px] font-semibold leading-snug text-gray-900 sm:text-[24px]">
          당신에게 어울리는 네일
        </h2>
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center justify-center rounded-full bg-[#FFEFE9] px-4 py-1.5 text-[13px] font-bold text-[#FF826E] sm:text-[14px]">
            {DUMMY_RESULT.styleTag}
          </span>
        </div>

        <div className="mb-8 mt-6 rounded-2xl border border-[#FFE4DB] bg-[#FFF7F3] p-5">
          <p className="mb-2 text-[15px] font-bold text-[#FF826E]">💡 추천 이유</p>
          <p className="break-keep text-[14px] font-medium leading-relaxed text-gray-700 whitespace-pre-line">
            {DUMMY_RESULT.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {MAIN_NAILS.map((item) => (
            <div key={item.id} className="flex w-full cursor-pointer flex-col text-inherit">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-200 shadow-sm" />
              <p className="mt-2 text-center text-[14px] font-medium text-gray-800 sm:text-[15px]">{item.title}</p>
            </div>
          ))}
        </div>

        <section className="mt-12" aria-labelledby="more-styles-heading">
          <h3
            id="more-styles-heading"
            className="mt-10 mb-4 text-[18px] font-semibold text-gray-900 sm:text-[20px]"
          >
            이런 스타일은 어때요?
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {SUB_NAILS.map((item) => (
              <div key={item.id} className="flex w-full cursor-pointer flex-col gap-2 text-inherit">
                <div className="aspect-[3/4] w-full rounded-2xl border border-gray-100 bg-gray-200 object-cover object-center" />
                <p className="text-center break-keep text-[12px] font-medium text-gray-800 sm:text-[13px]">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TestResultPage;
