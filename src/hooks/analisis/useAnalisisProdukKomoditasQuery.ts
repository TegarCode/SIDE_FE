import { useQuery } from "@tanstack/react-query";
import { fetchAnalisisKomoditasEksporUtama } from "@/service/analisis";

type UseAnalisisProdukKomoditasQueryParams = {
  origin: string | null;
  dest: string[];
  enabled?: boolean;
};

export function useAnalisisProdukKomoditasQuery({
  origin,
  dest,
  enabled = true
}: UseAnalisisProdukKomoditasQueryParams) {
  return useQuery({
    queryKey: ["analisis", "komoditas-ekspor-utama", origin ?? null, dest],
    queryFn: () =>
      fetchAnalisisKomoditasEksporUtama({
        origin: origin ?? "",
        dest
      }),
    enabled: enabled && Boolean(origin) && dest.length > 0,
    staleTime: 1000 * 60 * 10
  });
}
