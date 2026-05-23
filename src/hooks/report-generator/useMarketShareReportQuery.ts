import { useQuery } from "@tanstack/react-query";
import {
  fetchMarketShareReport,
  type MarketShareFilterParams
} from "@/service/report-generator/marketShare";

export function useMarketShareReportQuery(
  params: MarketShareFilterParams | null
) {
  return useQuery({
    queryKey: ["report-generator", "market-share", params],
    queryFn: () => fetchMarketShareReport(params as MarketShareFilterParams),
    enabled: Boolean(
      params?.origin &&
      params?.destination &&
      params?.strategy1 &&
      params?.top_n &&
      params?.sumber &&
      params?.year
    ),
    staleTime: 1000 * 60 * 5
  });
}
