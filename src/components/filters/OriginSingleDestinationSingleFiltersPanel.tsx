import React from "react";
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { Select } from "@/components/ui/Form/Select";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import type { MitraCountryOption, MitraSubregionOption } from "@/type/mitra";
import {
  validateOriginSingleDestinationSingleFilters,
  type OriginSingleDestinationSingleFilterValue
} from "@/validators/originSingleDestinationSingleFilters";

type OriginSingleDestinationSingleFiltersPanelProps = {
  regionOptions: SelectOption[];
  subregionOptions: MitraSubregionOption[];
  countryOptions: MitraCountryOption[];
  originCountryOptions?: MitraCountryOption[];
  destinationCountryOptions?: MitraCountryOption[];
  value: OriginSingleDestinationSingleFilterValue;
  loading: boolean;
  requestLoading?: boolean;
  title?: string;
  description?: string;
  originDefaultCountry?: string;
  destinationDefaultCountry?: string;
  originDisabled?: boolean;
  onSubmit: (value: OriginSingleDestinationSingleFilterValue) => void;
  onReset: () => void;
};

const ALL_VALUE = "__ALL__";
const DEFAULT_ORIGIN_COUNTRY = "IDN";
const DEFAULT_DESTINATION_COUNTRY = "CHN";

function getCountryLabel(value: string | null, options: MitraCountryOption[]) {
  if (!value) return "Semua";
  return options.find((option) => option.value === value)?.label ?? value;
}

function deriveDefaults(
  countryOptions: MitraCountryOption[],
  countryCode: string
) {
  const matchedCountry =
    countryOptions.find((option) => option.value === countryCode) ?? null;
  return {
    region: matchedCountry?.regionValue ?? null,
    subregion: matchedCountry?.subregionValue ?? null,
    country: matchedCountry?.value ?? null
  };
}

type CountrySingleFilterBlockProps = {
  title: string;
  regionOptions: SelectOption[];
  subregionOptions: MitraSubregionOption[];
  countryOptions: MitraCountryOption[];
  region: string | null;
  subregion: string | null;
  country: string | null;
  setRegion: (value: string | null) => void;
  setSubregion: (value: string | null) => void;
  setCountry: (value: string | null) => void;
  error?: string;
  renderCountryOption: (option: SelectOption) => React.ReactNode;
  disabled?: boolean;
  fallbackCountry?: string | null;
};

function CountrySingleFilterBlock({
  title,
  regionOptions,
  subregionOptions,
  countryOptions,
  region,
  subregion,
  country,
  setRegion,
  setSubregion,
  setCountry,
  error,
  renderCountryOption,
  disabled = false,
  fallbackCountry = null
}: CountrySingleFilterBlockProps) {
  const filteredSubregionOptions = React.useMemo(
    () =>
      region
        ? subregionOptions.filter((option) => option.regionValue === region)
        : subregionOptions,
    [region, subregionOptions]
  );
  const filteredCountryOptions = React.useMemo(
    () =>
      countryOptions.filter((option) => {
        if (region && option.regionValue !== region) return false;
        if (subregion && option.subregionValue !== subregion) return false;
        return true;
      }),
    [countryOptions, region, subregion]
  );

  React.useEffect(() => {
    if (disabled) return;
    if (!subregion) return;
    if (filteredSubregionOptions.some((option) => option.value === subregion))
      return;
    setSubregion(null);
  }, [disabled, filteredSubregionOptions, setSubregion, subregion]);

  React.useEffect(() => {
    if (disabled) return;
    if (!country) return;
    if (filteredCountryOptions.some((option) => option.value === country))
      return;
    const preferredFallback =
      (fallbackCountry &&
        filteredCountryOptions.find(
          (option) => option.value === fallbackCountry
        )?.value) ??
      fallbackCountry ??
      filteredCountryOptions[0]?.value ??
      null;
    setCountry(preferredFallback);
  }, [country, disabled, fallbackCountry, filteredCountryOptions, setCountry]);

  const displayedCountryOptions = React.useMemo(() => {
    if (!disabled) return filteredCountryOptions;
    const selected = countryOptions.find((option) => option.value === country);
    return selected ? [selected] : [];
  }, [country, countryOptions, disabled, filteredCountryOptions]);

  return (
    <div className="rounded-md bg-slate-50 px-3 py-3">
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </label>
      <div className="grid gap-3 lg:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Region (Ditjen)
          </label>
          <Select
            value={region ?? ALL_VALUE}
            options={[
              { value: ALL_VALUE, label: "Semua Region" },
              ...regionOptions
            ]}
            size="sm"
            isLoading={false}
            onChange={(next) => {
              const normalized = next === ALL_VALUE ? null : next;
              setRegion(normalized);
              setSubregion(null);
            }}
            placeholder="Semua region"
            className={disabled ? "pointer-events-none opacity-70" : undefined}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Subregion (Wilayah)
          </label>
          <Select
            value={subregion ?? ALL_VALUE}
            size="sm"
            options={[
              { value: ALL_VALUE, label: "Semua Subregion" },
              ...filteredSubregionOptions
            ]}
            onChange={(next) => setSubregion(next === ALL_VALUE ? null : next)}
            placeholder="Semua subregion"
            className={disabled ? "pointer-events-none opacity-70" : undefined}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Negara / Entitas
          </label>
          <Select
            value={country}
            size="sm"
            options={displayedCountryOptions}
            onChange={setCountry}
            placeholder="Pilih negara / entitas"
            formatOptionLabel={renderCountryOption}
            className={disabled ? "pointer-events-none opacity-70" : undefined}
          />
          {error ? (
            <p className="mt-2 text-xs text-amber-700">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function OriginSingleDestinationSingleFiltersPanel({
  regionOptions,
  subregionOptions,
  countryOptions,
  originCountryOptions,
  destinationCountryOptions,
  value,
  loading,
  requestLoading = false,
  title = "Filter Negara Asal dan Tujuan",
  description = "Pilih negara asal dan tujuan secara bertingkat. Klik header untuk membuka atau menutup filter.",
  originDefaultCountry = DEFAULT_ORIGIN_COUNTRY,
  destinationDefaultCountry = DEFAULT_DESTINATION_COUNTRY,
  originDisabled = false,
  onSubmit,
  onReset
}: OriginSingleDestinationSingleFiltersPanelProps) {
  const effectiveOriginCountryOptions = originCountryOptions ?? countryOptions;
  const effectiveDestinationCountryOptions =
    destinationCountryOptions ?? countryOptions;
  const defaultOrigin = React.useMemo(
    () => deriveDefaults(effectiveOriginCountryOptions, originDefaultCountry),
    [effectiveOriginCountryOptions, originDefaultCountry]
  );
  const defaultDestination = React.useMemo(
    () =>
      deriveDefaults(
        effectiveDestinationCountryOptions,
        destinationDefaultCountry
      ),
    [effectiveDestinationCountryOptions, destinationDefaultCountry]
  );
  const resolvedOrigin = React.useMemo(
    () =>
      originDisabled
        ? {
            region: null,
            subregion: null,
            country: defaultOrigin.country
          }
        : {
            region: value.origin.region,
            subregion: value.origin.subregion,
            country: value.origin.country ?? defaultOrigin.country
          },
    [
      defaultOrigin.country,
      originDisabled,
      value.origin.country,
      value.origin.region,
      value.origin.subregion
    ]
  );
  const resolvedDestination = React.useMemo(
    () => ({
      region: value.destination.region,
      subregion: value.destination.subregion,
      country: value.destination.country ?? defaultDestination.country
    }),
    [
      defaultDestination.country,
      value.destination.country,
      value.destination.region,
      value.destination.subregion
    ]
  );

  const [draftOrigin, setDraftOrigin] = React.useState(resolvedOrigin);
  const [draftDestination, setDraftDestination] =
    React.useState(resolvedDestination);

  React.useEffect(() => {
    setDraftOrigin(resolvedOrigin);
  }, [resolvedOrigin]);

  React.useEffect(() => {
    setDraftDestination(resolvedDestination);
  }, [resolvedDestination]);

  const validationErrors = React.useMemo(
    () =>
      validateOriginSingleDestinationSingleFilters({
        origin: draftOrigin,
        destination: draftDestination
      }),
    [draftDestination, draftOrigin]
  );
  const isValid = Object.keys(validationErrors).length === 0;
  const isDirty =
    draftOrigin.region !== resolvedOrigin.region ||
    draftOrigin.subregion !== resolvedOrigin.subregion ||
    draftOrigin.country !== resolvedOrigin.country ||
    draftDestination.region !== resolvedDestination.region ||
    draftDestination.subregion !== resolvedDestination.subregion ||
    draftDestination.country !== resolvedDestination.country;

  const renderCountryOption = React.useCallback(
    (option: SelectOption) => {
      const countryOption =
        effectiveOriginCountryOptions.find(
          (item) => item.value === option.value
        ) ??
        effectiveDestinationCountryOptions.find(
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
    [effectiveDestinationCountryOptions, effectiveOriginCountryOptions]
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
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
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
            Asal:{" "}
            {getCountryLabel(
              draftOrigin.country,
              effectiveOriginCountryOptions
            )}
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
            Tujuan:{" "}
            {getCountryLabel(
              draftDestination.country,
              effectiveDestinationCountryOptions
            )}
          </span>
        </div>
      }
    >
      <div className="space-y-3">
        <CountrySingleFilterBlock
          title="Asal"
          regionOptions={regionOptions}
          subregionOptions={subregionOptions}
          countryOptions={effectiveOriginCountryOptions}
          region={draftOrigin.region}
          subregion={draftOrigin.subregion}
          country={draftOrigin.country}
          setRegion={(region) =>
            setDraftOrigin((current) => ({ ...current, region }))
          }
          setSubregion={(subregion) =>
            setDraftOrigin((current) => ({ ...current, subregion }))
          }
          setCountry={(country) =>
            setDraftOrigin((current) => ({ ...current, country }))
          }
          error={validationErrors.originCountry}
          renderCountryOption={renderCountryOption}
          disabled={originDisabled}
          fallbackCountry={defaultOrigin.country}
        />

        <CountrySingleFilterBlock
          title="Tujuan"
          regionOptions={regionOptions}
          subregionOptions={subregionOptions}
          countryOptions={effectiveDestinationCountryOptions}
          region={draftDestination.region}
          subregion={draftDestination.subregion}
          country={draftDestination.country}
          setRegion={(region) =>
            setDraftDestination((current) => ({ ...current, region }))
          }
          setSubregion={(subregion) =>
            setDraftDestination((current) => ({ ...current, subregion }))
          }
          setCountry={(country) =>
            setDraftDestination((current) => ({ ...current, country }))
          }
          error={validationErrors.destinationCountry}
          renderCountryOption={renderCountryOption}
          fallbackCountry={defaultDestination.country}
        />
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
              onSubmit({ origin: draftOrigin, destination: draftDestination })
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
