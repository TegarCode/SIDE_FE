import { useQuery } from "@tanstack/react-query";
import { fetchTikHsCodeGroups } from "@/service/komoditas-utama";

export function useTikHsCodeGroupsQuery(enabled = true) {
  return useQuery({
    queryKey: ["indonesia", "komoditas-utama", "tik", "hscode-groups"],
    queryFn: fetchTikHsCodeGroups,
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
