import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useCommonCountriesQuery } from "@/hooks/indonesia/useCountryGeoQueries";
import {
  fetchMitraWilayah,
  normalizeCountriesFromCommon
} from "@/service/mitra/master";

export function useMitraMasterQuery() {
  const wilayahQuery = useQuery({
    queryKey: ["mitra", "wilayah"],
    queryFn: fetchMitraWilayah,
    staleTime: 1000 * 60 * 10,
    retry: false
  });
  const countriesQuery = useCommonCountriesQuery();

  const data = React.useMemo(() => {
    if (!wilayahQuery.data || !countriesQuery.data) return undefined;
    return {
      regionOptions: wilayahQuery.data.regionOptions,
      subregionOptions: wilayahQuery.data.subregionOptions,
      countryOptions: normalizeCountriesFromCommon(countriesQuery.data)
    };
  }, [countriesQuery.data, wilayahQuery.data]);

  return {
    data,
    isLoading: wilayahQuery.isLoading || countriesQuery.isLoading,
    isFetching: wilayahQuery.isFetching || countriesQuery.isFetching,
    error: wilayahQuery.error ?? countriesQuery.error
  };
}
