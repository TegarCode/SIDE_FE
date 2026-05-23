import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorTourismCountries,
  fetchDataGeneratorTourismCountriesByGroup,
  fetchDataGeneratorTourismCountryGroups,
  fetchDataGeneratorTourismSources,
  fetchDataGeneratorTourismYears
} from "@/service/data-generator";

export function useDataGeneratorTourismCountriesQuery() {
  return useQuery({
    queryKey: ["data-generator", "tourism", "countries"],
    queryFn: fetchDataGeneratorTourismCountries,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorTourismCountryGroupsQuery() {
  return useQuery({
    queryKey: ["data-generator", "tourism", "country-groups"],
    queryFn: fetchDataGeneratorTourismCountryGroups,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorTourismYearsQuery() {
  return useQuery({
    queryKey: ["data-generator", "tourism", "years"],
    queryFn: fetchDataGeneratorTourismYears,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorTourismSourcesQuery() {
  return useQuery({
    queryKey: ["data-generator", "tourism", "sources"],
    queryFn: fetchDataGeneratorTourismSources,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorTourismCountriesByGroupQuery(
  groupId: string | null
) {
  return useQuery({
    queryKey: ["data-generator", "tourism", "group-countries", groupId],
    queryFn: () => fetchDataGeneratorTourismCountriesByGroup(groupId ?? ""),
    enabled: Boolean(groupId),
    staleTime: 1000 * 60 * 10
  });
}
