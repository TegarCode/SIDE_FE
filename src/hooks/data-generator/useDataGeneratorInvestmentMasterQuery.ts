import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorInvestmentCountries,
  fetchDataGeneratorInvestmentCountriesByGroup,
  fetchDataGeneratorInvestmentCountryGroups,
  fetchDataGeneratorInvestmentSources,
  fetchDataGeneratorInvestmentYears
} from "@/service/data-generator";

export function useDataGeneratorInvestmentCountriesQuery() {
  return useQuery({
    queryKey: ["data-generator", "investment", "countries"],
    queryFn: fetchDataGeneratorInvestmentCountries,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorInvestmentCountryGroupsQuery() {
  return useQuery({
    queryKey: ["data-generator", "investment", "country-groups"],
    queryFn: fetchDataGeneratorInvestmentCountryGroups,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorInvestmentYearsQuery() {
  return useQuery({
    queryKey: ["data-generator", "investment", "years"],
    queryFn: fetchDataGeneratorInvestmentYears,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorInvestmentSourcesQuery() {
  return useQuery({
    queryKey: ["data-generator", "investment", "sources"],
    queryFn: fetchDataGeneratorInvestmentSources,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorInvestmentCountriesByGroupQuery(
  groupId: string | null
) {
  return useQuery({
    queryKey: ["data-generator", "investment", "group-countries", groupId],
    queryFn: () => fetchDataGeneratorInvestmentCountriesByGroup(groupId ?? ""),
    enabled: Boolean(groupId),
    staleTime: 1000 * 60 * 10
  });
}
