import { apiClient } from "@/service/httpClient";
import type { EconomicIndicatorMasterData } from "@/type/indonesiaIndikatorEkonomi";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.items)) return value.items;
  return [];
}

function normalizeYearOptions(payload: unknown) {
  return unwrapArrayPayload(payload)
    .filter(isRecord)
    .map((item) => {
      const year =
        typeof item.Tahun === "string"
          ? item.Tahun
          : typeof item.tahun === "string"
            ? item.tahun
            : "";
      return year ? { value: year, label: year } : null;
    })
    .filter((item): item is { value: string; label: string } => Boolean(item));
}

function normalizeIndicatorOptions(payload: unknown) {
  return unwrapArrayPayload(payload)
    .filter(isRecord)
    .map((item) => {
      const value = item.value != null ? String(item.value) : "";
      const label = typeof item.label === "string" ? item.label : value;
      return value ? { value, label } : null;
    })
    .filter((item): item is { value: string; label: string } => Boolean(item));
}

export async function fetchIndikatorEkonomiMaster(): Promise<EconomicIndicatorMasterData> {
  const [yearResponse, indicatorResponse] = await Promise.all([
    apiClient.get("/api/v1/tahun-kinerja-ekonomi"),
    apiClient.get("/api/v1/indikator-index-ekonomi")
  ]);

  return {
    yearOptions: normalizeYearOptions(yearResponse.data),
    indicatorOptions: normalizeIndicatorOptions(indicatorResponse.data)
  };
}
