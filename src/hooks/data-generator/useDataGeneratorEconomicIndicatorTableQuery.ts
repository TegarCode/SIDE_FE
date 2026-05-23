import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorEconomicIndicatorTable,
  type DataGeneratorEconomicIndicatorTableParams
} from "@/service/data-generator";

export function useDataGeneratorEconomicIndicatorTableQuery(
  params: DataGeneratorEconomicIndicatorTableParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["data-generator", "economic-indicator", "table", params],
    queryFn: () =>
      fetchDataGeneratorEconomicIndicatorTable(
        params as DataGeneratorEconomicIndicatorTableParams
      ),
    enabled: enabled && Boolean(params),
    staleTime: 0
  });
}
