import { BILATERAL_DEFAULT_PARTNERS } from "@/constants/indonesiaKerjasamaBilateral";
import { apiClient } from "@/service/httpClient";
import type {
  BilateralMasterData,
  BilateralSourceOptionsBySector
} from "@/type/indonesiaKerjasamaBilateral";

let bilateralMasterPromise: Promise<BilateralMasterData> | null = null;

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

function normalizeCountryOptions(payload: unknown) {
  return unwrapArrayPayload(payload)
    .filter(isRecord)
    .map((item) => {
      const alpha3 =
        typeof item.kode_alpha3 === "string"
          ? item.kode_alpha3
          : typeof item.alpha3 === "string"
            ? item.alpha3
            : typeof item.kode === "string"
              ? item.kode
              : "";
      const alpha2 =
        typeof item.kode_alpha2 === "string"
          ? item.kode_alpha2
          : typeof item.alpha2 === "string"
            ? item.alpha2
            : "";
      const name =
        typeof item.negara === "string"
          ? item.negara
          : typeof item.nama === "string"
            ? item.nama
            : typeof item.label === "string"
              ? item.label
              : alpha3;

      return {
        value: alpha3,
        label: alpha2 ? `${name} (${alpha3})` : name
      };
    })
    .filter((item) => item.value)
    .sort((left, right) => {
      const leftPriority = BILATERAL_DEFAULT_PARTNERS.includes(
        left.value as (typeof BILATERAL_DEFAULT_PARTNERS)[number]
      )
        ? 0
        : 1;
      const rightPriority = BILATERAL_DEFAULT_PARTNERS.includes(
        right.value as (typeof BILATERAL_DEFAULT_PARTNERS)[number]
      )
        ? 0
        : 1;
      if (leftPriority !== rightPriority) return leftPriority - rightPriority;
      return left.label.localeCompare(right.label, "id-ID", {
        sensitivity: "base"
      });
    });
}

function normalizeHsOptions(payload: unknown) {
  return unwrapArrayPayload(payload)
    .filter(isRecord)
    .map((item) => {
      const value = typeof item.value === "string" ? item.value : "";
      const label = typeof item.label === "string" ? item.label : value;
      return value ? { value, label } : null;
    })
    .filter((item): item is { value: string; label: string } => Boolean(item));
}

function normalizeSourceOptions(payload: unknown) {
  return unwrapArrayPayload(payload)
    .filter(isRecord)
    .map((item) => {
      const value =
        item.id != null
          ? String(item.id)
          : typeof item.value === "string"
            ? item.value
            : typeof item.kode === "string"
              ? item.kode
              : "";
      const label =
        typeof item.name === "string"
          ? item.name
          : typeof item.label === "string"
            ? item.label
            : typeof item.nama === "string"
              ? item.nama
              : value;

      return value ? { value, label } : null;
    })
    .filter((item): item is { value: string; label: string } => Boolean(item));
}

export async function fetchKerjasamaBilateralMaster(): Promise<BilateralMasterData> {
  if (bilateralMasterPromise) return bilateralMasterPromise;

  bilateralMasterPromise = Promise.all([
    apiClient.get("/api/v1/negara"),
    apiClient.get("/api/v1/hsproduk"),
    apiClient.get("/api/v1/data-generator/perdagangan/kode-sumber"),
    apiClient.get("/api/v1/data-generator/pariwisata/kode-sumber"),
    apiClient.get("/api/v1/data-generator/investasi/kode-sumber"),
    apiClient.get("/api/v1/data-generator/jasa/kode-sumber")
  ])
    .then(
      ([
        countryResponse,
        hsResponse,
        perdaganganResponse,
        pariwisataResponse,
        investasiResponse,
        jasaResponse
      ]) => {
        const sourceOptionsBySector: BilateralSourceOptionsBySector = {
          perdagangan: normalizeSourceOptions(perdaganganResponse.data),
          pariwisata: normalizeSourceOptions(pariwisataResponse.data),
          investasi: normalizeSourceOptions(investasiResponse.data),
          jasa: normalizeSourceOptions(jasaResponse.data)
        };

        return {
          partnerOptions: normalizeCountryOptions(countryResponse.data),
          hsOptions: [
            { value: "ALL", label: "Semua HS Code" },
            ...normalizeHsOptions(hsResponse.data)
          ],
          sourceOptionsBySector
        };
      }
    )
    .finally(() => {
      bilateralMasterPromise = null;
    });

  return bilateralMasterPromise;
}
