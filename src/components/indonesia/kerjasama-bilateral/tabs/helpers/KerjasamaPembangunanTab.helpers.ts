export type PembangunanItem = {
  country: string;
  alpha2: string | null;
  values: Record<number, number>;
  activities: Record<number, number>;
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

export function formatPembangunanNumber(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("id-ID", {
    maximumFractionDigits: 2
  });
}

function extractMeta(raw: unknown) {
  if (!isRecord(raw)) return null;
  return isRecord(raw.meta) ? raw.meta : null;
}

export function extractItems(raw: unknown): PembangunanItem[] {
  if (!isRecord(raw)) return [];
  const data = isRecord(raw.data) ? raw.data : raw;
  const list = Array.isArray(data.items) ? data.items : [];

  return list
    .filter(isRecord)
    .map((item) => ({
      country:
        (typeof item.negara === "string" && item.negara.trim()) ||
        (typeof item.country === "string" && item.country.trim()) ||
        "-",
      alpha2: typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null,
      values: asNumberSeries(item.nilai_bantuan ?? item.nilai),
      activities: asNumberSeries(item.total_kegiatan)
    }))
    .filter(
      (item) => item.country !== "-" && Object.keys(item.values).length > 0
    );
}

export function extractYears(raw: unknown, items: PembangunanItem[]) {
  const meta = extractMeta(raw);
  const metaYears = Array.isArray(meta?.years)
    ? meta.years.map(Number).filter(Number.isFinite)
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

export function extractTotals(
  raw: unknown,
  yearsAsc: number[],
  items: PembangunanItem[]
) {
  const meta = extractMeta(raw);
  const totals = isRecord(meta?.total_world_per_year)
    ? meta.total_world_per_year
    : null;

  return yearsAsc.map((year) => {
    const fromMeta = Number(totals?.[String(year)] ?? Number.NaN);
    if (Number.isFinite(fromMeta)) return fromMeta;
    return items.reduce((sum, item) => sum + (item.values[year] ?? 0), 0);
  });
}

export function extractActivities(
  yearsAsc: number[],
  items: PembangunanItem[]
) {
  return yearsAsc.map((year) =>
    items.reduce((sum, item) => sum + (item.activities[year] ?? 0), 0)
  );
}

export function extractMetaInfo(raw: unknown) {
  return extractMeta(raw);
}

export function buildTopMitraRaw(raw: unknown) {
  if (!isRecord(raw)) return null;
  const data = isRecord(raw.data) ? raw.data : raw;
  const meta = extractMeta(raw);
  const items = Array.isArray(data.items)
    ? data.items.map((entry) => {
        if (!isRecord(entry)) return entry;
        return {
          ...entry,
          nilai_perdagangan:
            entry.nilai_bantuan ?? entry.nilai_perdagangan ?? entry.nilai,
          nilai: entry.nilai_bantuan ?? entry.nilai,
          proporsi: entry.share ?? entry.proporsi,
          total_kegiatan: entry.total_kegiatan
        };
      })
    : [];

  return { data: { items }, meta };
}

export function getUnitLabel(raw: unknown) {
  const meta = extractMeta(raw);
  if (
    isRecord(meta?.format) &&
    typeof meta.format.unit === "string" &&
    meta.format.unit.trim()
  ) {
    return meta.format.unit.trim();
  }
  if (typeof meta?.unit === "string" && meta.unit.trim())
    return meta.unit.trim();
  return "IDR Miliar";
}

export function getSourceLabel(raw: unknown) {
  const meta = extractMeta(raw);
  if (typeof meta?.sumber === "string" && meta.sumber.trim())
    return meta.sumber.trim();
  return null;
}

export function buildSelectedPartnersNote(raw: unknown) {
  const meta = extractMeta(raw);
  const filters = meta && isRecord(meta.filters) ? meta.filters : null;
  const names = Array.isArray(filters?.partners)
    ? filters.partners.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
    : [];
  return names.length
    ? `Negara mitra terpilih: ${names.join(", ")}`
    : undefined;
}
