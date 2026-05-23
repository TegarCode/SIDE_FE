import React from "react";
import { AnalisisRSCACalculationTableCard } from "@/components/analisis/potensi-daya-saing/AnalisisRSCACalculationTableCard";
import type { AnalisisRscaTbiCalculationResult } from "@/type/analisis";
import type { OriginSingleDestinationSingleFilterValue } from "@/validators/originSingleDestinationSingleFilters";

type Props = {
  filters: OriginSingleDestinationSingleFilterValue;
  data: AnalisisRscaTbiCalculationResult | null;
  loading?: boolean;
  errorMessage?: string | null;
};

export default function AnalisisPotensiRSCATBICalculationSection({
  filters,
  data,
  loading = false,
  errorMessage = null
}: Props) {
  const originLabel =
    data?.origin.name ?? data?.origin.code ?? filters?.origin?.country ?? "-";
  const destinationLabel =
    data?.destination.name ??
    data?.destination.code ??
    filters?.destination?.country ??
    "-";

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold">
          Country Comparison (RSCA & TBI - Calculation)
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Asal: {originLabel} -&gt; Tujuan: {destinationLabel}
        </p>
      </div>

      <AnalisisRSCACalculationTableCard
        title="Perbandingan RSCA & TBI (Calculation)"
        originLabel={originLabel}
        destinationLabel={destinationLabel}
        rows={data?.rows ?? []}
        loading={loading}
        errorMessage={errorMessage}
        sourceName={data?.sourceName}
      />
    </div>
  );
}
