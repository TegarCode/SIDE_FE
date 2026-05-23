import React from "react";
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TopMitraTable } from "@/components/ui/TopMitraTable";
import { useToast } from "@/components/ui/Toast";
import { TopCountryComparisonBarChart } from "@/components/ui/charts/TopCountryComparisonBarChart";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { useMitraOverviewTopInvestmentQuery } from "@/hooks/mitra/useMitraOverviewTopInvestmentQuery";
import type { MitraOverviewInvestmentRow } from "@/type/mitra";

type InvestasiOverviewTabProps = {
  countryCode: string | null;
  countryName: string;
};

type VisualMode = "table" | "chart";

type SectionProps = {
  title: string;
  subtitle: string;
  sourceLabel?: string | null;
  visualMode: VisualMode;
  onToggleVisualMode: () => void;
  tableDownloadHandler: (() => void) | null;
  chartDownloadHandler: (() => void) | null;
  tableContent: React.ReactNode;
  chartContent: React.ReactNode;
  expandedTableContent: React.ReactNode;
  expandedChartContent: React.ReactNode;
};

function toTopMitraRaw(
  rows: MitraOverviewInvestmentRow[],
  latestYear: number | null,
  prevYear: number | null
) {
  return {
    data: {
      items: rows.map((item) => ({
        negara: item.country,
        kode_alpha2: item.alpha2,
        kode_alpha3: item.alpha3,
        nilai_perdagangan: {
          ...(prevYear != null && item.prevValue != null
            ? { [prevYear]: item.prevValue }
            : {}),
          ...(latestYear != null && item.latestValue != null
            ? { [latestYear]: item.latestValue }
            : {})
        },
        proporsi:
          latestYear != null && item.share != null
            ? { [latestYear]: item.share }
            : {}
      }))
    }
  };
}

function formatYearPeriod(latestYear: number | null, prevYear: number | null) {
  if (latestYear == null && prevYear == null) return "-";
  if (latestYear != null && prevYear != null) {
    const start = Math.min(latestYear, prevYear);
    const end = Math.max(latestYear, prevYear);
    return start === end ? String(end) : `${start}-${end}`;
  }
  return String(latestYear ?? prevYear ?? "-");
}

function InvestmentSection({
  title,
  subtitle,
  sourceLabel,
  visualMode,
  onToggleVisualMode,
  tableDownloadHandler,
  chartDownloadHandler,
  tableContent,
  chartContent,
  expandedTableContent,
  expandedChartContent
}: SectionProps) {
  const isChart = visualMode === "chart";
  const activeDownloadHandler = isChart
    ? chartDownloadHandler
    : tableDownloadHandler;

  return (
    <ExpandableCard
      title={title}
      subtitle={subtitle}
      className="min-w-0 min-h-152"
      contentClassName="flex h-full flex-col"
      modalSize="full"
      actions={
        <div className="flex items-center gap-2">
          <IconTooltip label={isChart ? "Unduh chart" : "Unduh tabel"}>
            <span>
              <Button
                type="button"
                disabled={!activeDownloadHandler}
                onClick={() => activeDownloadHandler?.()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={isChart ? "Unduh chart" : "Unduh tabel"}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </Button>
            </span>
          </IconTooltip>
          <IconTooltip label={isChart ? "Lihat tabel" : "Lihat chart"}>
            <span>
              <Button
                type="button"
                onClick={onToggleVisualMode}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label={isChart ? "Lihat tabel" : "Lihat chart"}
              >
                {isChart ? (
                  <TableCellsIcon className="h-4 w-4" />
                ) : (
                  <ChartBarIcon className="h-4 w-4" />
                )}
              </Button>
            </span>
          </IconTooltip>
        </div>
      }
      expandedContent={isChart ? expandedChartContent : expandedTableContent}
    >
      <div className="flex h-128 min-h-0 flex-col">
        <div className="min-h-0 flex-1">
          {isChart ? chartContent : tableContent}
        </div>
        <p className="mt-2 text-right text-[11px] text-slate-500">
          Sumber: {sourceLabel ?? "-"}
        </p>
      </div>
    </ExpandableCard>
  );
}

export function InvestasiOverviewTab({
  countryCode,
  countryName
}: InvestasiOverviewTabProps) {
  const { toast, dismiss } = useToast();
  const query = useMitraOverviewTopInvestmentQuery(countryCode);
  const [inboundVisualMode, setInboundVisualMode] =
    React.useState<VisualMode>("table");
  const [outboundVisualMode, setOutboundVisualMode] =
    React.useState<VisualMode>("table");
  const [inboundTableDownloadHandler, setInboundTableDownloadHandler] =
    React.useState<(() => void) | null>(null);
  const [inboundChartDownloadHandler, setInboundChartDownloadHandler] =
    React.useState<(() => void) | null>(null);
  const [outboundTableDownloadHandler, setOutboundTableDownloadHandler] =
    React.useState<(() => void) | null>(null);
  const [outboundChartDownloadHandler, setOutboundChartDownloadHandler] =
    React.useState<(() => void) | null>(null);
  const loadingToastIdRef = React.useRef<string | null>(null);
  const lastCompletedToastKeyRef = React.useRef<string | null>(null);

  const registerInboundTableDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setInboundTableDownloadHandler(() => handler);
    },
    []
  );
  const registerInboundChartDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setInboundChartDownloadHandler(() => handler);
    },
    []
  );
  const registerOutboundTableDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setOutboundTableDownloadHandler(() => handler);
    },
    []
  );
  const registerOutboundChartDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setOutboundChartDownloadHandler(() => handler);
    },
    []
  );

  const data = query.data;
  const normalizedCountryCode = countryCode?.toUpperCase() ?? null;
  const isDataAligned =
    !normalizedCountryCode ||
    ((!data?.tujuan || data.tujuan.toUpperCase() === normalizedCountryCode) &&
      (!data?.asalAlpha3 ||
        data.asalAlpha3.toUpperCase() === normalizedCountryCode));
  const toastKey = React.useMemo(() => {
    if (!normalizedCountryCode) return null;
    return `mitra-top-investment-${normalizedCountryCode}`;
  }, [normalizedCountryCode]);
  const inboundRaw = React.useMemo(
    () =>
      toTopMitraRaw(
        data?.inbound ?? [],
        data?.inboundLatestYear ?? null,
        data?.inboundPrevYear ?? null
      ),
    [data?.inbound, data?.inboundLatestYear, data?.inboundPrevYear]
  );
  const outboundRaw = React.useMemo(
    () =>
      toTopMitraRaw(
        data?.outbound ?? [],
        data?.outboundLatestYear ?? null,
        data?.outboundPrevYear ?? null
      ),
    [data?.outbound, data?.outboundLatestYear, data?.outboundPrevYear]
  );

  React.useEffect(() => {
    if (!toastKey) return;

    if (query.isFetching) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Sedang tarik data investasi negara mitra",
        description: `Memuat data investasi untuk ${countryName}.`,
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [countryName, dismiss, query.isFetching, toast, toastKey]);

  React.useEffect(() => {
    if (
      !toastKey ||
      query.isFetching ||
      !query.isSuccess ||
      !data ||
      !isDataAligned
    )
      return;
    if (lastCompletedToastKeyRef.current === toastKey) return;

    lastCompletedToastKeyRef.current = toastKey;
    toast({
      title: "Data investasi negara mitra siap",
      description: `Data investasi untuk ${countryName} berhasil dimuat.`,
      tone: "success"
    });
  }, [
    countryName,
    data,
    isDataAligned,
    query.isFetching,
    query.isSuccess,
    toast,
    toastKey
  ]);

  if ((query.isLoading && !data) || (query.isFetching && !isDataAligned)) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold tracking-tight text-slate-900">
            Investasi Masuk ke {countryName}
          </h3>
          <div className="mt-4">
            <TableSkeleton rows={8} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold tracking-tight text-slate-900">
            Investasi Keluar dari {countryName}
          </h3>
          <div className="mt-4">
            <TableSkeleton rows={8} />
          </div>
        </div>
      </div>
    );
  }

  if (query.error) {
    return (
      <FilterFallbackCard
        title="Data overview investasi gagal dimuat"
        body={`Terjadi kesalahan saat mengambil top investasi untuk ${countryName}.`}
      />
    );
  }

  if (!data) {
    return (
      <FilterFallbackCard
        title="Data overview investasi belum tersedia"
        body={`Data investasi masuk dan keluar untuk ${countryName} belum tersedia.`}
      />
    );
  }

  const displayCountryName = countryName;
  const selectedCountryNote = `Negara mitra terpilih: ${displayCountryName}`;
  const inboundPeriod = formatYearPeriod(
    data.inboundLatestYear,
    data.inboundPrevYear
  );
  const outboundPeriod = formatYearPeriod(
    data.outboundLatestYear,
    data.outboundPrevYear
  );

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <InvestmentSection
        title={`Investasi Masuk ke ${displayCountryName}`}
        subtitle={`Tahun ${inboundPeriod} | Unit: ${data.unit}`}
        sourceLabel={data.source}
        visualMode={inboundVisualMode}
        onToggleVisualMode={() =>
          setInboundVisualMode((current) =>
            current === "table" ? "chart" : "table"
          )
        }
        tableDownloadHandler={inboundTableDownloadHandler}
        chartDownloadHandler={inboundChartDownloadHandler}
        tableContent={
          <TopMitraTable
            raw={inboundRaw}
            unitLabel={data.unit}
            downloadTitle={`Investasi Masuk ke ${displayCountryName}`}
            downloadFilename={`Investasi_Masuk_${displayCountryName.replace(/\s+/g, "_")}_${data.inboundLatestYear ?? "-"}`}
            downloadSource={data.source ?? undefined}
            downloadNotes={selectedCountryNote}
            onRegisterDownload={registerInboundTableDownload}
            emptyMessage={`Data belum tersedia untuk ${displayCountryName}.`}
            valueLabel="Nilai Investasi"
            totalLabel="Total investasi"
            changeLabel="Perubahan investasi YoY"
            highlightCountries={["INDONESIA"]}
            pinnedCountries={["INDONESIA"]}
            showShareDetail={false}
            displayZeroAsDash
            maximumFractionDigits={2}
            showLimitControl={false}
          />
        }
        chartContent={
          <TopCountryComparisonBarChart
            rows={data.inbound.map((item) => ({
              country: item.country,
              latestValue: item.latestValue ?? 0,
              prevValue: item.prevValue ?? 0,
              share: item.share
            }))}
            latestYear={data.inboundLatestYear}
            prevYear={data.inboundPrevYear}
            unitLabel={data.unit}
            filename={`Investasi_Masuk_${displayCountryName.replace(/\s+/g, "_")}_${data.inboundLatestYear ?? "-"}`}
            onRegisterDownload={registerInboundChartDownload}
          />
        }
        expandedTableContent={
          <TopMitraTable
            raw={inboundRaw}
            unitLabel={data.unit}
            expanded
            downloadTitle={`Investasi Masuk ke ${displayCountryName}`}
            downloadFilename={`Investasi_Masuk_${displayCountryName.replace(/\s+/g, "_")}_${data.inboundLatestYear ?? "-"}`}
            downloadSource={data.source ?? undefined}
            downloadNotes={selectedCountryNote}
            onRegisterDownload={registerInboundTableDownload}
            emptyMessage={`Data belum tersedia untuk ${displayCountryName}.`}
            valueLabel="Nilai Investasi"
            totalLabel="Total investasi"
            changeLabel="Perubahan investasi YoY"
            highlightCountries={["INDONESIA"]}
            pinnedCountries={["INDONESIA"]}
            showShareDetail={false}
            displayZeroAsDash
            maximumFractionDigits={2}
            showLimitControl={false}
          />
        }
        expandedChartContent={
          <TopCountryComparisonBarChart
            rows={data.inbound.map((item) => ({
              country: item.country,
              latestValue: item.latestValue ?? 0,
              prevValue: item.prevValue ?? 0,
              share: item.share
            }))}
            latestYear={data.inboundLatestYear}
            prevYear={data.inboundPrevYear}
            unitLabel={data.unit}
            height={560}
            filename={`Investasi_Masuk_${displayCountryName.replace(/\s+/g, "_")}_${data.inboundLatestYear ?? "-"}`}
            onRegisterDownload={registerInboundChartDownload}
          />
        }
      />

      <InvestmentSection
        title={`Investasi Keluar dari ${displayCountryName}`}
        subtitle={`Tahun ${outboundPeriod} | Unit: ${data.unit}`}
        sourceLabel={data.source}
        visualMode={outboundVisualMode}
        onToggleVisualMode={() =>
          setOutboundVisualMode((current) =>
            current === "table" ? "chart" : "table"
          )
        }
        tableDownloadHandler={outboundTableDownloadHandler}
        chartDownloadHandler={outboundChartDownloadHandler}
        tableContent={
          <TopMitraTable
            raw={outboundRaw}
            unitLabel={data.unit}
            downloadTitle={`Investasi Keluar dari ${displayCountryName}`}
            downloadFilename={`Investasi_Keluar_${displayCountryName.replace(/\s+/g, "_")}_${data.outboundLatestYear ?? "-"}`}
            downloadSource={data.source ?? undefined}
            downloadNotes={selectedCountryNote}
            onRegisterDownload={registerOutboundTableDownload}
            emptyMessage={`Data belum tersedia untuk ${displayCountryName}.`}
            valueLabel="Nilai Investasi"
            totalLabel="Total investasi"
            changeLabel="Perubahan investasi YoY"
            highlightCountries={["INDONESIA"]}
            pinnedCountries={["INDONESIA"]}
            showShareDetail={false}
            displayZeroAsDash
            maximumFractionDigits={2}
            showLimitControl={false}
          />
        }
        chartContent={
          <TopCountryComparisonBarChart
            rows={data.outbound.map((item) => ({
              country: item.country,
              latestValue: item.latestValue ?? 0,
              prevValue: item.prevValue ?? 0,
              share: item.share
            }))}
            latestYear={data.outboundLatestYear}
            prevYear={data.outboundPrevYear}
            unitLabel={data.unit}
            filename={`Investasi_Keluar_${displayCountryName.replace(/\s+/g, "_")}_${data.outboundLatestYear ?? "-"}`}
            onRegisterDownload={registerOutboundChartDownload}
          />
        }
        expandedTableContent={
          <TopMitraTable
            raw={outboundRaw}
            unitLabel={data.unit}
            expanded
            downloadTitle={`Investasi Keluar dari ${displayCountryName}`}
            downloadFilename={`Investasi_Keluar_${displayCountryName.replace(/\s+/g, "_")}_${data.outboundLatestYear ?? "-"}`}
            downloadSource={data.source ?? undefined}
            downloadNotes={selectedCountryNote}
            onRegisterDownload={registerOutboundTableDownload}
            emptyMessage={`Data belum tersedia untuk ${displayCountryName}.`}
            valueLabel="Nilai Investasi"
            totalLabel="Total investasi"
            changeLabel="Perubahan investasi YoY"
            highlightCountries={["INDONESIA"]}
            pinnedCountries={["INDONESIA"]}
            showShareDetail={false}
            displayZeroAsDash
            maximumFractionDigits={2}
            showLimitControl={false}
          />
        }
        expandedChartContent={
          <TopCountryComparisonBarChart
            rows={data.outbound.map((item) => ({
              country: item.country,
              latestValue: item.latestValue ?? 0,
              prevValue: item.prevValue ?? 0,
              share: item.share
            }))}
            latestYear={data.outboundLatestYear}
            prevYear={data.outboundPrevYear}
            unitLabel={data.unit}
            height={560}
            filename={`Investasi_Keluar_${displayCountryName.replace(/\s+/g, "_")}_${data.outboundLatestYear ?? "-"}`}
            onRegisterDownload={registerOutboundChartDownload}
          />
        }
      />
    </div>
  );
}
