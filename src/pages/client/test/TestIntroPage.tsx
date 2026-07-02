import TestIntroMobile from "./components/TestIntroMobile";
import TestIntroPC from "./components/TestIntroPC";

export default function TestIntroPage() {
  return (
    <div className="w-full">
      {/* 모바일 뷰 */}
      <div className="block lg:hidden">
        <TestIntroMobile />
      </div>
      {/* PC 뷰 */}
      <div className="hidden lg:block">
        <TestIntroPC />
      </div>
    </div>
  );
}
