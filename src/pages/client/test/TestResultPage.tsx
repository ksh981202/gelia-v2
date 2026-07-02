import TestResultMobile from "./components/TestResultMobile";
import TestResultPC from "./components/TestResultPC";

export default function TestResultPage() {
  return (
    <div className="w-full">
      <div className="block lg:hidden">
        <TestResultMobile />
      </div>
      <div className="hidden lg:block">
        <TestResultPC />
      </div>
    </div>
  );
}
