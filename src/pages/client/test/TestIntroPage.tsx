import ClientGlobalHeader from "@/widgets/layout/ClientGlobalHeader";
import TestIntroMobile from "./components/TestIntroMobile";
import TestIntroPC from "./components/TestIntroPC";

export default function TestIntroPage() {
  return (
    <div className="w-full">
      {/* 모바일 뷰: 자체 헤더/배경 포함 */}
      <div className="block lg:hidden">
        <TestIntroMobile />
      </div>
      {/* PC 뷰: 헤더+배경 껍데기는 B2C 전용으로 여기서 주입 */}
      <div className="hidden lg:flex lg:min-h-screen lg:w-full lg:flex-col lg:bg-stone-50">
        <ClientGlobalHeader showBackButton={false} isMainHome={false} />
        <div className="w-full px-6 py-12">
          <TestIntroPC />
        </div>
      </div>
    </div>
  );
}
