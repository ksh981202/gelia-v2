import { useQuery } from "@tanstack/react-query";
import { fetchProCurationsList } from "./fetchProCurationsList";

export function useProCurationsListQuery() {
  return useQuery({
    queryKey: ["pro-curations", "list"],
    queryFn: fetchProCurationsList,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
