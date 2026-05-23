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
import type {
  EconomicIndicatorFilterState,
  EconomicIndicatorOption
} from "@/type/indonesiaIndikatorEkonomi";
import { validateIndikatorEkonomiFilters } from "@/validators/indikatorEkonomiFilters";

type IndikatorEkonomiFiltersPanelProps = {
  yearOptions: SelectOption[];
  indicatorOptions: EconomicIndicatorOption[];
  value: EconomicIndicatorFilterState;
  requestLoading: boolean;
  loading: boolean;
  onSubmit: (value: EconomicIndicatorFilterState) => void;
  onReset: () => void;
};

const CHIP_STYLES = {
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  year: "bg-amber-50 text-amber-800 ring-amber-200",
  indicator: "bg-indigo-50 text-indigo-700 ring-indigo-200"
} as const;

function getIndicatorLabel(
  indicatorId: string | null,
  indicatorOptions: EconomicIndicatorOption[]
) {
  if (!indicatorId) return "Indikator belum dipilih";
  return (
    indicatorOptions.find((option) => option.value === indicatorId)?.label ??
    indicatorId
  );
}

export function IndikatorEkonomiFiltersPanel({
  yearOptions,
  indicatorOptions,
  value,
  requestLoading,
  loading,
  onSubmit,
  onReset
}: IndikatorEkonomiFiltersPanelProps) {
  const [draftYear, setDraftYear] = React.useState<string | null>(value.year);
  const [draftIndicatorId, setDraftIndicatorId] = React.useState<string | null>(
    value.indicatorId
  );

  React.useEffect(() => {
    setDraftYear((current) => (current === value.year ? current : value.year));
  }, [value.year]);

  React.useEffect(() => {
    setDraftIndicatorId((current) =>
      current === value.indicatorId ? current : value.indicatorId
    );
  }, [value.indicatorId]);

  const isDirty =
    draftYear !== value.year || draftIndicatorId !== value.indicatorId;
  const indicatorLabel = React.useMemo(
    () => getIndicatorLabel(draftIndicatorId, indicatorOptions),
    [draftIndicatorId, indicatorOptions]
  );
  const validationErrors = React.useMemo(
    () =>
      validateIndikatorEkonomiFilters({
        year: draftYear,
        indicatorId: draftIndicatorId
      }),
    [draftIndicatorId, draftYear]
  );
  const isValid = Object.keys(validationErrors).length === 0;

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="h-16 animate-pulse rounded-md bg-slate-100" />
          <div className="h-16 animate-pulse rounded-md bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <Accordion
      title="Filter Indikator Ekonomi"
      description="Pilih tahun dan indikator untuk melihat data makroekonomi dan daya saing. Klik header untuk membuka atau menutup filter."
      badge={isDirty ? "Filter belum diterapkan" : "Filter Aktif"}
      summary={
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${CHIP_STYLES.info}`}
          >
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${CHIP_STYLES.year}`}
          >
            Tahun {draftYear ?? "-"}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${CHIP_STYLES.indicator}`}
          >
            {indicatorLabel}
          </span>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md bg-slate-50 px-3 py-2.5">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Tahun
          </label>
          <Select
            value={draftYear}
            options={yearOptions}
            onChange={setDraftYear}
            isLoading={loading}
            isSearchable={false}
            placeholder="Pilih tahun"
          />
          {validationErrors.year ? (
            <p className="mt-2 text-xs text-amber-700">
              {validationErrors.year}
            </p>
          ) : null}
        </div>
        <div className="rounded-md bg-slate-50 px-3 py-2.5">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Data Makroekonomi dan Daya Saing
          </label>
          <Select
            value={draftIndicatorId}
            options={indicatorOptions}
            onChange={setDraftIndicatorId}
            isLoading={loading}
            isSearchable={false}
            placeholder="Pilih indikator"
          />
          {validationErrors.indicatorId ? (
            <p className="mt-2 text-xs text-amber-700">
              {validationErrors.indicatorId}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2.5">
        <p className="text-[10px] font-medium text-slate-500">
          Perubahan filter akan diterapkan saat Anda menekan{" "}
          <span className="font-semibold text-slate-700">Cari Data</span>.
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={onReset}
            disabled={requestLoading}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-1.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          >
            <ArrowPathIcon className="h-3 w-3" />
            Reset
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() =>
              onSubmit({
                year: draftYear,
                indicatorId: draftIndicatorId
              })
            }
            disabled={requestLoading || !isValid}
            className="inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-[13px] font-semibold shadow-sm"
          >
            <MagnifyingGlassIcon className="h-3 w-3" />
            Cari Data
          </Button>
        </div>
      </div>
    </Accordion>
  );
}
