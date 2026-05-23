import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorServiceTable,
  type DataGeneratorServiceTableParams
} from "@/service/data-generator";

export function useDataGeneratorServiceTableQuery(
  params: DataGeneratorServiceTableParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["data-generator", "service", "table", params],
    queryFn: () =>
      fetchDataGeneratorServiceTable(params as DataGeneratorServiceTableParams),
    enabled: enabled && Boolean(params),
    staleTime: 0
  });
}
