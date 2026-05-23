import React from "react";
import ReactECharts from "echarts-for-react";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { downloadComposedPng } from "@/utils/downloadComposedPng";

type SeriesItem = {
  label: string;
  fullLabel: string;
  values: number[];
};

type CustomLegendItem = {
  label: string;
  color: string;
};

type Props = {
  years: number[];
  series: SeriesItem[];
  categories?: string[];
  tooltipCategories?: string[];
  tooltipTitleFormatter?: (args: {
    seriesName: string;
    currentLabel: string;
    dataIndex: number;
    fullLabel: string;
  }) => string;
  previousValueResolver?: (args: {
    seriesName: string;
    currentLabel: string;
    dataIndex: number;
    fullLabel: string;
  }) => { label: string; value: number | null } | null;
  itemColorFormatter?: (args: {
    seriesName: string;
    dataIndex: number;
    fullLabel: string;
  }) => string | undefined;
  customLegendItems?: CustomLegendItem[];
  height?: number;
  unit?: string;
  filename?: string;
  onRegisterDownload?: (handler: (() => void) | null) => void;
  exportTitle?: string;
  exportSubtitle?: string;
  exportFooter?: string;
};

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#0ea5e9",
  "#475569"
];

function normalizeLegendLabel(value: string) {
  return value
    .split(" | ")[0]
    .split(" • ")[0]
    .split(" â€¢ ")[0]
    .split(" Ã¢â‚¬Â¢ ")[0]
    .split("\n")[0]
    .trim();
}

function formatNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  return value.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function buildDelta(current: number, previous: number | null) {
  if (previous == null || !Number.isFinite(previous)) {
    return { absolute: "-", percent: "-", color: "#E2E8F0" };
  }
  const absolute = current - previous;
  const percent = previous !== 0 ? (absolute / Math.abs(previous)) * 100 : null;
  const positive = absolute >= 0;
  return {
    absolute: `${positive ? "+" : "-"}${formatNumber(Math.abs(absolute))}`,
    percent:
      percent == null || !Number.isFinite(percent)
        ? "-"
        : `${positive ? "+" : "-"}${Math.abs(percent).toFixed(2)}%`,
    color: positive ? "#86efac" : "#fca5a5"
  };
}

export function PairStackedBarChart({
  years,
  series,
  categories,
  tooltipCategories,
  tooltipTitleFormatter,
  previousValueResolver,
  itemColorFormatter,
  customLegendItems,
  height = 380,
  unit = "US$",
  filename = "pair-stacked-bar-chart",
  onRegisterDownload,
  exportTitle,
  exportSubtitle,
  exportFooter
}: Props) {
  const chartRef = React.useRef<ReactECharts | null>(null);
  const [hiddenLegendLabels, setHiddenLegendLabels] = React.useState<string[]>(
    []
  );
  const seriesMeta = React.useMemo(
    () => new Map(series.map((item) => [item.label, item])),
    [series]
  );
  const xLabels = React.useMemo(
    () =>
      categories && categories.length > 0 ? categories : years.map(String),
    [categories, years]
  );
  const hoverLabels = React.useMemo(
    () =>
      tooltipCategories && tooltipCategories.length === xLabels.length
        ? tooltipCategories
        : xLabels,
    [tooltipCategories, xLabels]
  );
  const useCategoryComparison = Boolean(categories && categories.length > 0);
  const hiddenLegendSet = React.useMemo(
    () => new Set(hiddenLegendLabels),
    [hiddenLegendLabels]
  );

  React.useEffect(() => {
    if (!customLegendItems?.length) {
      if (hiddenLegendLabels.length) setHiddenLegendLabels([]);
      return;
    }

    setHiddenLegendLabels((current) =>
      current.filter((label) =>
        customLegendItems.some((item) => item.label === label)
      )
    );
  }, [customLegendItems, hiddenLegendLabels.length]);

  const option = React.useMemo(
    () => ({
      color: COLORS,
      tooltip: {
        trigger: "item",
        appendToBody: true,
        backgroundColor: "rgba(15,23,42,0.95)",
        borderWidth: 0,
        textStyle: { color: "#E2E8F0" },
        formatter: (params: {
          dataIndex?: number;
          seriesName?: string;
          value?: number;
          name?: string;
        }) => {
          const meta = seriesMeta.get(params.seriesName ?? "");
          const current = Number(params.value ?? 0);
          const currentLabel =
            typeof params.dataIndex === "number" && params.dataIndex >= 0
              ? String(hoverLabels[params.dataIndex] ?? params.name ?? "-")
              : String(params.name ?? "-");
          const resolvedPrevious =
            typeof params.dataIndex === "number" &&
            params.dataIndex >= 0 &&
            previousValueResolver
              ? previousValueResolver({
                  seriesName: params.seriesName ?? "-",
                  currentLabel,
                  dataIndex: params.dataIndex,
                  fullLabel: meta?.fullLabel ?? params.seriesName ?? "-"
                })
              : null;
          const previous =
            resolvedPrevious?.value ??
            (typeof params.dataIndex === "number" && params.dataIndex > 0
              ? Number(meta?.values[params.dataIndex - 1] ?? 0)
              : null);
          const delta = buildDelta(current, previous);
          const previousYear =
            typeof params.dataIndex === "number" && params.dataIndex > 0
              ? String(years[params.dataIndex - 1] ?? "-")
              : "-";
          const previousLabel =
            resolvedPrevious?.label ??
            (typeof params.dataIndex === "number" && params.dataIndex > 0
              ? String(
                  hoverLabels[params.dataIndex - 1] ??
                    xLabels[params.dataIndex - 1] ??
                    previousYear
                )
              : "-");

          const title =
            typeof params.dataIndex === "number" && tooltipTitleFormatter
              ? tooltipTitleFormatter({
                  seriesName: params.seriesName ?? "-",
                  currentLabel: currentLabel,
                  dataIndex: params.dataIndex,
                  fullLabel: meta?.fullLabel ?? params.seriesName ?? "-"
                })
              : (meta?.fullLabel ?? params.seriesName ?? "-");
          const lines = [
            `<div style="font-weight:700;margin-bottom:6px;">${title}</div>`,
            `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Nilai ${currentLabel}</span><strong>${formatNumber(current)}</strong></div>`
          ];
          if (typeof params.dataIndex === "number" && params.dataIndex > 0) {
            lines.push(
              `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Nilai Sebelumnya (${useCategoryComparison ? previousLabel : previousYear})</span><strong>${previous == null ? "-" : formatNumber(previous)}</strong></div>`,
              `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Perubahan</span><strong style="color:${delta.color}">${delta.absolute}</strong></div>`,
              `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Perubahan %</span><strong style="color:${delta.color}">${delta.percent}</strong></div>`
            );
          }
          lines.push(
            `<div style="margin-top:6px;color:#94A3B8;">Unit: ${unit}</div>`
          );
          return lines.join("");
        }
      },
      legend: {
        show: !customLegendItems?.length,
        type: "plain",
        bottom: 8,
        left: "center",
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { color: "#475569", fontSize: 11 },
        data: series.map((item) => item.label)
      },
      grid: {
        top: 18,
        right: 18,
        bottom: customLegendItems?.length ? 48 : 84,
        left: 56,
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: xLabels,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        axisLabel: { color: "#64748b", fontSize: 11 }
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#e2e8f0", type: "dashed" } },
        axisLabel: {
          color: "#64748b",
          fontSize: 10,
          formatter: (value: number) => formatNumber(value)
        }
      },
      series: series.map((item) => ({
        name: item.label,
        type: "bar",
        stack: "total",
        emphasis: { focus: "series" },
        itemStyle: itemColorFormatter
          ? {
              color: (params: { dataIndex?: number }) =>
                itemColorFormatter({
                  seriesName: item.label,
                  dataIndex: params.dataIndex ?? 0,
                  fullLabel: item.fullLabel
                }) ?? undefined
            }
          : undefined,
        data: item.values.map((value, dataIndex) => {
          if (!customLegendItems?.length) return value;
          const currentLabel = String(
            hoverLabels[dataIndex] ?? xLabels[dataIndex] ?? ""
          );
          const legendLabel = normalizeLegendLabel(currentLabel);
          return hiddenLegendSet.has(legendLabel) ? null : value;
        }),
        barMaxWidth: 42,
        barMinWidth: 24,
        barCategoryGap: "18%"
      }))
    }),
    [
      customLegendItems?.length,
      hiddenLegendSet,
      hoverLabels,
      itemColorFormatter,
      previousValueResolver,
      series,
      seriesMeta,
      tooltipTitleFormatter,
      unit,
      useCategoryComparison,
      xLabels,
      years
    ]
  );

  const handleDownload = React.useCallback(async () => {
    const instance = chartRef.current?.getEchartsInstance();
    if (!instance) return;
    const imageUrl = instance.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#ffffff"
    });
    await downloadComposedPng({
      imageUrl,
      filename,
      title: exportTitle,
      subtitle: exportSubtitle,
      legendItems: customLegendItems?.map((item) => ({
        label: item.label,
        color: item.color,
        disabled: hiddenLegendSet.has(item.label)
      })),
      footer: exportFooter
    });
  }, [
    customLegendItems,
    exportFooter,
    exportSubtitle,
    exportTitle,
    filename,
    hiddenLegendSet
  ]);

  React.useEffect(() => {
    onRegisterDownload?.(handleDownload);
    return () => onRegisterDownload?.(null);
  }, [handleDownload, onRegisterDownload]);

  if (!xLabels.length || !series.length) {
    return (
      <div style={{ height }}>
        <EmptyStatePanel
          compact
          title="Chart belum tersedia"
          description="Data pasangan negara belum tersedia."
          className="h-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ width: "100%", height }}
        notMerge
        lazyUpdate
      />
      {customLegendItems?.length ? (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-1">
          {customLegendItems.map((item) => (
            <button
              key={`${item.label}-${item.color}`}
              type="button"
              onClick={() =>
                setHiddenLegendLabels((current) =>
                  current.includes(item.label)
                    ? current.filter((label) => label !== item.label)
                    : [...current, item.label]
                )
              }
              className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-100"
              aria-pressed={!hiddenLegendSet.has(item.label)}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/5"
                style={{
                  backgroundColor: item.color,
                  opacity: hiddenLegendSet.has(item.label) ? 0.35 : 1
                }}
              />
              <span
                className={
                  hiddenLegendSet.has(item.label)
                    ? "text-slate-400 line-through"
                    : ""
                }
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
