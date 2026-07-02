import { useState } from "react";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import ClientGlobalHeader from "@/widgets/layout/ClientGlobalHeader";

const nailLengthOptions = [
  { id: "length-short", label: "짧은 손톱", labelEn: "Short Nails", image: "/quiz/length-short.jpg" },
  { id: "length-medium", label: "중간 길이", labelEn: "Medium Length", image: "/quiz/length-medium.jpg" },
  { id: "length-long", label: "긴 손톱", labelEn: "Long Nails", image: "/quiz/length-long.jpg" },
] as const;

const handTypeOptions = [
  { id: "short-finger", label: "🌷 손가락이 짧은 편", labelEn: "🌷 Shorter Fingers" },
  { id: "long-finger", label: "🦢 손가락이 긴 편", labelEn: "🦢 Longer Fingers" },
  { id: "plump-hand", label: "☁️ 손이 통통한 편", labelEn: "☁️ Fuller Hands" },
  { id: "slim-hand", label: "🩰 손이 마른 편", labelEn: "🩰 Slim Hands" },
] as const;

const TestStep1PC = () => {
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const isEnglish = language === "en";
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const canNext = selectedLength && selectedType;

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 w-full">
      <ClientGlobalHeader showBackButton={true} isMainHome={false} />

      <main className="flex-1 flex flex-col items-center justify-start pt-12 pb-8 px-6">
        <div className="w-full max-w-3xl bg-white border border-stone-200 rounded-2xl shadow-sm px-10 py-12 flex flex-col items-center">
          <div className="w-full max-w-xl mx-auto">
            {/* 진행률 */}
            <div className="mb-2 flex items-center justify-end">
              <span className="font-sans text-sm font-bold tracking-tight text-[#FF7D66]">STEP 1 / 3</span>
            </div>
            <div className="h-1 bg-gray-100 w-full rounded-full overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-[#FF7D66] transition-all" />
            </div>

            {/* 손톱 길이 */}
            <h2 className="mt-10 font-sans text-[20px] font-bold tracking-tight text-gray-900">
              {isEnglish ? "Choose your nail length" : "손톱 길이를 골라주세요"}
            </h2>
            <p className="mb-5 mt-1 font-sans text-[14px] font-medium tracking-tight text-gray-500">
              {isEnglish ? "Select the closest style." : "가장 가까운 스타일을 선택하면 돼요."}
            </p>
            <div className="mb-10 grid grid-cols-3 gap-3">
              {nailLengthOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedLength(opt.id)}
                  className={`overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedLength === opt.id ? "border-[#FF7D66] ring-2 ring-[#FF7D66]/20" : "border-transparent"
                  }`}
                >
                  <img
                    src={opt.image}
                    alt=""
                    className="aspect-square w-full object-cover object-center"
                  />
                  <span
                    className={`mt-2 block bg-white py-2 text-center font-sans text-[14px] font-medium tracking-tight ${
                      selectedLength === opt.id ? "text-[#FF7D66]" : "text-gray-800"
                    }`}
                  >
                    {isEnglish && opt.labelEn ? opt.labelEn : opt.label}
                  </span>
                </button>
              ))}
            </div>

            {/* 손 타입 */}
            <h2 className="font-sans text-[20px] font-bold tracking-tight text-gray-900">
              {isEnglish ? "What's your hand type?" : "손 타입은 어떤가요?"}
            </h2>
            <p className="mb-5 mt-1 font-sans text-[14px] font-medium tracking-tight text-gray-500">
              {isEnglish ? "Please select one." : "가장 가까운 타입을 하나만 선택해 주세요."}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {handTypeOptions.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedType(t.id)}
                  className={`w-full rounded-xl border px-5 py-4 text-left font-sans text-[16px] font-medium tracking-tight transition-colors ${
                    selectedType === t.id
                      ? "border-[#FF7D66] bg-[#FFF7F2] text-[#FF7D66]"
                      : "border-gray-200 text-gray-700"
                  }`}
                >
                  {isEnglish && t.labelEn ? t.labelEn : t.label}
                </button>
              ))}
            </div>

            {/* 다음 버튼 */}
            <button
              type="button"
              disabled={!canNext}
              onClick={() => {
                if (selectedLength) sessionStorage.setItem("diagnosis.lengthId", selectedLength);
                if (selectedType) sessionStorage.setItem("diagnosis.handTypeId", selectedType);
                navigate("/test-step2");
              }}
              className="mt-12 w-full rounded-xl bg-[#FF7D66] py-3.5 font-sans text-[16px] font-bold tracking-wide text-white shadow-lg shadow-[#FF7D66]/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isEnglish ? "Next" : "다음"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestStep1PC;
