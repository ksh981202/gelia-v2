import { supabase } from "@/shared/api/supabaseClient";

export const PRO_FAQ_POST_TYPE = "pro_faq" as const;

export type ProFaqItem = {
  id: string;
  title: string | null;
  title_en: string | null;
  content: string | null;
  content_en: string | null;
  created_at: string | null;
};

export async function fetchProFaqList(): Promise<ProFaqItem[]> {
  const { data, error } = await supabase
    .from("board_posts")
    .select("id,title,title_en,content,content_en,created_at")
    .eq("is_active", true)
    .eq("post_type", PRO_FAQ_POST_TYPE)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProFaqItem[];
}
