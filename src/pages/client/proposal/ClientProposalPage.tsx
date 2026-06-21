import { useProposalPageQuery } from "@/features/pro/api/useProposalPageQuery";
import type { NailDesignRow } from "@/shared/types/database.types";
import type { LucideIcon } from "lucide-react";
import { Loader2, Map, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const TRUST_CHANNELS: Array<{
  id: string;
  label: string;
  Icon: LucideIcon | typeof InstagramIcon;
}> = [
  { id: "instagram", label: "인스타그램", Icon: InstagramIcon },
  { id: "map", label: "지도", Icon: Map },
  { id: "kakao", label: "카톡 채널", Icon: MessageCircle },
];

function openNailDetail(navigate: ReturnType<typeof useNavigate>, nail: NailDesignRow) {
  const imageUrl = String(nail.image_url ?? "").trim();
  const title = String(nail.title ?? "").trim() || "네일 디자인";

  navigate(`/detail/${nail.id}`, {
    state: {
      initialNailData: {
        id: nail.id,
        imageUrl,
        image_url: imageUrl,
        title,
        color: "",
        mood: "",
      },
    },
  });
}

export default function ClientProposalPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const proposalId = (id ?? "").trim();
  const { data, isLoading, isError } = useProposalPageQuery(proposalId || undefined);

  const handleTrustChannelClick = (label: string) => {
    window.alert(`${label} 연결 준비 중입니다.`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FAF7F2] px-6">
        <Loader2 className="h-10 w-10 animate-spin text-[#5C4A3A]" aria-hidden />
        <p className="mt-4 text-sm font-medium text-stone-500">제안서를 불러오는 중입니다</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-[#FAF7F2] px-6 py-16 text-center">
        <p className="text-lg font-medium text-stone-700">제안서를 찾을 수 없습니다</p>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          링크가 만료되었거나 잘못된 주소일 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] px-5 pb-12 pt-8">
      <div className="mx-auto max-w-md">
        <header className="mb-10 text-center">
          <p
            className="text-[1.85rem] font-semibold leading-snug tracking-wide text-stone-800 sm:text-3xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Curated for {data.customerName}
          </p>
          {data.greetingMessage ? (
            <p className="mt-6 whitespace-pre-line px-2 text-sm leading-[1.85] text-stone-500 sm:text-base">
              {data.greetingMessage}
            </p>
          ) : null}
        </header>

        {data.nails.length > 0 ? (
          <section className="columns-2 gap-4" aria-label="추천 네일 디자인">
            {data.nails.map((nail) => {
              const imageUrl = String(nail.image_url ?? "").trim();
              const title = String(nail.title ?? "").trim() || "네일 디자인";

              return (
                <button
                  key={nail.id}
                  type="button"
                  onClick={() => openNailDetail(navigate, nail)}
                  className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-transform active:scale-[0.98]"
                  aria-label={`${title} 상세 보기`}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="block w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="aspect-[3/4] w-full bg-stone-200" aria-hidden />
                  )}
                </button>
              );
            })}
          </section>
        ) : (
          <p className="py-12 text-center text-sm text-stone-400">담긴 디자인이 없습니다.</p>
        )}

        <footer className="mt-12">
          <p className="mb-5 text-center text-sm leading-relaxed text-stone-500">
            마음에 드는 디자인이 있으시면 편하게 문의하세요
          </p>

          <section
            className="rounded-2xl bg-white p-6 shadow-md"
            aria-label="살롱 프로필"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE4D8]">
                <span
                  className="text-lg font-bold tracking-wide text-[#5C4A3A]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  G
                </span>
              </div>

              <p
                className="mt-3 text-lg font-semibold text-stone-800"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                청담 젤리아 네일
              </p>

              <p className="mt-1 text-amber-400" aria-label="별점 5점">
                ★★★★★
              </p>

              <div className="mt-5 flex items-center justify-center gap-4">
                {TRUST_CHANNELS.map(({ id: channelId, label, Icon }) => (
                  <button
                    key={channelId}
                    type="button"
                    onClick={() => handleTrustChannelClick(label)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-[#FAF7F2] text-[#5C4A3A] transition-colors hover:bg-[#EDE4D8]"
                    aria-label={label}
                  >
                    {channelId === "instagram" ? (
                      <InstagramIcon size={20} />
                    ) : (
                      <Icon size={20} strokeWidth={2} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </footer>
      </div>
    </div>
  );
}
