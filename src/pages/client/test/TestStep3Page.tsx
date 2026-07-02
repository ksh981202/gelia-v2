import TestStep3Mobile from "./components/TestStep3Mobile";
import TestStep3PC from "./components/TestStep3PC";

export default function TestStep3Page() {
  return (
    <div className="w-full">
      <div className="block lg:hidden">
        <TestStep3Mobile />
      </div>
      <div className="hidden lg:block">
        <TestStep3PC />
      </div>
    </div>
  );
}
