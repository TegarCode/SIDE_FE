import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorServiceVisualization,
  type DataGeneratorServiceVisualizationParams
} from "@/service/data-generator";

export function useDataGeneratorServiceVisualizationQuery(
  params: DataGeneratorServiceVisualizationParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["data-generator", "service", "visualization", params],
    queryFn: () =>
      fetchDataGeneratorServiceVisualization(
        params as DataGeneratorServiceVisualizationParams
      ),
    enabled: enabled && Boolean(params),
    staleTime: 0
  });
}
