import { useQuery } from "@tanstack/react-query";
import { fetchInfrastrukturPerwakilanAsing } from "@/service/indonesia/infrastruktur";
import type { InfrastrukturPerwakilanAsingParams } from "@/type/indonesiaInfrastruktur";

export function useInfrastrukturPerwakilanAsingQuery(
  params: InfrastrukturPerwakilanAsingParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["indonesia", "infrastruktur", "perwakilan-asing", params],
    queryFn: () => {
      if (!params) throw new Error("Parameter perwakilan asing belum lengkap.");
      return fetchInfrastrukturPerwakilanAsing(params);
    },
    enabled: enabled && Boolean(params),
    staleTime: 1000 * 60 * 5,
    retry: false
  });
}
