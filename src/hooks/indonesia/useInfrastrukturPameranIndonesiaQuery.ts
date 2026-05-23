import { useQuery } from "@tanstack/react-query";
import { fetchInfrastrukturPameranIndonesia } from "@/service/indonesia/infrastruktur";
import type { InfrastrukturPameranIndonesiaParams } from "@/type/indonesiaInfrastruktur";

export function useInfrastrukturPameranIndonesiaQuery(
  params: InfrastrukturPameranIndonesiaParams | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["indonesia", "infrastruktur", "pameran-indonesia", params],
    queryFn: () => {
      if (!params)
        throw new Error("Parameter pameran Indonesia belum lengkap.");
      return fetchInfrastrukturPameranIndonesia(params);
    },
    enabled: enabled && Boolean(params),
    staleTime: 1000 * 60 * 5,
    retry: false
  });
}
