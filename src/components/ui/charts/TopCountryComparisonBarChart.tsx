import React from "react";
import ReactECharts from "echarts-for-react";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";

type TopCountryComparisonBarChartRow = {
  country: string;
  latestValue: number;
  prevValue: number;
  share: number | null;
};

type TopCountryComparisonBarChartProps = {
  rows: TopCountryComparisonBarChartRow[];
  latestYear: number | null;
  prevYear: number | null;
  unitLabel: string;
  height?: number;
  color?: string;
  lightColor?: string;
  onRegisterDownload?: (handler: (() => void) | null) => void;
  filename?: string;
};

function formatNumber(value: number) {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

export function TopCountryComparisonBarChart({
  rows,
  latestYear,
  prevYear,
  unitLabel,
  height = 440,
  color = "#60A5FA",
  lightColor = "#BFDBFE",
  onRegisterDownload,
  filename = "top_country_chart"
}: TopCountryComparisonBarChartProps) {
  const chartRef = React.useRef<ReactECharts | null>(null);

  const option = React.useMemo(
    () => ({
      animationDuration: 500,
      animationEasing: "cubicOut",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        appendToBody: true,
        confine: false,
        extraCssText: "z-index: 2500;",
        backgroundColor: "rgba(15,23,42,0.94)",
        borderWidth: 0,
        textStyle: { color: "#E2E8F0" },
        formatter: (params: Array<{ dataIndex: number }>) => {
          const first = params[0];
          if (!first) return "";
          const row = rows[first.dataIndex];
          const latest = Number(row?.latestValue ?? 0);
          const prev = Number(row?.prevValue ?? 0);
          const delta =
            prev !== 0 ? ((latest - prev) / Math.abs(prev || 1)) * 100 : null;

          return [
            `<div style="font-weight:700;margin-bottom:8px;">${row?.country ?? "-"}</div>`,
            `<div style="display:flex;justify-content:space-between;gap:16px;"><span>${latestYear ?? "Aktif"}</span><strong>${formatNumber(latest)}</strong></div>`,
            `<div style="display:flex;justify-content:space-between;gap:16px;"><span>${prevYear ?? "Sebelumnya"}</span><strong>${formatNumber(prev)}</strong></div>`,
            `<div style="margin-top:6px;display:flex;justify-content:space-between;gap:16px;"><span>Pangsa</span><strong>${row?.share == null ? "-" : `${row.share.toFixed(2)}%`}</strong></div>`,
            `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Perubahan</span><strong>${delta == null || !Number.isFinite(delta) ? "-" : `${delta.toFixed(2)}%`}</strong></div>`,
            `<div style="margin-top:6px;color:#94A3B8;">Unit: ${unitLabel}</div>`
          ].join("");
        }
      },
      legend: {
        top: 0,
        left: "center",
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: "#475569", fontSize: 12 }
      },
      grid: { top: 48, left: 22, right: 18, bottom: 92, containLabel: true },
      xAxis: {
        type: "category",
        data: rows.map((item) => item.country),
        axisLabel: {
          color: "#334155",
          interval: 0,
          rotate: rows.length > 6 ? 30 : 0
        },
        axisTick: { alignWithLabel: true }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#64748B" },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.16)" } }
      },
      series: [
        {
          name: latestYear != null ? String(latestYear) : "Tahun Aktif",
          type: "bar",
          data: rows.map((item) => item.latestValue),
          itemStyle: { color, borderRadius: [10, 10, 0, 0] },
          barMaxWidth: 18
        },
        {
          name: prevYear != null ? String(prevYear) : "Tahun Sebelumnya",
          type: "bar",
          data: rows.map((item) => item.prevValue),
          itemStyle: { color: lightColor, borderRadius: [10, 10, 0, 0] },
          barMaxWidth: 18
        }
      ]
    }),
    [color, latestYear, lightColor, prevYear, rows, unitLabel]
  );

  const handleDownload = React.useCallback(() => {
    const instance = chartRef.current?.getEchartsInstance();
    if (!instance) return;
    const url = instance.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#ffffff"
    });
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filename]);

  React.useEffect(() => {
    onRegisterDownload?.(handleDownload);
    return () => onRegisterDownload?.(null);
  }, [handleDownload, onRegisterDownload]);

  if (!rows.length) {
    return (
      <div style={{ height }}>
        <EmptyStatePanel
          compact
          title="Chart belum tersedia"
          description="Data perbandingan negara belum tersedia untuk filter aktif."
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
