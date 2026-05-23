import React from "react";
import ReactECharts from "echarts-for-react";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { downloadComposedPng } from "@/utils/downloadComposedPng";

type TopProductsComparisonBarChartRow = {
  hs: string;
  name: string;
  latestValue: number;
  prevValue: number;
  share: number;
};

type TopProductsComparisonBarChartProps = {
  rows: TopProductsComparisonBarChartRow[];
  latestYear: number | null;
  prevYear: number | null;
  unitLabel: string;
  height?: number;
  latestColor?: string;
  prevColor?: string;
  onRegisterDownload?: (handler: (() => void) | null) => void;
  filename?: string;
  exportTitle?: string;
  exportSubtitle?: string;
  exportFooter?: string;
};

function formatNumber(value: number) {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

export function TopProductsComparisonBarChart({
  rows,
  latestYear,
  prevYear,
  unitLabel,
  height = 440,
  latestColor = "#2563EB",
  prevColor = "#93C5FD",
  onRegisterDownload,
  filename = "top_products_chart",
  exportTitle,
  exportSubtitle,
  exportFooter
}: TopProductsComparisonBarChartProps) {
  const chartRef = React.useRef<ReactECharts | null>(null);

  const option = React.useMemo(() => {
    const labels = rows.map((item) => item.hs);
    return {
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
        formatter: (
          params: Array<{
            axisValueLabel: string;
            seriesName: string;
            value: number;
            dataIndex: number;
          }>
        ) => {
          const first = params[0];
          if (!first) return "";
          const row = rows[first.dataIndex];
          const latest = Number(row?.latestValue ?? 0);
          const prev = Number(row?.prevValue ?? 0);
          const delta =
            prev > 0 ? ((latest - prev) / Math.abs(prev)) * 100 : null;
          return [
            `<div style="font-weight:700;margin-bottom:4px;">HS ${row?.hs ?? first.axisValueLabel}</div>`,
            `<div style="margin-bottom:8px;line-height:1.4;max-width:320px;white-space:normal;word-break:break-word;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:#CBD5E1;">${row?.name ?? "-"}</div>`,
            `<div style="display:flex;justify-content:space-between;gap:16px;"><span style="color:#93C5FD;">${latestYear ?? "Aktif"}</span><strong>${formatNumber(latest)}</strong></div>`,
            `<div style="display:flex;justify-content:space-between;gap:16px;"><span style="color:#BFDBFE;">${prevYear ?? "Sebelumnya"}</span><strong>${formatNumber(prev)}</strong></div>`,
            `<div style="margin-top:6px;display:flex;justify-content:space-between;gap:16px;"><span>Pangsa ${latestYear ?? "aktif"}</span><strong>${row?.share?.toFixed(2) ?? "0.00"}%</strong></div>`,
            `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Perubahan</span><strong>${delta == null ? "-" : `${delta.toFixed(2)}%`}</strong></div>`,
            `<div style="margin-top:6px;color:#94A3B8;">Unit: ${unitLabel}</div>`
          ].join("");
        }
      },
      legend: {
        bottom: 8,
        left: "center",
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: "#475569", fontSize: 12 }
      },
      grid: { top: 20, left: 22, right: 18, bottom: 88, containLabel: true },
      xAxis: {
        type: "category",
        data: labels,
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
          itemStyle: {
            color: latestColor,
            borderRadius: [10, 10, 0, 0]
          },
          barMaxWidth: 16,
          emphasis: {
            itemStyle: {
              color: latestColor
            }
          }
        },
        {
          name: prevYear != null ? String(prevYear) : "Tahun Sebelumnya",
          type: "bar",
          data: rows.map((item) => item.prevValue),
          itemStyle: {
            color: prevColor,
            borderRadius: [10, 10, 0, 0]
          },
          barMaxWidth: 16,
          emphasis: {
            itemStyle: {
              color: prevColor
            }
          }
        }
      ]
    };
  }, [latestColor, latestYear, prevColor, prevYear, rows, unitLabel]);

  const handleDownload = React.useCallback(async () => {
    const instance = chartRef.current?.getEchartsInstance();
    if (!instance) return;
    const url = instance.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#ffffff"
    });
    await downloadComposedPng({
      imageUrl: url,
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

  if (!rows.length) {
    return (
      <div style={{ height }}>
        <EmptyStatePanel
          compact
          title="Chart belum tersedia"
          description="Data perbandingan produk belum tersedia untuk filter aktif."
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
