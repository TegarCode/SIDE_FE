import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TopMitraTable } from "@/components/ui/TopMitraTable";
import { TopProdukTable } from "@/components/ui/TopProdukTable";
import { MultiLineTrendChart } from "@/components/ui/charts/MultiLineTrendChart";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type { BilateralOverviewData } from "@/type/indonesiaKerjasamaBilateral";
import {
  buildProfessionRaw,
  buildSelectedPartnersNote,
  buildTopMitraRaw,
  buildTrendRaw,
  extractProfessionItems,
  extractSegmentItems,
  extractSegmentMeta,
  extractTotals,
  extractTrendRows,
  extractYears,
  formatServiceNumber,
  getSegmentSource,
  getSegmentUnit,
  type ProfessionItem,
  type ServiceTrendRow
} from "@/components/indonesia/kerjasama-bilateral/tabs/helpers/JasaTab.helpers";

type JasaTabProps = {
  overview: BilateralOverviewData | null;
  loading: boolean;
  error: string | null;
};

function ServiceTrendTable({
  title,
  rows,
  sourceLabel,
  unitLabel,
  activeYear,
  prevYear
}: {
  title: string;
  rows: ServiceTrendRow[];
  sourceLabel: string | null;
  unitLabel: string;
  activeYear: number | null;
  prevYear: number | null;
}) {
  const [sortColumnLabel, setSortColumnLabel] = React.useState(
    activeYear != null ? String(activeYear) : "Negara/Entitas"
  );
  const [downloadHandler, setDownloadHandler] = React.useState<
    (() => void) | null
  >(null);

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

  const trendRaw = React.useMemo(
    () => buildTrendRaw(rows, activeYear, prevYear),
    [activeYear, prevYear, rows]
  );

  return (
    <ExpandableCard
      title={title}
      subtitle={`${prevYear != null && activeYear != null ? `${prevYear}-${activeYear}` : (activeYear ?? "-")} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${sortColumnLabel}`}
      className="min-w-0 h-full min-h-115"
      modalSize="full"
      actions={
        <IconTooltip label="Unduh Excel">
          <span>
            <Button
              type="button"
              variant="outline"
              disabled={!rows.length}
              onClick={() => downloadHandler?.()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Unduh Excel ${title}`}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </span>
        </IconTooltip>
      }
      expandedContent={
        <TopMitraTable
          raw={trendRaw}
          unitLabel={unitLabel}
          expanded
          onSortColumnChange={setSortColumnLabel}
          onRegisterDownload={handleRegisterDownload}
          downloadTitle={title}
          downloadFilename={title.replace(/\s+/g, "_")}
          downloadSource={sourceLabel ?? undefined}
          emptyMessage="Data tren jasa belum tersedia."
          valueLabel="Nilai Jasa"
          shareLabel="Pangsa Jasa"
          shareContextLabel="dari total jasa"
          totalLabel="Total jasa"
          changeLabel="Perubahan Jasa YoY"
          showBalanceDetail={false}
          showDeltaColumns
        />
      }
    >
      <div className="flex h-full flex-col">
        <TopMitraTable
          raw={trendRaw}
          unitLabel={unitLabel}
          onSortColumnChange={setSortColumnLabel}
          onRegisterDownload={handleRegisterDownload}
          downloadTitle={title}
          downloadFilename={title.replace(/\s+/g, "_")}
          downloadSource={sourceLabel ?? undefined}
          emptyMessage="Data tren jasa belum tersedia."
          valueLabel="Nilai Jasa"
          shareLabel="Pangsa Jasa"
          shareContextLabel="dari total jasa"
          totalLabel="Total jasa"
          changeLabel="Perubahan Jasa YoY"
          showBalanceDetail={false}
          showDeltaColumns
        />
        {sourceLabel ? (
          <p className="mt-auto text-right text-[11px] text-slate-500">
            Sumber: {sourceLabel}
          </p>
        ) : null}
      </div>
    </ExpandableCard>
  );
}

function ServiceProfessionTable({
  title,
  professions,
  yearsAsc,
  unitLabel,
  sourceLabel
}: {
  title: string;
  professions: ProfessionItem[];
  yearsAsc: number[];
  unitLabel: string;
  sourceLabel: string | null;
}) {
  const [sortColumnLabel, setSortColumnLabel] = React.useState("tahun terbaru");
  const [downloadHandler, setDownloadHandler] = React.useState<
    (() => void) | null
  >(null);

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

  const professionRaw = React.useMemo(
    () => buildProfessionRaw(professions),
    [professions]
  );

  return (
    <ExpandableCard
      title={title}
      subtitle={`${yearsAsc[0] ?? "-"}-${yearsAsc[yearsAsc.length - 1] ?? "-"} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${sortColumnLabel}`}
      className="min-w-0 h-full min-h-115"
      modalSize="full"
      actions={
        <IconTooltip label="Unduh Excel">
          <span>
            <Button
              type="button"
              variant="outline"
              disabled={!professions.length}
              onClick={() => downloadHandler?.()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Unduh Excel ${title}`}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </span>
        </IconTooltip>
      }
      expandedContent={
        <TopProdukTable
          raw={professionRaw}
          unitLabel={unitLabel}
          expanded
          onRegisterDownload={handleRegisterDownload}
          onSortColumnChange={setSortColumnLabel}
          downloadTitle={title}
          downloadFilename={title.replace(/\s+/g, "_")}
          downloadSource={sourceLabel ?? undefined}
          emptyMessage="Data profesi jasa belum tersedia."
          valueLabel="Jumlah Jasa"
          shareLabel="Pangsa Profesi"
          shareContextLabel="pangsa dari total profesi"
          totalLabel="Total profesi"
          changeLabel="Perubahan Profesi YoY"
          showCode={false}
        />
      }
    >
      <div className="flex h-full flex-col">
        <TopProdukTable
          raw={professionRaw}
          unitLabel={unitLabel}
          onRegisterDownload={handleRegisterDownload}
          onSortColumnChange={setSortColumnLabel}
          downloadTitle={title}
          downloadFilename={title.replace(/\s+/g, "_")}
          downloadSource={sourceLabel ?? undefined}
          emptyMessage="Data profesi jasa belum tersedia."
          valueLabel="Jumlah Jasa"
          shareLabel="Pangsa Profesi"
          shareContextLabel="pangsa dari total profesi"
          totalLabel="Total profesi"
          changeLabel="Perubahan Profesi YoY"
          showCode={false}
        />
        {sourceLabel ? (
          <p className="mt-auto text-right text-[11px] text-slate-500">
            Sumber: {sourceLabel}
          </p>
        ) : null}
      </div>
    </ExpandableCard>
  );
}

export function JasaTab({ overview, loading, error }: JasaTabProps) {
  const raw = overview?.raw ?? null;
  const [inboundSortColumnLabel, setInboundSortColumnLabel] =
    React.useState("tahun terbaru");
  const [outboundSortColumnLabel, setOutboundSortColumnLabel] =
    React.useState("tahun terbaru");
  const [inboundDownloadHandler, setInboundDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const [outboundDownloadHandler, setOutboundDownloadHandler] = React.useState<
    (() => void) | null
  >(null);

  const handleRegisterInboundDownload = React.useCallback(
    (handler: (() => void) | null) => {
      if (!handler) {
        setInboundDownloadHandler(null);
        return;
      }
      setInboundDownloadHandler(() => handler);
    },
    []
  );

  const handleRegisterOutboundDownload = React.useCallback(
    (handler: (() => void) | null) => {
      if (!handler) {
        setOutboundDownloadHandler(null);
        return;
      }
      setOutboundDownloadHandler(() => handler);
    },
    []
  );
  const inboundItems = React.useMemo(
    () => extractSegmentItems(raw, "inbound"),
    [raw]
  );
  const outboundItems = React.useMemo(
    () => extractSegmentItems(raw, "outbound"),
    [raw]
  );
  const inboundYearsAsc = React.useMemo(
    () => extractYears(raw, "inbound", inboundItems),
    [inboundItems, raw]
  );
  const outboundYearsAsc = React.useMemo(
    () => extractYears(raw, "outbound", outboundItems),
    [outboundItems, raw]
  );
  const chartYearsAsc = React.useMemo(() => {
    const all = new Set<number>([...inboundYearsAsc, ...outboundYearsAsc]);
    return Array.from(all).sort((a, b) => a - b);
  }, [inboundYearsAsc, outboundYearsAsc]);

  const inboundTotals = React.useMemo(
    () => extractTotals(chartYearsAsc, inboundItems),
    [chartYearsAsc, inboundItems]
  );
  const outboundTotals = React.useMemo(
    () => extractTotals(chartYearsAsc, outboundItems),
    [chartYearsAsc, outboundItems]
  );

  const inboundMeta = React.useMemo(
    () => extractSegmentMeta(raw, "inbound"),
    [raw]
  );
  const outboundMeta = React.useMemo(
    () => extractSegmentMeta(raw, "outbound"),
    [raw]
  );
  const unitLabel = React.useMemo(() => getSegmentUnit(raw, "outbound"), [raw]);
  const inboundSourceLabel = React.useMemo(
    () => getSegmentSource(raw, "inbound"),
    [raw]
  );
  const outboundSourceLabel = React.useMemo(
    () => getSegmentSource(raw, "outbound"),
    [raw]
  );
  const inboundSelectedPartnersNote = React.useMemo(
    () => buildSelectedPartnersNote(raw, "inbound"),
    [raw]
  );
  const outboundSelectedPartnersNote = React.useMemo(
    () => buildSelectedPartnersNote(raw, "outbound"),
    [raw]
  );
  const inboundTopMitraRaw = React.useMemo(
    () => buildTopMitraRaw(raw, "inbound"),
    [raw]
  );
  const outboundTopMitraRaw = React.useMemo(
    () => buildTopMitraRaw(raw, "outbound"),
    [raw]
  );
  const inboundTrendRows = React.useMemo(
    () => extractTrendRows(raw, "inbound"),
    [raw]
  );
  const outboundTrendRows = React.useMemo(
    () => extractTrendRows(raw, "outbound"),
    [raw]
  );
  const inboundProfessions = React.useMemo(
    () => extractProfessionItems(raw, "inbound"),
    [raw]
  );
  const outboundProfessions = React.useMemo(
    () => extractProfessionItems(raw, "outbound"),
    [raw]
  );
  const inboundProfessionYears = React.useMemo(
    () => extractYears(raw, "inbound", inboundItems),
    [inboundItems, raw]
  );
  const outboundProfessionYears = React.useMemo(
    () => extractYears(raw, "outbound", outboundItems),
    [outboundItems, raw]
  );

  const inboundLatestYear =
    typeof inboundMeta?.active_year === "number"
      ? inboundMeta.active_year
      : (inboundYearsAsc[inboundYearsAsc.length - 1] ?? null);
  const inboundPrevYear =
    typeof inboundMeta?.active_prev_year === "number"
      ? inboundMeta.active_prev_year
      : (inboundYearsAsc[inboundYearsAsc.length - 2] ?? null);
  const outboundLatestYear =
    typeof outboundMeta?.active_year === "number"
      ? outboundMeta.active_year
      : (outboundYearsAsc[outboundYearsAsc.length - 1] ?? null);
  const outboundPrevYear =
    typeof outboundMeta?.active_prev_year === "number"
      ? outboundMeta.active_prev_year
      : (outboundYearsAsc[outboundYearsAsc.length - 2] ?? null);

  const chartSeries = React.useMemo(
    () => [
      { label: "Jasa Masuk", values: inboundTotals },
      { label: "Jasa Keluar", values: outboundTotals }
    ],
    [inboundTotals, outboundTotals]
  );
  const inboundAllYearsTotal = React.useMemo(
    () => inboundTotals.reduce((sum, value) => sum + value, 0),
    [inboundTotals]
  );
  const outboundAllYearsTotal = React.useMemo(
    () => outboundTotals.reduce((sum, value) => sum + value, 0),
    [outboundTotals]
  );

  const shouldShowEmptyFallback =
    !loading &&
    !error &&
    inboundItems.length === 0 &&
    outboundItems.length === 0 &&
    inboundTrendRows.length === 0 &&
    outboundTrendRows.length === 0 &&
    inboundProfessions.length === 0 &&
    outboundProfessions.length === 0;

  return (
    <div className="space-y-4">
      {loading ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold tracking-tight text-slate-900">
              Tren Jasa Masuk & Keluar dari Indonesia ke Mitra Tujuan
            </h3>
            <p className="text-xs text-slate-500">Memuat data tren jasa...</p>
            <div className="mt-4">
              <ChartSkeleton />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`service-table-skeleton-${index}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-sm font-semibold tracking-tight text-slate-900">
                  Memuat tabel...
                </p>
                <div className="mt-4">
                  <TableSkeleton rows={8} />
                </div>
              </div>
            ))}
          </section>
        </>
      ) : error ? (
        <FilterFallbackCard
          title="Data jasa bilateral gagal dimuat"
          body={error}
        />
      ) : shouldShowEmptyFallback ? (
        <FilterFallbackCard
          title="Data jasa bilateral belum tersedia"
          body="Data inbound maupun outbound jasa pada mitra tujuan aktif belum tersedia."
        />
      ) : (
        <>
          <ExpandableCard
            title="Tren Jasa Masuk & Keluar dari Indonesia ke Mitra Tujuan"
            subtitle={`${chartYearsAsc[0] ?? "-"}-${chartYearsAsc[chartYearsAsc.length - 1] ?? "-"} | Unit: ${unitLabel}`}
            className="min-w-0 min-h-144"
            modalSize="full"
            contentClassName="flex h-full flex-col gap-3"
            expandedContent={
              <MultiLineTrendChart
                years={chartYearsAsc}
                series={chartSeries}
                unit={unitLabel}
                height={720}
              />
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Total Masuk
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  {formatServiceNumber(inboundAllYearsTotal)}
                </p>
                <p className="text-[11px] text-slate-500">
                  Akumulasi seluruh tahun | Unit: {unitLabel}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Total Keluar
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  {formatServiceNumber(outboundAllYearsTotal)}
                </p>
                <p className="text-[11px] text-slate-500">
                  Akumulasi seluruh tahun | Unit: {unitLabel}
                </p>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <MultiLineTrendChart
                years={chartYearsAsc}
                series={chartSeries}
                unit={unitLabel}
                height={480}
              />
            </div>
            <p className="mt-auto text-right text-[11px] text-slate-500">
              Sumber: {inboundSourceLabel ?? "-"}
              {outboundSourceLabel && outboundSourceLabel !== inboundSourceLabel
                ? ` | Outbound: ${outboundSourceLabel}`
                : ""}
            </p>
          </ExpandableCard>

          <section className="grid gap-4 xl:grid-cols-2">
            <ExpandableCard
              title="Top Mitra Jasa Masuk ke Indonesia"
              subtitle={`${inboundYearsAsc[0] ?? "-"}-${inboundYearsAsc[inboundYearsAsc.length - 1] ?? "-"} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${inboundSortColumnLabel}`}
              className="min-w-0 h-full min-h-115"
              modalSize="full"
              actions={
                <IconTooltip label="Unduh Excel">
                  <span>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!inboundDownloadHandler}
                      onClick={() => inboundDownloadHandler?.()}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Unduh Excel Top Mitra Jasa Masuk"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </Button>
                  </span>
                </IconTooltip>
              }
              expandedContent={
                <TopMitraTable
                  raw={inboundTopMitraRaw}
                  unitLabel={unitLabel}
                  expanded
                  onSortColumnChange={setInboundSortColumnLabel}
                  onRegisterDownload={handleRegisterInboundDownload}
                  downloadTitle="Top Mitra Jasa Masuk ke Indonesia"
                  downloadFilename={`Top_Mitra_Jasa_Masuk_${inboundLatestYear ?? "-"}`}
                  downloadSource={inboundSourceLabel ?? undefined}
                  downloadNotes={inboundSelectedPartnersNote}
                  emptyMessage="Data top mitra jasa masuk belum tersedia."
                  valueLabel="Nilai Jasa"
                  shareLabel="Pangsa Jasa"
                  shareContextLabel="dari total jasa"
                  totalLabel="Total jasa"
                  changeLabel="Perubahan Jasa YoY"
                  showBalanceDetail={false}
                />
              }
            >
              <div className="flex h-full flex-col">
                <div className="min-h-0 flex-1">
                  <TopMitraTable
                    raw={inboundTopMitraRaw}
                    unitLabel={unitLabel}
                    onSortColumnChange={setInboundSortColumnLabel}
                    onRegisterDownload={handleRegisterInboundDownload}
                    downloadTitle="Top Mitra Jasa Masuk ke Indonesia"
                    downloadFilename={`Top_Mitra_Jasa_Masuk_${inboundLatestYear ?? "-"}`}
                    downloadSource={inboundSourceLabel ?? undefined}
                    downloadNotes={inboundSelectedPartnersNote}
                    emptyMessage="Data top mitra jasa masuk belum tersedia."
                    valueLabel="Nilai Jasa"
                    shareLabel="Pangsa Jasa"
                    shareContextLabel="dari total jasa"
                    totalLabel="Total jasa"
                    changeLabel="Perubahan Jasa YoY"
                    showBalanceDetail={false}
                  />
                </div>
                {inboundSourceLabel ? (
                  <p className="mt-auto text-right text-[11px] text-slate-500">
                    Sumber: {inboundSourceLabel}
                  </p>
                ) : null}
              </div>
            </ExpandableCard>

            <ExpandableCard
              title="Top Mitra Jasa Keluar dari Indonesia"
              subtitle={`${outboundYearsAsc[0] ?? "-"}-${outboundYearsAsc[outboundYearsAsc.length - 1] ?? "-"} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${outboundSortColumnLabel}`}
              className="min-w-0 h-full min-h-115"
              modalSize="full"
              actions={
                <IconTooltip label="Unduh Excel">
                  <span>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!outboundDownloadHandler}
                      onClick={() => outboundDownloadHandler?.()}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Unduh Excel Top Mitra Jasa Keluar"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </Button>
                  </span>
                </IconTooltip>
              }
              expandedContent={
                <TopMitraTable
                  raw={outboundTopMitraRaw}
                  unitLabel={unitLabel}
                  expanded
                  onSortColumnChange={setOutboundSortColumnLabel}
                  onRegisterDownload={handleRegisterOutboundDownload}
                  downloadTitle="Top Mitra Jasa Keluar dari Indonesia"
                  downloadFilename={`Top_Mitra_Jasa_Keluar_${outboundLatestYear ?? "-"}`}
                  downloadSource={outboundSourceLabel ?? undefined}
                  downloadNotes={outboundSelectedPartnersNote}
                  emptyMessage="Data top mitra jasa keluar belum tersedia."
                  valueLabel="Nilai Jasa"
                  shareLabel="Pangsa Jasa"
                  shareContextLabel="dari total jasa"
                  totalLabel="Total jasa"
                  changeLabel="Perubahan Jasa YoY"
                  showBalanceDetail={false}
                />
              }
            >
              <div className="flex h-full flex-col">
                <div className="min-h-0 flex-1">
                  <TopMitraTable
                    raw={outboundTopMitraRaw}
                    unitLabel={unitLabel}
                    onSortColumnChange={setOutboundSortColumnLabel}
                    onRegisterDownload={handleRegisterOutboundDownload}
                    downloadTitle="Top Mitra Jasa Keluar dari Indonesia"
                    downloadFilename={`Top_Mitra_Jasa_Keluar_${outboundLatestYear ?? "-"}`}
                    downloadSource={outboundSourceLabel ?? undefined}
                    downloadNotes={outboundSelectedPartnersNote}
                    emptyMessage="Data top mitra jasa keluar belum tersedia."
                    valueLabel="Nilai Jasa"
                    shareLabel="Pangsa Jasa"
                    shareContextLabel="dari total jasa"
                    totalLabel="Total jasa"
                    changeLabel="Perubahan Jasa YoY"
                    showBalanceDetail={false}
                  />
                </div>
                {outboundSourceLabel ? (
                  <p className="mt-auto text-right text-[11px] text-slate-500">
                    Sumber: {outboundSourceLabel}
                  </p>
                ) : null}
              </div>
            </ExpandableCard>

            <ServiceTrendTable
              title="Tren Jasa Masuk ke Indonesia"
              rows={inboundTrendRows}
              sourceLabel={inboundSourceLabel}
              unitLabel={unitLabel}
              activeYear={inboundLatestYear}
              prevYear={inboundPrevYear}
            />

            <ServiceTrendTable
              title="Tren Jasa Keluar dari Indonesia"
              rows={outboundTrendRows}
              sourceLabel={outboundSourceLabel}
              unitLabel={unitLabel}
              activeYear={outboundLatestYear}
              prevYear={outboundPrevYear}
            />

            <ServiceProfessionTable
              title="Top Profesi Jasa Indonesia dari Mitra Tujuan"
              professions={inboundProfessions}
              yearsAsc={inboundProfessionYears}
              unitLabel={unitLabel}
              sourceLabel={inboundSourceLabel}
            />

            <ServiceProfessionTable
              title="Top Profesi Jasa Indonesia ke Mitra Tujuan"
              professions={outboundProfessions}
              yearsAsc={outboundProfessionYears}
              unitLabel={unitLabel}
              sourceLabel={outboundSourceLabel}
            />
          </section>
        </>
      )}
    </div>
  );
}
