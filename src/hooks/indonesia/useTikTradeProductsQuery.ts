import { useQuery } from "@tanstack/react-query";
import { fetchTikTradeProducts } from "@/service/komoditas-utama";

type UseTikTradeProductsQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function useTikTradeProductsQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UseTikTradeProductsQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "tik",
      "trade-products",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchTikTradeProducts({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
