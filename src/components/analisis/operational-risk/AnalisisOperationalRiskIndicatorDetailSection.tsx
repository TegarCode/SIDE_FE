import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { TradeAnnualAreaChart } from "@/components/ui/charts/TradeAnnualAreaChart";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import type { AnalisisOperationalRiskResult } from "@/type/analisis";

type Props = {
  data: AnalisisOperationalRiskResult | null;
  loading: boolean;
};

const CHART_COLORS = [
  "#2563eb",
  "#0f766e",
  "#b45309",
  "#7c3aed",
  "#be123c",
  "#0891b2",
  "#65a30d"
];

function formatNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function IndicatorMetricHighlight({
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
        {formatNumber(value)}
      </div>
      <div
        className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ring-1 ${chipClassName}`}
      >
        {change == null ? (
          "-"
        ) : (
          <>
            <span>{`${absoluteChange != null && absoluteChange > 0 ? "+" : ""}${formatNumber(absoluteChange)}`}</span>
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

function IndicatorTrendCard({
  indicator,
  series,
  color,
  sourceName,
  filename
}: {
  indicator: string;
  series: Array<{ year: number; primary: number | null; secondary: null }>;
  color: string;
  sourceName: string;
  filename: string;
}) {
  const [inlineDownloadHandler, setInlineDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const [expandedDownloadHandler, setExpandedDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const registerInlineDownloadHandler = React.useCallback(
    (handler: (() => void) | null) => {
      setInlineDownloadHandler(() => handler);
    },
    []
  );
  const registerExpandedDownloadHandler = React.useCallback(
    (handler: (() => void) | null) => {
      setExpandedDownloadHandler(() => handler);
    },
    []
  );
  const activeDownloadHandler =
    expandedDownloadHandler ?? inlineDownloadHandler;
  const chartSubtitle =
    series.length > 1
      ? `Tahun ${series[0]?.year ?? "-"}-${series[series.length - 1]?.year ?? "-"} | Unit: Skor`
      : `Tahun ${series[0]?.year ?? "-"} | Unit: Skor`;
  const latestPoint = series[series.length - 1];
  const previousPoint = series.length > 1 ? series[series.length - 2] : null;

  return (
    <ExpandableCard
      title={indicator}
      subtitle={chartSubtitle}
      modalSize="xl"
      expandActions={
        <IconTooltip label="Unduh PNG">
          <span>
            <Button
              type="button"
              className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              aria-label={`Unduh ${indicator}`}
              onClick={() => activeDownloadHandler?.()}
              disabled={!activeDownloadHandler}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </span>
        </IconTooltip>
      }
      actions={
        <IndicatorMetricHighlight
          year={latestPoint?.year ?? null}
          value={latestPoint?.primary ?? null}
          prevYear={previousPoint?.year ?? null}
          prevValue={previousPoint?.primary ?? null}
        />
      }
      expandedContent={
        <div className="space-y-3">
          <TradeAnnualAreaChart
            data={series}
            primaryLabel="Skor"
            secondaryLabel=""
            unit="Skor"
            height={430}
            primaryColor={color}
            hideLegend
            filename={filename}
            onRegisterDownload={registerExpandedDownloadHandler}
            exportTitle={indicator}
            exportSubtitle={chartSubtitle}
            exportFooter={sourceName}
          />
          <div className="text-right text-xs italic text-slate-500">
            {sourceName}
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <TradeAnnualAreaChart
          data={series}
          primaryLabel="Skor"
          secondaryLabel=""
          unit="Skor"
          height={280}
          primaryColor={color}
          hideLegend
          filename={filename}
          onRegisterDownload={registerInlineDownloadHandler}
          exportTitle={indicator}
          exportSubtitle={chartSubtitle}
          exportFooter={sourceName}
        />
        <div className="text-right text-[11px] italic text-slate-500">
          {sourceName}
        </div>
      </div>
    </ExpandableCard>
  );
}

export function AnalisisOperationalRiskIndicatorDetailSection({
  data,
  loading
}: Props) {
  const selectedCountryName = data?.meta.selectedCountry.name ?? "-";
  const sourceName = data?.meta.sourceName ?? "-";
  const rows = data?.breakdownRows ?? [];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Detail Nilai Per Indikator Risiko Operasional {selectedCountryName}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan nilai terbaru dan tren 5 tahun terakhir untuk tiap indikator
          (berdasarkan negara terpilih).
        </p>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <ChartSkeleton key={index} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyStatePanel
          title="Detail indikator belum tersedia"
          description="Belum ada data detail indikator operational risk untuk negara yang dipilih."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {rows.map((row, index) => {
            const series = Object.keys(row.scores)
              .map((year) => Number(year))
              .filter((year) => Number.isFinite(year))
              .sort((a, b) => a - b)
              .map((year) => ({
                year,
                primary: row.scores[year] ?? null,
                secondary: null
              }));

            const color = CHART_COLORS[index % CHART_COLORS.length];
            const filename = `Detail_Risiko_Operasional_${selectedCountryName.replace(/[^\w]+/g, "_")}_${row.indicator.replace(/[^\w]+/g, "_")}`;

            return (
              <IndicatorTrendCard
                key={`${row.indicatorId ?? row.indicator}-${index}`}
                indicator={row.indicator}
                series={series}
                color={color}
                sourceName={sourceName}
                filename={filename}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
