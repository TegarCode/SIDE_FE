import React from "react";
import type { AnalisisRcaEpdRow } from "@/type/analisis";
import {
  formatRcaEpdNumber,
  isCompetitiveRca,
  toRcaEpdChartPoints,
  xModelScore
} from "@/components/analisis/potensi-daya-saing/rcaEpdChartUtils";

type Props = {
  rows: AnalisisRcaEpdRow[];
};

type OpportunityPoint = ReturnType<typeof toRcaEpdChartPoints>[number] & {
  opportunityScore: number;
  xScore: number;
};

function buildOpportunityScore(
  point: ReturnType<typeof toRcaEpdChartPoints>[number]
) {
  return (
    Math.max(point.avgGrowthDemand, 0) * 100 +
    Math.abs(Math.min(point.avgGrowthShare, 0)) * 100 +
    Math.min(point.avgRca, 4) * 10
  );
}

export function AnalisisRCAEPDOpportunityAlert({ rows }: Props) {
  const points = React.useMemo(() => toRcaEpdChartPoints(rows), [rows]);

  const opportunities = React.useMemo<OpportunityPoint[]>(
    () =>
      points
        .filter(
          (point) =>
            point.derivedQuadrant === "Lost Opportunity" ||
            point.kategoriEpd.toLowerCase().includes("lost")
        )
        .map((point) => ({
          ...point,
          opportunityScore: buildOpportunityScore(point),
          xScore: xModelScore(point.xModel)
        }))
        .sort((left, right) => {
          if (right.opportunityScore !== left.opportunityScore) {
            return right.opportunityScore - left.opportunityScore;
          }

          if (right.avgGrowthDemand !== left.avgGrowthDemand) {
            return right.avgGrowthDemand - left.avgGrowthDemand;
          }

          if (right.avgRca !== left.avgRca) {
            return right.avgRca - left.avgRca;
          }

          return left.avgGrowthShare - right.avgGrowthShare;
        }),
    [points]
  );

  const topOpportunities = opportunities.slice(0, 8);
  const competitiveCount = opportunities.filter((point) =>
    isCompetitiveRca(point.avgRca)
  ).length;
  const highPotentialCount = opportunities.filter(
    (point) => point.xScore >= 75
  ).length;

  if (!points.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Data RCA EPD belum cukup untuk membaca Opportunity Alert.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Top Lost Opportunity Products
        </h3>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Produk di area ini berada pada pasar yang tumbuh, tetapi pertumbuhan
          share Indonesia tertinggal. Ini adalah sinyal peluang yang belum
          termanfaatkan dan paling perlu dipantau.
        </p>
      </div>

      <div className="grid gap-3 text-xs md:grid-cols-3">
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2">
          <div className="font-semibold text-amber-700">
            {opportunities.length}
          </div>
          <div className="text-slate-500">Total Lost Opportunity</div>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="font-semibold text-slate-900">{competitiveCount}</div>
          <div className="text-slate-500">RCA sudah di atas 1</div>
        </div>
        <div className="rounded-lg border border-slate-200 px-3 py-2">
          <div className="font-semibold text-slate-900">
            {highPotentialCount}
          </div>
          <div className="text-slate-500">X Model potensial / optimis</div>
        </div>
      </div>

      {topOpportunities.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {topOpportunities.map((point) => (
            <article
              key={point.key}
              className="rounded-lg border border-slate-200 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {point.kode}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {point.komoditas}
                  </div>
                </div>

                <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                  Skor {point.opportunityScore.toFixed(1)}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
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
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700">
                  {point.kategoriEpd}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">
                  {point.xModel}
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Permintaan pasar bergerak naik, tetapi share ekspor belum ikut
                tumbuh. Produk ini cocok menjadi fokus perbaikan penetrasi pasar
                dan respons supply chain.
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Belum ada produk yang jatuh pada kategori Lost Opportunity untuk
          filter yang sedang aktif.
        </div>
      )}
    </section>
  );
}
