import { useQuery } from "@tanstack/react-query";
import {
  fetchAnalisisGeopolitikPerdagangan,
  fetchAnalisisGeopolitikPerdaganganDefaultYears
} from "@/service/analisis";
import type { AnalisisGeopolitikPerdaganganResult } from "@/type/analisis";

export function useAnalisisGeopolitikPerdaganganYearsQuery() {
  return useQuery<number[]>({
    queryKey: ["analisis", "geopolitik-perdagangan", "years"],
    queryFn: () => fetchAnalisisGeopolitikPerdaganganDefaultYears(),
    staleTime: 1000 * 60 * 30
  });
}

export function useAnalisisGeopolitikPerdaganganQuery(
  year: number | null,
  enabled = true
) {
  return useQuery<AnalisisGeopolitikPerdaganganResult>({
    queryKey: ["analisis", "geopolitik-perdagangan", year ?? null],
    queryFn: () => fetchAnalisisGeopolitikPerdagangan(year ?? 0),
    enabled: enabled && year != null,
    staleTime: 1000 * 60 * 10
  });
}
