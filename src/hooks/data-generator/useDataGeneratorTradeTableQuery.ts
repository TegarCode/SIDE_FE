import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorTradeTable,
  type DataGeneratorTradeTableParams
} from "@/service/data-generator";

export function useDataGeneratorTradeTableQuery(
  params: DataGeneratorTradeTableParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["data-generator", "trade", "table", params],
    queryFn: () =>
      fetchDataGeneratorTradeTable(params as DataGeneratorTradeTableParams),
    enabled: enabled && Boolean(params),
    staleTime: 0
  });
}
