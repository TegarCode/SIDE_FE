import { useQuery } from "@tanstack/react-query";
import { fetchPanganTradeFlow } from "@/service/komoditas-utama";

type UsePanganTradeFlowQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function usePanganTradeFlowQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UsePanganTradeFlowQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "pangan",
      "trade-flow",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchPanganTradeFlow({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
