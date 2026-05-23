import React from "react";
import {
  ArrowDownTrayIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  TableCellsIcon
} from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { Select } from "@/components/ui/Form/Select";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TopProdukTable } from "@/components/ui/TopProdukTable";
import { TradeProductsTreemapChart } from "@/components/ui/charts/TradeProductsTreemapChart";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type { PanganTradeProductsResult } from "@/type/komoditasUtama";
import type { PanganMetricMode } from "./PanganTradeHeroSection";

type PanganTradeProductsSectionProps = {
  data: PanganTradeProductsResult | null | undefined;
  loading: boolean;
  metricMode: PanganMetricMode;
};

type ProductMode = "table" | "treemap";

function formatCountryList(names: string[]) {
  if (names.length === 0) return "-";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} +${names.length - 3} lainnya`;
}

function getMetricLabel(metricMode: PanganMetricMode) {
  if (metricMode === "total_export") return "Total Ekspor";
  if (metricMode === "total_import") return "Total Impor";
  return "Total Perdagangan";
}

function getMetricKey(metricMode: PanganMetricMode) {
  return metricMode === "total_export"
    ? "ekspor"
    : metricMode === "total_import"
      ? "impor"
      : "total";
}

function buildMetricShareMap(
  data: PanganTradeProductsResult | null | undefined,
  metricMode: PanganMetricMode
) {
  const key = getMetricKey(metricMode);
  const totalsByYear: Record<number, number> = {};
  for (const year of data?.years ?? []) {
    totalsByYear[year] = (data?.products ?? []).reduce(
      (sum, item) => sum + (item[key][year] ?? 0),
      0
    );
  }

  return (data?.products ?? []).map((item) => {
    const share: Record<number, number> = {};
    for (const year of data?.years ?? []) {
      share[year] =
        totalsByYear[year] > 0
          ? ((item[key][year] ?? 0) / totalsByYear[year]) * 100
          : 0;
    }
    return {
      kodeHS: item.kodeHS,
      share
    };
  });
}

function buildTableRaw(
  data: PanganTradeProductsResult | null | undefined,
  metricMode: PanganMetricMode
) {
  const key = getMetricKey(metricMode);
  const shareByProduct = new Map(
    buildMetricShareMap(data, metricMode).map((item) => [
      item.kodeHS,
      item.share
    ])
  );
  return {
    top_produk: (data?.products ?? []).map((item) => ({
      kodeHS: item.kodeHS,
      namaHS: item.namaHS,
      nilai: item[key],
      share: shareByProduct.get(item.kodeHS) ?? {}
    }))
  };
}

function resolvePreviousYear(years: number[], activeYear: number | null) {
  if (activeYear == null) return null;
  const sorted = [...years].sort((left, right) => right - left);
  const activeIndex = sorted.indexOf(activeYear);
  if (activeIndex < 0 || activeIndex === sorted.length - 1) return null;
  return sorted[activeIndex + 1] ?? null;
}

function buildTreemapDisplayRows(
  data: PanganTradeProductsResult | null | undefined,
  metricMode: PanganMetricMode,
  activeYear: number | null
) {
  const key = getMetricKey(metricMode);
  const previousYear = resolvePreviousYear(data?.years ?? [], activeYear);
  const shareByProduct = new Map(
    buildMetricShareMap(data, metricMode).map((item) => [
      item.kodeHS,
      item.share
    ])
  );
  return (data?.products ?? [])
    .map((item) => ({
      code: item.kodeHS,
      label: item.namaHS,
      valueOd: activeYear != null ? (item[key][activeYear] ?? 0) : 0,
      valuePrev: previousYear != null ? (item[key][previousYear] ?? 0) : null,
      valueReverse: null,
      shareValue:
        activeYear != null
          ? (shareByProduct.get(item.kodeHS)?.[activeYear] ?? null)
          : null
    }))
    .sort(
      (left, right) => Number(right.valueOd ?? 0) - Number(left.valueOd ?? 0)
    );
}

function getTreemapYearOptions(
  data: PanganTradeProductsResult | null | undefined
) {
  const values = (data?.years ?? [])
    .filter((year): year is number => year != null && Number.isFinite(year))
    .sort((left, right) => right - left);
  return Array.from(new Set(values)).map((year) => ({
    value: String(year),
    label: String(year)
  }));
}

export function PanganTradeProductsSection({
  data,
  loading,
  metricMode
}: PanganTradeProductsSectionProps) {
  const [viewMode, setViewMode] = React.useState<ProductMode>("table");
  const [treemapLimit, setTreemapLimit] = React.useState("15");
  const [treemapYear, setTreemapYear] = React.useState<string>("");
  const [sortColumn, setSortColumn] = React.useState<string>("-");
  const [tableDownload, setTableDownload] = React.useState<(() => void) | null>(
    null
  );
  const [chartDownload, setChartDownload] = React.useState<(() => void) | null>(
    null
  );

  const metricLabel = getMetricLabel(metricMode);
  const latestYear = data?.latestYear ?? null;
  const earliestYear = React.useMemo(() => {
    const years = (data?.years ?? []).filter((year) => Number.isFinite(year));
    if (!years.length) return null;
    return [...years].sort((left, right) => left - right)[0] ?? null;
  }, [data]);
  const sourceName = data?.sourceName ?? "-";
  const unitLabel = data?.unit ?? "US$";
  const reporters = React.useMemo(
    () => (data?.reporters ?? []).map((item) => item.nama),
    [data]
  );
  const partners = React.useMemo(
    () => (data?.partners ?? []).map((item) => item.nama),
    [data]
  );
  const tableRaw = React.useMemo(
    () => buildTableRaw(data, metricMode),
    [data, metricMode]
  );
  const treemapYearOptions = React.useMemo(
    () => getTreemapYearOptions(data),
    [data]
  );
  const activeTreemapYear = treemapYear ? Number(treemapYear) : latestYear;
  const activeTreemapPrevYear = React.useMemo(
    () => resolvePreviousYear(data?.years ?? [], activeTreemapYear),
    [activeTreemapYear, data]
  );
  const allTreemapRows = React.useMemo(
    () => buildTreemapDisplayRows(data, metricMode, activeTreemapYear),
    [activeTreemapYear, data, metricMode]
  );
  const metricTotalsByYear = React.useMemo(() => {
    const key = getMetricKey(metricMode);
    const totals: Record<number, number> = {};
    for (const year of data?.years ?? []) {
      totals[year] = (data?.products ?? []).reduce(
        (sum, item) => sum + (item[key][year] ?? 0),
        0
      );
    }
    return totals;
  }, [data, metricMode]);
  const treemapRows = React.useMemo(() => {
    if (treemapLimit === "ALL") return allTreemapRows;
    const limit = Number(treemapLimit);
    if (!Number.isFinite(limit) || limit <= 0)
      return allTreemapRows.slice(0, 15);
    return allTreemapRows.slice(0, limit);
  }, [allTreemapRows, treemapLimit]);
  const shareTotalValue = React.useMemo(() => {
    if (latestYear == null) return null;
    return metricTotalsByYear[latestYear] ?? 0;
  }, [latestYear, metricTotalsByYear]);

  React.useEffect(() => {
    if (treemapYearOptions.length === 0) return;
    if (!treemapYearOptions.some((option) => option.value === treemapYear)) {
      setTreemapYear(treemapYearOptions[0]?.value ?? "");
    }
  }, [treemapYear, treemapYearOptions]);

  const sectionSubtitle =
    latestYear != null && earliestYear != null && latestYear !== earliestYear
      ? `Tahun ${earliestYear}-${latestYear} | Unit: ${unitLabel}`
      : latestYear != null
        ? `Tahun ${latestYear} | Unit: ${unitLabel}`
        : `Unit: ${unitLabel}`;
  const routeSubtitle = `Asal: ${formatCountryList(reporters)} | Tujuan: ${formatCountryList(partners)}`;
  const exportSubtitle = `${sectionSubtitle} | ${routeSubtitle}`;
  const cardSubtitle = loading
    ? "Sedang mengambil data produk sektor pangan..."
    : viewMode === "table"
      ? `${sectionSubtitle} | ${routeSubtitle} | Nomor mengikuti urutan sorting pada kolom ${sortColumn}`
      : `Tahun aktif ${activeTreemapYear ?? "-"}${activeTreemapPrevYear != null ? ` dibanding ${activeTreemapPrevYear}` : ""} | Unit: ${unitLabel} | ${routeSubtitle}`;

  const titleNode = (
    <span className="inline-flex items-center gap-1.5">
      <span>{`Produk ${metricLabel} Sektor Pangan`}</span>
      <HoverInfoTooltip
        content={
          <div className="space-y-2">
            <p className="font-semibold text-slate-800">
              Informasi visualisasi
            </p>
            <p>
              Mode tabel menampilkan deret tahun produk. Mode treemap
              memfokuskan distribusi produk pada tahun aktif.
            </p>
          </div>
        }
      >
        <InformationCircleIcon className="h-4 w-4 text-slate-400" />
      </HoverInfoTooltip>
    </span>
  );

  const registerTableDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setTableDownload(() => handler);
    },
    []
  );
  const registerChartDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setChartDownload(() => handler);
    },
    []
  );
  const handleDownload = React.useCallback(() => {
    if (viewMode === "table") {
      tableDownload?.();
      return;
    }
    chartDownload?.();
  }, [chartDownload, tableDownload, viewMode]);

  const actions = (
    <IconTooltip
      label={viewMode === "table" ? "Ubah ke treemap" : "Ubah ke tabel"}
    >
      <span>
        <Button
          type="button"
          className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          aria-label={
            viewMode === "table" ? "Ubah ke treemap" : "Ubah ke tabel"
          }
          onClick={() =>
            setViewMode((prev) => (prev === "table" ? "treemap" : "table"))
          }
        >
          {viewMode === "table" ? (
            <Squares2X2Icon className="h-4 w-4" />
          ) : (
            <TableCellsIcon className="h-4 w-4" />
          )}
        </Button>
      </span>
    </IconTooltip>
  );

  const expandActions = (
    <IconTooltip label={viewMode === "table" ? "Unduh tabel" : "Unduh treemap"}>
      <span>
        <Button
          type="button"
          className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          aria-label={viewMode === "table" ? "Unduh tabel" : "Unduh treemap"}
          onClick={handleDownload}
          disabled={viewMode === "table" ? !tableDownload : !chartDownload}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </Button>
      </span>
    </IconTooltip>
  );

  const tableContent = (
    <div className="space-y-2">
      <TopProdukTable
        raw={tableRaw}
        unitLabel={unitLabel}
        downloadTitle={`Produk ${metricLabel} Sektor Pangan`}
        downloadFilename={`Produk_Sektor_Pangan_${metricLabel.replace(/[^\w]+/g, "_")}`}
        downloadSource={sourceName}
        downloadNotes={sectionSubtitle}
        showShareBadge
        showDeltaBadge
        showLimitControl
        shareTotalValue={shareTotalValue}
        onRegisterDownload={registerTableDownload}
        onSortColumnChange={setSortColumn}
        emptyMessage={`Data produk ${metricLabel.toLowerCase()} sektor pangan belum tersedia.`}
      />
      <div className="text-right text-[11px] italic text-slate-500">
        {sourceName}
      </div>
    </div>
  );

  const treemapBaseProps = {
    rows: treemapRows,
    mode: metricMode === "total_import" ? "impor" : "ekspor",
    year: activeTreemapYear,
    previousYear: activeTreemapPrevYear,
    unitLabel,
    onRegisterDownload: registerChartDownload,
    filename: `Treemap_Produk_Sektor_Pangan_${metricLabel.replace(/[^\w]+/g, "_")}`,
    exportTitle: `Treemap Produk ${metricLabel} Sektor Pangan`,
    exportSubtitle,
    exportFooter: sourceName
  } as const;

  const treemapControl = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Select
        value={activeTreemapYear != null ? String(activeTreemapYear) : ""}
        options={treemapYearOptions}
        onChange={setTreemapYear}
        placeholder="Pilih tahun"
        size="sm"
        className="w-32 shrink-0"
      />
      <DataLimitSelect
        value={treemapLimit}
        onChange={setTreemapLimit}
        className="w-32"
        itemLabel="produk"
      />
    </div>
  );

  const treemapContent = (
    <div className="space-y-2">
      {treemapControl}
      <TradeProductsTreemapChart {...treemapBaseProps} />
      <div className="text-right text-[11px] italic text-slate-500">
        {sourceName}
      </div>
    </div>
  );

  const expandedTreemapContent = (
    <div className="space-y-2">
      {treemapControl}
      <TradeProductsTreemapChart {...treemapBaseProps} height={560} />
      <div className="text-right text-[11px] italic text-slate-500">
        {sourceName}
      </div>
    </div>
  );

  return (
    <section className="space-y-3">
      <ExpandableCard
        title={titleNode}
        subtitle={cardSubtitle}
        actions={actions}
        expandActions={expandActions}
        className="h-full"
        contentClassName="min-h-[28rem]"
        modalSize="full"
        expandedContent={
          loading && !(data?.products.length ?? 0) ? (
            <TableSkeleton className="border-0 bg-transparent p-0 shadow-none" />
          ) : viewMode === "table" ? (
            tableContent
          ) : (
            expandedTreemapContent
          )
        }
      >
        {loading && !(data?.products.length ?? 0) ? (
          <TableSkeleton className="border-0 bg-transparent p-0 shadow-none" />
        ) : viewMode === "table" ? (
          tableContent
        ) : (
          treemapContent
        )}
      </ExpandableCard>
    </section>
  );
}
