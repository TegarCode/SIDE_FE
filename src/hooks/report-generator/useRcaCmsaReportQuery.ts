import { useQuery } from "@tanstack/react-query";
import {
  fetchRcaCmsaReport,
  type RcaCmsaFilterParams
} from "@/service/report-generator/rcaCmsa";

export function useRcaCmsaReportQuery(params: RcaCmsaFilterParams | null) {
  return useQuery({
    queryKey: ["report-generator", "rca-cmsa", params],
    queryFn: () => fetchRcaCmsaReport(params as RcaCmsaFilterParams),
    enabled: Boolean(
      params?.origin && params?.destination && params?.strategy1
    ),
    staleTime: 1000 * 60 * 5
  });
}
