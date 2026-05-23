import { useQuery } from "@tanstack/react-query";
import { fetchEnergyHsCodeGroups } from "@/service/komoditas-utama";

export function useEnergyHsCodeGroupsQuery(enabled = true) {
  return useQuery({
    queryKey: ["indonesia", "komoditas-utama", "energi", "hscode-groups"],
    queryFn: fetchEnergyHsCodeGroups,
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
