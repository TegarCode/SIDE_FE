import React from "react";
import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";
import type { AnalisisRcaEpdRow } from "@/type/analisis";
import {
  deriveStrategicRecommendation,
  dynamicDomain,
  deterministicJitter,
  formatLogRcaTick,
  formatRcaEpdNumber,
  logRcaValue,
  strategicRecommendationLegend,
  toRcaEpdChartPoints,
  uniqueLegendItems,
  type RcaEpdChartPoint
} from "@/components/analisis/potensi-daya-saing/rcaEpdChartUtils";

type Props = {
  rows: AnalisisRcaEpdRow[];
};

type StrategyPoint = RcaEpdChartPoint & {
  x: number;
  y: number;
  z: number;
  recommendation: string;
  recommendationReason: string;
  recommendationColor: string;
  recommendationPriority: "tinggi" | "menengah" | "rendah";
  logRca: number;
};

type StrategyTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload?: StrategyPoint;
  }>;
};

function StrategyTooltip({ active, payload }: StrategyTooltipProps) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className="max-w-[320px] rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <div className="font-semibold text-slate-900">{point.kode}</div>
      <div className="mt-1 line-clamp-2 text-slate-600">{point.komoditas}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-slate-50 p-2">
          <div className="font-semibold text-slate-700">AVG RCA</div>
          <div>{formatRcaEpdNumber(point.avgRca)}</div>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <div className="font-semibold text-slate-700">Demand</div>
          <div>{formatRcaEpdNumber(point.avgGrowthDemand)}</div>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <div className="font-semibold text-slate-700">Kuadran EPD</div>
          <div>{point.derivedQuadrant}</div>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <div className="font-semibold text-slate-700">Kategori EPD</div>
          <div>{point.kategoriEpd}</div>
        </div>
      </div>
      <div
        className="mt-3 rounded-md p-2"
        style={{
          backgroundColor: `${point.recommendationColor}14`,
          color: point.recommendationColor
        }}
      >
        <div className="font-semibold">{point.recommendation}</div>
        <div className="mt-0.5 text-slate-600">{point.xModel}</div>
        <div className="mt-2 text-slate-600">{point.recommendationReason}</div>
      </div>
    </div>
  );
}

export function AnalisisRCAEPDStrategyMatrixChart({ rows }: Props) {
  const [showPriorityOnly, setShowPriorityOnly] = React.useState(false);
  const points = React.useMemo(() => toRcaEpdChartPoints(rows), [rows]);

  const chartData = React.useMemo<StrategyPoint[]>(
    () =>
      points
        .map((point) => {
          const recommendation = deriveStrategicRecommendation(point);

          return {
            ...point,
            logRca: logRcaValue(point.avgRca),
            x:
              logRcaValue(point.avgRca) +
              deterministicJitter(point.key, 3, 0.01),
            y: point.avgGrowthDemand + deterministicJitter(point.key, 4, 0.01),
            z: 58,
            recommendation: recommendation.label,
            recommendationReason: recommendation.reason,
            recommendationColor: recommendation.color,
            recommendationPriority: recommendation.priority
          };
        })
        .filter((point) =>
          showPriorityOnly ? point.recommendationPriority === "tinggi" : true
        ),
    [points, showPriorityOnly]
  );

  const xDomain = dynamicDomain(
    chartData.map((point) => point.logRca),
    {
      includeZero: true,
      minimumPadding: 0.18,
      paddingRatio: 0.18,
      fallbackSpan: 1
    }
  );
  const yDomain = dynamicDomain(
    chartData.map((point) => point.avgGrowthDemand),
    {
      includeZero: true,
      minimumPadding: 0.05,
      paddingRatio: 0.2,
      fallbackSpan: 0.5
    }
  );
  const xModelLegend = uniqueLegendItems(points, "xModel", "xModelColor");
  const recommendationLegend = React.useMemo(
    () => strategicRecommendationLegend(),
    []
  );
  const recommendationCounts = React.useMemo(() => {
    const counts = new Map(
      recommendationLegend.map((item) => [item.label, { ...item, count: 0 }])
    );

    points.forEach((point) => {
      const result = deriveStrategicRecommendation(point);
      const current = counts.get(result.label);
      if (current) {
        current.count += 1;
      }
    });

    return Array.from(counts.values());
  }, [points, recommendationLegend]);

  if (!points.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Data AVG RCA dan AVG Growth Demand belum cukup untuk menampilkan
        Strategy Matrix.
      </section>
    );
  }

  if (!chartData.length) {
    return (
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Strategy Matrix RCA - Demand
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Tidak ada produk yang cocok dengan filter strategy yang sedang
            aktif.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Strategy Matrix RCA - Demand
          </h3>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Matriks prioritas strategi berdasarkan AVG RCA, posisi EPD, dan X
            Model. Sumbu X menunjukkan RCA pada skala log, sumbu Y menunjukkan
            pertumbuhan demand, sementara rekomendasi membaca konteks strategi
            dari materi RCA-EPD-XModel.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={showPriorityOnly}
            onChange={(event) => setShowPriorityOnly(event.target.checked)}
          />
          Hanya prioritas tinggi
        </label>
      </div>

      <div className="grid gap-2 text-xs md:grid-cols-3 xl:grid-cols-6">
        {recommendationCounts.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 px-3 py-2"
            style={{ borderColor: `${item.color}40` }}
          >
            <div className="font-semibold" style={{ color: item.color }}>
              {item.count}
            </div>
            <div className="text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
        <div className="text-xs font-semibold uppercase text-slate-500">
          Panduan strategi
        </div>
        <div className="mt-3 grid gap-3 text-xs md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
            <div className="font-semibold text-slate-700">
              Rising Star + RCA tinggi
            </div>
            <p className="mt-1 text-slate-500">
              Produk sudah kompetitif di pasar yang tumbuh. Fokus pada ekspansi
              agresif.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
            <div className="font-semibold text-slate-700">
              Rising Star + RCA rendah
            </div>
            <p className="mt-1 text-slate-500">
              Permintaan pasar tumbuh, tetapi daya saing belum kuat. Fokus pada
              penetrasi pasar.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
            <div className="font-semibold text-slate-700">Lost Opportunity</div>
            <p className="mt-1 text-slate-500">
              Permintaan pasar naik, tetapi share tertinggal. Ini adalah alert
              peluang yang belum termanfaatkan.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 xl:col-span-1">
            <div className="font-semibold text-slate-700">
              Falling Star + RCA tinggi
            </div>
            <p className="mt-1 text-slate-500">
              Daya saing masih kuat, tetapi dinamika pasar melambat. Cocok untuk
              maintain niche market.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 xl:col-span-2">
            <div className="font-semibold text-slate-700">
              Retreat atau Falling Star dengan RCA rendah
            </div>
            <p className="mt-1 text-slate-500">
              Prioritasnya lebih rendah. Gunakan X Model untuk melihat apakah
              produk masih layak dipertahankan secara selektif atau sudah perlu
              diversifikasi.
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Sumbu X memakai `log10(AVG RCA)` dengan garis netral di `RCA = 1`,
          sehingga produk dengan RCA sangat besar tetap terbaca bersama produk
          lain.
        </p>
        <div className="mt-3 text-[11px] font-semibold uppercase text-slate-500">
          Warna rekomendasi
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {recommendationLegend.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
        <div className="mt-3 text-[11px] font-semibold uppercase text-slate-500">
          Referensi X Model
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {xModelLegend.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative h-[500px] rounded-lg border border-slate-200 p-3">
        <div className="pointer-events-none absolute inset-6 z-10 grid grid-cols-2 grid-rows-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <div>Maintain / Reposition</div>
          <div className="text-right">Ekspansi / Alert</div>
          <div className="flex items-end">Diversifikasi</div>
          <div className="flex items-end justify-end">Penetrasi</div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 28, bottom: 32, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              domain={xDomain}
              allowDataOverflow
              tickFormatter={formatLogRcaTick}
              tickLine={false}
              axisLine={false}
              label={{
                value: "AVG RCA (log scale)",
                position: "insideBottom",
                offset: -16
              }}
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={yDomain}
              allowDataOverflow
              tickLine={false}
              axisLine={false}
              label={{
                value: "AVG Growth Demand",
                angle: -90,
                position: "insideLeft"
              }}
            />
            <ZAxis dataKey="z" range={[64, 64]} />
            <ReferenceLine x={0} stroke="#0F172A" strokeOpacity={0.45} />
            <ReferenceLine y={0} stroke="#0F172A" strokeOpacity={0.45} />
            <Tooltip content={<StrategyTooltip />} />
            <Scatter data={chartData} name="Strategy Matrix">
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.recommendationColor} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
