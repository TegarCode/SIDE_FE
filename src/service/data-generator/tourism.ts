import { apiClient } from "@/service/httpClient";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import {
  fetchDataGeneratorTradeCountries,
  fetchDataGeneratorTradeCountriesByGroup,
  fetchDataGeneratorTradeCountryGroups,
  type DataGeneratorTradeCountryGroupOption,
  type DataGeneratorTradeCountryOption
} from "./trade";

export type DataGeneratorTourismCountryOption = DataGeneratorTradeCountryOption;
export type DataGeneratorTourismCountryGroupOption =
  DataGeneratorTradeCountryGroupOption;

export type DataGeneratorTourismTableParams = {
  origins: string[];
  destinations: string[];
  originGroups: string[];
  destinationGroups: string[];
  sourceCode: number;
  typeData: string;
  yearFrom: number;
  yearTo: number;
  viewType: "table";
};

export type DataGeneratorTourismVisualizationParams = Omit<
  DataGeneratorTourismTableParams,
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

export async function fetchDataGeneratorTourismCountries(): Promise<
  DataGeneratorTourismCountryOption[]
> {
  return fetchDataGeneratorTradeCountries();
}

export async function fetchDataGeneratorTourismCountryGroups(): Promise<
  DataGeneratorTourismCountryGroupOption[]
> {
  return fetchDataGeneratorTradeCountryGroups();
}

export async function fetchDataGeneratorTourismCountriesByGroup(
  groupId: string
): Promise<string[]> {
  return fetchDataGeneratorTradeCountriesByGroup(groupId);
}

export async function fetchDataGeneratorTourismYears(): Promise<
  SelectOption[]
> {
  const response = await apiClient.get(
    "/api/v1/data-generator/pariwisata/tahun-pariwisata"
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

export async function fetchDataGeneratorTourismSources(): Promise<
  SelectOption[]
> {
  const response = await apiClient.get(
    "/api/v1/data-generator/pariwisata/kode-sumber"
  );
  return unwrapArray(response.data)
    .filter(isRecord)
    .map((item) => ({
      value: asString(item.id || item.value || item.kode),
      label: asString(item.name || item.nama || item.label)
    }))
    .filter((item) => Boolean(item.value && item.label));
}

export async function fetchDataGeneratorTourismTable(
  params: DataGeneratorTourismTableParams
) {
  const response = await apiClient.post(
    "/api/v1/data-generator/pariwisata/tablefilter",
    params
  );
  return response.data;
}

export async function fetchDataGeneratorTourismVisualization(
  params: DataGeneratorTourismVisualizationParams
) {
  const response = await apiClient.post(
    "/api/v1/data-generator/pariwisata/visualizationfilter",
    params
  );
  return response.data;
}
