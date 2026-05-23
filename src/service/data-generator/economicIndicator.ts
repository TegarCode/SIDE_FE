import { apiClient } from "@/service/httpClient";
import type { SelectOption } from "@/type/indonesiaDiplomasi";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  if (Array.isArray(value.data)) return value.data;
  if (isRecord(value.data) && Array.isArray(value.data.data))
    return value.data.data;
  if (Array.isArray(value.items)) return value.items;
  return [];
}

function asString(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

export type DataGeneratorEconomicIndicatorTableParams = {
  indicator_id: number;
  yearFrom: number;
  yearTo: number;
  viewType: "table";
};

export type DataGeneratorEconomicIndicatorVisualizationParams = Omit<
  DataGeneratorEconomicIndicatorTableParams,
  "viewType"
> & {
  viewType: "chart";
};

export async function fetchDataGeneratorEconomicIndicatorOptions(): Promise<
  SelectOption[]
> {
  const response = await apiClient.get("/api/v1/indikator-index-ekonomi-all");
  return unwrapArray(response.data)
    .filter(isRecord)
    .map((item) => ({
      value: asString(item.value || item.id),
      label: asString(item.label || item.nama || item.name)
    }))
    .filter((item) => Boolean(item.value && item.label));
}

export async function fetchDataGeneratorEconomicIndicatorYears(): Promise<
  SelectOption[]
> {
  const response = await apiClient.get("/api/v1/tahun-kinerja-ekonomi");
  return unwrapArray(response.data)
    .filter((item) => item != null)
    .map((item) => {
      if (isRecord(item)) {
        const raw = item.value ?? item.tahun ?? item.Tahun;
        const year = asString(raw);
        return year ? { value: year, label: year } : null;
      }
      const year = asString(item);
      return year ? { value: year, label: year } : null;
    })
    .filter((item): item is SelectOption => item !== null);
}

export async function fetchDataGeneratorEconomicIndicatorTable(
  params: DataGeneratorEconomicIndicatorTableParams
) {
  const response = await apiClient.post(
    "/api/v1/data-generator/kinerja-ekonomi/tablefilter",
    params
  );
  return response.data;
}

export async function fetchDataGeneratorEconomicIndicatorVisualization(
  params: DataGeneratorEconomicIndicatorVisualizationParams
) {
  const response = await apiClient.post(
    "/api/v1/data-generator/kinerja-ekonomi/visualizationfilter",
    params
  );
  return response.data;
}
