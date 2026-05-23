import { useQuery } from "@tanstack/react-query";
import { fetchInfrastrukturPerjanjianAntarNegara } from "@/service/indonesia/infrastruktur";
import type { InfrastrukturPerjanjianAntarNegaraParams } from "@/type/indonesiaInfrastruktur";

export function useInfrastrukturPerjanjianAntarNegaraQuery(
  params: InfrastrukturPerjanjianAntarNegaraParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["indonesia", "infrastruktur", "perjanjian-antar-negara", params],
    queryFn: () => {
      if (!params)
        throw new Error("Parameter perjanjian antar negara belum lengkap.");
      return fetchInfrastrukturPerjanjianAntarNegara(params);
    },
    enabled: enabled && Boolean(params),
    staleTime: 1000 * 60 * 5,
    retry: false
  });
}
