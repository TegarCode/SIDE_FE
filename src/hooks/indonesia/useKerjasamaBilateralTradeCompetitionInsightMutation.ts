import { useMutation } from "@tanstack/react-query";
import { fetchKerjasamaBilateralTradeCompetitionInsight } from "@/service/indonesia/kerjasama-bilateral";
import type { BilateralTradeCompetitionInsightParams } from "@/type/indonesiaKerjasamaBilateral";

export function useKerjasamaBilateralTradeCompetitionInsightMutation() {
  return useMutation({
    mutationFn: (payload: BilateralTradeCompetitionInsightParams) =>
      fetchKerjasamaBilateralTradeCompetitionInsight(payload)
  });
}
