import React from "react";
import {
  ChevronUpDownIcon,
  FunnelIcon,
  InformationCircleIcon,
  PresentationChartLineIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { FilterMultiSelect } from "@/components/ui/Form/FilterMultiSelect";
import { Select } from "@/components/ui/Form/Select";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { useToast } from "@/components/ui/Toast";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import {
  useDataGeneratorServiceCountriesByGroupQuery,
  useDataGeneratorServiceCountriesQuery,
  useDataGeneratorServiceCountryGroupsQuery,
  useDataGeneratorServiceProfessionsQuery,
  useDataGeneratorServiceSourcesQuery,
  useDataGeneratorServiceYearsQuery
} from "@/hooks/data-generator/useDataGeneratorServiceMasterQuery";
import { isUnauthorizedApiError } from "@/utils/apiError";
import { validateDataGeneratorServiceFilters } from "@/validators/dataGeneratorServiceFilters";

export type DataGeneratorServiceFilterValue = {
  origins: string[];
  originGroup: string | null;
  destinations: string[];
  destinationGroup: string | null;
  yearFrom: string | null;
  yearTo: string | null;
  gender: string | null;
  professions: string[];
  source: string | null;
  outputType: "table" | "chart";
};

type Props = {
  value: DataGeneratorServiceFilterValue;
  onChange: (next: DataGeneratorServiceFilterValue) => void;
  onApply?: (next: DataGeneratorServiceFilterValue) => void;
  onUnauthorizedChange?: (hasUnauthorizedError: boolean) => void;
  badge?: string;
  isSubmitting?: boolean;
};

const GENDER_OPTIONS: SelectOption[] = [
  { value: "all", label: "Semua" },
  { value: "l", label: "Laki-laki" },
  { value: "p", label: "Perempuan" }
];

function getSelectedLabel(
  value: string | null,
  options: SelectOption[],
  fallback: string
) {
  if (!value) return fallback;
  return options.find((option) => option.value === value)?.label ?? fallback;
}

function GroupInfoButton({
  label,
  countries
}: {
  label: string;
  countries: string[];
}) {
  if (!countries.length) return null;

  return (
    <HoverInfoTooltip
      openOnClick
      content={
        <div className="space-y-2">
          <div className="border-b border-slate-200 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Anggota Grup
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{label}</p>
          </div>
          <div className="max-h-44 space-y-1 overflow-y-auto pr-1 text-xs text-slate-600">
            {countries.map((country) => (
              <div key={`${label}-${country}`}>{country}</div>
            ))}
          </div>
        </div>
      }
    >
      <button
        type="button"
        className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        aria-label={`Lihat anggota grup ${label}`}
      >
        <InformationCircleIcon className="h-4 w-4" />
      </button>
    </HoverInfoTooltip>
  );
}

export function DataGeneratorServiceFiltersPanel({
  value,
  onChange,
  onApply,
  onUnauthorizedChange,
  badge,
  isSubmitting = false
}: Props) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const countriesQuery = useDataGeneratorServiceCountriesQuery();
  const countryGroupsQuery = useDataGeneratorServiceCountryGroupsQuery();
  const yearsQuery = useDataGeneratorServiceYearsQuery();
  const sourcesQuery = useDataGeneratorServiceSourcesQuery();
  const professionsQuery = useDataGeneratorServiceProfessionsQuery();

  const countryOptions = React.useMemo(
    () => countriesQuery.data ?? [],
    [countriesQuery.data]
  );
  const countryGroupOptions = React.useMemo(
    () => countryGroupsQuery.data ?? [],
    [countryGroupsQuery.data]
  );
  const yearOptions = React.useMemo(
    () => yearsQuery.data ?? [],
    [yearsQuery.data]
  );
  const sourceOptions = React.useMemo(
    () => sourcesQuery.data ?? [],
    [sourcesQuery.data]
  );
  const professionOptions = React.useMemo(
    () =>
      (professionsQuery.data ?? []).map((item) => ({
        value: item.value,
        label: item.label
      })),
    [professionsQuery.data]
  );
  const sortedYearNumbers = React.useMemo(
    () =>
      [...yearOptions]
        .map((option) => Number(option.value))
        .filter((year) => Number.isFinite(year))
        .sort((left, right) => right - left),
    [yearOptions]
  );
  const yearFromOptions = React.useMemo(() => {
    const selectedYearTo = Number(value.yearTo);
    if (!Number.isFinite(selectedYearTo)) return yearOptions;
    return yearOptions.filter(
      (option) => Number(option.value) <= selectedYearTo
    );
  }, [value.yearTo, yearOptions]);
  const yearToOptions = React.useMemo(() => {
    const selectedYearFrom = Number(value.yearFrom);
    if (!Number.isFinite(selectedYearFrom)) return yearOptions;
    return yearOptions.filter(
      (option) => Number(option.value) >= selectedYearFrom
    );
  }, [value.yearFrom, yearOptions]);
  const originCountryOptions = React.useMemo(
    () =>
      countryOptions.filter(
        (option) => !value.destinations.includes(option.value)
      ),
    [countryOptions, value.destinations]
  );
  const destinationCountryOptions = React.useMemo(
    () =>
      countryOptions.filter((option) => !value.origins.includes(option.value)),
    [countryOptions, value.origins]
  );
  const selectedOriginGroup = React.useMemo(
    () =>
      countryGroupOptions.find(
        (option) => option.value === value.originGroup
      ) ?? null,
    [countryGroupOptions, value.originGroup]
  );
  const selectedDestinationGroup = React.useMemo(
    () =>
      countryGroupOptions.find(
        (option) => option.value === value.destinationGroup
      ) ?? null,
    [countryGroupOptions, value.destinationGroup]
  );
  const originGroupCountriesQuery =
    useDataGeneratorServiceCountriesByGroupQuery(value.originGroup);
  const destinationGroupCountriesQuery =
    useDataGeneratorServiceCountriesByGroupQuery(value.destinationGroup);
  const validationErrors = React.useMemo(
    () => validateDataGeneratorServiceFilters(value),
    [value]
  );
  const fieldErrors = submitted ? validationErrors : {};
  const hasUnauthorizedError = React.useMemo(
    () =>
      [
        countriesQuery.error,
        countryGroupsQuery.error,
        yearsQuery.error,
        sourcesQuery.error,
        professionsQuery.error,
        originGroupCountriesQuery.error,
        destinationGroupCountriesQuery.error
      ].some((error) => isUnauthorizedApiError(error)),
    [
      countriesQuery.error,
      countryGroupsQuery.error,
      destinationGroupCountriesQuery.error,
      originGroupCountriesQuery.error,
      professionsQuery.error,
      sourcesQuery.error,
      yearsQuery.error
    ]
  );

  React.useEffect(() => {
    onUnauthorizedChange?.(hasUnauthorizedError);
  }, [hasUnauthorizedError, onUnauthorizedChange]);

  const updateValue = React.useCallback(
    (patch: Partial<DataGeneratorServiceFilterValue>) => {
      onChange({ ...value, ...patch });
    },
    [onChange, value]
  );

  React.useEffect(() => {
    if (sortedYearNumbers.length === 0) return;
    const latest = sortedYearNumbers[0];
    const previous = sortedYearNumbers[1] ?? latest;
    const patch: Partial<DataGeneratorServiceFilterValue> = {};
    if (!value.yearTo && Number.isFinite(latest)) patch.yearTo = String(latest);
    if (!value.yearFrom && Number.isFinite(previous))
      patch.yearFrom = String(previous);
    if (Object.keys(patch).length > 0) updateValue(patch);
  }, [sortedYearNumbers, updateValue, value.yearFrom, value.yearTo]);

  React.useEffect(() => {
    const start = Number(value.yearFrom);
    const end = Number(value.yearTo);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start <= end)
      return;
    updateValue({ yearTo: value.yearFrom });
  }, [updateValue, value.yearFrom, value.yearTo]);

  React.useEffect(() => {
    if (value.source || sourceOptions.length === 0) return;
    const defaultSource = sourceOptions[sourceOptions.length - 1];
    if (defaultSource?.value) updateValue({ source: defaultSource.value });
  }, [sourceOptions, updateValue, value.source]);

  React.useEffect(() => {
    const patch: Partial<DataGeneratorServiceFilterValue> = {};
    if (!value.gender) patch.gender = "all";
    if (value.professions.length === 0) patch.professions = ["all"];
    if (Object.keys(patch).length > 0) updateValue(patch);
  }, [updateValue, value.gender, value.professions.length]);

  React.useEffect(() => {
    if (
      value.origins.length > 0 ||
      value.originGroup ||
      countryOptions.length === 0
    )
      return;
    const indonesiaOption = countryOptions.find(
      (option) => option.value === "IDN"
    );
    if (indonesiaOption) {
      updateValue({ origins: ["IDN"] });
    }
  }, [countryOptions, updateValue, value.originGroup, value.origins.length]);

  const handleOriginsChange = React.useCallback(
    (origins: string[]) => {
      const nextDestinations = value.destinations.filter(
        (entry) => !origins.includes(entry)
      );
      updateValue({
        origins,
        destinations: nextDestinations,
        originGroup: origins.length > 0 ? null : value.originGroup
      });
    },
    [updateValue, value.destinations, value.originGroup]
  );

  const handleDestinationsChange = React.useCallback(
    (destinations: string[]) => {
      const nextOrigins = value.origins.filter(
        (entry) => !destinations.includes(entry)
      );
      updateValue({
        origins: nextOrigins,
        destinations,
        destinationGroup:
          destinations.length > 0 ? null : value.destinationGroup
      });
    },
    [updateValue, value.destinationGroup, value.origins]
  );

  const handleProfessionsChange = React.useCallback(
    (professions: string[]) => {
      updateValue({
        professions: professions.length === 0 ? ["all"] : professions
      });
    },
    [updateValue]
  );

  const handleReset = React.useCallback(() => {
    setSubmitted(false);
    onChange({
      origins: [],
      originGroup: null,
      destinations: [],
      destinationGroup: null,
      yearFrom: null,
      yearTo: null,
      gender: "all",
      professions: ["all"],
      source: null,
      outputType: "table"
    });
  }, [onChange]);

  const submitWithMode = React.useCallback(
    (outputType: "table" | "chart") => {
      setSubmitted(true);
      const nextValue = { ...value, outputType };
      const errors = validateDataGeneratorServiceFilters(nextValue);
      const firstError = Object.values(errors)[0];

      if (firstError) {
        toast({
          title: "Filter jasa belum lengkap",
          description: "Periksa field yang ditandai lalu coba lagi.",
          tone: "error"
        });
        return;
      }

      onChange(nextValue);
      onApply?.(nextValue);
    },
    [onApply, onChange, toast, value]
  );

  return (
    <Accordion
      title="Filter Data Generator Jasa"
      description="Susun kombinasi negara, grup, rentang tahun, jenis kelamin, profesi, dan sumber data untuk menyiapkan tampilan tabel maupun visualisasi."
      badge={badge}
      summary={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          {value.origins.length > 0 ? (
            <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-200">
              Asal: {value.origins.length} negara
            </span>
          ) : value.originGroup ? (
            <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-200">
              Grup Asal:{" "}
              {getSelectedLabel(
                value.originGroup,
                countryGroupOptions,
                value.originGroup
              )}
            </span>
          ) : null}
          {value.destinations.length > 0 ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
              Tujuan: {value.destinations.length} negara
            </span>
          ) : value.destinationGroup ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
              Grup Tujuan:{" "}
              {getSelectedLabel(
                value.destinationGroup,
                countryGroupOptions,
                value.destinationGroup
              )}
            </span>
          ) : null}
          {(value.yearFrom || value.yearTo) && (
            <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-violet-200">
              Tahun: {value.yearFrom ?? "-"}-{value.yearTo ?? "-"}
            </span>
          )}
          {value.gender && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200">
              Gender:{" "}
              {getSelectedLabel(value.gender, GENDER_OPTIONS, value.gender)}
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200">
            Profesi:{" "}
            {value.professions.includes("all")
              ? "Semua Profesi"
              : `${value.professions.length} profesi`}
          </span>
          {value.source && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200">
              Sumber:{" "}
              {getSelectedLabel(value.source, sourceOptions, value.source)}
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Asal
            </p>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Negara / Entitas Asal
              </p>
              <FilterMultiSelect
                options={originCountryOptions}
                value={value.origins}
                placeholder="Pilih negara / entitas"
                size="sm"
                getOptionAlpha2={(option) =>
                  countryOptions.find((item) => item.value === option.value)
                    ?.alpha2 ?? null
                }
                onChange={handleOriginsChange}
                error={fieldErrors.originSelection}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Grup Asal
                </p>
                <GroupInfoButton
                  label={selectedOriginGroup?.label ?? ""}
                  countries={originGroupCountriesQuery.data ?? []}
                />
              </div>
              <Select
                value={value.originGroup ?? ""}
                options={countryGroupOptions}
                onChange={(next) =>
                  updateValue({
                    originGroup: next || null,
                    origins: next ? [] : value.origins
                  })
                }
                placeholder="Pilih grup asal"
                size="sm"
                error={fieldErrors.groupCombination}
              />
            </div>
          </div>
          <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Tujuan
            </p>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Negara / Entitas Tujuan
              </p>
              <FilterMultiSelect
                options={destinationCountryOptions}
                value={value.destinations}
                placeholder="Pilih negara / entitas"
                size="sm"
                getOptionAlpha2={(option) =>
                  countryOptions.find((item) => item.value === option.value)
                    ?.alpha2 ?? null
                }
                onChange={handleDestinationsChange}
                error={fieldErrors.destinationSelection}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Grup Tujuan
                </p>
                <GroupInfoButton
                  label={selectedDestinationGroup?.label ?? ""}
                  countries={destinationGroupCountriesQuery.data ?? []}
                />
              </div>
              <Select
                value={value.destinationGroup ?? ""}
                options={countryGroupOptions}
                onChange={(next) =>
                  updateValue({
                    destinationGroup: next || null,
                    destinations: next ? [] : value.destinations
                  })
                }
                placeholder="Pilih grup tujuan"
                size="sm"
                error={fieldErrors.groupCombination}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tahun Awal
            </p>
            <Select
              value={value.yearFrom ?? ""}
              options={yearFromOptions}
              onChange={(next) =>
                updateValue({
                  yearFrom: next,
                  yearTo:
                    Number(value.yearTo) < Number(next) && next
                      ? next
                      : value.yearTo
                })
              }
              placeholder="Pilih tahun awal"
              size="sm"
              error={fieldErrors.yearFrom}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tahun Akhir
            </p>
            <Select
              value={value.yearTo ?? ""}
              options={yearToOptions}
              onChange={(next) =>
                updateValue({
                  yearFrom:
                    Number(value.yearFrom) > Number(next) && next
                      ? next
                      : value.yearFrom,
                  yearTo: next
                })
              }
              placeholder="Pilih tahun akhir"
              size="sm"
              error={fieldErrors.yearTo}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Jenis Kelamin
            </p>
            <Select
              value={value.gender ?? ""}
              options={GENDER_OPTIONS}
              onChange={(next) => updateValue({ gender: next || null })}
              placeholder="Pilih jenis kelamin"
              size="sm"
              error={fieldErrors.gender}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Sumber Data
            </p>
            <Select
              value={value.source ?? ""}
              options={sourceOptions}
              onChange={(next) => updateValue({ source: next || null })}
              placeholder="Pilih sumber data"
              size="sm"
              error={fieldErrors.source}
            />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Profesi
          </p>
          <FilterMultiSelect
            options={[
              { value: "all", label: "Semua Profesi" },
              ...professionOptions
            ]}
            value={value.professions}
            placeholder="Pilih profesi"
            size="sm"
            countLabel={(count, allSelected) =>
              allSelected ? "Semua profesi" : `${count} profesi dipilih`
            }
            onChange={handleProfessionsChange}
            error={fieldErrors.professions}
          />
        </div>

        <div className="flex flex-col gap-2.5 rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Output Generator
            </p>
            <p className="text-xs text-slate-500">
              Pilih apakah hasil generator difokuskan untuk tampilan tabel atau
              visualisasi.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={value.outputType === "table" ? "primary" : "outline"}
              disabled={isSubmitting}
              onClick={() => submitWithMode("table")}
              className={
                value.outputType === "table"
                  ? "inline-flex h-9 items-center gap-2 rounded-sm px-3.5 text-sm font-semibold shadow-sm"
                  : "inline-flex h-9 items-center gap-2 rounded-sm border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              }
            >
              <TableCellsIcon className="h-4 w-4" />
              Tampilan Tabel
            </Button>
            <Button
              type="button"
              variant={value.outputType === "chart" ? "success" : "outline"}
              disabled={isSubmitting}
              onClick={() => submitWithMode("chart")}
              className={
                value.outputType === "chart"
                  ? "inline-flex h-9 items-center gap-2 rounded-sm px-3.5 text-sm font-semibold shadow-sm"
                  : "inline-flex h-9 items-center gap-2 rounded-sm border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              }
            >
              <PresentationChartLineIcon className="h-4 w-4" />
              Tampilan Visualisasi
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              className="inline-flex h-9 items-center gap-2 rounded-sm px-3.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              onClick={handleReset}
            >
              <ChevronUpDownIcon className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Accordion>
  );
}
