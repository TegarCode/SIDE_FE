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
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { TradeProductsTreemapChart } from "@/components/ui/charts/TradeProductsTreemapChart";
import { TopProdukTable } from "@/components/ui/TopProdukTable";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { formatExportCountryList } from "@/utils/chartExport";
import type {
  MitraMultiServiceData,
  MitraServiceCategoryRow
} from "@/type/mitra";

type ViewMode = "table" | "treemap";

type MitraServiceTopProductsSectionProps = {
  data: MitraMultiServiceData | null | undefined;
  loading: boolean;
};

function resolveCountryNames(codes: string[], names: Record<string, string>) {
  return codes.map((code) => names[code] ?? code).filter(Boolean);
}

function formatCountryList(names: string[]) {
  return formatExportCountryList(names);
}

function buildTreemapRows(rows: MitraServiceCategoryRow[]) {
  return rows.map((row) => ({
    code: row.code,
    label: row.label,
    valueOd: row.value,
    valueReverse: null
  }));
}

function buildTopProdukRaw(
  rows: MitraServiceCategoryRow[],
  year: number | null
) {
  if (year == null) return { top_produk: [] };
  return {
    top_produk: rows.map((row) => ({
      kodeHS: row.code,
      namaHS: row.label,
      nilai: { [year]: row.value ?? 0 }
    }))
  };
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

function ServiceCard({
  title,
  subtitle,
  rows,
  sourceName,
  unitLabel,
  year,
  loading
}: {
  title: string;
  subtitle: string;
  rows: MitraServiceCategoryRow[];
  sourceName: string | null;
  unitLabel: string;
  year: number | null;
  loading: boolean;
}) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");
  const [limit, setLimit] = React.useState("15");
  const [chartDownload, setChartDownload] = React.useState<(() => void) | null>(
    null
  );
  const [tableDownload, setTableDownload] = React.useState<(() => void) | null>(
    null
  );
  const [sortColumnLabel, setSortColumnLabel] = React.useState(
    year != null ? String(year) : "Produk"
  );
  const handleRegisterChartDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setChartDownload(() => handler);
    },
    []
  );
  const handleRegisterTableDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setTableDownload(() => handler);
    },
    []
  );
  const fileBase = title.replace(/[^\w]+/g, "_");
  const limitedRows = React.useMemo(() => {
    if (limit === "ALL") return rows;
    const parsed = Number(limit);
    return Number.isFinite(parsed) ? rows.slice(0, parsed) : rows.slice(0, 15);
  }, [limit, rows]);
  const tableRaw = React.useMemo(
    () => buildTopProdukRaw(rows, year),
    [rows, year]
  );
  const resolvedSubtitle =
    viewMode === "table"
      ? `${subtitle} | Nomor berdasarkan urutan ${sortColumnLabel}`
      : subtitle;

  const content =
    loading && !rows.length ? (
      <TableSkeleton className="border-0 bg-transparent p-0 shadow-none" />
    ) : viewMode === "table" ? (
      <div className="space-y-2">
        <TopProdukTable
          raw={tableRaw}
          unitLabel={unitLabel}
          downloadTitle={title}
          downloadFilename={fileBase}
          downloadSource={sourceName ?? undefined}
          showCode={false}
          showShareBadge={false}
          showDeltaBadge={false}
          showLimitControl
          valueLabel="Nilai Jasa"
          totalLabel="Total jasa"
          emptyMessage={`Data ${title.toLowerCase()} belum tersedia.`}
          onRegisterDownload={handleRegisterTableDownload}
          onSortColumnChange={setSortColumnLabel}
        />
        <div className="text-right text-[11px] italic text-slate-500">
          {sourceName ?? "-"}
        </div>
      </div>
    ) : (
      <div className="space-y-2">
        <div className="flex justify-end">
          <DataLimitSelect
            value={limit}
            onChange={setLimit}
            className="w-32"
            itemLabel="jasa"
          />
        </div>
        <TradeProductsTreemapChart
          rows={buildTreemapRows(limitedRows)}
          mode="ekspor"
          year={null}
          unitLabel={unitLabel}
          onRegisterDownload={handleRegisterChartDownload}
          filename={fileBase}
          exportTitle={title}
          exportSubtitle={subtitle}
          exportFooter={sourceName ?? "-"}
        />
        <div className="text-right text-[11px] italic text-slate-500">
          {sourceName ?? "-"}
        </div>
      </div>
    );

  return (
    <ExpandableCard
      title={title}
      subtitle={resolvedSubtitle}
      className="h-full"
      contentClassName="min-h-[28rem]"
      modalSize="full"
      actions={
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
      }
      expandActions={
        <IconTooltip
          label={viewMode === "table" ? "Unduh tabel" : "Unduh Treemap"}
        >
          <span>
            <Button
              type="button"
              className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              aria-label={
                viewMode === "table" ? "Unduh tabel" : "Unduh treemap"
              }
              onClick={() =>
                viewMode === "table" ? tableDownload?.() : chartDownload?.()
              }
              disabled={viewMode === "table" ? !tableDownload : !chartDownload}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </span>
        </IconTooltip>
      }
      expandedContent={content}
    >
      {content}
    </ExpandableCard>
  );
}

export function MitraServiceTopProductsSection({
  data,
  loading
}: MitraServiceTopProductsSectionProps) {
  const origins = React.useMemo(
    () => (data ? resolveCountryNames(data.origins, data.originNames) : []),
    [data]
  );
  const destinations = React.useMemo(
    () =>
      data ? resolveCountryNames(data.destinations, data.destinationNames) : [],
    [data]
  );
  const subtitle =
    data?.yearTo != null
      ? `Tahun ${data.yearTo} | Unit: ${data.unit || "-"}`
      : `Unit: ${data?.unit || "-"}`;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Top Jasa Masuk & Keluar
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan kategori jasa utama berdasarkan arus jasa aktif, dengan opsi
          tampilan tabel atau treemap.
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="text-slate-500">Asal</span>
          <CountryListTooltip label="Negara Asal" countries={origins} />
          <span className="text-slate-500">Tujuan</span>
          <CountryListTooltip label="Negara Tujuan" countries={destinations} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ServiceCard
          title="Top Jasa Masuk"
          subtitle={subtitle}
          rows={data?.topServicesInbound ?? []}
          sourceName={data?.sourceName ?? "-"}
          unitLabel={data?.unit ?? "US$"}
          year={data?.yearTo ?? null}
          loading={loading}
        />
        <ServiceCard
          title="Top Jasa Keluar"
          subtitle={subtitle}
          rows={data?.topServicesOutbound ?? []}
          sourceName={data?.sourceName ?? "-"}
          unitLabel={data?.unit ?? "US$"}
          year={data?.yearTo ?? null}
          loading={loading}
        />
      </div>
    </section>
  );
}
