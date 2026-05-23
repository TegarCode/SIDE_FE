import React from "react";
import {
  ArrowDownTrayIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TradeAnnualAreaChart } from "@/components/ui/charts/TradeAnnualAreaChart";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import type {
  MitraMultiTourismData,
  MitraMultiTourismTimeseriesPoint
} from "@/type/mitra";
import {
  formatExportCountryList,
  formatExportRouteLine
} from "@/utils/chartExport";

type MitraTourismTrendSectionProps = {
  data: MitraMultiTourismData | null | undefined;
  loading: boolean;
};

type MetricKey = "inbound" | "outbound";

type MetricConfig = {
  key: MetricKey;
  title: string;
  color: string;
};

const METRICS: MetricConfig[] = [
  { key: "inbound", title: "Tren Wisatawan Masuk", color: "#0f766e" },
  { key: "outbound", title: "Tren Wisatawan Keluar", color: "#b91c1c" }
];

function resolveCountryNames(codes: string[], names: Record<string, string>) {
  return codes.map((code) => names[code] ?? code).filter(Boolean);
}

function formatCountryList(names: string[]) {
  return formatExportCountryList(names);
}

function formatValue(value: number | null | undefined) {
  if (value == null || value === 0) return "-";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
    value
  );
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function getMetricValue(
  point: MitraMultiTourismTimeseriesPoint | undefined,
  key: MetricKey
) {
  if (!point) return null;
  return key === "inbound" ? point.inboundCount : point.outboundCount;
}

function buildSeries(
  timeseries: MitraMultiTourismTimeseriesPoint[],
  key: MetricKey
) {
  return timeseries.map((item) => ({
    year: item.year,
    primary: getMetricValue(item, key),
    secondary: null
  }));
}

function CountryListTooltip({
  label,
  countries
}: {
  label: string;
  countries: string[];
}) {
  if (countries.length === 0) {
    return <span className="font-medium text-slate-700">{label}</span>;
  }

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

function MetricHighlight({
  year,
  value,
  prevYear,
  prevValue
}: {
  year: number | null;
  value: number | null;
  prevYear: number | null;
  prevValue: number | null;
}) {
  const change =
    value != null && prevValue != null && prevValue !== 0
      ? ((value - prevValue) / Math.abs(prevValue)) * 100
      : null;
  const absoluteChange =
    value != null && prevValue != null ? value - prevValue : null;
  const isPositive = (change ?? 0) >= 0;
  const chipClassName =
    change == null
      ? "bg-slate-100 text-slate-600 ring-slate-200"
      : isPositive
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : "bg-rose-50 text-rose-700 ring-rose-200";

  return (
    <div className="flex flex-col items-end text-right">
      <div className="text-lg font-semibold leading-none tracking-tight text-slate-900">
        {formatValue(value)}
      </div>
      <div
        className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ring-1 ${chipClassName}`}
      >
        {change == null ? (
          "-"
        ) : (
          <>
            <span>
              {absoluteChange == null || absoluteChange === 0
                ? "-"
                : `${absoluteChange > 0 ? "+" : ""}${formatValue(absoluteChange)}`}
            </span>
            <span className="opacity-40">|</span>
            <span>{`${change >= 0 ? "▲" : "▼"}${formatPercent(Math.abs(change))}%`}</span>
          </>
        )}
      </div>
      <div className="mt-1 text-[10px] text-slate-500">
        {year != null ? `${year}` : "Tahun terbaru"}
        {prevYear != null ? ` dari ${prevYear}` : ""}
      </div>
    </div>
  );
}

function TrendCard({
  metric,
  timeseries,
  latestPoint,
  prevPoint,
  sourceName,
  exportMetaLines,
  loading
}: {
  metric: MetricConfig;
  timeseries: MitraMultiTourismTimeseriesPoint[];
  latestPoint: MitraMultiTourismTimeseriesPoint | undefined;
  prevPoint: MitraMultiTourismTimeseriesPoint | undefined;
  sourceName: string;
  exportMetaLines: string[];
  loading: boolean;
}) {
  const [downloadHandler, setDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const handleRegisterDownload = React.useCallback(
    (handler: (() => void) | null) => {
      setDownloadHandler(() => handler);
    },
    []
  );
  const chartData = React.useMemo(
    () => buildSeries(timeseries, metric.key),
    [metric.key, timeseries]
  );
  const latestValue = getMetricValue(latestPoint, metric.key);
  const prevValue = getMetricValue(prevPoint, metric.key);
  const firstYear = timeseries[0]?.year ?? null;
  const lastYear = timeseries[timeseries.length - 1]?.year ?? null;
  const subtitle =
    firstYear != null && lastYear != null && firstYear !== lastYear
      ? `Tahun ${firstYear}-${lastYear} | Unit: Orang`
      : `Tahun ${lastYear ?? "-"} | Unit: Orang`;
  const filename = metric.title.toLowerCase().replace(/[^\w]+/g, "_");

  const content = loading ? (
    <ChartSkeleton className="border-0 bg-transparent p-0 shadow-none" />
  ) : (
    <div className="space-y-2">
      <TradeAnnualAreaChart
        data={chartData}
        primaryLabel={metric.title}
        secondaryLabel=""
        unit="Orang"
        height={250}
        primaryColor={metric.color}
        hideLegend
        filename={filename}
        onRegisterDownload={handleRegisterDownload}
        exportTitle={metric.title}
        exportSubtitle={subtitle}
        exportMetaLines={exportMetaLines}
        exportFooter={sourceName}
      />
      <div className="text-right text-[11px] italic text-slate-500">
        {sourceName}
      </div>
    </div>
  );

  const expandedContent = loading ? (
    <ChartSkeleton className="border-0 bg-transparent p-0 shadow-none" />
  ) : (
    <div className="space-y-3">
      <TradeAnnualAreaChart
        data={chartData}
        primaryLabel={metric.title}
        secondaryLabel=""
        unit="Orang"
        height={430}
        primaryColor={metric.color}
        hideLegend
        filename={filename}
        onRegisterDownload={handleRegisterDownload}
        exportTitle={metric.title}
        exportSubtitle={subtitle}
        exportMetaLines={exportMetaLines}
        exportFooter={sourceName}
      />
      <div className="text-right text-xs italic text-slate-500">
        {sourceName}
      </div>
    </div>
  );

  return (
    <ExpandableCard
      title={metric.title}
      subtitle={subtitle}
      className="p-3"
      contentClassName="space-y-3"
      expandActions={
        <IconTooltip label="Unduh Tren">
          <span>
            <Button
              type="button"
              className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              aria-label={`Unduh ${metric.title}`}
              onClick={() => downloadHandler?.()}
              disabled={!downloadHandler}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </span>
        </IconTooltip>
      }
      actions={
        <MetricHighlight
          year={latestPoint?.year ?? null}
          value={latestValue}
          prevYear={prevPoint?.year ?? null}
          prevValue={prevValue}
        />
      }
      expandedContent={expandedContent}
    >
      {content}
    </ExpandableCard>
  );
}

export function MitraTourismTrendSection({
  data,
  loading
}: MitraTourismTrendSectionProps) {
  const origins = React.useMemo(
    () => (data ? resolveCountryNames(data.origins, data.originNames) : []),
    [data]
  );
  const destinations = React.useMemo(
    () =>
      data ? resolveCountryNames(data.destinations, data.destinationNames) : [],
    [data]
  );
  const timeseries = data?.timeseries ?? [];
  const latestPoint = timeseries[timeseries.length - 1];
  const prevPoint =
    timeseries.length > 1 ? timeseries[timeseries.length - 2] : undefined;
  const exportMetaLines = React.useMemo(
    () => [formatExportRouteLine(origins, destinations)],
    [destinations, origins]
  );

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Grafik Tren Tahunan
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Perbandingan tren wisatawan masuk dan keluar per tahun berdasarkan
          filter negara asal dan tujuan.
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="text-slate-500">Asal</span>
          <CountryListTooltip label="Negara Asal" countries={origins} />
          <span className="text-slate-500">Tujuan</span>
          <CountryListTooltip label="Negara Tujuan" countries={destinations} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {METRICS.map((metric) => (
          <TrendCard
            key={metric.key}
            metric={metric}
            timeseries={timeseries}
            latestPoint={latestPoint}
            prevPoint={prevPoint}
            sourceName={data?.sourceName ?? "-"}
            exportMetaLines={exportMetaLines}
            loading={loading && !data}
          />
        ))}
      </div>
    </section>
  );
}
