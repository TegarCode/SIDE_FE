import React from "react";
import type { AnalisisRcaEpdRow } from "@/type/analisis";
import {
  categoryColor,
  isCompetitiveRca,
  toRcaEpdChartPoints,
  type EpdQuadrantKey
} from "@/components/analisis/potensi-daya-saing/rcaEpdChartUtils";

type Props = {
  rows: AnalisisRcaEpdRow[];
};

type MatrixColumn = {
  id: "competitive" | "emerging";
  label: string;
  description: string;
};

const columns: MatrixColumn[] = [
  {
    id: "competitive",
    label: "RCA > 1",
    description: "Produk sudah relatif kompetitif."
  },
  {
    id: "emerging",
    label: "RCA <= 1",
    description: "Produk masih butuh penguatan daya saing."
  }
];

const quadrants: EpdQuadrantKey[] = [
  "Rising Star",
  "Lost Opportunity",
  "Falling Star",
  "Retreat"
];

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const value =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function AnalisisRCAEPDStrategicHeatmap({ rows }: Props) {
  const points = React.useMemo(() => toRcaEpdChartPoints(rows), [rows]);

  const matrix = React.useMemo(
    () =>
      quadrants.map((quadrant) => ({
        quadrant,
        color: categoryColor(quadrant),
        values: columns.map((column) => {
          const count = points.filter((point) => {
            if (point.derivedQuadrant !== quadrant) return false;

            return column.id === "competitive"
              ? isCompetitiveRca(point.avgRca)
              : !isCompetitiveRca(point.avgRca);
          }).length;

          return {
            columnId: column.id,
            count,
            share: points.length ? (count / points.length) * 100 : 0
          };
        })
      })),
    [points]
  );

  const maxCount = Math.max(
    1,
    ...matrix.flatMap((rowItem) => rowItem.values.map((value) => value.count))
  );

  if (!points.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Data RCA EPD belum cukup untuk menampilkan Strategic Matrix Heatmap.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Strategic Matrix Heatmap
        </h3>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Distribusi produk berdasarkan kategori EPD dan ambang daya saing `RCA{" "}
          {" > "} 1`. Heatmap ini membantu melihat berapa banyak produk yang
          benar-benar berada pada posisi strategis, bukan hanya besar secara
          angka.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Kategori EPD
                </th>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((rowItem) => (
                <tr key={rowItem.quadrant}>
                  <td className="border-b border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: rowItem.color }}
                      />
                      <span className="font-semibold text-slate-900">
                        {rowItem.quadrant}
                      </span>
                    </div>
                  </td>
                  {rowItem.values.map((value) => {
                    const opacity = 0.12 + (value.count / maxCount) * 0.32;

                    return (
                      <td
                        key={`${rowItem.quadrant}-${value.columnId}`}
                        className="border-b border-slate-200 px-4 py-3"
                      >
                        <div
                          className="rounded-md px-3 py-2"
                          style={{
                            backgroundColor: hexToRgba(rowItem.color, opacity)
                          }}
                        >
                          <div className="font-semibold text-slate-900">
                            {value.count}
                          </div>
                          <div className="text-xs text-slate-600">
                            {value.share.toFixed(1)}% dari produk
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          {columns.map((column) => (
            <div
              key={column.id}
              className="rounded-lg border border-slate-200 p-3"
            >
              <div className="text-xs font-semibold uppercase text-slate-500">
                {column.label}
              </div>
              <p className="mt-2 text-sm text-slate-700">
                {column.description}
              </p>
            </div>
          ))}

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-600">
            <div className="font-semibold text-slate-900">Cara baca cepat</div>
            <p className="mt-2">
              Sel dengan intensitas lebih tinggi berarti lebih banyak produk
              terkonsentrasi pada kombinasi strategi tersebut. Fokus pertama
              biasanya ada pada `Rising Star + RCA {">"} 1` dan `Lost
              Opportunity + RCA {">"} 1`.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
