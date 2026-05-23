import React from "react";
import {
  ArrowDownTrayIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  TableCellsIcon
} from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TopProdukTable } from "@/components/ui/TopProdukTable";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { TradeProductsTreemapChart } from "@/components/ui/charts/TradeProductsTreemapChart";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type {
  MitraTradeOverviewData,
  MitraTradeOverviewProduct
} from "@/type/mitra";

type MitraTradeTopProductsSectionProps = {
  data: MitraTradeOverviewData | null | undefined;
  loading: boolean;
};

type ProductMode = "table" | "treemap";

function resolveCountryNames(codes: string[], names: Record<string, string>) {
  return codes.map((code) => names[code] ?? code).filter(Boolean);
}

function formatCountryList(names: string[]) {
  if (names.length === 0) return "-";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} +${names.length - 3} lainnya`;
}

function CountryListTooltip({
  label,
  countries
}: {
  label: string;
  countries: string[];
}) {
  if (countries.length === 0)
    return <span className="font-medium text-slate-700">{label}</span>;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-medium text-slate-700">
        {formatCountryList(countries)}
      </span>
      <HoverInfoTooltip
        className="inline-flex"
        openOnClick
        content={null}
        renderContent={(close) => (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {label}
              </p>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-4 w-4 items-center justify-center text-slate-400 transition hover:text-slate-700"
                aria-label="Tutup tooltip"
              >
                <span className="text-xs leading-none">x</span>
              </button>
            </div>
            <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {countries.map((country) => (
                <div
                  key={country}
                  className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-700"
                >
                  {country}
                </div>
              ))}
            </div>
          </div>
        )}
      >
        <button
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center text-slate-400 transition hover:text-slate-700"
          aria-label={`Lihat daftar ${label.toLowerCase()}`}
        >
          <InformationCircleIcon className="h-3.5 w-3.5" />
        </button>
      </HoverInfoTooltip>
    </span>
  );
}

function buildTopProdukRaw(
  rows: MitraTradeOverviewProduct[],
  year: number | null,
  mode: "ekspor" | "impor"
) {
  if (year == null) return { top_produk: [] };
  return {
    top_produk: rows.map((row) => ({
      kodeHS: row.code,
      namaHS: row.label,
      nilai: { [year]: row.valueOd ?? 0 },
      [mode === "ekspor" ? "export" : "import"]: { [year]: row.valueOd ?? 0 },
      [mode === "ekspor" ? "export_reverse" : "import_reverse"]: {
        [year]: row.valueReverse ?? 0
      }
    }))
  };
}

function ProductCard({
  title,
  subtitle,
  exportSubtitle,
  rows,
  year,
  source,
  unitLabel,
  shareTotalValue,
  mode,
  loading,
  downloadTitle,
  downloadNotes
}: {
  title: string;
  subtitle: string;
  exportSubtitle: string;
  rows: MitraTradeOverviewProduct[];
  year: number | null;
  source: string | null;
  unitLabel: string;
  shareTotalValue: number | null;
  mode: "ekspor" | "impor";
  loading: boolean;
  downloadTitle: string;
  downloadNotes?: string[];
}) {
  const [viewMode, setViewMode] = React.useState<ProductMode>("table");
  const [treemapLimit, setTreemapLimit] = React.useState("15");
  const [tableDownload, setTableDownload] = React.useState<(() => void) | null>(
    null
  );
  const [chartDownload, setChartDownload] = React.useState<(() => void) | null>(
    null
  );

  const tableRaw = React.useMemo(
    () => buildTopProdukRaw(rows, year, mode),
    [mode, rows, year]
  );
  const treemapRows = React.useMemo(() => {
    if (treemapLimit === "ALL") return rows;
    const limit = Number(treemapLimit);
    if (!Number.isFinite(limit) || limit <= 0) return rows.slice(0, 15);
    return rows.slice(0, limit);
  }, [rows, treemapLimit]);
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
  const titleNode = (
    <span className="inline-flex items-center gap-1.5">
      <span>{title}</span>
      <HoverInfoTooltip
        content={
          <div className="space-y-2">
            <p className="font-semibold text-slate-800">
              Informasi visualisasi
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                Nilai sebaliknya = nilai mirror berdasarkan laporan negara mitra
                untuk komoditas yang sama.
              </li>
              <li>
                Under invoicing diindikasikan bila nilai sebaliknya &gt;= 40%
                lebih tinggi; over invoicing kebalikannya.
              </li>
              <li>
                Anomali ditandai tanda seru (!), berlaku untuk under maupun over
                invoicing.
              </li>
            </ul>
          </div>
        }
      >
        <InformationCircleIcon className="h-4 w-4 text-slate-400" />
      </HoverInfoTooltip>
    </span>
  );
  const handleDownload = React.useCallback(() => {
    if (viewMode === "table") {
      tableDownload?.();
      return;
    }

    chartDownload?.();
  }, [chartDownload, tableDownload, viewMode]);

  const actions = (
    <>
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
    </>
  );

  const expandActions = (
    <IconTooltip label={viewMode === "table" ? "Unduh tabel" : "Unduh Treemap"}>
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

  const content =
    loading && !rows.length ? (
      <TableSkeleton className="border-0 bg-transparent p-0 shadow-none" />
    ) : viewMode === "table" ? (
      <div className="space-y-2">
        <TopProdukTable
          raw={tableRaw}
          unitLabel={unitLabel}
          downloadTitle={downloadTitle}
          downloadFilename={title.replace(/[^\w]+/g, "_")}
          downloadSource={source ?? undefined}
          downloadNotes={downloadNotes}
          invoiceMode={mode}
          invoiceHighlightTone="warning"
          columnMode="trade_pair"
          showShareBadge
          showDeltaBadge={false}
          showLimitControl
          shareTotalValue={shareTotalValue}
          enableRowHoverTooltip
          totalLabel={mode === "ekspor" ? "Total ekspor" : "Total impor"}
          onRegisterDownload={registerTableDownload}
          emptyMessage={`Data ${title.toLowerCase()} belum tersedia.`}
        />
        <div className="text-right text-[11px] italic text-slate-500">
          {source ?? "-"}
        </div>
      </div>
    ) : (
      <div className="space-y-2">
        <div className="flex justify-end">
          <DataLimitSelect
            value={treemapLimit}
            onChange={setTreemapLimit}
            className="w-32"
            itemLabel="produk"
          />
        </div>
        <TradeProductsTreemapChart
          rows={treemapRows}
          mode={mode}
          year={year}
          unitLabel={unitLabel}
          onRegisterDownload={registerChartDownload}
          filename={title.replace(/[^\w]+/g, "_")}
          exportTitle={title}
          exportSubtitle={exportSubtitle}
          exportFooter={source ?? "-"}
        />
        <div className="text-right text-[11px] italic text-slate-500">
          {source ?? "-"}
        </div>
      </div>
    );

  const expandedContent =
    loading && !rows.length ? (
      <TableSkeleton className="border-0 bg-transparent p-0 shadow-none" />
    ) : viewMode === "table" ? (
      content
    ) : (
      <div className="space-y-2">
        <div className="flex justify-end">
          <DataLimitSelect
            value={treemapLimit}
            onChange={setTreemapLimit}
            className="w-32"
            itemLabel="produk"
          />
        </div>
        <TradeProductsTreemapChart
          rows={treemapRows}
          mode={mode}
          year={year}
          unitLabel={unitLabel}
          onRegisterDownload={registerChartDownload}
          filename={title.replace(/[^\w]+/g, "_")}
          height={560}
          exportTitle={title}
          exportSubtitle={exportSubtitle}
          exportFooter={source ?? "-"}
        />
        <div className="text-right text-[11px] italic text-slate-500">
          {source ?? "-"}
        </div>
      </div>
    );

  return (
    <ExpandableCard
      title={titleNode}
      subtitle={subtitle}
      actions={actions}
      expandActions={expandActions}
      className="h-full"
      contentClassName="min-h-[28rem]"
      modalSize="full"
      expandedContent={expandedContent}
    >
      {content}
    </ExpandableCard>
  );
}

export function MitraTradeTopProductsSection({
  data,
  loading
}: MitraTradeTopProductsSectionProps) {
  const year = data?.year ?? null;
  const unit = data?.unit ?? "";
  const source = data?.sourceName ?? null;
  const origins = React.useMemo(
    () => (data ? resolveCountryNames(data.origin, data.originNames) : []),
    [data]
  );
  const destinations = React.useMemo(
    () =>
      data ? resolveCountryNames(data.destination, data.destinationNames) : [],
    [data]
  );
  const subtitle =
    year != null ? `Tahun ${year} | Unit: ${unit}` : `Unit: ${unit || "-"}`;
  const routeText =
    origins.length || destinations.length
      ? `${origins.join(", ") || "-"} ke ${destinations.join(", ") || "-"}`
      : "";
  const routeInfo =
    origins.length || destinations.length
      ? `Asal: ${origins.join(", ") || "-"} | Tujuan: ${destinations.join(", ") || "-"}`
      : "";
  const exportSubtitle = routeInfo ? `${subtitle} | ${routeInfo}` : subtitle;
  const downloadNotes = routeInfo ? [routeInfo] : undefined;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Top Produk Ekspor & Impor
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan produk utama berdasarkan arus perdagangan aktif, lengkap
          dengan indikasi under invoice dan over invoice.
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="text-slate-500">Asal</span>
          <CountryListTooltip label="Negara Asal" countries={origins} />
          <span className="text-slate-500">Tujuan</span>
          <CountryListTooltip label="Negara Tujuan" countries={destinations} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProductCard
          title={`Top Produk Ekspor`}
          subtitle={subtitle}
          exportSubtitle={exportSubtitle}
          downloadTitle={`Top Produk Ekspor ${routeText}`.trim()}
          downloadNotes={downloadNotes}
          rows={data?.topProductsExport ?? []}
          year={year}
          source={source}
          unitLabel={unit}
          shareTotalValue={data?.export.valueNow ?? null}
          mode="ekspor"
          loading={loading}
        />
        <ProductCard
          title={`Top Produk Impor`}
          subtitle={subtitle}
          exportSubtitle={exportSubtitle}
          downloadTitle={`Top Produk Impor ${routeText}`.trim()}
          downloadNotes={downloadNotes}
          rows={data?.topProductsImport ?? []}
          year={year}
          source={source}
          unitLabel={unit}
          shareTotalValue={data?.import.valueNow ?? null}
          mode="impor"
          loading={loading}
        />
      </div>
    </section>
  );
}
