import { useQuery } from "@tanstack/react-query";
import { fetchMitraSingleInvestment } from "@/service/mitra";

export function useMitraSingleInvestmentQuery(country: string | null) {
  return useQuery({
    queryKey: ["mitra", "investasi", "single", country],
    queryFn: () => fetchMitraSingleInvestment(country ?? ""),
    enabled: Boolean(country),
    staleTime: 0,
    refetchOnMount: "always",
    retry: false
  });
}
