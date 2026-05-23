import { apiClient } from "@/service/httpClient";
import type {
  EnergyTradeFlowResult,
  EnergyTradeProductsResult,
  GroupedFilterOptionGroup,
  HilirisasiTradeFlowResult,
  HilirisasiTradeProductsResult,
  KesehatanTradeFlowResult,
  KesehatanTradeProductsResult,
  MineralKritisTradeFlowResult,
  MineralKritisTradeProductsResult,
  PanganTradeFlowResult,
  PanganTradeProductsResult,
  PertahananTradeFlowResult,
  PertahananTradeProductsResult,
  SektorHsCodeGroupResult,
  TikTradeFlowItem,
  TikTradeFlowResult,
  TikTradeProductItem,
  TikTradeProductsResult
} from "@/type/komoditasUtama";
import {
  asString,
  isRecord,
  parseJsonPayload,
  unwrapArrayPayload
} from "../indonesia/diplomasi-ekonomi/shared";

type SummaryPdfResult = {
  blob: Blob;
  filename: string;
};

function sanitizePdfFilename(value: string) {
  const sanitized = Array.from(value, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 0 && code <= 31) return "_";
    return /[<>:"/\\|?*]/.test(char) ? "_" : char;
  }).join("");

  return sanitized.trim() || "ringkasan_komoditas_utama";
}

function getFilenameFromDisposition(
  headerValue: string | undefined,
  fallback: string
) {
  if (!headerValue) return fallback;

  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return sanitizePdfFilename(decodeURIComponent(utf8Match[1]));
    } catch {
      return sanitizePdfFilename(utf8Match[1]);
    }
  }

  const asciiMatch = headerValue.match(/filename="?([^"]+)"?/i);
  if (asciiMatch?.[1]) return sanitizePdfFilename(asciiMatch[1]);

  return fallback;
}

function normalizeTikHsCodeGroups(payload: unknown): SektorHsCodeGroupResult {
  const parsed = parseJsonPayload(payload);
  const sectors = unwrapArrayPayload(parsed).filter(isRecord);
  const firstSector = sectors[0] ?? null;

  const groups = firstSector
    ? unwrapArrayPayload(firstSector.kategori_groups).filter(isRecord)
    : [];

  const normalizedGroups: GroupedFilterOptionGroup[] = groups
    .map((group) => {
      const label = asString(group.kategori, "-");
      const options = unwrapArrayPayload(group.hscodes)
        .filter(isRecord)
        .map((item) => {
          const code = asString(item.code || item.hs_code || item.value);
          const description = asString(
            item.description || item.desc || item.label
          );

          return {
            value: code,
            label: description ? `${code} - ${description}` : code,
            code,
            description,
            groupLabel: label
          };
        })
        .filter((item) => Boolean(item.value));

      return {
        label,
        optionCount:
          Number(group.hscodes_count) > 0
            ? Number(group.hscodes_count)
            : options.length,
        options
      };
    })
    .filter((group) => group.options.length > 0);

  return {
    sektor: firstSector ? asString(firstSector.sektor) || null : null,
    sourceDescription: firstSector
      ? asString(firstSector.desc_sumber) || null
      : null,
    totalCount: normalizedGroups.reduce(
      (total, group) => total + group.options.length,
      0
    ),
    groups: normalizedGroups
  };
}

export async function fetchTikHsCodeGroups(): Promise<SektorHsCodeGroupResult> {
  const response = await apiClient.get("/api/v1/hscode-tik");
  return normalizeTikHsCodeGroups(response.data);
}

export async function fetchEnergyHsCodeGroups(): Promise<SektorHsCodeGroupResult> {
  const response = await apiClient.get("/api/v1/hscode-energi");
  return normalizeTikHsCodeGroups(response.data);
}

export async function fetchMineralKritisHsCodeGroups(): Promise<SektorHsCodeGroupResult> {
  const response = await apiClient.get("/api/v1/hscode-mineral-kritis");
  return normalizeTikHsCodeGroups(response.data);
}

export async function fetchKesehatanHsCodeGroups(): Promise<SektorHsCodeGroupResult> {
  const response = await apiClient.get("/api/v1/hscode-farmasi");
  return normalizeTikHsCodeGroups(response.data);
}

export async function fetchPanganHsCodeGroups(): Promise<SektorHsCodeGroupResult> {
  const response = await apiClient.get("/api/v1/hscode-pangan");
  return normalizeTikHsCodeGroups(response.data);
}

export async function fetchPertahananHsCodeGroups(): Promise<SektorHsCodeGroupResult> {
  const response = await apiClient.get("/api/v1/hscode-pertahanan");
  return normalizeTikHsCodeGroups(response.data);
}

export async function fetchHilirisasiHsCodeGroups(): Promise<SektorHsCodeGroupResult> {
  const response = await apiClient.get("/api/v1/hscode-hilirisasi");
  return normalizeTikHsCodeGroups(response.data);
}

function toNumberRecord(value: unknown) {
  if (!isRecord(value)) return {} as Record<number, number>;
  const output: Record<number, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    const year = Number(key);
    const parsed = Number(raw);
    if (Number.isFinite(year) && Number.isFinite(parsed)) output[year] = parsed;
  }
  return output;
}

function normalizeTikTradeFlow(payload: unknown): TikTradeFlowResult {
  const parsed = parseJsonPayload(payload);
  const root = isRecord(parsed) ? parsed : {};
  const data = isRecord(root.data) ? root.data : {};
  const meta = isRecord(root.meta) ? root.meta : {};

  const items: TikTradeFlowItem[] = unwrapArrayPayload(data.items)
    .filter(isRecord)
    .map((item) => ({
      negara: asString(item.negara, "-"),
      kode_alpha2: asString(item.kode_alpha2) || null,
      kode_alpha3: asString(item.kode_alpha3) || null,
      nilai_perdagangan: toNumberRecord(item.nilai_perdagangan),
      neraca: toNumberRecord(item.neraca),
      proporsi: toNumberRecord(item.proporsi)
    }));

  const filters = isRecord(meta.filters) ? meta.filters : {};

  return {
    items,
    years: Array.isArray(meta.years)
      ? meta.years
          .map((year) => Number(year))
          .filter((year) => Number.isFinite(year))
      : [],
    totalWorld: Number(meta.total_world) || 0,
    totalWorldPerYear: toNumberRecord(meta.total_world_per_year),
    sourceName: asString(meta.sumber) || null,
    unit: asString(meta.unit) || null,
    filters: {
      origin: Array.isArray(filters.origin)
        ? filters.origin.map((item) => String(item))
        : [],
      dest: Array.isArray(filters.dest)
        ? filters.dest.map((item) => String(item))
        : [],
      hsList: Array.isArray(filters.hs_list)
        ? filters.hs_list.map((item) => String(item))
        : []
    }
  };
}

export type FetchTikTradeFlowParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
};

export async function fetchTikTradeFlow(
  params: FetchTikTradeFlowParams
): Promise<TikTradeFlowResult> {
  const queryParams: Record<string, string | string[]> = {};
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;
  if (params.hsList && params.hsList.length > 0)
    queryParams.hs_list = params.hsList;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/ekonomi-digital/nilai-arus-tik",
    { params: queryParams }
  );

  return normalizeTikTradeFlow(response.data);
}

export type FetchEnergyTradeFlowParams = FetchTikTradeFlowParams;

export async function fetchEnergyTradeFlow(
  params: FetchEnergyTradeFlowParams
): Promise<EnergyTradeFlowResult> {
  const queryParams: Record<string, string | string[]> = {};
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;
  if (params.hsList && params.hsList.length > 0)
    queryParams.hs_list = params.hsList;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/nilai-sektor-energi",
    {
      params: queryParams
    }
  );

  return normalizeTikTradeFlow(response.data);
}

export type FetchMineralKritisTradeFlowParams = FetchTikTradeFlowParams;

export async function fetchMineralKritisTradeFlow(
  params: FetchMineralKritisTradeFlowParams
): Promise<MineralKritisTradeFlowResult> {
  const queryParams: Record<string, string | string[]> = {};
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;
  if (params.hsList && params.hsList.length > 0)
    queryParams.hs_list = params.hsList;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/nilai-sektor-mineral-kritis",
    {
      params: queryParams
    }
  );

  return normalizeTikTradeFlow(response.data);
}

export type FetchKesehatanTradeFlowParams = FetchTikTradeFlowParams;

export async function fetchKesehatanTradeFlow(
  params: FetchKesehatanTradeFlowParams
): Promise<KesehatanTradeFlowResult> {
  const queryParams: Record<string, string | string[]> = {};
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;
  if (params.hsList && params.hsList.length > 0)
    queryParams.hs_list = params.hsList;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/nilai-sektor-farmasi",
    {
      params: queryParams
    }
  );

  return normalizeTikTradeFlow(response.data);
}

export type FetchPanganTradeFlowParams = FetchTikTradeFlowParams;

export async function fetchPanganTradeFlow(
  params: FetchPanganTradeFlowParams
): Promise<PanganTradeFlowResult> {
  const queryParams: Record<string, string | string[]> = {};
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;
  if (params.hsList && params.hsList.length > 0)
    queryParams.hs_list = params.hsList;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/nilai-sektor-pangan",
    {
      params: queryParams
    }
  );

  return normalizeTikTradeFlow(response.data);
}

export type FetchPertahananTradeFlowParams = FetchTikTradeFlowParams;

export async function fetchPertahananTradeFlow(
  params: FetchPertahananTradeFlowParams
): Promise<PertahananTradeFlowResult> {
  const queryParams: Record<string, string | string[]> = {};
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;
  if (params.hsList && params.hsList.length > 0)
    queryParams.hs_list = params.hsList;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/nilai-sektor-pertahanan",
    {
      params: queryParams
    }
  );

  return normalizeTikTradeFlow(response.data);
}

export type FetchHilirisasiTradeFlowParams = FetchTikTradeFlowParams;

export async function fetchHilirisasiTradeFlow(
  params: FetchHilirisasiTradeFlowParams
): Promise<HilirisasiTradeFlowResult> {
  const queryParams: Record<string, string | string[]> = {};
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;
  if (params.hsList && params.hsList.length > 0)
    queryParams.hs_list = params.hsList;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/nilai-sektor-hilirisasi",
    {
      params: queryParams
    }
  );

  return normalizeTikTradeFlow(response.data);
}

function normalizeTikTradeProducts(payload: unknown): TikTradeProductsResult {
  const parsed = parseJsonPayload(payload);
  const root = isRecord(parsed) ? parsed : {};
  const data = isRecord(root.data) ? root.data : {};
  const meta = isRecord(root.meta) ? root.meta : {};

  const products: TikTradeProductItem[] = unwrapArrayPayload(data.produk)
    .filter(isRecord)
    .map((item) => ({
      kodeHS: asString(item.kodeHS || item.kode_hs || item.code, "-"),
      namaHS: asString(item.namaHS || item.nama_hs || item.label, "-"),
      ekspor: toNumberRecord(item.ekspor),
      impor: toNumberRecord(item.impor),
      total: toNumberRecord(item.total),
      share: toNumberRecord(item.share)
    }))
    .filter((item) => item.kodeHS !== "-");

  const inferredYears = Array.from(
    new Set(
      products.flatMap((item) =>
        [
          ...Object.keys(item.ekspor),
          ...Object.keys(item.impor),
          ...Object.keys(item.total),
          ...Object.keys(item.share)
        ]
          .map((year) => Number(year))
          .filter((year) => Number.isFinite(year))
      )
    )
  ).sort((left, right) => left - right);

  const resolvedYears = unwrapArrayPayload(meta.tahun)
    .map((year) => Number(year))
    .filter((year) => Number.isFinite(year));
  const years = resolvedYears.length > 0 ? resolvedYears : inferredYears;
  const latestYear =
    Number(meta.latest_year) ||
    (years.length > 0 ? (years[years.length - 1] ?? null) : null);
  const prevYear =
    Number(meta.prev_year) ||
    (years.length > 1 ? (years[years.length - 2] ?? null) : null);

  const normalizeCountryMeta = (value: unknown) =>
    unwrapArrayPayload(value)
      .filter(isRecord)
      .map((item) => ({
        a3: asString(item.a3 || item.kode_alpha3, "-"),
        a2: asString(item.a2 || item.kode_alpha2) || null,
        nama: asString(item.nama || item.label, "-")
      }));

  return {
    products,
    latestYear,
    prevYear,
    years,
    sourceName: asString(meta.sumber) || null,
    unit: asString(meta.unit) || null,
    partners: normalizeCountryMeta(meta.partner),
    reporters: normalizeCountryMeta(meta.reporter),
    hsApplied: unwrapArrayPayload(meta.hs_applied).map((item) => String(item))
  };
}

function inferSeriesYears(
  products: Array<{
    ekspor: Record<number, number>;
    impor: Record<number, number>;
    total: Record<number, number>;
    share: Record<number, number>;
  }>
) {
  return Array.from(
    new Set(
      products.flatMap((item) =>
        [
          ...Object.keys(item.ekspor),
          ...Object.keys(item.impor),
          ...Object.keys(item.total),
          ...Object.keys(item.share)
        ]
          .map((year) => Number(year))
          .filter((year) => Number.isFinite(year))
      )
    )
  ).sort((left, right) => left - right);
}

function normalizeCountryMeta(value: unknown) {
  return unwrapArrayPayload(value)
    .filter(isRecord)
    .map((item) => ({
      a3: asString(item.a3 || item.kode_alpha3, "-"),
      a2: asString(item.a2 || item.kode_alpha2) || null,
      nama: asString(item.nama || item.label, "-")
    }));
}

function normalizeHilirisasiTradeProducts(
  payload: unknown
): HilirisasiTradeProductsResult {
  const parsed = parseJsonPayload(payload);
  const root = isRecord(parsed) ? parsed : {};
  const data = isRecord(root.data) ? root.data : {};
  const meta = isRecord(root.meta) ? root.meta : {};

  const products = unwrapArrayPayload(data.sektor_produk)
    .filter(isRecord)
    .flatMap((sectorItem) => {
      const sektor = asString(sectorItem.sektor) || null;
      return unwrapArrayPayload(sectorItem.produk)
        .filter(isRecord)
        .map((item) => ({
          kodeHS: asString(item.kodeHS || item.kode_hs || item.code, "-"),
          namaHS: asString(item.namaHS || item.nama_hs || item.label, "-"),
          sektor,
          ekspor: toNumberRecord(item.ekspor),
          impor: toNumberRecord(item.impor),
          total: toNumberRecord(item.total),
          share: toNumberRecord(item.share)
        }));
    })
    .filter((item) => item.kodeHS !== "-");

  const yearsFromMeta = [
    ...unwrapArrayPayload(meta.years),
    ...unwrapArrayPayload(meta.available_years)
  ]
    .map((year) => Number(year))
    .filter((year) => Number.isFinite(year));
  const inferredYears = inferSeriesYears(products);
  const years = Array.from(
    new Set(yearsFromMeta.length > 0 ? yearsFromMeta : inferredYears)
  ).sort((left, right) => left - right);
  const latestYear =
    Number(meta.latest_year) ||
    (years.length > 0 ? (years[years.length - 1] ?? null) : null);
  const prevYear =
    Number(meta.prev_year) ||
    (years.length > 1 ? (years[years.length - 2] ?? null) : null);

  return {
    products,
    latestYear,
    prevYear,
    years,
    sourceName: asString(meta.sumber) || null,
    unit: asString(meta.unit) || null,
    partners: normalizeCountryMeta(meta.partner),
    reporters: normalizeCountryMeta(meta.reporter),
    hsApplied: unwrapArrayPayload(meta.hs_applied).map((item) => String(item))
  };
}

export type FetchTikTradeProductsParams = {
  origin?: string[];
  dest?: string[];
  hsList?: string[];
};

export async function fetchTikTradeProducts(
  params: FetchTikTradeProductsParams
): Promise<TikTradeProductsResult> {
  const queryParams: Record<string, string | string[]> = {
    hs_list: params.hsList && params.hsList.length > 0 ? params.hsList : ["all"]
  };
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/ekonomi-digital/nilai-arus-tik-produk",
    { params: queryParams }
  );

  return normalizeTikTradeProducts(response.data);
}

export type FetchEnergyTradeProductsParams = FetchTikTradeProductsParams;

export async function fetchEnergyTradeProducts(
  params: FetchEnergyTradeProductsParams
): Promise<EnergyTradeProductsResult> {
  const queryParams: Record<string, string | string[]> = {
    hs_list: params.hsList && params.hsList.length > 0 ? params.hsList : ["all"]
  };
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/nilai-sektor-produk-energi",
    {
      params: queryParams
    }
  );

  return normalizeTikTradeProducts(response.data);
}

export type FetchMineralKritisTradeProductsParams = FetchTikTradeProductsParams;

export async function fetchMineralKritisTradeProducts(
  params: FetchMineralKritisTradeProductsParams
): Promise<MineralKritisTradeProductsResult> {
  const queryParams: Record<string, string | string[]> = {
    hs_list: params.hsList && params.hsList.length > 0 ? params.hsList : ["all"]
  };
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/nilai-sektor-produk-mineral-kritis",
    {
      params: queryParams
    }
  );

  return normalizeTikTradeProducts(response.data);
}

export type FetchKesehatanTradeProductsParams = FetchTikTradeProductsParams;

export async function fetchKesehatanTradeProducts(
  params: FetchKesehatanTradeProductsParams
): Promise<KesehatanTradeProductsResult> {
  const queryParams: Record<string, string | string[]> = {
    hs_list: params.hsList && params.hsList.length > 0 ? params.hsList : ["all"]
  };
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/nilai-sektor-produk-farmasi",
    {
      params: queryParams
    }
  );

  return normalizeTikTradeProducts(response.data);
}

export type FetchPanganTradeProductsParams = FetchTikTradeProductsParams;

export async function fetchPanganTradeProducts(
  params: FetchPanganTradeProductsParams
): Promise<PanganTradeProductsResult> {
  const queryParams: Record<string, string | string[]> = {
    hs_list: params.hsList && params.hsList.length > 0 ? params.hsList : ["all"]
  };
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/nilai-sektor-produk-pangan",
    {
      params: queryParams
    }
  );

  return normalizeTikTradeProducts(response.data);
}

export type FetchPertahananTradeProductsParams = FetchTikTradeProductsParams;

export async function fetchPertahananTradeProducts(
  params: FetchPertahananTradeProductsParams
): Promise<PertahananTradeProductsResult> {
  const queryParams: Record<string, string | string[]> = {
    hs_list: params.hsList && params.hsList.length > 0 ? params.hsList : ["all"]
  };
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/nilai-sektor-produk-pertahanan",
    {
      params: queryParams
    }
  );

  return normalizeTikTradeProducts(response.data);
}

export type FetchHilirisasiTradeProductsParams = FetchTikTradeProductsParams;

export async function fetchHilirisasiTradeProducts(
  params: FetchHilirisasiTradeProductsParams
): Promise<HilirisasiTradeProductsResult> {
  const queryParams: Record<string, string | string[]> = {
    hs_list: params.hsList && params.hsList.length > 0 ? params.hsList : ["all"]
  };
  if (params.origin && params.origin.length > 0)
    queryParams.origin = params.origin;
  if (params.dest && params.dest.length > 0) queryParams.dest = params.dest;

  const response = await apiClient.get(
    "/api/v1/sektor-prioritas/nilai-sektor-produk-hilirisasi",
    {
      params: queryParams
    }
  );

  return normalizeHilirisasiTradeProducts(response.data);
}

export type DownloadTikSummaryPdfParams = {
  negara: {
    reporter: string[];
    hscode: string | string[];
  };
  produk: {
    origin: string[];
    dest: string[];
    hscode: string | string[];
  };
};

export async function downloadTikSummaryPdf(
  params: DownloadTikSummaryPdfParams,
  fallbackFilename: string
): Promise<SummaryPdfResult> {
  const response = await apiClient.post(
    "/api/v1/sektor-prioritas/ekonomi-digital/summary/pdf",
    params,
    {
      responseType: "blob",
      headers: {
        Accept: "application/pdf"
      }
    }
  );

  return {
    blob: response.data as Blob,
    filename: getFilenameFromDisposition(
      typeof response.headers["content-disposition"] === "string"
        ? response.headers["content-disposition"]
        : undefined,
      sanitizePdfFilename(fallbackFilename)
    )
  };
}

export type DownloadEnergySummaryPdfParams = DownloadTikSummaryPdfParams;

export async function downloadEnergySummaryPdf(
  params: DownloadEnergySummaryPdfParams,
  fallbackFilename: string
): Promise<SummaryPdfResult> {
  const response = await apiClient.post(
    "/api/v1/sektor-prioritas/nilai-sektor-energi/summary/pdf",
    params,
    {
      responseType: "blob",
      headers: {
        Accept: "application/pdf"
      }
    }
  );

  return {
    blob: response.data as Blob,
    filename: getFilenameFromDisposition(
      typeof response.headers["content-disposition"] === "string"
        ? response.headers["content-disposition"]
        : undefined,
      sanitizePdfFilename(fallbackFilename)
    )
  };
}

export type DownloadMineralKritisSummaryPdfParams = DownloadTikSummaryPdfParams;

export async function downloadMineralKritisSummaryPdf(
  params: DownloadMineralKritisSummaryPdfParams,
  fallbackFilename: string
): Promise<SummaryPdfResult> {
  const response = await apiClient.post(
    "/api/v1/sektor-prioritas/nilai-sektor-mineral-kritis/summary/pdf",
    params,
    {
      responseType: "blob",
      headers: {
        Accept: "application/pdf"
      }
    }
  );

  return {
    blob: response.data as Blob,
    filename: getFilenameFromDisposition(
      typeof response.headers["content-disposition"] === "string"
        ? response.headers["content-disposition"]
        : undefined,
      sanitizePdfFilename(fallbackFilename)
    )
  };
}

export type DownloadKesehatanSummaryPdfParams = DownloadTikSummaryPdfParams;

export async function downloadKesehatanSummaryPdf(
  params: DownloadKesehatanSummaryPdfParams,
  fallbackFilename: string
): Promise<SummaryPdfResult> {
  const response = await apiClient.post(
    "/api/v1/sektor-prioritas/nilai-sektor-farmasi/summary/pdf",
    params,
    {
      responseType: "blob",
      headers: {
        Accept: "application/pdf"
      }
    }
  );

  return {
    blob: response.data as Blob,
    filename: getFilenameFromDisposition(
      typeof response.headers["content-disposition"] === "string"
        ? response.headers["content-disposition"]
        : undefined,
      sanitizePdfFilename(fallbackFilename)
    )
  };
}

export type DownloadPanganSummaryPdfParams = DownloadTikSummaryPdfParams;

export async function downloadPanganSummaryPdf(
  params: DownloadPanganSummaryPdfParams,
  fallbackFilename: string
): Promise<SummaryPdfResult> {
  const response = await apiClient.post(
    "/api/v1/sektor-prioritas/nilai-sektor-pangan/summary/pdf",
    params,
    {
      responseType: "blob",
      headers: {
        Accept: "application/pdf"
      }
    }
  );

  return {
    blob: response.data as Blob,
    filename: getFilenameFromDisposition(
      typeof response.headers["content-disposition"] === "string"
        ? response.headers["content-disposition"]
        : undefined,
      sanitizePdfFilename(fallbackFilename)
    )
  };
}

export type DownloadPertahananSummaryPdfParams = DownloadTikSummaryPdfParams;

export async function downloadPertahananSummaryPdf(
  params: DownloadPertahananSummaryPdfParams,
  fallbackFilename: string
): Promise<SummaryPdfResult> {
  const response = await apiClient.post(
    "/api/v1/sektor-prioritas/nilai-sektor-pertahanan/summary/pdf",
    params,
    {
      responseType: "blob",
      headers: {
        Accept: "application/pdf"
      }
    }
  );

  return {
    blob: response.data as Blob,
    filename: getFilenameFromDisposition(
      typeof response.headers["content-disposition"] === "string"
        ? response.headers["content-disposition"]
        : undefined,
      sanitizePdfFilename(fallbackFilename)
    )
  };
}

export type DownloadHilirisasiSummaryPdfParams = DownloadTikSummaryPdfParams;

export async function downloadHilirisasiSummaryPdf(
  params: DownloadHilirisasiSummaryPdfParams,
  fallbackFilename: string
): Promise<SummaryPdfResult> {
  const response = await apiClient.post(
    "/api/v1/sektor-prioritas/nilai-sektor-hilirisasi/summary/pdf",
    params,
    {
      responseType: "blob",
      headers: {
        Accept: "application/pdf"
      }
    }
  );

  return {
    blob: response.data as Blob,
    filename: getFilenameFromDisposition(
      typeof response.headers["content-disposition"] === "string"
        ? response.headers["content-disposition"]
        : undefined,
      sanitizePdfFilename(fallbackFilename)
    )
  };
}
