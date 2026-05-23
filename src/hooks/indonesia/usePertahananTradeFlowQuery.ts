import { useQuery } from "@tanstack/react-query";
import { fetchPertahananTradeFlow } from "@/service/komoditas-utama";

type UsePertahananTradeFlowQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function usePertahananTradeFlowQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UsePertahananTradeFlowQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "pertahanan",
      "trade-flow",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchPertahananTradeFlow({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
