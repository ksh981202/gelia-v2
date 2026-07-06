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

function formatCustomerDisplayName(name: string): string {
  if (!name) return "고객님";
  const pureName = name.replace(/고객님?|님/g, "").trim();
  return `${pureName} 고객님`;
}

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

function ProposalGalleryNailCard({
  nail,
  originalIndex,
  onOpen,
}: {
  nail: NailDesignRow;
  originalIndex: number;
  onOpen: (nail: NailDesignRow) => void;
}) {
  const imageUrl = String(nail.image_url ?? "").trim();
  const title = String(nail.title ?? "").trim() || "네일 디자인";
  const badgeLabel = String(originalIndex + 1).padStart(2, "0");

  return (
    <article className="w-full">
      <button
        type="button"
        onClick={() => onOpen(nail)}
        className="relative block w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-transform hover:shadow-md active:scale-[0.98] md:rounded-3xl"
        aria-label={`${badgeLabel} ${title} 상세 보기`}
      >
        <span className="absolute left-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
          {badgeLabel}
        </span>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="block w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="aspect-[3/4] w-full bg-stone-200" aria-hidden />
        )}
      </button>
      <p className="mt-3 truncate px-1 text-center text-[14px] font-semibold text-stone-800 md:mt-4 md:text-[15px]">
        {title}
      </p>
    </article>
  );
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

  const displayGreeting =
    data.greetingMessage && data.greetingMessage !== data.customerName
      ? data.greetingMessage
      : "✨ 원장님이 고객님을 위해 엄선한 맞춤형 디자인입니다.\n가장 아름답게 완성할 특별한 무드를 만나보세요 🤍";

  const galleryItems = data.nails;

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] px-5 pb-20 pt-8 md:pt-16">
      <div className="mx-auto w-full max-w-md md:max-w-5xl lg:max-w-6xl">
        <header className="mx-auto mb-8 max-w-2xl px-4 text-center md:mb-12">
          <span className="mb-3 block text-[12px] font-bold tracking-widest text-orange-600">
            SPECIAL FOR YOU
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 md:text-4xl">
            For. {formatCustomerDisplayName(data.customerName)}
          </h1>
          <p className="mt-4 whitespace-pre-line break-keep text-[14px] leading-relaxed text-stone-500 md:text-[15px]">
            {displayGreeting}
          </p>
        </header>

        {galleryItems.length > 0 ? (
          <section
            className="grid w-full grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
            aria-label="추천 네일 디자인"
          >
            {galleryItems.map((nail, index) => (
              <ProposalGalleryNailCard
                key={nail.id}
                nail={nail}
                originalIndex={index}
                onOpen={(item) => openNailDetail(navigate, item)}
              />
            ))}
          </section>
        ) : (
          <p className="py-12 text-center text-sm text-stone-400">담긴 디자인이 없습니다.</p>
        )}

        <footer className="mt-12 md:mt-16">
          <div className="mx-auto max-w-2xl">
          <section
            className="rounded-2xl bg-white p-8 shadow-md md:rounded-3xl md:p-10"
            aria-label="살롱 프로필"
          >
            <div className="flex flex-col items-center text-center">
              <h3 className="text-2xl font-extrabold tracking-tight text-stone-800">
                청담 젤리아 네일
              </h3>

              <p className="mt-2 break-keep text-sm font-medium text-stone-500">
                마음에 드는 디자인이 있으시면 편하게 문의하세요.
              </p>

              <hr className="mx-auto my-6 w-12 border-stone-200" />

              <div className="flex justify-center gap-4">
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
          </div>
        </footer>
      </div>
    </div>
  );
}
