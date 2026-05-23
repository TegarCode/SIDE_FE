import { useQuery } from "@tanstack/react-query";
import {
  fetchCommonCountries,
  fetchCommonCountriesRcaCmsa,
  fetchCountriesByGroup,
  fetchCountryGroups
} from "@/service/commonGeoService";

export function useCommonCountriesQuery() {
  return useQuery({
    queryKey: ["common-geo", "countries"],
    queryFn: fetchCommonCountries,
    staleTime: 1000 * 60 * 10
  });
}

export function useCommonCountriesRcaCmsaQuery() {
  return useQuery({
    queryKey: ["common-geo", "countries-rca-cmsa"],
    queryFn: fetchCommonCountriesRcaCmsa,
    staleTime: 1000 * 60 * 10
  });
}

export function useCountryGroupsQuery() {
  return useQuery({
    queryKey: ["common-geo", "groups"],
    queryFn: fetchCountryGroups,
    staleTime: 1000 * 60 * 10
  });
}

export function useCountriesByGroupQuery(
  groupId: string | null,
  enabled = true
) {
  return useQuery({
    queryKey: ["common-geo", "group-countries", groupId],
    queryFn: () => fetchCountriesByGroup(groupId ?? ""),
    enabled: enabled && Boolean(groupId),
    staleTime: 1000 * 60 * 10
  });
}
