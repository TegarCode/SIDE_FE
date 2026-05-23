import React from "react";
import type {
  DiplomasiCountryValueItem,
  DiplomasiExportProductInsightItem,
  DiplomasiItemRecord,
  DiplomasiSummaryCardView
} from "@/type/indonesiaDiplomasi";
import { cn } from "@/utils/cn";

export type BilateralTradeItem = DiplomasiItemRecord & {
  alpha2: string | null;
  share: Record<number, number>;
};

export type TradeViewMode = "total" | "ekspor" | "impor" | "neraca";

export const TRADE_VIEW_OPTIONS: Array<{
  value: TradeViewMode;
  label: string;
}> = [
  { value: "total", label: "Nilai Perdagangan" },
  { value: "ekspor", label: "Ekspor" },
  { value: "impor", label: "Impor" },
  { value: "neraca", label: "Neraca" }
];

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

export function parseCountryValueList(
  raw: unknown
): DiplomasiCountryValueItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(isRecord)
    .map((item, index) => ({
      rank: typeof item.rank === "number" ? item.rank : index + 1,
      alpha2: typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null,
      alpha3: typeof item.kode_alpha3 === "string" ? item.kode_alpha3 : null,
      country:
        (typeof item.negara === "string" && item.negara.trim()) ||
        (typeof item.country === "string" && item.country.trim()) ||
        (typeof item.kode_alpha3 === "string" && item.kode_alpha3.trim()) ||
        "-",
      nilai: Number(item.nilai ?? 0)
    }))
    .filter((item) => item.country !== "-");
}

export function parseTradeItems(raw: unknown): BilateralTradeItem[] {
  if (!isRecord(raw)) return [];
  const candidates: unknown[] = [
    raw.items,
    raw.data,
    isRecord(raw.data) ? raw.data.items : null,
    isRecord(raw.data) && isRecord(raw.data.data) ? raw.data.data.items : null
  ];
  const list = candidates.find((value) => Array.isArray(value)) as
    | unknown[]
    | undefined;
  if (!list) return [];

  return list
    .filter(isRecord)
    .map((item) => ({
      country:
        (typeof item.negara === "string" && item.negara.trim()) ||
        (typeof item.country === "string" && item.country.trim()) ||
        "-",
      alpha2: typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null,
      alpha3: typeof item.kode_alpha3 === "string" ? item.kode_alpha3 : null,
      nilai: asNumberSeries(item.nilai_perdagangan ?? item.nilai),
      neraca: asNumberSeries(item.neraca),
      share: asNumberSeries(item.share ?? item.proporsi)
    }))
    .filter((item) => Object.keys(item.nilai).length > 0);
}

export function parseTopProdukInsights(
  raw: unknown
): DiplomasiExportProductInsightItem[] {
  if (!isRecord(raw)) return [];
  const data = isRecord(raw.data) ? raw.data : null;
  const candidates: unknown[] = [
    raw.top_produk,
    data?.top_produk,
    isRecord(data?.data) ? data.data.top_produk : null
  ];
  const list = candidates.find((value) => Array.isArray(value)) as
    | unknown[]
    | undefined;
  if (!list) return [];

  return list
    .filter(isRecord)
    .map((item) => ({
      hs:
        typeof item.kodeHS === "string" || typeof item.kodeHS === "number"
          ? String(item.kodeHS)
          : "-",
      name: typeof item.namaHS === "string" ? item.namaHS : "-",
      nilai: asNumberSeries(item.nilai),
      neraca: asNumberSeries(item.neraca),
      share: asNumberSeries(item.share),
      export: asNumberSeries(item.export),
      import: asNumberSeries(item.import ?? item.impor),
      exportReverse: asNumberSeries(item.export_reverse),
      importReverse: asNumberSeries(item.import_reverse),
      tujuanEkspor: parseCountryValueList(item.tujuan_ekspor),
      tujuanImpor: parseCountryValueList(item.tujuan_impor),
      kompetitorGlobalTopTujuanEkspor: parseCountryValueList(
        item.kompetitor_global_top_tujuan_ekspor ??
          item.kompetitor_top_tujuan_ekspor
      ),
      kompetitorAseanTopTujuanEkspor: parseCountryValueList(
        item.kompetitor_asean_top_tujuan_ekspor
      ),
      kompetitorGlobalTopTujuanImpor: parseCountryValueList(
        item.kompetitor_global_top_tujuan_impor
      ),
      kompetitorAseanTopTujuanImpor: parseCountryValueList(
        item.kompetitor_asean_top_tujuan_impor
      )
    }))
    .filter((item) => item.hs !== "-" && Object.keys(item.nilai).length > 0);
}

export function parseCompetitionInsightProducts(
  raw: unknown,
  fallbackYear: number | null
): DiplomasiExportProductInsightItem[] {
  const list = parseTopProdukInsights(raw);
  if (list.length > 0) return list;

  if (!isRecord(raw)) return [];
  const data = isRecord(raw.data) ? raw.data : null;
  const candidate =
    isRecord(data) && ("kodeHS" in data || "hs" in data)
      ? data
      : "kodeHS" in raw || "hs" in raw
        ? raw
        : null;
  if (!candidate || !isRecord(candidate)) return [];

  const hs =
    typeof candidate.kodeHS === "string" || typeof candidate.kodeHS === "number"
      ? String(candidate.kodeHS)
      : typeof candidate.hs === "string" || typeof candidate.hs === "number"
        ? String(candidate.hs)
        : "-";
  const tujuanEkspor = parseCountryValueList(candidate.tujuan_ekspor);
  const inferredValue =
    fallbackYear != null
      ? tujuanEkspor.reduce((sum, item) => sum + item.nilai, 0)
      : 0;

  return [
    {
      hs,
      name: typeof candidate.namaHS === "string" ? candidate.namaHS : "-",
      nilai: fallbackYear != null ? { [fallbackYear]: inferredValue } : {},
      neraca: fallbackYear != null ? { [fallbackYear]: inferredValue } : {},
      share: {},
      export: fallbackYear != null ? { [fallbackYear]: inferredValue } : {},
      import: {},
      exportReverse: {},
      importReverse: {},
      tujuanEkspor,
      tujuanImpor: parseCountryValueList(candidate.tujuan_impor),
      kompetitorGlobalTopTujuanEkspor: parseCountryValueList(
        candidate.kompetitor_global_top_tujuan_ekspor ??
          candidate.kompetitor_top_tujuan_ekspor
      ),
      kompetitorAseanTopTujuanEkspor: parseCountryValueList(
        candidate.kompetitor_asean_top_tujuan_ekspor
      ),
      kompetitorGlobalTopTujuanImpor: parseCountryValueList(
        candidate.kompetitor_global_top_tujuan_impor
      ),
      kompetitorAseanTopTujuanImpor: parseCountryValueList(
        candidate.kompetitor_asean_top_tujuan_impor
      )
    }
  ].filter((item) => item.hs !== "-");
}

export function extractUnitLabel(raw: unknown) {
  if (!isRecord(raw)) return "Ribu US$";

  const read = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;
  const data = isRecord(raw.data) ? raw.data : null;
  const meta = isRecord(raw.meta)
    ? raw.meta
    : data && isRecord(data.meta)
      ? data.meta
      : null;

  const candidates: unknown[] = [
    raw.unit,
    raw.unitLabel,
    raw.satuan,
    raw.satuan_nilai,
    raw.currency,
    data?.unit,
    data?.unitLabel,
    data?.satuan,
    data?.satuan_nilai,
    data?.currency,
    meta?.unit,
    meta?.unitLabel,
    meta?.satuan,
    meta?.satuan_nilai,
    meta?.currency
  ];

  for (const candidate of candidates) {
    const value = read(candidate);
    if (value) return value;
  }

  return "Ribu US$";
}

export function extractMeta(raw: unknown) {
  if (!isRecord(raw)) return null;
  if (isRecord(raw.meta)) return raw.meta;
  if (isRecord(raw.data) && isRecord(raw.data.meta)) return raw.data.meta;
  return null;
}

export function formatNumber(value: number) {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

export function getTradeMetricValue(
  view: TradeViewMode,
  nilai: Record<number, number>,
  neraca: Record<number, number>,
  year: number
) {
  const total = Number(nilai[year] ?? 0);
  const balance = Number(neraca[year] ?? 0);
  if (view === "neraca") return balance;
  if (view === "ekspor") return (total + balance) / 2;
  if (view === "impor") return (total - balance) / 2;
  return total;
}

export function renderTradeViewTabs(
  value: TradeViewMode,
  onChange: (value: TradeViewMode) => void
) {
  return (
    <div className="hidden rounded-full bg-slate-100 p-1 sm:flex sm:flex-wrap sm:items-center">
      {TRADE_VIEW_OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold transition",
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function renderCompetitionTabs(
  value: "ekspor" | "impor",
  onChange: (value: "ekspor" | "impor") => void
) {
  const options = [
    { value: "ekspor" as const, label: "Ekspor" },
    { value: "impor" as const, label: "Impor" }
  ];

  return (
    <div className="hidden rounded-full bg-slate-100 p-1 sm:flex sm:flex-wrap sm:items-center">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold transition",
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function buildSummaryCard(
  partial: Omit<DiplomasiSummaryCardView, "id" | "highlightType"> & {
    id: string;
    highlightType?: DiplomasiSummaryCardView["highlightType"];
  }
): DiplomasiSummaryCardView {
  return {
    highlightType: "none",
    ...partial
  };
}

export function createLoadingCard(
  id: string,
  title: string,
  tone: DiplomasiSummaryCardView["tone"]
): DiplomasiSummaryCardView {
  return {
    id,
    title,
    tone,
    unit: "Ribu US$",
    value: null,
    prevValue: null,
    year: null,
    prevYear: null,
    note: "",
    highlight: null,
    prevHighlight: null,
    highlightType: "none",
    sourceName: "-"
  };
}
