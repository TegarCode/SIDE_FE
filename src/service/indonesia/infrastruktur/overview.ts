import type {
  InfrastrukturPerwakilanAsingData,
  InfrastrukturPerwakilanAsingItem,
  InfrastrukturPerwakilanAsingParams,
  InfrastrukturMarker,
  InfrastrukturOverviewData,
  InfrastrukturPameranIndonesiaData,
  InfrastrukturPameranIndonesiaItem,
  InfrastrukturPameranIndonesiaParams,
  InfrastrukturPameranPerwakilanData,
  InfrastrukturPameranPerwakilanItem,
  InfrastrukturPameranPerwakilanParams,
  InfrastrukturPerjanjianAntarNegaraData,
  InfrastrukturPerjanjianAntarNegaraItem,
  InfrastrukturPerjanjianAntarNegaraParams,
  InfrastrukturPerwakilanItem,
  InfrastrukturPerwakilanParams,
  InfrastrukturPerwakilanStatItem
} from "@/type/indonesiaInfrastruktur";
import { apiClient } from "@/service/httpClient";

const CATEGORY_META = [
  {
    code: "TOTAL",
    label: "Total Perwakilan",
    tone: "blue",
    color: "#2563eb"
  },
  {
    code: "KBRI",
    label: "Perwakilan Diplomatik (KBRI/PTRI)",
    tone: "slate",
    color: "#1f2937"
  },
  {
    code: "KJRI",
    label: "Perwakilan Konsuler (KJRI/KRI)",
    tone: "emerald",
    color: "#0f766e"
  },
  {
    code: "ITPC",
    label: "Perwakilan Dagang (ITPC/KDEI)",
    tone: "cyan",
    color: "#0ea5e9"
  },
  {
    code: "IIPC",
    label: "IIPC",
    tone: "orange",
    color: "#f59e0b"
  },
  {
    code: "BUMN",
    label: "BUMN",
    tone: "purple",
    color: "#7c3aed"
  },
  {
    code: "PERBANKAN",
    label: "Perbankan & Keuangan",
    tone: "slate",
    color: "#475569"
  }
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function isValidLatLng(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

function normalizeDmsText(value: string) {
  return value
    .trim()
    .replace(/[º°]/g, "°")
    .replace(/[’′]/g, "'")
    .replace(/[”″]/g, '"')
    .replace(/\bLU\b/gi, "N")
    .replace(/\bLS\b/gi, "S")
    .replace(/\bBT\b/gi, "E")
    .replace(/\bBB\b/gi, "W")
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function dmsToDecimal(
  degree: string | number,
  minute: string | number = 0,
  second: string | number = 0,
  hemisphere = ""
) {
  const deg = Math.abs(Number(degree)) || 0;
  const min = Math.abs(Number(minute)) || 0;
  const sec = Math.abs(Number(second)) || 0;
  const sign = /[SW]/i.test(hemisphere) ? -1 : 1;
  return sign * (deg + min / 60 + sec / 3600);
}

function parseSingleDms(value: string) {
  const source = normalizeDmsText(value);
  const patterns = [
    /\b([NSWE])\s*(-?\d+(?:\.\d+)?)\s*°\s*(\d+(?:\.\d+)?)?\s*'?\s*(\d+(?:\.\d+)?)?\s*"?/,
    /(-?\d+(?:\.\d+)?)\s*°\s*(\d+(?:\.\d+)?)?\s*'?\s*(\d+(?:\.\d+)?)?\s*"?\s*([NSWE])/,
    /\b([NSWE])\s*(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)?\s+(\d+(?:\.\d+)?)/,
    /(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)?\s+(\d+(?:\.\d+)?)\s*([NSWE])/,
    /([NSWE])\s*(-?\d+(?:\.\d+)?)/,
    /(-?\d+(?:\.\d+)?)\s*([NSWE])/
  ];

  for (const pattern of patterns) {
    const matched = source.match(pattern);
    if (!matched) continue;

    if (/[NSWE]/.test(matched[1] ?? "")) {
      return dmsToDecimal(matched[2], matched[3], matched[4], matched[1]);
    }

    return dmsToDecimal(matched[1], matched[2], matched[3], matched[4]);
  }

  const numeric = Number(source);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseDecimalPair(value: string) {
  const matched = value
    .trim()
    .match(/(-?\d+(?:\.\d+)?)[\s,;]+(-?\d+(?:\.\d+)?)/);
  if (!matched) return null;

  const latitude = Number(matched[1]);
  const longitude = Number(matched[2]);
  return isValidLatLng(latitude, longitude) ? { latitude, longitude } : null;
}

function parseDmsPair(value: string) {
  const source = normalizeDmsText(value);
  let parts = source
    .split(/[;,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    const matched = source.match(/(.+?[NS])\s+(.+?[EW])/);
    if (matched) parts = [matched[1], matched[2]];
  }

  if (parts.length < 2) return null;

  const latitudePart = parts.find((item) => /[NS]\b/.test(item)) ?? parts[0];
  const longitudePart = parts.find((item) => /[EW]\b/.test(item)) ?? parts[1];
  const latitude = parseSingleDms(latitudePart);
  const longitude = parseSingleDms(longitudePart);

  return latitude != null &&
    longitude != null &&
    isValidLatLng(latitude, longitude)
    ? { latitude, longitude }
    : null;
}

function parseCoordinates(raw: string | null) {
  if (!raw) return null;
  return parseDmsPair(raw) ?? parseDecimalPair(raw);
}

function normalizeStatCards(raw: unknown) {
  const source = isRecord(raw) ? raw : {};
  const total = asNumber(source.total) ?? 0;
  const byKategori = Array.isArray(source.by_kategori)
    ? source.by_kategori
        .filter(isRecord)
        .map<InfrastrukturPerwakilanStatItem>((item) => ({
          code: asString(item.code) ?? "-",
          label: asString(item.label) ?? "-",
          count: asNumber(item.count) ?? 0
        }))
    : [];

  return { total, byKategori };
}

function normalizeItems(raw: unknown): InfrastrukturPerwakilanItem[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter(isRecord).map((item) => ({
    perwakilan: asString(item.perwakilan) ?? "-",
    kategori: asString(item.kategori) ?? "-",
    alamat: asString(item.alamat),
    koordinat: asString(item.koordinat),
    situsWeb: asString(item.situs_web),
    wilayah: asString(item.wilayah),
    countries: Array.isArray(item.countries)
      ? item.countries.filter(isRecord).map((country) => ({
          alpha3: asString(country.kode_alpha3),
          alpha2: asString(country.kode_alpha2),
          country: asString(country.negara) ?? "-",
          wilayah: asString(country.wilayah)
        }))
      : []
  }));
}

function buildSummaryCards(statCards: {
  total: number;
  byKategori: InfrastrukturPerwakilanStatItem[];
}) {
  const countByCode = new Map(
    statCards.byKategori.map(
      (item) => [item.code.toUpperCase(), item.count] as const
    )
  );

  return CATEGORY_META.map((item) => ({
    id: `infrastruktur-${item.code.toLowerCase()}`,
    title: item.label,
    tone: item.tone,
    unit: "Lokasi",
    value:
      item.code === "TOTAL"
        ? statCards.total
        : (countByCode.get(item.code) ?? 0),
    prevValue:
      item.code === "TOTAL"
        ? statCards.total
        : (countByCode.get(item.code) ?? 0),
    year: null,
    prevYear: null,
    note: "Jumlah entitas perwakilan berdasarkan filter aktif.",
    highlight: null,
    prevHighlight: null,
    highlightType: "none",
    sourceName: "Perwakilan"
  })) satisfies InfrastrukturOverviewData["summaryCards"];
}

function resolveCategoryCode(raw: string) {
  const normalized = raw.toUpperCase();
  if (normalized === "PTRI") return "KBRI";
  if (normalized === "KRI") return "KJRI";
  if (normalized === "PERWAKILAN DAGANG") return "ITPC";
  if (normalized === "BI/BUMN PERBANKAN") return "PERBANKAN";
  return normalized;
}

function buildMarkers(
  items: InfrastrukturPerwakilanItem[]
): InfrastrukturMarker[] {
  return items
    .map((item, index) => {
      const parsed = parseCoordinates(item.koordinat);
      if (!parsed) return null;

      const categoryCode = resolveCategoryCode(item.kategori);
      const categoryMeta = CATEGORY_META.find(
        (entry) => entry.code === categoryCode
      );

      return {
        id: `${categoryCode}-${item.perwakilan}-${index}`,
        name: item.perwakilan,
        categoryCode,
        categoryLabel: categoryMeta?.label ?? categoryCode,
        color: categoryMeta?.color ?? "#64748b",
        address: item.alamat,
        website: item.situsWeb,
        wilayah: item.wilayah,
        countries: item.countries.map((country) => country.country),
        countryAlpha3s: item.countries
          .map((country) => country.alpha3)
          .filter(
            (value): value is string =>
              typeof value === "string" && value.length > 0
          ),
        latitude: parsed.latitude,
        longitude: parsed.longitude
      };
    })
    .filter((item): item is InfrastrukturMarker => Boolean(item));
}

export async function fetchInfrastrukturPerwakilan(
  params: InfrastrukturPerwakilanParams
): Promise<InfrastrukturOverviewData> {
  const response = await apiClient.get(
    "/api/v1/indonesia/infrastruktur/perwakilan",
    {
      params: {
        wilayah: params.wilayah,
        categories: params.categories
      }
    }
  );
  const root = isRecord(response.data) ? response.data : {};
  const data = isRecord(root.data) ? root.data : {};
  const statCards = normalizeStatCards(data.stat_cards);
  const items = normalizeItems(data.items);

  return {
    summaryCards: buildSummaryCards(statCards),
    statCards,
    items,
    markers: buildMarkers(items),
    meta: isRecord(root.meta) ? root.meta : {},
    raw: response.data
  };
}

function normalizePerwakilanAsingItems(
  raw: unknown
): InfrastrukturPerwakilanAsingItem[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter(isRecord).map((item) => ({
    address: asString(item.alamat),
    email: asString(item.email),
    koordinat: asString(item.koordinat),
    alpha3: asString(item.kode_alpha3),
    alpha2: asString(item.kode_alpha2),
    country: asString(item.negara) ?? "-",
    wilayah: asString(item.wilayah)
  }));
}

export async function fetchInfrastrukturPerwakilanAsing(
  params: InfrastrukturPerwakilanAsingParams
): Promise<InfrastrukturPerwakilanAsingData> {
  const response = await apiClient.get(
    "/api/v1/indonesia/infrastruktur/perwakilan-asing",
    {
      params: {
        wilayah: params.wilayah
      }
    }
  );
  const root = isRecord(response.data) ? response.data : {};
  const data = isRecord(root.data) ? root.data : {};

  return {
    items: normalizePerwakilanAsingItems(data.items),
    meta: isRecord(root.meta) ? root.meta : {},
    raw: response.data
  };
}

function normalizePameranIndonesiaItems(
  raw: unknown
): InfrastrukturPameranIndonesiaItem[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter(isRecord).map((item) => ({
    agenda: asString(item.agenda) ?? "-",
    kategori: asString(item.kategori),
    provinsi: asString(item.provinsi),
    tanggalMulai: asString(item.tgl_mulai),
    tanggalBerakhir: asString(item.tgl_berakhir)
  }));
}

export async function fetchInfrastrukturPameranIndonesia(
  params: InfrastrukturPameranIndonesiaParams
): Promise<InfrastrukturPameranIndonesiaData> {
  const response = await apiClient.get(
    "/api/v1/indonesia/infrastruktur/pameran-indonesia",
    {
      params: {
        wilayah: params.wilayah
      }
    }
  );
  const root = isRecord(response.data) ? response.data : {};
  const data = isRecord(root.data) ? root.data : {};

  return {
    items: normalizePameranIndonesiaItems(data.items),
    meta: isRecord(root.meta) ? root.meta : {},
    raw: response.data
  };
}

function normalizePameranPerwakilanItems(
  raw: unknown
): InfrastrukturPameranPerwakilanItem[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter(isRecord).map((item) => ({
    perwakilan: asString(item.perwakilan) ?? "-",
    wilayahKerja: asString(item.wilayah_kerja),
    tempat: asString(item.tempat),
    tanggal: asString(item.tanggal),
    exhibitionPromosi: asString(item.exhibition_promosi),
    alpha3: asString(item.kode_alpha3),
    alpha2: asString(item.kode_alpha2),
    country: asString(item.negara) ?? "-",
    wilayah: asString(item.wilayah)
  }));
}

export async function fetchInfrastrukturPameranPerwakilan(
  params: InfrastrukturPameranPerwakilanParams
): Promise<InfrastrukturPameranPerwakilanData> {
  const response = await apiClient.get(
    "/api/v1/indonesia/infrastruktur/pameran-perwakilan",
    {
      params: {
        wilayah: params.wilayah
      }
    }
  );
  const root = isRecord(response.data) ? response.data : {};
  const data = isRecord(root.data) ? root.data : {};

  return {
    items: normalizePameranPerwakilanItems(data.items),
    meta: isRecord(root.meta) ? root.meta : {},
    raw: response.data
  };
}

function normalizePerjanjianAntarNegaraItems(
  raw: unknown
): InfrastrukturPerjanjianAntarNegaraItem[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter(isRecord).map((item) => ({
    kode: asString(item.Kode) ?? "-",
    hpi: asString(item.HPI),
    idWilKemlu: asString(item.ID_Wil_Kemlu),
    kl: asString(item["K/L"]),
    bidangKerjasama: asString(item.Bidang_Kerjasama),
    judulPerjanjianIdn: asString(item.Judul_Perjanjian_IDN),
    judulPerjanjianEng: asString(item.Judul_Perjanjian_ENG),
    tempatTglTtd: asString(item.Tempat_TglTTD),
    catatanPengesahan: asString(item.Catatan_Pengesahan),
    mulaiBerlaku: asString(item.Mulai_Berlaku),
    uu: asString(item.UU),
    masaBerlaku: asString(item.Masa_Berlaku),
    caraPengakhiranIdn: asString(item.Cara_Pengakhiran_IDN),
    caraPengakhiranEng: asString(item.Cara_Pengakhiran_ENG),
    catatanKhusus: asString(item.Catatan_Khusus),
    namaWilKemlu: asString(item.Nama_Wil_Kemlu)
  }));
}

export async function fetchInfrastrukturPerjanjianAntarNegara(
  params: InfrastrukturPerjanjianAntarNegaraParams
): Promise<InfrastrukturPerjanjianAntarNegaraData> {
  const response = await apiClient.get(
    "/api/v1/indonesia/infrastruktur/perjanjian-antar-negara",
    {
      params: {
        wilayah: params.wilayah
      }
    }
  );
  const root = isRecord(response.data) ? response.data : {};
  const data = isRecord(root.data) ? root.data : {};

  return {
    items: normalizePerjanjianAntarNegaraItems(data.items),
    meta: isRecord(root.meta) ? root.meta : {},
    raw: response.data
  };
}
