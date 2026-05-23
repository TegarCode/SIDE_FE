import { useQuery } from "@tanstack/react-query";
import { fetchHilirisasiTradeFlow } from "@/service/komoditas-utama";

type UseHilirisasiTradeFlowQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function useHilirisasiTradeFlowQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UseHilirisasiTradeFlowQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "hilirisasi",
      "trade-flow",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchHilirisasiTradeFlow({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
