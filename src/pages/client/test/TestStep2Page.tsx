import TestStep2Mobile from "./components/TestStep2Mobile";
import TestStep2PC from "./components/TestStep2PC";

export default function TestStep2Page() {
  return (
    <div className="w-full">
      <div className="block lg:hidden">
        <TestStep2Mobile />
      </div>
      <div className="hidden lg:block">
        <TestStep2PC />
      </div>
    </div>
  );
}
