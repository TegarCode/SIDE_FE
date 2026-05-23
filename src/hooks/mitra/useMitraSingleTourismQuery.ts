import { useQuery } from "@tanstack/react-query";
import { fetchMitraSingleTourism } from "@/service/mitra";

export function useMitraSingleTourismQuery(country: string | null) {
  return useQuery({
    queryKey: ["mitra", "pariwisata", "single", country],
    queryFn: () => fetchMitraSingleTourism(country ?? ""),
    enabled: Boolean(country),
    staleTime: 0,
    refetchOnMount: "always",
    retry: false
  });
}
