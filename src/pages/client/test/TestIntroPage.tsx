import ClientGlobalHeader from "@/widgets/layout/ClientGlobalHeader";
import TestIntroMobile from "./components/TestIntroMobile";
import TestIntroPC from "./components/TestIntroPC";

export default function TestIntroPage() {
  return (
    <div className="w-full">
      {/* 모바일 뷰: 자체 헤더/배경 포함 */}
      <div className="block md:hidden">
        <TestIntroMobile />
      </div>
      {/* PC 뷰: 헤더+배경 껍데기는 B2C 전용으로 여기서 주입 */}
      <div className="hidden md:flex md:min-h-screen md:w-full md:flex-col md:bg-stone-50">
        <ClientGlobalHeader showBackButton={true} isMainHome={false} />
        <div className="w-full px-6 py-12">
          <TestIntroPC />
        </div>
      </div>
    </div>
  );
}
