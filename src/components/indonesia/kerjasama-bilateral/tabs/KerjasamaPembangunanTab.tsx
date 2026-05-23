import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TopMitraTable } from "@/components/ui/TopMitraTable";
import { MultiLineTrendChart } from "@/components/ui/charts/MultiLineTrendChart";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type { BilateralOverviewData } from "@/type/indonesiaKerjasamaBilateral";
import {
  buildSelectedPartnersNote,
  buildTopMitraRaw,
  extractActivities,
  extractItems,
  extractMetaInfo,
  extractTotals,
  extractYears,
  formatPembangunanNumber,
  getSourceLabel,
  getUnitLabel
} from "@/components/indonesia/kerjasama-bilateral/tabs/helpers/KerjasamaPembangunanTab.helpers";

type KerjasamaPembangunanTabProps = {
  overview: BilateralOverviewData | null;
  loading: boolean;
  error: string | null;
};

export function KerjasamaPembangunanTab({
  overview,
  loading,
  error
}: KerjasamaPembangunanTabProps) {
  const raw = overview?.raw ?? null;
  const [sortColumnLabel, setSortColumnLabel] = React.useState("tahun terbaru");
  const [downloadHandler, setDownloadHandler] = React.useState<
    (() => void) | null
  >(null);

  const items = React.useMemo(() => extractItems(raw), [raw]);
  const yearsAsc = React.useMemo(() => extractYears(raw, items), [items, raw]);
  const totals = React.useMemo(
    () => extractTotals(raw, yearsAsc, items),
    [items, raw, yearsAsc]
  );
  const activityTotals = React.useMemo(
    () => extractActivities(yearsAsc, items),
    [items, yearsAsc]
  );
  const meta = React.useMemo(() => extractMetaInfo(raw), [raw]);
  const unitLabel = React.useMemo(() => getUnitLabel(raw), [raw]);
  const sourceLabel = React.useMemo(() => getSourceLabel(raw), [raw]);
  const selectedPartnersNote = React.useMemo(
    () => buildSelectedPartnersNote(raw),
    [raw]
  );
  const topMitraRaw = React.useMemo(() => buildTopMitraRaw(raw), [raw]);

  const latestYear =
    typeof meta?.active_year === "number"
      ? meta.active_year
      : (yearsAsc[yearsAsc.length - 1] ?? null);
  const latestIndex = latestYear != null ? yearsAsc.indexOf(latestYear) : -1;
  const latestTotal = latestIndex >= 0 ? (totals[latestIndex] ?? 0) : 0;
  const latestActivities =
    latestIndex >= 0 ? (activityTotals[latestIndex] ?? 0) : 0;
  const allYearsTotal = React.useMemo(
    () => totals.reduce((sum, value) => sum + value, 0),
    [totals]
  );
  const allYearsActivities = React.useMemo(
    () => activityTotals.reduce((sum, value) => sum + value, 0),
    [activityTotals]
  );

  const chartSeries = React.useMemo(
    () => [{ label: "Nilai Kerjasama Pembangunan", values: totals }],
    [totals]
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

  const shouldShowEmptyFallback =
    !loading && !error && items.length === 0 && totals.length === 0;

  return (
    <div className="space-y-4">
      {loading ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold tracking-tight text-slate-900">
              Time Series Nilai Kerjasama Pembangunan dari Indonesia ke Mitra
              Tujuan
            </h3>
            <p className="text-xs text-slate-500">
              Memuat data kerjasama pembangunan...
            </p>
            <div className="mt-4">
              <ChartSkeleton />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              Memuat Top Mitra Kerjasama Pembangunan...
            </p>
            <div className="mt-4">
              <TableSkeleton rows={8} />
            </div>
          </section>
        </>
      ) : error ? (
        <FilterFallbackCard
          title="Data kerjasama pembangunan bilateral gagal dimuat"
          body={error}
        />
      ) : shouldShowEmptyFallback ? (
        <FilterFallbackCard
          title="Data kerjasama pembangunan bilateral belum tersedia"
          body="Data nilai kerjasama pembangunan pada mitra tujuan aktif belum tersedia."
        />
      ) : (
        <>
          <ExpandableCard
            title="Time Series Nilai Kerjasama Pembangunan dari Indonesia ke Mitra Tujuan"
            subtitle={`${yearsAsc[0] ?? "-"}-${yearsAsc[yearsAsc.length - 1] ?? "-"} | Unit: ${unitLabel}`}
            className="min-w-0 min-h-144"
            modalSize="full"
            contentClassName="flex h-full flex-col gap-3"
            expandedContent={
              <MultiLineTrendChart
                years={yearsAsc}
                series={chartSeries}
                unit={unitLabel}
                height={720}
              />
            }
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Tahun Aktif
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  {latestYear ?? "-"}
                </p>
                <p className="text-[11px] text-slate-500">Periode aktif data</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Nilai Tahun Aktif
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  {formatPembangunanNumber(latestTotal)}
                </p>
                <p className="text-[11px] text-slate-500">Unit: {unitLabel}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Total Nilai
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  {formatPembangunanNumber(allYearsTotal)}
                </p>
                <p className="text-[11px] text-slate-500">
                  Akumulasi seluruh tahun | Unit: {unitLabel}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Jumlah Kegiatan
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  {formatPembangunanNumber(allYearsActivities)}
                </p>
                <p className="text-[11px] text-slate-500">
                  Tahun aktif: {formatPembangunanNumber(latestActivities)}
                </p>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <MultiLineTrendChart
                years={yearsAsc}
                series={chartSeries}
                unit={unitLabel}
                height={480}
              />
            </div>
            <p className="mt-auto text-right text-[11px] text-slate-500">
              Sumber: {sourceLabel ?? "-"}
            </p>
          </ExpandableCard>

          <ExpandableCard
            title="Top Mitra Kerjasama Pembangunan dari Indonesia ke Mitra Tujuan"
            subtitle={`${yearsAsc[0] ?? "-"}-${yearsAsc[yearsAsc.length - 1] ?? "-"} | Unit: ${unitLabel} | Nomor mengikuti urutan sorting pada kolom ${sortColumnLabel}`}
            className="min-w-0 h-full min-h-115"
            modalSize="full"
            actions={
              <IconTooltip label="Unduh Excel">
                <span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!downloadHandler}
                    onClick={() => downloadHandler?.()}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Unduh Excel Top Mitra Kerjasama Pembangunan"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </Button>
                </span>
              </IconTooltip>
            }
            expandedContent={
              <TopMitraTable
                raw={topMitraRaw}
                unitLabel={unitLabel}
                expanded
                onSortColumnChange={setSortColumnLabel}
                onRegisterDownload={handleRegisterDownload}
                downloadTitle="Top Mitra Kerjasama Pembangunan dari Indonesia ke Mitra Tujuan"
                downloadFilename={`Top_Mitra_Kerjasama_Pembangunan_${latestYear ?? "-"}`}
                downloadSource={sourceLabel ?? undefined}
                downloadNotes={selectedPartnersNote}
                emptyMessage="Data top mitra kerjasama pembangunan belum tersedia."
                valueLabel="Nilai Kerjasama Pembangunan"
                shareLabel="Pangsa Kerjasama Pembangunan"
                shareContextLabel="dari total kerjasama pembangunan"
                totalLabel="Total kerjasama pembangunan"
                changeLabel="Perubahan Kerjasama Pembangunan YoY"
                showBalanceDetail={false}
                activityLabel="Jumlah kegiatan"
                showActivityDetail
                showInlineUnit
                maximumFractionDigits={2}
              />
            }
          >
            <div className="flex h-full flex-col">
              <div className="min-h-0 flex-1">
                <TopMitraTable
                  raw={topMitraRaw}
                  unitLabel={unitLabel}
                  onSortColumnChange={setSortColumnLabel}
                  onRegisterDownload={handleRegisterDownload}
                  downloadTitle="Top Mitra Kerjasama Pembangunan dari Indonesia ke Mitra Tujuan"
                  downloadFilename={`Top_Mitra_Kerjasama_Pembangunan_${latestYear ?? "-"}`}
                  downloadSource={sourceLabel ?? undefined}
                  downloadNotes={selectedPartnersNote}
                  emptyMessage="Data top mitra kerjasama pembangunan belum tersedia."
                  valueLabel="Nilai Kerjasama Pembangunan"
                  shareLabel="Pangsa Kerjasama Pembangunan"
                  shareContextLabel="dari total kerjasama pembangunan"
                  totalLabel="Total kerjasama pembangunan"
                  changeLabel="Perubahan Kerjasama Pembangunan YoY"
                  showBalanceDetail={false}
                  activityLabel="Jumlah kegiatan"
                  showActivityDetail
                  showInlineUnit
                  maximumFractionDigits={2}
                />
              </div>
              {sourceLabel ? (
                <p className="mt-auto text-right text-[11px] text-slate-500">
                  Sumber: {sourceLabel}
                </p>
              ) : null}
            </div>
          </ExpandableCard>
        </>
      )}
    </div>
  );
}
