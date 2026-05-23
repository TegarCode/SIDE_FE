import React from "react";
import { ArrowDownTrayIcon, ChartPieIcon } from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { SortableDataTable } from "@/components/ui/SortableDataTable";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import type { AnalisisGeopolitikTopCountryRow } from "@/type/analisis";
import {
  formatNumber,
  formatPercent,
  formatSignedPercent,
  renderCountryName
} from "./helpers";

type AnalisisGeopolitikTopCountriesSectionProps = {
  exportRows: AnalisisGeopolitikTopCountryRow[];
  importRows: AnalisisGeopolitikTopCountryRow[];
  year: number | null;
  previousYear: number | null;
  unitLabel: string;
  sourceName: string | null;
  loading?: boolean;
};

function buildColumns(year: number | null, previousYear: number | null) {
  return [
    {
      key: "no",
      label: "Rank",
      align: "center" as const,
      headerClassName: "min-w-14 text-center sticky left-0 z-30 bg-slate-100",
      className:
        "min-w-14 text-center !align-middle sticky left-0 z-10 bg-white"
    },
    {
      key: "country",
      label: "Negara",
      headerClassName: "min-w-44 sticky left-14 z-20 bg-slate-100",
      className: "min-w-44 !align-middle sticky left-14 z-10 bg-white"
    },
    {
      key: "currentValue",
      label: `${year ?? "-"} (nilai|pangsa)`,
      align: "right" as const,
      headerClassName: "min-w-44",
      className: "min-w-44"
    },
    {
      key: "previousValue",
      label: `${previousYear ?? "-"} (nilai|pangsa)`,
      align: "right" as const,
      headerClassName: "min-w-44",
      className: "min-w-44"
    },
    {
      key: "change",
      label: "Perubahan",
      align: "right" as const,
      headerClassName: "min-w-32",
      className: "min-w-32"
    }
  ];
}

function TopCountryCard({
  title,
  rows,
  year,
  previousYear,
  unitLabel,
  sourceName,
  loading
}: {
  title: string;
  rows: AnalisisGeopolitikTopCountryRow[];
  year: number | null;
  previousYear: number | null;
  unitLabel: string;
  sourceName: string | null;
  loading?: boolean;
}) {
  const [sortColumnLabel, setSortColumnLabel] = React.useState(
    `${year ?? "-"} (nilai|pangsa)`
  );
  const [sortedRows, setSortedRows] = React.useState<
    Array<Record<string, unknown>>
  >([]);
  const columns = React.useMemo(
    () => buildColumns(year, previousYear),
    [previousYear, year]
  );
  const subtitle = loading
    ? "Sedang mengambil benchmark negara geopolitik..."
    : `Tahun ${previousYear ?? "-"}-${year ?? "-"} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${sortColumnLabel}`;

  const tableRows = React.useMemo(
    () =>
      rows.map((item) => ({
        no: {
          display: (
            <span className="tabular-nums">
              {item.currentValue <= 0 || item.rank == null || item.rank <= 0
                ? "-"
                : item.rank}
            </span>
          ),
          sortValue:
            item.currentValue <= 0 || item.rank == null || item.rank <= 0
              ? Number.POSITIVE_INFINITY
              : item.rank
        },
        country: {
          display: renderCountryName(item.codeAlpha2, item.name),
          sortValue: item.name
        },
        previousValue: {
          display:
            item.previousValue == null || item.previousValue === 0 ? (
              <span className="tabular-nums whitespace-nowrap">-</span>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <span className="tabular-nums whitespace-nowrap">
                  {formatNumber(item.previousValue)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200">
                  <ChartPieIcon className="h-3 w-3" />
                  {formatPercent(item.previousShare)}
                </span>
              </div>
            ),
          sortValue: item.previousValue ?? 0
        },
        currentValue: {
          display:
            item.currentValue === 0 ? (
              <span className="tabular-nums whitespace-nowrap">-</span>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <span className="tabular-nums whitespace-nowrap">
                  {formatNumber(item.currentValue)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200">
                  <ChartPieIcon className="h-3 w-3" />
                  {formatPercent(item.currentShare)}
                </span>
              </div>
            ),
          sortValue: item.currentValue
        },
        change: {
          display: (
            <span
              className={
                item.deltaPct == null
                  ? "tabular-nums whitespace-nowrap text-slate-500"
                  : item.deltaPct >= 0
                    ? "tabular-nums whitespace-nowrap text-emerald-600"
                    : "tabular-nums whitespace-nowrap text-rose-600"
              }
            >
              {formatSignedPercent(item.deltaPct)}
            </span>
          ),
          sortValue: item.deltaPct ?? Number.NEGATIVE_INFINITY
        }
      })),
    [rows]
  );
  const renderTable = React.useCallback(
    (viewportClassName: string, expanded = false) => {
      if (loading) {
        return (
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
            <TableSkeleton rows={10} className="h-full rounded-none border-0" />
          </div>
        );
      }
      if (tableRows.length === 0) {
        return (
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
            <EmptyStatePanel
              title="Data benchmark belum tersedia"
              description="Data negara geopolitik belum tersedia untuk tahun aktif."
              className="h-full min-h-[60vh] rounded-none border-0 shadow-none"
            />
          </div>
        );
      }

      return (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <SortableDataTable
            columns={columns}
            rows={tableRows}
            showRowNumber={false}
            className={viewportClassName}
            tableClassName={
              expanded
                ? "w-full min-w-full divide-y divide-slate-200 text-xs"
                : "min-w-[780px] divide-y divide-slate-200 text-xs"
            }
            onSortColumnChange={setSortColumnLabel}
            onSortedRowsChange={setSortedRows}
            initialSortKey="currentValue"
            initialSortDirection="desc"
          />
        </div>
      );
    },
    [columns, loading, tableRows]
  );

  const handleDownload = React.useCallback(() => {
    const baseRows = sortedRows.length > 0 ? sortedRows : tableRows;
    downloadTableAsExcel({
      title,
      subtitle: `Tahun ${previousYear ?? "-"}-${year ?? "-"} | Unit: ${unitLabel}`,
      source: sourceName ?? undefined,
      filename: title.replace(/\s+/g, "_"),
      sheetName: "Top 5 Geopolitik",
      columns: [
        { key: "rank", label: "Rank", numeric: true },
        { key: "country", label: "Negara" },
        { key: "currentValue", label: `${year ?? "-"} (nilai|pangsa)` },
        {
          key: "previousValue",
          label: `${previousYear ?? "-"} (nilai|pangsa)`
        },
        { key: "change", label: "Perubahan" }
      ],
      rows: baseRows.map((row, index) => ({
        rank:
          typeof row.no === "object" && row.no !== null && "sortValue" in row.no
            ? Number.isFinite(
                Number((row.no as { sortValue: unknown }).sortValue)
              )
              ? Number((row.no as { sortValue: unknown }).sortValue)
              : "-"
            : index + 1,
        country:
          typeof row.country === "object" &&
          row.country !== null &&
          "sortValue" in row.country
            ? String((row.country as { sortValue: unknown }).sortValue)
            : "",
        previousValue:
          typeof row.previousValue === "object" &&
          row.previousValue !== null &&
          "sortValue" in row.previousValue
            ? `${formatNumber(Number((row.previousValue as { sortValue: unknown }).sortValue || 0))} | ${formatPercent(rows[index]?.previousShare ?? null)}`
            : "-",
        currentValue:
          typeof row.currentValue === "object" &&
          row.currentValue !== null &&
          "sortValue" in row.currentValue
            ? `${formatNumber(Number((row.currentValue as { sortValue: unknown }).sortValue || 0))} | ${formatPercent(rows[index]?.currentShare ?? null)}`
            : "-",
        change:
          typeof row.change === "object" &&
          row.change !== null &&
          "sortValue" in row.change
            ? formatSignedPercent(
                Number((row.change as { sortValue: unknown }).sortValue)
              )
            : "-"
      }))
    });
  }, [
    previousYear,
    rows,
    sortedRows,
    sourceName,
    tableRows,
    title,
    unitLabel,
    year
  ]);

  return (
    <ExpandableCard
      title={title}
      subtitle={subtitle}
      className="min-w-0"
      contentClassName="min-w-0"
      modalSize="2xl"
      actions={
        <IconTooltip label="Unduh tabel">
          <span>
            <Button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white p-0 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || tableRows.length === 0}
              onClick={handleDownload}
              aria-label="Unduh tabel"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </span>
        </IconTooltip>
      }
      expandedContent={renderTable("max-h-[72vh] w-full", true)}
    >
      {renderTable("max-h-130")}
    </ExpandableCard>
  );
}

export function AnalisisGeopolitikTopCountriesSection({
  exportRows,
  importRows,
  year,
  previousYear,
  unitLabel,
  sourceName,
  loading = false
}: AnalisisGeopolitikTopCountriesSectionProps) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <TopCountryCard
        title="Top 5 Negara Geopolitik Ekspor"
        rows={exportRows}
        year={year}
        previousYear={previousYear}
        unitLabel={unitLabel}
        sourceName={sourceName}
        loading={loading}
      />
      <TopCountryCard
        title="Top 5 Negara Geopolitik Impor"
        rows={importRows}
        year={year}
        previousYear={previousYear}
        unitLabel={unitLabel}
        sourceName={sourceName}
        loading={loading}
      />
    </section>
  );
}
