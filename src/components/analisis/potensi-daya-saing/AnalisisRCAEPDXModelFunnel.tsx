import React from "react";
import type { AnalisisRcaEpdRow } from "@/type/analisis";
import {
  isCompetitiveRca,
  toRcaEpdChartPoints,
  xModelScore
} from "@/components/analisis/potensi-daya-saing/rcaEpdChartUtils";

type Props = {
  rows: AnalisisRcaEpdRow[];
};

type FunnelStep = {
  key: string;
  label: string;
  description: string;
  count: number;
  percentage: number;
  color: string;
};

export function AnalisisRCAEPDXModelFunnel({ rows }: Props) {
  const points = React.useMemo(() => toRcaEpdChartPoints(rows), [rows]);

  const steps = React.useMemo<FunnelStep[]>(() => {
    const total = points.length;
    const competitive = points.filter((point) =>
      isCompetitiveRca(point.avgRca)
    );
    const risingStar = competitive.filter(
      (point) => point.derivedQuadrant === "Rising Star"
    );
    const optimistic = risingStar.filter(
      (point) => xModelScore(point.xModel) >= 90
    );

    const createStep = (
      key: string,
      label: string,
      description: string,
      count: number,
      color: string
    ) => ({
      key,
      label,
      description,
      count,
      percentage: total ? (count / total) * 100 : 0,
      color
    });

    return [
      createStep(
        "total",
        "Total Produk",
        "Semua produk yang sedang masuk dalam filter.",
        total,
        "#384AA0"
      ),
      createStep(
        "competitive",
        "RCA > 1",
        "Produk yang sudah relatif kompetitif.",
        competitive.length,
        "#0284C7"
      ),
      createStep(
        "rising",
        "Rising Star",
        "Produk kompetitif di pasar yang masih tumbuh.",
        risingStar.length,
        "#059669"
      ),
      createStep(
        "optimistic",
        "Pengembangan Optimis",
        "Produk Rising Star dengan sinyal X Model paling positif.",
        optimistic.length,
        "#D97706"
      )
    ];
  }, [points]);

  if (!points.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Data RCA EPD belum cukup untuk menampilkan X-Model Funnel.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          X-Model Funnel
        </h3>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Funnel ini membantu melihat berapa banyak produk yang benar-benar
          lolos dari sisi daya saing, dinamika pasar, sampai rekomendasi
          pengembangan pasar yang paling optimis.
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className="rounded-lg border border-slate-200 p-3"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {index + 1}. {step.label}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {step.description}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold text-slate-900">
                  {step.count}
                </div>
                <div className="text-xs text-slate-500">
                  {step.percentage.toFixed(1)}% dari total
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-full bg-slate-100 p-1">
              <div
                className="h-8 rounded-full px-3 text-xs font-semibold leading-8 text-white transition-all"
                style={{
                  width: `${Math.max(step.percentage, 18)}%`,
                  backgroundColor: step.color
                }}
              >
                {step.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-600">
        <div className="font-semibold text-slate-900">Makna praktis</div>
        <p className="mt-2">
          Funnel ini cocok untuk ringkasan eksekutif. Semakin kecil langkah
          terakhir dibanding total produk, semakin selektif daftar produk yang
          benar-benar layak diprioritaskan dalam strategi pengembangan pasar.
        </p>
      </div>
    </section>
  );
}
