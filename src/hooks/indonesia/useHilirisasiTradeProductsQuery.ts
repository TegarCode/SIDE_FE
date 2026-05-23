import { useQuery } from "@tanstack/react-query";
import { fetchHilirisasiTradeProducts } from "@/service/komoditas-utama";

type UseHilirisasiTradeProductsQueryParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
  enabled?: boolean;
};

export function useHilirisasiTradeProductsQuery({
  origin,
  dest,
  hsList,
  enabled = true
}: UseHilirisasiTradeProductsQueryParams) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "hilirisasi",
      "trade-products",
      origin ?? [],
      dest ?? [],
      hsList ?? []
    ],
    queryFn: () =>
      fetchHilirisasiTradeProducts({
        origin,
        dest,
        hsList
      }),
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
