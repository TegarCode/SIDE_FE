import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { downloadComposedPng } from "@/utils/downloadComposedPng";

type TradeAnnualAreaChartPoint = {
  year: number;
  primary: number | null;
  secondary: number | null;
};

type TradeAnnualAreaChartProps = {
  data: TradeAnnualAreaChartPoint[];
  primaryLabel: string;
  secondaryLabel: string;
  unit?: string;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  hideLegend?: boolean;
  filename?: string;
  onRegisterDownload?: (handler: (() => void) | null) => void;
  exportTitle?: string;
  exportSubtitle?: string;
  exportMetaLines?: string[];
  exportFooter?: string;
};

const nf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

function formatTooltipValue(value: number | null | undefined) {
  if (value == null || value === 0) return "-";
  return nf.format(value);
}

function formatTooltipPercent(value: number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function TradeAnnualAreaChart({
  data,
  primaryLabel,
  secondaryLabel,
  unit = "",
  height = 360,
  primaryColor = "#2563eb",
  secondaryColor = "#f97316",
  hideLegend = false,
  filename = "trade-annual-chart",
  onRegisterDownload,
  exportTitle,
  exportSubtitle,
  exportMetaLines,
  exportFooter
}: TradeAnnualAreaChartProps) {
  const chartRef = React.useRef<ReactECharts | null>(null);
  const years = React.useMemo(
    () => data.map((item) => String(item.year)),
    [data]
  );
  const primaryValues = React.useMemo(
    () => data.map((item) => item.primary),
    [data]
  );
  const secondaryValues = React.useMemo(
    () => data.map((item) => item.secondary),
    [data]
  );
  const hasUsableValue = React.useMemo(
    () =>
      data.some((item) => item.primary != null && item.primary !== 0) ||
      data.some((item) => item.secondary != null && item.secondary !== 0),
    [data]
  );

  const option = React.useMemo(
    () => ({
      animationDuration: 700,
      grid: { top: 18, right: 18, bottom: 36, left: 56 },
      legend: hideLegend
        ? undefined
        : {
            top: 0,
            right: 0,
            itemWidth: 12,
            itemHeight: 8,
            textStyle: { color: "#475569", fontSize: 11 },
            data: secondaryLabel
              ? [primaryLabel, secondaryLabel]
              : [primaryLabel]
          },
      tooltip: {
        trigger: "axis",
        appendToBody: true,
        backgroundColor: "rgba(15,23,42,0.96)",
        borderWidth: 0,
        textStyle: { color: "#fff", fontSize: 11 },
        formatter: (
          params: Array<{
            axisValue?: string;
            seriesName?: string;
            value?: number | null;
            color?: string;
            dataIndex?: number;
          }>
        ) => {
          const rows = params
            .map((item) => {
              const value = item.value == null ? "-" : nf.format(item.value);
              const prevValue =
                typeof item.dataIndex === "number" && item.dataIndex > 0
                  ? primaryLabel === item.seriesName
                    ? primaryValues[item.dataIndex - 1]
                    : secondaryValues[item.dataIndex - 1]
                  : null;
              const change =
                item.value != null && prevValue != null && prevValue !== 0
                  ? ((item.value - prevValue) / Math.abs(prevValue)) * 100
                  : null;
              const absoluteChange =
                item.value != null && prevValue != null
                  ? item.value - prevValue
                  : null;
              return `
                <div style="margin-top:6px;border-top:1px solid rgba(255,255,255,0.08);padding-top:6px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${item.color ?? "#fff"};"></span>
                      <span>${item.seriesName ?? "-"}</span>
                    </div>
                    <strong>${value}</strong>
                  </div>
                  <div style="margin-top:4px;font-size:10px;opacity:0.8;">Nilai sebelumnya: ${prevValue == null ? "-" : nf.format(prevValue)}</div>
                  <div style="margin-top:2px;font-size:10px;color:${change == null ? "rgba(255,255,255,0.72)" : change >= 0 ? "#86efac" : "#fca5a5"};">
                    Perubahan: ${change == null ? "-" : `${formatTooltipValue(absoluteChange)} | ${change >= 0 ? "▲" : "▼"}${formatTooltipPercent(Math.abs(change))}%`}
                  </div>
                </div>
              `;
            })
            .join("");

          return `
            <div style="min-width:180px;">
              <div style="font-weight:700;margin-bottom:4px;">Tahun ${params[0]?.axisValue ?? "-"}</div>
              ${rows}
              ${unit ? `<div style="margin-top:8px;font-size:10px;opacity:0.75;">Unit: ${unit}</div>` : ""}
            </div>
          `;
        }
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: years,
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 11 }
      },
      yAxis: {
        type: "value",
        splitNumber: 4,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#64748b",
          fontSize: 10,
          formatter: (value: number) => nf.format(value)
        },
        splitLine: { lineStyle: { color: "#e2e8f0", type: "dashed" } }
      },
      series: [
        {
          name: primaryLabel,
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 7,
          data: primaryValues,
          lineStyle: { width: 3, color: primaryColor },
          itemStyle: { color: primaryColor },
          label: {
            show: true,
            position: "top",
            distance: 8,
            color: "#475569",
            fontSize: 10,
            formatter: ({ value }: { value?: number | null }) =>
              value == null ? "" : nf.format(value)
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${primaryColor}55` },
              { offset: 1, color: `${primaryColor}08` }
            ])
          }
        },
        ...(secondaryLabel
          ? [
              {
                name: secondaryLabel,
                type: "line",
                smooth: true,
                symbol: "circle",
                symbolSize: 7,
                data: secondaryValues,
                lineStyle: { width: 3, color: secondaryColor },
                itemStyle: { color: secondaryColor },
                label: {
                  show: true,
                  position: "top",
                  distance: 8,
                  color: "#475569",
                  fontSize: 10,
                  formatter: ({ value }: { value?: number | null }) =>
                    value == null ? "" : nf.format(value)
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: `${secondaryColor}45` },
                    { offset: 1, color: `${secondaryColor}08` }
                  ])
                }
              }
            ]
          : [])
      ]
    }),
    [
      hideLegend,
      primaryColor,
      primaryLabel,
      primaryValues,
      secondaryColor,
      secondaryLabel,
      secondaryValues,
      unit,
      years
    ]
  );

  const handleDownload = React.useCallback(() => {
    const instance = chartRef.current?.getEchartsInstance();
    if (!instance) return;
    const url = instance.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#ffffff"
    });
    void downloadComposedPng({
      imageUrl: url,
      filename,
      title: exportTitle,
      subtitle: exportSubtitle,
      metaLines: exportMetaLines,
      footer: exportFooter
    });
  }, [exportFooter, exportMetaLines, exportSubtitle, exportTitle, filename]);

  React.useEffect(() => {
    onRegisterDownload?.(handleDownload);
    return () => onRegisterDownload?.(null);
  }, [handleDownload, onRegisterDownload]);

  if (data.length === 0 || !hasUsableValue) {
    return (
      <div style={{ height }}>
        <EmptyStatePanel
          compact
          description="Data tren tahunan belum tersedia untuk kombinasi filter yang sedang dipilih."
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
