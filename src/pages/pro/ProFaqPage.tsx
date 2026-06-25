import { useLanguageContext } from "@/contexts/LanguageContext";
import { useProFaqListQuery } from "@/features/pro/api/useProFaqListQuery";
import DOMPurify from "dompurify";
import { Loader2 } from "lucide-react";

export default function ProFaqPage() {
  const { isEnglish } = useLanguageContext();
  const { data: faqItems = [], isLoading, isError } = useProFaqListQuery();

  return (
    <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-stone-100 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-stone-800">
        {isEnglish ? "❓ Frequently Asked Questions (FAQ)" : "❓ 자주 묻는 질문 (FAQ)"}
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#5C4A3A]" aria-hidden />
        </div>
      ) : null}

      {!isLoading && isError ? (
        <p className="mt-6 text-center text-sm text-stone-500">
          {isEnglish ? "Failed to load FAQ." : "FAQ를 불러오지 못했습니다."}
        </p>
      ) : null}

      {!isLoading && !isError && faqItems.length === 0 ? (
        <p className="mt-6 text-center text-sm text-stone-500">
          {isEnglish ? "No FAQ posts yet." : "등록된 FAQ가 없습니다."}
        </p>
      ) : null}

      {!isLoading && !isError && faqItems.length > 0 ? (
        <div className="mt-6 divide-y divide-stone-100 border-y border-stone-100">
          {faqItems.map((item) => {
            const title =
              (isEnglish && item.title_en?.trim() ? item.title_en : item.title)?.trim() || "";
            const content =
              (isEnglish && item.content_en?.trim() ? item.content_en : item.content)?.trim() || "";
            const sanitizedContent = DOMPurify.sanitize(content);

            return (
              <details key={item.id} className="group py-1">
                <summary className="cursor-pointer list-none py-4 text-base font-semibold text-stone-800 transition-colors marker:content-none hover:text-stone-900 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1">{title}</span>
                    <span
                      className="shrink-0 text-sm text-stone-400 transition-transform group-open:rotate-180"
                      aria-hidden
                    >
                      ▼
                    </span>
                  </span>
                </summary>
                <div
                  className="pb-5 pl-1 text-sm leading-relaxed text-stone-600 [&_a]:text-[#5C4A3A] [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-bold [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-2 [&_ul]:list-disc"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              </details>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
