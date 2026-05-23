import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorTourismTable,
  type DataGeneratorTourismTableParams
} from "@/service/data-generator";

export function useDataGeneratorTourismTableQuery(
  params: DataGeneratorTourismTableParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["data-generator", "tourism", "table", params],
    queryFn: () =>
      fetchDataGeneratorTourismTable(params as DataGeneratorTourismTableParams),
    enabled: enabled && Boolean(params),
    staleTime: 0
  });
}
