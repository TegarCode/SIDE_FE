import { useQuery } from "@tanstack/react-query";
import { fetchIndikatorEkonomiMaster } from "@/service/indonesia/indikator-ekonomi";

export function useIndikatorEkonomiMasterQuery() {
  return useQuery({
    queryKey: ["indonesia", "indikator-ekonomi", "master"],
    queryFn: () => fetchIndikatorEkonomiMaster(),
    staleTime: 1000 * 60 * 10
  });
}
