import { toast } from 'sonner';
import { supabase } from '@/shared/api/supabaseClient';

export type GceArticleResult = {
  template_type: string;
  content_ko: string;
  content_en: string;
  content_jp: string;
  content_vn: string;
  content_th: string;
  image_keywords: string[];
  ai_score: number;
};

const buildRemasterPrompt = (title: string, content: string, category: string) => `
당신은 하이엔드 뷰티 매거진 '젤리아(GELIA)'의 수석 에디터이자 다국어 로컬라이제이션 전문가입니다.
사용자가 이미 작성한 원문을 존중하되, 주어진 제목·카테고리·원문을 바탕으로 아래 5가지 블로그 마스터 템플릿 중 가장 알맞은 하나를 선택해 완벽한 HTML로 리마스터링하세요.
처음부터 대충 쓰지 말고, 선택한 템플릿의 HTML 뼈대와 내용 전개 방식을 반드시 따르세요.

[입력 메타]
- 제목: ${title}
- 카테고리: ${category}

[사용자 원문 (한국어)]
${content}

[절대 규칙]
- 문단이 뭉치지 않게, 반드시 마침표(.) 단위로 한 문장이 끝날 때마다 새로운 <p> 태그로 분리하세요.
- 케어/질환 정보는 절대 쓰지 마세요.
- [IMAGE_1] ~ [IMAGE_5] 플레이스홀더는 한 글자도 바꾸지 말고 템플릿에 지정된 위치에 그대로 삽입하세요.
- 각 이미지 자리에 어울릴 영문 네일 검색 키워드를 정확히 5개 추출하세요.

[템플릿 1: 심층 화보형 (Deep Dive)] - 1가지 디자인 딥포커스
<h2>[메인 컨셉 타이틀]</h2>
<p>도입부...</p>
<h3>1. 텍스처와 컬러감</h3>
<p>설명...</p>[IMAGE_1][IMAGE_2]
<h3>2. 완벽한 OOTD 스타일링</h3>
<p>설명...</p>[IMAGE_3][IMAGE_4]
<h3>에디터의 한 줄 평</h3>
<p>설명...</p>[IMAGE_5]

[템플릿 2: 큐레이션 리스트형 (Listicle)] - 5가지 디자인 추천
<h2>[상황/시즌 추천 타이틀]</h2>
<p>도입부...</p>
<h3>1. [첫번째 디자인 이름]</h3>
<p>설명...</p>[IMAGE_1]
<h3>2. [두번째 디자인 이름]</h3>
<p>설명...</p>[IMAGE_2]
(이런 식으로 5번까지 반복... [IMAGE_3], [IMAGE_4], [IMAGE_5] 각각 배치)

[템플릿 3: VS 비교 분석형 (A vs B)] - 두 가지 스타일 대비
<h2>[A 스타일] vs [B 스타일] 전격 비교</h2>
<p>도입부...</p>
<h3>Type A. [A 스타일 이름]의 매력</h3>
<p>설명...</p>[IMAGE_1][IMAGE_2]
<h3>Type B. [B 스타일 이름]의 매력</h3>
<p>설명...</p>[IMAGE_3][IMAGE_4]
<h3>나에게 맞는 스타일은?</h3>
<p>설명...</p>[IMAGE_5]

[템플릿 4: 상황별 룩북형 (By Occasion)] - TPO 맞춤 추천
<h2>[특정 상황, 예: 하객룩/바캉스] 네일 룩북</h2>
<p>도입부...</p>
<h3>Scene 1. [첫번째 상황/시간대]</h3>
<p>설명...</p>[IMAGE_1][IMAGE_2]
<h3>Scene 2. [두번째 상황/시간대]</h3>
<p>설명...</p>[IMAGE_3][IMAGE_4]
<h3>Scene 3. [세번째 상황/시간대]</h3>
<p>설명...</p>[IMAGE_5]

[템플릿 5: 퍼스널 맞춤 가이드형 (Perfect Fit)] - 톤/체형 맞춤
<h2>[쿨톤/웜톤 또는 손톱 쉐입] 완벽 가이드</h2>
<p>도입부...</p>
<h3>[Type 1]을 위한 베스트 초이스</h3>
<p>설명...</p>[IMAGE_1][IMAGE_2]
<h3>[Type 2]를 위한 베스트 초이스</h3>
<p>설명...</p>[IMAGE_3][IMAGE_4]
<h3>에디터의 매칭 꿀팁</h3>
<p>설명...</p>[IMAGE_5]

[작업 순서]
1) 원문·제목·카테고리를 분석해 위 5개 템플릿 중 1개만 선택
2) 선택된 템플릿 HTML 뼈대에 맞춰 한국어 본문(content_ko)을 리마스터링
3) 동일 HTML 구조를 유지한 채 EN/JP/VN/TH로 현지화 번역 (태그·[IMAGE_n] 위치 불변)

[출력 규칙 — 절대 준수]
- 반드시 JSON 한 개만 반환해. 마크다운 코드펜스(\`\`\`)나 설명 문장은 넣지 마.
- 반드시 아래 JSON 형태로만 리턴해.
{
  "template_type": "선택한 템플릿 번호(1~5)",
  "content_ko": "<h2>...</h2>",
  "content_en": "<h2>...</h2>",
  "content_jp": "<h2>...</h2>",
  "content_vn": "<h2>...</h2>",
  "content_th": "<h2>...</h2>",
  "image_keywords": ["pink nail", "french", "glitter", "...", "..."],
  "ai_score": 98
}
- image_keywords는 영문 검색 키워드 문자열 배열이며 정확히 5개.
- ai_score는 90~99 사이 정수.
`.trim();

const clampAiScore = (value: unknown) => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 95;
  return Math.min(99, Math.max(90, Math.round(n)));
};

const normalizeImageKeywords = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw
      .map((k) => String(k ?? '').trim())
      .filter(Boolean)
      .slice(0, 5);
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw
      .split(/[,|]/)
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 5);
  }
  return [];
};

const parseGeminiJson = (rawText: string): GceArticleResult => {
  console.log('Raw AI Response:', rawText);

  let cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // 정규식을 사용해 오직 { 로 시작해서 } 로 끝나는 JSON 객체 부분만 강제 추출
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI 응답에서 유효한 JSON 데이터를 찾을 수 없습니다.');
  }
  cleaned = jsonMatch[0];

  const parsed = JSON.parse(cleaned) as Partial<GceArticleResult>;
  if (!parsed.content_ko || typeof parsed.content_ko !== 'string') {
    throw new Error('Gemini 응답에 content_ko가 없습니다.');
  }

  const templateType = String(parsed.template_type ?? '1').replace(/[^\d]/g, '') || '1';
  const clampedType = String(Math.min(5, Math.max(1, Number(templateType) || 1)));
  const imageKeywords = normalizeImageKeywords(parsed.image_keywords);

  return {
    template_type: clampedType,
    content_ko: parsed.content_ko,
    content_en: String(parsed.content_en ?? '').trim(),
    content_jp: String(parsed.content_jp ?? '').trim(),
    content_vn: String(parsed.content_vn ?? '').trim(),
    content_th: String(parsed.content_th ?? '').trim(),
    image_keywords: imageKeywords,
    ai_score: clampAiScore(parsed.ai_score),
  };
};

const toSafeErrorMessage = (err: unknown) => {
  if (err instanceof Error && err.message.trim()) return err.message;
  return 'Gemini API 호출 중 오류가 발생했습니다. 모델명/API 키를 확인해주세요.';
};

const resetStatusOnError = async (id: number) => {
  const { error } = await supabase
    .from('gce_title_db')
    .update({ status: 'draft' })
    .eq('id', id);

  if (error) {
    console.error('[generateGceArticle] draft 원복 실패:', error);
  }
};

/**
 * 사용자 원문을 구조화·사진배치·다국어 번역으로 리마스터링하고
 * gce_title_db 해당 행을 completed(검수 대기)로 업데이트합니다.
 * Google SDK 대신 Generative Language REST API(fetch)로 직접 호출합니다.
 * 실패 시 toast + status를 draft로 원복합니다.
 */
export async function generateGceArticle(
  title: string,
  content: string,
  category: string,
  id: number,
): Promise<GceArticleResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    const msg = 'VITE_GEMINI_API_KEY가 설정되지 않았습니다. .env를 확인해주세요.';
    console.error('[generateGceArticle]', msg);
    toast.error(msg);
    await resetStatusOnError(id);
    throw new Error(msg);
  }

  const sourceContent = content.trim();
  if (!sourceContent) {
    const msg = '리마스터링할 한국어 원문이 비어 있습니다.';
    toast.error(msg);
    await resetStatusOnError(id);
    throw new Error(msg);
  }

  let alreadyHandled = false;

  try {
    const prompt = buildRemasterPrompt(title, sourceContent, category);
    const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/' +
      modelName +
      ':generateContent?key=' +
      apiKey;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data.error?.message || 'API 통신 에러';
      toast.error(msg);
      await resetStatusOnError(id);
      alreadyHandled = true;
      throw new Error(msg);
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText?.trim()) {
      throw new Error('Gemini 응답이 비어 있습니다.');
    }

    const article = parseGeminiJson(rawText);

    const patch = {
      content_ko: article.content_ko,
      content_en: article.content_en || null,
      content_jp: article.content_jp || null,
      content_vn: article.content_vn || null,
      content_th: article.content_th || null,
      template_type: article.template_type,
      target_keywords: article.image_keywords.join(', '),
      ai_score: article.ai_score,
      status: 'completed',
    };

    const { error } = await supabase
      .from('gce_title_db')
      .update(patch)
      .eq('id', id);

    if (error) {
      throw new Error(`gce_title_db 업데이트 실패: ${error.message}`);
    }

    return article;
  } catch (err) {
    const message = toSafeErrorMessage(err);
    console.error('[generateGceArticle] failed:', err);
    if (!alreadyHandled) {
      toast.error(message);
      await resetStatusOnError(id);
    }
    throw new Error(message);
  }
}

export type GcePublishInput = {
  id: number;
  title: string;
  title_en?: string | null;
  title_jp?: string | null;
  title_vn?: string | null;
  title_th?: string | null;
  category?: string | null;
  content_ko?: string | null;
  content_en?: string | null;
  content_jp?: string | null;
  content_vn?: string | null;
  content_th?: string | null;
  image_urls?: string[] | null;
  slug?: string | null;
  meta_ko?: string | null;
  meta_en?: string | null;
  meta_jp?: string | null;
  meta_vn?: string | null;
  meta_th?: string | null;
};

const extractFirstImgSrc = (html: string | null | undefined): string | null => {
  const m = String(html ?? '').match(/<img[^>]+src=["']([^"']+)["']/i);
  const src = m?.[1]?.trim();
  return src || null;
};

/**
 * 검수 완료 매거진을 라이브 board_posts(magazine_editor)로 발행하고
 * gce_title_db status를 published로 전환합니다.
 * - content / content_ko: KR 본문 호환 기록
 * - meta_ko~meta_th: SEO 요약 (요청 meta_desc_* 매핑)
 * - JP/VN/TH 제목·본문 컬럼 포함
 */
export async function publishGceMagazineToLive(review: GcePublishInput): Promise<{ boardPostId: string }> {
  const id = Number(review.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('발행할 검수 항목 ID가 올바르지 않습니다.');
  }

  const title = String(review.title ?? '').trim();
  const contentKo = String(review.content_ko ?? '').trim();
  if (!title || !contentKo) {
    throw new Error('제목과 KR 본문이 있어야 발행할 수 있습니다.');
  }

  const slug = String(review.slug ?? '').trim();
  if (!slug) {
    throw new Error('URL 슬러그를 입력해주세요.');
  }

  const contentEn = String(review.content_en ?? '').trim() || null;
  const contentJp = String(review.content_jp ?? '').trim() || null;
  const contentVn = String(review.content_vn ?? '').trim() || null;
  const contentTh = String(review.content_th ?? '').trim() || null;
  const titleEn = String(review.title_en ?? '').trim() || null;
  const metaKo = String(review.meta_ko ?? '').trim() || null;
  const metaEn = String(review.meta_en ?? '').trim() || null;
  const metaJp = String(review.meta_jp ?? '').trim() || null;
  const metaVn = String(review.meta_vn ?? '').trim() || null;
  const metaTh = String(review.meta_th ?? '').trim() || null;
  const thumbnailFromHtml = extractFirstImgSrc(contentKo);
  const thumbnailFromList =
    Array.isArray(review.image_urls) && review.image_urls.length > 0
      ? String(review.image_urls[0] ?? '').trim()
      : '';
  const thumbnail_url = thumbnailFromHtml || thumbnailFromList || null;
  const publishedAt = new Date().toISOString();

  const { data: boardRow, error: boardError } = await supabase
    .from('board_posts')
    .insert({
      post_type: 'magazine_editor',
      is_active: true,
      slug,
      thumbnail_url,
      title,
      title_en: titleEn,
      title_jp: String(review.title_jp ?? '').trim() || null,
      title_vn: String(review.title_vn ?? '').trim() || null,
      title_th: String(review.title_th ?? '').trim() || null,
      content: contentKo,
      content_ko: contentKo,
      content_en: contentEn,
      content_jp: contentJp,
      content_vn: contentVn,
      content_th: contentTh,
      meta_ko: metaKo,
      meta_en: metaEn,
      meta_jp: metaJp,
      meta_vn: metaVn,
      meta_th: metaTh,
      sub_category: String(review.category ?? '').trim() || null,
      published_at: publishedAt,
    })
    .select('id')
    .single();

  if (boardError) {
    throw new Error(`매거진 라이브 발행 실패: ${boardError.message}`);
  }
  if (!boardRow?.id) {
    throw new Error('발행된 매거진 ID를 확인할 수 없습니다.');
  }

  const { error: gceError } = await supabase
    .from('gce_title_db')
    .update({
      status: 'published',
      published_at: publishedAt,
      title,
      content_ko: contentKo,
      content_en: contentEn,
      content_jp: contentJp,
      content_vn: contentVn,
      content_th: contentTh,
      slug,
      meta_ko: metaKo,
      meta_en: metaEn,
      meta_jp: metaJp,
      meta_vn: metaVn,
      meta_th: metaTh,
      image_urls:
        thumbnail_url && (!review.image_urls || review.image_urls.length === 0)
          ? [thumbnail_url]
          : review.image_urls ?? null,
    })
    .eq('id', id);

  if (gceError) {
    throw new Error(`gce_title_db 발행 상태 갱신 실패: ${gceError.message}`);
  }

  return { boardPostId: String(boardRow.id) };
}
