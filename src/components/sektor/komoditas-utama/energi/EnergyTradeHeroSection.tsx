import { Button } from "@/components/ui/Button";

export type EnergyMetricMode = "total_export" | "total_import" | "total_trade";

type EnergyTradeHeroSectionProps = {
  metricMode: EnergyMetricMode;
  onMetricChange: (value: EnergyMetricMode) => void;
};

export function EnergyTradeHeroSection({
  metricMode,
  onMetricChange
}: EnergyTradeHeroSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Perdagangan Indonesia Ke Global Sektor Energi
          </h2>
          <p className="max-w-3xl text-sm text-slate-600">
            Ringkasan analitik perdagangan sektor energi Indonesia ke global
            berdasarkan filter HS Code terpilih, mencakup total ekspor, total
            impor, dan total perdagangan.
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
