import { apiClient } from "@/service/httpClient";
import type {
  DiplomasiCompetitionInsightParams,
  SelectOption
} from "@/type/indonesiaDiplomasi";
import { normalizeSimpleOptions, parseJsonPayload } from "./shared";

export async function fetchDiplomasiHsProductOptions(): Promise<
  SelectOption[]
> {
  const response = await apiClient.get("/api/v1/hsproduk");
  return normalizeSimpleOptions(response.data);
}

export async function fetchDiplomasiTradeCompetitionInsight(
  payload: DiplomasiCompetitionInsightParams
): Promise<unknown> {
  const response = await apiClient.post(
    "/api/v1/indonesia/kerjasama-bilateral/nilai-perdagangan/insight-tujuan-kompetitor",
    payload
  );

  return parseJsonPayload(response.data);
}
