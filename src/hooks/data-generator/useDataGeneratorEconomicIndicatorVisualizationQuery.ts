import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorEconomicIndicatorVisualization,
  type DataGeneratorEconomicIndicatorVisualizationParams
} from "@/service/data-generator";

export function useDataGeneratorEconomicIndicatorVisualizationQuery(
  params: DataGeneratorEconomicIndicatorVisualizationParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["data-generator", "economic-indicator", "visualization", params],
    queryFn: () =>
      fetchDataGeneratorEconomicIndicatorVisualization(
        params as DataGeneratorEconomicIndicatorVisualizationParams
      ),
    enabled: enabled && Boolean(params),
    staleTime: 0
  });
}
