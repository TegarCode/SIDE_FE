import React from "react";
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { FilterMultiSelect } from "@/components/ui/Form/FilterMultiSelect";
import { Select } from "@/components/ui/Form/Select";
import type { SelectOption } from "@/type/indonesiaDiplomasi";

export type KerjasamaPerdaganganFilterValue = {
  origin: string;
  destinations: string[];
  sumber: string | null;
  year_start: string | null;
  year_end: string | null;
};

type CountryOption = SelectOption & {
  alpha2?: string | null;
};

type KerjasamaPerdaganganFiltersPanelProps = {
  value: KerjasamaPerdaganganFilterValue;
  onChange: (next: KerjasamaPerdaganganFilterValue) => void;
  onSubmit: (next: KerjasamaPerdaganganFilterValue) => void;
  onReset: () => void;
  originOptions: SelectOption[];
  destinationOptions: CountryOption[];
  sourceOptions: SelectOption[];
  yearStartOptions: SelectOption[];
  yearEndOptions: SelectOption[];
  badge?: string;
  loading?: boolean;
  submitted?: boolean;
  getCountryAlpha2?: (option: SelectOption) => string | null;
};

function getLabel(
  value: string | null,
  options: SelectOption[],
  fallback = "-"
) {
  if (!value) return fallback;
  return options.find((option) => option.value === value)?.label ?? fallback;
}

export function KerjasamaPerdaganganFiltersPanel({
  value,
  onChange,
  onSubmit,
  onReset,
  originOptions,
  destinationOptions,
  sourceOptions,
  yearStartOptions,
  yearEndOptions,
  badge,
  loading = false,
  submitted = false,
  getCountryAlpha2
}: KerjasamaPerdaganganFiltersPanelProps) {
  const errors = {
    destinations:
      submitted && value.destinations.length === 0
        ? "Negara/Entitas tujuan wajib dipilih."
        : null,
    sumber: submitted && !value.sumber ? "Sumber wajib dipilih." : null,
    year_start:
      submitted && !value.year_start ? "Tahun awal wajib dipilih." : null,
    year_end: submitted && !value.year_end ? "Tahun akhir wajib dipilih." : null
  };

  const hasError = Object.values(errors).some(Boolean);

  return (
    <Accordion
      title="Filter Kerjasama Perdagangan"
      description="Pilih negara/entitas asal, satu atau beberapa negara tujuan, sumber data, dan rentang tahun sebelum memuat laporan kerjasama perdagangan."
      badge={badge}
      summary={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
            Asal: {getLabel(value.origin, originOptions, "Indonesia")}
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
            Tujuan:{" "}
            {value.destinations.length > 0
              ? `${value.destinations.length} negara`
              : "-"}
          </span>
          <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-200">
            Sumber: {getLabel(value.sumber, sourceOptions)}
          </span>
          <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-violet-200">
            Tahun: {value.year_start ?? "-"}-{value.year_end ?? "-"}
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
              size="sm"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Negara/Entitas Tujuan
            </p>
            <FilterMultiSelect
              options={destinationOptions}
              value={value.destinations}
              onChange={(destinations) => onChange({ ...value, destinations })}
              placeholder="Pilih negara/entitas tujuan"
              size="sm"
              showSelectedList
              countLabel={(count) => `Terpilih ${count} negara`}
              getOptionAlpha2={getCountryAlpha2}
              error={errors.destinations ?? undefined}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Sumber
            </p>
            <Select
              value={value.sumber}
              options={sourceOptions}
              onChange={(next) => onChange({ ...value, sumber: next || null })}
              placeholder="Pilih sumber"
              size="sm"
              error={errors.sumber ?? undefined}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tahun Awal
            </p>
            <Select
              value={value.year_start}
              options={yearStartOptions}
              onChange={(next) =>
                onChange({ ...value, year_start: next || null })
              }
              placeholder="Pilih tahun awal"
              size="sm"
              error={errors.year_start ?? undefined}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tahun Akhir
            </p>
            <Select
              value={value.year_end}
              options={yearEndOptions}
              onChange={(next) =>
                onChange({ ...value, year_end: next || null })
              }
              placeholder="Pilih tahun akhir"
              size="sm"
              error={errors.year_end ?? undefined}
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
              disabled={loading || hasError}
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
