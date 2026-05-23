import { apiClient } from "@/service/httpClient";
import type {
  MitraOverviewCompetitionCountry,
  MitraOverviewInvestmentRow,
  MitraOverviewStatsData,
  MitraOverviewTopInvestmentData,
  MitraOverviewTopServiceData,
  MitraOverviewTopTourismData,
  MitraOverviewTopTradeData,
  MitraSingleInvestmentData,
  MitraSingleInvestmentRow,
  MitraMultiInvestmentData,
  MitraSingleTourismData,
  MitraSingleTourismRow,
  MitraMultiTourismData,
  MitraSingleServiceData,
  MitraSingleServiceRow,
  MitraMultiServiceData,
  MitraServiceCategoryRow,
  MitraTradeOverviewData,
  MitraTradeOverviewParams,
  MitraOverviewTradeData,
  MitraOverviewTradeItem,
  MitraOverviewTradePartnerRow,
  MitraOverviewTradeProduct
} from "@/type/mitra";

const MITRA_OVERVIEW_SUMMARY_ENDPOINTS = {
  perdagangan: "/api/v1/negara-mitra/overview/top-perdagangan/summary/pdf",
  investasi: "/api/v1/negara-mitra/overview/top-investasi/summary/pdf",
  pariwisata: "/api/v1/negara-mitra/overview/top-pariwisata/summary/pdf",
  jasa: "/api/v1/negara-mitra/overview/top-jasa/summary/pdf"
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toStringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeMetric(value: unknown) {
  if (!isRecord(value)) return null;

  const prev = isRecord(value.prev)
    ? {
        year: toNumber(value.prev.year),
        value: toNumber(value.prev.value)
      }
    : null;

  return {
    title: toStringOrNull(value.title) ?? "-",
    unit: toStringOrNull(value.unit) ?? "",
    value: toNumber(value.value),
    prev,
    source: toStringOrNull(value.source)
  };
}

function normalizeTopPartnerMetric(value: unknown) {
  if (!isRecord(value)) return null;

  const partner = isRecord(value.partner)
    ? {
        alpha3: toStringOrNull(value.partner.alpha3),
        alpha2: toStringOrNull(value.partner.alpha2),
        name: toStringOrNull(value.partner.name) ?? "-"
      }
    : null;

  return {
    title: toStringOrNull(value.title) ?? "-",
    unit: toStringOrNull(value.unit) ?? "",
    partner,
    value: toNumber(value.value),
    share: toNumber(value.share),
    sharePercent: toNumber(value.sharePercent),
    source: toStringOrNull(value.source)
  };
}

function normalizeTradeOverviewProduct(value: unknown) {
  if (!isRecord(value)) return null;
  return {
    code: toStringOrNull(value.code) ?? "-",
    label: toStringOrNull(value.label) ?? "-",
    valueOd: toNumber(value.value_od),
    valueReverse: toNumber(value.value_reverse)
  };
}

function normalizeSingleInvestmentRow(
  value: unknown
): MitraSingleInvestmentRow | null {
  if (!isRecord(value)) return null;
  return {
    code: toStringOrNull(value.code) ?? "-",
    alpha2: toStringOrNull(value.alpha2),
    label: toStringOrNull(value.label) ?? "-",
    valueNow: toNumber(value.value_now),
    valuePrev: toNumber(value.value_prev),
    projectsNow: toNumber(value.projects_now),
    projectsPrev: toNumber(value.projects_prev)
  };
}

function normalizeSingleTourismRow(
  value: unknown
): MitraSingleTourismRow | null {
  if (!isRecord(value)) return null;
  return {
    code: toStringOrNull(value.code) ?? "-",
    alpha2: toStringOrNull(value.a2),
    label: toStringOrNull(value.label) ?? "-",
    valueNow: toNumber(value.value_now),
    valuePrev: toNumber(value.value_prev)
  };
}

function normalizeSingleServiceRow(
  value: unknown
): MitraSingleServiceRow | null {
  if (!isRecord(value)) return null;
  return {
    code:
      toStringOrNull(value.code) ??
      toStringOrNull(value.alpha3) ??
      toStringOrNull(value.kode_alpha3) ??
      "-",
    alpha2:
      toStringOrNull(value.alpha2) ??
      toStringOrNull(value.kode_alpha2) ??
      toStringOrNull(value.a2),
    label:
      toStringOrNull(value.label) ??
      toStringOrNull(value.negara) ??
      toStringOrNull(value.country) ??
      "-",
    valueNow:
      toNumber(value.value_now) ??
      toNumber(value.nilai_now) ??
      toNumber(value.value_latest) ??
      toNumber(value.value),
    valuePrev:
      toNumber(value.value_prev) ??
      toNumber(value.nilai_prev) ??
      toNumber(value.value_previous) ??
      toNumber(value.prev)
  };
}

function normalizeServiceCategoryRow(
  value: unknown
): MitraServiceCategoryRow | null {
  if (!isRecord(value)) return null;
  return {
    code:
      toStringOrNull(value.code) ??
      toStringOrNull(value.id) ??
      toStringOrNull(value.kode) ??
      "-",
    label:
      toStringOrNull(value.label) ??
      toStringOrNull(value.name) ??
      toStringOrNull(value.nama) ??
      "-",
    value:
      toNumber(value.value) ??
      toNumber(value.nilai) ??
      toNumber(value.value_now)
  };
}

export async function fetchMitraOverviewStats(
  country: string
): Promise<MitraOverviewStatsData | null> {
  const response = await apiClient.get("/api/v1/negara-mitra/overview/stats", {
    params: { negara: country }
  });
  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  if (!payload) return null;

  return {
    country: toStringOrNull(payload.country) ?? country,
    alpha3: toStringOrNull(payload.alpha3),
    alpha2: toStringOrNull(payload.alpha2),
    totalPerdagangan: normalizeMetric(payload.totalPerdagangan),
    neracaPerdagangan: normalizeMetric(payload.neracaPerdagangan),
    ekspor: normalizeMetric(payload.ekspor),
    impor: normalizeMetric(payload.impor),
    topTradePartner: normalizeTopPartnerMetric(payload.topTradePartner),
    inboundInvestment: normalizeMetric(payload.inboundInvestment),
    outboundInvestment: normalizeMetric(payload.outboundInvestment),
    outboundTourism: normalizeMetric(payload.outboundTourism)
  };
}

function normalizeTradeItem(value: unknown): MitraOverviewTradeItem | null {
  if (!isRecord(value)) return null;

  return {
    alpha3: toStringOrNull(value.alpha3),
    alpha2: toStringOrNull(value.alpha2),
    country: toStringOrNull(value.country) ?? "-",
    unit: toStringOrNull(value.unit),
    export: toNumber(value.export),
    exportPrev: toNumber(value.exportPrev),
    exportChange: toNumber(value.exportChange),
    import: toNumber(value.import),
    importPrev: toNumber(value.importPrev),
    importChange: toNumber(value.importChange),
    balance: toNumber(value.balance),
    sourceCode: toNumber(value.sourceCode)
  };
}

export async function fetchMitraOverviewTrade(): Promise<MitraOverviewTradeData> {
  const response = await apiClient.get(
    "/api/v1/negara-mitra/overview/perdagangan-negara"
  );
  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  const years = Array.isArray(payload?.years)
    ? payload.years.map(Number).filter(Number.isFinite)
    : [];
  const items = Array.isArray(payload?.items)
    ? payload.items
        .map(normalizeTradeItem)
        .filter((item): item is MitraOverviewTradeItem => item !== null)
    : [];

  return {
    years,
    items
  };
}

function normalizeCompetitionCountries(
  value: unknown
): MitraOverviewCompetitionCountry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item, index) => ({
    rank: toNumber(item.rank) ?? index + 1,
    alpha2: toStringOrNull(item.kode_alpha2),
    alpha3: toStringOrNull(item.kode_alpha3),
    country: toStringOrNull(item.negara) ?? "-",
    nilai: toNumber(item.nilai) ?? 0
  }));
}

function normalizeTopTradePartnerRow(
  value: unknown
): MitraOverviewTradePartnerRow | null {
  if (!isRecord(value)) return null;
  return {
    rank: toNumber(value.rank) ?? 0,
    country: toStringOrNull(value.negara) ?? "-",
    alpha2: toStringOrNull(value.kode_alpha2),
    alpha3: toStringOrNull(value.kode_alpha3),
    exportLatestYear: toNumber(value.ekspor_latest_year),
    importLatestYear: toNumber(value.impor_latest_year),
    totalLatestYear: toNumber(value.total_latest_year),
    exportPrevYear: toNumber(value.ekspor_prev_year),
    importPrevYear: toNumber(value.impor_prev_year),
    totalPrevYear: toNumber(value.total_prev_year),
    shareLatestYear: toNumber(value.proporsi_y2)
  };
}

function normalizeTopTradeProduct(
  value: unknown
): MitraOverviewTradeProduct | null {
  if (!isRecord(value)) return null;
  return {
    hs: String(value.kodeHS ?? "-"),
    name: toStringOrNull(value.namaHS) ?? "-",
    latestValue: toNumber(value.nilai_latest_year),
    prevValue: toNumber(value.nilai_prev_year),
    share: toNumber(value.share),
    tujuanEkspor: normalizeCompetitionCountries(value.tujuan_ekspor),
    tujuanImpor: normalizeCompetitionCountries(value.tujuan_impor),
    kompetitorGlobalTopTujuanEkspor: normalizeCompetitionCountries(
      value.kompetitor_global_top_tujuan_ekspor
    ),
    kompetitorAseanTopTujuanEkspor: normalizeCompetitionCountries(
      value.kompetitor_asean_top_tujuan_ekspor
    ),
    kompetitorGlobalTopTujuanImpor: normalizeCompetitionCountries(
      value.kompetitor_global_top_tujuan_impor
    ),
    kompetitorAseanTopTujuanImpor: normalizeCompetitionCountries(
      value.kompetitor_asean_top_tujuan_impor
    )
  };
}

function normalizeInvestmentRow(
  value: unknown,
  latestYear: number | null,
  prevYear: number | null
): MitraOverviewInvestmentRow | null {
  if (!isRecord(value)) return null;
  const latestKey = latestYear != null ? String(latestYear) : null;
  const prevKey = prevYear != null ? String(prevYear) : null;

  return {
    country: toStringOrNull(value.negara) ?? "-",
    alpha2: toStringOrNull(value.alpha2),
    alpha3: toStringOrNull(value.alpha3),
    share: toNumber(value.persen),
    latestValue: latestKey ? toNumber(value[latestKey]) : null,
    prevValue: prevKey ? toNumber(value[prevKey]) : null,
    change: toNumber(value.persen)
  };
}

export async function fetchMitraOverviewTopTrade(
  country: string
): Promise<MitraOverviewTopTradeData | null> {
  const response = await apiClient.get(
    "/api/v1/negara-mitra/overview/top-perdagangan",
    {
      params: { negara: country }
    }
  );
  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  if (!payload) return null;

  const meta = isRecord(payload.meta) ? payload.meta : null;
  const topProduk = isRecord(payload.top_produk) ? payload.top_produk : null;

  return {
    latestYear: toNumber(meta?.latest_year),
    prevYear: toNumber(meta?.prev_year),
    unit: toStringOrNull(meta?.unit) ?? "",
    source: toStringOrNull(meta?.sumber),
    asal: toStringOrNull(meta?.asal),
    asalAlpha2: toStringOrNull(meta?.asal_alpha2),
    asalAlpha3: toStringOrNull(meta?.asal_alpha3),
    partners: Array.isArray(payload.items)
      ? payload.items
          .map(normalizeTopTradePartnerRow)
          .filter((item): item is MitraOverviewTradePartnerRow => item !== null)
      : [],
    exportProducts: Array.isArray(topProduk?.ekspor)
      ? topProduk.ekspor
          .map(normalizeTopTradeProduct)
          .filter((item): item is MitraOverviewTradeProduct => item !== null)
      : [],
    importProducts: Array.isArray(topProduk?.impor)
      ? topProduk.impor
          .map(normalizeTopTradeProduct)
          .filter((item): item is MitraOverviewTradeProduct => item !== null)
      : []
  };
}

export async function fetchMitraOverviewTopInvestment(
  country: string
): Promise<MitraOverviewTopInvestmentData | null> {
  const response = await apiClient.get(
    "/api/v1/negara-mitra/overview/top-investasi",
    {
      params: { negara: country }
    }
  );

  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  const root = payload && isRecord(payload.data) ? payload.data : null;
  if (!root) return null;

  const meta = isRecord(root.meta) ? root.meta : null;
  const items = isRecord(root.items) ? root.items : null;
  const inboundLatestYear =
    toNumber(meta?.inbound_latest_year) ?? toNumber(meta?.latest_year);
  const inboundPrevYear =
    toNumber(meta?.inbound_prev_year) ?? toNumber(meta?.prev_year);
  const outboundLatestYear =
    toNumber(meta?.outbound_latest_year) ?? toNumber(meta?.latest_year);
  const outboundPrevYear =
    toNumber(meta?.outbound_prev_year) ?? toNumber(meta?.prev_year);

  return {
    latestYear: toNumber(meta?.latest_year),
    prevYear: toNumber(meta?.prev_year),
    tujuan: toStringOrNull(meta?.tujuan),
    inboundLatestYear,
    inboundPrevYear,
    outboundLatestYear,
    outboundPrevYear,
    unit: "Ribu US$",
    source: toStringOrNull(meta?.sumber),
    asal: toStringOrNull(meta?.asal),
    asalAlpha2: toStringOrNull(meta?.asal_alpha2),
    asalAlpha3: toStringOrNull(meta?.asal_alpha3),
    inbound: Array.isArray(items?.inbound)
      ? items.inbound
          .map((item) =>
            normalizeInvestmentRow(item, inboundLatestYear, inboundPrevYear)
          )
          .filter((item): item is MitraOverviewInvestmentRow => item !== null)
      : [],
    outbound: Array.isArray(items?.outbound)
      ? items.outbound
          .map((item) =>
            normalizeInvestmentRow(item, outboundLatestYear, outboundPrevYear)
          )
          .filter((item): item is MitraOverviewInvestmentRow => item !== null)
      : []
  };
}

export async function fetchMitraSingleInvestment(
  country: string
): Promise<MitraSingleInvestmentData | null> {
  const response = await apiClient.post(
    "/api/v1/negara-mitra/investasi/single",
    {
      filters: { country }
    }
  );
  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  const meta =
    isRecord(response.data) && isRecord(response.data.meta)
      ? response.data.meta
      : null;
  if (!payload || !meta) return null;

  const summary = isRecord(payload.summary) ? payload.summary : null;
  const inbound = summary && isRecord(summary.inbound) ? summary.inbound : null;
  const outbound =
    summary && isRecord(summary.outbound) ? summary.outbound : null;

  return {
    year: toNumber(meta.year),
    prevYear: toNumber(meta.prevYear),
    country: toStringOrNull(meta.country),
    countryName: toStringOrNull(meta.country_name),
    sourceName: toStringOrNull(meta.source_name),
    unit: "Ribu US$",
    summary: {
      inbound: {
        valueNow: toNumber(inbound?.value_now),
        valuePrev: toNumber(inbound?.value_prev),
        projectsNow: toNumber(inbound?.projects_now),
        projectsPrev: toNumber(inbound?.projects_prev)
      },
      outbound: {
        valueNow: toNumber(outbound?.value_now),
        valuePrev: toNumber(outbound?.value_prev),
        projectsNow: toNumber(outbound?.projects_now),
        projectsPrev: toNumber(outbound?.projects_prev)
      }
    },
    tableInbound: Array.isArray(payload.table_inbound)
      ? payload.table_inbound
          .map(normalizeSingleInvestmentRow)
          .filter((item): item is MitraSingleInvestmentRow => item !== null)
      : [],
    tableOutbound: Array.isArray(payload.table_outbound)
      ? payload.table_outbound
          .map(normalizeSingleInvestmentRow)
          .filter((item): item is MitraSingleInvestmentRow => item !== null)
      : []
  };
}

export async function fetchMitraMultiInvestment(
  origin: string[],
  dest: string[]
): Promise<MitraMultiInvestmentData | null> {
  const response = await apiClient.post(
    "/api/v1/negara-mitra/investasi/multi",
    {
      origin,
      dest
    }
  );
  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  const meta =
    isRecord(response.data) && isRecord(response.data.meta)
      ? response.data.meta
      : null;
  const timeseries =
    payload && isRecord(payload.timeseries) ? payload.timeseries : null;
  if (!payload || !meta) return null;

  return {
    origins: Array.isArray(meta?.origins) ? meta.origins.map(String) : origin,
    destinations: Array.isArray(meta?.dests) ? meta.dests.map(String) : dest,
    originNames: isRecord(meta?.origin_names)
      ? Object.fromEntries(
          Object.entries(meta.origin_names).map(([key, value]) => [
            key,
            toStringOrNull(value) ?? String(value)
          ])
        )
      : {},
    destinationNames: isRecord(meta?.dest_names)
      ? Object.fromEntries(
          Object.entries(meta.dest_names).map(([key, value]) => [
            key,
            toStringOrNull(value) ?? String(value)
          ])
        )
      : {},
    yearFrom: toNumber(meta?.year_from),
    yearTo: toNumber(meta?.year_to),
    unit: toStringOrNull(meta?.unit) ?? "Ribu US$",
    sourceName: toStringOrNull(meta?.source_name),
    timeseries: Array.isArray(timeseries?.data)
      ? timeseries.data
          .filter(isRecord)
          .map((item) => ({
            year: toNumber(item.year) ?? 0,
            inboundValue: toNumber(item.inbound_value),
            outboundValue: toNumber(item.outbound_value)
          }))
          .filter((item) => item.year > 0)
      : []
  };
}

export async function fetchMitraSingleTourism(
  country: string
): Promise<MitraSingleTourismData | null> {
  const response = await apiClient.post(
    "/api/v1/negara-mitra/pariwisata/single",
    {
      filters: { country }
    }
  );
  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  const meta =
    isRecord(response.data) && isRecord(response.data.meta)
      ? response.data.meta
      : null;
  if (!payload || !meta) return null;

  const summary = isRecord(payload.summary) ? payload.summary : null;
  const inbound = summary && isRecord(summary.inbound) ? summary.inbound : null;
  const outbound =
    summary && isRecord(summary.outbound) ? summary.outbound : null;

  return {
    year: toNumber(meta.year),
    prevYear: toNumber(meta.prevYear),
    country: toStringOrNull(meta.country),
    countryName: toStringOrNull(meta.country_name),
    sourceName: toStringOrNull(meta.source_name),
    unit: "Orang",
    summary: {
      inbound: {
        countNow: toNumber(inbound?.count_now),
        countPrev: toNumber(inbound?.count_prev),
        spendingNow: toNumber(inbound?.spending_now),
        spendingPrev: toNumber(inbound?.spending_prev)
      },
      outbound: {
        countNow: toNumber(outbound?.count_now),
        countPrev: toNumber(outbound?.count_prev),
        spendingNow: null,
        spendingPrev: null
      }
    },
    tableInbound: Array.isArray(payload.table_inbound)
      ? payload.table_inbound
          .map(normalizeSingleTourismRow)
          .filter((item): item is MitraSingleTourismRow => item !== null)
      : [],
    tableOutbound: Array.isArray(payload.table_outbound)
      ? payload.table_outbound
          .map(normalizeSingleTourismRow)
          .filter((item): item is MitraSingleTourismRow => item !== null)
      : []
  };
}

export async function fetchMitraMultiTourism(
  origin: string[],
  dest: string[]
): Promise<MitraMultiTourismData | null> {
  const response = await apiClient.post(
    "/api/v1/negara-mitra/pariwisata/multi",
    {
      origin,
      dest
    }
  );
  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  const meta =
    isRecord(response.data) && isRecord(response.data.meta)
      ? response.data.meta
      : null;
  const timeseries =
    payload && isRecord(payload.timeseries) ? payload.timeseries : null;
  if (!payload || !meta) return null;

  return {
    origins: Array.isArray(meta.origins) ? meta.origins.map(String) : origin,
    destinations: Array.isArray(meta.dests) ? meta.dests.map(String) : dest,
    originNames: isRecord(meta.origin_names)
      ? Object.fromEntries(
          Object.entries(meta.origin_names).map(([key, value]) => [
            key,
            toStringOrNull(value) ?? String(value)
          ])
        )
      : {},
    destinationNames: isRecord(meta.dest_names)
      ? Object.fromEntries(
          Object.entries(meta.dest_names).map(([key, value]) => [
            key,
            toStringOrNull(value) ?? String(value)
          ])
        )
      : {},
    yearFrom: toNumber(meta.year_from),
    yearTo: toNumber(meta.year_to),
    sourceName: toStringOrNull(meta.source_name),
    timeseries: Array.isArray(timeseries?.data)
      ? timeseries.data
          .filter(isRecord)
          .map((item) => ({
            year: toNumber(item.year) ?? 0,
            inboundCount: toNumber(item.inbound_count),
            inboundSpending: toNumber(item.inbound_spending),
            outboundCount: toNumber(item.outbound_count)
          }))
          .filter((item) => item.year > 0)
      : []
  };
}

export async function fetchMitraSingleService(
  country: string
): Promise<MitraSingleServiceData | null> {
  const response = await apiClient.post("/api/v1/negara-mitra/jasa/country", {
    filters: { country },
    include: ["summary", "top_countries_inbound", "top_countries_outbound"]
  });
  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  const meta =
    isRecord(response.data) && isRecord(response.data.meta)
      ? response.data.meta
      : null;
  if (!payload || !meta) return null;

  const summary = isRecord(payload.summary) ? payload.summary : null;
  const inbound = summary && isRecord(summary.inbound) ? summary.inbound : null;
  const outbound =
    summary && isRecord(summary.outbound) ? summary.outbound : null;
  const inboundRows =
    payload.top_countries_inbound ??
    payload.top_country_inbound ??
    payload.top_inbound_countries ??
    payload.table_inbound;
  const outboundRows =
    payload.top_countries_outbound ??
    payload.top_country_outbound ??
    payload.top_outbound_countries ??
    payload.table_outbound;

  return {
    year: toNumber(meta.year),
    prevYear: toNumber(meta.prevYear),
    country: toStringOrNull(meta.country),
    countryName: toStringOrNull(meta.country_name),
    sourceName: toStringOrNull(meta.source_name),
    unit: "US$",
    summary: {
      inbound: {
        valueNow: toNumber(inbound?.value_now) ?? toNumber(inbound?.value),
        valuePrev: toNumber(inbound?.value_prev)
      },
      outbound: {
        valueNow: toNumber(outbound?.value_now) ?? toNumber(outbound?.value),
        valuePrev: toNumber(outbound?.value_prev)
      }
    },
    tableInbound: Array.isArray(inboundRows)
      ? inboundRows
          .map(normalizeSingleServiceRow)
          .filter((item): item is MitraSingleServiceRow => item !== null)
      : [],
    tableOutbound: Array.isArray(outboundRows)
      ? outboundRows
          .map(normalizeSingleServiceRow)
          .filter((item): item is MitraSingleServiceRow => item !== null)
      : []
  };
}

export async function fetchMitraMultiService(
  origin: string[],
  dest: string[]
): Promise<MitraMultiServiceData | null> {
  const response = await apiClient.post("/api/v1/negara-mitra/jasa", {
    filters: { origin, dest },
    include: ["timeseries", "top_services_inbound", "top_services_outbound"]
  });
  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  const meta =
    isRecord(response.data) && isRecord(response.data.meta)
      ? response.data.meta
      : null;
  const timeseries =
    payload && isRecord(payload.timeseries) ? payload.timeseries : null;
  if (!payload || !meta) return null;

  const rawOrigins = Array.isArray(meta.origins)
    ? meta.origins
    : Array.isArray(meta.origin)
      ? meta.origin
      : origin;
  const rawDestinations = Array.isArray(meta.dests)
    ? meta.dests
    : Array.isArray(meta.dest)
      ? meta.dest
      : dest;

  return {
    origins: rawOrigins.map(String),
    destinations: rawDestinations.map(String),
    originNames: isRecord(meta.origin_names)
      ? Object.fromEntries(
          Object.entries(meta.origin_names).map(([key, value]) => [
            key,
            toStringOrNull(value) ?? String(value)
          ])
        )
      : {},
    destinationNames: isRecord(meta.dest_names)
      ? Object.fromEntries(
          Object.entries(meta.dest_names).map(([key, value]) => [
            key,
            toStringOrNull(value) ?? String(value)
          ])
        )
      : {},
    yearFrom: toNumber(meta.year_from),
    yearTo: toNumber(meta.year_to) ?? toNumber(meta.year),
    sourceName: toStringOrNull(meta.source_name),
    unit: toStringOrNull(meta.unit) ?? "US$",
    timeseries: Array.isArray(timeseries?.data)
      ? timeseries.data
          .filter(isRecord)
          .map((item) => ({
            year: toNumber(item.year) ?? 0,
            inboundValue:
              toNumber(item.inbound_value) ??
              toNumber(item.inbound) ??
              toNumber(item.export),
            outboundValue:
              toNumber(item.outbound_value) ??
              toNumber(item.outbound) ??
              toNumber(item.import)
          }))
          .filter((item) => item.year > 0)
      : [],
    topServicesInbound: Array.isArray(payload.top_services_inbound)
      ? payload.top_services_inbound
          .map(normalizeServiceCategoryRow)
          .filter((item): item is MitraServiceCategoryRow => item !== null)
      : [],
    topServicesOutbound: Array.isArray(payload.top_services_outbound)
      ? payload.top_services_outbound
          .map(normalizeServiceCategoryRow)
          .filter((item): item is MitraServiceCategoryRow => item !== null)
      : []
  };
}

export async function fetchMitraOverviewTopTourism(
  country: string
): Promise<MitraOverviewTopTourismData | null> {
  const response = await apiClient.get(
    "/api/v1/negara-mitra/overview/top-pariwisata",
    {
      params: { negara: country }
    }
  );

  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  const root = payload && isRecord(payload.data) ? payload.data : null;
  if (!root) return null;

  const meta = isRecord(root.meta) ? root.meta : null;
  const items = isRecord(root.items) ? root.items : null;
  const latestYear = toNumber(meta?.latest_year);
  const prevYear = toNumber(meta?.prev_year);

  const mapTourismRow = (value: unknown): MitraOverviewInvestmentRow | null => {
    if (!isRecord(value)) return null;
    return {
      country: toStringOrNull(value.country) ?? "-",
      alpha2: toStringOrNull(value.alpha2),
      alpha3: toStringOrNull(value.alpha3),
      share: null,
      latestValue:
        latestYear != null ? toNumber(value[`value${latestYear}`]) : null,
      prevValue: prevYear != null ? toNumber(value[`value${prevYear}`]) : null,
      change: null
    };
  };

  return {
    latestYear,
    prevYear,
    tujuan: toStringOrNull(meta?.tujuan),
    unit: "Orang",
    source: toStringOrNull(meta?.sumber),
    inbound: Array.isArray(items?.inbound)
      ? items.inbound
          .map(mapTourismRow)
          .filter((item): item is MitraOverviewInvestmentRow => item !== null)
      : [],
    outbound: Array.isArray(items?.outbound)
      ? items.outbound
          .map(mapTourismRow)
          .filter((item): item is MitraOverviewInvestmentRow => item !== null)
      : []
  };
}

export async function fetchMitraOverviewTopService(
  country: string
): Promise<MitraOverviewTopServiceData | null> {
  const response = await apiClient.get(
    "/api/v1/negara-mitra/overview/top-jasa",
    {
      params: { negara: country }
    }
  );

  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  const root = payload && isRecord(payload.data) ? payload.data : null;
  if (!root) return null;

  const meta = isRecord(root.meta) ? root.meta : null;
  const items = isRecord(root.items) ? root.items : null;
  const latestYear = toNumber(meta?.latest_year);
  const prevYear = toNumber(meta?.prev_year);

  const rows = Array.isArray(items?.bothYears)
    ? items.bothYears.filter(isRecord).map((item) => ({
        label: toStringOrNull(item.label) ?? "-",
        latestValue:
          latestYear != null ? toNumber(item[`value${latestYear}`]) : null,
        prevValue: prevYear != null ? toNumber(item[`value${prevYear}`]) : null,
        share: toNumber(item.share),
        change: toNumber(item.change)
      }))
    : [];

  return {
    latestYear,
    prevYear,
    tujuan: toStringOrNull(meta?.tujuan),
    source: toStringOrNull(meta?.sumber),
    totalLatest: toNumber(meta?.total_latest),
    totalPrev: toNumber(meta?.total_prev),
    rows
  };
}

export async function fetchMitraTradeOverview(
  params: MitraTradeOverviewParams
): Promise<MitraTradeOverviewData | null> {
  const response = await apiClient.post("/api/v1/negara-mitra/perdagangan", {
    origin: params.origin,
    dest: params.dest,
    include: [
      "summary",
      "timeseries",
      "top_products_export",
      "top_products_import"
    ]
  });

  const payload =
    isRecord(response.data) && isRecord(response.data.data)
      ? response.data.data
      : null;
  const meta =
    isRecord(response.data) && isRecord(response.data.meta)
      ? response.data.meta
      : null;
  const summary = payload && isRecord(payload.summary) ? payload.summary : null;
  const timeseries =
    payload && isRecord(payload.timeseries) ? payload.timeseries : null;
  const exportSummary =
    summary && isRecord(summary.export) ? summary.export : null;
  const importSummary =
    summary && isRecord(summary.import) ? summary.import : null;
  if (!meta || !summary) return null;

  const exportNow = toNumber(exportSummary?.value_now);
  const exportPrev = toNumber(exportSummary?.value_prev);
  const importNow = toNumber(importSummary?.value_now);
  const importPrev = toNumber(importSummary?.value_prev);

  return {
    year: toNumber(meta.year),
    unit: toStringOrNull(meta.unit) ?? "",
    sourceName: toStringOrNull(meta.source_name),
    origin: Array.isArray(meta.origin) ? meta.origin.map(String) : [],
    destination: Array.isArray(meta.dest) ? meta.dest.map(String) : [],
    originNames: isRecord(meta.origin_name)
      ? Object.fromEntries(
          Object.entries(meta.origin_name).map(([key, value]) => [
            key,
            toStringOrNull(value) ?? String(value)
          ])
        )
      : {},
    destinationNames: isRecord(meta.dest_name)
      ? Object.fromEntries(
          Object.entries(meta.dest_name).map(([key, value]) => [
            key,
            toStringOrNull(value) ?? String(value)
          ])
        )
      : {},
    timeseries: Array.isArray(timeseries?.data)
      ? timeseries.data
          .filter(isRecord)
          .map((item) => {
            const exportValue = toNumber(item.export);
            const importValue = toNumber(item.import);
            return {
              year: toNumber(item.year) ?? 0,
              export: exportValue,
              import: importValue,
              total:
                exportValue != null && importValue != null
                  ? exportValue + importValue
                  : null,
              balance:
                exportValue != null && importValue != null
                  ? exportValue - importValue
                  : null
            };
          })
          .filter((item) => item.year > 0)
      : [],
    export: {
      valueNow: exportNow,
      valuePrev: exportPrev
    },
    import: {
      valueNow: importNow,
      valuePrev: importPrev
    },
    total: {
      valueNow:
        exportNow != null && importNow != null ? exportNow + importNow : null,
      valuePrev:
        exportPrev != null && importPrev != null
          ? exportPrev + importPrev
          : null
    },
    balance: {
      valueNow:
        exportNow != null && importNow != null ? exportNow - importNow : null,
      valuePrev:
        exportPrev != null && importPrev != null
          ? exportPrev - importPrev
          : null
    },
    topProductsExport: Array.isArray(payload?.top_products_export)
      ? payload.top_products_export
          .map(normalizeTradeOverviewProduct)
          .filter(
            (
              item
            ): item is NonNullable<
              ReturnType<typeof normalizeTradeOverviewProduct>
            > => item !== null
          )
      : [],
    topProductsImport: Array.isArray(payload?.top_products_import)
      ? payload.top_products_import
          .map(normalizeTradeOverviewProduct)
          .filter(
            (
              item
            ): item is NonNullable<
              ReturnType<typeof normalizeTradeOverviewProduct>
            > => item !== null
          )
      : []
  };
}

export async function downloadMitraTradeSummaryPdf(
  params: MitraTradeOverviewParams,
  filenameBase: string
) {
  const response = await apiClient.post(
    "/api/v1/negara-mitra/perdagangan/summary/pdf",
    {
      origin: params.origin,
      dest: params.dest,
      include: [
        "summary",
        "timeseries",
        "top_products_export",
        "top_products_import"
      ]
    },
    { responseType: "blob" }
  );
  const disposition = response.headers["content-disposition"];
  const headerFilenameMatch =
    typeof disposition === "string"
      ? disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i)
      : null;
  const headerFilename = headerFilenameMatch?.[1]
    ? decodeURIComponent(headerFilenameMatch[1])
    : null;

  return {
    blob: response.data as Blob,
    filename: headerFilename ?? filenameBase
  };
}

export async function downloadMitraInvestmentSummaryPdf(
  params: {
    country: string;
    origin: string[];
    destination: string[];
  },
  filenameBase: string
) {
  const response = await apiClient.post(
    "/api/v1/negara-mitra/investasi/summary/pdf",
    {
      single: {
        filters: {
          country: params.country
        }
      },
      multi: {
        filters: {
          origin: params.origin,
          destination: params.destination
        }
      }
    },
    { responseType: "blob" }
  );
  const disposition = response.headers["content-disposition"];
  const headerFilenameMatch =
    typeof disposition === "string"
      ? disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i)
      : null;
  const headerFilename = headerFilenameMatch?.[1]
    ? decodeURIComponent(headerFilenameMatch[1])
    : null;

  return {
    blob: response.data as Blob,
    filename: headerFilename ?? filenameBase
  };
}

export async function downloadMitraTourismSummaryPdf(
  params: {
    country: string;
    origin: string[];
    destination: string[];
  },
  filenameBase: string
) {
  const response = await apiClient.post(
    "/api/v1/negara-mitra/pariwisata/summary/pdf",
    {
      single: {
        filters: {
          country: params.country
        }
      },
      multi: {
        filters: {
          origin: params.origin,
          destination: params.destination
        }
      }
    },
    { responseType: "blob" }
  );
  const disposition = response.headers["content-disposition"];
  const headerFilenameMatch =
    typeof disposition === "string"
      ? disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i)
      : null;
  const headerFilename = headerFilenameMatch?.[1]
    ? decodeURIComponent(headerFilenameMatch[1])
    : null;

  return {
    blob: response.data as Blob,
    filename: headerFilename ?? filenameBase
  };
}

export async function downloadMitraServiceSummaryPdf(
  params: {
    country: string;
    origin: string[];
    destination: string[];
  },
  filenameBase: string
) {
  const response = await apiClient.post(
    "/api/v1/negara-mitra/jasa/summary/pdf",
    {
      single: {
        filters: {
          country: params.country
        }
      },
      multi: {
        filters: {
          origin: params.origin,
          dest: params.destination
        }
      }
    },
    { responseType: "blob" }
  );
  const disposition = response.headers["content-disposition"];
  const headerFilenameMatch =
    typeof disposition === "string"
      ? disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i)
      : null;
  const headerFilename = headerFilenameMatch?.[1]
    ? decodeURIComponent(headerFilenameMatch[1])
    : null;

  return {
    blob: response.data as Blob,
    filename: headerFilename ?? filenameBase
  };
}

export async function downloadMitraOverviewSummaryPdf(
  tab: keyof typeof MITRA_OVERVIEW_SUMMARY_ENDPOINTS,
  country: string,
  filenameBase: string
) {
  const response = await apiClient.post(
    MITRA_OVERVIEW_SUMMARY_ENDPOINTS[tab],
    { negara: country },
    { responseType: "blob" }
  );
  const disposition = response.headers["content-disposition"];
  const headerFilenameMatch =
    typeof disposition === "string"
      ? disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i)
      : null;
  const headerFilename = headerFilenameMatch?.[1]
    ? decodeURIComponent(headerFilenameMatch[1])
    : null;

  return {
    blob: response.data as Blob,
    filename: headerFilename ?? filenameBase
  };
}
