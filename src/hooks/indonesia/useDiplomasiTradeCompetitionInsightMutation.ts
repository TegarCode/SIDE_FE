import { useMutation } from "@tanstack/react-query";
import { fetchDiplomasiTradeCompetitionInsight } from "@/service/indonesia/diplomasi-ekonomi";
import type { DiplomasiCompetitionInsightParams } from "@/type/indonesiaDiplomasi";

export function useDiplomasiTradeCompetitionInsightMutation() {
  return useMutation({
    mutationFn: (payload: DiplomasiCompetitionInsightParams) =>
      fetchDiplomasiTradeCompetitionInsight(payload)
  });
}
