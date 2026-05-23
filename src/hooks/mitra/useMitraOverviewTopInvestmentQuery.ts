import { useQuery } from "@tanstack/react-query";
import { fetchMitraOverviewTopInvestment } from "@/service/mitra";

export function useMitraOverviewTopInvestmentQuery(country: string | null) {
  return useQuery({
    queryKey: ["mitra", "overview", "top-investment", country],
    queryFn: () => fetchMitraOverviewTopInvestment(country ?? ""),
    enabled: Boolean(country),
    staleTime: 0,
    refetchOnMount: "always",
    retry: false
  });
}
