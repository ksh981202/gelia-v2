import {
  copyProposalShareLink,
  createProProposal,
} from "@/features/pro/api/proMutations";
import { useEffect, useState } from "react";

type ProConsultationLinkModalProps = {
  nailIds: string[];
  onClose: () => void;
  onSuccess: () => void;
};

export default function ProConsultationLinkModal({
  nailIds,
  onClose,
  onSuccess,
}: ProConsultationLinkModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  const handleCreateLink = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const proposalId = await createProProposal({
        customerName,
        greetingMessage,
        nailIds,
      });
      await copyProposalShareLink(proposalId);
      window.alert("링크가 생성되어 복사되었습니다!");
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : "링크 생성에 실패했습니다.";
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-consultation-link-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="pro-consultation-link-title" className="text-xl font-semibold text-gray-900">
          상담 제안서 링크 생성
        </h2>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="pro-customer-name" className="mb-2 block text-sm font-medium text-gray-700">
              고객명
            </label>
            <input
              id="pro-customer-name"
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="고객 이름 (예: 김지영 고객님)"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-orange-100 bg-[#FFF9F5] px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-orange-200 focus:bg-white disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="pro-greeting-message" className="mb-2 block text-sm font-medium text-gray-700">
              인사말
            </label>
            <textarea
              id="pro-greeting-message"
              value={greetingMessage}
              onChange={(event) => setGreetingMessage(event.target.value)}
              rows={4}
              placeholder="고객에게 전달할 짧은 환영 메시지를 적어주세요. (예: 웨딩 촬영에 어울릴 추천 디자인입니다.)"
              disabled={isSubmitting}
              className="w-full resize-none rounded-xl border border-orange-100 bg-[#FFF9F5] px-4 py-3 text-sm leading-relaxed text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-orange-200 focus:bg-white disabled:opacity-60"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-orange-100 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-orange-50/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            [ 취소 ]
          </button>
          <button
            type="button"
            onClick={() => void handleCreateLink()}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-[#5C4A3A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4A3B2E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "생성 중..." : "[ 링크 생성 및 복사 ]"}
          </button>
        </div>
      </div>
    </div>
  );
}
