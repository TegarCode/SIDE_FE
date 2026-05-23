import { useQuery } from "@tanstack/react-query";
import { fetchMitraMultiInvestment } from "@/service/mitra";

export function useMitraMultiInvestmentQuery(
  origins: string[],
  destinations: string[]
) {
  return useQuery({
    queryKey: ["mitra", "investasi", "multi", { origins, destinations }],
    queryFn: () => fetchMitraMultiInvestment(origins, destinations),
    enabled: origins.length > 0 && destinations.length > 0,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false
  });
}
