import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsOverview } from "@/service/homeService";

export function useHomeOverviewQuery(months = 6) {
  return useQuery({
    queryKey: ["home", "overview", months],
    queryFn: () => fetchAnalyticsOverview(months),
    staleTime: 1000 * 60 * 5
  });
}
