import { useQuery } from "@tanstack/react-query";
import { fetchDiplomasiOverview } from "@/service/indonesia/diplomasi-ekonomi";
import type {
  DiplomasiApiParams,
  DiplomasiTabSlug
} from "@/type/indonesiaDiplomasi";

export function useDiplomasiOverviewQuery(
  tab: DiplomasiTabSlug,
  params: DiplomasiApiParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["indonesia", "diplomasi-ekonomi", "overview", tab, params],
    queryFn: () => fetchDiplomasiOverview(tab, params as DiplomasiApiParams),
    enabled: enabled && Boolean(params),
    staleTime: 1000 * 60 * 2
  });
}
