import { useQuery } from "@tanstack/react-query";
import { fetchKesehatanTradeProducts } from "@/service/komoditas-utama";

type UseKesehatanTradeProductsQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function useKesehatanTradeProductsQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UseKesehatanTradeProductsQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "kesehatan",
      "trade-products",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchKesehatanTradeProducts({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
