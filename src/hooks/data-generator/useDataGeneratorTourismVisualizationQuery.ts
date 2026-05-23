import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorTourismVisualization,
  type DataGeneratorTourismVisualizationParams
} from "@/service/data-generator";

export function useDataGeneratorTourismVisualizationQuery(
  params: DataGeneratorTourismVisualizationParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["data-generator", "tourism", "visualization", params],
    queryFn: () =>
      fetchDataGeneratorTourismVisualization(
        params as DataGeneratorTourismVisualizationParams
      ),
    enabled: enabled && Boolean(params),
    staleTime: 0
  });
}
