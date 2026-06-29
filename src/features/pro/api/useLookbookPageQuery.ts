import { useQuery } from "@tanstack/react-query";
import { fetchLookbookPage } from "./fetchLookbookPage";

export function useLookbookPageQuery(lookbookId: string | undefined) {
  const normalizedId = lookbookId?.trim() ?? "";

  return useQuery({
    queryKey: ["pro-lookbook", "page", normalizedId],
    queryFn: async () => fetchLookbookPage(normalizedId),
    enabled: Boolean(normalizedId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
