import React from "react";
import ReactECharts from "echarts-for-react";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { downloadComposedPng } from "@/utils/downloadComposedPng";

type Row = {
  name: string;
  value: number;
  previousValue?: number | null;
  share?: number | null;
};

type Props = {
  rows: Row[];
  year: number | null;
  previousYear?: number | null;
  unitLabel: string;
  height?: number;
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
  "#14b8a6"
];

function formatNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  return value.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function formatPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(2)}%`;
}

export function EntityTreemapChart({
  rows,
  year,
  previousYear = null,
  unitLabel,
  height = 400,
  filename = "entity_treemap",
  onRegisterDownload,
  exportTitle,
  exportSubtitle,
  exportFooter
}: Props) {
  const chartRef = React.useRef<ReactECharts | null>(null);

  const option = React.useMemo(() => {
    const seriesData = rows.map((row, index) => ({
      name: row.name,
      value: row.value,
      itemStyle: { color: COLORS[index % COLORS.length] },
      previousValue: row.previousValue ?? null,
      share: row.share ?? null
    }));

    return {
      tooltip: {
        trigger: "item",
        appendToBody: true,
        backgroundColor: "rgba(15,23,42,0.95)",
        borderWidth: 0,
        textStyle: { color: "#E2E8F0" },
        formatter: (params: {
          data?: {
            name?: string;
            value?: number;
            previousValue?: number | null;
            share?: number | null;
          };
        }) => {
          const node = params.data;
          if (!node) return "";
          const current = Number(node.value ?? 0);
          const previous =
            node.previousValue != null ? Number(node.previousValue) : null;
          const delta = previous != null ? current - previous : null;
          return [
            `<div style="font-weight:700;margin-bottom:6px;">${node.name ?? "-"}</div>`,
            year != null
              ? `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Nilai ${year}</span><strong>${formatNumber(current)}</strong></div>`
              : "",
            previousYear != null
              ? `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Nilai ${previousYear}</span><strong>${formatNumber(previous)}</strong></div>`
              : "",
            delta != null
              ? `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Perubahan</span><strong style="color:${delta >= 0 ? "#86efac" : "#fca5a5"}">${delta >= 0 ? "+" : "-"}${formatNumber(Math.abs(delta))}</strong></div>`
              : "",
            node.share != null
              ? `<div style="display:flex;justify-content:space-between;gap:16px;"><span>Pangsa ${year ?? ""}</span><strong>${formatPercent(Number(node.share))}</strong></div>`
              : "",
            `<div style="margin-top:6px;color:#94A3B8;">Unit: ${unitLabel}</div>`
          ]
            .filter(Boolean)
            .join("");
        }
      },
      series: [
        {
          type: "treemap",
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          label: {
            show: true,
            formatter: (params: {
              data?: { name?: string; share?: number | null };
            }) => {
              const name = params.data?.name ?? "-";
              const share = params.data?.share;
              return share != null
                ? `${name}\n${formatPercent(Number(share))}`
                : name;
            },
            color: "#fff",
            fontWeight: 700,
            overflow: "truncate"
          },
          upperLabel: { show: false },
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 2,
            gapWidth: 2
          },
          data: seriesData
        }
      ]
    };
  }, [previousYear, rows, unitLabel, year]);

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

  if (!rows.length) {
    return (
      <div style={{ height }}>
        <EmptyStatePanel
          compact
          title="Treemap belum tersedia"
          description="Data negara belum tersedia."
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
