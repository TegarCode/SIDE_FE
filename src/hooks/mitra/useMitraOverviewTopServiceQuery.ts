import { useQuery } from "@tanstack/react-query";
import { fetchMitraOverviewTopService } from "@/service/mitra";

export function useMitraOverviewTopServiceQuery(country: string | null) {
  return useQuery({
    queryKey: ["mitra", "overview", "top-service", country],
    queryFn: () => fetchMitraOverviewTopService(country ?? ""),
    enabled: Boolean(country),
    staleTime: 0,
    refetchOnMount: "always",
    retry: false
  });
}
