import React from "react";
import { SummaryCard } from "@/components/ui/SummaryCard";
import type { MitraSingleTourismData } from "@/type/mitra";
import {
  formatTourismPeriod,
  toTourismSummaryCards
} from "@/components/mitra/pariwisata/helpers";

type MitraTourismSummarySectionProps = {
  data: MitraSingleTourismData | null | undefined;
  loading: boolean;
  countryLabel: string;
};

export function MitraTourismSummarySection({
  data,
  loading,
  countryLabel
}: MitraTourismSummarySectionProps) {
  const cards = React.useMemo(
    () => (data ? toTourismSummaryCards(data) : []),
    [data]
  );
  const periodLabel = formatTourismPeriod(
    data?.year ?? null,
    data?.prevYear ?? null
  );

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Ringkasan Nilai
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan jumlah wisatawan masuk, belanja wisatawan, dan wisatawan
          keluar pada tahun terbaru yang tersedia, berikut perbandingan dengan
          tahun sebelumnya. {periodLabel}.
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
          <span>Asal</span>
          <span className="font-medium text-slate-700">Dunia</span>
          <span>Tujuan</span>
          <span className="font-medium text-slate-700">{countryLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {(loading ? Array.from({ length: 2 }, (_, index) => index) : cards).map(
          (card, index) => (
            <SummaryCard
              key={
                typeof card === "number"
                  ? `tourism-summary-skeleton-${card}`
                  : card.id
              }
              card={
                typeof card === "number"
                  ? {
                      id: `tourism-summary-skeleton-${card}`,
                      title: "",
                      tone: index === 0 ? "blue" : "sky",
                      unit: "",
                      value: null,
                      prevValue: null,
                      year: null,
                      prevYear: null,
                      note: "",
                      highlight: null,
                      prevHighlight: null,
                      highlightType: "none",
                      sourceName: null
                    }
                  : {
                      ...card,
                      title: `${card.title} ${data?.year ?? "-"}`
                    }
              }
              loading={loading}
            />
          )
        )}
      </div>
    </section>
  );
}
