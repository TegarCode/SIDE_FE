import { useQuery } from "@tanstack/react-query";
import { fetchPertahananHsCodeGroups } from "@/service/komoditas-utama";

export function usePertahananHsCodeGroupsQuery(enabled = true) {
  return useQuery({
    queryKey: ["indonesia", "komoditas-utama", "pertahanan", "hscode-groups"],
    queryFn: fetchPertahananHsCodeGroups,
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
