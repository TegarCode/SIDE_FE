import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorInvestmentTable,
  type DataGeneratorInvestmentTableParams
} from "@/service/data-generator";

export function useDataGeneratorInvestmentTableQuery(
  params: DataGeneratorInvestmentTableParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["data-generator", "investment", "table", params],
    queryFn: () =>
      fetchDataGeneratorInvestmentTable(
        params as DataGeneratorInvestmentTableParams
      ),
    enabled: enabled && Boolean(params),
    staleTime: 0
  });
}
