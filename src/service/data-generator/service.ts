import { apiClient } from "@/service/httpClient";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import {
  fetchDataGeneratorTradeCountries,
  fetchDataGeneratorTradeCountriesByGroup,
  fetchDataGeneratorTradeCountryGroups,
  type DataGeneratorTradeCountryGroupOption,
  type DataGeneratorTradeCountryOption
} from "./trade";

export type DataGeneratorServiceCountryOption = DataGeneratorTradeCountryOption;
export type DataGeneratorServiceCountryGroupOption =
  DataGeneratorTradeCountryGroupOption;

export type DataGeneratorServiceProfessionOption = SelectOption & {
  category: string;
};

export type DataGeneratorServiceTableParams = {
  origins: string[];
  destinations: string[];
  originGroups: string[];
  destinationGroups: string[];
  sourceCode: number;
  idProfesi: string[];
  gender: string;
  yearFrom: number;
  yearTo: number;
  viewType: "table";
};

export type DataGeneratorServiceVisualizationParams = Omit<
  DataGeneratorServiceTableParams,
  "viewType"
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

export async function fetchDataGeneratorServiceCountries(): Promise<
  DataGeneratorServiceCountryOption[]
> {
  return fetchDataGeneratorTradeCountries();
}

export async function fetchDataGeneratorServiceCountryGroups(): Promise<
  DataGeneratorServiceCountryGroupOption[]
> {
  return fetchDataGeneratorTradeCountryGroups();
}

export async function fetchDataGeneratorServiceCountriesByGroup(
  groupId: string
): Promise<string[]> {
  return fetchDataGeneratorTradeCountriesByGroup(groupId);
}

export async function fetchDataGeneratorServiceYears(): Promise<
  SelectOption[]
> {
  const response = await apiClient.get(
    "/api/v1/data-generator/jasa/tahun-jasa"
  );
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

export async function fetchDataGeneratorServiceSources(): Promise<
  SelectOption[]
> {
  const response = await apiClient.get(
    "/api/v1/data-generator/jasa/kode-sumber"
  );
  return unwrapArray(response.data)
    .filter(isRecord)
    .map((item) => ({
      value: asString(item.id || item.value || item.kode),
      label: asString(item.name || item.nama || item.label)
    }))
    .filter((item) => Boolean(item.value && item.label));
}

export async function fetchDataGeneratorServiceProfessions(): Promise<
  DataGeneratorServiceProfessionOption[]
> {
  const response = await apiClient.get("/api/v1/profesi");
  return unwrapArray(response.data)
    .filter(isRecord)
    .map((item) => {
      const id = asString(item.id || item.value);
      const name = asString(item.nama);
      const category = asString(item.kategori);
      if (!id) return null;
      const label =
        name || (category ? `Tanpa Nama (${category})` : `Profesi ${id}`);
      return {
        value: id,
        label,
        category: category || "-"
      };
    })
    .filter(
      (item): item is DataGeneratorServiceProfessionOption => item !== null
    );
}

export async function fetchDataGeneratorServiceTable(
  params: DataGeneratorServiceTableParams
) {
  const response = await apiClient.post(
    "/api/v1/data-generator/jasa/tablefilter",
    params
  );
  return response.data;
}

export async function fetchDataGeneratorServiceVisualization(
  params: DataGeneratorServiceVisualizationParams
) {
  const response = await apiClient.post(
    "/api/v1/data-generator/jasa/visualizationfilter",
    params
  );
  return response.data;
}
