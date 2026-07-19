import { useLookbookPageQuery } from "@/features/pro/api/useLookbookPageQuery";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { buildNailImageSeoAlt, displayItemTitle } from "@/entities/nail-design/lib/nailDisplayText";
import type { NailDesignRow } from "@/shared/types/database.types";
import { Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

function lookbookDetailState(nail: NailDesignRow, isEnglish: boolean) {
  const imageUrl = String(nail.image_url ?? "").trim();
  const title = displayItemTitle(nail, isEnglish);

  return {
    initialNailData: {
      id: nail.id,
      imageUrl,
      image_url: imageUrl,
      title,
      color: "",
      mood: "",
    },
  };
}

function LookbookGalleryNailCard({
  nail,
  originalIndex,
  isEnglish,
}: {
  nail: NailDesignRow;
  originalIndex: number;
  isEnglish: boolean;
}) {
  const imageUrl = String(nail.image_url ?? "").trim();
  const title = displayItemTitle(nail, isEnglish);
  const badgeLabel = String(originalIndex + 1).padStart(2, "0");

  return (
    <article className="mb-4 w-full break-inside-avoid">
      <Link
        to={`/detail/${nail.id}`}
        state={lookbookDetailState(nail, isEnglish)}
        className="relative block w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-transform hover:shadow-md active:scale-[0.98] md:rounded-3xl"
        aria-label={`${badgeLabel} ${title} 상세 보기`}
      >
        <span className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/50 bg-white/80 text-[11px] font-bold text-stone-800 shadow-sm backdrop-blur-md">
          {badgeLabel}
        </span>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={buildNailImageSeoAlt(nail, isEnglish)}
            className="block w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="aspect-[3/4] w-full bg-stone-200" aria-hidden />
        )}
      </Link>
      <p className="mt-2 truncate px-1 text-center text-sm font-semibold text-stone-700">{title}</p>
    </article>
  );
}

export default function ClientLookbookPage() {
  const { language } = useLanguageContext();
  const isEnglish = language === "en";
  const { id } = useParams<{ id: string }>();
  const lookbookId = (id ?? "").trim();
  const { data, isLoading, isError } = useLookbookPageQuery(lookbookId || undefined);

  if (isLoading) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FAF7F2] px-6">
        <Loader2 className="h-10 w-10 animate-spin text-[#5C4A3A]" aria-hidden />
        <p className="mt-4 text-sm font-medium text-stone-500">룩북을 불러오는 중입니다</p>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FAF7F2] px-6 py-16 text-center">
        <p className="text-lg font-medium text-stone-700">룩북을 찾을 수 없습니다</p>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          링크가 만료되었거나 잘못된 주소일 수 있습니다.
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] px-5 pb-20 pt-8 md:pt-16">
      <div className="mx-auto w-full max-w-md md:max-w-5xl lg:max-w-6xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="mb-3 block text-[12px] font-bold tracking-widest text-[#FF7E67]">
            EDITOR'S PICKS
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 md:text-4xl">
            {data.title}
          </h1>
          <p className="mt-4 text-[14px] text-stone-500 md:text-[15px]">
            원장님이 추천한 디자인 컬렉션입니다.
          </p>
        </div>

        {data.nails.length > 0 ? (
          <section
            className="columns-2 gap-4 md:columns-3 md:gap-6 lg:columns-4"
            aria-label="룩북 네일 디자인"
          >
            {data.nails.map((nail, index) => (
              <LookbookGalleryNailCard
                key={nail.id}
                nail={nail}
                originalIndex={index}
                isEnglish={isEnglish}
              />
            ))}
          </section>
        ) : (
          <p className="py-12 text-center text-sm text-stone-400">담긴 디자인이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
