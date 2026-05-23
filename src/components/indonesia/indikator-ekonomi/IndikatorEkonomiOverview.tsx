import React from "react";
import {
  ArrowDownTrayIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import ReactECharts from "echarts-for-react";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { MapHeatLayer } from "@/components/ui/MapHeatLayer";
import { TopMitraTable } from "@/components/ui/TopMitraTable";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import { MapSkeleton } from "@/components/ui/skeletons/MapSkeleton";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type { EconomicIndicatorOverviewData } from "@/type/indonesiaIndikatorEkonomi";

type EconomicIndicatorOverviewProps = {
  overview: EconomicIndicatorOverviewData | null;
  loading: boolean;
  error: string | null;
};

type IndicatorCountryItem = {
  alpha2: string | null;
  alpha3: string | null;
  country: string;
  values: Record<number, number>;
};

type SortDirection = "asc" | "desc";

const TREND_PALETTE = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#7c3aed",
  "#0ea5e9"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseItems(
  items: Array<Record<string, unknown>>
): IndicatorCountryItem[] {
  return items
    .map((item) => {
      const years = Array.isArray(item.years) ? item.years : [];
      const values = years.reduce<Record<number, number>>(
        (accumulator, yearItem) => {
          if (!isRecord(yearItem)) return accumulator;
          const year = Number(yearItem.Tahun ?? yearItem.year);
          const value = Number(yearItem.Nilai ?? yearItem.value);
          if (Number.isFinite(year) && Number.isFinite(value))
            accumulator[year] = value;
          return accumulator;
        },
        {}
      );

      return {
        alpha2: typeof item.kode_alpha2 === "string" ? item.kode_alpha2 : null,
        alpha3: typeof item.kode_alpha3 === "string" ? item.kode_alpha3 : null,
        country:
          (typeof item.negara === "string" && item.negara.trim()) ||
          (typeof item.country === "string" && item.country.trim()) ||
          (typeof item.kode_alpha3 === "string" && item.kode_alpha3.trim()) ||
          "-",
        values
      };
    })
    .filter(
      (item) => item.country !== "-" && Object.keys(item.values).length > 0
    );
}

function buildTopMitraRaw(items: IndicatorCountryItem[]) {
  return {
    data: {
      items: items.map((item) => ({
        negara: item.country,
        kode_alpha2: item.alpha2,
        kode_alpha3: item.alpha3,
        nilai_perdagangan: item.values,
        proporsi: {}
      }))
    }
  };
}

function buildMapData(items: IndicatorCountryItem[]) {
  return items.map((item) => ({
    negara: item.country,
    kode_alpha2: item.alpha2,
    kode_alpha3: item.alpha3,
    nilai_perdagangan: item.values,
    proporsi: {}
  }));
}

function buildTopTrendSeries(
  items: IndicatorCountryItem[],
  yearsAsc: number[],
  order: SortDirection
) {
  const latestYear = yearsAsc[yearsAsc.length - 1] ?? null;
  const candidates = items.filter((item) => {
    if (latestYear == null) return false;
    const latestValue = item.values[latestYear];
    return Number.isFinite(latestValue) && latestValue !== 0;
  });

  const sorted = [...candidates].sort((left, right) => {
    const leftValue =
      latestYear != null
        ? (left.values[latestYear] ?? Number.NEGATIVE_INFINITY)
        : Number.NEGATIVE_INFINITY;
    const rightValue =
      latestYear != null
        ? (right.values[latestYear] ?? Number.NEGATIVE_INFINITY)
        : Number.NEGATIVE_INFINITY;
    return order === "asc" ? leftValue - rightValue : rightValue - leftValue;
  });

  const topFive = sorted.slice(0, 5);
  const indonesia = items.find(
    (item) => item.country.toUpperCase() === "INDONESIA"
  );
  const needsIndonesia =
    indonesia &&
    latestYear != null &&
    (indonesia.values[latestYear] ?? 0) !== 0 &&
    !topFive.some((item) => item.country.toUpperCase() === "INDONESIA");

  return [...topFive, ...(needsIndonesia ? [indonesia] : [])].map((item) => ({
    label: item.country,
    values: yearsAsc.map((year) => item.values[year] ?? 0)
  }));
}

function EconomicIndicatorTrendChart({
  years,
  series,
  height
}: {
  years: number[];
  series: Array<{ label: string; values: number[] }>;
  height: number;
}) {
  const option = React.useMemo(
    () => ({
      color: TREND_PALETTE,
      animation: true,
      animationDuration: 700,
      animationEasing: "cubicOut",
      grid: { top: 40, right: 16, bottom: 48, left: 56, containLabel: true },
      legend: {
        top: 4,
        type: "scroll",
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { color: "#334155", fontSize: 11 }
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line" },
        backgroundColor: "rgba(15,23,42,0.96)",
        borderWidth: 0,
        textStyle: { color: "#fff", fontSize: 11 },
        formatter: (
          params: Array<{
            axisValueLabel?: string;
            color?: string;
            seriesName?: string;
            data?: number;
          }>
        ) => {
          const title = params?.[0]?.axisValueLabel ?? "-";
          const lines = params
            .map((item) => {
              const raw = Number(item.data ?? 0);
              const value =
                raw === 0
                  ? "-"
                  : raw.toLocaleString("id-ID", { maximumFractionDigits: 2 });
              return `<span style="display:inline-block;margin-right:6px;width:8px;height:8px;border-radius:999px;background:${item.color ?? "#fff"}"></span>${item.seriesName ?? "-"}: ${value}`;
            })
            .join("<br/>");

          return `<div><div style="font-weight:600;margin-bottom:4px">${title}</div>${lines}</div>`;
        }
      },
      xAxis: {
        type: "category",
        data: years,
        boundaryGap: false,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisLabel: { color: "#475569", fontSize: 10 }
      },
      yAxis: {
        type: "value",
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: "#e2e8f0" } },
        axisLabel: {
          color: "#475569",
          fontSize: 10,
          formatter: (value: number) =>
            value === 0
              ? "-"
              : value.toLocaleString("id-ID", { maximumFractionDigits: 0 })
        }
      },
      series: series.map((item, index) => ({
        name: item.label,
        type: "line",
        smooth: true,
        showSymbol: false,
        symbolSize: 6,
        lineStyle: {
          width: 2.5,
          color: TREND_PALETTE[index % TREND_PALETTE.length]
        },
        areaStyle: {
          opacity: 0.08
        },
        emphasis: {
          focus: "series"
        },
        data: item.values
      }))
    }),
    [series, years]
  );

  if (!years.length || !series.length) {
    return (
      <div className="flex h-full min-h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-sm text-slate-500">
        Data tren indikator ekonomi belum tersedia.
      </div>
    );
  }

  return (
    <ReactECharts
      option={option}
      style={{ width: "100%", height }}
      notMerge
      lazyUpdate
    />
  );
}

function buildFixedBuckets(
  items: IndicatorCountryItem[],
  latestYear: number | null
) {
  if (latestYear == null) return null;
  const values = items
    .map((item) => item.values[latestYear])
    .filter((value): value is number => Number.isFinite(value) && value > 0)
    .sort((left, right) => left - right);

  if (!values.length) return null;

  const min = values[0];
  const max = values[values.length - 1];
  const step = Math.max((max - min) / 5, 1);
  const colors = ["#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#2563eb"];

  return Array.from({ length: 5 }).map((_, index) => {
    const bucketMin = index === 0 ? min : min + step * index;
    const bucketMax = index === 4 ? undefined : min + step * (index + 1);
    const from = Math.round(bucketMin);
    const to = bucketMax == null ? undefined : Math.round(bucketMax);

    return {
      min: bucketMin,
      max: bucketMax,
      color: colors[index],
      label: to == null ? `>= ${from}` : `${from} - ${to}`
    };
  });
}

function getPeriodLabel(yearsAsc: number[]) {
  if (!yearsAsc.length) return "-";
  return yearsAsc[0] === yearsAsc[yearsAsc.length - 1]
    ? String(yearsAsc[0])
    : `${yearsAsc[0]}-${yearsAsc[yearsAsc.length - 1]}`;
}

function buildTooltipContent(keterangan: string | null) {
  if (!keterangan) return null;
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-slate-800">Keterangan</p>
      <p>{keterangan}</p>
    </div>
  );
}

function buildTitle(title: string, keterangan: string | null) {
  const tooltipContent = buildTooltipContent(keterangan);
  return (
    <span className="inline-flex items-center gap-2">
      <span>{title}</span>
      {tooltipContent ? (
        <HoverInfoTooltip content={tooltipContent}>
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <InformationCircleIcon className="h-3.5 w-3.5" />
          </span>
        </HoverInfoTooltip>
      ) : null}
    </span>
  );
}

export function IndikatorEkonomiOverview({
  overview,
  loading,
  error
}: EconomicIndicatorOverviewProps) {
  const [sortColumnLabel, setSortColumnLabel] = React.useState("tahun terbaru");
  const [downloadHandler, setDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const downloadHandlerRef = React.useRef<(() => void) | null>(null);
  const items = React.useMemo(
    () => parseItems(overview?.items ?? []),
    [overview?.items]
  );
  const meta = overview?.meta ?? {};
  const yearsAsc = React.useMemo(() => {
    const all = new Set<number>();
    items.forEach((item) => {
      Object.keys(item.values).forEach((year) => {
        const numericYear = Number(year);
        if (Number.isFinite(numericYear)) all.add(numericYear);
      });
    });
    return Array.from(all).sort((left, right) => left - right);
  }, [items]);
  const periodLabel = React.useMemo(() => getPeriodLabel(yearsAsc), [yearsAsc]);
  const sourceLabel = typeof meta.sumber === "string" ? meta.sumber : null;
  const indicatorName =
    typeof meta.indicator_name === "string"
      ? meta.indicator_name
      : "Indikator Ekonomi";
  const keterangan =
    typeof meta.keterangan === "string" ? meta.keterangan : null;
  const order = meta.order === "asc" ? "asc" : "desc";
  const isYoy = meta.is_yoy === true;
  const topMitraRaw = React.useMemo(() => buildTopMitraRaw(items), [items]);
  const mapData = React.useMemo(() => buildMapData(items), [items]);
  const trendSeries = React.useMemo(
    () => buildTopTrendSeries(items, yearsAsc, order),
    [items, order, yearsAsc]
  );
  const latestYear = yearsAsc[yearsAsc.length - 1] ?? null;
  const mapBuckets = React.useMemo(
    () => buildFixedBuckets(items, latestYear),
    [items, latestYear]
  );
  const indonesiaRank = React.useMemo(() => {
    if (latestYear == null) return null;
    const sorted = [...items].sort((left, right) => {
      const leftValue = left.values[latestYear] ?? Number.NEGATIVE_INFINITY;
      const rightValue = right.values[latestYear] ?? Number.NEGATIVE_INFINITY;
      return order === "asc" ? leftValue - rightValue : rightValue - leftValue;
    });
    const index = sorted.findIndex(
      (item) => item.country.toUpperCase() === "INDONESIA"
    );
    return index >= 0 ? index + 1 : null;
  }, [items, latestYear, order]);
  const handleRegisterDownload = React.useCallback(
    (handler: (() => void) | null) => {
      if (downloadHandlerRef.current === handler) return;
      downloadHandlerRef.current = handler;
      setDownloadHandler((current) =>
        current === handler ? current : handler
      );
    },
    []
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <section className="grid items-stretch gap-4 xl:grid-cols-[1.8fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold tracking-tight text-slate-900">
              Peta nilai rata-rata
            </h3>
            <div className="mt-4">
              <MapSkeleton />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold tracking-tight text-slate-900">
              Top Negara/Entitas
            </h3>
            <div className="mt-4">
              <TableSkeleton rows={8} />
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold tracking-tight text-slate-900">
            Tren 5 Tahun
          </h3>
          <div className="mt-4">
            <ChartSkeleton />
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <FilterFallbackCard
        title="Data indikator ekonomi gagal dimuat"
        body={error}
      />
    );
  }

  if (!items.length || !yearsAsc.length) {
    return (
      <FilterFallbackCard
        title="Data indikator ekonomi belum tersedia"
        body="Data indikator ekonomi belum tersedia untuk filter aktif."
      />
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid items-stretch gap-4 xl:grid-cols-[1.8fr_1fr]">
        <ExpandableCard
          title={buildTitle(
            `Peta nilai rata-rata - ${indicatorName}`,
            keterangan
          )}
          subtitle={`${periodLabel} | Sumber: ${sourceLabel ?? "-"}`}
          className="min-w-0 h-full"
          modalSize="full"
          expandedContent={
            <MapHeatLayer
              className="h-[72vh] w-full"
              data={mapData}
              title={`Peta nilai rata-rata - ${indicatorName}`}
              unitLabel="Nilai"
              currencyPrefix="Nilai"
              geojsonUrl="/assets/world-countries.geojson"
              hideBalance
              seriesAccessors={{ value: "nilai_perdagangan" }}
              noDataColor="#f1f5f9"
              customBuckets={mapBuckets}
            />
          }
        >
          <div className="flex h-full flex-col">
            <MapHeatLayer
              className="h-56 w-full sm:h-72 lg:h-120"
              data={mapData}
              title={`Peta nilai rata-rata - ${indicatorName}`}
              unitLabel="Nilai"
              currencyPrefix="Nilai"
              geojsonUrl="/assets/world-countries.geojson"
              hideBalance
              seriesAccessors={{ value: "nilai_perdagangan" }}
              noDataColor="#f1f5f9"
              customBuckets={mapBuckets}
            />
            {sourceLabel ? (
              <p className="mt-auto text-right text-[11px] text-slate-500">
                Sumber: {sourceLabel}
              </p>
            ) : null}
          </div>
        </ExpandableCard>

        <ExpandableCard
          title={buildTitle(
            `Top Negara/Entitas - ${indicatorName}`,
            keterangan
          )}
          subtitle={`${periodLabel} | Sorting berdasarkan kolom ${sortColumnLabel}${indonesiaRank ? ` | Rank Indonesia: ${indonesiaRank}` : ""}`}
          className="min-w-0 h-full min-h-115"
          modalSize="full"
          actions={
            <IconTooltip label="Unduh Excel">
              <span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadHandler?.()}
                  disabled={!downloadHandler}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600"
                  aria-label="Unduh Excel Top Negara Entitas"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </Button>
              </span>
            </IconTooltip>
          }
          expandedContent={
            <TopMitraTable
              raw={topMitraRaw}
              unitLabel="Nilai"
              expanded
              onSortColumnChange={setSortColumnLabel}
              onRegisterDownload={handleRegisterDownload}
              downloadTitle={`Top Negara Entitas ${indicatorName}`}
              downloadFilename={`Top_Negara_Entitas_${indicatorName.replace(/\s+/g, "_")}`}
              downloadSource={sourceLabel ?? undefined}
              emptyMessage="Data top negara/entitas belum tersedia."
              valueLabel="Nilai indikator"
              shareLabel="Proporsi"
              shareContextLabel="dari total negara"
              totalLabel="Total nilai"
              changeLabel="Perubahan Nilai YoY"
              showBalanceDetail={false}
              maximumFractionDigits={2}
              highlightCountries={["INDONESIA"]}
              pinnedCountries={["INDONESIA"]}
              showShareDetail={false}
              showChangeDetail={!isYoy}
              defaultSortDirection={order}
              displayZeroAsDash
            />
          }
        >
          <div className="flex h-full flex-col">
            <TopMitraTable
              raw={topMitraRaw}
              unitLabel="Nilai"
              onSortColumnChange={setSortColumnLabel}
              onRegisterDownload={handleRegisterDownload}
              downloadTitle={`Top Negara Entitas ${indicatorName}`}
              downloadFilename={`Top_Negara_Entitas_${indicatorName.replace(/\s+/g, "_")}`}
              downloadSource={sourceLabel ?? undefined}
              emptyMessage="Data top negara/entitas belum tersedia."
              valueLabel="Nilai indikator"
              shareLabel="Proporsi"
              shareContextLabel="dari total negara"
              totalLabel="Total nilai"
              changeLabel="Perubahan Nilai YoY"
              showBalanceDetail={false}
              maximumFractionDigits={2}
              highlightCountries={["INDONESIA"]}
              pinnedCountries={["INDONESIA"]}
              showShareDetail={false}
              showChangeDetail={!isYoy}
              defaultSortDirection={order}
              displayZeroAsDash
            />
            {sourceLabel ? (
              <p className="mt-auto text-right text-[11px] text-slate-500">
                Sumber: {sourceLabel}
              </p>
            ) : null}
          </div>
        </ExpandableCard>
      </section>

      <ExpandableCard
        title={buildTitle(
          `Tren 5 Tahun - Top 5 Negara/Entitas (${indicatorName})`,
          keterangan
        )}
        subtitle={`${periodLabel} | Sumber: ${sourceLabel ?? "-"}`}
        className="min-w-0 min-h-144"
        modalSize="full"
        contentClassName="flex h-full flex-col gap-3"
        expandedContent={
          <EconomicIndicatorTrendChart
            years={yearsAsc}
            series={trendSeries}
            height={720}
          />
        }
      >
        <div className="min-h-0 flex-1">
          <EconomicIndicatorTrendChart
            years={yearsAsc}
            series={trendSeries}
            height={480}
          />
        </div>
      </ExpandableCard>
    </div>
  );
}
