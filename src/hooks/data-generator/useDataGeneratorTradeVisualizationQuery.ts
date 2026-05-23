import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorTradeVisualization,
  type DataGeneratorTradeVisualizationParams
} from "@/service/data-generator";

export function useDataGeneratorTradeVisualizationQuery(
  params: DataGeneratorTradeVisualizationParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["data-generator", "trade", "visualization", params],
    queryFn: () =>
      fetchDataGeneratorTradeVisualization(
        params as DataGeneratorTradeVisualizationParams
      ),
    enabled: enabled && Boolean(params),
    staleTime: 0
  });
}
