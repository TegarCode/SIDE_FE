import React from "react";
import { AnalisisRSCACalculationTableCard } from "@/components/analisis/potensi-daya-saing/AnalisisRSCACalculationTableCard";
import { AnalisisRSCATBIQuadrantMovementChart } from "@/components/analisis/potensi-daya-saing/AnalisisRSCATBIQuadrantMovementChart";
import { AnalisisRSCATBIMovementTrajectoryChart } from "@/components/analisis/potensi-daya-saing/AnalisisRSCATBIMovementTrajectoryChart";
import { AnalisisRSCATableCard } from "@/components/analisis/potensi-daya-saing/AnalisisRSCATableCard";
import type {
  AnalisisRscaTbiCalculationResult,
  AnalisisRscaTbiResult
} from "@/type/analisis";
import type { OriginSingleDestinationSingleFilterValue } from "@/validators/originSingleDestinationSingleFilters";

type Props = {
  filters: OriginSingleDestinationSingleFilterValue;
  tableMode: "country" | "country_detail";
  onTableModeChange: (mode: "country" | "country_detail") => void;
  data: AnalisisRscaTbiResult | null;
  detailData: AnalisisRscaTbiCalculationResult | null;
  loading?: boolean;
  errorMessage?: string | null;
};

export default function RscaTbiSection({
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
      <div className="p-4 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold">
          Country Trade Analysis (RSCA & TBI)
        </h2>

        <p className="text-sm text-gray-500 mt-1">
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
            RSCA-TBI Negara
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
            RSCA-TBI Negara Detil
          </button>
        </div>
      </div>

      {tableMode === "country" ? (
        <>
          <AnalisisRSCATableCard
            title="RSCA-TBI Negara"
            originLabel={originLabel}
            destinationLabel={destinationLabel}
            rows={data?.rows ?? []}
            loading={loading}
            errorMessage={errorMessage}
            sourceName={data?.sourceName}
          />
          {!loading && !errorMessage ? (
            <>
              <AnalisisRSCATBIQuadrantMovementChart rows={data?.rows ?? []} />
              <AnalisisRSCATBIMovementTrajectoryChart rows={data?.rows ?? []} />
            </>
          ) : null}
        </>
      ) : (
        <AnalisisRSCACalculationTableCard
          title="RSCA-TBI Negara Detil"
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
