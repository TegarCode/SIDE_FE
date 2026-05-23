type InvestmentDirection = "inbound" | "outbound";

export type InvestmentItem = {
  country: string;
  alpha2: string | null;
  values: Record<number, number>;
};

export type InvestmentTrendRow = {
  country: string;
  alpha2: string | null;
  current: number;
  previous: number | null;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function asNumberSeries(value: unknown): Record<number, number> {
  if (!isRecord(value)) return {};
  const out: Record<number, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    const year = Number(key);
    const num = Number(raw);
    if (Number.isFinite(year) && Number.isFinite(num)) out[year] = num;
  }
  return out;
}

export function formatInvestmentNumber(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("id-ID", {
    maximumFractionDigits: 0
  });
}

export function extractSegment(raw: unknown, key: InvestmentDirection) {
  if (!isRecord(raw)) return null;
  const data = isRecord(raw.data) ? raw.data : raw;
  return isRecord(data[key]) ? data[key] : null;
}

export function extractSegmentMeta(raw: unknown, key: InvestmentDirection) {
  if (!isRecord(raw)) return null;
  const meta = isRecord(raw.meta) ? raw.meta : null;
  return meta && isRecord(meta[key]) ? meta[key] : null;
}

export function extractSegmentItems(
  raw: unknown,
  key: InvestmentDirection
): InvestmentItem[] {
  const segment = extractSegment(raw, key);
  const list = Array.isArray(segment?.items) ? segment.items : [];
  return list
    .filter(isRecord)
    .map((item) => ({
      country:
        (typeof item.negara === "string" && item.negara.trim()) ||
        (typeof item.country === "string" && item.country.trim()) ||
        "-",
      alpha2: typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null,
      values: asNumberSeries(item.nilai_investasi)
    }))
    .filter(
      (item) => item.country !== "-" && Object.keys(item.values).length > 0
    );
}

export function extractYears(
  raw: unknown,
  key: InvestmentDirection,
  items: InvestmentItem[]
) {
  const meta = extractSegmentMeta(raw, key);
  const metaYears = Array.isArray(meta?.years)
    ? meta.years.map(Number).filter((year) => Number.isFinite(year))
    : [];
  if (metaYears.length) return [...metaYears].sort((a, b) => a - b);

  const all = new Set<number>();
  for (const item of items) {
    for (const year of Object.keys(item.values)) {
      const num = Number(year);
      if (Number.isFinite(num)) all.add(num);
    }
  }
  return Array.from(all).sort((a, b) => a - b);
}

export function extractTotals(yearsAsc: number[], items: InvestmentItem[]) {
  return yearsAsc.map((year) =>
    items.reduce((sum, item) => sum + (item.values[year] ?? 0), 0)
  );
}

export function extractTrendRows(
  raw: unknown,
  key: InvestmentDirection
): InvestmentTrendRow[] {
  const segment = extractSegment(raw, key);
  const trendKey =
    key === "inbound" ? "tren_investasi_masuk" : "tren_investasi_keluar";
  const trendRoot =
    segment && isRecord(segment[trendKey]) ? segment[trendKey] : null;
  const list = Array.isArray(trendRoot?.items) ? trendRoot.items : [];

  return list
    .filter(isRecord)
    .map((item) => ({
      country:
        (typeof item.negara === "string" && item.negara.trim()) ||
        (typeof item.country === "string" && item.country.trim()) ||
        "-",
      alpha2: typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null,
      current: Number(item.nilai_curr ?? 0),
      previous: item.nilai_prev == null ? null : Number(item.nilai_prev)
    }))
    .filter((item) => item.country !== "-");
}

export function buildTopMitraRaw(raw: unknown, key: InvestmentDirection) {
  const segment = extractSegment(raw, key);
  const meta = extractSegmentMeta(raw, key);
  if (!segment) return null;

  const items = Array.isArray(segment.items)
    ? segment.items.map((entry) => {
        if (!isRecord(entry)) return entry;
        return {
          ...entry,
          nilai_perdagangan: entry.nilai_investasi ?? entry.nilai_perdagangan,
          nilai: entry.nilai_investasi ?? entry.nilai,
          proporsi: entry.share ?? entry.proporsi
        };
      })
    : [];

  return { data: { items }, meta };
}

export function buildTrendRaw(
  rows: InvestmentTrendRow[],
  activeYear: number | null,
  prevYear: number | null
) {
  if (activeYear == null)
    return { data: { items: [] as Array<Record<string, unknown>> } };

  return {
    data: {
      items: rows.map((row) => ({
        negara: row.country,
        kode_alpha2: row.alpha2,
        nilai_perdagangan: {
          ...(prevYear != null ? { [prevYear]: row.previous ?? 0 } : {}),
          [activeYear]: row.current
        },
        proporsi: {}
      }))
    }
  };
}

export function getSegmentUnit(raw: unknown, key: InvestmentDirection) {
  const meta = extractSegmentMeta(raw, key);
  if (
    isRecord(meta?.format) &&
    typeof meta.format.unit === "string" &&
    meta.format.unit.trim()
  ) {
    return meta.format.unit.trim();
  }
  if (typeof meta?.unit === "string" && meta.unit.trim())
    return meta.unit.trim();
  return "Ribu US$";
}

export function getSegmentSource(raw: unknown, key: InvestmentDirection) {
  const meta = extractSegmentMeta(raw, key);
  if (typeof meta?.sumber === "string" && meta.sumber.trim())
    return meta.sumber.trim();
  return null;
}

export function buildSelectedPartnersNote(
  raw: unknown,
  key: InvestmentDirection
) {
  const meta = extractSegmentMeta(raw, key);
  const filters = meta && isRecord(meta.filters) ? meta.filters : null;
  const names = Array.isArray(filters?.partners_name)
    ? filters.partners_name.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
    : [];
  return names.length
    ? `Negara mitra terpilih: ${names.join(", ")}`
    : undefined;
}
