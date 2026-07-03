import ClientGlobalHeader from "@/widgets/layout/ClientGlobalHeader";
import TestStep3Mobile from "./components/TestStep3Mobile";
import TestStep3PC from "./components/TestStep3PC";

export default function TestStep3Page() {
  return (
    <div className="w-full">
      <div className="block lg:hidden">
        <TestStep3Mobile />
      </div>
      <div className="hidden lg:flex lg:min-h-screen lg:w-full lg:flex-col lg:bg-stone-50">
        <ClientGlobalHeader showBackButton={true} isMainHome={false} />
        <div className="w-full px-6 py-12">
          <TestStep3PC />
        </div>
      </div>
    </div>
  );
}
