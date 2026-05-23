import { useQuery } from "@tanstack/react-query";
import { fetchMitraMultiService } from "@/service/mitra";

export function useMitraMultiServiceQuery(
  origins: string[],
  destinations: string[]
) {
  return useQuery({
    queryKey: ["mitra", "jasa", "multi", { origins, destinations }],
    queryFn: () => fetchMitraMultiService(origins, destinations),
    enabled: origins.length > 0 && destinations.length > 0,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false
  });
}
