import { useQuery } from "@tanstack/react-query";
import { fetchMineralKritisTradeFlow } from "@/service/komoditas-utama";

type UseMineralKritisTradeFlowQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function useMineralKritisTradeFlowQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UseMineralKritisTradeFlowQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "mineral-kritis",
      "trade-flow",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchMineralKritisTradeFlow({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
