import { apiClient } from "@/service/httpClient";
import type {
  DiplomasiApiParams,
  DiplomasiStatsData
} from "@/type/indonesiaDiplomasi";
import { normalizeStatsData } from "./shared";

export async function fetchDiplomasiStats(
  params: DiplomasiApiParams
): Promise<DiplomasiStatsData> {
  const response = await apiClient.get(
    "/api/v1/indonesia/diplomasi-ekonomi/stats",
    {
      params
    }
  );
  return normalizeStatsData(response.data);
}
