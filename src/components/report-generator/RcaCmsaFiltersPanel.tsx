import React from "react";
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Form/Select";
import type { SelectOption } from "@/type/indonesiaDiplomasi";

export type RcaCmsaFilterValue = {
  origin: string;
  destination: string | null;
  strategy1: string;
};

type RcaCmsaFiltersPanelProps = {
  value: RcaCmsaFilterValue;
  onChange: (next: RcaCmsaFilterValue) => void;
  onSubmit: (next: RcaCmsaFilterValue) => void;
  onReset: () => void;
  originOptions: SelectOption[];
  destinationOptions: SelectOption[];
  badge?: string;
  loading?: boolean;
  submitted?: boolean;
};

export const RCA_CMSA_STRATEGY_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "Semua" },
  { value: "EXPORT", label: "Ekspor" },
  { value: "IMPORT", label: "Impor" },
  { value: "FDI INBOUND", label: "FDI Masuk" },
  { value: "FDI OUTBOUND", label: "FDI Keluar" }
];

function getLabel(value: string | null, options: SelectOption[]) {
  if (!value) return "-";
  return options.find((option) => option.value === value)?.label ?? value;
}

export function RcaCmsaFiltersPanel({
  value,
  onChange,
  onSubmit,
  onReset,
  originOptions,
  destinationOptions,
  badge,
  loading = false,
  submitted = false
}: RcaCmsaFiltersPanelProps) {
  const validationError =
    submitted && !value.destination
      ? "Negara/Entitas tujuan wajib dipilih."
      : null;
  const isValid = !validationError;

  return (
    <Accordion
      title="Filter RCA-CMSA"
      description="Pilih negara/entitas asal, tujuan, dan jenis analisis sebelum memuat laporan RCA-CMSA."
      badge={badge}
      summary={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
            Asal: {getLabel(value.origin, originOptions)}
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
            Tujuan: {getLabel(value.destination, destinationOptions)}
          </span>
          <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-200">
            Analisis: {getLabel(value.strategy1, RCA_CMSA_STRATEGY_OPTIONS)}
          </span>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Negara/Entitas Asal
            </p>
            <Select
              value={value.origin}
              options={originOptions}
              onChange={(next) => onChange({ ...value, origin: next })}
              isDisabled
              size="sm"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Negara/Entitas Tujuan
            </p>
            <Select
              value={value.destination}
              options={destinationOptions}
              onChange={(next) =>
                onChange({ ...value, destination: next || null })
              }
              placeholder="Pilih negara/entitas tujuan"
              size="sm"
              error={validationError ?? undefined}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Jenis Analisis
            </p>
            <Select
              value={value.strategy1}
              options={RCA_CMSA_STRATEGY_OPTIONS}
              onChange={(next) =>
                onChange({ ...value, strategy1: next || "ALL" })
              }
              size="sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2.5">
          <p className="text-[10px] font-medium text-slate-500">
            Perubahan filter akan diterapkan saat Anda menekan{" "}
            <span className="font-semibold text-slate-700">Cari Data</span>.
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onReset}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-1.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
            >
              <ArrowPathIcon className="h-3 w-3" />
              Reset
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => onSubmit(value)}
              disabled={loading || !isValid}
              className="inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-[13px] font-semibold shadow-sm"
            >
              <MagnifyingGlassIcon className="h-3 w-3" />
              Cari Data
            </Button>
          </div>
        </div>
      </div>
    </Accordion>
  );
}
