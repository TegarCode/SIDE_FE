import React from "react";
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { MultiSelect } from "@/components/ui/Form/MultiSelect";
import { Select } from "@/components/ui/Form/Select";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import type {
  InfrastrukturCategoryOption,
  InfrastrukturFilterState,
  InfrastrukturSubregionOption
} from "@/type/indonesiaInfrastruktur";
import { validateInfrastrukturFilters } from "@/validators/infrastrukturFilters";

type InfrastrukturFiltersPanelProps = {
  regionOptions: SelectOption[];
  subregionOptions: InfrastrukturSubregionOption[];
  categoryOptions: InfrastrukturCategoryOption[];
  value: InfrastrukturFilterState;
  loading: boolean;
  requestLoading: boolean;
  onSubmit: (value: InfrastrukturFilterState) => void;
  onReset: () => void;
};

const CHIP_STYLES = {
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  region: "bg-amber-50 text-amber-800 ring-amber-200",
  subregion: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  category: "bg-indigo-50 text-indigo-700 ring-indigo-200"
} as const;

const ALL_VALUE = "__ALL__";

function getLabel(value: string | null, options: SelectOption[]) {
  if (!value) return "Semua";
  return options.find((option) => option.value === value)?.label ?? value;
}

function areStringArraysEqual(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    left.every((entry, index) => entry === right[index])
  );
}

export function InfrastrukturFiltersPanel({
  regionOptions,
  subregionOptions,
  categoryOptions,
  value,
  loading,
  requestLoading,
  onSubmit,
  onReset
}: InfrastrukturFiltersPanelProps) {
  const [draftRegion, setDraftRegion] = React.useState<string | null>(
    value.region
  );
  const [draftSubregion, setDraftSubregion] = React.useState<string | null>(
    value.subregion
  );
  const [draftCategories, setDraftCategories] = React.useState<string[]>(
    value.categories
  );

  React.useEffect(() => {
    setDraftRegion((current) =>
      current === value.region ? current : value.region
    );
  }, [value.region]);

  React.useEffect(() => {
    setDraftSubregion((current) =>
      current === value.subregion ? current : value.subregion
    );
  }, [value.subregion]);

  React.useEffect(() => {
    setDraftCategories((current) =>
      areStringArraysEqual(current, value.categories)
        ? current
        : value.categories
    );
  }, [value.categories]);

  const filteredSubregionOptions = React.useMemo(
    () =>
      draftRegion
        ? subregionOptions.filter(
            (option) => option.regionValue === draftRegion
          )
        : subregionOptions,
    [draftRegion, subregionOptions]
  );
  const regionSelectOptions = React.useMemo(
    () => [{ value: ALL_VALUE, label: "Semua Region" }, ...regionOptions],
    [regionOptions]
  );
  const subregionSelectOptions = React.useMemo(
    () => [
      { value: ALL_VALUE, label: "Semua Subregion" },
      ...filteredSubregionOptions
    ],
    [filteredSubregionOptions]
  );

  React.useEffect(() => {
    if (!draftSubregion) return;
    if (
      filteredSubregionOptions.some((option) => option.value === draftSubregion)
    )
      return;
    setDraftSubregion(null);
  }, [draftSubregion, filteredSubregionOptions]);

  const isDirty =
    draftRegion !== value.region ||
    draftSubregion !== value.subregion ||
    !areStringArraysEqual(draftCategories, value.categories);

  const selectedCategoryLabel = React.useMemo(() => {
    if (
      draftCategories.length === categoryOptions.length &&
      categoryOptions.length > 0
    ) {
      return "Semua kategori";
    }
    if (!draftCategories.length) return "Semua kategori";
    if (draftCategories.length === 1) {
      return (
        categoryOptions.find((option) => option.value === draftCategories[0])
          ?.label ?? draftCategories[0]
      );
    }
    return `${draftCategories.length} kategori dipilih`;
  }, [categoryOptions, draftCategories]);
  const validationErrors = React.useMemo(
    () =>
      validateInfrastrukturFilters({
        region: draftRegion,
        subregion: draftSubregion,
        categories: draftCategories
      }),
    [draftCategories, draftRegion, draftSubregion]
  );
  const isValid = Object.keys(validationErrors).length === 0;

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="h-16 animate-pulse rounded-md bg-slate-100" />
          <div className="h-16 animate-pulse rounded-md bg-slate-100" />
          <div className="h-28 animate-pulse rounded-md bg-slate-100 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <Accordion
      title="Filter Infrastruktur Diplomasi"
      description="Pilih region, subregion, dan kategori infrastruktur. Klik header untuk membuka atau menutup filter."
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
            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${CHIP_STYLES.region}`}
          >
            Region: {getLabel(draftRegion, regionOptions)}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${CHIP_STYLES.subregion}`}
          >
            Subregion: {getLabel(draftSubregion, filteredSubregionOptions)}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${CHIP_STYLES.category}`}
          >
            {selectedCategoryLabel}
          </span>
        </div>
      }
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-md bg-slate-50 px-3 py-2.5">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Region (Ditjen)
          </label>
          <Select
            value={draftRegion ?? ALL_VALUE}
            options={regionSelectOptions}
            onChange={(next) => {
              const normalized = next === ALL_VALUE ? null : next;
              setDraftRegion(normalized);
              setDraftSubregion(null);
            }}
            isLoading={loading}
            placeholder="Semua region"
          />
        </div>

        <div className="rounded-md bg-slate-50 px-3 py-2.5">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Subregion (Wilayah)
          </label>
          <Select
            value={draftSubregion ?? ALL_VALUE}
            options={subregionSelectOptions}
            onChange={(next) =>
              setDraftSubregion(next === ALL_VALUE ? null : next)
            }
            isLoading={loading}
            placeholder="Semua subregion"
          />
        </div>

        <div className="rounded-md bg-slate-50 px-3 py-2.5 lg:col-span-2">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Kategori
          </label>
          <MultiSelect
            value={draftCategories}
            options={categoryOptions.map((option) => ({
              value: option.value,
              label: `${option.groupLabel} - ${option.label}`
            }))}
            onChange={setDraftCategories}
            isLoading={loading}
            placeholder="Semua kategori"
            closeMenuOnSelect={false}
          />
          {validationErrors.categories ? (
            <p className="mt-2 text-xs text-amber-700">
              {validationErrors.categories}
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
                region: draftRegion,
                subregion: draftSubregion,
                categories: draftCategories
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
