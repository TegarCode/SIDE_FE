import { useQuery } from "@tanstack/react-query";
import { fetchPanganHsCodeGroups } from "@/service/komoditas-utama";

export function usePanganHsCodeGroupsQuery(enabled = true) {
  return useQuery({
    queryKey: ["indonesia", "komoditas-utama", "pangan", "hscode-groups"],
    queryFn: fetchPanganHsCodeGroups,
    enabled,
    staleTime: 1000 * 60 * 10
  });
}
