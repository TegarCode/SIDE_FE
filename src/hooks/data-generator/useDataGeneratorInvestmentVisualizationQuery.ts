import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorInvestmentVisualization,
  type DataGeneratorInvestmentVisualizationParams
} from "@/service/data-generator";

export function useDataGeneratorInvestmentVisualizationQuery(
  params: DataGeneratorInvestmentVisualizationParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["data-generator", "investment", "visualization", params],
    queryFn: () =>
      fetchDataGeneratorInvestmentVisualization(
        params as DataGeneratorInvestmentVisualizationParams
      ),
    enabled: enabled && Boolean(params),
    staleTime: 0
  });
}
