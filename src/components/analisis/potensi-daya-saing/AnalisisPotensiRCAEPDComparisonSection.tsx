import React from "react";
import { AnalisisRCAEPDComparisonTableCard } from "@/components/analisis/potensi-daya-saing/AnalisisRCAEPDComparisonTableCard";
import { AnalisisRCAEPDSpiderComparisonChart } from "@/components/analisis/potensi-daya-saing/AnalisisRCAEPDSpiderComparisonChart";
import type { AnalisisRcaEpdComparisonResult } from "@/type/analisis";

type Props = {
  data: AnalisisRcaEpdComparisonResult | null;
  loading?: boolean;
  errorMessage?: string | null;
};

export default function AnalisisPotensiRCAEPDComparisonSection({
  data,
  loading = false,
  errorMessage = null
}: Props) {
  const originLabel = data?.origin.name ?? data?.origin.code ?? "-";
  const destinationLabel =
    data?.destination.name ?? data?.destination.code ?? "-";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">
          Country Comparison (RCA & EPD)
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Asal: {originLabel} -&gt; Tujuan: {destinationLabel}
        </p>
      </div>

      <AnalisisRCAEPDComparisonTableCard
        title="Country Comparison RCA & EPD"
        originLabel={originLabel}
        destinationLabel={destinationLabel}
        rows={data?.rows ?? []}
        loading={loading}
        errorMessage={errorMessage}
        sourceName={data?.sourceName}
      />

      {!loading && !errorMessage ? (
        <AnalisisRCAEPDSpiderComparisonChart
          rows={data?.rows ?? []}
          originLabel={originLabel}
          destinationLabel={destinationLabel}
        />
      ) : null}
    </div>
  );
}
