import { useQuery } from "@tanstack/react-query";
import {
  fetchDataGeneratorEconomicIndicatorOptions,
  fetchDataGeneratorEconomicIndicatorYears
} from "@/service/data-generator";

export function useDataGeneratorEconomicIndicatorOptionsQuery() {
  return useQuery({
    queryKey: ["data-generator", "economic-indicator", "options"],
    queryFn: fetchDataGeneratorEconomicIndicatorOptions,
    staleTime: 1000 * 60 * 10
  });
}

export function useDataGeneratorEconomicIndicatorYearsQuery() {
  return useQuery({
    queryKey: ["data-generator", "economic-indicator", "years"],
    queryFn: fetchDataGeneratorEconomicIndicatorYears,
    staleTime: 1000 * 60 * 10
  });
}
