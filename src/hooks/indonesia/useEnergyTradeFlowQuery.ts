import { useQuery } from "@tanstack/react-query";
import { fetchEnergyTradeFlow } from "@/service/komoditas-utama";

type UseEnergyTradeFlowQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function useEnergyTradeFlowQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UseEnergyTradeFlowQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "energi",
      "trade-flow",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchEnergyTradeFlow({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
