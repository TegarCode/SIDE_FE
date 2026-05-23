import { useQuery } from "@tanstack/react-query";
import { fetchDiplomasiHsProductOptions } from "@/service/indonesia/diplomasi-ekonomi";

export function useDiplomasiHsProductQuery(enabled = true) {
  return useQuery({
    queryKey: ["indonesia", "diplomasi-ekonomi", "hs-produk"],
    queryFn: fetchDiplomasiHsProductOptions,
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
