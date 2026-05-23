import React from "react";
import { AnalisisRSCATBIComparisonTableCard } from "@/components/analisis/potensi-daya-saing/AnalisisRSCATBIComparisonTableCard";
import { CountryComparisonQuadrantAnalysisSection } from "@/components/analisis/potensi-daya-saing/CountryComparisonQuadrantAnalysisSection";
import type { AnalisisRscaTbiComparisonResult } from "@/type/analisis";

type Props = {
  data: AnalisisRscaTbiComparisonResult | null;
  loading?: boolean;
  errorMessage?: string | null;
};

export default function AnalisisPotensiRSCATBIComparisonSection({
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
          Country Comparison (RSCA & TBI)
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Asal: {originLabel} -&gt; Tujuan: {destinationLabel}
        </p>
      </div>

      <AnalisisRSCATBIComparisonTableCard
        title="Country Comparison RSCA & TBI"
        originLabel={originLabel}
        destinationLabel={destinationLabel}
        rows={data?.rows ?? []}
        loading={loading}
        errorMessage={errorMessage}
        sourceName={data?.sourceName}
      />

      {!loading && !errorMessage ? (
        <CountryComparisonQuadrantAnalysisSection
          rows={data?.rows ?? []}
          originLabel={originLabel}
          destinationLabel={destinationLabel}
        />
      ) : null}
    </div>
  );
}
