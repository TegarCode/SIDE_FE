import React from "react";
import ReactECharts from "echarts-for-react";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { downloadComposedPng } from "@/utils/downloadComposedPng";

type SeriesItem = {
  label: string;
  values: number[];
};

type Props = {
  years: number[];
  series: SeriesItem[];
  height?: number;
  unit?: string;
  maximumFractionDigits?: number;
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
  "#0ea5e9"
];

function formatNumber(
  value: number | null | undefined,
  maximumFractionDigits = 0
) {
  if (value == null || !Number.isFinite(value)) return "-";
  return value.toLocaleString("id-ID", { maximumFractionDigits });
}

function buildDelta(
  current: number,
  previous: number | null,
  maximumFractionDigits = 0
) {
  if (previous == null || !Number.isFinite(previous)) {
    return { absolute: "-", percent: "-", color: "#E2E8F0" };
  }
  const absolute = current - previous;
  const percent = previous !== 0 ? (absolute / Math.abs(previous)) * 100 : null;
  const positive = absolute >= 0;
  return {
    absolute: `${positive ? "+" : "-"}${formatNumber(Math.abs(absolute), maximumFractionDigits)}`,
    percent:
      percent == null || !Number.isFinite(percent)
        ? "-"
        : `${positive ? "+" : "-"}${Math.abs(percent).toFixed(2)}%`,
    color: positive ? "#86efac" : "#fca5a5"
  };
}

export function CountryGroupedBarChart({
  years,
  series,
  height = 380,
  unit = "Ribu US$",
  maximumFractionDigits = 0,
  filename = "country-grouped-bar-chart",
  onRegisterDownload,
  exportTitle,
  exportSubtitle,
  exportFooter
}: Props) {
  const chartRef = React.useRef<ReactECharts | null>(null);
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
          const current = Number(params.value ?? 0);
          const selected = series.find(
            (item) => item.label === params.seriesName
          );
          const previous =
            typeof params.dataIndex === "number" && params.dataIndex > 0
              ? Number(selected?.values[params.dataIndex - 1] ?? 0)
              : null;
          const delta = buildDelta(current, previous, maximumFractionDigits);
          const currentYear = String(params.name ?? "-");
          const previousYear =
            typeof params.dataIndex === "number" && params.dataIndex > 0
              ? String(years[params.dataIndex - 1] ?? "-")
              : "-";

          return [
            `<div style="font-weight:700;margin-bottom:6px;">${params.seriesName ?? "-"}</div>`,
            `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Nilai ${currentYear}</span><strong>${formatNumber(current, maximumFractionDigits)}</strong></div>`,
            `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Nilai ${previousYear}</span><strong>${previous == null ? "-" : formatNumber(previous, maximumFractionDigits)}</strong></div>`,
            `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Perubahan</span><strong style="color:${delta.color}">${delta.absolute}</strong></div>`,
            `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Perubahan %</span><strong style="color:${delta.color}">${delta.percent}</strong></div>`,
            `<div style="margin-top:6px;color:#94A3B8;">Unit: ${unit}</div>`
          ].join("");
        }
      },
      legend: {
        type: "plain",
        bottom: 8,
        left: "center",
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { color: "#475569", fontSize: 11 }
      },
      grid: { top: 20, right: 18, bottom: 84, left: 56, containLabel: true },
      xAxis: {
        type: "category",
        data: years.map(String),
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
          formatter: (value: number) =>
            formatNumber(value, maximumFractionDigits)
        }
      },
      series: series.map((item) => ({
        name: item.label,
        type: "bar",
        data: item.values,
        barMaxWidth: 34,
        barMinWidth: 18,
        barCategoryGap: "22%"
      }))
    }),
    [maximumFractionDigits, series, unit, years]
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
      footer: exportFooter
    });
  }, [exportFooter, exportSubtitle, exportTitle, filename]);

  React.useEffect(() => {
    onRegisterDownload?.(handleDownload);
    return () => onRegisterDownload?.(null);
  }, [handleDownload, onRegisterDownload]);

  if (!years.length || !series.length) {
    return (
      <div style={{ height }}>
        <EmptyStatePanel
          compact
          title="Chart belum tersedia"
          description="Data negara tujuan belum tersedia."
          className="h-full"
        />
      </div>
    );
  }

  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      style={{ width: "100%", height }}
      notMerge
      lazyUpdate
    />
  );
}
