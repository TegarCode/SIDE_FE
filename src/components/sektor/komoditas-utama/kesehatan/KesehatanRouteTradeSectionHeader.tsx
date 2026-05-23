import { Button } from "@/components/ui/Button";
import type { KesehatanMetricMode } from "./KesehatanTradeHeroSection";

type KesehatanRouteTradeSectionHeaderProps = {
  metricMode: KesehatanMetricMode;
  onMetricChange: (value: KesehatanMetricMode) => void;
};

export function KesehatanRouteTradeSectionHeader({
  metricMode,
  onMetricChange
}: KesehatanRouteTradeSectionHeaderProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Perdagangan Rute Sektor Kesehatan
          </h2>
          <p className="max-w-3xl text-sm text-slate-600">
            Analitik lanjutan sektor kesehatan berdasarkan negara asal, negara
            tujuan, dan HS Code terpilih untuk melihat total ekspor, total
            impor, atau total perdagangan.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto lg:flex lg:flex-wrap lg:justify-end">
          <Button
            type="button"
            variant={metricMode === "total_export" ? "primary" : "outline"}
            onClick={() => onMetricChange("total_export")}
            className="w-full justify-center rounded-full px-3 py-1.5 text-xs font-semibold lg:w-auto"
          >
            Total Ekspor
          </Button>
          <Button
            type="button"
            variant={metricMode === "total_import" ? "primary" : "outline"}
            onClick={() => onMetricChange("total_import")}
            className="w-full justify-center rounded-full px-3 py-1.5 text-xs font-semibold lg:w-auto"
          >
            Total Impor
          </Button>
          <Button
            type="button"
            variant={metricMode === "total_trade" ? "primary" : "outline"}
            onClick={() => onMetricChange("total_trade")}
            className="w-full justify-center rounded-full px-3 py-1.5 text-xs font-semibold lg:w-auto"
          >
            Total Perdagangan
          </Button>
        </div>
      </div>
    </section>
  );
}
