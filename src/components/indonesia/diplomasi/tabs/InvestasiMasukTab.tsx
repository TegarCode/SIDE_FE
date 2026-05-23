import React from "react";
import {
  ArrowDownIcon,
  ArrowDownTrayIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon
} from "@heroicons/react/24/outline";
import type { DiplomasiTabPanelProps } from "@/components/indonesia/diplomasi/tabs/types";
import { NILAI_PERDAGANGAN_MAP_BUCKETS } from "@/constants/indonesiaDiplomasi";
import { Button } from "@/components/ui/Button";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { MapHeatLayer } from "@/components/ui/MapHeatLayer";
import { TopMitraTable } from "@/components/ui/TopMitraTable";
import { MultiLineTrendChart } from "@/components/ui/charts/MultiLineTrendChart";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import { MapSkeleton } from "@/components/ui/skeletons/MapSkeleton";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import { cn } from "@/utils/cn";

type TrendRow = {
  alpha2: string | null;
  alpha3: string | null;
  country: string;
  nilaiPrev: number | null;
  nilaiCurr: number;
  delta: number | null;
  deltaPct: number | null;
};

type SortDirection = "asc" | "desc";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNumberSeries(value: unknown): Record<number, number> {
  if (!isRecord(value)) return {};
  const out: Record<number, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    const year = Number(key);
    const num = Number(raw);
    if (Number.isFinite(year) && Number.isFinite(num)) out[year] = num;
  }
  return out;
}

function formatNumber(value: number) {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function toDelta(current: number, previous: number | null) {
  if (previous == null || previous === 0) return null;
  const delta = ((current - previous) / Math.abs(previous)) * 100;
  return Number.isFinite(delta) ? delta : null;
}

function parseItems(raw: unknown) {
  if (!isRecord(raw)) return [];
  const data = isRecord(raw.data) ? raw.data : null;
  const candidates: unknown[] = [
    raw.items,
    data?.items,
    isRecord(data?.data) ? data.data.items : null
  ];
  const list = candidates.find(Array.isArray) as unknown[] | undefined;
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
      nilaiInvestasi: asNumberSeries(item.nilai_investasi),
      share: asNumberSeries(item.share)
    }))
    .filter((item) => Object.keys(item.nilaiInvestasi).length > 0);
}

function parseTrendRows(
  raw: unknown,
  items: ReturnType<typeof parseItems>,
  yearsAsc: number[]
): TrendRow[] {
  if (!isRecord(raw)) return [];
  const data = isRecord(raw.data) ? raw.data : null;
  const trendRoot = isRecord(data?.tren_investasi_masuk)
    ? data.tren_investasi_masuk
    : isRecord(raw.tren_investasi_masuk)
      ? raw.tren_investasi_masuk
      : null;

  if (trendRoot && Array.isArray(trendRoot.items)) {
    return trendRoot.items
      .filter(isRecord)
      .map((item) => ({
        alpha2: typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null,
        alpha3: typeof item.kode_alpha3 === "string" ? item.kode_alpha3 : null,
        country:
          (typeof item.negara === "string" && item.negara.trim()) ||
          (typeof item.country === "string" && item.country.trim()) ||
          "-",
        nilaiPrev:
          item.nilai_prev == null || Number.isNaN(Number(item.nilai_prev))
            ? null
            : Number(item.nilai_prev),
        nilaiCurr: Number(item.nilai_curr ?? 0),
        delta:
          item.delta == null || Number.isNaN(Number(item.delta))
            ? null
            : Number(item.delta),
        deltaPct:
          item.delta_pct == null || Number.isNaN(Number(item.delta_pct))
            ? null
            : Number(item.delta_pct)
      }))
      .filter((item) => item.country !== "-");
  }

  const latestYear = yearsAsc[yearsAsc.length - 1] ?? null;
  const prevYear = yearsAsc.length > 1 ? yearsAsc[yearsAsc.length - 2] : null;
  if (!latestYear) return [];

  return items.map((item) => {
    const nilaiCurr = item.nilaiInvestasi[latestYear] ?? 0;
    const nilaiPrev =
      prevYear != null ? (item.nilaiInvestasi[prevYear] ?? 0) : null;
    return {
      alpha2: item.alpha2,
      alpha3: item.alpha3,
      country: item.country,
      nilaiPrev,
      nilaiCurr,
      delta: nilaiPrev == null ? null : nilaiCurr - nilaiPrev,
      deltaPct: toDelta(nilaiCurr, nilaiPrev)
    };
  });
}

function hasIso2Field(row: Record<string, unknown>) {
  return Boolean(
    row.id_alpha2 ??
    row.kode_alpha2 ??
    row.alpha2 ??
    row.iso2 ??
    row.iso_a2 ??
    row.ISO_A2
  );
}

function toArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord);
}

function extractMapData(raw: unknown): Array<Record<string, unknown>> {
  if (!isRecord(raw)) return [];

  const candidates = [
    raw.items,
    raw.rows,
    raw.data,
    isRecord(raw.data) ? raw.data.items : null,
    isRecord(raw.data) && isRecord(raw.data.data) ? raw.data.data.items : null,
    isRecord(raw.payload) ? raw.payload.items : null
  ];

  for (const candidate of candidates) {
    const arr = toArray(candidate);
    if (arr.some(hasIso2Field)) return arr;
  }

  const queue: unknown[] = Object.values(raw);
  while (queue.length > 0) {
    const current = queue.shift();
    const arr = toArray(current);
    if (arr.some(hasIso2Field)) return arr;
    if (isRecord(current)) queue.push(...Object.values(current));
  }

  return [];
}

function extractMeta(raw: unknown) {
  if (!isRecord(raw)) return null;
  if (isRecord(raw.meta)) return raw.meta;
  if (isRecord(raw.data) && isRecord(raw.data.meta)) return raw.data.meta;
  return null;
}

function extractUnitLabel(raw: unknown) {
  const meta = extractMeta(raw);
  if (!meta) return "Ribu US$";
  const unit = meta.format;
  if (isRecord(unit) && typeof unit.unit === "string" && unit.unit.trim())
    return unit.unit.trim();
  if (typeof meta.unit === "string" && meta.unit.trim())
    return meta.unit.trim();
  return "Ribu US$";
}

function remapInvestasiRaw(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;

  const remapItems = (value: unknown) => {
    if (!Array.isArray(value)) return value;
    return value.map((entry) => {
      if (!isRecord(entry)) return entry;
      return {
        ...entry,
        nilai_perdagangan: isRecord(entry.nilai_investasi)
          ? entry.nilai_investasi
          : entry.nilai_perdagangan,
        nilai: isRecord(entry.nilai_investasi)
          ? entry.nilai_investasi
          : entry.nilai,
        proporsi: isRecord(entry.share) ? entry.share : entry.proporsi
      };
    });
  };

  const nextRaw: Record<string, unknown> = { ...raw };
  if ("items" in nextRaw) nextRaw.items = remapItems(nextRaw.items);

  if (isRecord(nextRaw.data)) {
    const nextData: Record<string, unknown> = { ...nextRaw.data };
    if ("items" in nextData) nextData.items = remapItems(nextData.items);
    if (isRecord(nextData.data)) {
      const nestedData: Record<string, unknown> = { ...nextData.data };
      if ("items" in nestedData)
        nestedData.items = remapItems(nestedData.items);
      nextData.data = nestedData;
    }
    nextRaw.data = nextData;
  }

  return nextRaw;
}

function TrendInvestasiTable({
  rows,
  unitLabel,
  activeYear,
  prevYear,
  expanded = false,
  onRegisterDownload,
  sourceLabel
}: {
  rows: TrendRow[];
  unitLabel: string;
  activeYear: number | null;
  prevYear: number | null;
  expanded?: boolean;
  onRegisterDownload?: (handler: (() => void) | null) => void;
  sourceLabel?: string | null;
}) {
  const [sortKey, setSortKey] = React.useState<
    "country" | "curr" | "prev" | "delta" | "delta_pct"
  >("delta_pct");
  const [direction, setDirection] = React.useState<SortDirection>("desc");

  const sortedRows = React.useMemo(() => {
    const next = [...rows];
    next.sort((left, right) => {
      if (sortKey === "country") {
        const compared = left.country.localeCompare(right.country, "id-ID", {
          sensitivity: "base",
          numeric: true
        });
        return direction === "asc" ? compared : -compared;
      }

      const leftValue =
        sortKey === "curr"
          ? left.nilaiCurr
          : sortKey === "prev"
            ? (left.nilaiPrev ?? Number.NEGATIVE_INFINITY)
            : sortKey === "delta"
              ? (left.delta ?? Number.NEGATIVE_INFINITY)
              : (left.deltaPct ?? Number.NEGATIVE_INFINITY);
      const rightValue =
        sortKey === "curr"
          ? right.nilaiCurr
          : sortKey === "prev"
            ? (right.nilaiPrev ?? Number.NEGATIVE_INFINITY)
            : sortKey === "delta"
              ? (right.delta ?? Number.NEGATIVE_INFINITY)
              : (right.deltaPct ?? Number.NEGATIVE_INFINITY);
      return direction === "asc"
        ? leftValue - rightValue
        : rightValue - leftValue;
    });
    return next;
  }, [direction, rows, sortKey]);

  const handleSort = (nextKey: typeof sortKey) => {
    if (sortKey === nextKey) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setDirection("desc");
  };

  const sortIcon = (key: typeof sortKey) => {
    if (sortKey !== key)
      return <ArrowsUpDownIcon className="h-3 w-3 text-slate-400" />;
    return direction === "asc" ? (
      <ArrowUpIcon className="h-3 w-3 text-slate-700" />
    ) : (
      <ArrowDownIcon className="h-3 w-3 text-slate-700" />
    );
  };

  const handleDownload = React.useCallback(() => {
    downloadTableAsExcel({
      title: "Tren Investasi Masuk ke Indonesia",
      subtitle: `${prevYear != null && activeYear != null ? `${prevYear}-${activeYear}` : (activeYear ?? "-")} | Unit: ${unitLabel}`,
      source: sourceLabel ?? undefined,
      columns: [
        {
          key: "no",
          label: "No",
          selector: (_row: TrendRow, index: number) => index + 1,
          numeric: true
        },
        {
          key: "country",
          label: "Negara/Entitas",
          selector: (row: TrendRow) => row.country
        },
        {
          key: "curr",
          label: activeYear != null ? String(activeYear) : "Tahun Aktif",
          selector: (row: TrendRow) => row.nilaiCurr,
          numeric: true
        },
        {
          key: "prev",
          label: prevYear != null ? String(prevYear) : "Tahun Sebelumnya",
          selector: (row: TrendRow) => row.nilaiPrev ?? "-"
        },
        {
          key: "delta",
          label: "Delta Nilai",
          selector: (row: TrendRow) => row.delta ?? "-"
        },
        {
          key: "delta_pct",
          label: "Delta (%)",
          selector: (row: TrendRow) =>
            row.deltaPct != null ? `${row.deltaPct.toFixed(2)}%` : "-"
        }
      ],
      rows: sortedRows,
      filename: `Tren_Investasi_Masuk_Indonesia_${activeYear ?? "-"}`,
      sheetName: "Tren"
    });
  }, [activeYear, prevYear, sortedRows, sourceLabel, unitLabel]);

  React.useEffect(() => {
    onRegisterDownload?.(handleDownload);
    return () => onRegisterDownload?.(null);
  }, [handleDownload, onRegisterDownload]);

  if (!rows.length) {
    return (
      <div className="flex h-full items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
        Data tren investasi masuk belum tersedia.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col gap-2",
        expanded && "min-h-[62vh]"
      )}
    >
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-slate-200">
        <div
          className={cn(
            "h-full overflow-x-auto",
            expanded
              ? "max-h-[62vh] overflow-y-auto"
              : "max-h-125 overflow-y-auto"
          )}
        >
          <table className="w-full min-w-190 border-collapse divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="sticky left-0 z-20 w-8 bg-slate-100 px-2 py-1.5 text-center font-semibold">
                  No
                </th>
                <th className="sticky left-8 z-10 min-w-44 bg-slate-100 px-2 py-1.5 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort("country")}
                  >
                    Negara
                    {sortIcon("country")}
                  </button>
                </th>
                <th className="min-w-32 px-2 py-1.5 text-right font-semibold">
                  <button
                    type="button"
                    className="ml-auto inline-flex items-center gap-1"
                    onClick={() => handleSort("curr")}
                  >
                    {activeYear ?? "-"}
                    {sortIcon("curr")}
                  </button>
                </th>
                <th className="min-w-32 px-2 py-1.5 text-right font-semibold">
                  <button
                    type="button"
                    className="ml-auto inline-flex items-center gap-1"
                    onClick={() => handleSort("prev")}
                  >
                    {prevYear ?? "-"}
                    {sortIcon("prev")}
                  </button>
                </th>
                <th className="min-w-36 px-2 py-1.5 text-right font-semibold">
                  <button
                    type="button"
                    className="ml-auto inline-flex items-center gap-1"
                    onClick={() => handleSort("delta")}
                  >
                    Delta Nilai
                    {sortIcon("delta")}
                  </button>
                </th>
                <th className="min-w-28 px-2 py-1.5 text-right font-semibold">
                  <button
                    type="button"
                    className="ml-auto inline-flex items-center gap-1"
                    onClick={() => handleSort("delta_pct")}
                  >
                    Delta (%)
                    {sortIcon("delta_pct")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedRows.map((row, index) => (
                <tr key={`${row.alpha3 ?? row.country}-${index}`}>
                  <td className="sticky left-0 z-20 bg-white px-2 py-1.5 text-center text-slate-500">
                    {index + 1}
                  </td>
                  <td className="sticky left-8 z-1 bg-white px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <CountryFlag
                        alpha2={row.alpha2}
                        countryName={row.country}
                        className="h-8 w-8 border-0 text-lg shadow-none"
                      />
                      <span className="text-[12px] font-semibold leading-tight text-slate-800">
                        {row.country.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-slate-800">
                    {formatNumber(row.nilaiCurr)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-slate-800">
                    {row.nilaiPrev == null ? "-" : formatNumber(row.nilaiPrev)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-slate-800">
                    {row.delta == null
                      ? "-"
                      : `${row.delta > 0 ? "+" : ""}${formatNumber(row.delta)}`}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {row.deltaPct == null ? (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                        -
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1",
                          row.deltaPct > 0
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : row.deltaPct < 0
                              ? "bg-rose-50 text-rose-700 ring-rose-200"
                              : "bg-slate-100 text-slate-600 ring-slate-200"
                        )}
                      >
                        {row.deltaPct > 0 ? (
                          <ArrowUpIcon className="h-2.5 w-2.5" />
                        ) : (
                          <ArrowDownIcon className="h-2.5 w-2.5" />
                        )}
                        <span>{Math.abs(row.deltaPct).toFixed(2)}%</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function InvestasiMasukTab({
  overview,
  loading,
  error,
  periodLabel
}: DiplomasiTabPanelProps) {
  const [sortColumnLabel, setSortColumnLabel] =
    React.useState<string>("tahun terbaru");
  const [downloadHandler, setDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const [trendDownloadHandler, setTrendDownloadHandler] = React.useState<
    (() => void) | null
  >(null);

  const raw = overview?.raw ?? null;
  const remappedRaw = React.useMemo(() => remapInvestasiRaw(raw), [raw]);
  const items = React.useMemo(() => parseItems(raw), [raw]);
  const meta = React.useMemo(() => extractMeta(raw), [raw]);
  const unitLabel = React.useMemo(() => extractUnitLabel(raw), [raw]);
  const sourceLabel = React.useMemo(() => {
    if (!meta) return null;
    if (typeof meta.sumber === "string" && meta.sumber.trim())
      return meta.sumber.trim();
    if (typeof meta.source === "string" && meta.source.trim())
      return meta.source.trim();
    return null;
  }, [meta]);

  const yearsAsc = React.useMemo(() => {
    const metaYears = Array.isArray(meta?.years)
      ? meta.years.map(Number).filter(Number.isFinite)
      : [];
    if (metaYears.length) return [...metaYears].sort((a, b) => a - b);
    const all = new Set<number>();
    for (const item of items) {
      for (const year of Object.keys(item.nilaiInvestasi)) {
        const value = Number(year);
        if (Number.isFinite(value)) all.add(value);
      }
    }
    return Array.from(all).sort((a, b) => a - b);
  }, [items, meta]);

  const latestYear = React.useMemo(() => {
    const fromMeta =
      typeof meta?.active_year === "number" ? meta.active_year : null;
    return fromMeta ?? yearsAsc[yearsAsc.length - 1] ?? null;
  }, [meta, yearsAsc]);
  const prevYear = React.useMemo(() => {
    if (typeof meta?.active_prev_year === "number")
      return meta.active_prev_year;
    return yearsAsc.length > 1 ? yearsAsc[yearsAsc.length - 2] : null;
  }, [meta, yearsAsc]);

  const mapData = React.useMemo(
    () => extractMapData(remappedRaw),
    [remappedRaw]
  );
  const totals = React.useMemo(() => {
    const fromMeta = isRecord(meta?.total_world_per_year)
      ? meta.total_world_per_year
      : null;
    return yearsAsc.map((year) => {
      if (fromMeta) {
        const value = Number(fromMeta[String(year)] ?? 0);
        if (Number.isFinite(value)) return value;
      }
      return items.reduce(
        (sum, item) => sum + (item.nilaiInvestasi[year] ?? 0),
        0
      );
    });
  }, [items, meta, yearsAsc]);
  const extrasByYear = React.useMemo(() => {
    const out: Record<number, { delta?: number }> = {};
    for (let index = 1; index < yearsAsc.length; index += 1) {
      const current = totals[index] ?? 0;
      const previous = totals[index - 1] ?? 0;
      if (previous !== 0)
        out[yearsAsc[index]] = {
          delta: ((current - previous) / previous) * 100
        };
    }
    return out;
  }, [totals, yearsAsc]);
  const timeSeries = React.useMemo(
    () => [{ label: "Nilai Investasi Masuk", values: totals }],
    [totals]
  );
  const trendRows = React.useMemo(
    () => parseTrendRows(raw, items, yearsAsc),
    [items, raw, yearsAsc]
  );

  const handleRegisterDownload = React.useCallback(
    (handler: (() => void) | null) => {
      if (!handler) {
        setDownloadHandler(null);
        return;
      }
      setDownloadHandler(() => handler);
    },
    []
  );
  const handleRegisterTrendDownload = React.useCallback(
    (handler: (() => void) | null) => {
      if (!handler) {
        setTrendDownloadHandler(null);
        return;
      }
      setTrendDownloadHandler(() => handler);
    },
    []
  );

  const tableCaption = React.useMemo(
    () =>
      `${periodLabel} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${sortColumnLabel}`,
    [periodLabel, sortColumnLabel, unitLabel]
  );
  const trendSubtitle = React.useMemo(() => {
    if (prevYear != null && latestYear != null)
      return `${prevYear}-${latestYear} | Unit: ${unitLabel}`;
    return `${latestYear ?? "-"} | Unit: ${unitLabel}`;
  }, [latestYear, prevYear, unitLabel]);
  const showLoadingLayout = loading || (!error && !overview);
  const shouldShowEmptyFallback =
    !showLoadingLayout && yearsAsc.length === 0 && !trendRows.length;

  return (
    <div className="space-y-4">
      {showLoadingLayout ? (
        <>
          <section className="space-y-4">
            <div className="grid items-stretch gap-4 xl:grid-cols-[1.8fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold tracking-tight text-slate-900">
                  Peta Nilai Investasi Masuk ke Indonesia
                </h3>
                <p className="text-xs text-slate-500">Memuat data peta...</p>
                <div className="mt-4">
                  <MapSkeleton />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold tracking-tight text-slate-900">
                  Top Mitra Investasi Masuk ke Indonesia
                </h3>
                <p className="text-xs text-slate-500">Memuat data tabel...</p>
                <div className="mt-4">
                  <TableSkeleton rows={8} />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold tracking-tight text-slate-900">
                  Time Series Nilai Investasi Masuk ke Indonesia
                </h3>
                <p className="text-xs text-slate-500">
                  Memuat visualisasi tren...
                </p>
                <div className="mt-4">
                  <ChartSkeleton />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold tracking-tight text-slate-900">
                  Tren Investasi Masuk ke Indonesia
                </h3>
                <p className="text-xs text-slate-500">Memuat data tren...</p>
                <div className="mt-4">
                  <TableSkeleton rows={8} />
                </div>
              </div>
            </div>
          </section>
        </>
      ) : error ? (
        <FilterFallbackCard
          title="Bagian lanjutan belum tersedia"
          body={error}
        />
      ) : shouldShowEmptyFallback ? (
        <FilterFallbackCard
          title="Bagian lanjutan belum tersedia"
          body="Data investasi masuk belum tersedia untuk filter aktif."
        />
      ) : (
        <>
          <section className="space-y-4">
            {overview?.metrics.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {overview.metrics.slice(0, 4).map((metric) => (
                  <div
                    key={metric.key}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <p className="text-xs text-slate-500">{metric.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid items-stretch gap-4 xl:grid-cols-[1.8fr_1fr]">
              <ExpandableCard
                title="Peta Nilai Investasi Masuk ke Indonesia"
                subtitle={`${periodLabel} | Unit: ${unitLabel}`}
                className="min-w-0 h-full"
                expandLabel="Perbesar peta"
                modalSize="full"
                expandedContent={
                  <MapHeatLayer
                    key={`investasi-masuk-map-expanded-${periodLabel}`}
                    className="h-[72vh] w-full"
                    data={mapData}
                    title="Peta Nilai Investasi Masuk ke Indonesia"
                    unitLabel={unitLabel}
                    currencyPrefix={unitLabel}
                    geojsonUrl="/assets/world-countries.geojson"
                    hideBalance
                    seriesAccessors={{
                      value: "nilai_perdagangan",
                      proportion: "proporsi"
                    }}
                    customBuckets={[...NILAI_PERDAGANGAN_MAP_BUCKETS]}
                    noDataColor="#f1f5f9"
                  />
                }
              >
                <div className="flex h-full flex-col">
                  <MapHeatLayer
                    key={`investasi-masuk-map-${periodLabel}`}
                    className="h-56 w-full sm:h-72 lg:h-120"
                    data={mapData}
                    title="Peta Nilai Investasi Masuk ke Indonesia"
                    unitLabel={unitLabel}
                    currencyPrefix={unitLabel}
                    geojsonUrl="/assets/world-countries.geojson"
                    hideBalance
                    seriesAccessors={{
                      value: "nilai_perdagangan",
                      proportion: "proporsi"
                    }}
                    customBuckets={[...NILAI_PERDAGANGAN_MAP_BUCKETS]}
                    noDataColor="#f1f5f9"
                  />
                  {sourceLabel ? (
                    <p className="mt-auto text-right text-[11px] text-slate-500">
                      Sumber: {sourceLabel}
                    </p>
                  ) : null}
                </div>
              </ExpandableCard>

              <ExpandableCard
                title="Top Mitra Investasi Masuk ke Indonesia"
                subtitle={tableCaption}
                actions={
                  <IconTooltip label="Unduh Excel">
                    <span>
                      <Button
                        type="button"
                        disabled={!downloadHandler}
                        onClick={() => downloadHandler?.()}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white disabled:hover:text-slate-600"
                        aria-label="Unduh Excel Top Mitra"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    </span>
                  </IconTooltip>
                }
                className="min-w-0 h-full min-h-115"
                contentClassName="flex h-full flex-col"
                expandLabel="Perbesar tabel"
                modalSize="full"
                expandedContent={
                  <TopMitraTable
                    raw={remappedRaw}
                    unitLabel={unitLabel}
                    expanded
                    onSortColumnChange={setSortColumnLabel}
                    onRegisterDownload={handleRegisterDownload}
                    downloadTitle="Top Mitra Investasi Masuk ke Indonesia"
                    downloadFilename={`Top_Mitra_Investasi_Masuk_Indonesia_${periodLabel.replace(/\s+/g, "_")}`}
                    downloadSource={sourceLabel ?? undefined}
                    emptyMessage="Data top mitra investasi masuk belum tersedia."
                    valueLabel="Nilai Investasi"
                    shareLabel="Pangsa Investasi"
                    shareContextLabel="dari total investasi dunia"
                    totalLabel="Total investasi dunia"
                    changeLabel="Perubahan Investasi YoY"
                    showBalanceDetail={false}
                  />
                }
              >
                <div className="flex h-full flex-col">
                  <div className="min-h-0 flex-1">
                    <TopMitraTable
                      raw={remappedRaw}
                      unitLabel={unitLabel}
                      onSortColumnChange={setSortColumnLabel}
                      onRegisterDownload={handleRegisterDownload}
                      downloadTitle="Top Mitra Investasi Masuk ke Indonesia"
                      downloadFilename={`Top_Mitra_Investasi_Masuk_Indonesia_${periodLabel.replace(/\s+/g, "_")}`}
                      downloadSource={sourceLabel ?? undefined}
                      emptyMessage="Data top mitra investasi masuk belum tersedia."
                      valueLabel="Nilai Investasi"
                      shareLabel="Pangsa Investasi"
                      shareContextLabel="dari total investasi dunia"
                      totalLabel="Total investasi dunia"
                      changeLabel="Perubahan Investasi YoY"
                      showBalanceDetail={false}
                    />
                  </div>
                  {sourceLabel ? (
                    <p className="mt-auto text-right text-[11px] text-slate-500">
                      Sumber: {sourceLabel}
                    </p>
                  ) : null}
                </div>
              </ExpandableCard>
            </div>
          </section>

          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
              <ExpandableCard
                title="Time Series Nilai Investasi Masuk ke Indonesia"
                subtitle={`${periodLabel} | Unit: ${unitLabel}`}
                className="min-w-0 min-h-144"
                modalSize="full"
                expandedContent={
                  <MultiLineTrendChart
                    key={`investasi-masuk-ts-expanded-${periodLabel}-${yearsAsc.join("-")}`}
                    series={timeSeries}
                    years={yearsAsc}
                    unit={unitLabel}
                    extrasByYear={extrasByYear}
                    height={720}
                  />
                }
                contentClassName="flex h-full flex-col gap-3"
              >
                <div className="h-130">
                  <MultiLineTrendChart
                    key={`investasi-masuk-ts-${periodLabel}-${yearsAsc.join("-")}`}
                    series={timeSeries}
                    years={yearsAsc}
                    unit={unitLabel}
                    extrasByYear={extrasByYear}
                    height={520}
                  />
                </div>
                {sourceLabel ? (
                  <p className="mt-auto text-right text-[11px] text-slate-500">
                    Sumber: {sourceLabel}
                  </p>
                ) : null}
              </ExpandableCard>

              <ExpandableCard
                title="Tren Investasi Masuk ke Indonesia"
                subtitle={trendSubtitle}
                className="min-w-0 min-h-144"
                modalSize="full"
                contentClassName="flex h-full flex-col gap-3"
                actions={
                  <IconTooltip label="Unduh Excel">
                    <span>
                      <Button
                        type="button"
                        disabled={!trendDownloadHandler}
                        onClick={() => trendDownloadHandler?.()}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white disabled:hover:text-slate-600"
                        aria-label="Unduh Excel Tren Investasi"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    </span>
                  </IconTooltip>
                }
                expandedContent={
                  <TrendInvestasiTable
                    rows={trendRows}
                    unitLabel={unitLabel}
                    activeYear={latestYear}
                    prevYear={prevYear}
                    expanded
                    onRegisterDownload={handleRegisterTrendDownload}
                    sourceLabel={sourceLabel}
                  />
                }
              >
                <div className="h-130">
                  <TrendInvestasiTable
                    rows={trendRows}
                    unitLabel={unitLabel}
                    activeYear={latestYear}
                    prevYear={prevYear}
                    onRegisterDownload={handleRegisterTrendDownload}
                    sourceLabel={sourceLabel}
                  />
                </div>
                {sourceLabel ? (
                  <p className="mt-auto text-right text-[11px] text-slate-500">
                    Sumber: {sourceLabel}
                  </p>
                ) : null}
              </ExpandableCard>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
