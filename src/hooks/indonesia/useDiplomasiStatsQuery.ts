import { useQuery } from "@tanstack/react-query";
import { fetchDiplomasiStats } from "@/service/indonesia/diplomasi-ekonomi";
import type { DiplomasiApiParams } from "@/type/indonesiaDiplomasi";

export function useDiplomasiStatsQuery(
  params: DiplomasiApiParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["indonesia", "diplomasi-ekonomi", "stats", params],
    queryFn: () => fetchDiplomasiStats(params as DiplomasiApiParams),
    enabled: enabled && Boolean(params),
    staleTime: 1000 * 60 * 2
  });
}
