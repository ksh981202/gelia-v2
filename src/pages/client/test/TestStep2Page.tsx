import ClientGlobalHeader from "@/widgets/layout/ClientGlobalHeader";
import TestStep2Mobile from "./components/TestStep2Mobile";
import TestStep2PC from "./components/TestStep2PC";

export default function TestStep2Page() {
  return (
    <div className="w-full">
      <div className="block lg:hidden">
        <TestStep2Mobile />
      </div>
      <div className="hidden lg:flex lg:min-h-screen lg:w-full lg:flex-col lg:bg-stone-50">
        <ClientGlobalHeader showBackButton={true} isMainHome={false} />
        <div className="w-full px-6 py-12">
          <TestStep2PC />
        </div>
      </div>
    </div>
  );
}
