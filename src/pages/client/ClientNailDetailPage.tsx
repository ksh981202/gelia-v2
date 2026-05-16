import { useState } from "react";
import { Bookmark, Brush, ChevronLeft, Circle, Droplets, Eye, Heart, Search, Share2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DUMMY_NAIL = {
  title: "발레코어 화이트",
  image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
  likes: "0",
  views: "2",
  saves: "0",
  description: "화려한 파티의 주인공으로 만들어 줄 우아하고 로맨틱한 발레코어 옴브레 아트예요.\n\n미디엄 아몬드 쉐입에 시럽 화이트로 부드럽게 번지는 그라데이션을 연출하고, 손끝에 살포시 내려앉은 나비 파츠가 청초한 분위기를 더해줍니다.\n\n걸을 때마다 손끝에서 춤추는 나비처럼 당신의 매력을 한껏 돋보이게 해줄 거예요!",
  tags: ["#화이트", "#미디엄 아몬드", "#발레코어", "#파티", "#옴브레(그라데이션)", "#나비파츠", "#화이트옴브레", "#그라데이션", "#시럽젤"],
  designPoints: [
    { icon: Brush, text: "나비파츠" },
    { icon: Droplets, text: "화이트옴브레" },
    { icon: Circle, text: "그라데이션" },
    { icon: Sparkles, text: "시럽젤" },
  ],
  similar: [
    { id: "s1", title: "청순 화이트 옴브레 큐빅", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80" },
    { id: "s2", title: "화이트 옴브레 발레코어", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&q=80" },
    { id: "s3", title: "파티 화려한 피치", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?w=400&q=80" },
  ],
};

export default function ClientNailDetailPage() {
  const navigate = useNavigate();
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#fdfaf7] pb-[calc(11.5rem+env(safe-area-inset-bottom,0px))]">
      <div className="relative mx-auto min-h-screen w-full max-w-md bg-[#fdfaf7] text-slate-900">
        <nav className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-primary/10 bg-[#fdfaf7]/80 px-5 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary/10">
              <ChevronLeft className="h-5 w-5 text-slate-800" />
            </button>
            <span className="text-[22px] sm:text-[24px] font-semibold text-gray-900 tracking-widest leading-none font-serif">
              GELIA
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" className="mr-1 flex h-7 items-center justify-center gap-1 rounded-full bg-gray-100 px-2.5 text-[11px] font-bold text-gray-700">
              <span aria-hidden>A/文</span> KO
            </button>
            <button type="button" onClick={() => setIsLiked(!isLiked)} className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-primary/10">
              <Heart className={`h-5 w-5 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-800"}`} strokeWidth={2} />
            </button>
            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-primary/10">
              <Share2 className="h-5 w-5 text-slate-800" />
            </button>
          </div>
        </nav>

        <main className="px-4 pt-4">
          <div className="relative aspect-[4/5] w-full select-none overflow-hidden rounded-3xl bg-primary/5 shadow-xl shadow-primary/5">
            <img src={DUMMY_NAIL.image} alt={DUMMY_NAIL.title} className="block h-full w-full object-cover object-center" />
            <button type="button" className="absolute bottom-3 right-3 z-10 rounded-full bg-black/45 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60">
              <Search className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <h1 className="text-left text-2xl font-bold tracking-tight text-gray-900 font-sans break-keep antialiased">
              {DUMMY_NAIL.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <Heart className={`h-4 w-4 shrink-0 ${isLiked ? "fill-rose-500 text-rose-500" : "text-gray-500"}`} strokeWidth={1.5} />
                <span><span className="font-medium text-gray-500">{isLiked ? "1" : DUMMY_NAIL.likes}</span> 좋아요</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4 shrink-0 text-indigo-400" strokeWidth={1.5} />
                <span><span className="font-medium text-gray-500">{DUMMY_NAIL.views}</span> 조회</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bookmark className="h-4 w-4 shrink-0 text-orange-500" strokeWidth={1.5} />
                <span><span className="font-medium text-gray-500">{isSaved ? "1" : DUMMY_NAIL.saves}</span> 저장</span>
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-gray-50 bg-white p-5 shadow-sm mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Editor&apos;s Note</p>
              <div className="relative mt-3">
                <span className="pointer-events-none absolute -left-0.5 top-0 font-serif text-5xl leading-none text-gray-100">&ldquo;</span>
                <p className="relative z-[1] break-keep whitespace-pre-line pl-5 pt-1 text-[14px] font-medium leading-loose tracking-wide text-gray-800">
                  {DUMMY_NAIL.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {DUMMY_NAIL.tags.map((tag) => (
              <button key={tag} type="button" className="cursor-pointer rounded-full bg-gray-100 px-3.5 py-1.5 text-sm font-medium tracking-tight text-gray-700 transition-colors hover:bg-gray-200">
                {tag}
              </button>
            ))}
          </div>

          <section className="mt-10 font-sans">
            <h3 className="mb-4 text-lg font-bold text-slate-900">디자인 포인트</h3>
            <div className="grid grid-cols-2 gap-3">
              {DUMMY_NAIL.designPoints.map((dp, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-400">
                    <dp.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans break-keep text-[13px] font-medium leading-snug tracking-tight text-gray-800">
                      {dp.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-10 w-full font-sans antialiased">
            <button type="button" onClick={() => setIsRecipeOpen(!isRecipeOpen)} className="flex w-full items-center justify-between border-b border-gray-200 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">네일원장님을 위한 시술 가이드</h3>
                <span className="rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white">PRO</span>
              </div>
              <span className={`text-gray-400 transition-transform duration-300 ${isRecipeOpen ? "rotate-180" : ""}`}>▼</span>
            </button>
            {isRecipeOpen && (
              <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center text-sm text-gray-500">
                시술 가이드 내용이 들어갈 자리입니다.
              </div>
            )}
          </div>

          <section className="mt-10 overflow-hidden">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">이 디자인과 비슷한 네일</h3>
              <button type="button" className="text-sm font-medium text-gray-500">전체보기 {">"}</button>
            </div>
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {DUMMY_NAIL.similar.map((sim) => (
                <button key={sim.id} type="button" className="flex min-w-[140px] max-w-[140px] flex-col items-center gap-2">
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-100 border border-black/5 shadow-sm">
                    <img src={sim.image} alt={sim.title} className="h-full w-full object-cover object-center" />
                  </div>
                  <p className="w-full truncate text-center text-[13px] font-medium tracking-tight text-gray-800 font-sans">
                    {sim.title}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </main>

        {/* 고정 하단바 (저장/공유 액션바) */}
        <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-[45] mx-auto w-full max-w-md border-t border-gray-100/80 bg-white/95 px-4 py-3 backdrop-blur-sm">
          <div className="grid grid-cols-[7fr_13fr] gap-2.5">
            <button type="button" onClick={() => setIsSaved(!isSaved)} className={`flex min-h-[50px] items-center justify-center gap-2 rounded-xl border px-2 text-sm font-semibold shadow-sm transition active:scale-[0.97] ${isSaved ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-orange-200/90 text-gray-800 hover:bg-orange-50/40"}`}>
              <Bookmark className={`h-4 w-4 shrink-0 ${isSaved ? "fill-orange-500 text-orange-500" : "text-orange-500"}`} strokeWidth={2} />
              <span>{isSaved ? "저장됨" : "저장하기"}</span>
            </button>
            <button type="button" className="flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-orange-500 px-2.5 text-sm font-bold text-white shadow-md shadow-orange-900/25 transition hover:bg-orange-600 active:scale-95">
              <Share2 className="h-5 w-5 shrink-0 text-white" strokeWidth={2} />
              <span>네일 디자인 공유</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
