import { useQuery } from "@tanstack/react-query";
import {
  fetchAnalisisRcaCmsa,
  fetchAnalisisRcaCmsaCalculation,
  fetchAnalisisRcaEpd,
  fetchAnalisisRcaEpdCalculation,
  fetchAnalisisRcaEpdComparison,
  fetchAnalisisRscaTbiCalculation,
  fetchAnalisisRscaTbiComparison,
  fetchAnalisisRscaTbi
} from "@/service/analisis";
import type {
  AnalisisRcaEpdCalculationResult,
  AnalisisRcaEpdComparisonResult,
  AnalisisRcaEpdResult,
  AnalisisPotensiDayaSaingCalculationResult,
  AnalisisPotensiDayaSaingOverviewResult,
  AnalisisRscaTbiCalculationResult,
  AnalisisRscaTbiComparisonResult,
  AnalisisRscaTbiResult
} from "@/type/analisis";

type UseAnalisisPotensiDayaSaingQueryParams = {
  tab:
    | "rca_cmsa"
    | "rca_cmsa_calculation"
    | "rsca_tbi"
    | "rsca_tbi_calculation"
    | "rsca_tbi_comparison"
    | "rca_epd"
    | "rca_epd_calculation"
    | "rca_epd_comparison";
  origin: string | null;
  dest: string | null;
  level?: number;
  x_model?: string | null;
  enabled?: boolean;
};

export function useAnalisisPotensiDayaSaingQuery({
  tab,
  origin,
  dest,
  level,
  x_model,
  enabled = true
}: UseAnalisisPotensiDayaSaingQueryParams) {
  return useQuery<
    | AnalisisPotensiDayaSaingOverviewResult
    | AnalisisPotensiDayaSaingCalculationResult
    | AnalisisRscaTbiResult
    | AnalisisRscaTbiCalculationResult
    | AnalisisRscaTbiComparisonResult
    | AnalisisRcaEpdResult
    | AnalisisRcaEpdCalculationResult
    | AnalisisRcaEpdComparisonResult
  >({
    queryKey: [
      "analisis",
      "potensi-daya-saing",
      tab,
      origin ?? null,
      dest ?? null,
      level ?? null,
      x_model ?? null
    ],
    queryFn: () => {
      const params = {
        origin: origin ?? "",
        dest: dest ?? "",
        level,
        x_model
      };

      if (tab === "rca_cmsa") {
        return fetchAnalisisRcaCmsa(params);
      }

      if (tab === "rca_cmsa_calculation") {
        return fetchAnalisisRcaCmsaCalculation(params);
      }

      if (tab === "rsca_tbi") {
        return fetchAnalisisRscaTbi(params);
      }

      if (tab === "rsca_tbi_calculation") {
        return fetchAnalisisRscaTbiCalculation(params);
      }

      if (tab === "rsca_tbi_comparison") {
        return fetchAnalisisRscaTbiComparison(params);
      }

      if (tab === "rca_epd") {
        return fetchAnalisisRcaEpd(params);
      }

      if (tab === "rca_epd_calculation") {
        return fetchAnalisisRcaEpdCalculation(params);
      }

      if (tab === "rca_epd_comparison") {
        return fetchAnalisisRcaEpdComparison(params);
      }

      return fetchAnalisisRscaTbi(params);
    },
    enabled: enabled && Boolean(origin) && Boolean(dest),
    staleTime: 1000 * 60 * 10
  });
}
