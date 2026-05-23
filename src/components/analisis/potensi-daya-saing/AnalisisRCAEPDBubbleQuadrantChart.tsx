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
  dynamicDomain,
  deterministicJitter,
  formatRcaEpdNumber,
  toRcaEpdChartPoints,
  uniqueLegendItems,
  type RcaEpdChartPoint
} from "@/components/analisis/potensi-daya-saing/rcaEpdChartUtils";

type Props = {
  rows: AnalisisRcaEpdRow[];
};

type BubblePoint = RcaEpdChartPoint & {
  x: number;
  y: number;
  z: number;
};

type BubbleTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload?: BubblePoint;
  }>;
};

type BubbleLimit = 50 | 100 | -1;

function BubbleTooltip({ active, payload }: BubbleTooltipProps) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className="max-w-[320px] rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <div className="font-semibold text-slate-900">{point.kode}</div>
      <div className="mt-1 line-clamp-2 text-slate-600">{point.komoditas}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-slate-50 p-2">
          <div className="font-semibold text-slate-700">Demand</div>
          <div>{formatRcaEpdNumber(point.avgGrowthDemand)}</div>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <div className="font-semibold text-slate-700">Share</div>
          <div>{formatRcaEpdNumber(point.avgGrowthShare)}</div>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <div className="font-semibold text-slate-700">AVG RCA</div>
          <div>{formatRcaEpdNumber(point.avgRca)}</div>
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <div className="font-semibold text-slate-700">Kuadran</div>
          <div>{point.derivedQuadrant}</div>
        </div>
      </div>
      <div className="mt-3 rounded-md bg-indigo-50 p-2 text-[#384AA0]">
        <div className="font-semibold">{point.kategoriEpd}</div>
        <div className="mt-0.5 text-slate-600">{point.xModel}</div>
      </div>
    </div>
  );
}

export function AnalisisRCAEPDBubbleQuadrantChart({ rows }: Props) {
  const [limit, setLimit] = React.useState<BubbleLimit>(100);
  const points = React.useMemo(() => toRcaEpdChartPoints(rows), [rows]);

  const visiblePoints = React.useMemo(() => {
    const sorted = [...points].sort(
      (left, right) => right.avgRca - left.avgRca
    );
    return limit === -1 ? sorted : sorted.slice(0, limit);
  }, [limit, points]);

  const chartData = React.useMemo<BubblePoint[]>(
    () =>
      visiblePoints.map((point) => ({
        ...point,
        x: point.avgGrowthDemand + deterministicJitter(point.key, 1, 0.018),
        y: point.avgGrowthShare + deterministicJitter(point.key, 2, 0.018),
        z: point.bubbleSize
      })),
    [visiblePoints]
  );

  const xDomain = dynamicDomain(
    visiblePoints.map((point) => point.avgGrowthDemand),
    {
      includeZero: true,
      minimumPadding: 0.05,
      paddingRatio: 0.2,
      fallbackSpan: 0.5
    }
  );
  const yDomain = dynamicDomain(
    visiblePoints.map((point) => point.avgGrowthShare),
    {
      includeZero: true,
      minimumPadding: 0.05,
      paddingRatio: 0.2,
      fallbackSpan: 0.5
    }
  );
  const categoryLegend = uniqueLegendItems(
    visiblePoints,
    "kategoriEpd",
    "categoryColor"
  );
  const topLabels = visiblePoints.slice(0, 8);

  if (!points.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Data AVG Growth Demand dan AVG Growth Share belum cukup untuk
        menampilkan Bubble Quadrant EPD.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Bubble Quadrant EPD
          </h3>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            X menunjukkan pertumbuhan demand, Y menunjukkan pertumbuhan share,
            ukuran bubble menunjukkan AVG RCA, warna mengikuti Kategori EPD, dan
            skala sumbu menyesuaikan sebaran data yang sedang tampil.
          </p>
        </div>

        <select
          value={limit}
          onChange={(event) =>
            setLimit(Number(event.target.value) as BubbleLimit)
          }
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-slate-300"
        >
          <option value={50}>Top 50 AVG RCA</option>
          <option value={100}>Top 100 AVG RCA</option>
          <option value={-1}>Semua produk</option>
        </select>
      </div>

      <div className="grid gap-3 text-xs sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="font-semibold text-slate-900">
            {visiblePoints.length}
          </div>
          <div className="text-slate-500">Produk ditampilkan</div>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="font-semibold text-slate-900">
            {
              points.filter((item) => item.derivedQuadrant === "Rising Star")
                .length
            }
          </div>
          <div className="text-slate-500">Rising Star</div>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="font-semibold text-slate-900">
            {
              points.filter(
                (item) => item.derivedQuadrant === "Lost Opportunity"
              ).length
            }
          </div>
          <div className="text-slate-500">Lost Opportunity</div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
        <div className="text-xs font-semibold uppercase text-slate-500">
          Panduan visual
        </div>
        <div className="mt-3 grid gap-3 text-xs md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
            <div className="font-semibold text-slate-700">Garis tengah</div>
            <p className="mt-1 text-slate-500">
              Pembatas demand growth = 0 dan share growth = 0, bukan sekadar
              titik tengah visual.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
            <div className="font-semibold text-slate-700">Ukuran bubble</div>
            <p className="mt-1 text-slate-500">
              Semakin besar bubble, semakin tinggi AVG RCA.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
            <div className="font-semibold text-slate-700">Warna</div>
            <p className="mt-1 text-slate-500">
              Warna mengikuti Kategori EPD dari data.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {categoryLegend.map((item) => (
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

      <div className="relative h-[540px] rounded-lg border border-slate-200 p-3">
        <div className="pointer-events-none absolute inset-6 z-10 grid grid-cols-2 grid-rows-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <div>Falling Star</div>
          <div className="text-right">Rising Star</div>
          <div className="flex items-end">Retreat</div>
          <div className="flex items-end justify-end">Lost Opportunity</div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 28, bottom: 32, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              domain={xDomain}
              allowDataOverflow
              tickLine={false}
              axisLine={false}
              label={{
                value: "AVG Growth Demand",
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
                value: "AVG Growth Share",
                angle: -90,
                position: "insideLeft"
              }}
            />
            <ZAxis dataKey="z" range={[42, 720]} />
            <ReferenceLine x={0} stroke="#0F172A" strokeOpacity={0.45} />
            <ReferenceLine y={0} stroke="#0F172A" strokeOpacity={0.45} />
            <Tooltip content={<BubbleTooltip />} />
            <Scatter data={chartData} name="Produk RCA EPD">
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.categoryColor} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-slate-200 p-3">
        <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
          Label produk utama
        </div>
        <div className="flex flex-wrap gap-2">
          {topLabels.map((item) => (
            <span
              key={item.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
              title={item.komoditas}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.categoryColor }}
              />
              <span className="font-semibold">{item.kode}</span>
              <span className="max-w-[220px] truncate">{item.komoditas}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
