import React from "react";
import { AnalisisRCAEPDBubbleQuadrantChart } from "@/components/analisis/potensi-daya-saing/AnalisisRCAEPDBubbleQuadrantChart";
import { AnalisisRCAEPDCalculationTableCard } from "@/components/analisis/potensi-daya-saing/AnalisisRCAEPDCalculationTableCard";
import { AnalisisRCAEPDOpportunityAlert } from "@/components/analisis/potensi-daya-saing/AnalisisRCAEPDOpportunityAlert";
import { AnalisisRCAEPDStrategicHeatmap } from "@/components/analisis/potensi-daya-saing/AnalisisRCAEPDStrategicHeatmap";
import { AnalisisRCAEPDStrategyMatrixChart } from "@/components/analisis/potensi-daya-saing/AnalisisRCAEPDStrategyMatrixChart";
import { AnalisisRCAEPDTableCard } from "@/components/analisis/potensi-daya-saing/AnalisisRCAEPDTableCard";
import { AnalisisRCAEPDTopProductsChart } from "@/components/analisis/potensi-daya-saing/AnalisisRCAEPDTopProductsChart";
import { AnalisisRCAEPDXModelFunnel } from "@/components/analisis/potensi-daya-saing/AnalisisRCAEPDXModelFunnel";
import type {
  AnalisisRcaEpdCalculationResult,
  AnalisisRcaEpdResult
} from "@/type/analisis";
import type { OriginSingleDestinationSingleFilterValue } from "@/validators/originSingleDestinationSingleFilters";

type Props = {
  filters: OriginSingleDestinationSingleFilterValue;
  tableMode: "country" | "country_detail";
  onTableModeChange: (mode: "country" | "country_detail") => void;
  data: AnalisisRcaEpdResult | null;
  detailData: AnalisisRcaEpdCalculationResult | null;
  loading?: boolean;
  errorMessage?: string | null;
};

export default function RcaEpdSection({
  filters,
  tableMode,
  onTableModeChange,
  data,
  detailData,
  loading = false,
  errorMessage = null
}: Props) {
  const activeData = tableMode === "country" ? data : detailData;
  const originLabel =
    activeData?.origin.name ??
    activeData?.origin.code ??
    filters?.origin?.country ??
    "-";
  const destinationLabel =
    activeData?.destination.name ??
    activeData?.destination.code ??
    filters?.destination?.country ??
    "-";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">
          Country Trade Analysis (RCA & EPD)
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Asal: {originLabel} -&gt; Tujuan: {destinationLabel}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 text-xs font-semibold text-slate-500">
          Tampilan data
        </div>
        <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-700">
          <button
            type="button"
            onClick={() => onTableModeChange("country")}
            aria-pressed={tableMode === "country"}
            className={`rounded px-3 py-1.5 transition-colors ${
              tableMode === "country"
                ? "bg-white text-[#384AA0] shadow-sm"
                : "hover:bg-white/80 hover:text-slate-950"
            }`}
          >
            RCA-EPD Negara
          </button>
          <button
            type="button"
            onClick={() => onTableModeChange("country_detail")}
            aria-pressed={tableMode === "country_detail"}
            className={`rounded px-3 py-1.5 transition-colors ${
              tableMode === "country_detail"
                ? "bg-white text-[#384AA0] shadow-sm"
                : "hover:bg-white/80 hover:text-slate-950"
            }`}
          >
            RCA-EPD Negara Detil
          </button>
        </div>
      </div>

      {tableMode === "country" ? (
        <>
          <AnalisisRCAEPDTableCard
            title="RCA-EPD Negara"
            originLabel={originLabel}
            destinationLabel={destinationLabel}
            rows={data?.rows ?? []}
            loading={loading}
            errorMessage={errorMessage}
            sourceName={data?.sourceName}
          />
          {!loading && !errorMessage ? (
            <>
              <AnalisisRCAEPDBubbleQuadrantChart rows={data?.rows ?? []} />
              <AnalisisRCAEPDOpportunityAlert rows={data?.rows ?? []} />
              <AnalisisRCAEPDStrategyMatrixChart rows={data?.rows ?? []} />
              <AnalisisRCAEPDStrategicHeatmap rows={data?.rows ?? []} />
              <AnalisisRCAEPDXModelFunnel rows={data?.rows ?? []} />
              <AnalisisRCAEPDTopProductsChart rows={data?.rows ?? []} />
            </>
          ) : null}
        </>
      ) : (
        <AnalisisRCAEPDCalculationTableCard
          title="RCA-EPD Negara Detil"
          originLabel={originLabel}
          destinationLabel={destinationLabel}
          rows={detailData?.rows ?? []}
          loading={loading}
          errorMessage={errorMessage}
          sourceName={detailData?.sourceName}
        />
      )}
    </div>
  );
}
