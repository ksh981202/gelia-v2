import { useQuery } from "@tanstack/react-query";
import { fetchProposalPage } from "./fetchProposalPage";

export function useProposalPageQuery(proposalId: string | undefined) {
  const normalizedId = proposalId?.trim() ?? "";

  return useQuery({
    queryKey: ["pro-proposal", "page", normalizedId],
    queryFn: async () => fetchProposalPage(normalizedId),
    enabled: Boolean(normalizedId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
