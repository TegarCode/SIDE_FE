import { useQuery } from "@tanstack/react-query";
import { fetchEnergyTradeProducts } from "@/service/komoditas-utama";

type UseEnergyTradeProductsQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function useEnergyTradeProductsQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UseEnergyTradeProductsQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "energi",
      "trade-products",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchEnergyTradeProducts({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
