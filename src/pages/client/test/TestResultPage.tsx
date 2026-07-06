import ClientGlobalHeader from "@/widgets/layout/ClientGlobalHeader";
import TestResultMobile from "./components/TestResultMobile";
import TestResultPC from "./components/TestResultPC";

export default function TestResultPage() {
  return (
    <div className="w-full">
      <div className="block md:hidden">
        <TestResultMobile />
      </div>
      <div className="hidden md:flex md:min-h-screen md:w-full md:flex-col md:bg-stone-50">
        <ClientGlobalHeader showBackButton={true} isMainHome={false} />
        <div className="w-full px-6 py-12">
          <TestResultPC />
        </div>
      </div>
    </div>
  );
}
