import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { AnalisisRcaEpdRow } from "@/type/analisis";
import {
  dynamicDomain,
  formatCompactNumber,
  formatRcaEpdNumber,
  shortProductLabel,
  strategicPotentialScore,
  toRcaEpdChartPoints,
  type RcaEpdChartPoint
} from "@/components/analisis/potensi-daya-saing/rcaEpdChartUtils";

type Props = {
  rows: AnalisisRcaEpdRow[];
};

type RankingMetric = {
  key: string;
  title: string;
  description: string;
  color: string;
  value: (point: RcaEpdChartPoint) => number;
  filter?: (point: RcaEpdChartPoint) => boolean;
};

type RankingRow = {
  kode: string;
  label: string;
  fullLabel: string;
  value: number;
  kategoriEpd: string;
  xModel: string;
};

type RankingTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload?: RankingRow;
  }>;
};

function formatRankingAxisValue(value: number) {
  const absolute = Math.abs(value);

  if (absolute >= 1000) return formatCompactNumber(value);
  if (absolute >= 1) {
    return value.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
  if (absolute >= 0.01) return value.toFixed(3);
  if (absolute >= 0.001) return value.toFixed(4);
  return value.toFixed(5);
}

const rankingMetrics: RankingMetric[] = [
  {
    key: "avgRca",
    title: "Top AVG RCA",
    description: "Produk dengan daya saing rata-rata tertinggi.",
    color: "#384AA0",
    value: (point) => point.avgRca
  },
  {
    key: "lostOpportunity",
    title: "Top Lost Opportunity",
    description:
      "Produk dengan sinyal lost opportunity paling kuat untuk segera ditindaklanjuti.",
    color: "#D97706",
    filter: (point) =>
      point.derivedQuadrant === "Lost Opportunity" ||
      point.kategoriEpd.toLowerCase().includes("lost"),
    value: (point) =>
      Math.max(point.avgGrowthDemand, 0) * 100 +
      Math.abs(Math.min(point.avgGrowthShare, 0)) * 100 +
      Math.min(point.avgRca, 4) * 10
  },
  {
    key: "growthShare",
    title: "Top Growth Share",
    description: "Produk dengan kenaikan share ekspor tertinggi.",
    color: "#0284C7",
    value: (point) => point.avgGrowthShare
  },
  {
    key: "strategicPotential",
    title: "Top Strategic Potential",
    description:
      "Produk dengan kombinasi daya saing, posisi EPD, dan X Model paling kuat.",
    color: "#D97706",
    value: (point) => strategicPotentialScore(point)
  }
];

function RankingTooltip({ active, payload }: RankingTooltipProps) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;

  return (
    <div className="max-w-[300px] rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <div className="font-semibold text-slate-900">{row.kode}</div>
      <div className="mt-1 line-clamp-2 text-slate-600">{row.fullLabel}</div>
      <div className="mt-3 rounded-md bg-slate-50 p-2">
        <div className="font-semibold text-slate-700">
          {formatRcaEpdNumber(row.value)}
        </div>
        <div className="mt-1 text-slate-500">{row.kategoriEpd}</div>
        <div className="text-slate-500">{row.xModel}</div>
      </div>
    </div>
  );
}

function toRankingRows(points: RcaEpdChartPoint[], metric: RankingMetric) {
  return points
    .filter((point) => (metric.filter ? metric.filter(point) : true))
    .sort((left, right) => metric.value(right) - metric.value(left))
    .slice(0, 10)
    .map((point) => ({
      kode: point.kode,
      label: `${point.kode} ${shortProductLabel(point.komoditas, 24)}`,
      fullLabel: point.komoditas,
      value: metric.value(point),
      kategoriEpd: point.kategoriEpd,
      xModel: point.xModel
    }));
}

export function AnalisisRCAEPDTopProductsChart({ rows }: Props) {
  const points = React.useMemo(() => toRcaEpdChartPoints(rows), [rows]);
  const rankings = React.useMemo(
    () =>
      rankingMetrics.map((metric) => ({
        metric,
        rows: toRankingRows(points, metric)
      })),
    [points]
  );

  if (!points.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Data RCA EPD belum cukup untuk menampilkan Top-N Ranking Dashboard.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Top-N Ranking Dashboard
        </h3>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Ranking cepat untuk melihat produk paling kuat, paling tumbuh, dan
          paling layak diprioritaskan.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {rankings.map(({ metric, rows: rankingRows }) => (
          <RankingChartCard
            key={metric.key}
            metric={metric}
            rows={rankingRows}
          />
        ))}
      </div>
    </section>
  );
}

type RankingChartCardProps = {
  metric: RankingMetric;
  rows: RankingRow[];
};

function RankingChartCard({ metric, rows }: RankingChartCardProps) {
  const xDomain = React.useMemo(
    () =>
      dynamicDomain(
        rows.map((row) => row.value),
        {
          includeZero: true,
          minimumPadding:
            metric.key === "growthDemand" || metric.key === "growthShare"
              ? 0.01
              : 0.1,
          paddingRatio: 0.18,
          fallbackSpan: 1
        }
      ),
    [metric.key, rows]
  );

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-900">
          {metric.title}
        </div>
        <div className="mt-1 text-xs text-slate-500">{metric.description}</div>
      </div>

      {rows.length ? (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 8, right: 22, bottom: 8, left: 138 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={xDomain}
                allowDataOverflow
                tickFormatter={formatRankingAxisValue}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="label"
                type="category"
                width={138}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <ReferenceLine x={0} stroke="#0F172A" strokeOpacity={0.32} />
              <Tooltip content={<RankingTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} minPointSize={4}>
                {rows.map((row) => (
                  <Cell key={row.kode} fill={metric.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-lg bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">
          Data untuk ranking ini belum tersedia.
        </div>
      )}
    </div>
  );
}
