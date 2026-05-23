import React from "react";
import ReactECharts from "echarts-for-react";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";

type TreemapRow = {
  name: string;
  value: number;
};

type TradeHsTreemapChartProps = {
  rows: TreemapRow[];
  height?: number;
  unit?: string;
};

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#0ea5e9",
  "#14b8a6"
];

function formatNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  return value.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

export function TradeHsTreemapChart({
  rows,
  height = 420,
  unit = "Ribu US$"
}: TradeHsTreemapChartProps) {
  const option = React.useMemo(
    () => ({
      color: COLORS,
      tooltip: {
        formatter: (params: { data?: TreemapRow }) =>
          [
            `<div style="font-weight:700;margin-bottom:6px;">${params.data?.name ?? "-"}</div>`,
            `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Nilai</span><strong>${formatNumber(params.data?.value)}</strong></div>`,
            `<div style="margin-top:6px;color:#64748b;">Unit: ${unit}</div>`
          ].join("")
      },
      series: [
        {
          type: "treemap",
          roam: false,
          breadcrumb: { show: false },
          nodeClick: false,
          label: {
            show: true,
            formatter: "{b}",
            color: "#fff",
            fontSize: 11,
            overflow: "truncate"
          },
          upperLabel: { show: false },
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 2,
            gapWidth: 2
          },
          levels: [
            {
              itemStyle: {
                borderColor: "#fff",
                borderWidth: 2,
                gapWidth: 2
              }
            }
          ],
          data: rows
        }
      ]
    }),
    [rows, unit]
  );

  if (!rows.length) {
    return (
      <div style={{ height }}>
        <EmptyStatePanel
          compact
          title="Treemap belum tersedia"
          description="Data treemap HS belum tersedia untuk filter aktif."
          className="h-full"
        />
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
