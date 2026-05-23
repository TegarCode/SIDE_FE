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
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { FilterMultiSelect } from "@/components/ui/Form/FilterMultiSelect";
import { Select } from "@/components/ui/Form/Select";
import { useToast } from "@/components/ui/Toast";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import {
  useDataGeneratorTradeCountriesByGroupQuery,
  useDataGeneratorTradeCountriesQuery,
  useDataGeneratorTradeCountryGroupsQuery,
  useDataGeneratorTradeHsCodesQuery,
  useDataGeneratorTradeSourcesQuery,
  useDataGeneratorTradeYearsQuery
} from "@/hooks/data-generator/useDataGeneratorTradeMasterQuery";
import { isUnauthorizedApiError } from "@/utils/apiError";
import { validateDataGeneratorTradeFilters } from "@/validators/dataGeneratorTradeFilters";

export type DataGeneratorTradeFilterValue = {
  origins: string[];
  originGroup: string | null;
  destinations: string[];
  destinationGroup: string | null;
  yearFrom: string | null;
  yearTo: string | null;
  tradeType: string | null;
  hsLevel: string | null;
  hsCodes: string[];
  source: string | null;
  outputType: "table" | "chart";
};

type CountryGroupOption = SelectOption & {
  countries: string[];
};

type DataGeneratorTradeFiltersPanelProps = {
  value: DataGeneratorTradeFilterValue;
  onChange: (next: DataGeneratorTradeFilterValue) => void;
  onApply?: (next: DataGeneratorTradeFilterValue) => void;
  onUnauthorizedChange?: (hasUnauthorizedError: boolean) => void;
  badge?: string;
  isSubmitting?: boolean;
};

const ALL_OPTION_VALUE = "ALL";

const TRADE_TYPE_OPTIONS: SelectOption[] = [
  { value: "Export", label: "Ekspor" },
  { value: "Import", label: "Impor" },
  { value: "Neraca", label: "Neraca Perdagangan" },
  { value: "Total", label: "Total Perdagangan" }
];

const HS_LEVEL_OPTIONS: SelectOption[] = [
  { value: "2", label: "2-digit" },
  { value: "4", label: "4-digit" },
  { value: "6", label: "6-digit" }
];

function getSelectedLabel(
  value: string | null,
  options: SelectOption[],
  fallback: string
) {
  if (!value) return fallback;
  return options.find((option) => option.value === value)?.label ?? fallback;
}

function GroupInfoButton({ option }: { option: CountryGroupOption | null }) {
  if (!option) return null;

  return (
    <HoverInfoTooltip
      content={null}
      openOnClick
      renderContent={() => (
        <div className="space-y-2">
          <div className="border-b border-slate-200 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Anggota Grup
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {option.label}
            </p>
          </div>
          <div className="max-h-44 space-y-1 overflow-y-auto pr-1 text-xs text-slate-600">
            {(option.countries ?? []).map((country) => (
              <div key={country}>{country}</div>
            ))}
          </div>
        </div>
      )}
    >
      <button
        type="button"
        className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        aria-label={`Lihat anggota grup ${option.label}`}
      >
        <InformationCircleIcon className="h-4 w-4" />
      </button>
    </HoverInfoTooltip>
  );
}

export function DataGeneratorTradeFiltersPanel({
  value,
  onChange,
  onApply,
  onUnauthorizedChange,
  badge,
  isSubmitting = false
}: DataGeneratorTradeFiltersPanelProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const hsSelectionInitializedRef = React.useRef(false);
  const lastHsLevelRef = React.useRef<string | null>(null);
  const countriesQuery = useDataGeneratorTradeCountriesQuery();
  const countryGroupsQuery = useDataGeneratorTradeCountryGroupsQuery();
  const yearsQuery = useDataGeneratorTradeYearsQuery();
  const sourcesQuery = useDataGeneratorTradeSourcesQuery();
  const hsCodesQuery = useDataGeneratorTradeHsCodesQuery(value.hsLevel);
  const countryOptions = React.useMemo(
    () => countriesQuery.data ?? [],
    [countriesQuery.data]
  );
  const countryGroupOptions = React.useMemo(
    () =>
      (countryGroupsQuery.data ?? []).map((option) => ({
        ...option,
        countries: []
      })),
    [countryGroupsQuery.data]
  );
  const yearOptions = React.useMemo(
    () => yearsQuery.data ?? [],
    [yearsQuery.data]
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
  const sourceOptions = React.useMemo(
    () => sourcesQuery.data ?? [],
    [sourcesQuery.data]
  );
  const filteredHsOptions = React.useMemo(
    () => hsCodesQuery.data ?? [],
    [hsCodesQuery.data]
  );
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
  const originGroupCountriesQuery = useDataGeneratorTradeCountriesByGroupQuery(
    value.originGroup
  );
  const destinationGroupCountriesQuery =
    useDataGeneratorTradeCountriesByGroupQuery(value.destinationGroup);
  const selectedOriginGroupWithCountries = React.useMemo(
    () =>
      selectedOriginGroup
        ? {
            ...selectedOriginGroup,
            countries: originGroupCountriesQuery.data ?? []
          }
        : null,
    [originGroupCountriesQuery.data, selectedOriginGroup]
  );
  const selectedDestinationGroupWithCountries = React.useMemo(
    () =>
      selectedDestinationGroup
        ? {
            ...selectedDestinationGroup,
            countries: destinationGroupCountriesQuery.data ?? []
          }
        : null,
    [destinationGroupCountriesQuery.data, selectedDestinationGroup]
  );
  const selectedHsCountLabel = React.useCallback(
    (count: number, allSelected: boolean) => {
      if (allSelected) return "Semua HS Code";
      return `Terpilih ${count} HS Code`;
    },
    []
  );
  const getCountryAlpha2 = React.useCallback(
    (option: SelectOption) =>
      countryOptions.find((item) => item.value === option.value)?.alpha2 ??
      null,
    [countryOptions]
  );
  const validationErrors = React.useMemo(
    () => validateDataGeneratorTradeFilters(value),
    [value]
  );
  const isValid = Object.keys(validationErrors).length === 0;
  const hasUnauthorizedError = React.useMemo(
    () =>
      [
        countriesQuery.error,
        countryGroupsQuery.error,
        yearsQuery.error,
        sourcesQuery.error,
        hsCodesQuery.error,
        originGroupCountriesQuery.error,
        destinationGroupCountriesQuery.error
      ].some((error) => isUnauthorizedApiError(error)),
    [
      countriesQuery.error,
      countryGroupsQuery.error,
      destinationGroupCountriesQuery.error,
      hsCodesQuery.error,
      originGroupCountriesQuery.error,
      sourcesQuery.error,
      yearsQuery.error
    ]
  );

  React.useEffect(() => {
    onUnauthorizedChange?.(hasUnauthorizedError);
  }, [hasUnauthorizedError, onUnauthorizedChange]);

  const updateValue = React.useCallback(
    (patch: Partial<DataGeneratorTradeFilterValue>) => {
      onChange({ ...value, ...patch });
    },
    [onChange, value]
  );

  React.useEffect(() => {
    if (sortedYearNumbers.length === 0) return;
    const latest = sortedYearNumbers[0];
    const previous = sortedYearNumbers[1] ?? latest;

    const patch: Partial<DataGeneratorTradeFilterValue> = {};
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
    const defaultSource =
      sourceOptions.find((option) => String(option.value) === "5") ??
      sourceOptions[0];
    if (defaultSource?.value) updateValue({ source: defaultSource.value });
  }, [sourceOptions, updateValue, value.source]);

  React.useEffect(() => {
    if (filteredHsOptions.length === 0) return;

    const currentLevel = value.hsLevel ?? "4";
    const allHsValues = filteredHsOptions.map((option) => option.value);
    const hasInvalidSelection = value.hsCodes.some(
      (entry) => entry !== ALL_OPTION_VALUE && !allHsValues.includes(entry)
    );
    const levelChanged = lastHsLevelRef.current !== currentLevel;

    if (
      !hsSelectionInitializedRef.current ||
      levelChanged ||
      hasInvalidSelection
    ) {
      hsSelectionInitializedRef.current = true;
      lastHsLevelRef.current = currentLevel;
      updateValue({
        hsCodes: [ALL_OPTION_VALUE]
      });
    }
  }, [filteredHsOptions, updateValue, value.hsCodes, value.hsLevel]);

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

  const handleOriginGroupChange = React.useCallback(
    (originGroup: string) => {
      updateValue({
        originGroup,
        origins: originGroup ? [] : value.origins
      });
    },
    [updateValue, value.origins]
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

  const handleDestinationGroupChange = React.useCallback(
    (destinationGroup: string) => {
      updateValue({
        destinationGroup,
        destinations: destinationGroup ? [] : value.destinations
      });
    },
    [updateValue, value.destinations]
  );

  const handleHsLevelChange = React.useCallback(
    (hsLevel: string) => {
      updateValue({
        hsLevel,
        hsCodes: []
      });
    },
    [updateValue]
  );

  const handleHsCodesChange = React.useCallback(
    (hsCodes: string[]) => {
      updateValue({
        hsCodes
      });
    },
    [updateValue]
  );

  const handleYearFromChange = React.useCallback(
    (yearFrom: string) => {
      const start = Number(yearFrom);
      const end = Number(value.yearTo);
      updateValue({
        yearFrom,
        yearTo: Number.isFinite(end) && end < start ? yearFrom : value.yearTo
      });
    },
    [updateValue, value.yearTo]
  );

  const handleYearToChange = React.useCallback(
    (yearTo: string) => {
      const end = Number(yearTo);
      const start = Number(value.yearFrom);
      updateValue({
        yearFrom:
          Number.isFinite(start) && start > end ? yearTo : value.yearFrom,
        yearTo
      });
    },
    [updateValue, value.yearFrom]
  );

  const handleReset = React.useCallback(() => {
    setSubmitted(false);
    hsSelectionInitializedRef.current = false;
    lastHsLevelRef.current = null;
    onChange({
      origins: [],
      originGroup: null,
      destinations: [],
      destinationGroup: null,
      yearFrom: null,
      yearTo: null,
      tradeType: "Export",
      hsLevel: "4",
      hsCodes: [],
      source: null,
      outputType: "table"
    });
  }, [onChange]);

  return (
    <Accordion
      title="Filter Data Generator Perdagangan"
      description="Susun kombinasi negara, grup, rentang tahun, jenis perdagangan, HS code, dan sumber data untuk menyiapkan tampilan tabel maupun visualisasi."
      badge={badge}
      summary={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
            Pilih salah satu dari Negara/Entitas atau Grup Asal & Tujuan
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
          {value.yearFrom || value.yearTo ? (
            <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-violet-200">
              Tahun: {value.yearFrom ?? "-"}-{value.yearTo ?? "-"}
            </span>
          ) : null}
          {value.tradeType ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200">
              {getSelectedLabel(
                value.tradeType,
                TRADE_TYPE_OPTIONS,
                value.tradeType
              )}
            </span>
          ) : null}
          {value.hsLevel ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200">
              HS{" "}
              {getSelectedLabel(value.hsLevel, HS_LEVEL_OPTIONS, value.hsLevel)}
            </span>
          ) : null}
          {value.hsCodes.length > 0 ? (
            <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-700 ring-1 ring-orange-200">
              HS Code:{" "}
              {value.hsCodes.includes(ALL_OPTION_VALUE)
                ? "Semua"
                : value.hsCodes.length}
            </span>
          ) : null}
          {value.source ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200">
              Sumber:{" "}
              {getSelectedLabel(value.source, sourceOptions, value.source)}
            </span>
          ) : null}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50/80 py-2 px-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Asal
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Pilih negara/entitas asal atau satu grup asal sebagai
                  representasi dataset.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                {value.origins.length > 0
                  ? `${value.origins.length} negara`
                  : getSelectedLabel(
                      value.originGroup,
                      countryGroupOptions,
                      "Belum dipilih"
                    )}
              </span>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Negara / Entitas Asal
              </label>
              <FilterMultiSelect
                options={originCountryOptions}
                value={value.origins}
                onChange={handleOriginsChange}
                placeholder="Pilih negara / entitas asal"
                isLoading={countriesQuery.isLoading}
                countLabel={(count) => `Terpilih ${count} negara`}
                showSelectedList={true}
                size="sm"
                getOptionAlpha2={getCountryAlpha2}
              />
              {submitted && validationErrors.originSelection ? (
                <p className="mt-1.5 text-[11px] text-amber-700">
                  {validationErrors.originSelection}
                </p>
              ) : null}
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Grup Asal
                </label>
                <GroupInfoButton option={selectedOriginGroupWithCountries} />
              </div>
              <Select
                value={value.originGroup}
                options={countryGroupOptions}
                onChange={handleOriginGroupChange}
                placeholder="Pilih grup asal"
                isSearchable={true}
                isLoading={countryGroupsQuery.isLoading}
                isDisabled={countryGroupsQuery.isLoading}
                size="sm"
              />
              {submitted && validationErrors.groupCombination ? (
                <p className="mt-1.5 text-[11px] text-amber-700">
                  {validationErrors.groupCombination}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50/80 py-2 px-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Tujuan
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Pilih negara/entitas tujuan atau satu grup tujuan sebagai
                  representasi dataset.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                {value.destinations.length > 0
                  ? `${value.destinations.length} negara`
                  : getSelectedLabel(
                      value.destinationGroup,
                      countryGroupOptions,
                      "Belum dipilih"
                    )}
              </span>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Negara / Entitas Tujuan
              </label>
              <FilterMultiSelect
                options={destinationCountryOptions}
                value={value.destinations}
                onChange={handleDestinationsChange}
                placeholder="Pilih negara / entitas tujuan"
                isLoading={countriesQuery.isLoading}
                countLabel={(count) => `Terpilih ${count} negara`}
                showSelectedList={true}
                size="sm"
                getOptionAlpha2={getCountryAlpha2}
              />
              {submitted && validationErrors.destinationSelection ? (
                <p className="mt-1.5 text-[11px] text-amber-700">
                  {validationErrors.destinationSelection}
                </p>
              ) : null}
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Grup Tujuan
                </label>
                <GroupInfoButton
                  option={selectedDestinationGroupWithCountries}
                />
              </div>
              <Select
                value={value.destinationGroup}
                options={countryGroupOptions}
                onChange={handleDestinationGroupChange}
                placeholder="Pilih grup tujuan"
                isSearchable={true}
                isLoading={countryGroupsQuery.isLoading}
                isDisabled={countryGroupsQuery.isLoading}
                size="sm"
              />
              {submitted && validationErrors.groupCombination ? (
                <p className="mt-1.5 text-[11px] text-amber-700">
                  {validationErrors.groupCombination}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-md border border-slate-200 bg-white py-2 px-3 xl:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tahun Awal
            </label>
            <Select
              value={value.yearFrom}
              options={yearFromOptions}
              onChange={handleYearFromChange}
              placeholder="Pilih tahun awal"
              isSearchable={false}
              isLoading={yearsQuery.isLoading}
              isDisabled={yearsQuery.isLoading}
              size="sm"
            />
            {submitted && validationErrors.yearFrom ? (
              <p className="mt-1.5 text-[11px] text-amber-700">
                {validationErrors.yearFrom}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tahun Akhir
            </label>
            <Select
              value={value.yearTo}
              options={yearToOptions}
              onChange={handleYearToChange}
              placeholder="Pilih tahun akhir"
              isSearchable={false}
              isLoading={yearsQuery.isLoading}
              isDisabled={yearsQuery.isLoading}
              size="sm"
            />
            {submitted && validationErrors.yearTo ? (
              <p className="mt-1.5 text-[11px] text-amber-700">
                {validationErrors.yearTo}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tipe Perdagangan
            </label>
            <Select
              value={value.tradeType}
              options={TRADE_TYPE_OPTIONS}
              onChange={(tradeType) => updateValue({ tradeType })}
              placeholder="Pilih tipe perdagangan"
              isSearchable={false}
              size="sm"
            />
            {submitted && validationErrors.tradeType ? (
              <p className="mt-1.5 text-[11px] text-amber-700">
                {validationErrors.tradeType}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              HS Level
            </label>
            <Select
              value={value.hsLevel}
              options={HS_LEVEL_OPTIONS}
              onChange={handleHsLevelChange}
              placeholder="Pilih HS level"
              isSearchable={false}
              size="sm"
            />
            {submitted && validationErrors.hsLevel ? (
              <p className="mt-1.5 text-[11px] text-amber-700">
                {validationErrors.hsLevel}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Sumber Data
            </label>
            <Select
              value={value.source}
              options={sourceOptions}
              onChange={(source) => updateValue({ source })}
              placeholder="Pilih sumber data"
              isSearchable={false}
              isLoading={sourcesQuery.isLoading}
              isDisabled={sourcesQuery.isLoading}
              size="sm"
            />
            {submitted && validationErrors.source ? (
              <p className="mt-1.5 text-[11px] text-amber-700">
                {validationErrors.source}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white py-2 px-3">
          <div className="mb-2.5 flex items-start justify-between gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                HS Code
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Pilih satu atau beberapa HS Code untuk mempersempit hasil
                generator data perdagangan.
              </p>
            </div>
          </div>
          <FilterMultiSelect
            options={filteredHsOptions}
            value={value.hsCodes}
            onChange={handleHsCodesChange}
            placeholder="Pilih HS Code"
            isLoading={hsCodesQuery.isLoading}
            countLabel={selectedHsCountLabel}
            showSelectedList={false}
            size="sm"
            allowSelectAllToken
          />
          {submitted && validationErrors.hsCodes ? (
            <p className="mt-1.5 text-[11px] text-amber-700">
              {validationErrors.hsCodes}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2.5 rounded-md border border-slate-200 bg-slate-50/80 py-2 px-3 xl:flex-row xl:items-center xl:justify-between">
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
              onClick={() => {
                setSubmitted(true);
                if (!isValid) {
                  toast({
                    title: "Filter belum valid",
                    description:
                      validationErrors.groupCombination ??
                      Object.values(validationErrors)[0] ??
                      "Periksa kembali input filter perdagangan.",
                    tone: "error"
                  });
                  return;
                }
                const next = { ...value, outputType: "table" as const };
                onChange(next);
                onApply?.(next);
              }}
              className="inline-flex h-9 items-center gap-2 rounded-sm px-3.5 text-sm font-semibold"
            >
              <TableCellsIcon className="h-4 w-4" />
              Tampilan Tabel
            </Button>
            <Button
              type="button"
              variant={value.outputType === "chart" ? "success" : "outline"}
              disabled={isSubmitting}
              onClick={() => {
                setSubmitted(true);
                if (!isValid) {
                  toast({
                    title: "Filter belum valid",
                    description:
                      validationErrors.groupCombination ??
                      Object.values(validationErrors)[0] ??
                      "Periksa kembali input filter perdagangan.",
                    tone: "error"
                  });
                  return;
                }
                const next = { ...value, outputType: "chart" as const };
                onChange(next);
                onApply?.(next);
              }}
              className="inline-flex h-9 items-center gap-2 rounded-sm px-3.5 text-sm font-semibold"
            >
              <PresentationChartLineIcon className="h-4 w-4" />
              Tampilan Visualisasi
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={handleReset}
              className="inline-flex h-9 items-center gap-2 rounded-sm px-3 text-sm font-medium text-slate-600"
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
