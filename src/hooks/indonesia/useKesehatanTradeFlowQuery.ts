import { useQuery } from "@tanstack/react-query";
import { fetchKesehatanTradeFlow } from "@/service/komoditas-utama";

type UseKesehatanTradeFlowQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function useKesehatanTradeFlowQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UseKesehatanTradeFlowQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "kesehatan",
      "trade-flow",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchKesehatanTradeFlow({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
