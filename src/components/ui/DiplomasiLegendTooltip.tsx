import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

type LegendItem = {
  colorClassName: string;
  label: string;
};

const DEFAULT_LEGEND_ITEMS: LegendItem[] = [
  {
    colorClassName: "bg-orange-200",
    label: "Mitra Dagang Utama dan Nilai Perdagangan"
  },
  {
    colorClassName: "bg-purple-200",
    label: "Neraca Perdagangan dan Negara Surplus Terbesar"
  },
  {
    colorClassName: "bg-emerald-200",
    label: "Jumlah Ekspor dan Negara Tujuan Ekspor"
  },
  {
    colorClassName: "bg-rose-200",
    label: "Jumlah Impor dan Negara Asal Impor"
  },
  {
    colorClassName: "bg-cyan-200",
    label: "Total Wisatawan Masuk dan Asal Wisatawan"
  },
  {
    colorClassName: "bg-blue-200",
    label: "Total Investasi Masuk dan Asal Investasi Masuk"
  }
];

type DiplomasiLegendTooltipProps = {
  items?: LegendItem[];
  side?: "left" | "right";
};

export function DiplomasiLegendTooltip({
  items = DEFAULT_LEGEND_ITEMS,
  side = "right"
}: DiplomasiLegendTooltipProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        aria-expanded={open}
      >
        <InformationCircleIcon className="h-5 w-5 text-slate-500" />
        Legenda Kartu
      </button>

      {open ? (
        <div
          className={cn(
            "absolute top-1/2 z-50 w-[min(90vw,760px)] -translate-y-1/2 rounded-2xl border border-white/10 bg-neutral-900/95 p-4 text-white shadow-2xl backdrop-blur",
            side === "left" ? "right-full mr-3" : "left-full ml-3"
          )}
        >
          <span
            className={cn(
              "absolute top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-neutral-900/95",
              side === "left"
                ? "-right-1.5 border-r border-t border-white/20"
                : "-left-1.5 border-b border-l border-white/20"
            )}
          />
          <h3 className="text-base font-bold">Legenda Kartu</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <span
                  className={`inline-block h-3.5 w-3.5 shrink-0 rounded-sm ring-1 ring-white/30 ${item.colorClassName}`}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
