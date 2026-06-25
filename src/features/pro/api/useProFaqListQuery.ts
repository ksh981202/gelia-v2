import { useQuery } from "@tanstack/react-query";
import { fetchProFaqList } from "./fetchProFaqList";

export function useProFaqListQuery() {
  return useQuery({
    queryKey: ["pro-faq", "list"],
    queryFn: fetchProFaqList,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
