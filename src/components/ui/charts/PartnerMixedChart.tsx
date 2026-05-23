import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import type { PartnerMixedChartProps } from "@/type/indonesiaDiplomasi";

const nf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

const money = (n: number, unit = "US$") =>
  `${unit} ${nf.format(Number(n || 0))}`;

const hsl = (h: number, s: number, l: number, a = 1) =>
  `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
const grad = (top: string, bottom: string) => ({
  type: "linear",
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: top },
    { offset: 1, color: bottom }
  ]
});

function paletteFor(index: number) {
  const h = (index * 137.508) % 360;
  const h2 = (h + 26) % 360;
  const hLine = (h - 8 + 360) % 360;
  return {
    bar1: grad(hsl(h, 58, 86), hsl(h, 58, 74)),
    bar2: grad(hsl(h2, 54, 87), hsl(h2, 54, 75)),
    bar1Border: hsl(h, 42, 58, 0.85),
    bar2Border: hsl(h2, 40, 58, 0.85),
    line: hsl(hLine, 50, 44),
    lineShadow: hsl(hLine, 40, 38, 0.25)
  };
}

export function PartnerMixedChart({
  years,
  partners,
  unit = "US$",
  height = 480
}: PartnerMixedChartProps) {
  const [yMin, yMax] = useMemo(() => {
    const allValues = partners.flatMap((item) => [
      ...(item.export || []),
      ...(item.import || []),
      ...(item.balance || [])
    ]);
    if (allValues.length === 0) return [0, 1] as const;
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const pad = Math.max(Math.abs(min), Math.abs(max)) * 0.12;
    return [Math.floor(min - pad), Math.ceil(max + pad)] as const;
  }, [partners]);

  const series = useMemo(() => {
    const out: Array<Record<string, unknown>> = [];
    partners.forEach((partner, idx) => {
      const pal = paletteFor(idx);
      out.push(
        {
          name: `${partner.name} Ekspor`,
          type: "bar",
          data: partner.export ?? [],
          itemStyle: {
            color: pal.bar1,
            borderColor: pal.bar1Border,
            borderWidth: 0.5,
            borderRadius: [2, 2, 2, 2],
            shadowBlur: 4,
            shadowColor: "rgba(0,0,0,0.04)"
          },
          emphasis: {
            focus: "series",
            itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.08)" }
          },
          z: 1
        },
        {
          name: `${partner.name} Impor`,
          type: "bar",
          data: partner.import ?? [],
          itemStyle: {
            color: pal.bar2,
            borderColor: pal.bar2Border,
            borderWidth: 0.5,
            borderRadius: [2, 2, 2, 2],
            shadowBlur: 4,
            shadowColor: "rgba(0,0,0,0.04)"
          },
          emphasis: {
            focus: "series",
            itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.08)" }
          },
          z: 1
        },
        {
          name: `Neraca ${partner.name}`,
          type: "line",
          data: partner.balance ?? [],
          smooth: true,
          showSymbol: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            width: 2,
            color: pal.line,
            shadowBlur: 6,
            shadowColor: pal.lineShadow
          },
          emphasis: { focus: "series" },
          z: 2
        }
      );
    });

    const firstLineIndex = out.findIndex((entry) => entry.type === "line");
    if (firstLineIndex >= 0) {
      out[firstLineIndex].markLine = {
        silent: true,
        symbol: "none",
        lineStyle: { type: "dotted", color: "#cbd5e1" },
        data: [{ yAxis: 0 }],
        tooltip: { show: false }
      };
    }

    return out;
  }, [partners]);

  const option = useMemo(
    () => ({
      baseOption: {
        grid: { top: 64, right: 16, bottom: 140, left: 64, containLabel: true },
        animation: true,
        animationDuration: 800,
        animationEasing: "cubicOut",
        tooltip: {
          show: true,
          trigger: "item",
          axisPointer: { type: "shadow" },
          appendToBody: true,
          backgroundColor: "rgba(15,23,42,0.9)",
          borderColor: "rgba(255,255,255,0.08)",
          borderWidth: 1,
          textStyle: { color: "#fff", fontSize: 11 },
          extraCssText: "backdrop-filter: blur(6px);",
          formatter: (p: {
            axisValue?: string | number;
            color?: string | { colorStops?: Array<{ color: string }> };
            value?: number;
            seriesName?: string;
          }) => {
            if (!p) return "";
            const year = p.axisValue ?? "";
            const color =
              typeof p.color === "string"
                ? p.color
                : (p.color?.colorStops?.[0]?.color ?? "#fff");
            const value = money(Number(p.value ?? 0), unit);
            const info = String(p.seriesName ?? "").startsWith("Neraca ")
              ? ""
              : "";
            return `<div style="opacity:.95"><div style="font-weight:700;margin-bottom:6px">${year}</div><div style="display:flex;align-items:center;gap:8px;justify-content:space-between;margin:2px 0"><div style="display:flex;align-items:center;gap:8px;max-width:240px"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color}"></span><span>${p.seriesName ?? ""}</span></div><b>${value}</b></div>${info}</div>`;
          }
        },
        legend: {
          type: "plain",
          bottom: 8,
          left: "center",
          orient: "horizontal",
          itemWidth: 12,
          itemHeight: 8,
          itemGap: 10,
          textStyle: { color: "#475569", fontSize: 10 },
          selector: false,
          data: series.map((entry) => String(entry.name))
        },
        toolbox: {
          right: 8,
          feature: {
            saveAsImage: {
              pixelRatio: 2,
              name: "partner-mixed-chart",
              backgroundColor: "#ffffff"
            }
          }
        },
        xAxis: {
          type: "category",
          data: years,
          boundaryGap: true,
          axisTick: { show: false },
          axisLine: { lineStyle: { color: "#e2e8f0" } },
          axisLabel: { color: "#475569", fontSize: 11 }
        },
        yAxis: {
          type: "value",
          min: yMin,
          max: yMax,
          splitNumber: 5,
          splitLine: { lineStyle: { color: "#e2e8f0" } },
          axisLabel: {
            color: "#475569",
            fontSize: 10,
            formatter: (v: number) => nf.format(v)
          }
        },
        series,
        barGap: "8%",
        barCategoryGap: "24%"
      },
      media: [
        {
          query: { maxWidth: 1024 },
          option: {
            grid: { bottom: 148, left: 56, right: 12, top: 56 },
            legend: { itemGap: 8, textStyle: { fontSize: 10 } },
            xAxis: { axisLabel: { fontSize: 10 } },
            yAxis: { axisLabel: { fontSize: 9 } },
            barGap: "6%",
            barCategoryGap: "20%"
          }
        },
        {
          query: { maxWidth: 640 },
          option: {
            grid: { bottom: 160, left: 48, right: 8, top: 52 },
            legend: {
              itemGap: 8,
              itemWidth: 10,
              itemHeight: 6,
              textStyle: { fontSize: 9 }
            },
            xAxis: { axisLabel: { fontSize: 9 } },
            yAxis: { axisLabel: { fontSize: 8 } },
            barGap: "4%",
            barCategoryGap: "18%"
          }
        }
      ]
    }),
    [series, unit, years, yMax, yMin]
  );

  if (years.length === 0 || partners.length === 0) {
    return (
      <div style={{ height }}>
        <EmptyStatePanel
          compact
          title="Chart belum tersedia"
          description="Data partner mix belum tersedia untuk filter yang sedang dipilih."
          className="h-full"
        />
      </div>
    );
  }

  return (
    <ReactECharts option={option} notMerge style={{ width: "100%", height }} />
  );
}
