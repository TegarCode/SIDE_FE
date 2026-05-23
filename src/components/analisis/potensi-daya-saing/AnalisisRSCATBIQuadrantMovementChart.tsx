import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { AnalisisRscaTbiRow } from "@/type/analisis";

type Props = {
  rows: AnalisisRscaTbiRow[];
};

type Quadrant = "A" | "B" | "C" | "D";

type MovementPoint = {
  kode: string;
  nama: string;
  from: Quadrant;
  to: Quadrant;
  rsca2019: number | null;
  tbi2019: number | null;
  rsca2023: number | null;
  tbi2023: number | null;
};

const quadrants: Quadrant[] = ["A", "B", "C", "D"];

const quadrantTone: Record<
  Quadrant,
  { bg: string; text: string; bar: string }
> = {
  A: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "#059669" },
  B: { bg: "bg-sky-50", text: "text-sky-700", bar: "#0284C7" },
  C: { bg: "bg-amber-50", text: "text-amber-700", bar: "#B45309" },
  D: { bg: "bg-rose-50", text: "text-rose-700", bar: "#BE123C" }
};

function asQuadrant(value: string | null | undefined): Quadrant | null {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  return quadrants.includes(normalized as Quadrant)
    ? (normalized as Quadrant)
    : null;
}

function formatMetric(value: number | null) {
  return value == null ? "-" : value.toFixed(4);
}

export function AnalisisRSCATBIQuadrantMovementChart({ rows }: Props) {
  const movements = React.useMemo<MovementPoint[]>(
    () =>
      rows
        .map((row) => {
          const from = asQuadrant(row.pm2019);
          const to = asQuadrant(row.pm2023);
          if (!from || !to) return null;

          return {
            kode: row.kode ?? row.hs4,
            nama: row.nama,
            from,
            to,
            rsca2019: row.rsca2019,
            tbi2019: row.tbi2019,
            rsca2023: row.rsca2023,
            tbi2023: row.tbi2023
          };
        })
        .filter((item): item is MovementPoint => item != null),
    [rows]
  );

  const matrix = React.useMemo(
    () =>
      quadrants.flatMap((from) =>
        quadrants.map((to) => ({
          from,
          to,
          count: movements.filter(
            (movement) => movement.from === from && movement.to === to
          ).length
        }))
      ),
    [movements]
  );

  const maxCount = Math.max(...matrix.map((item) => item.count), 1);
  const changedCount = movements.filter((item) => item.from !== item.to).length;
  const stableCount = movements.length - changedCount;
  const destinationSummary = quadrants.map((quadrant) => ({
    quadrant,
    count: movements.filter((item) => item.to === quadrant).length
  }));

  const topMovements = React.useMemo(
    () =>
      movements
        .filter((item) => item.from !== item.to)
        .sort((left, right) => {
          const leftScore =
            Math.abs((left.rsca2023 ?? 0) - (left.rsca2019 ?? 0)) +
            Math.abs((left.tbi2023 ?? 0) - (left.tbi2019 ?? 0));
          const rightScore =
            Math.abs((right.rsca2023 ?? 0) - (right.rsca2019 ?? 0)) +
            Math.abs((right.tbi2023 ?? 0) - (right.tbi2019 ?? 0));
          return rightScore - leftScore;
        })
        .slice(0, 8),
    [movements]
  );

  if (!movements.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Data PM 2019 dan PM 2023 belum cukup untuk menampilkan pergerakan
        kuadran produk.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Pergerakan Kuadran PM 2019 - 2023
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan perpindahan produk antar kuadran A, B, C, dan D
            berdasarkan PM 2019 dan PM 2023.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-slate-200 px-3 py-2">
            <div className="font-semibold text-slate-900">
              {movements.length}
            </div>
            <div className="text-slate-500">Produk</div>
          </div>
          <div className="rounded-lg border border-slate-200 px-3 py-2">
            <div className="font-semibold text-slate-900">{changedCount}</div>
            <div className="text-slate-500">Bergerak</div>
          </div>
          <div className="rounded-lg border border-slate-200 px-3 py-2">
            <div className="font-semibold text-slate-900">{stableCount}</div>
            <div className="text-slate-500">Tetap</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="mb-3 text-xs font-semibold uppercase text-slate-500">
            Matrix Pergerakan
          </div>
          <div className="grid grid-cols-[72px_repeat(4,minmax(72px,1fr))] gap-2 text-xs">
            <div />
            {quadrants.map((to) => (
              <div
                key={to}
                className="rounded-md bg-slate-100 px-2 py-1 text-center font-semibold text-slate-600"
              >
                Ke {to}
              </div>
            ))}

            {quadrants.map((from) => (
              <React.Fragment key={from}>
                <div className="flex items-center justify-end pr-1 font-semibold text-slate-600">
                  Dari {from}
                </div>
                {quadrants.map((to) => {
                  const cell = matrix.find(
                    (item) => item.from === from && item.to === to
                  );
                  const count = cell?.count ?? 0;
                  const intensity = Math.max(0.12, count / maxCount);

                  return (
                    <div
                      key={`${from}-${to}`}
                      className={`rounded-lg border px-2 py-3 text-center ${
                        from === to
                          ? "border-slate-300 bg-slate-50"
                          : "border-indigo-100 bg-indigo-50"
                      }`}
                      style={{
                        opacity: count ? 0.45 + intensity * 0.55 : 0.55
                      }}
                    >
                      <div className="text-lg font-bold tabular-nums text-slate-900">
                        {count}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        {from} -&gt; {to}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <div className="mb-3 text-xs font-semibold uppercase text-slate-500">
            Komposisi Kuadran 2023
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationSummary}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="quadrant" tickLine={false} axisLine={false} />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {destinationSummary.map((entry) => (
                    <Cell
                      key={entry.quadrant}
                      fill={quadrantTone[entry.quadrant].bar}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-3">
        <div className="mb-3 text-xs font-semibold uppercase text-slate-500">
          Produk yang Berpindah Kuadran
        </div>
        {topMovements.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {topMovements.map((item) => (
              <div
                key={`${item.kode}-${item.from}-${item.to}`}
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {item.kode}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                      quadrantTone[item.from].bg
                    } ${quadrantTone[item.from].text}`}
                  >
                    {item.from}
                  </span>
                  <span className="text-xs text-slate-400">-&gt;</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                      quadrantTone[item.to].bg
                    } ${quadrantTone[item.to].text}`}
                  >
                    {item.to}
                  </span>
                </div>
                <div className="mt-2 line-clamp-2 text-sm font-medium text-slate-800">
                  {item.nama}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    RSCA: {formatMetric(item.rsca2019)} -&gt;{" "}
                    {formatMetric(item.rsca2023)}
                  </div>
                  <div>
                    TBI: {formatMetric(item.tbi2019)} -&gt;{" "}
                    {formatMetric(item.tbi2023)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">
            Tidak ada produk yang berpindah kuadran pada data yang ditampilkan.
          </div>
        )}
      </div>
    </section>
  );
}
