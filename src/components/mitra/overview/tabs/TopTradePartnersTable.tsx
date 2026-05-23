import React from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
  ChartPieIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { Input } from "@/components/ui/Form/Input";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import { cn } from "@/utils/cn";
import type { MitraOverviewTradePartnerRow } from "@/type/mitra";

type TopTradePartnersTableProps = {
  rows: MitraOverviewTradePartnerRow[];
  latestYear: number | null;
  prevYear: number | null;
  unitLabel: string;
  sourceLabel?: string | null;
  countryLabel: string;
  downloadNotes?: string | string[];
  onRegisterDownload?: (handler: (() => void) | null) => void;
};

type SortKey =
  | "rank"
  | "country"
  | "total"
  | "shareTotal"
  | "changeTotal"
  | "export"
  | "shareExport"
  | "changeExport"
  | "import"
  | "shareImport"
  | "changeImport";

type SortDirection = "asc" | "desc";

type DisplayRow = {
  rank: number;
  country: string;
  alpha2: string | null;
  total: number;
  shareTotal: number;
  changeTotal: number | null;
  export: number;
  shareExport: number;
  changeExport: number | null;
  import: number;
  shareImport: number;
  changeImport: number | null;
};

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

function toDelta(
  now: number | null | undefined,
  prev: number | null | undefined
) {
  const current = Number(now ?? 0);
  const previous = prev == null ? null : Number(prev);
  if (previous == null || !Number.isFinite(previous) || previous === 0)
    return null;
  const delta = ((current - previous) / Math.abs(previous)) * 100;
  return Number.isFinite(delta) ? delta : null;
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

function buildRows(
  rows: MitraOverviewTradePartnerRow[],
  totals: { totalTrade: number; totalExport: number; totalImport: number }
) {
  const safeTotalTrade = totals.totalTrade > 0 ? totals.totalTrade : 1;
  const safeTotalExport = totals.totalExport > 0 ? totals.totalExport : 1;
  const safeTotalImport = totals.totalImport > 0 ? totals.totalImport : 1;

  return rows.map<DisplayRow>((row) => ({
    rank: row.rank,
    country: row.country,
    alpha2: row.alpha2,
    total: row.totalLatestYear ?? 0,
    shareTotal:
      row.shareLatestYear ??
      ((row.totalLatestYear ?? 0) / safeTotalTrade) * 100,
    changeTotal: toDelta(row.totalLatestYear, row.totalPrevYear),
    export: row.exportLatestYear ?? 0,
    shareExport: ((row.exportLatestYear ?? 0) / safeTotalExport) * 100,
    changeExport: toDelta(row.exportLatestYear, row.exportPrevYear),
    import: row.importLatestYear ?? 0,
    shareImport: ((row.importLatestYear ?? 0) / safeTotalImport) * 100,
    changeImport: toDelta(row.importLatestYear, row.importPrevYear)
  }));
}

function TooltipMetric({
  icon,
  label,
  value,
  detail,
  className
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: React.ReactNode;
  className?: string;
}) {
  return (
    <HoverInfoTooltip content={detail}>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full border px-2 py-1 text-[11px] font-semibold",
          className ?? "border-slate-200 bg-slate-50 text-slate-700"
        )}
      >
        {icon}
        <span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
          {label}
        </span>
        <span>{value}</span>
      </span>
    </HoverInfoTooltip>
  );
}

export function TopTradePartnersTable({
  rows,
  latestYear,
  prevYear,
  unitLabel,
  sourceLabel,
  countryLabel,
  downloadNotes,
  onRegisterDownload
}: TopTradePartnersTableProps) {
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("rank");
  const [direction, setDirection] = React.useState<SortDirection>("asc");

  const totals = React.useMemo(
    () => ({
      totalTrade: rows.reduce(
        (sum, item) => sum + (item.totalLatestYear ?? 0),
        0
      ),
      totalExport: rows.reduce(
        (sum, item) => sum + (item.exportLatestYear ?? 0),
        0
      ),
      totalImport: rows.reduce(
        (sum, item) => sum + (item.importLatestYear ?? 0),
        0
      )
    }),
    [rows]
  );

  const displayRows = React.useMemo(
    () => buildRows(rows, totals),
    [rows, totals]
  );

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return displayRows;
    return displayRows.filter((item) =>
      item.country.toLowerCase().includes(normalizedQuery)
    );
  }, [displayRows, query]);

  const sortedRows = React.useMemo(() => {
    const next = [...filteredRows];
    next.sort((left, right) => {
      if (sortKey === "country") {
        const compared = left.country.localeCompare(right.country, "id-ID", {
          sensitivity: "base",
          numeric: true
        });
        return direction === "asc" ? compared : -compared;
      }

      const compared = compareNullableNumbers(
        left[sortKey],
        right[sortKey],
        direction
      );
      return compared;
    });
    return next;
  }, [direction, filteredRows, sortKey]);

  const handleSort = React.useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setDirection((current) => (current === "asc" ? "desc" : "asc"));
        return;
      }
      setSortKey(key);
      setDirection(key === "rank" ? "asc" : "desc");
    },
    [sortKey]
  );

  const handleDownload = React.useCallback(() => {
    downloadTableAsExcel({
      title: `Top Mitra Dagang ${countryLabel} ${latestYear ?? "-"}`,
      subtitle: `Tahun ${latestYear ?? "-"} - Unit: ${unitLabel}`,
      source: sourceLabel ?? undefined,
      notes: downloadNotes,
      filename: `Top_Partner_Dagang_${countryLabel.replace(/\s+/g, "_")}_${latestYear ?? "-"}`,
      sheetName: "Top Mitra Dagang",
      columns: [
        {
          key: "rank",
          label: "Rank",
          selector: (row) => row.rank,
          numeric: true
        },
        {
          key: "country",
          label: "Negara/Entitas",
          selector: (row) => row.country
        },
        {
          key: "total",
          label: `Total (${latestYear ?? "-"}) (${unitLabel})`,
          selector: (row) => row.total,
          numeric: true
        },
        {
          key: "shareTotal",
          label: `Pangsa Total ${latestYear ?? "-"} (%)`,
          selector: (row) => `${row.shareTotal.toFixed(2)}%`
        },
        {
          key: "changeTotal",
          label: "Perubahan Total (%)",
          selector: (row) =>
            row.changeTotal == null ? "-" : `${row.changeTotal.toFixed(2)}%`
        },
        {
          key: "export",
          label: `Ekspor (${latestYear ?? "-"}) (${unitLabel})`,
          selector: (row) => row.export,
          numeric: true
        },
        {
          key: "shareExport",
          label: `Pangsa Ekspor ${latestYear ?? "-"} (%)`,
          selector: (row) => `${row.shareExport.toFixed(2)}%`
        },
        {
          key: "changeExport",
          label: "Perubahan Ekspor (%)",
          selector: (row) =>
            row.changeExport == null ? "-" : `${row.changeExport.toFixed(2)}%`
        },
        {
          key: "import",
          label: `Impor (${latestYear ?? "-"}) (${unitLabel})`,
          selector: (row) => row.import,
          numeric: true
        },
        {
          key: "shareImport",
          label: `Pangsa Impor ${latestYear ?? "-"} (%)`,
          selector: (row) => `${row.shareImport.toFixed(2)}%`
        },
        {
          key: "changeImport",
          label: "Perubahan Impor (%)",
          selector: (row) =>
            row.changeImport == null ? "-" : `${row.changeImport.toFixed(2)}%`
        }
      ],
      rows: sortedRows
    });
  }, [
    countryLabel,
    downloadNotes,
    latestYear,
    sortedRows,
    sourceLabel,
    unitLabel
  ]);

  React.useEffect(() => {
    onRegisterDownload?.(handleDownload);
    return () => onRegisterDownload?.(null);
  }, [handleDownload, onRegisterDownload]);

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key)
      return <ArrowsUpDownIcon className="h-3.5 w-3.5 text-slate-400" />;
    return direction === "asc" ? (
      <ArrowUpIcon className="h-3.5 w-3.5 text-slate-700" />
    ) : (
      <ArrowDownIcon className="h-3.5 w-3.5 text-slate-700" />
    );
  };

  const renderShareCell = (label: string, value: number, baseValue: number) => (
    <div className="flex justify-end">
      <TooltipMetric
        icon={<ChartPieIcon className="h-3 w-3" />}
        label=""
        value={`${value.toFixed(2)}%`}
        className="border-slate-200 bg-slate-50 text-slate-700"
        detail={
          <div className="space-y-1">
            <p className="font-semibold text-slate-800">{label}</p>
            <p>Pangsa: {value.toFixed(2)}%</p>
            <p>
              Nilai: {formatNumber(baseValue)} {unitLabel}
            </p>
          </div>
        }
      />
    </div>
  );

  const renderChangeCell = (label: string, value: number | null) => (
    <div className="flex justify-end">
      <TooltipMetric
        icon={
          value == null ? (
            <SparklesIcon className="h-3.5 w-3.5" />
          ) : value > 0 ? (
            <span className="text-[11px] leading-none text-emerald-600">▲</span>
          ) : value < 0 ? (
            <span className="text-[11px] leading-none text-rose-600">▼</span>
          ) : (
            <SparklesIcon className="h-3 w-3 text-slate-500" />
          )
        }
        label=""
        value={value == null ? "-" : `${Math.abs(value).toFixed(2)}%`}
        className={
          value == null
            ? "border-slate-200 bg-slate-50 text-slate-700"
            : value > 0
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : value < 0
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-slate-200 bg-slate-50 text-slate-700"
        }
        detail={
          <div className="space-y-1">
            <p className="font-semibold text-slate-800">{label}</p>
            <p>
              {value == null
                ? "Perubahan belum tersedia."
                : `Perubahan: ${Math.abs(value).toFixed(2)}%`}
            </p>
            <p>
              Tahun {latestYear ?? "-"}
              {prevYear ? ` dibanding ${prevYear}` : ""}
            </p>
          </div>
        }
      />
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari negara..."
          containerClassName="max-w-[230px]"
          className="h-8 rounded-md py-1 text-xs"
          leftSlot={<MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-slate-200">
        <div className="h-136 overflow-auto">
          <table className="min-w-450 border-collapse divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="sticky top-0 left-0 z-30 w-16 bg-slate-100 px-3 py-2 text-center font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort("rank")}
                  >
                    Rank
                    {sortIcon("rank")}
                  </button>
                </th>
                <th className="sticky top-0 left-16 z-30 min-w-56 bg-slate-100 px-3 py-2 text-left font-semibold">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => handleSort("country")}
                  >
                    Negara/Entitas
                    {sortIcon("country")}
                  </button>
                </th>
                {[
                  ["total", `Total (${latestYear ?? "-"})`],
                  ["shareTotal", `Pangsa Total (${latestYear ?? "-"})`],
                  ["changeTotal", `Perubahan Total (${latestYear ?? "-"})`],
                  ["export", `Ekspor (${latestYear ?? "-"})`],
                  ["shareExport", `Pangsa Ekspor (${latestYear ?? "-"})`],
                  ["changeExport", `Perubahan Ekspor (${latestYear ?? "-"})`],
                  ["import", `Impor (${latestYear ?? "-"})`],
                  ["shareImport", `Pangsa Impor (${latestYear ?? "-"})`],
                  ["changeImport", `Perubahan Impor (${latestYear ?? "-"})`]
                ].map(([key, label]) => (
                  <th
                    key={key}
                    className="sticky top-0 z-20 min-w-44 bg-slate-100 px-3 py-2 text-right font-semibold"
                  >
                    <button
                      type="button"
                      className="ml-auto inline-flex items-center gap-1 text-right"
                      onClick={() => handleSort(key as SortKey)}
                    >
                      {label}
                      {sortIcon(key as SortKey)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedRows.map((row) => {
                const isIndonesia = row.country.toUpperCase() === "INDONESIA";
                const rowBg = isIndonesia ? "bg-amber-100" : "bg-white";

                return (
                  <tr
                    key={`${row.alpha2 ?? "na"}-${row.country}`}
                    className={isIndonesia ? "bg-amber-100" : undefined}
                  >
                    <td
                      className={cn(
                        "sticky left-0 z-20 px-3 py-2 text-center font-semibold text-slate-700",
                        rowBg
                      )}
                    >
                      {row.rank}
                    </td>
                    <td
                      className={cn(
                        "sticky left-16 z-20 min-w-56 px-3 py-2",
                        rowBg
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {row.alpha2 ? (
                          <CountryFlag
                            alpha2={row.alpha2}
                            countryName={row.country}
                            className="h-9 w-9 rounded-none bg-transparent p-0 text-xl"
                          />
                        ) : null}
                        <span className="font-semibold text-slate-800">
                          {row.country}
                        </span>
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right tabular-nums text-slate-800",
                        rowBg
                      )}
                    >
                      {formatNumber(row.total)}
                    </td>
                    <td className={cn("px-3 py-2", rowBg)}>
                      {renderShareCell(
                        `Pangsa Total (${latestYear ?? "-"})`,
                        row.shareTotal,
                        row.total
                      )}
                    </td>
                    <td className={cn("px-3 py-2", rowBg)}>
                      {renderChangeCell(
                        `Perubahan Total (${latestYear ?? "-"})`,
                        row.changeTotal
                      )}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right tabular-nums text-slate-800",
                        rowBg
                      )}
                    >
                      {formatNumber(row.export)}
                    </td>
                    <td className={cn("px-3 py-2", rowBg)}>
                      {renderShareCell(
                        `Pangsa Ekspor (${latestYear ?? "-"})`,
                        row.shareExport,
                        row.export
                      )}
                    </td>
                    <td className={cn("px-3 py-2", rowBg)}>
                      {renderChangeCell(
                        `Perubahan Ekspor (${latestYear ?? "-"})`,
                        row.changeExport
                      )}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right tabular-nums text-slate-800",
                        rowBg
                      )}
                    >
                      {formatNumber(row.import)}
                    </td>
                    <td className={cn("px-3 py-2", rowBg)}>
                      {renderShareCell(
                        `Pangsa Impor (${latestYear ?? "-"})`,
                        row.shareImport,
                        row.import
                      )}
                    </td>
                    <td className={cn("px-3 py-2", rowBg)}>
                      {renderChangeCell(
                        `Perubahan Impor (${latestYear ?? "-"})`,
                        row.changeImport
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-right text-[11px] text-slate-500">
        Sumber: {sourceLabel ?? "-"}
      </p>
    </div>
  );
}
