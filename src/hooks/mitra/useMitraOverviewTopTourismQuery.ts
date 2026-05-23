import { useQuery } from "@tanstack/react-query";
import { fetchMitraOverviewTopTourism } from "@/service/mitra";

export function useMitraOverviewTopTourismQuery(country: string | null) {
  return useQuery({
    queryKey: ["mitra", "overview", "top-tourism", country],
    queryFn: () => fetchMitraOverviewTopTourism(country ?? ""),
    enabled: Boolean(country),
    staleTime: 0,
    refetchOnMount: "always",
    retry: false
  });
}
