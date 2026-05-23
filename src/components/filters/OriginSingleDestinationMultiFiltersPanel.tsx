import React from "react";
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { CountryGeoFilter } from "@/components/ui/Form/CountryGeoFilter";
import { Select } from "@/components/ui/Form/Select";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import type { MitraCountryOption, MitraSubregionOption } from "@/type/mitra";
import {
  validateOriginSingleDestinationMultiFilters,
  type OriginSingleDestinationMultiFilterValue
} from "@/validators/originSingleDestinationMultiFilters";

type OriginSingleDestinationMultiFiltersPanelProps = {
  regionOptions: SelectOption[];
  subregionOptions: MitraSubregionOption[];
  countryOptions: MitraCountryOption[];
  value: OriginSingleDestinationMultiFilterValue;
  loading: boolean;
  requestLoading?: boolean;
  title?: string;
  description?: string;
  originDefaultCountry?: string;
  destinationDefaultValues?: string[];
  onSubmit: (value: OriginSingleDestinationMultiFilterValue) => void;
  onReset: () => void;
};

const ALL_VALUE = "__ALL__";
const DEFAULT_ORIGIN_COUNTRY = "IDN";
const DEFAULT_DESTINATION = "CHN";

function getLabel(value: string | null, options: SelectOption[]) {
  if (!value) return "Semua";
  return options.find((option) => option.value === value)?.label ?? value;
}

function deriveOriginDefaults(
  countryOptions: MitraCountryOption[],
  originCountry: string
) {
  const matchedCountry =
    countryOptions.find((option) => option.value === originCountry) ?? null;
  return {
    region: matchedCountry?.regionValue ?? null,
    subregion: matchedCountry?.subregionValue ?? null,
    country: matchedCountry?.value ?? null
  };
}

export function OriginSingleDestinationMultiFiltersPanel({
  regionOptions,
  subregionOptions,
  countryOptions,
  value,
  loading,
  requestLoading = false,
  title = "Filter Asal dan Tujuan",
  description = "Atur asal dengan hirarki region-subregion-negara dan tujuan dengan mode geo/group. Klik header untuk membuka atau menutup filter.",
  originDefaultCountry = DEFAULT_ORIGIN_COUNTRY,
  destinationDefaultValues = [DEFAULT_DESTINATION],
  onSubmit,
  onReset
}: OriginSingleDestinationMultiFiltersPanelProps) {
  const defaultOrigin = React.useMemo(
    () => deriveOriginDefaults(countryOptions, originDefaultCountry),
    [countryOptions, originDefaultCountry]
  );
  const resolvedOrigin = React.useMemo(
    () => ({
      region: value.origin.region ?? defaultOrigin.region,
      subregion: value.origin.subregion ?? defaultOrigin.subregion,
      country: value.origin.country ?? defaultOrigin.country
    }),
    [
      defaultOrigin.country,
      defaultOrigin.region,
      defaultOrigin.subregion,
      value.origin.country,
      value.origin.region,
      value.origin.subregion
    ]
  );

  const [draftRegion, setDraftRegion] = React.useState<string | null>(
    resolvedOrigin.region
  );
  const [draftSubregion, setDraftSubregion] = React.useState<string | null>(
    resolvedOrigin.subregion
  );
  const [draftCountry, setDraftCountry] = React.useState<string | null>(
    resolvedOrigin.country
  );
  const [draftDestinations, setDraftDestinations] = React.useState<string[]>(
    value.destinations
  );
  const resolvedOriginSignature = React.useMemo(
    () =>
      `${resolvedOrigin.region ?? ""}|${resolvedOrigin.subregion ?? ""}|${resolvedOrigin.country ?? ""}`,
    [resolvedOrigin.country, resolvedOrigin.region, resolvedOrigin.subregion]
  );

  React.useEffect(() => {
    setDraftRegion(resolvedOrigin.region);
    setDraftSubregion(resolvedOrigin.subregion);
    setDraftCountry(resolvedOrigin.country);
  }, [
    resolvedOriginSignature,
    resolvedOrigin.country,
    resolvedOrigin.region,
    resolvedOrigin.subregion
  ]);

  React.useEffect(() => {
    setDraftDestinations(value.destinations);
  }, [value.destinations]);

  const filteredSubregionOptions = React.useMemo(
    () =>
      draftRegion
        ? subregionOptions.filter(
            (option) => option.regionValue === draftRegion
          )
        : subregionOptions,
    [draftRegion, subregionOptions]
  );
  const filteredCountryOptions = React.useMemo(
    () =>
      countryOptions.filter((option) => {
        if (draftRegion && option.regionValue !== draftRegion) return false;
        if (draftSubregion && option.subregionValue !== draftSubregion)
          return false;
        return true;
      }),
    [countryOptions, draftRegion, draftSubregion]
  );

  React.useEffect(() => {
    if (!draftSubregion) return;
    if (
      filteredSubregionOptions.some((option) => option.value === draftSubregion)
    )
      return;
    setDraftSubregion(null);
  }, [draftSubregion, filteredSubregionOptions]);

  React.useEffect(() => {
    if (!draftCountry) return;
    if (filteredCountryOptions.some((option) => option.value === draftCountry))
      return;
    setDraftCountry(filteredCountryOptions[0]?.value ?? null);
  }, [draftCountry, filteredCountryOptions]);

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
  const countrySelectOptions = React.useMemo(
    () => filteredCountryOptions,
    [filteredCountryOptions]
  );

  const validationErrors = React.useMemo(
    () =>
      validateOriginSingleDestinationMultiFilters({
        origin: {
          region: draftRegion,
          subregion: draftSubregion,
          country: draftCountry
        },
        destinations: draftDestinations
      }),
    [draftCountry, draftDestinations, draftRegion, draftSubregion]
  );
  const isValid = Object.keys(validationErrors).length === 0;
  const isDirty =
    draftRegion !== resolvedOrigin.region ||
    draftSubregion !== resolvedOrigin.subregion ||
    draftCountry !== resolvedOrigin.country ||
    draftDestinations.join("|") !== value.destinations.join("|");

  const renderCountryOption = React.useCallback(
    (option: SelectOption) => {
      const countryOption = countryOptions.find(
        (item) => item.value === option.value
      );

      return (
        <span className="inline-flex items-center gap-2">
          <CountryFlag
            alpha2={countryOption?.alpha2 ?? null}
            countryName={option.label}
            className="h-4 w-4 rounded-none bg-transparent p-0 text-[14px]"
          />
          <span>{option.label}</span>
        </span>
      );
    },
    [countryOptions]
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 space-y-3">
          <div className="h-40 animate-pulse rounded-md bg-slate-100" />
          <div className="h-40 animate-pulse rounded-md bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <Accordion
      title={title}
      description={description}
      badge={isDirty ? "Filter belum diterapkan" : "Filter Aktif"}
      summary={
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200">
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
            Asal: {getLabel(draftCountry, countryOptions)}
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
            Tujuan: {draftDestinations.length} negara/entitas
          </span>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-md bg-slate-50 px-3 py-3">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Asal
          </label>
          <div className="grid gap-3 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Region (Ditjen)
              </label>
              <Select
                value={draftRegion ?? ALL_VALUE}
                options={regionSelectOptions}
                size="sm"
                onChange={(next) => {
                  const normalized = next === ALL_VALUE ? null : next;
                  setDraftRegion(normalized);
                  setDraftSubregion(null);
                }}
                placeholder="Semua region"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Subregion (Wilayah)
              </label>
              <Select
                value={draftSubregion ?? ALL_VALUE}
                size="sm"
                options={subregionSelectOptions}
                onChange={(next) =>
                  setDraftSubregion(next === ALL_VALUE ? null : next)
                }
                placeholder="Semua subregion"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Negara / Entitas
              </label>
              <Select
                value={draftCountry}
                size="sm"
                options={countrySelectOptions}
                onChange={setDraftCountry}
                placeholder="Pilih negara / entitas"
                formatOptionLabel={renderCountryOption}
              />
              {validationErrors.originCountry ? (
                <p className="mt-2 text-xs text-amber-700">
                  {validationErrors.originCountry}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-md bg-slate-50 px-3 py-3">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Tujuan
          </label>
          <CountryGeoFilter
            value={draftDestinations}
            onChange={setDraftDestinations}
            loading={loading}
            disabled={requestLoading}
            defaultValues={destinationDefaultValues}
            countryLabel="Negara / Entitas Tujuan"
          />
          {validationErrors.destinations ? (
            <p className="mt-2 text-xs text-amber-700">
              {validationErrors.destinations}
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
                origin: {
                  region: draftRegion,
                  subregion: draftSubregion,
                  country: draftCountry
                },
                destinations: draftDestinations
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
