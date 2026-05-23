import { useQuery } from "@tanstack/react-query";
import { fetchInfrastrukturPameranPerwakilan } from "@/service/indonesia/infrastruktur";
import type { InfrastrukturPameranPerwakilanParams } from "@/type/indonesiaInfrastruktur";

export function useInfrastrukturPameranPerwakilanQuery(
  params: InfrastrukturPameranPerwakilanParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["indonesia", "infrastruktur", "pameran-perwakilan", params],
    queryFn: () => {
      if (!params)
        throw new Error("Parameter pameran perwakilan belum lengkap.");
      return fetchInfrastrukturPameranPerwakilan(params);
    },
    enabled: enabled && Boolean(params),
    staleTime: 1000 * 60 * 5,
    retry: false
  });
}
