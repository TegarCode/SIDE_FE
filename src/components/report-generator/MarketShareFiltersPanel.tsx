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

export type MarketShareFilterValue = {
  origin: string;
  destination: string | null;
  strategy1: string | null;
  top_n: number | null;
  sumber: string | null;
  year: string | null;
};

type MarketShareFiltersPanelProps = {
  value: MarketShareFilterValue;
  onChange: (next: MarketShareFilterValue) => void;
  onSubmit: (next: MarketShareFilterValue) => void;
  onReset: () => void;
  originOptions: SelectOption[];
  destinationOptions: SelectOption[];
  sourceOptions: SelectOption[];
  yearOptions: SelectOption[];
  badge?: string;
  loading?: boolean;
  submitted?: boolean;
};

export const MARKET_SHARE_STRATEGY_OPTIONS: SelectOption[] = [
  { value: "EXPORT", label: "Ekspor" },
  { value: "IMPORT", label: "Impor" }
];

export const MARKET_SHARE_TOP_PRODUCT_OPTIONS: SelectOption[] = [
  { value: "5", label: "Top 5 Produk" },
  { value: "10", label: "Top 10 Produk" },
  { value: "20", label: "Top 20 Produk" },
  { value: "50", label: "Top 50 Produk" }
];

function getLabel(value: string | null, options: SelectOption[]) {
  if (!value) return "-";
  return options.find((option) => option.value === value)?.label ?? value;
}

export function MarketShareFiltersPanel({
  value,
  onChange,
  onSubmit,
  onReset,
  originOptions,
  destinationOptions,
  sourceOptions,
  yearOptions,
  badge,
  loading = false,
  submitted = false
}: MarketShareFiltersPanelProps) {
  const errors = {
    destination:
      submitted && !value.destination ? "Group tujuan wajib dipilih." : null,
    strategy1:
      submitted && !value.strategy1 ? "Tipe perdagangan wajib dipilih." : null,
    top_n: submitted && !value.top_n ? "Top produk wajib dipilih." : null,
    sumber: submitted && !value.sumber ? "Sumber wajib dipilih." : null,
    year: submitted && !value.year ? "Tahun perdagangan wajib dipilih." : null
  };

  const hasError = Object.values(errors).some(Boolean);

  return (
    <Accordion
      title="Filter Market Share"
      description="Pilih negara/entitas asal, group tujuan, tipe perdagangan, top produk, sumber, dan tahun perdagangan sebelum memuat laporan market share."
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
            Tipe: {getLabel(value.strategy1, MARKET_SHARE_STRATEGY_OPTIONS)}
          </span>
          <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-violet-200">
            Top Produk:{" "}
            {value.top_n
              ? getLabel(String(value.top_n), MARKET_SHARE_TOP_PRODUCT_OPTIONS)
              : "-"}
          </span>
          <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 ring-1 ring-rose-200">
            Tahun: {getLabel(value.year, yearOptions)}
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
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Group Tujuan
            </p>
            <Select
              value={value.destination}
              options={destinationOptions}
              onChange={(next) =>
                onChange({ ...value, destination: next || null })
              }
              placeholder="Pilih group tujuan"
              size="sm"
              error={errors.destination ?? undefined}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tipe Perdagangan
            </p>
            <Select
              value={value.strategy1}
              options={MARKET_SHARE_STRATEGY_OPTIONS}
              onChange={(next) =>
                onChange({ ...value, strategy1: next || null })
              }
              placeholder="Pilih tipe perdagangan"
              size="sm"
              error={errors.strategy1 ?? undefined}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Top Produk yang Diambil
            </p>
            <Select
              value={value.top_n ? String(value.top_n) : null}
              options={MARKET_SHARE_TOP_PRODUCT_OPTIONS}
              onChange={(next) =>
                onChange({ ...value, top_n: next ? Number(next) : null })
              }
              placeholder="Pilih top produk"
              size="sm"
              error={errors.top_n ?? undefined}
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
              placeholder="Pilih sumber data"
              size="sm"
              error={errors.sumber ?? undefined}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tahun Perdagangan
            </p>
            <Select
              value={value.year}
              options={yearOptions}
              onChange={(next) => onChange({ ...value, year: next || null })}
              placeholder="Pilih tahun perdagangan"
              size="sm"
              error={errors.year ?? undefined}
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
