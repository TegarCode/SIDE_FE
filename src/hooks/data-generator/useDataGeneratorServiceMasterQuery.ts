import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorServiceCountries,
  fetchDataGeneratorServiceCountriesByGroup,
  fetchDataGeneratorServiceCountryGroups,
  fetchDataGeneratorServiceProfessions,
  fetchDataGeneratorServiceSources,
  fetchDataGeneratorServiceYears
} from "@/service/data-generator";

export function useDataGeneratorServiceCountriesQuery() {
  return useQuery({
    queryKey: ["data-generator", "service", "countries"],
    queryFn: fetchDataGeneratorServiceCountries,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorServiceCountryGroupsQuery() {
  return useQuery({
    queryKey: ["data-generator", "service", "country-groups"],
    queryFn: fetchDataGeneratorServiceCountryGroups,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorServiceCountriesByGroupQuery(
  groupId: string | null
) {
  return useQuery({
    queryKey: ["data-generator", "service", "group-countries", groupId],
    queryFn: () => fetchDataGeneratorServiceCountriesByGroup(groupId ?? ""),
    enabled: Boolean(groupId),
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorServiceYearsQuery() {
  return useQuery({
    queryKey: ["data-generator", "service", "years"],
    queryFn: fetchDataGeneratorServiceYears,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorServiceSourcesQuery() {
  return useQuery({
    queryKey: ["data-generator", "service", "sources"],
    queryFn: fetchDataGeneratorServiceSources,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorServiceProfessionsQuery() {
  return useQuery({
    queryKey: ["data-generator", "service", "professions"],
    queryFn: fetchDataGeneratorServiceProfessions,
    staleTime: 1000 * 60 * 10
  });
}
