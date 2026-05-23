import { useQuery } from "@tanstack/react-query";
import { fetchMineralKritisHsCodeGroups } from "@/service/komoditas-utama";

export function useMineralKritisHsCodeGroupsQuery(enabled = true) {
  return useQuery({
    queryKey: [
      "indonesia",
      "komoditas-utama",
      "mineral-kritis",
      "hscode-groups"
    ],
    queryFn: fetchMineralKritisHsCodeGroups,
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
