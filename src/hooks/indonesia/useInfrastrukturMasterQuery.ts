import { useQuery } from "@tanstack/react-query";
import { fetchInfrastrukturMaster } from "@/service/indonesia/infrastruktur";

export function useInfrastrukturMasterQuery() {
  return useQuery({
    queryKey: ["indonesia", "infrastruktur", "master"],
    queryFn: () => fetchInfrastrukturMaster(),
    staleTime: 1000 * 60 * 10,
    retry: false
  });
}
