import { useQuery } from "@tanstack/react-query";
import { fetchMineralKritisTradeProducts } from "@/service/komoditas-utama";

type UseMineralKritisTradeProductsQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function useMineralKritisTradeProductsQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UseMineralKritisTradeProductsQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "mineral-kritis",
      "trade-products",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchMineralKritisTradeProducts({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
