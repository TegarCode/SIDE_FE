import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorTradeCountries,
  fetchDataGeneratorTradeCountriesByGroup,
  fetchDataGeneratorTradeCountryGroups,
  fetchDataGeneratorTradeHsCodes,
  fetchDataGeneratorTradeSources,
  fetchDataGeneratorTradeYears
} from "@/service/data-generator";

export function useDataGeneratorTradeCountriesQuery() {
  return useQuery({
    queryKey: ["data-generator", "trade", "countries"],
    queryFn: fetchDataGeneratorTradeCountries,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorTradeCountryGroupsQuery() {
  return useQuery({
    queryKey: ["data-generator", "trade", "country-groups"],
    queryFn: fetchDataGeneratorTradeCountryGroups,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorTradeYearsQuery() {
  return useQuery({
    queryKey: ["data-generator", "trade", "years"],
    queryFn: fetchDataGeneratorTradeYears,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorTradeSourcesQuery() {
  return useQuery({
    queryKey: ["data-generator", "trade", "sources"],
    queryFn: fetchDataGeneratorTradeSources,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorTradeHsCodesQuery(level: string | null) {
  return useQuery({
    queryKey: ["data-generator", "trade", "hs-codes", level ?? "4"],
    queryFn: () => fetchDataGeneratorTradeHsCodes(level ?? "4"),
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorTradeCountriesByGroupQuery(
  groupId: string | null
) {
  return useQuery({
    queryKey: ["data-generator", "trade", "group-countries", groupId],
    queryFn: () => fetchDataGeneratorTradeCountriesByGroup(groupId ?? ""),
    enabled: Boolean(groupId),
    staleTime: 1000 * 60 * 10
  });
}
