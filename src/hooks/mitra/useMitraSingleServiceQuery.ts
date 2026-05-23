import { useQuery } from "@tanstack/react-query";
import { fetchMitraSingleService } from "@/service/mitra";

export function useMitraSingleServiceQuery(country: string | null) {
  return useQuery({
    queryKey: ["mitra", "jasa", "single", country],
    queryFn: () => fetchMitraSingleService(country ?? ""),
    enabled: Boolean(country),
    staleTime: 0,
    refetchOnMount: "always",
    retry: false
  });
}
