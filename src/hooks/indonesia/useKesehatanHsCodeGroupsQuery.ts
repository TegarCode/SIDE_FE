import { useQuery } from "@tanstack/react-query";
import { fetchKesehatanHsCodeGroups } from "@/service/komoditas-utama";

export function useKesehatanHsCodeGroupsQuery(enabled = true) {
  return useQuery({
    queryKey: ["indonesia", "komoditas-utama", "kesehatan", "hscode-groups"],
    queryFn: fetchKesehatanHsCodeGroups,
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
