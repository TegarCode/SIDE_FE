import { useQuery } from "@tanstack/react-query";
import { fetchMitraOverviewTopTrade } from "@/service/mitra";

export function useMitraOverviewTopTradeQuery(country: string | null) {
  return useQuery({
    queryKey: ["mitra", "overview", "top-trade", country],
    queryFn: () => fetchMitraOverviewTopTrade(country ?? ""),
    enabled: Boolean(country),
    staleTime: 0,
    refetchOnMount: "always",
    retry: false
  });
}
