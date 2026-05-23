import React from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  ChartPieIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { Input } from "@/components/ui/Form/Input";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import { cn } from "@/utils/cn";

type TopMitraItem = {
  alpha2: string | null;
  country: string;
  nilai: Record<number, number>;
  neraca: Record<number, number>;
  proporsi: Record<number, number>;
  kegiatan: Record<number, number>;
};

type SortDirection = "asc" | "desc";

type TopMitraTableProps = {
  raw: unknown;
  unitLabel: string;
  expanded?: boolean;
  onSortColumnChange?: (columnLabel: string) => void;
  onRegisterDownload?: (handler: (() => void) | null) => void;
  downloadTitle?: string;
  downloadFilename?: string;
  downloadSource?: string;
  downloadNotes?: string | string[];
  emptyMessage?: string;
  firstColumnLabel?: string;
  valueLabel?: string;
  shareLabel?: string;
  shareContextLabel?: string;
  totalLabel?: string;
  changeLabel?: string;
  showBalanceDetail?: boolean;
  showDeltaColumns?: boolean;
  showDeltaPercentColumn?: boolean;
  deltaColumnLabel?: string;
  activityLabel?: string;
  showActivityDetail?: boolean;
  showInlineUnit?: boolean;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  highlightCountries?: string[];
  pinnedCountries?: string[];
  showShareDetail?: boolean;
  showChangeDetail?: boolean;
  defaultSortDirection?: SortDirection;
  displayZeroAsDash?: boolean;
  showLimitControl?: boolean;
  defaultLimit?: string;
  fitHeightToContainer?: boolean;
};

function getRowIdentity(item: TopMitraItem) {
  return `${item.alpha2 ?? "na"}:${item.country.toUpperCase()}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNumberRecord(value: unknown) {
  if (!isRecord(value)) return {} as Record<number, number>;
  const out: Record<number, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    const year = Number(key);
    const num = Number(raw);
    if (Number.isFinite(year) && Number.isFinite(num)) out[year] = num;
  }
  return out;
}

function parseTopMitra(raw: unknown): TopMitraItem[] {
  if (!isRecord(raw)) return [];

  const candidates: unknown[] = [
    raw.items,
    raw.rows,
    raw.data,
    isRecord(raw.data) ? raw.data.items : null,
    isRecord(raw.data) && isRecord(raw.data.data) ? raw.data.data.items : null
  ];
  const list =
    candidates.find((value) => Array.isArray(value) && value.some(isRecord)) ??
    Object.values(raw).find(
      (value) => Array.isArray(value) && value.some(isRecord)
    );
  if (!Array.isArray(list)) return [];

  return list
    .filter(isRecord)
    .map((item) => ({
      alpha2: typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null,
      country:
        (typeof item.negara === "string" && item.negara.trim()) ||
        (typeof item.country === "string" && item.country.trim()) ||
        (typeof item.kode_alpha3 === "string" && item.kode_alpha3.trim()) ||
        "-",
      nilai: asNumberRecord(item.nilai_perdagangan ?? item.value ?? item.nilai),
      neraca: asNumberRecord(item.neraca),
      proporsi: asNumberRecord(item.proporsi),
      kegiatan: asNumberRecord(item.total_kegiatan ?? item.kegiatan)
    }))
    .filter((item) => Object.keys(item.nilai).length > 0);
}

function formatNumber(
  value: number,
  maximumFractionDigits = 0,
  minimumFractionDigits = 0
) {
  return value.toLocaleString("id-ID", {
    maximumFractionDigits,
    minimumFractionDigits
  });
}

function formatSignedNumber(
  value: number,
  maximumFractionDigits = 0,
  minimumFractionDigits = 0
) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatNumber(Math.abs(value), maximumFractionDigits, minimumFractionDigits)}`;
}

function formatPercent(value: number, digits = 2) {
  return `${value.toFixed(digits)}%`;
}

function toDelta(current: number, previous: number | null) {
  if (previous == null || previous === 0) return null;
  const delta = ((current - previous) / Math.abs(previous)) * 100;
  return Number.isFinite(delta) ? delta : null;
}

function hasComparableValues(current: number | null, previous: number | null) {
  return current != null && previous != null && current !== 0 && previous !== 0;
}

function compareNullableNumbers(
  left: number | null,
  right: number | null,
  direction: SortDirection
) {
  const leftMissing = left == null || !Number.isFinite(left);
  const rightMissing = right == null || !Number.isFinite(right);
  if (leftMissing && rightMissing) return 0;
  if (leftMissing) return 1;
  if (rightMissing) return -1;
  return direction === "asc" ? left - right : right - left;
}

function shouldHideFlag(country: string) {
  return /\b(taiwan|israel)\b/i.test(country);
}

function hasValidAlpha2(alpha2: string | null | undefined) {
  return typeof alpha2 === "string" && /^[A-Z]{2}$/i.test(alpha2.trim());
}

export function TopMitraTable({
  raw,
  unitLabel,
  expanded = false,
  onSortColumnChange,
  onRegisterDownload,
  downloadTitle = "Top Mitra Nilai Perdagangan Indonesia",
  downloadFilename,
  downloadSource,
  downloadNotes,
  emptyMessage = "Data top mitra belum tersedia.",
  firstColumnLabel = "Negara/Entitas",
  valueLabel = "Nilai",
  shareLabel = "Pangsa Pasar",
  shareContextLabel = "dari total dunia",
  totalLabel = "Total dunia",
  changeLabel = "Perubahan YoY",
  showBalanceDetail = true,
  showDeltaColumns = false,
  showDeltaPercentColumn = true,
  deltaColumnLabel = "Delta",
  activityLabel = "Jumlah kegiatan",
  showActivityDetail = false,
  showInlineUnit = false,
  maximumFractionDigits = 0,
  minimumFractionDigits = 0,
  highlightCountries = [],
  pinnedCountries = [],
  showShareDetail = true,
  showChangeDetail = true,
  defaultSortDirection = "desc",
  displayZeroAsDash = false,
  showLimitControl = true,
  defaultLimit = "10",
  fitHeightToContainer = false
}: TopMitraTableProps) {
  const [limit, setLimit] = React.useState(
    showLimitControl ? defaultLimit : "ALL"
  );
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string>("country");
  const [direction, setDirection] =
    React.useState<SortDirection>(defaultSortDirection);

  const items = React.useMemo(() => parseTopMitra(raw), [raw]);
  const years = React.useMemo(() => {
    const all = new Set<number>();
    for (const item of items) {
      for (const key of Object.keys(item.nilai)) {
        const value = Number(key);
        if (Number.isFinite(value)) all.add(value);
      }
    }
    return Array.from(all).sort((a, b) => b - a);
  }, [items]);
  const latestYear = years[0] ?? null;

  React.useEffect(() => {
    if (!latestYear) return;
    setSortKey((prev) =>
      prev.startsWith("year-") ? prev : `year-${latestYear}`
    );
  }, [latestYear]);

  React.useEffect(() => {
    setDirection(defaultSortDirection);
  }, [defaultSortDirection]);

  React.useEffect(() => {
    setLimit(showLimitControl ? defaultLimit : "ALL");
  }, [defaultLimit, showLimitControl]);

  const worldTotalsByYear = React.useMemo(() => {
    const output: Record<number, number> = {};
    for (const year of years) {
      output[year] = items.reduce(
        (sum, item) => sum + (item.nilai[year] ?? 0),
        0
      );
    }
    return output;
  }, [items, years]);
  const hasActivitySeries = React.useMemo(
    () =>
      showActivityDetail &&
      items.some((item) => Object.keys(item.kegiatan).length > 0),
    [items, showActivityDetail]
  );

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.country.toLowerCase().includes(q));
  }, [items, query]);

  const sortedRows = React.useMemo(() => {
    const next = [...filteredRows];
    next.sort((a, b) => {
      if (sortKey === "country") {
        const compared = a.country.localeCompare(b.country, "id-ID", {
          sensitivity: "base",
          numeric: true
        });
        return direction === "asc" ? compared : -compared;
      }

      if (sortKey === "delta" || sortKey === "delta_pct") {
        const leftCurrent = latestYear != null ? (a.nilai[latestYear] ?? 0) : 0;
        const rightCurrent =
          latestYear != null ? (b.nilai[latestYear] ?? 0) : 0;
        const previousYear = years[1] ?? null;
        const leftPrev =
          previousYear != null ? (a.nilai[previousYear] ?? null) : null;
        const rightPrev =
          previousYear != null ? (b.nilai[previousYear] ?? null) : null;
        const left =
          sortKey === "delta"
            ? leftCurrent - (leftPrev ?? 0)
            : toDelta(leftCurrent, leftPrev);
        const right =
          sortKey === "delta"
            ? rightCurrent - (rightPrev ?? 0)
            : toDelta(rightCurrent, rightPrev);
        return compareNullableNumbers(left, right, direction);
      }

      const year = Number(sortKey.replace("year-", ""));
      const leftRaw = a.nilai[year] ?? 0;
      const rightRaw = b.nilai[year] ?? 0;
      const left = displayZeroAsDash && leftRaw === 0 ? null : leftRaw;
      const right = displayZeroAsDash && rightRaw === 0 ? null : rightRaw;
      return compareNullableNumbers(left, right, direction);
    });
    return next;
  }, [direction, displayZeroAsDash, filteredRows, latestYear, sortKey, years]);

  const visibleRows = React.useMemo(() => {
    if (limit === "ALL") return sortedRows;
    const n = Number(limit);
    const baseRows =
      !Number.isFinite(n) || n <= 0
        ? sortedRows.slice(0, 10)
        : sortedRows.slice(0, n);
    if (!pinnedCountries.length) return baseRows;

    const pinnedSet = new Set(
      pinnedCountries.map((country) => country.toUpperCase())
    );
    const existing = new Set(
      baseRows.map((item) => item.country.toUpperCase())
    );
    const extraPinned = sortedRows.filter(
      (item) =>
        pinnedSet.has(item.country.toUpperCase()) &&
        !existing.has(item.country.toUpperCase())
    );

    return [...baseRows, ...extraPinned];
  }, [limit, pinnedCountries, sortedRows]);
  const rankByIdentity = React.useMemo(
    () =>
      sortedRows.reduce<Record<string, number>>((accumulator, item, index) => {
        accumulator[getRowIdentity(item)] = index + 1;
        return accumulator;
      }, {}),
    [sortedRows]
  );
  const renderNumericValue = React.useCallback(
    (value: number) =>
      displayZeroAsDash && value === 0
        ? "-"
        : formatNumber(value, maximumFractionDigits, minimumFractionDigits),
    [displayZeroAsDash, maximumFractionDigits, minimumFractionDigits]
  );

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection("desc");
  };

  const sortIcon = (key: string) => {
    if (sortKey !== key)
      return <ArrowsUpDownIcon className="h-3 w-3 text-slate-400" />;
    return direction === "asc" ? (
      <ArrowUpIcon className="h-3 w-3 text-slate-700" />
    ) : (
      <ArrowDownIcon className="h-3 w-3 text-slate-700" />
    );
  };

  const sortColumnLabel = React.useMemo(() => {
    if (sortKey === "country") return "Negara";
    if (sortKey === "delta") return deltaColumnLabel;
    if (sortKey === "delta_pct") return "Delta (%)";
    return sortKey.replace("year-", "");
  }, [deltaColumnLabel, sortKey]);
  const lastRegisteredDownloadRef = React.useRef<(() => void) | null>(null);
  const lastSortColumnLabelRef = React.useRef<string | null>(null);
  const latestDownloadHandlerRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    if (!onSortColumnChange) return;
    if (lastSortColumnLabelRef.current === sortColumnLabel) return;
    lastSortColumnLabelRef.current = sortColumnLabel;
    onSortColumnChange(sortColumnLabel);
  }, [onSortColumnChange, sortColumnLabel]);

  const periodLabel = React.useMemo(() => {
    if (!years.length) return "-";
    const asc = [...years].sort((a, b) => a - b);
    return asc[0] === asc[asc.length - 1]
      ? String(asc[0])
      : `${asc[0]}-${asc[asc.length - 1]}`;
  }, [years]);

  const handleDownloadExcel = React.useCallback(() => {
    const columns = [
      {
        key: "no",
        label: "No",
        selector: (row: TopMitraItem) =>
          rankByIdentity[getRowIdentity(row)] ?? "-",
        numeric: true
      },
      {
        key: "country",
        label: "Negara/Entitas",
        selector: (row: TopMitraItem) => row.country
      }
    ];
    const yearColumns = years.map((year) => ({
      key: `y${year}`,
      label: String(year),
      selector: (row: TopMitraItem) => row.nilai[year] ?? 0,
      numeric: true
    }));
    const activityColumns = hasActivitySeries
      ? years.map((year) => ({
          key: `activity_${year}`,
          label: `${activityLabel} ${year}`,
          selector: (row: TopMitraItem) => row.kegiatan[year] ?? 0,
          numeric: true
        }))
      : [];
    const deltaColumns =
      showDeltaColumns && latestYear != null
        ? [
            {
              key: "delta",
              label: "Delta",
              selector: (row: TopMitraItem) => {
                const previousYear = years[1] ?? null;
                const prev =
                  previousYear != null ? (row.nilai[previousYear] ?? 0) : 0;
                return row.nilai[latestYear] - prev;
              },
              numeric: true
            },
            ...(showDeltaPercentColumn
              ? [
                  {
                    key: "delta_pct",
                    label: "Delta (%)",
                    selector: (row: TopMitraItem) => {
                      const previousYear = years[1] ?? null;
                      const prev =
                        previousYear != null
                          ? (row.nilai[previousYear] ?? null)
                          : null;
                      const delta = toDelta(row.nilai[latestYear] ?? 0, prev);
                      return delta == null ? "-" : formatPercent(delta);
                    }
                  }
                ]
              : [])
          ]
        : [];

    downloadTableAsExcel({
      title: downloadTitle,
      subtitle: `Periode ${periodLabel} - Unit: ${unitLabel}`,
      source: downloadSource,
      notes: downloadNotes,
      columns: [
        ...columns,
        ...yearColumns,
        ...activityColumns,
        ...deltaColumns
      ],
      rows: visibleRows,
      filename:
        downloadFilename ?? `Top_Mitra_Nilai_Perdagangan_${periodLabel}`,
      sheetName: "Top Mitra"
    });
  }, [
    activityLabel,
    downloadFilename,
    downloadNotes,
    downloadSource,
    downloadTitle,
    hasActivitySeries,
    latestYear,
    periodLabel,
    showDeltaPercentColumn,
    showDeltaColumns,
    unitLabel,
    visibleRows,
    rankByIdentity,
    years
  ]);
  const stableDownloadHandler = React.useCallback(() => {
    latestDownloadHandlerRef.current();
  }, []);

  React.useEffect(() => {
    latestDownloadHandlerRef.current = handleDownloadExcel;
  }, [handleDownloadExcel]);

  React.useEffect(() => {
    if (!onRegisterDownload) return;
    if (lastRegisteredDownloadRef.current !== stableDownloadHandler) {
      lastRegisteredDownloadRef.current = stableDownloadHandler;
      onRegisterDownload(stableDownloadHandler);
    }

    return () => {
      if (lastRegisteredDownloadRef.current === stableDownloadHandler) {
        lastRegisteredDownloadRef.current = null;
        onRegisterDownload(null);
      }
    };
  }, [onRegisterDownload, stableDownloadHandler]);

  if (!items.length || !years.length) {
    return (
      <EmptyStatePanel
        title="Data belum tersedia"
        description={emptyMessage}
        className="min-h-72"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col gap-2",
        expanded && "min-h-[62vh]"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari negara..."
          containerClassName="max-w-[220px]"
          className="h-8 rounded-md py-1 text-xs"
          leftSlot={<MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />}
        />
        {showLimitControl ? (
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-slate-600">Tampilkan</label>
            <DataLimitSelect
              value={limit}
              onChange={setLimit}
              className="w-32"
            />
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-slate-200">
        <div
          className={cn(
            "h-full overflow-x-auto",
            fitHeightToContainer
              ? "overflow-y-auto"
              : limit !== "10"
                ? "max-h-125 overflow-y-auto"
                : "overflow-y-visible"
          )}
        >
          <table
            className={cn(
              "w-full border-collapse divide-y divide-slate-200 text-sm",
              expanded && "w-full"
            )}
          >
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="sticky top-0 left-0 z-30 w-4 bg-slate-100 px-1.5 py-1.5 text-center font-semibold">
                  No
                </th>
                <th
                  className="sticky top-0 z-20 min-w-44 bg-slate-100 px-1.5 py-1.5 text-left font-semibold"
                  style={{ left: "2rem" }}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition hover:text-slate-900"
                    onClick={() => toggleSort("country")}
                  >
                    {firstColumnLabel}
                    {sortIcon("country")}
                  </button>
                </th>
                {years.map((year, yearIndex) => (
                  <th
                    key={year}
                    className={cn(
                      "sticky top-0 z-10 min-w-44 bg-slate-100 px-1.5 py-1.5 text-right font-semibold",
                      yearIndex === years.length - 1 && "pr-4"
                    )}
                  >
                    <button
                      type="button"
                      className="ml-auto inline-flex items-center gap-1 text-right transition hover:text-slate-900"
                      onClick={() => toggleSort(`year-${year}`)}
                    >
                      {year}
                      {sortIcon(`year-${year}`)}
                    </button>
                  </th>
                ))}
                {showDeltaColumns && latestYear != null ? (
                  <>
                    <th className="sticky top-0 z-10 min-w-33 bg-slate-100 px-1.5 py-1.5 text-right font-semibold">
                      <button
                        type="button"
                        className="ml-auto inline-flex items-center gap-1 text-right transition hover:text-slate-900"
                        onClick={() => toggleSort("delta")}
                      >
                        {deltaColumnLabel}
                        {sortIcon("delta")}
                      </button>
                    </th>
                    {showDeltaPercentColumn ? (
                      <th className="sticky top-0 z-10 min-w-33 bg-slate-100 px-1.5 py-1.5 text-right font-semibold pr-4">
                        <button
                          type="button"
                          className="ml-auto inline-flex items-center gap-1 text-right transition hover:text-slate-900"
                          onClick={() => toggleSort("delta_pct")}
                        >
                          Delta (%)
                          {sortIcon("delta_pct")}
                        </button>
                      </th>
                    ) : null}
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleRows.map((item, rowIndex) =>
                (() => {
                  const isHighlighted = highlightCountries.some(
                    (country) =>
                      country.toUpperCase() === item.country.toUpperCase()
                  );
                  const rowBg = isHighlighted ? "bg-amber-100" : "bg-white";

                  return (
                    <tr
                      key={`${item.alpha2 ?? "na"}-${item.country}-${rowIndex}`}
                      className={isHighlighted ? "bg-amber-100" : undefined}
                    >
                      <td
                        className={cn(
                          "sticky left-0 z-20 px-1.5 py-1.5 text-center text-slate-500",
                          rowBg
                        )}
                      >
                        {rankByIdentity[getRowIdentity(item)] ?? rowIndex + 1}
                      </td>
                      <td
                        className={cn(
                          "sticky z-1 min-w-44 px-1.5 py-1.5",
                          rowBg
                        )}
                        style={{ left: "2rem" }}
                      >
                        <div className="flex min-w-0 items-center gap-1">
                          {!shouldHideFlag(item.country) &&
                          hasValidAlpha2(item.alpha2) ? (
                            <CountryFlag
                              alpha2={item.alpha2}
                              countryName={item.country}
                              className="h-9 w-9 border-0 text-xl shadow-none"
                            />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            {expanded ? (
                              <div className="flex items-center gap-1">
                                <p className="wrap-break-word whitespace-normal text-[12px] leading-tight font-semibold text-slate-800">
                                  {item.country.toUpperCase()}
                                </p>
                                {showShareDetail && latestYear != null ? (
                                  <HoverInfoTooltip
                                    content={
                                      <div className="space-y-0.5">
                                        <p className="font-semibold text-slate-800">
                                          {shareLabel} {latestYear}
                                        </p>
                                        <p>
                                          {formatPercent(
                                            item.proporsi[latestYear] ?? 0
                                          )}{" "}
                                          {shareContextLabel}
                                        </p>
                                        <p>
                                          {valueLabel} negara:{" "}
                                          {renderNumericValue(
                                            item.nilai[latestYear] ?? 0
                                          )}{" "}
                                          {unitLabel}
                                        </p>
                                        <p>
                                          {totalLabel}:{" "}
                                          {renderNumericValue(
                                            worldTotalsByYear[latestYear] ?? 0
                                          )}{" "}
                                          {unitLabel}
                                        </p>
                                      </div>
                                    }
                                  >
                                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-slate-50 px-1 py-0.5 text-[9px] text-slate-600 ring-1 ring-slate-200">
                                      <ChartPieIcon className="h-2.5 w-2.5" />
                                      {formatPercent(
                                        item.proporsi[latestYear] ?? 0
                                      )}
                                    </span>
                                  </HoverInfoTooltip>
                                ) : null}
                              </div>
                            ) : (
                              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1">
                                <p className="wrap-break-word whitespace-normal text-[12px] leading-tight font-semibold text-slate-800">
                                  {item.country.toUpperCase()}
                                </p>
                                {showShareDetail && latestYear != null ? (
                                  <HoverInfoTooltip
                                    content={
                                      <div className="space-y-0.5">
                                        <p className="font-semibold text-slate-800">
                                          {shareLabel} {latestYear}
                                        </p>
                                        <p>
                                          {formatPercent(
                                            item.proporsi[latestYear] ?? 0
                                          )}{" "}
                                          {shareContextLabel}
                                        </p>
                                        <p>
                                          {valueLabel} negara:{" "}
                                          {renderNumericValue(
                                            item.nilai[latestYear] ?? 0
                                          )}
                                        </p>
                                        <p>
                                          {totalLabel}:{" "}
                                          {renderNumericValue(
                                            worldTotalsByYear[latestYear] ?? 0
                                          )}
                                        </p>
                                      </div>
                                    }
                                  >
                                    <span className="inline-flex shrink-0 items-center gap-0.5 justify-self-end rounded-full bg-slate-50 px-1 py-0.5 text-[9px] text-slate-600 ring-1 ring-slate-200">
                                      <ChartPieIcon className="h-2.5 w-2.5" />
                                      {formatPercent(
                                        item.proporsi[latestYear] ?? 0
                                      )}
                                    </span>
                                  </HoverInfoTooltip>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      {years.map((year, yearIndex) => {
                        const value = item.nilai[year] ?? 0;
                        const prevYear = years[yearIndex + 1] ?? null;
                        const prevValue =
                          prevYear != null
                            ? (item.nilai[prevYear] ?? null)
                            : null;
                        const canCompare = hasComparableValues(
                          value,
                          prevValue
                        );
                        const delta = canCompare
                          ? toDelta(value, prevValue)
                          : null;
                        const neraca = item.neraca[year] ?? 0;

                        return (
                          <td
                            key={`${item.country}-${year}`}
                            className={cn(
                              "min-w-44 px-1.5 py-1.5",
                              rowBg,
                              yearIndex === years.length - 1 && "pr-4"
                            )}
                          >
                            <div className="grid w-full grid-cols-[minmax(0,1fr)_60px] items-center justify-items-end gap-1">
                              <span className="tabular-nums whitespace-nowrap text-right text-slate-800">
                                {renderNumericValue(value)}
                                {showInlineUnit ? (
                                  <span className="ml-1 text-[10px] text-slate-500">
                                    {unitLabel}
                                  </span>
                                ) : null}
                              </span>
                              {showChangeDetail ? (
                                <HoverInfoTooltip
                                  content={
                                    <div className="space-y-0.5">
                                      <p className="font-semibold text-slate-800">
                                        Detail Tahun {year}
                                      </p>
                                      <p>
                                        {valueLabel} {year}:{" "}
                                        {renderNumericValue(value)}
                                      </p>
                                      {prevYear != null ? (
                                        <p>
                                          {valueLabel} {prevYear}:{" "}
                                          {renderNumericValue(prevValue ?? 0)}
                                        </p>
                                      ) : null}
                                      {showActivityDetail ? (
                                        <p>
                                          {activityLabel} {year}:{" "}
                                          {formatNumber(
                                            item.kegiatan[year] ?? 0
                                          )}
                                        </p>
                                      ) : null}
                                      {delta != null ? (
                                        <p>
                                          {changeLabel}: {formatPercent(delta)}
                                        </p>
                                      ) : (
                                        <p>{changeLabel}: -</p>
                                      )}
                                      {showBalanceDetail ? (
                                        <p>
                                          Neraca {year}:{" "}
                                          {renderNumericValue(neraca)}
                                        </p>
                                      ) : null}
                                    </div>
                                  }
                                >
                                  {delta != null ? (
                                    <span
                                      className={cn(
                                        "inline-flex min-w-15 whitespace-nowrap items-center justify-center gap-0.5 rounded-full px-1 py-0.5 text-[9px] font-semibold",
                                        delta > 0
                                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                          : delta < 0
                                            ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                                            : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                                      )}
                                    >
                                      <span>{delta > 0 ? "▲" : "▼"}</span>
                                      <span>
                                        {formatPercent(Math.abs(delta))}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex min-w-15 whitespace-nowrap items-center justify-center rounded-full bg-slate-100 px-1 py-0.5 text-[9px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                      {prevYear != null ? "N/A" : "-"}
                                    </span>
                                  )}
                                </HoverInfoTooltip>
                              ) : (
                                <span className="inline-block w-15" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                      {showDeltaColumns && latestYear != null
                        ? (() => {
                            const previousYear = years[1] ?? null;
                            const prevValue =
                              previousYear != null
                                ? (item.nilai[previousYear] ?? null)
                                : null;
                            const currentValue = item.nilai[latestYear] ?? 0;
                            const deltaValue = currentValue - (prevValue ?? 0);
                            const canCompare = hasComparableValues(
                              currentValue,
                              prevValue
                            );
                            const deltaPct = canCompare
                              ? toDelta(currentValue, prevValue)
                              : null;

                            return (
                              <>
                                <td
                                  className={cn(
                                    "min-w-33 px-1.5 py-1.5 text-right",
                                    rowBg,
                                    !showDeltaPercentColumn && "pr-4"
                                  )}
                                >
                                  {!canCompare ? (
                                    <span className="tabular-nums text-slate-800">
                                      N/A
                                    </span>
                                  ) : (
                                    <span className="tabular-nums text-slate-800">
                                      {formatSignedNumber(
                                        deltaValue,
                                        maximumFractionDigits,
                                        minimumFractionDigits
                                      )}
                                    </span>
                                  )}
                                </td>
                                {showDeltaPercentColumn ? (
                                  <td
                                    className={cn(
                                      "min-w-33 px-1.5 py-1.5 pr-4 text-right",
                                      rowBg
                                    )}
                                  >
                                    <span className="tabular-nums text-slate-800">
                                      {deltaPct == null
                                        ? "-"
                                        : formatPercent(deltaPct)}
                                    </span>
                                  </td>
                                ) : null}
                              </>
                            );
                          })()
                        : null}
                    </tr>
                  );
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
