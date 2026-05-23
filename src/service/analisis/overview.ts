import { apiClient } from "@/service/httpClient";
import type {
  AnalisisOperationalRiskBreakdownRow,
  AnalisisOperationalRiskCountryRow,
  AnalisisOperationalRiskResult,
  AnalisisGeopolitikCountryMeta,
  AnalisisGeopolitikPerdaganganResult,
  AnalisisGeopolitikProductCountryMetric,
  AnalisisGeopolitikProductItem,
  AnalisisGeopolitikTopCountryRow,
  AnalisisPotensiDayaSaingCalculationResult,
  AnalisisPotensiDayaSaingCalcRow,
  AnalisisKomoditasEksporUtamaCompetitor,
  AnalisisKomoditasEksporUtamaItem,
  AnalisisKomoditasEksporUtamaParams,
  AnalisisKomoditasEksporUtamaResult,
  AnalisisPotensiDayaSaingOverviewResult,
  AnalisisPotensiDayaSaingRouteParams,
  AnalisisPotensiDayaSaingSimpleRow,
  AnalisisRscaTbiCalculationResult,
  AnalisisRscaTbiCalculationRow,
  AnalisisRscaTbiComparisonResult,
  AnalisisRscaTbiComparisonRow,
  AnalisisRscaTbiResult,
  AnalisisRscaTbiRow,
  AnalisisRcaEpdCalculationResult,
  AnalisisRcaEpdCalculationRow,
  AnalisisRcaEpdComparisonResult,
  AnalisisRcaEpdComparisonRow,
  AnalisisRcaEpdResult,
  AnalisisRcaEpdRow,
  AnalisisRcaEpdXModelOptionResult
} from "@/type/analisis";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asNullableNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toCompetitors(
  value: unknown
): AnalisisKomoditasEksporUtamaCompetitor[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item, index) => ({
    kode: asString(item.kode, "-"),
    nama: asString(item.nama, "-"),
    a2: asString(item.a2) || null,
    nilai: asNumber(item.nilai),
    sharePct:
      item.share_pct == null
        ? null
        : Number.isFinite(Number(item.share_pct))
          ? Number(item.share_pct)
          : null,
    rank:
      item.rank == null
        ? index + 1
        : Number.isFinite(Number(item.rank))
          ? Number(item.rank)
          : index + 1,
    rankGlobal:
      item.rank_global == null
        ? null
        : Number.isFinite(Number(item.rank_global))
          ? Number(item.rank_global)
          : null
  }));
}

function inferYearsFromItem(item: Record<string, unknown>) {
  return Object.keys(item)
    .map((key) => {
      const match = key.match(/^exp_(\d{4})$/);
      return match ? Number(match[1]) : null;
    })
    .filter(
      (value): value is number => value != null && Number.isFinite(value)
    );
}

function normalizeItems(value: unknown) {
  if (!Array.isArray(value)) return [] as AnalisisKomoditasEksporUtamaItem[];
  return value
    .filter(isRecord)
    .map((item) => {
      const years = inferYearsFromItem(item);
      const exportValues = Object.fromEntries(
        years.map((year) => [year, asNumber(item[`exp_${year}`])])
      ) as Record<number, number>;
      const exportMirrorValues = Object.fromEntries(
        years.map((year) => [year, asNumber(item[`exp_rev_${year}`])])
      ) as Record<number, number>;
      const sharePct = Object.fromEntries(
        years.map((year) => [year, asNumber(item[`share_pct_${year}`])])
      ) as Record<number, number>;

      return {
        hs4: asString(item.hs4, "-"),
        hsDesc: asString(item.hs_desc, "-"),
        exportValues,
        exportMirrorValues,
        sharePct,
        growthCagrPct:
          item.growth_cagr_pct == null
            ? null
            : Number.isFinite(Number(item.growth_cagr_pct))
              ? Number(item.growth_cagr_pct)
              : null,
        competitorGlobal: toCompetitors(item.kompetitor_global),
        competitorAsean: toCompetitors(item.kompetitor_asean)
      };
    })
    .filter((item) => item.hs4 !== "-");
}

function normalizeResult(payload: unknown): AnalisisKomoditasEksporUtamaResult {
  const root = isRecord(payload) ? payload : {};
  const meta = isRecord(root.meta) ? root.meta : {};
  const data = isRecord(root.data) ? root.data : {};
  const nestedData = isRecord(data.data) ? data.data : {};
  const items = normalizeItems(nestedData.items);
  const years = Array.from(
    new Set([
      ...(Array.isArray(meta.years)
        ? meta.years.map((year) => Number(year))
        : []),
      ...items.flatMap((item) =>
        Object.keys(item.exportValues).map((year) => Number(year))
      )
    ])
  )
    .filter((year) => Number.isFinite(year))
    .sort((left, right) => left - right);

  const topProduk = items.map((item) => {
    const tujuanEkspor = (Array.isArray(meta.dest) ? meta.dest : []).map(
      (destCode, index) => {
        const code = String(destCode);
        const latestYear = years[years.length - 1] ?? null;
        const destinationNames = isRecord(meta.dest_names)
          ? meta.dest_names
          : {};
        const destinationA2 = isRecord(meta.dest_a2) ? meta.dest_a2 : {};
        return {
          rank: index + 1,
          kode_alpha2: asString(destinationA2[code]) || null,
          kode_alpha3: code,
          negara: asString(destinationNames[code], code),
          nilai: latestYear != null ? (item.exportValues[latestYear] ?? 0) : 0,
          share_pct: latestYear != null ? (item.sharePct[latestYear] ?? 0) : 0
        };
      }
    );

    return {
      kodeHS: item.hs4,
      namaHS: item.hsDesc,
      nilai: item.exportValues,
      export: item.exportValues,
      export_reverse: item.exportMirrorValues,
      share: item.sharePct,
      growth_cagr_pct: item.growthCagrPct,
      tujuan_ekspor: tujuanEkspor,
      kompetitor_global_top_tujuan_ekspor: item.competitorGlobal.map(
        (entry) => ({
          rank: entry.rank,
          kode_alpha2: entry.a2,
          kode_alpha3: entry.kode,
          negara: entry.nama,
          nilai: entry.nilai,
          share_pct: entry.sharePct,
          rank_global: entry.rankGlobal
        })
      ),
      kompetitor_asean_top_tujuan_ekspor: item.competitorAsean.map((entry) => ({
        rank: entry.rank,
        kode_alpha2: entry.a2,
        kode_alpha3: entry.kode,
        negara: entry.nama,
        nilai: entry.nilai,
        share_pct: entry.sharePct,
        rank_global: entry.rankGlobal
      }))
    };
  });

  return {
    items,
    meta: {
      origin: asString(meta.origin) || null,
      originName: asString(meta.origin_name) || null,
      originA2: asString(meta.origin_a2) || null,
      destinations: Array.isArray(meta.dest)
        ? meta.dest.map((item) => String(item))
        : [],
      destinationNames: isRecord(meta.dest_names)
        ? Object.fromEntries(
            Object.entries(meta.dest_names).map(([key, value]) => [
              key,
              asString(value, key)
            ])
          )
        : {},
      destinationA2: isRecord(meta.dest_a2)
        ? Object.fromEntries(
            Object.entries(meta.dest_a2).map(([key, value]) => [
              key,
              asString(value)
            ])
          )
        : {},
      years,
      unit: asString(meta.unit) || null,
      limit: Number.isFinite(Number(meta.limit)) ? Number(meta.limit) : null,
      sourceName: asString(meta.sumber) || null
    },
    tableRaw: {
      top_produk: topProduk
    },
    raw: payload
  };
}

function hs4FromKode(kode: unknown) {
  const digits = String(kode ?? "").replace(/\D+/g, "");
  if (!digits) return "-";
  return digits.padStart(4, "0").slice(0, 4);
}

function normalizeSimpleRows(
  value: unknown
): AnalisisPotensiDayaSaingSimpleRow[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item) => ({
    rank:
      item.Rank == null
        ? null
        : Number.isFinite(Number(item.Rank))
          ? Number(item.Rank)
          : null,
    hs4: hs4FromKode(item.Kode),
    kode: asString(item.Kode) || null,
    nama: asString(item["Nama Produk"] ?? item.NamaProduk ?? item.Nama, "-"),
    strategi: asString(item.Strategi) || null,
    nilai:
      item.Nilai == null
        ? null
        : Number.isFinite(Number(item.Nilai))
          ? Number(item.Nilai)
          : null
  }));
}

function normalizeOverviewPotensi(
  payload: unknown
): AnalisisPotensiDayaSaingOverviewResult {
  const root = isRecord(payload) ? payload : {};
  const outerData = isRecord(root.data) ? root.data : {};
  const meta = isRecord(root.meta)
    ? root.meta
    : isRecord(outerData.meta)
      ? outerData.meta
      : isRecord(outerData.data) && isRecord(outerData.data.meta)
        ? outerData.data.meta
        : {};
  const buckets = isRecord(outerData.data) ? outerData.data : outerData;

  const exportRows = normalizeSimpleRows(buckets.export);
  const importRows = normalizeSimpleRows(buckets.import);
  const fdiInboundRows = normalizeSimpleRows(buckets.fdi_inbound);
  const fdiOutboundRows = normalizeSimpleRows(buckets.fdi_outbound);

  return {
    sourceName: asString(meta.sumber) || null,
    origin: {
      code: isRecord(meta.origin) ? asString(meta.origin.a3) || null : null,
      name: isRecord(meta.origin) ? asString(meta.origin.nama) || null : null
    },
    destination: {
      code: isRecord(meta.dest) ? asString(meta.dest.a3) || null : null,
      name: isRecord(meta.dest) ? asString(meta.dest.nama) || null : null
    },
    totals: {
      exportCount: exportRows.length,
      importCount: importRows.length,
      fdiInboundCount: fdiInboundRows.length,
      fdiOutboundCount: fdiOutboundRows.length,
      allCount:
        exportRows.length +
        importRows.length +
        fdiInboundRows.length +
        fdiOutboundRows.length,
      exportSum: buckets.SUMexport == null ? null : asNumber(buckets.SUMexport),
      importSum: buckets.SUMimport == null ? null : asNumber(buckets.SUMimport),
      fdiInboundSum:
        buckets.SUMfdi_inbound == null
          ? null
          : asNumber(buckets.SUMfdi_inbound),
      fdiOutboundSum:
        buckets.SUMfdi_outbound == null
          ? null
          : asNumber(buckets.SUMfdi_outbound)
    },
    buckets: {
      export: exportRows,
      import: importRows,
      fdiInbound: fdiInboundRows,
      fdiOutbound: fdiOutboundRows
    },
    raw: payload
  };
}

function normalizeCalcRows(value: unknown): AnalisisPotensiDayaSaingCalcRow[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item) => ({
    hs4: asString(item.hs4) || hs4FromKode(item.kode ?? item.Kode),
    kode: asString(item.kode ?? item.Kode) || null,
    nama: asString(
      item.nama_produk ??
        item["Nama Produk"] ??
        item.NamaProduk ??
        item.nama ??
        item.Nama,
      "-"
    ),
    strategi: asString(item.strategi ?? item.Strategy) || null,
    rcaAsal:
      item.rca_asal == null && item.RCA_Asal == null
        ? null
        : asNumber(item.rca_asal ?? item.RCA_Asal),
    cmsaAsal:
      item.cmsa_asal == null && item.CMSA_Asal == null
        ? null
        : asNumber(item.cmsa_asal ?? item.CMSA_Asal),
    classAsal: asString(item.class_asal ?? item.Class_Asal) || null,
    rcaTujuan:
      item.rca_tujuan == null && item.RCA_Tujuan == null
        ? null
        : asNumber(item.rca_tujuan ?? item.RCA_Tujuan),
    cmsaTujuan:
      item.cmsa_tujuan == null && item.CMSA_Tujuan == null
        ? null
        : asNumber(item.cmsa_tujuan ?? item.CMSA_Tujuan),
    classTujuan: asString(item.class_tujuan ?? item.Class_Tujuan) || null,
    asalWorld:
      item.asal_world == null && item.Asal_World == null
        ? null
        : asNumber(item.asal_world ?? item.Asal_World),
    tujuanWorld:
      item.tujuan_world == null && item.Tujuan_World == null
        ? null
        : asNumber(item.tujuan_world ?? item.Tujuan_World)
  }));
}

function normalizeCalculationPotensi(
  payload: unknown
): AnalisisPotensiDayaSaingCalculationResult {
  const root = isRecord(payload) ? payload : {};
  const outerData = isRecord(root.data) ? root.data : {};
  const meta = isRecord(root.meta)
    ? root.meta
    : isRecord(outerData.meta)
      ? outerData.meta
      : isRecord(outerData.data) && isRecord(outerData.data.meta)
        ? outerData.data.meta
        : {};
  const nestedData = isRecord(outerData.data) ? outerData.data : {};
  const rows = Array.isArray(nestedData.rows)
    ? nestedData.rows
    : Array.isArray(outerData.rows)
      ? outerData.rows
      : Array.isArray(outerData.data)
        ? outerData.data
        : [];

  return {
    sourceName: asString(meta.sumber) || null,
    origin: {
      code: isRecord(meta.origin) ? asString(meta.origin.a3) || null : null,
      name: isRecord(meta.origin) ? asString(meta.origin.nama) || null : null
    },
    destination: {
      code: isRecord(meta.dest) ? asString(meta.dest.a3) || null : null,
      name: isRecord(meta.dest) ? asString(meta.dest.nama) || null : null
    },
    rows: normalizeCalcRows(rows),
    raw: payload
  };
}

export async function fetchAnalisisKomoditasEksporUtama(
  params: AnalisisKomoditasEksporUtamaParams
): Promise<AnalisisKomoditasEksporUtamaResult> {
  const response = await apiClient.get(
    "/api/v1/analisis/komoditas-ekspor-utama",
    {
      params: {
        origin: params.origin,
        dest: params.dest
      }
    }
  );

  return normalizeResult(response.data);
}

export async function fetchAnalisisRcaCmsa(
  params: AnalisisPotensiDayaSaingRouteParams
): Promise<AnalisisPotensiDayaSaingOverviewResult> {
  const response = await apiClient.get("/api/v1/analisis/rca-cmsa", {
    params: {
      origin: params.origin,
      dest: params.dest
    }
  });

  return normalizeOverviewPotensi(response.data);
}

export async function fetchAnalisisRcaCmsaCalculation(
  params: AnalisisPotensiDayaSaingRouteParams
): Promise<AnalisisPotensiDayaSaingCalculationResult> {
  const response = await apiClient.get("/api/v1/analisis/rca-cmsa-kalkulasi", {
    params: {
      origin: params.origin,
      dest: params.dest
    }
  });

  return normalizeCalculationPotensi(response.data);
}

function asArray<T = unknown>(value: unknown) {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asCountryMeta(value: unknown): AnalisisGeopolitikCountryMeta[] {
  return asArray<Record<string, unknown>>(value)
    .filter(isRecord)
    .map((item) => ({
      codeAlpha3: asString(item.code_alpha3 || item.kode_alpha3, "-"),
      codeAlpha2: asString(item.code_alpha2 || item.kode_alpha2) || null,
      name: asString(item.name || item.nama, "-")
    }))
    .filter((item) => item.codeAlpha3 !== "-");
}

function asRankList(value: unknown) {
  return asArray<Record<string, unknown>>(value)
    .filter(isRecord)
    .filter((item) => {
      const rank = asNullableNumber(item.rank);
      const metricValue = asNullableNumber(item.nilai ?? item.value);
      return (
        rank != null && rank > 0 && (metricValue == null || metricValue > 0)
      );
    })
    .sort(
      (left, right) => asNumber(left.rank, 9999) - asNumber(right.rank, 9999)
    )
    .map((item, index) => {
      const rank = asNullableNumber(item.rank) ?? index + 1;
      const name = asString(item.nama || item.name || item.kode_alpha3, "-");
      const share = asNullableNumber(item.share_pct);
      return `${rank}) ${name}${share == null ? "" : ` (${share.toFixed(2)}%)`}`;
    })
    .join(" | ");
}

function normalizeTopCountryRows(
  value: unknown
): AnalisisGeopolitikTopCountryRow[] {
  const root = isRecord(value) ? value : {};
  const world = isRecord(root.world) ? root.world : null;
  const ranks = asArray<Record<string, unknown>>(root.ranks);
  const idn =
    ranks.find((item) => asString(item.code_alpha3).toUpperCase() === "IDN") ??
    null;
  const rows = [
    world,
    idn,
    ...ranks.filter(
      (item) => asString(item.code_alpha3).toUpperCase() !== "IDN"
    )
  ].filter(isRecord);

  return rows.map((item) => {
    const current = isRecord(item.curr) ? item.curr : {};
    const previous = isRecord(item.prev) ? item.prev : {};
    const currentValue = asNumber(current.value);
    const previousValue = asNullableNumber(previous.value);
    const deltaFromPayload = asNullableNumber(item.change_pct);
    const deltaCalculated =
      previousValue != null && previousValue !== 0
        ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
        : null;

    return {
      rank: asNullableNumber(item.rank),
      name: asString(item.name, "-"),
      codeAlpha3: asString(item.code_alpha3) || null,
      codeAlpha2: asString(item.code_alpha2) || null,
      currentValue,
      previousValue,
      currentShare: asNullableNumber(current.share),
      previousShare: asNullableNumber(previous.share),
      deltaPct: deltaFromPayload ?? deltaCalculated
    };
  });
}

function getMetricByCode(
  countries: AnalisisGeopolitikProductCountryMetric[],
  codeAlpha3: string
) {
  return (
    countries.find(
      (item) => item.codeAlpha3.toUpperCase() === codeAlpha3.toUpperCase()
    ) ?? null
  );
}

function normalizeProductItems(
  value: unknown,
  geoCountries: AnalisisGeopolitikCountryMeta[]
): AnalisisGeopolitikProductItem[] {
  return asArray<Record<string, unknown>>(value)
    .filter(isRecord)
    .sort(
      (left, right) =>
        asNumber(left.no, Number.POSITIVE_INFINITY) -
        asNumber(right.no, Number.POSITIVE_INFINITY)
    )
    .map((item) => {
      const world = isRecord(item.world) ? item.world : {};
      const worldCurr = isRecord(world.curr) ? world.curr : {};
      const worldPrev = isRecord(world.prev) ? world.prev : {};
      const countries = asArray<Record<string, unknown>>(item.countries)
        .filter(isRecord)
        .map((entry) => ({
          codeAlpha3: asString(entry.code_alpha3 || entry.kode_alpha3, "-"),
          codeAlpha2: asString(entry.code_alpha2 || entry.kode_alpha2) || null,
          name: asString(entry.name || entry.nama, "-"),
          value: asNumber(entry.value),
          previousValue: asNumber(entry.prev_value),
          share:
            entry.share == null
              ? null
              : Number.isFinite(Number(entry.share))
                ? Number(entry.share)
                : null,
          previousShare: null
        }))
        .filter((entry) => entry.codeAlpha3 !== "-");

      const worldCurrentValue = asNumber(worldCurr.value);
      const worldPreviousValue = asNumber(worldPrev.value);
      const normalizedCountries = geoCountries
        .filter((itemMeta) => itemMeta.codeAlpha3.toUpperCase() !== "WLD")
        .map((itemMeta) => {
          const found = getMetricByCode(countries, itemMeta.codeAlpha3);
          const share =
            found?.share ??
            (worldCurrentValue > 0
              ? ((found?.value ?? 0) / worldCurrentValue) * 100
              : 0);
          const previousShare =
            worldPreviousValue > 0
              ? ((found?.previousValue ?? 0) / worldPreviousValue) * 100
              : 0;

          return {
            codeAlpha3: itemMeta.codeAlpha3,
            codeAlpha2: found?.codeAlpha2 ?? itemMeta.codeAlpha2,
            name: found?.name ?? itemMeta.name,
            value: found?.value ?? 0,
            previousValue: found?.previousValue ?? 0,
            share,
            previousShare
          };
        });

      return {
        no: asNullableNumber(item.no),
        hs: asString(item.hs, "-"),
        productName: asString(item.produk, "-"),
        worldCurrentValue,
        worldPreviousValue,
        countryMetrics: normalizedCountries,
        rankList: asRankList(item.countries)
      };
    })
    .filter((item) => item.hs !== "-");
}

function extractYears(value: unknown) {
  const years = new Set<number>();

  const walk = (input: unknown) => {
    const directNumber = Number(input);
    if (
      Number.isFinite(directNumber) &&
      directNumber > 1900 &&
      directNumber < 3000
    ) {
      years.add(directNumber);
    }

    if (Array.isArray(input)) {
      input.forEach(walk);
      return;
    }
    if (!isRecord(input)) return;

    for (const [key, nested] of Object.entries(input)) {
      const keyNumber = Number(key);
      if (Number.isFinite(keyNumber) && keyNumber > 1900 && keyNumber < 3000) {
        years.add(keyNumber);
      }
      walk(nested);
    }
  };

  walk(value);
  return Array.from(years).sort((left, right) => left - right);
}

export async function fetchAnalisisGeopolitikPerdaganganDefaultYears(): Promise<
  number[]
> {
  const response = await apiClient.get("/api/v1/tahun-perdagangan-default");
  return extractYears(response.data);
}

export async function fetchAnalisisGeopolitikPerdagangan(
  year: number
): Promise<AnalisisGeopolitikPerdaganganResult> {
  const response = await apiClient.get(
    "/api/v1/analisis/geopolitik-perdagangan",
    {
      params: {
        tahun: year,
        year
      }
    }
  );

  const root = isRecord(response.data) ? response.data : {};
  const data = isRecord(root.data) ? root.data : {};
  const meta = isRecord(data.meta) ? data.meta : {};
  const topGeoCountries = isRecord(data.top_geo_countries)
    ? data.top_geo_countries
    : {};
  const topProducts = isRecord(data.top_produk) ? data.top_produk : {};
  const geoCountries = asCountryMeta(meta.geo_countries);

  return {
    meta: {
      year,
      previousYear: asNullableNumber(meta.prev_year),
      unit: asString(meta.unit) || null,
      sourceName: asString(meta.sumber) || null,
      topGeoLimit: asNumber(
        isRecord(meta.limits) ? meta.limits.top_geo_countries : null,
        5
      ),
      topProductsLimit: asNumber(
        isRecord(meta.limits) ? meta.limits.top_products : null,
        20
      ),
      geoCountries
    },
    topGeoCountries: {
      export: normalizeTopCountryRows(topGeoCountries.export),
      import: normalizeTopCountryRows(topGeoCountries.import)
    },
    comparisonProducts: {
      export: normalizeProductItems(topProducts.ekspor, geoCountries).slice(
        0,
        5
      ),
      import: normalizeProductItems(topProducts.impor, geoCountries).slice(0, 5)
    },
    top20Products: {
      export: normalizeProductItems(topProducts.ekspor, geoCountries),
      import: normalizeProductItems(topProducts.impor, geoCountries)
    },
    raw: response.data
  };
}

function normalizeOperationalRiskCountryRows(
  value: unknown
): AnalisisOperationalRiskCountryRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => ({
      codeAlpha3: asString(item.Kode_Alpha3 || item.kode_alpha3) || null,
      codeAlpha2: asString(item.Kode_Alpha2 || item.kode_alpha2) || null,
      name: asString(item.Negara || item.nama, "-"),
      scores: Object.fromEntries(
        asArray<Record<string, unknown>>(item.years)
          .filter(isRecord)
          .map((entry) => [asNumber(entry.Tahun), asNumber(entry.Score)])
          .filter(([year]) => Number.isFinite(year))
      )
    }))
    .filter((item) => item.name !== "-");
}

function normalizeOperationalRiskBreakdownRows(
  value: unknown
): AnalisisOperationalRiskBreakdownRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => ({
      indicatorId: asNullableNumber(item.ID_Indikator ?? item.id_indikator),
      indicator: asString(item.Indikator || item.indikator, "-"),
      scores: Object.fromEntries(
        asArray<Record<string, unknown>>(item.years)
          .filter(isRecord)
          .map((entry) => [asNumber(entry.Tahun), asNumber(entry.Score)])
          .filter(([year]) => Number.isFinite(year))
      )
    }))
    .filter((item) => item.indicator !== "-");
}

function extractRscaPayloadRows(payload: unknown) {
  const root = isRecord(payload) ? payload : {};
  const outerData = "data" in root ? root.data : payload;
  if (Array.isArray(outerData)) return outerData;

  if (isRecord(outerData)) {
    if (Array.isArray(outerData.data)) return outerData.data;
    if (Array.isArray(outerData.rows)) return outerData.rows;
  }

  return [];
}

function extractRscaMeta(payload: unknown) {
  const root = isRecord(payload) ? payload : {};
  const outerData = isRecord(root.data) ? root.data : {};
  return isRecord(root.meta)
    ? root.meta
    : isRecord(outerData.meta)
      ? outerData.meta
      : {};
}

function normalizeRscaTbiRows(value: unknown): AnalisisRscaTbiRow[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).map((item) => {
    const kode =
      asString(item.HsCode ?? item.hs_code ?? item.kode ?? item.Kode) || null;

    return {
      hs4: hs4FromKode(kode),
      kode,
      nama: asString(
        item.NamaProduk ??
          item.nama_produk ??
          item["Nama Produk"] ??
          item.nama ??
          item.Nama,
        "-"
      ),
      rsca2019: asNullableNumber(item.RSCA_2019 ?? item.RSCA_Tahun2),
      rsca2023: asNullableNumber(item.RSCA_2023 ?? item.RSCA_Tahun4),
      tbi2019: asNullableNumber(item.TBI_2019 ?? item.TBI_Tahun2),
      tbi2023: asNullableNumber(item.TBI_2023 ?? item.TBI_Tahun4),
      share2019: asNullableNumber(item.share_2019 ?? item.Share_2019),
      share2023: asNullableNumber(item.share_2023 ?? item.Share_2023),
      pm2019: asString(item.PM_2019 ?? item.PM_Tahun2) || null,
      pm2023: asString(item.PM_2023 ?? item.PM_Tahun4) || null
    };
  });
}

function normalizeRscaTbi(
  payload: unknown,
  params: AnalisisPotensiDayaSaingRouteParams
): AnalisisRscaTbiResult {
  const meta = extractRscaMeta(payload);

  return {
    sourceName: asString(meta.sumber) || null,
    origin: {
      code: params.origin || null,
      name: null
    },
    destination: {
      code: params.dest || null,
      name: null
    },
    rows: normalizeRscaTbiRows(extractRscaPayloadRows(payload)),
    raw: payload
  };
}

function normalizeRscaTbiCalculationRows(
  value: unknown
): AnalisisRscaTbiCalculationRow[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).map((item) => {
    const kode =
      asString(item.HsCode ?? item.hs_code ?? item.kode ?? item.Kode) || null;

    return {
      hs4: hs4FromKode(kode),
      kode,
      nama: asString(
        item.NamaProduk ??
          item.nama_produk ??
          item["Nama Produk"] ??
          item.nama ??
          item.Nama,
        "-"
      ),
      nilai2019: asNullableNumber(item.Tahun2 ?? item.nilai_2019),
      nilai2023: asNullableNumber(item.Tahun4 ?? item.nilai_2023),
      dunia2019: asNullableNumber(item.Tahun2_Dunia ?? item.dunia_2019),
      dunia2023: asNullableNumber(item.Tahun4_Dunia ?? item.dunia_2023),
      rca2019: asNullableNumber(item.RCA_Tahun2 ?? item.RCA_2019),
      rca2023: asNullableNumber(item.RCA_Tahun4 ?? item.RCA_2023),
      rsca2019: asNullableNumber(item.RSCA_Tahun2 ?? item.RSCA_2019),
      rsca2023: asNullableNumber(item.RSCA_Tahun4 ?? item.RSCA_2023),
      tbi2019: asNullableNumber(item.TBI_Tahun2 ?? item.TBI_2019),
      tbi2023: asNullableNumber(item.TBI_Tahun4 ?? item.TBI_2023),
      groupRsca2019: asNullableNumber(
        item.GroupRSCA_Tahun2 ?? item.group_rsca_2019
      ),
      groupRsca2023: asNullableNumber(
        item.GroupRSCA_Tahun4 ?? item.group_rsca_2023
      ),
      groupTbi2019: asNullableNumber(
        item.GroupTBI_Tahun2 ?? item.group_tbi_2019
      ),
      groupTbi2023: asNullableNumber(
        item.GroupTBI_Tahun4 ?? item.group_tbi_2023
      ),
      pm2019: asString(item.PM_Tahun2 ?? item.PM_2019) || null,
      pm2023: asString(item.PM_Tahun4 ?? item.PM_2023) || null
    };
  });
}

function normalizeRscaTbiCalculation(
  payload: unknown,
  params: AnalisisPotensiDayaSaingRouteParams
): AnalisisRscaTbiCalculationResult {
  const meta = extractRscaMeta(payload);

  return {
    sourceName: asString(meta.sumber) || null,
    origin: {
      code: params.origin || null,
      name: null
    },
    destination: {
      code: params.dest || null,
      name: null
    },
    rows: normalizeRscaTbiCalculationRows(extractRscaPayloadRows(payload)),
    raw: payload
  };
}

function normalizeRscaTbiComparisonRows(
  value: unknown
): AnalisisRscaTbiComparisonRow[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) =>
      Object.fromEntries(
        Object.entries(item).map(([key, rawValue]) => [
          key,
          typeof rawValue === "string" || typeof rawValue === "number"
            ? rawValue
            : rawValue == null
              ? null
              : String(rawValue)
        ])
      )
    );
}

function normalizeReadableRows<
  T extends Record<string, string | number | null>
>(value: unknown): T[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) =>
      Object.fromEntries(
        Object.entries(item).map(([key, rawValue]) => [
          key,
          typeof rawValue === "string" || typeof rawValue === "number"
            ? rawValue
            : rawValue == null
              ? null
              : String(rawValue)
        ])
      )
    ) as T[];
}

function normalizeRscaTbiComparison(
  payload: unknown,
  params: AnalisisPotensiDayaSaingRouteParams
): AnalisisRscaTbiComparisonResult {
  const meta = extractRscaMeta(payload);

  return {
    sourceName: asString(meta.sumber) || null,
    origin: {
      code: params.origin || null,
      name: null
    },
    destination: {
      code: params.dest || null,
      name: null
    },
    rows: normalizeRscaTbiComparisonRows(extractRscaPayloadRows(payload)),
    raw: payload
  };
}

export async function fetchAnalisisRscaTbi(
  params: AnalisisPotensiDayaSaingRouteParams
): Promise<AnalisisRscaTbiResult> {
  const response = await apiClient.get("/api/v1/analisis/rsca-tbi", {
    params: {
      origin: params.origin,
      dest: params.dest,
      level: params.level ?? 6
    }
  });

  return normalizeRscaTbi(response.data, params);
}

export async function fetchAnalisisRscaTbiCalculation(
  params: AnalisisPotensiDayaSaingRouteParams
): Promise<AnalisisRscaTbiCalculationResult> {
  const response = await apiClient.get("/api/v1/analisis/rsca-tbi-kalkulasi", {
    params: {
      origin: params.origin,
      dest: params.dest,
      level: params.level ?? 6
    }
  });

  return normalizeRscaTbiCalculation(response.data, params);
}

export async function fetchAnalisisRscaTbiComparison(
  params: AnalisisPotensiDayaSaingRouteParams
): Promise<AnalisisRscaTbiComparisonResult> {
  const response = await apiClient.get("/api/v1/analisis/rsca-tbi-comparison", {
    params: {
      origin: params.origin,
      dest: params.dest,
      level: params.level ?? 6
    }
  });

  return normalizeRscaTbiComparison(response.data, params);
}

function normalizeRcaEpdRows(value: unknown): AnalisisRcaEpdRow[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).map((item) => {
    const kode =
      asString(item["Kode HS"] ?? item.HsCode ?? item.hs_code ?? item.Kode) ||
      null;

    return {
      hs4: hs4FromKode(kode),
      kode,
      komoditas: asString(
        item.Komoditas ??
          item.NamaProduk ??
          item["Nama Produk"] ??
          item.nama_produk,
        "-"
      ),
      kategoriEpd:
        asString(item["Kategori EPD"] ?? item.Kategori ?? item.kategori) ||
        null,
      avgGrowthShare: asNullableNumber(
        item["AVG Growth Share"] ?? item.Avg_Growth_Share
      ),
      avgGrowthDemand: asNullableNumber(
        item["AVG Growth Demand"] ?? item.Avg_Growth_Demand
      ),
      avgRca: asNullableNumber(item["AVG RCA"] ?? item.Avg_RCA),
      xModel: asString(item["X Model"] ?? item.xModel ?? item.x_model) || null
    };
  });
}

function normalizeRcaEpd(
  payload: unknown,
  params: AnalisisPotensiDayaSaingRouteParams
): AnalisisRcaEpdResult {
  const meta = extractRscaMeta(payload);

  return {
    sourceName: asString(meta.sumber) || null,
    origin: {
      code: params.origin || null,
      name: null
    },
    destination: {
      code: params.dest || null,
      name: null
    },
    rows: normalizeRcaEpdRows(extractRscaPayloadRows(payload)),
    raw: payload
  };
}

function normalizeRcaEpdCalculation(
  payload: unknown,
  params: AnalisisPotensiDayaSaingRouteParams
): AnalisisRcaEpdCalculationResult {
  const meta = extractRscaMeta(payload);

  return {
    sourceName: asString(meta.sumber) || null,
    origin: {
      code: params.origin || null,
      name: null
    },
    destination: {
      code: params.dest || null,
      name: null
    },
    rows: normalizeReadableRows<AnalisisRcaEpdCalculationRow>(
      extractRscaPayloadRows(payload)
    ),
    raw: payload
  };
}

function normalizeRcaEpdComparison(
  payload: unknown,
  params: AnalisisPotensiDayaSaingRouteParams
): AnalisisRcaEpdComparisonResult {
  const meta = extractRscaMeta(payload);

  return {
    sourceName: asString(meta.sumber) || null,
    origin: {
      code: params.origin || null,
      name: null
    },
    destination: {
      code: params.dest || null,
      name: null
    },
    rows: normalizeReadableRows<AnalisisRcaEpdComparisonRow>(
      extractRscaPayloadRows(payload)
    ),
    raw: payload
  };
}

function normalizeRcaEpdXModelOptions(
  payload: unknown
): AnalisisRcaEpdXModelOptionResult {
  return {
    options: extractRscaPayloadRows(payload)
      .map((item) => asString(item))
      .filter(Boolean),
    raw: payload
  };
}

function withRcaEpdParams(params: AnalisisPotensiDayaSaingRouteParams) {
  return {
    origin: params.origin,
    dest: params.dest,
    level: params.level ?? 6,
    x_model: params.x_model || undefined
  };
}

export async function fetchAnalisisRcaEpd(
  params: AnalisisPotensiDayaSaingRouteParams
): Promise<AnalisisRcaEpdResult> {
  const response = await apiClient.get("/api/v1/analisis/rca-epd", {
    params: withRcaEpdParams(params)
  });

  return normalizeRcaEpd(response.data, params);
}

export async function fetchAnalisisRcaEpdCalculation(
  params: AnalisisPotensiDayaSaingRouteParams
): Promise<AnalisisRcaEpdCalculationResult> {
  const response = await apiClient.get("/api/v1/analisis/rca-epd-kalkulasi", {
    params: withRcaEpdParams(params)
  });

  return normalizeRcaEpdCalculation(response.data, params);
}

export async function fetchAnalisisRcaEpdComparison(
  params: AnalisisPotensiDayaSaingRouteParams
): Promise<AnalisisRcaEpdComparisonResult> {
  const response = await apiClient.get("/api/v1/analisis/rca-epd-comparison", {
    params: {
      origin: params.origin,
      dest: params.dest,
      level: params.level ?? 6
    }
  });

  return normalizeRcaEpdComparison(response.data, params);
}

export async function fetchAnalisisRcaEpdXModelOptions(
  params: AnalisisPotensiDayaSaingRouteParams
): Promise<AnalisisRcaEpdXModelOptionResult> {
  const response = await apiClient.get(
    "/api/v1/analisis/rca-epd-xmodel-options",
    {
      params: {
        origin: params.origin,
        dest: params.dest,
        level: params.level ?? 6
      }
    }
  );

  return normalizeRcaEpdXModelOptions(response.data);
}

export async function fetchAnalisisOperationalRisk(
  negara: string
): Promise<AnalisisOperationalRiskResult> {
  const response = await apiClient.get("/api/v1/analisis/operational-risk", {
    params: { negara }
  });

  const root = isRecord(response.data) ? response.data : {};
  const data = isRecord(root.data) ? root.data : {};
  const meta = isRecord(root.meta) ? root.meta : {};
  const source = isRecord(meta.sumber) ? meta.sumber : {};
  const selectedCountryMeta =
    asArray<Record<string, unknown>>(meta.negara)[0] ?? {};
  const years = Array.isArray(meta.years)
    ? meta.years
        .map((year) => Number(year))
        .filter((year) => Number.isFinite(year))
        .sort((a, b) => a - b)
    : [];

  return {
    meta: {
      years,
      latestYear: years[years.length - 1] ?? null,
      sourceName: asString(source.nama_sumber) || null,
      selectedCountry: {
        codeAlpha3: asString(selectedCountryMeta.kode_alpha3) || null,
        codeAlpha2: asString(selectedCountryMeta.kode_alpha2) || null,
        name: asString(selectedCountryMeta.nama) || null
      }
    },
    totalRows: normalizeOperationalRiskCountryRows(data.total),
    breakdownRows: normalizeOperationalRiskBreakdownRows(data.breakdown),
    raw: response.data
  };
}
