import { apiClient } from "@/service/httpClient";

export type CommonCountryItem = {
  id: string;
  nama: string;
  kode_alpha2: string | null;
  dirjenId: string | null;
  dirjenNama: string | null;
  wilayahId: string | null;
  wilayahNama: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.items)) return value.items;
  return [];
}

let commonCountriesPromise: Promise<CommonCountryItem[]> | null = null;
let commonCountriesRcaCmsaPromise: Promise<CommonCountryItem[]> | null = null;
let countryGroupsPromise: Promise<
  Array<{ value: string; label: string; tipe: string | null }>
> | null = null;
const countriesByGroupPromise = new Map<
  string,
  Promise<Array<{ value: string; label: string; kode_alpha2: string | null }>>
>();

export async function fetchCommonCountries(): Promise<CommonCountryItem[]> {
  if (commonCountriesPromise) return commonCountriesPromise;

  commonCountriesPromise = apiClient
    .get("/api/v1/common-negara")
    .then((response) =>
      unwrapArray(response.data)
        .filter(isRecord)
        .map((item) => ({
          id: String(item.id ?? ""),
          nama: String(item.nama ?? ""),
          kode_alpha2:
            typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null,
          dirjenId:
            item.wilayah &&
            isRecord(item.wilayah) &&
            isRecord(item.wilayah.dirjen)
              ? String(item.wilayah.dirjen.id ?? "")
              : null,
          dirjenNama:
            item.wilayah &&
            isRecord(item.wilayah) &&
            isRecord(item.wilayah.dirjen)
              ? String(item.wilayah.dirjen.nama ?? "")
              : null,
          wilayahId:
            item.wilayah && isRecord(item.wilayah)
              ? String(item.wilayah.id ?? "")
              : null,
          wilayahNama:
            item.wilayah && isRecord(item.wilayah)
              ? String(item.wilayah.nama ?? "")
              : null
        }))
        .filter((item) => item.id && item.nama)
    )
    .finally(() => {
      commonCountriesPromise = null;
    });

  return commonCountriesPromise;
}

export async function fetchCommonCountriesRcaCmsa(): Promise<
  CommonCountryItem[]
> {
  if (commonCountriesRcaCmsaPromise) return commonCountriesRcaCmsaPromise;

  commonCountriesRcaCmsaPromise = apiClient
    .get("/api/v1/common-negara-rca-cmsa")
    .then((response) =>
      unwrapArray(response.data)
        .filter(isRecord)
        .map((item) => ({
          id: String(item.id ?? ""),
          nama: String(item.nama ?? ""),
          kode_alpha2:
            typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null,
          dirjenId:
            item.wilayah &&
            isRecord(item.wilayah) &&
            isRecord(item.wilayah.dirjen)
              ? String(item.wilayah.dirjen.id ?? "")
              : null,
          dirjenNama:
            item.wilayah &&
            isRecord(item.wilayah) &&
            isRecord(item.wilayah.dirjen)
              ? String(item.wilayah.dirjen.nama ?? "")
              : null,
          wilayahId:
            item.wilayah && isRecord(item.wilayah)
              ? String(item.wilayah.id ?? "")
              : null,
          wilayahNama:
            item.wilayah && isRecord(item.wilayah)
              ? String(item.wilayah.nama ?? "")
              : null
        }))
        .filter((item) => item.id && item.nama)
    )
    .finally(() => {
      commonCountriesRcaCmsaPromise = null;
    });

  return commonCountriesRcaCmsaPromise;
}

export async function fetchCountryGroups() {
  if (countryGroupsPromise) return countryGroupsPromise;

  countryGroupsPromise = apiClient
    .get("/api/v1/grupnegara")
    .then((response) =>
      unwrapArray(response.data)
        .filter(isRecord)
        .map((item) => ({
          value: String(item.id ?? ""),
          label: String(item.nama ?? ""),
          tipe: typeof item.tipe === "string" ? item.tipe : null
        }))
        .filter((item) => item.value && item.label)
    )
    .finally(() => {
      countryGroupsPromise = null;
    });

  return countryGroupsPromise;
}

export async function fetchCountriesByGroup(groupId: string) {
  const existingPromise = countriesByGroupPromise.get(groupId);
  if (existingPromise) return existingPromise;

  const paramKey = /^[A-Za-z]+$/.test(groupId) ? "ID_Benua" : "ID_Org";
  const requestPromise = apiClient
    .get("/api/v1/negara", {
      params: { [paramKey]: groupId }
    })
    .then((response) =>
      unwrapArray(response.data)
        .filter(isRecord)
        .map((item) => ({
          value: String(item.id ?? ""),
          label: String(item.nama ?? ""),
          kode_alpha2:
            typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null
        }))
        .filter((item) => item.value && item.label)
    )
    .finally(() => {
      countriesByGroupPromise.delete(groupId);
    });

  countriesByGroupPromise.set(groupId, requestPromise);
  return requestPromise;
}
