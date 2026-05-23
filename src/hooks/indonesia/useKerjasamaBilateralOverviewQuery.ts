import { useQuery } from "@tanstack/react-query";
import { fetchKerjasamaBilateralOverview } from "@/service/indonesia/kerjasama-bilateral";
import type {
  BilateralOverviewParams,
  BilateralTabSlug
} from "@/type/indonesiaKerjasamaBilateral";

export function useKerjasamaBilateralOverviewQuery(
  tab: BilateralTabSlug,
  params: BilateralOverviewParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["indonesia", "kerjasama-bilateral", "overview", tab, params],
    queryFn: () =>
      fetchKerjasamaBilateralOverview(tab, params as BilateralOverviewParams),
    enabled: enabled && Boolean(params),
    staleTime: 1000 * 60 * 2
  });
}
