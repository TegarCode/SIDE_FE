import { useQuery } from "@tanstack/react-query";
import { fetchPertahananTradeProducts } from "@/service/komoditas-utama";

type UsePertahananTradeProductsQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function usePertahananTradeProductsQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UsePertahananTradeProductsQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "pertahanan",
      "trade-products",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchPertahananTradeProducts({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
