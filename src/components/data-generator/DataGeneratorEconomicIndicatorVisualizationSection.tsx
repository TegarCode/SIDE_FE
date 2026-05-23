import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { CountryGroupedBarChart } from "@/components/ui/charts/CountryGroupedBarChart";
import { PairLineChart } from "@/components/ui/charts/PairLineChart";

type EconomicIndicatorItem = {
  negara?: string;
  kode_alpha3?: string;
  tahun?: number;
  nilai?: number;
  rank?: number;
};

type EconomicIndicatorResponse = {
  data?: Record<string, EconomicIndicatorItem[]>;
  meta?: {
    indicator_name?: string;
    years?: number[];
    order?: string;
    is_yoy?: string;
    sumber?: string;
    count?: number;
  };
};

type Props = {
  data: EconomicIndicatorResponse | null;
  loading: boolean;
};

type SeriesRow = {
  label: string;
  fullLabel: string;
  values: number[];
};

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function VisualizationCard({
  title,
  subtitle,
  source,
  downloaderRef,
  children,
  expandedContent
}: {
  title: string;
  subtitle: React.ReactNode;
  source: string;
  downloaderRef: React.MutableRefObject<(() => void) | null>;
  children: React.ReactNode;
  expandedContent: React.ReactNode;
}) {
  return (
    <ExpandableCard
      title={title}
      subtitle={subtitle}
      className="shadow-sm"
      modalSize="full"
      actions={
        <Button
          type="button"
          variant="outline"
          className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          onClick={() => downloaderRef.current?.()}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </Button>
      }
      expandedContent={
        <div className="space-y-3">
          {expandedContent}
          <p className="text-right text-[11px] text-slate-500">
            Sumber: {source}
          </p>
        </div>
      }
    >
      <div className="space-y-3">
        {children}
        <p className="text-right text-[11px] text-slate-500">
          Sumber: {source}
        </p>
      </div>
    </ExpandableCard>
  );
}

export function DataGeneratorEconomicIndicatorVisualizationSection({
  data,
  loading
}: Props) {
  const meta = data?.meta ?? {};
  const indicatorName = meta.indicator_name ?? "Indikator";
  const source = meta.sumber ?? "-";
  const datasetYears = React.useMemo(() => {
    const entries = Object.entries(data?.data ?? {})
      .map(([year, rows]) => ({
        year: Number(year),
        rows: Array.isArray(rows) ? rows : []
      }))
      .filter((item) => Number.isFinite(item.year))
      .sort((left, right) => left.year - right.year);
    return {
      all: entries.map((item) => item.year),
      available: entries
        .filter((item) => item.rows.length > 0)
        .map((item) => item.year)
    };
  }, [data?.data]);
  const years = React.useMemo(() => {
    if (datasetYears.available.length > 0) return datasetYears.available;
    if (datasetYears.all.length > 0) return datasetYears.all;
    return [...(meta.years ?? [])]
      .map(Number)
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
  }, [datasetYears, meta.years]);
  const latestAvailableYear = years.length > 0 ? years[years.length - 1] : null;

  const topSeries = React.useMemo<SeriesRow[]>(() => {
    const latestRows =
      latestAvailableYear != null
        ? (data?.data?.[String(latestAvailableYear)] ?? [])
        : [];
    const topCountries = [...latestRows]
      .sort((left, right) => {
        const leftRank =
          typeof left.rank === "number" ? left.rank : Number.MAX_SAFE_INTEGER;
        const rightRank =
          typeof right.rank === "number" ? right.rank : Number.MAX_SAFE_INTEGER;
        return leftRank - rightRank;
      })
      .slice(0, 5);

    return topCountries.map((item) => ({
      label: item.negara ?? "-",
      fullLabel: item.negara ?? "-",
      values: years.map((year) => {
        const matched = (data?.data?.[String(year)] ?? []).find(
          (row) => row.negara === item.negara
        );
        return asNumber(matched?.nilai);
      })
    }));
  }, [data?.data, latestAvailableYear, years]);

  const barSeries = React.useMemo(
    () => topSeries.map((item) => ({ label: item.label, values: item.values })),
    [topSeries]
  );
  const lineSeries = React.useMemo(
    () =>
      topSeries.map((item) => ({
        label: item.label,
        fullLabel: item.fullLabel,
        values: item.values
      })),
    [topSeries]
  );

  const subtitle = `Tahun ${years[0] ?? "-"}-${latestAvailableYear ?? "-"} | Total data: ${(meta.count ?? 0).toLocaleString("id-ID")} | Sumber: ${source}`;
  const barChartTitle = `Bar Chart Top 5 Negara/Entitas (${indicatorName})`;
  const lineChartTitle = `Line Chart Tren Top 5 Negara/Entitas (${indicatorName})`;

  const barDownloadRef = React.useRef<(() => void) | null>(null);
  const lineDownloadRef = React.useRef<(() => void) | null>(null);

  if (loading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="h-5 w-56 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-100" />
            <div className="mt-5 h-80 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || years.length === 0 || topSeries.length === 0) {
    return (
      <EmptyStatePanel
        title="Visualisasi indikator ekonomi belum tersedia"
        description="Atur filter indikator ekonomi lalu pilih Tampilan Visualisasi untuk memuat chart."
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <VisualizationCard
        title={lineChartTitle}
        subtitle={subtitle}
        source={source}
        downloaderRef={lineDownloadRef}
        expandedContent={
          <PairLineChart
            years={years}
            series={lineSeries}
            height={560}
            unit={indicatorName}
            maximumFractionDigits={3}
            filename="data_generator_economic_indicator_line"
            exportTitle={lineChartTitle}
            exportSubtitle={subtitle}
            exportFooter={`Sumber: ${source}`}
          />
        }
      >
        <PairLineChart
          years={years}
          series={lineSeries}
          height={360}
          unit={indicatorName}
          maximumFractionDigits={3}
          filename="data_generator_economic_indicator_line"
          onRegisterDownload={(handler) => {
            lineDownloadRef.current = handler;
          }}
          exportTitle={lineChartTitle}
          exportSubtitle={subtitle}
          exportFooter={`Sumber: ${source}`}
        />
      </VisualizationCard>
      <VisualizationCard
        title={barChartTitle}
        subtitle={subtitle}
        source={source}
        downloaderRef={barDownloadRef}
        expandedContent={
          <CountryGroupedBarChart
            years={years}
            series={barSeries}
            height={560}
            unit={indicatorName}
            maximumFractionDigits={3}
            filename="data_generator_economic_indicator_bar"
            exportTitle={barChartTitle}
            exportSubtitle={subtitle}
            exportFooter={`Sumber: ${source}`}
          />
        }
      >
        <CountryGroupedBarChart
          years={years}
          series={barSeries}
          height={360}
          unit={indicatorName}
          maximumFractionDigits={3}
          filename="data_generator_economic_indicator_bar"
          onRegisterDownload={(handler) => {
            barDownloadRef.current = handler;
          }}
          exportTitle={barChartTitle}
          exportSubtitle={subtitle}
          exportFooter={`Sumber: ${source}`}
        />
      </VisualizationCard>
    </div>
  );
}
