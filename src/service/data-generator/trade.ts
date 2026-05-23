import { apiClient } from "@/service/httpClient";
import type { SelectOption } from "@/type/indonesiaDiplomasi";

export type DataGeneratorTradeCountryOption = SelectOption & {
  alpha2: string | null;
};

export type DataGeneratorTradeCountryGroupOption = SelectOption & {
  countries?: string[];
};

export type DataGeneratorTradeTableParams = {
  origins: string[];
  destinations: string[];
  originGroups: string[];
  destinationGroups: string[];
  tradeType: string;
  hsLevel: number;
  product: string[];
  yearFrom: string;
  yearTo: string;
  source: string;
  viewType: "table";
  page: number;
  perPage: number;
};

export type DataGeneratorTradeVisualizationParams = Omit<
  DataGeneratorTradeTableParams,
  "viewType" | "page" | "perPage"
> & {
  viewType: "chart";
};

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

export async function fetchDataGeneratorTradeCountries(): Promise<
  DataGeneratorTradeCountryOption[]
> {
  const response = await apiClient.get("/api/v1/negara");
  return unwrapArray(response.data)
    .filter(isRecord)
    .map((item) => ({
      value: asString(item.id || item.kode_alpha3 || item.value),
      label: asString(item.nama || item.label || item.name),
      alpha2: asString(item.kode_alpha2 || item.alpha2) || null
    }))
    .filter((item) => Boolean(item.value && item.label));
}

export async function fetchDataGeneratorTradeCountryGroups(): Promise<
  DataGeneratorTradeCountryGroupOption[]
> {
  const response = await apiClient.get("/api/v1/grupnegara");
  return unwrapArray(response.data)
    .filter(isRecord)
    .map((item) => ({
      value: asString(item.id || item.value),
      label: asString(item.nama || item.label || item.name)
    }))
    .filter((item) => Boolean(item.value && item.label));
}

export async function fetchDataGeneratorTradeYears(): Promise<SelectOption[]> {
  const response = await apiClient.get("/api/v1/tahun-perdagangan");
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

export async function fetchDataGeneratorTradeSources(): Promise<
  SelectOption[]
> {
  const response = await apiClient.get(
    "/api/v1/data-generator/perdagangan/kode-sumber"
  );
  return unwrapArray(response.data)
    .filter(isRecord)
    .map((item) => ({
      value: asString(item.id || item.value || item.kode),
      label: asString(item.name || item.nama || item.label)
    }))
    .filter((item) => Boolean(item.value && item.label));
}

export async function fetchDataGeneratorTradeHsCodes(
  level: string
): Promise<SelectOption[]> {
  const response = await apiClient.get("/api/v1/hsproduk", {
    params: { level: Number(level) || 4 }
  });

  return unwrapArray(response.data)
    .filter(isRecord)
    .map((item) => {
      const code = asString(
        item.value || item.kode || item.id || item.hs || item.kode_hs
      );
      const name = asString(
        item.label || item.nama || item.name || item.uraian || item.deskripsi
      );
      if (!code) return null;
      return {
        value: code,
        label: name ? `${name}` : code
      };
    })
    .filter((item): item is SelectOption => item !== null);
}

export async function fetchDataGeneratorTradeCountriesByGroup(
  groupId: string
): Promise<string[]> {
  const paramKey = /^[A-Za-z]+$/.test(groupId) ? "ID_Benua" : "ID_Org";
  const response = await apiClient.get("/api/v1/negara", {
    params: { [paramKey]: groupId }
  });

  return unwrapArray(response.data)
    .filter(isRecord)
    .map((item) => asString(item.nama || item.label || item.name))
    .filter(Boolean);
}

export async function fetchDataGeneratorTradeTable(
  params: DataGeneratorTradeTableParams
) {
  const response = await apiClient.post(
    "/api/v1/data-generator/perdagangan/tablefilter",
    params
  );
  return response.data;
}

export async function fetchDataGeneratorTradeVisualization(
  params: DataGeneratorTradeVisualizationParams
) {
  const response = await apiClient.post(
    "/api/v1/data-generator/perdagangan/visualizationfilter",
    params
  );
  return response.data;
}
