import { useQuery } from "@tanstack/react-query";
import { fetchAnalisisOperationalRisk } from "@/service/analisis";
import type { AnalisisOperationalRiskResult } from "@/type/analisis";

export function useAnalisisOperationalRiskQuery(
  country: string | null,
  enabled = true
) {
  return useQuery<AnalisisOperationalRiskResult>({
    queryKey: ["analisis", "operational-risk", country ?? null],
    queryFn: () => fetchAnalisisOperationalRisk(country ?? ""),
    enabled: enabled && Boolean(country),
    staleTime: 1000 * 60 * 10
  });
}
