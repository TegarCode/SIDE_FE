import { useQuery } from "@tanstack/react-query";
import { fetchTikTradeFlow } from "@/service/komoditas-utama";

type UseTikTradeFlowQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function useTikTradeFlowQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UseTikTradeFlowQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "tik",
      "trade-flow",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchTikTradeFlow({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
