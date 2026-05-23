import { useQuery } from "@tanstack/react-query";
import { fetchMitraOverviewStats } from "@/service/mitra";

export function useMitraOverviewStatsQuery(country: string | null) {
  return useQuery({
    queryKey: ["mitra", "overview", "stats", country],
    queryFn: () => fetchMitraOverviewStats(country ?? ""),
    enabled: Boolean(country),
    staleTime: 1000 * 60 * 5,
    retry: false
  });
}
