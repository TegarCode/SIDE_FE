import { DiplomasiLegendTooltip } from "@/components/ui/DiplomasiLegendTooltip";

const LEGEND_ITEMS = [
  { colorClassName: "bg-orange-200", label: "Nilai Perdagangan Internasional" },
  {
    colorClassName: "bg-purple-200",
    label: "Neraca Perdagangan Internasional"
  },
  { colorClassName: "bg-emerald-200", label: "Jumlah Ekspor" },
  { colorClassName: "bg-rose-200", label: "Jumlah Impor" },
  { colorClassName: "bg-blue-200", label: "Investasi Masuk" },
  { colorClassName: "bg-cyan-200", label: "Investasi Keluar" },
  { colorClassName: "bg-sky-200", label: "Kunjungan Wisatawan Keluar" },
  { colorClassName: "bg-amber-200", label: "Mitra Dagang Terbesar" }
];

export function MitraOverviewLegend() {
  return <DiplomasiLegendTooltip items={LEGEND_ITEMS} side="left" />;
}
