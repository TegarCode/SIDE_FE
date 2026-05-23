import { useQuery } from "@tanstack/react-query";
import { fetchHilirisasiHsCodeGroups } from "@/service/komoditas-utama";

export function useHilirisasiHsCodeGroupsQuery(enabled = true) {
  return useQuery({
    queryKey: ["indonesia", "komoditas-utama", "hilirisasi", "hscode-groups"],
    queryFn: fetchHilirisasiHsCodeGroups,
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
