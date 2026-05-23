import { useQuery } from "@tanstack/react-query";
import { fetchInfrastrukturPerwakilan } from "@/service/indonesia/infrastruktur";
import type { InfrastrukturPerwakilanParams } from "@/type/indonesiaInfrastruktur";

export function useInfrastrukturPerwakilanQuery(
  params: InfrastrukturPerwakilanParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["indonesia", "infrastruktur", "perwakilan", params],
    queryFn: () => {
      if (!params) throw new Error("Parameter perwakilan belum lengkap.");
      return fetchInfrastrukturPerwakilan(params);
    },
    enabled: enabled && Boolean(params),
    staleTime: 1000 * 60 * 5,
    retry: false
  });
}
