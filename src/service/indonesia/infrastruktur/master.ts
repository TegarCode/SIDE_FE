import { apiClient } from "@/service/httpClient";
import type {
  InfrastrukturCategoryOption,
  InfrastrukturMasterData,
  InfrastrukturSubregionOption
} from "@/type/indonesiaInfrastruktur";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  if (Array.isArray(value.data)) return value.data;
  if (isRecord(value.data) && Array.isArray(value.data.items))
    return value.data.items;
  if (Array.isArray(value.items)) return value.items;
  return [];
}

function normalizeWilayah(payload: unknown) {
  const rows = unwrapArrayPayload(payload).filter(isRecord);
  const regionOptions: Array<{ value: string; label: string }> = [];
  const subregionOptions: InfrastrukturSubregionOption[] = [];

  rows.forEach((item) => {
    const regionLabel = typeof item.nama === "string" ? item.nama : "";
    if (!regionLabel) return;

    const regionValue = regionLabel;
    regionOptions.push({ value: regionValue, label: regionLabel });

    const wilayah = Array.isArray(item.wilayah) ? item.wilayah : [];
    wilayah.filter(isRecord).forEach((entry) => {
      const subregionValue = typeof entry.id === "string" ? entry.id : "";
      const subregionLabel =
        typeof entry.nama === "string" ? entry.nama : subregionValue;
      if (!subregionValue || !subregionLabel) return;

      subregionOptions.push({
        value: subregionValue,
        label: `${subregionLabel} (${subregionValue})`,
        regionValue
      });
    });
  });

  return {
    regionOptions: regionOptions.sort((left, right) =>
      left.label.localeCompare(right.label, "id-ID", { sensitivity: "base" })
    ),
    subregionOptions: subregionOptions.sort((left, right) =>
      left.label.localeCompare(right.label, "id-ID", { sensitivity: "base" })
    )
  };
}

function normalizeKategori(payload: unknown): InfrastrukturCategoryOption[] {
  return unwrapArrayPayload(payload)
    .filter(isRecord)
    .map((item) => {
      const id = typeof item.id === "string" ? item.id : "";
      const nama = typeof item.nama === "string" ? item.nama : id;
      const groupKey =
        typeof item.group_key === "string" ? item.group_key : "LAINNYA";
      const groupLabel =
        typeof item.group_label === "string" ? item.group_label : groupKey;
      if (!id) return null;

      return {
        value: id,
        label: nama,
        groupKey,
        groupLabel
      };
    })
    .filter((item): item is InfrastrukturCategoryOption => Boolean(item))
    .sort((left, right) => {
      const grouped = left.groupLabel.localeCompare(right.groupLabel, "id-ID", {
        sensitivity: "base"
      });
      if (grouped !== 0) return grouped;
      return left.label.localeCompare(right.label, "id-ID", {
        sensitivity: "base"
      });
    });
}

export async function fetchInfrastrukturMaster(): Promise<InfrastrukturMasterData> {
  const [wilayahResponse, kategoriResponse] = await Promise.all([
    apiClient.get("/api/v1/wilayah"),
    apiClient.get("/api/v1/indonesia/infrastruktur/kategori")
  ]);

  const wilayah = normalizeWilayah(wilayahResponse.data);

  return {
    regionOptions: wilayah.regionOptions,
    subregionOptions: wilayah.subregionOptions,
    categoryOptions: normalizeKategori(kategoriResponse.data)
  };
}
