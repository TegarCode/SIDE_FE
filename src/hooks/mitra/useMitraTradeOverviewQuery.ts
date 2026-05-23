import { useQuery } from "@tanstack/react-query";
import { fetchMitraTradeOverview } from "@/service/mitra";
import type { MitraTradeOverviewParams } from "@/type/mitra";

export function useMitraTradeOverviewQuery(
  params: MitraTradeOverviewParams,
  enabled = true
) {
  return useQuery({
    queryKey: ["mitra", "perdagangan", "overview", params],
    queryFn: () => fetchMitraTradeOverview(params),
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5
  });
}
