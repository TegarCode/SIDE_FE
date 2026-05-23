import { useQuery } from "@tanstack/react-query";
import { fetchKerjasamaBilateralMaster } from "@/service/indonesia/kerjasama-bilateral";

export function useKerjasamaBilateralMasterQuery() {
  return useQuery({
    queryKey: ["indonesia", "kerjasama-bilateral", "master"],
    queryFn: () => fetchKerjasamaBilateralMaster(),
    staleTime: 1000 * 60 * 10
  });
}
