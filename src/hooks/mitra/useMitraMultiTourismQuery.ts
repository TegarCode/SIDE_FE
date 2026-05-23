import { useQuery } from "@tanstack/react-query";
import { fetchMitraMultiTourism } from "@/service/mitra";

export function useMitraMultiTourismQuery(
  origins: string[],
  destinations: string[]
) {
  return useQuery({
    queryKey: ["mitra", "pariwisata", "multi", { origins, destinations }],
    queryFn: () => fetchMitraMultiTourism(origins, destinations),
    enabled: origins.length > 0 && destinations.length > 0,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false
  });
}
