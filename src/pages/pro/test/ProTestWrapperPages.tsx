import type { ReactNode } from "react";
import type { NailDesignRow } from "@/shared/types/database.types";
import TestIntroPC from "@/pages/client/test/components/TestIntroPC";
import TestStep1PC from "@/pages/client/test/components/TestStep1PC";
import TestStep2PC from "@/pages/client/test/components/TestStep2PC";
import TestStep3PC from "@/pages/client/test/components/TestStep3PC";
import TestResultPC from "@/pages/client/test/components/TestResultPC";

// ProLayout 헤더(h-16=4rem)와 main 패딩(p-6=3rem)을 제외한 실제 가용 높이 기준으로
// 카드를 수직 정중앙에 안착시킨다. (my-12 잉여 마진은 카드 모듈에서 제거됨)
const PRO_TEST_SHELL_CLASS =
  "min-h-[calc(100vh-7rem)] w-full bg-stone-50 flex items-center justify-center";

function ProTestShell({ children }: { children: ReactNode }) {
  return <div className={PRO_TEST_SHELL_CLASS}>{children}</div>;
}

export function ProTestIntroPage() {
  return (
    <ProTestShell>
      <TestIntroPC isProMode={true} />
    </ProTestShell>
  );
}

export function ProTestStep1Page() {
  return (
    <ProTestShell>
      <TestStep1PC isProMode={true} />
    </ProTestShell>
  );
}

export function ProTestStep2Page() {
  return (
    <ProTestShell>
      <TestStep2PC isProMode={true} />
    </ProTestShell>
  );
}

export function ProTestStep3Page() {
  return (
    <ProTestShell>
      <TestStep3PC isProMode={true} />
    </ProTestShell>
  );
}

export function ProTestResultPage() {
  // PRO 환경에서는 B2C 상세(/detail/:id)로 튕기지 않도록 클릭 액션을 격리한다.
  // TODO: 추후 PRO 전용 룩북 담기/퀵뷰 모달 로직 연동
  const handleNailClick = (_item: NailDesignRow) => {};

  return (
    <ProTestShell>
      <TestResultPC onNailClick={handleNailClick} />
    </ProTestShell>
  );
}
