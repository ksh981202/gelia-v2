import ClientGlobalHeader from "@/widgets/layout/ClientGlobalHeader";
import TestStep1Mobile from "./components/TestStep1Mobile";
import TestStep1PC from "./components/TestStep1PC";

export default function TestStep1Page() {
  return (
    <div className="w-full">
      <div className="block md:hidden">
        <TestStep1Mobile />
      </div>
      <div className="hidden md:flex md:min-h-screen md:w-full md:flex-col md:bg-stone-50">
        <ClientGlobalHeader showBackButton={true} isMainHome={false} />
        <div className="w-full px-6 py-12">
          <TestStep1PC />
        </div>
      </div>
    </div>
  );
}
