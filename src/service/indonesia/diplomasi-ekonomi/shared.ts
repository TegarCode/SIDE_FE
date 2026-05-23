import {
  DIPLOMASI_SUMMARY_CARDS,
  DIPLOMASI_YEAR_META_KEYS_BY_CARD_ID
} from "@/constants/indonesiaDiplomasi";
import type {
  DiplomasiApiParams,
  DiplomasiCardDefinition,
  DiplomasiMasterData,
  DiplomasiMetric,
  DiplomasiOverviewTable,
  DiplomasiSourceOptionsBySector,
  DiplomasiStatsCardRaw,
  DiplomasiStatsData,
  DiplomasiSummaryCardView,
  GroupedSelectOption,
  SelectOption
} from "@/type/indonesiaDiplomasi";

export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

export function parseJsonPayload(value: unknown): unknown {
  if (typeof value !== "string") return value;

  const normalized = value.replace(/^\uFEFF/, "").trim();
  if (!normalized) return value;

  const looksLikeJson =
    (normalized.startsWith("{") && normalized.endsWith("}")) ||
    (normalized.startsWith("[") && normalized.endsWith("]"));
  if (!looksLikeJson) return value;

  try {
    return JSON.parse(normalized);
  } catch {
    return value;
  }
}

export function asString(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function unwrapArrayPayload(payload: unknown): unknown[] {
  const parsed = parseJsonPayload(payload);
  if (Array.isArray(parsed)) return parsed;
  if (!isRecord(parsed)) return [];
  if (Array.isArray(parsed.data)) return parsed.data;
  if (isRecord(parsed.data) && Array.isArray(parsed.data.data))
    return parsed.data.data;
  return [];
}

export function unwrapObjectPayload(payload: unknown): UnknownRecord {
  const parsed = parseJsonPayload(payload);
  if (isRecord(parsed) && isRecord(parsed.data)) return parsed.data;
  if (isRecord(parsed)) return parsed;
  return {};
}

export function uniqueYearsAsc(input: unknown[]) {
  const years = input
    .map((item) => {
      if (isRecord(item)) {
        return (
          asNumber(item.Tahun) ??
          asNumber(item.tahun) ??
          asNumber(item.year) ??
          asNumber(item.value)
        );
      }
      return asNumber(item);
    })
    .filter((item): item is number => item !== null);

  return Array.from(new Set(years)).sort((a, b) => a - b);
}

export function normalizeWilayahOptions(
  payload: unknown
): GroupedSelectOption[] {
  const list = unwrapArrayPayload(payload);
  return list
    .filter(isRecord)
    .map((group) => ({
      label: asString(group.nama || group.label || group.name, "-"),
      options: unwrapArrayPayload(group.wilayah)
        .filter(isRecord)
        .map((item) => ({
          value: asString(item.id || item.value),
          label: asString(item.nama || item.label || item.name)
        }))
        .filter((item) => Boolean(item.value && item.label))
    }))
    .filter((group) => group.options.length > 0);
}

export function normalizeSumberOptions(payload: unknown): SelectOption[] {
  const list = unwrapArrayPayload(payload);
  return list
    .filter(isRecord)
    .map((item) => ({
      value: asString(item.id || item.value || item.kode),
      label: asString(item.name || item.nama || item.label, "-")
    }))
    .filter((item) => Boolean(item.value));
}

export function normalizeSimpleOptions(payload: unknown): SelectOption[] {
  const list = unwrapArrayPayload(payload);
  return list
    .filter(isRecord)
    .map((item) => ({
      value: asString(item.value || item.id || item.kode),
      label: asString(item.label || item.nama || item.name || item.value, "-")
    }))
    .filter((item) => Boolean(item.value && item.label));
}

function toDisplayValue(value: unknown) {
  if (value == null) return "-";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (Array.isArray(value)) return `${value.length} item`;
  return JSON.stringify(value);
}

function humanizeKey(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function findFirstArrayOfRecords(
  payload: unknown,
  depth = 0
): UnknownRecord[] | null {
  if (depth > 4) return null;

  if (Array.isArray(payload)) {
    const records = payload.filter(isRecord);
    return records.length > 0 ? records : null;
  }

  if (!isRecord(payload)) return null;

  const priorityKeys = ["table", "rows", "items", "list", "data", "payload"];
  for (const key of priorityKeys) {
    if (key in payload) {
      const found = findFirstArrayOfRecords(payload[key], depth + 1);
      if (found) return found;
    }
  }

  for (const value of Object.values(payload)) {
    const found = findFirstArrayOfRecords(value, depth + 1);
    if (found) return found;
  }

  return null;
}

export function normalizeOverviewTable(
  payload: unknown
): DiplomasiOverviewTable | null {
  const rows = findFirstArrayOfRecords(payload);
  if (!rows || rows.length === 0) return null;

  const columns = Object.keys(rows[0]).slice(0, 8);
  if (columns.length === 0) return null;

  const normalizedRows = rows.slice(0, 25).map((row) => {
    const output: Record<string, string> = {};
    for (const column of columns) {
      output[column] = toDisplayValue(row[column]);
    }
    return output;
  });

  return { columns, rows: normalizedRows };
}

function extractMetricSource(payload: unknown): UnknownRecord[] {
  const root = unwrapObjectPayload(payload);
  const candidates: UnknownRecord[] = [];
  const directCandidates = [
    root.summary,
    root.metrics,
    root.kpi,
    root.overview,
    isRecord(root.data) ? root.data.summary : null,
    isRecord(root.data) ? root.data.metrics : null
  ];

  for (const candidate of directCandidates) {
    if (isRecord(candidate)) candidates.push(candidate);
  }

  return candidates.length > 0 ? candidates : [root];
}

export function normalizeMetrics(payload: unknown): DiplomasiMetric[] {
  const sources = extractMetricSource(payload);
  const metrics: DiplomasiMetric[] = [];

  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (metrics.length >= 6) break;
      if (Array.isArray(value) || isRecord(value) || value == null) continue;
      metrics.push({
        key,
        label: humanizeKey(key),
        value: toDisplayValue(value)
      });
    }
    if (metrics.length >= 6) break;
  }

  return metrics;
}

function normalizeStatsCard(raw: unknown): DiplomasiStatsCardRaw {
  if (!isRecord(raw)) {
    return {
      value: null,
      prevValue: null,
      year: null,
      prevYear: null,
      note: "",
      country: null,
      prevCountry: null,
      product: null,
      prevProduct: null,
      unit: null,
      sourceName: null
    };
  }

  const source = isRecord(raw.source) ? raw.source : {};
  const format = isRecord(raw.format) ? raw.format : {};
  return {
    value: (raw.value as number | string | null | undefined) ?? null,
    prevValue: (raw.prevValue as number | string | null | undefined) ?? null,
    year: (raw.year as string | number | null | undefined) ?? null,
    prevYear: (raw.prevYear as string | number | null | undefined) ?? null,
    note: asString(raw.note),
    country: asString(raw.country) || null,
    prevCountry: asString(raw.prevCountry) || null,
    product: asString(raw.product) || null,
    prevProduct: asString(raw.prevProduct) || null,
    unit: asString(raw.unit || format.unit) || null,
    sourceName: asString(source.name) || null
  };
}

function toYearNumber(value: unknown) {
  const match = String(value ?? "").match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

function formatYearLabel(value: unknown) {
  if (value == null || value === "") return null;
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})\s*\(([^)]+)\)$/);
  if (!match) return raw;
  return `${match[2].trim()} ${match[1]}`;
}

function pickCardYears(
  cardId: string,
  statsMeta: Record<string, unknown>,
  yearStart: unknown,
  yearEnd: unknown,
  fallbackYear: unknown,
  fallbackPrevYear: unknown
) {
  const yearMetaKey = DIPLOMASI_YEAR_META_KEYS_BY_CARD_ID[cardId];
  const rawYears = yearMetaKey ? statsMeta[yearMetaKey] : null;
  const yearList = Array.isArray(rawYears)
    ? rawYears.filter((item) => item != null && item !== "")
    : [];

  if (yearList.length === 0) {
    return {
      year: formatYearLabel(fallbackYear),
      prevYear: formatYearLabel(fallbackPrevYear)
    };
  }

  const matchTarget = (target: unknown) =>
    yearList.find(
      (item) =>
        toYearNumber(item) != null && toYearNumber(item) === Number(target)
    );

  const current =
    matchTarget(yearEnd) ??
    matchTarget(fallbackYear) ??
    yearList[yearList.length - 1];
  const index = yearList.findIndex((item) => String(item) === String(current));
  const previous =
    matchTarget(yearStart) ??
    matchTarget(fallbackPrevYear) ??
    (index > 0 ? yearList[index - 1] : null) ??
    (yearList.length > 1 ? yearList[0] : null);

  return {
    year: formatYearLabel(current),
    prevYear: formatYearLabel(previous)
  };
}

function resolveHighlight(cardId: string, card: DiplomasiStatsCardRaw) {
  const isProductCard =
    cardId === "top_export_product" || cardId === "top_import_product";
  if (isProductCard) {
    return {
      highlight: card.product,
      prevHighlight: card.prevProduct,
      highlightType: "product" as const
    };
  }

  const isCountryCard = [
    "top_partner",
    "top_export_dest",
    "top_import_origin",
    "top_surplus_country",
    "tourist_inbound_top_origin",
    "fdi_in_top_origin"
  ].includes(cardId);

  if (isCountryCard) {
    return {
      highlight: card.country,
      prevHighlight: card.prevCountry,
      highlightType: "country" as const
    };
  }

  return {
    highlight: null,
    prevHighlight: null,
    highlightType: "none" as const
  };
}

export function normalizeStatsData(payload: unknown): DiplomasiStatsData {
  const parsedData = parseJsonPayload(payload);
  const root = unwrapObjectPayload(parsedData);
  const cardsSource = isRecord(root.cards)
    ? root.cards
    : isRecord(root.data) && isRecord(root.data.cards)
      ? root.data.cards
      : {};
  const metaSource = isRecord(root.meta)
    ? root.meta
    : isRecord(root.data) && isRecord(root.data.meta)
      ? root.data.meta
      : {};

  const cards: Record<string, DiplomasiStatsCardRaw> = {};
  for (const [cardId, cardValue] of Object.entries(cardsSource)) {
    cards[cardId] = normalizeStatsCard(cardValue);
  }

  return { cards, meta: metaSource, raw: parsedData };
}

export function buildDiplomasiSummaryCards(
  statsData: DiplomasiStatsData | null | undefined,
  params: DiplomasiApiParams | null,
  cardDefinitions: DiplomasiCardDefinition[] = DIPLOMASI_SUMMARY_CARDS
): DiplomasiSummaryCardView[] {
  return cardDefinitions.map((definition) => {
    const card = statsData?.cards[definition.id] ?? normalizeStatsCard(null);
    const pickedYears = pickCardYears(
      definition.id,
      statsData?.meta ?? {},
      params?.year_start ?? null,
      params?.year_end ?? null,
      card.year,
      card.prevYear
    );
    const highlight = resolveHighlight(definition.id, card);

    return {
      id: definition.id,
      title: definition.title,
      tone: definition.tone,
      unit: card.unit || definition.unit,
      value: card.value,
      prevValue: card.prevValue,
      year: pickedYears.year,
      prevYear: pickedYears.prevYear,
      note: card.note,
      highlight: highlight.highlight,
      prevHighlight: highlight.prevHighlight,
      highlightType: highlight.highlightType,
      sourceName: card.sourceName
    };
  });
}

export function normalizeMasterData(input: {
  tradeYearsPayload: unknown;
  investasiYearsPayload: unknown;
  pariwisataYearsPayload: unknown;
  wilayahPayload: unknown;
  sumberPerdaganganPayload: unknown;
  sumberInvestasiPayload: unknown;
  sumberPariwisataPayload: unknown;
}): DiplomasiMasterData {
  const tradeYearsAsc = uniqueYearsAsc(
    unwrapArrayPayload(input.tradeYearsPayload)
  );
  const investasiYearsAsc = uniqueYearsAsc(
    unwrapArrayPayload(input.investasiYearsPayload)
  );
  const pariwisataYearsAsc = uniqueYearsAsc(
    unwrapArrayPayload(input.pariwisataYearsPayload)
  );
  const yearsAsc = Array.from(
    new Set([...tradeYearsAsc, ...investasiYearsAsc, ...pariwisataYearsAsc])
  ).sort((a, b) => a - b);

  const sourceOptionsBySector: DiplomasiSourceOptionsBySector = {
    perdagangan: normalizeSumberOptions(input.sumberPerdaganganPayload),
    investasi: normalizeSumberOptions(input.sumberInvestasiPayload),
    pariwisata: normalizeSumberOptions(input.sumberPariwisataPayload)
  };

  return {
    yearsAsc,
    yearsDesc: [...yearsAsc].reverse(),
    tradeYearsDesc: [...tradeYearsAsc].reverse(),
    wilayahOptions: normalizeWilayahOptions(input.wilayahPayload),
    sourceOptionsBySector
  };
}
