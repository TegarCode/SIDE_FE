import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import type { MultiLineTrendChartProps } from "@/type/indonesiaDiplomasi";

const nf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
const PALETTE = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#7c3aed",
  "#0ea5e9",
  "#14b8a6"
];

function formatNum(value: number | null | undefined) {
  return value == null || Number.isNaN(value) ? "-" : nf.format(value);
}

function formatPct(value: number | null | undefined) {
  return value == null || Number.isNaN(Number(value))
    ? "-"
    : `${Number(value).toFixed(2)}%`;
}

function formatCurrency(value: number | null | undefined, unit: string) {
  return value == null || Number.isNaN(value)
    ? "-"
    : `${unit} ${nf.format(value)}`;
}

function hexToRgba(hex: string, alpha = 1) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function MultiLineTrendChart({
  series,
  years,
  height = 470,
  unit = "US$",
  extrasByYear = {},
  minimal = false,
  variant = "default"
}: MultiLineTrendChartProps) {
  const [yMin, yMax] = useMemo(() => {
    const allValues = series
      .flatMap((item) => item.values ?? [])
      .filter((v) => Number.isFinite(v));
    if (allValues.length === 0) return [0, 1] as const;
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1] as const;
    if (min === max)
      return [Math.floor(max * 0.8), Math.ceil(max * 1.2 || 1)] as const;
    return [Math.floor(min * 0.95), Math.ceil(max * 1.05)] as const;
  }, [series]);

  const eSeries = useMemo(
    () =>
      series.map((item, index) => {
        const color = PALETTE[index % PALETTE.length];
        return {
          name: item.label,
          type: "line",
          data: item.values ?? [],
          smooth: true,
          showSymbol: false,
          symbolSize: minimal ? 4 : 6,
          emphasis: minimal
            ? { disabled: true }
            : { focus: "series", lineStyle: { width: 3 } },
          lineStyle: { width: 2, color },
          areaStyle: minimal
            ? {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: hexToRgba(color, 0.1) },
                  { offset: 1, color: hexToRgba(color, 0.0) }
                ])
              }
            : {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: hexToRgba(color, 0.22) },
                  { offset: 1, color: hexToRgba(color, 0.0) }
                ])
              }
        };
      }),
    [minimal, series]
  );

  const isKinerjaVariant = variant === "kinerja-ekonomi";

  const option = useMemo(
    () => ({
      color: PALETTE,
      grid: isKinerjaVariant
        ? { top: 36, right: 16, bottom: 48, left: 56, containLabel: true }
        : { top: 24, right: 16, bottom: 84, left: 56, containLabel: true },
      animation: true,
      animationDuration: minimal ? 500 : 800,
      animationEasing: "cubicOut",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line" },
        transitionDuration: minimal ? 0.08 : 0.2,
        backgroundColor: "rgba(15,23,42,0.95)",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        textStyle: { color: "#fff", fontSize: 11 },
        formatter: (
          params: Array<{
            axisValueLabel?: string;
            color?: string;
            seriesName?: string;
            data?: number;
          }>
        ) => {
          const title = params?.[0]?.axisValueLabel ?? "";
          const lines = (params || [])
            .map((item) => {
              const color = item.color ?? "#fff";
              const name = item.seriesName ?? "-";
              return `<span style="display:inline-block;margin-right:6px;width:8px;height:8px;border-radius:50%;background:${color}"></span>${name}: ${formatCurrency(item.data, unit)}`;
            })
            .join("<br/>");

          const key = String(title);
          const extra = extrasByYear[key] ?? extrasByYear[Number(key)];
          if (!extra) {
            return `<div style="opacity:.9"><div style="font-weight:600;margin-bottom:4px">${title}</div>${lines}</div>`;
          }

          const extraBlock =
            typeof extra.delta !== "undefined"
              ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.08)">Perubahan (YoY): <b>${formatPct(extra.delta)}</b></div>`
              : "";

          return `<div style="opacity:.9"><div style="font-weight:600;margin-bottom:4px">${title}</div>${lines}${extraBlock}</div>`;
        }
      },
      legend: {
        type: "scroll",
        ...(isKinerjaVariant
          ? { top: 4, left: undefined }
          : { bottom: 8, left: "center" }),
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { color: "#334155", fontSize: 11 }
      },
      toolbox: {
        right: 8,
        feature: {
          saveAsImage: {
            pixelRatio: 2,
            name: "multi-line-chart",
            backgroundColor: "#ffffff"
          }
        }
      },
      xAxis: {
        type: "category",
        data: years,
        boundaryGap: false,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#e5e7eb" } },
        axisLabel: { color: "#334155", fontSize: 10 }
      },
      yAxis: {
        type: "value",
        min: yMin,
        max: yMax,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#e5e7eb" } },
        axisLabel: {
          color: "#334155",
          fontSize: 10,
          formatter: (v: number) => formatNum(v)
        }
      },
      series: eSeries
    }),
    [eSeries, extrasByYear, isKinerjaVariant, minimal, unit, years, yMax, yMin]
  );

  if (years.length === 0 || series.length === 0) {
    return (
      <div style={{ height }}>
        <EmptyStatePanel
          compact
          title="Chart belum tersedia"
          description="Data tren belum tersedia untuk filter yang sedang dipilih."
          className="h-full"
        />
      </div>
    );
  }

  return (
    <ReactECharts option={option} style={{ width: "100%", height }} notMerge />
  );
}
