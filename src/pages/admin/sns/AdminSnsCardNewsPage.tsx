import { useMemo, useState } from "react";
import { Copy, Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/shared/api/supabaseClient";
import {
  buildSnsMarketingPrompt,
  buildSnsThemeSets,
  formatGlAssetId,
  SNS_THEME_BASIS_BADGE,
  type SnsSourceNail,
  type SnsThemeSet,
} from "@/features/sns/snsThemeExtractor";
import CardNewsEditor, { type CardNewsAsset } from "@/widgets/gce/CardNewsEditor";

export default function AdminSnsCardNewsPage() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSets, setExtractSets] = useState<SnsThemeSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const selectedSet = useMemo(
    () => extractSets.find((set) => set.id === selectedSetId) ?? null,
    [extractSets, selectedSetId],
  );

  const editorImageAssets = useMemo<CardNewsAsset[]>(
    () =>
      selectedSet?.nails
        .map((nail) => {
          const imageUrl = String(nail.image_url ?? "").trim();
          if (!imageUrl) return null;
          return {
            glId: formatGlAssetId(nail.id, nail.source_filename),
            imageUrl,
          } satisfies CardNewsAsset;
        })
        .filter((asset): asset is CardNewsAsset => asset != null) ?? [],
    [selectedSet],
  );

  const extractThemeSets = async () => {
    setIsExtracting(true);
    setCopyFeedback(null);
    try {
      const { data, error } = await supabase
        .from("nail_designs")
        .select(
          "id,title,title_en,image_url,source_filename,category,situations,styles,tags,design_elements,popularity",
        )
        .not("image_url", "is", null)
        .limit(2000);

      if (error) throw error;
      const rows = (data ?? []) as SnsSourceNail[];
      const sets = buildSnsThemeSets(rows);
      setExtractSets(sets);
      setSelectedSetId(sets[0]?.id ?? null);
    } catch (error) {
      console.error("[SNS CARDNEWS] extract failed:", error);
      alert("테마 추출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyPrompt = async (set: SnsThemeSet) => {
    const prompt = buildSnsMarketingPrompt(set);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyFeedback(set.id);
      setTimeout(() => setCopyFeedback((prev) => (prev === set.id ? null : prev)), 1400);
    } catch (error) {
      console.error("[SNS CARDNEWS] copy prompt failed:", error);
      alert("클립보드 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-6 md:p-8">
      <header className="space-y-2">
        <p className="text-sm font-bold text-violet-600">SNS MARKETING</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 md:text-3xl">
          SNS 카드뉴스 팩토리
        </h1>
        <p className="text-sm text-stone-500 md:text-base">
          인스타그램 및 핀터레스트 마케팅 전용 썸네일 생성 엔진입니다.
        </p>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-stone-900">STEP 1. 무한 셔플 테마 자동 추출</h2>
        <p className="mt-1 text-sm text-stone-500">
          젤리아 전체 테마 풀(계절·상황·컬러·무드·텍스처·기법 등)에서 매번 랜덤 5세트를 추출합니다.
          클릭할 때마다 테마와 사진 구성이 새롭게 섞입니다.
        </p>

        <button
          type="button"
          onClick={() => void extractThemeSets()}
          disabled={isExtracting}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-base font-black text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-5 w-5" />
          {isExtracting ? "추출 중..." : "✨ 오늘의 SNS 카드뉴스 테마 추출하기"}
        </button>

        {extractSets.length > 0 && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {extractSets.map((set) => (
              <article
                key={set.id}
                className={`rounded-xl border p-4 transition ${
                  selectedSetId === set.id
                    ? "border-violet-400 bg-violet-50/50"
                    : "border-stone-200 bg-white"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-stone-900">{set.title}</h3>
                  <span className="rounded-md bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-500">
                    {SNS_THEME_BASIS_BADGE[set.basis]}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {set.nails.map((nail) => (
                    <img
                      key={nail.id}
                      src={nail.image_url}
                      alt={nail.title}
                      className="aspect-[4/5] w-full rounded-md object-cover"
                    />
                  ))}
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void handleCopyPrompt(set)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100"
                  >
                    <Copy className="h-4 w-4" />
                    {copyFeedback === set.id ? "복사 완료!" : "📋 SNS 마케팅 프롬프트 복사"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSetId(set.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 hover:bg-violet-100"
                  >
                    <Wand2 className="h-4 w-4" />🎨 이 세트로 썸네일 제작
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-stone-900">STEP 2. 카드뉴스 편집 &amp; ZIP 다운로드</h2>
        <CardNewsEditor imageAssets={editorImageAssets} ideaTitle={selectedSet?.title ?? ""} />
      </section>
    </div>
  );
}
