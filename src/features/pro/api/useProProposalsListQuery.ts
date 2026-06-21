import { useQuery } from "@tanstack/react-query";
import { fetchProProposalsList } from "./fetchProProposalsList";

export function useProProposalsListQuery() {
  return useQuery({
    queryKey: ["pro-proposals", "list"],
    queryFn: fetchProProposalsList,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
