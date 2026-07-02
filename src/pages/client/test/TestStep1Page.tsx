import TestStep1Mobile from "./components/TestStep1Mobile";
import TestStep1PC from "./components/TestStep1PC";

export default function TestStep1Page() {
  return (
    <div className="w-full">
      <div className="block lg:hidden">
        <TestStep1Mobile />
      </div>
      <div className="hidden lg:block">
        <TestStep1PC />
      </div>
    </div>
  );
}
