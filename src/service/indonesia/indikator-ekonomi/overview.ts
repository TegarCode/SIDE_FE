import { apiClient } from "@/service/httpClient";
import type {
  EconomicIndicatorOverviewData,
  EconomicIndicatorOverviewParams
} from "@/type/indonesiaIndikatorEkonomi";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function fetchIndikatorEkonomiOverview(
  params: EconomicIndicatorOverviewParams
): Promise<EconomicIndicatorOverviewData> {
  const response = await apiClient.get("/api/v1/indonesia/kinerja-ekonomi", {
    params
  });
  const payload = response.data;
  const root = isRecord(payload) ? payload : {};
  const data = isRecord(root.data) ? root.data : {};
  const meta = isRecord(root.meta) ? root.meta : {};
  const items = Array.isArray(data.kinerja)
    ? data.kinerja.filter(isRecord)
    : [];

  return {
    raw: payload,
    meta,
    items
  };
}
