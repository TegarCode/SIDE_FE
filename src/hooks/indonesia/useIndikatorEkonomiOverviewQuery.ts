import { useQuery } from "@tanstack/react-query";
import { fetchIndikatorEkonomiOverview } from "@/service/indonesia/indikator-ekonomi";
import type { EconomicIndicatorOverviewParams } from "@/type/indonesiaIndikatorEkonomi";

export function useIndikatorEkonomiOverviewQuery(
  params: EconomicIndicatorOverviewParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["indonesia", "indikator-ekonomi", "overview", params],
    queryFn: () =>
      fetchIndikatorEkonomiOverview(params as EconomicIndicatorOverviewParams),
    enabled: enabled && Boolean(params),
    staleTime: 1000 * 60 * 2
  });
}
