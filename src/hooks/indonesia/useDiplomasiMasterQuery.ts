import { useQuery } from "@tanstack/react-query";
import { fetchDiplomasiMaster } from "@/service/indonesia/diplomasi-ekonomi";

export function useDiplomasiMasterQuery() {
  return useQuery({
    queryKey: ["indonesia", "diplomasi-ekonomi", "master"],
    queryFn: fetchDiplomasiMaster,
    staleTime: 1000 * 60 * 10
  });
}
