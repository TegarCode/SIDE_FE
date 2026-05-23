import React from "react";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { SortableDataTable } from "@/components/ui/SortableDataTable";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import type {
  AnalisisGeopolitikCountryMeta,
  AnalisisGeopolitikProductItem
} from "@/type/analisis";
import {
  buildTop20Columns,
  buildTop20Rows,
  formatNumber,
  formatPercent
} from "./helpers";

type AnalisisGeopolitikTopProductsSectionProps = {
  exportRows: AnalisisGeopolitikProductItem[];
  importRows: AnalisisGeopolitikProductItem[];
  geoCountries: AnalisisGeopolitikCountryMeta[];
  year: number | null;
  unitLabel: string;
  sourceName: string | null;
  topProductsLimit: number;
  loading?: boolean;
};

type Mode = "ekspor" | "impor";

function formatValueShare(value: number, share: number | null) {
  return `${value === 0 ? "-" : formatNumber(value)} | ${value === 0 ? "-" : formatPercent(share)}`;
}

export function AnalisisGeopolitikTopProductsSection({
  exportRows,
  importRows,
  geoCountries,
  year,
  unitLabel,
  sourceName,
  topProductsLimit,
  loading = false
}: AnalisisGeopolitikTopProductsSectionProps) {
  const [mode, setMode] = React.useState<Mode>("ekspor");
  const [query, setQuery] = React.useState("");
  const [limit, setLimit] = React.useState("20");
  const [sortColumnLabel, setSortColumnLabel] = React.useState("Indonesia");
  const [sortedRows, setSortedRows] = React.useState<
    Array<Record<string, unknown>>
  >([]);
  const indonesiaSortKey = React.useMemo(
    () =>
      geoCountries.find((country) => country.codeAlpha3 === "IDN")
        ?.codeAlpha3 ?? "worldValue",
    [geoCountries]
  );

  const activeRows = mode === "ekspor" ? exportRows : importRows;
  const filteredRows = React.useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) return activeRows;
    return activeRows.filter(
      (item) =>
        item.hs.toLowerCase().includes(lowerQuery) ||
        item.productName.toLowerCase().includes(lowerQuery)
    );
  }, [activeRows, query]);

  const top20Rows = React.useMemo(
    () => buildTop20Rows(filteredRows.slice(0, topProductsLimit), geoCountries),
    [filteredRows, geoCountries, topProductsLimit]
  );
  const limitedRows = React.useMemo(() => {
    if (limit === "ALL") return top20Rows;
    return top20Rows.slice(0, Number(limit));
  }, [limit, top20Rows]);
  const columns = React.useMemo(
    () => buildTop20Columns(geoCountries),
    [geoCountries]
  );

  const tableRows = React.useMemo(
    () =>
      limitedRows.map((row) => {
        const geoCells = Object.fromEntries(
          geoCountries
            .filter((country) => country.codeAlpha3 !== "WLD")
            .map((country) => {
              const metric = row.countryMetrics[country.codeAlpha3] ?? {
                value: 0,
                share: 0
              };
              return [
                country.codeAlpha3,
                {
                  display: (
                    <span className="tabular-nums whitespace-nowrap">
                      {formatValueShare(metric.value, metric.share)}
                    </span>
                  ),
                  sortValue: metric.value
                }
              ];
            })
        );

        return {
          no: {
            display: <span className="tabular-nums">{row.no}</span>,
            sortValue: row.no
          },
          product: {
            display: (
              <div className="space-y-0.5">
                <div className="font-medium text-slate-900">{row.hs}</div>
                <div className="text-slate-600">{row.productName}</div>
              </div>
            ),
            sortValue: `${row.hs} ${row.productName}`
          },
          hs: row.hs,
          productName: row.productName,
          worldValue: {
            display: (
              <span className="tabular-nums whitespace-nowrap">
                {row.worldValue === 0 ? "-" : formatNumber(row.worldValue)}
              </span>
            ),
            sortValue: row.worldValue
          },
          rankList: row.rankList || "-",
          ...geoCells
        };
      }),
    [geoCountries, limitedRows]
  );

  const subtitle = loading
    ? "Sedang mengambil daftar produk geopolitik..."
    : `Tahun ${year ?? "-"} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${sortColumnLabel}`;
  const title =
    mode === "ekspor"
      ? `Top ${topProductsLimit} Produk Ekspor Indonesia`
      : `Top ${topProductsLimit} Produk Impor Indonesia`;

  const handleDownload = React.useCallback(() => {
    const sourceRows =
      sortedRows.length > 0
        ? sortedRows
            .map((row) => {
              const hs = typeof row.hs === "string" ? row.hs : "";
              return limitedRows.find((item) => item.hs === hs) ?? null;
            })
            .filter((row): row is (typeof limitedRows)[number] => row != null)
        : limitedRows;

    downloadTableAsExcel({
      title,
      subtitle: `Tahun ${year ?? "-"} | Unit: ${unitLabel}`,
      source: sourceName ?? undefined,
      filename: `${title.replace(/\s+/g, "_")}_${year ?? "-"}`,
      sheetName: mode === "ekspor" ? "Top20 Ekspor" : "Top20 Impor",
      columns: columns.map((column) => ({
        key: column.key,
        label: column.label
      })),
      rows: sourceRows.map((row) => {
        const normalized: Record<string, unknown> = {
          no: row.no,
          product: `${row.hs} - ${row.productName}`,
          worldValue: row.worldValue === 0 ? "-" : formatNumber(row.worldValue)
        };
        for (const country of geoCountries.filter(
          (item) => item.codeAlpha3 !== "WLD"
        )) {
          const metric = row.countryMetrics[country.codeAlpha3] ?? {
            value: 0,
            share: 0
          };
          normalized[country.codeAlpha3] = formatValueShare(
            metric.value,
            metric.share
          );
        }
        normalized.rankList = row.rankList || "-";
        return normalized;
      })
    });
  }, [
    columns,
    geoCountries,
    limitedRows,
    mode,
    sortedRows,
    sourceName,
    title,
    unitLabel,
    year
  ]);

  const renderTableViewport = React.useCallback(
    (expanded = false) => {
      if (loading) {
        return <TableSkeleton rows={10} className="h-full" />;
      }
      if (tableRows.length === 0) {
        return (
          <EmptyStatePanel
            title="Data produk belum tersedia"
            description={
              query.trim()
                ? "Tidak ada produk yang sesuai dengan pencarian."
                : "Data produk geopolitik belum tersedia untuk tahun ini."
            }
            className={expanded ? "min-h-[70vh]" : "min-h-112"}
          />
        );
      }

      return (
        <>
          <div className="">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari HS atau produk..."
                  className="border-slate-200 bg-white pl-9"
                />
              </div>
              <DataLimitSelect
                value={limit}
                onChange={setLimit}
                options={["10", "15", "20", "ALL"]}
                itemLabel="produk"
                className="w-32 shrink-0"
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <SortableDataTable
              columns={columns}
              rows={tableRows}
              showRowNumber={false}
              className={
                expanded ? "max-h-[72vh] bg-white" : "max-h-180 bg-white"
              }
              tableClassName="min-w-[1280px] divide-y divide-slate-200 text-xs"
              onSortColumnChange={setSortColumnLabel}
              onSortedRowsChange={setSortedRows}
              initialSortKey={indonesiaSortKey}
              initialSortDirection="desc"
            />
          </div>
        </>
      );
    },
    [columns, indonesiaSortKey, limit, loading, query, tableRows]
  );

  return (
    <ExpandableCard
      title={title}
      subtitle={subtitle}
      className="min-w-0"
      contentClassName="flex h-full min-w-0 flex-col gap-3"
      modalSize="full"
      actions={
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-full bg-slate-100 p-0.5">
            <Button
              type="button"
              className={
                mode === "ekspor"
                  ? "inline-flex h-7 items-center rounded-full bg-white px-3 text-xs font-semibold text-slate-900 shadow-sm"
                  : "inline-flex h-7 items-center rounded-full bg-transparent px-3 text-xs font-medium text-slate-700 hover:text-slate-900"
              }
              onClick={() => setMode("ekspor")}
            >
              Ekspor
            </Button>
            <Button
              type="button"
              className={
                mode === "impor"
                  ? "inline-flex h-7 items-center rounded-full bg-white px-3 text-xs font-semibold text-slate-900 shadow-sm"
                  : "inline-flex h-7 items-center rounded-full bg-transparent px-3 text-xs font-medium text-slate-700 hover:text-slate-900"
              }
              onClick={() => setMode("impor")}
            >
              Impor
            </Button>
          </div>
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
        </div>
      }
      expandedContent={
        <div className="flex h-full flex-col gap-3">
          {renderTableViewport(true)}
          {sourceName ? (
            <p className="mt-auto text-right text-[11px] text-slate-500">
              Sumber: {sourceName}
            </p>
          ) : null}
        </div>
      }
    >
      {renderTableViewport(false)}
      {sourceName ? (
        <p className="mt-auto text-right text-[11px] text-slate-500">
          Sumber: {sourceName}
        </p>
      ) : null}
    </ExpandableCard>
  );
}
