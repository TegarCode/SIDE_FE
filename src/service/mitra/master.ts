import {
  fetchCommonCountries,
  type CommonCountryItem
} from "@/service/commonGeoService";
import { apiClient } from "@/service/httpClient";
import type {
  MitraCountryOption,
  MitraMasterData,
  MitraSubregionOption
} from "@/type/mitra";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.items)) return value.items;
  if (isRecord(value.data) && Array.isArray(value.data.items))
    return value.data.items;
  return [];
}

function sortByLabel<T extends { label: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    left.label.localeCompare(right.label, "id-ID", { sensitivity: "base" })
  );
}

export function normalizeWilayah(payload: unknown) {
  const rows = unwrapArrayPayload(payload).filter(isRecord);
  const regionOptions: Array<{ value: string; label: string }> = [];
  const subregionOptions: MitraSubregionOption[] = [];

  rows.forEach((item) => {
    const regionLabel = typeof item.nama === "string" ? item.nama : "";
    if (!regionLabel) return;

    regionOptions.push({ value: regionLabel, label: regionLabel });

    const wilayah = Array.isArray(item.wilayah) ? item.wilayah : [];
    wilayah.filter(isRecord).forEach((entry) => {
      const subregionValue = typeof entry.id === "string" ? entry.id : "";
      const subregionLabel =
        typeof entry.nama === "string" ? entry.nama : subregionValue;
      if (!subregionValue || !subregionLabel) return;

      subregionOptions.push({
        value: subregionValue,
        label: `${subregionLabel} (${subregionValue})`,
        regionValue: regionLabel
      });
    });
  });

  return {
    regionOptions: sortByLabel(regionOptions),
    subregionOptions: sortByLabel(subregionOptions)
  };
}

export function normalizeCountries(payload: unknown): MitraCountryOption[] {
  const items: MitraCountryOption[] = [];

  unwrapArrayPayload(payload)
    .filter(isRecord)
    .forEach((item) => {
      const value = typeof item.id === "string" ? item.id : "";
      const label = typeof item.nama === "string" ? item.nama : value;
      const wilayah = isRecord(item.wilayah) ? item.wilayah : null;
      const dirjen =
        wilayah && isRecord(wilayah.dirjen) ? wilayah.dirjen : null;

      if (!value || !label) return;

      items.push({
        value,
        label,
        alpha2: typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null,
        regionValue:
          dirjen && typeof dirjen.nama === "string" ? dirjen.nama : null,
        subregionValue:
          wilayah && typeof wilayah.id === "string" ? wilayah.id : null
      });
    });

  return sortByLabel(items);
}

export function normalizeCountriesFromCommon(
  items: CommonCountryItem[]
): MitraCountryOption[] {
  return sortByLabel(
    items.map((item) => ({
      value: item.id,
      label: item.nama,
      alpha2: item.kode_alpha2,
      regionValue: item.dirjenNama,
      subregionValue: item.wilayahId
    }))
  );
}

export async function fetchMitraWilayah() {
  const wilayahResponse = await apiClient.get("/api/v1/wilayah");
  return normalizeWilayah(wilayahResponse.data);
}

export async function fetchMitraMaster(): Promise<MitraMasterData> {
  const [wilayah, countries] = await Promise.all([
    fetchMitraWilayah(),
    fetchCommonCountries()
  ]);

  return {
    regionOptions: wilayah.regionOptions,
    subregionOptions: wilayah.subregionOptions,
    countryOptions: normalizeCountriesFromCommon(countries)
  };
}
