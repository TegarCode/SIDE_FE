import { useQuery } from "@tanstack/react-query";
import { fetchPanganTradeProducts } from "@/service/komoditas-utama";

type UsePanganTradeProductsQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function usePanganTradeProductsQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UsePanganTradeProductsQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "pangan",
      "trade-products",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchPanganTradeProducts({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
