import ClientGlobalHeader from "@/widgets/layout/ClientGlobalHeader";
import TestStep2Mobile from "./components/TestStep2Mobile";
import TestStep2PC from "./components/TestStep2PC";

export default function TestStep2Page() {
  return (
    <div className="w-full">
      <div className="block md:hidden">
        <TestStep2Mobile />
      </div>
      <div className="hidden md:flex md:min-h-screen md:w-full md:flex-col md:bg-stone-50">
        <ClientGlobalHeader showBackButton={true} isMainHome={false} />
        <div className="w-full px-6 py-12">
          <TestStep2PC />
        </div>
      </div>
    </div>
  );
}
