import { useQuery } from "@tanstack/react-query";
import { fetchProLookbooksList } from "./fetchProLookbooksList";

export function useProLookbooksListQuery() {
  return useQuery({
    queryKey: ["pro-lookbooks", "list"],
    queryFn: fetchProLookbooksList,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
