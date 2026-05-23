import { useQuery } from "@tanstack/react-query";
import { fetchMitraOverviewTrade } from "@/service/mitra";

export function useMitraOverviewTradeQuery() {
  return useQuery({
    queryKey: ["mitra", "overview", "trade"],
    queryFn: fetchMitraOverviewTrade,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 1000 * 60 * 30,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
}
