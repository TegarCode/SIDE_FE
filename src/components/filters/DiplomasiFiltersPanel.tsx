import React from "react";
import ReactSelect, {
  components,
  type GroupBase,
  type IndicatorsContainerProps,
  type MenuListProps,
  type SingleValue,
  type StylesConfig,
  type ValueContainerProps
} from "react-select";
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { GroupedSelect } from "@/components/ui/Form/GroupedSelect";
import { Skeleton } from "@/components/ui/Skeleton";
import { DIPLOMASI_HS_LEVEL_OPTIONS } from "@/constants/indonesiaDiplomasi";
import type {
  DiplomasiFilterState,
  DiplomasiSourceBySector,
  DiplomasiSourceOptionsBySector,
  GroupedSelectOption
} from "@/type/indonesiaDiplomasi";
import { validateDiplomasiFilters } from "@/validators/diplomasiEkonomiFilters";

type DiplomasiFiltersPanelProps = {
  yearsDesc: number[];
  yearStart: number | null;
  yearEnd: number | null;
  hs: string;
  wilayahOptions: GroupedSelectOption[];
  selectedDirjen: string[];
  sourceBySector: DiplomasiSourceBySector;
  sourceOptionsBySector: DiplomasiSourceOptionsBySector;
  onSetDirjen: (values: string[] | null) => void;
  onSetSourceBySector: (value: DiplomasiSourceBySector) => void;
  onSubmit: (value: DiplomasiFilterState) => void;
  onReset: () => void;
  loading: boolean;
  requestLoading: boolean;
};

type SelectSimpleOption = {
  value: string;
  label: string;
};

type RegionOption = {
  value: string;
  label: string;
};

const ACCENT = "#FFB900";

const rsStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    height: 38,
    display: "flex",
    alignItems: "center",
    borderColor: state.isFocused ? ACCENT : "#cbd5e1",
    boxShadow: state.isFocused ? `0 0 0 4px ${ACCENT}33` : "none",
    "&:hover": { borderColor: state.isFocused ? ACCENT : "#94a3b8" },
    borderRadius: 10,
    fontSize: 14,
    cursor: "pointer",
    backgroundColor: "white"
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
    height: 38,
    flexWrap: "nowrap",
    alignItems: "center",
    display: "flex"
  }),
  placeholder: (base) => ({
    ...base,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    transform: "translateY(-1px)",
    lineHeight: 1
  }),
  singleValue: (base) => ({
    ...base,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    transform: "translateY(-1px)",
    lineHeight: 1
  }),
  indicatorsContainer: (base) => ({ ...base, paddingRight: 6 }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    backgroundColor: state.isFocused ? "#f1f5f9" : "white",
    color: "#0f172a",
    cursor: "pointer"
  }),
  indicatorSeparator: () => ({ display: "none" }),
  menuPortal: (base) => ({ ...base, zIndex: 2147483647 }),
  menu: (base) => ({ ...base, zIndex: 2147483647, marginTop: 4 }),
  menuList: (base) => ({ ...base, maxHeight: 300 })
} satisfies StylesConfig<SelectSimpleOption, false>;

type RegionSelectProps = {
  value: string[] | null;
  onChange: (next: string[] | null) => void;
  options: GroupedSelectOption[];
  isDisabled?: boolean;
  placeholder?: string;
  className?: string;
  maxChips?: number;
};

function RegionSelect({
  value,
  onChange,
  options,
  isDisabled = false,
  placeholder = "Pilih wilayah",
  className = "",
  maxChips = 1
}: RegionSelectProps) {
  const BLUE = "#384AA0";

  const groups = React.useMemo(
    () => options.filter((group) => Array.isArray(group.options)),
    [options]
  );
  const leaves = React.useMemo(
    () => groups.flatMap((group) => group.options),
    [groups]
  );

  const isNoneMode = value === null;
  const isSomeMode = Array.isArray(value) && value.length > 0;
  const isAllMode = Array.isArray(value) && value.length === 0;

  const selectedSet = React.useMemo(
    () => new Set(isSomeMode ? value : []),
    [value, isSomeMode]
  );

  const totalAll = leaves.length;
  const selectedAll = leaves.filter((item) =>
    selectedSet.has(item.value)
  ).length;
  const allFull = isAllMode ? true : totalAll > 0 && selectedAll === totalAll;
  const allPartial = isAllMode
    ? false
    : selectedAll > 0 && selectedAll < totalAll;

  const getGroupState = React.useCallback(
    (group: GroupedSelectOption) => {
      const kids = group.options;
      const total = kids.length;
      const selected = isSomeMode
        ? kids.filter((item) => selectedSet.has(item.value)).length
        : 0;
      return {
        total,
        selected,
        full: isSomeMode && total > 0 && selected === total,
        partial: isSomeMode && selected > 0 && selected < total,
        none: !isSomeMode || selected === 0
      };
    },
    [isSomeMode, selectedSet]
  );

  const applySelection = (next: string[] | null) => onChange(next);

  const toggleAll = () => applySelection([]);
  const clearAll = () => applySelection(null);

  const toggleGroup = (group: GroupedSelectOption) => {
    const kids = group.options.map((item) => item.value);
    const state = getGroupState(group);

    if ((isAllMode || isNoneMode) && kids.length > 0) {
      applySelection(kids);
      return;
    }

    const next = new Set(selectedSet);

    if (kids.length === 0) {
      const arr = Array.from(next);
      applySelection(arr.length === 0 ? null : arr);
      return;
    }

    if (!state.none) {
      kids.forEach((item) => next.delete(item));
    } else {
      kids.forEach((item) => next.add(item));
    }

    const arr = Array.from(next);
    applySelection(arr.length === 0 ? null : arr);
  };

  const toggleItem = (option: RegionOption) => {
    if (isAllMode || isNoneMode) {
      applySelection([option.value]);
      return;
    }

    const next = new Set(selectedSet);
    if (next.has(option.value)) next.delete(option.value);
    else next.add(option.value);

    const arr = Array.from(next);
    applySelection(arr.length === 0 ? null : arr);
  };

  const ValueContainer = (
    props: ValueContainerProps<RegionOption, true, GroupBase<RegionOption>>
  ) => {
    if (isAllMode && totalAll > 0) {
      return (
        <components.ValueContainer {...props}>
          <span
            className="inline-flex items-center rounded-sm border px-2 py-0.5 text-xs"
            style={{
              borderColor: "#bfdbfe",
              background: "#eef2ff",
              color: "#1e3a8a"
            }}
          >
            Semua Regional
          </span>
          {props.children}
        </components.ValueContainer>
      );
    }

    if (isNoneMode) {
      return (
        <components.ValueContainer {...props}>
          <span
            className="flex h-full items-center pl-1 leading-none text-slate-400"
            style={{ transform: "translateY(-1px)", lineHeight: 1 }}
          >
            {placeholder}
          </span>
          {props.children}
        </components.ValueContainer>
      );
    }

    const selectedLeaves = leaves.filter((item) => selectedSet.has(item.value));
    if (selectedLeaves.length === 0) {
      return (
        <components.ValueContainer {...props}>
          <span
            className="flex h-full items-center pl-1 leading-none text-slate-400"
            style={{ transform: "translateY(-1px)", lineHeight: 1 }}
          >
            {placeholder}
          </span>
          {props.children}
        </components.ValueContainer>
      );
    }

    const shown = selectedLeaves.slice(0, maxChips);
    const rest = selectedLeaves.length - shown.length;

    return (
      <components.ValueContainer {...props}>
        <div className="flex flex-wrap items-center gap-1">
          {shown.map((item) => (
            <span
              key={item.value}
              className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs"
              title={item.label}
              style={{
                borderColor: "#bfdbfe",
                background: "#eef2ff",
                color: "#1e3a8a"
              }}
            >
              {item.label}
            </span>
          ))}
          {rest > 0 ? (
            <span
              className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs"
              style={{
                borderColor: "#bfdbfe",
                background: "#eef2ff",
                color: "#1e3a8a"
              }}
            >
              +{rest} lainnya
            </span>
          ) : null}
        </div>
        {props.children}
      </components.ValueContainer>
    );
  };

  function CheckIcon({ size = 10 }: { size?: number }) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M6.3 11.2L3.5 8.4l-.8.8 3.6 3.6 6-6-.8-.8-5.2 5.2z"
          fill="currentColor"
        />
      </svg>
    );
  }

  function MinusIcon({ size = 10 }: { size?: number }) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
        <rect
          x="3"
          y="7.25"
          width="10"
          height="1.5"
          rx="0.75"
          fill="currentColor"
        />
      </svg>
    );
  }

  function Checkbox({
    checked,
    indeterminate,
    size = 16
  }: {
    checked: boolean;
    indeterminate?: boolean;
    size?: number;
  }) {
    const baseClassName =
      "inline-flex select-none items-center justify-center rounded border align-middle";
    const colorChecked = checked
      ? "border-indigo-600 bg-indigo-500 text-white"
      : "border-slate-300 bg-white text-indigo-600";
    const colorIndeterminate = indeterminate
      ? "border-indigo-300 bg-indigo-200 text-indigo-800"
      : "";

    return (
      <span
        className={`${baseClassName} ${colorChecked} ${colorIndeterminate}`}
        style={{ width: size, height: size, lineHeight: 0 }}
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
      >
        {indeterminate ? (
          <MinusIcon size={12} />
        ) : checked ? (
          <CheckIcon size={12} />
        ) : null}
      </span>
    );
  }

  const IndicatorsContainer = (
    props: IndicatorsContainerProps<RegionOption, true, GroupBase<RegionOption>>
  ) => (
    <components.IndicatorsContainer {...props}>
      {props.children}
    </components.IndicatorsContainer>
  );

  const MenuList = (
    props: MenuListProps<RegionOption, true, GroupBase<RegionOption>>
  ) => {
    const topCount = isAllMode ? totalAll : isNoneMode ? 0 : selectedAll;

    return (
      <components.MenuList {...props}>
        <div className="flex items-center gap-2 px-2 pt-2">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleAll();
            }}
            className={`flex flex-1 items-center justify-between rounded-sm border px-3 py-2.5 text-sm transition ${
              allFull
                ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                : allPartial
                  ? "border-slate-200 bg-slate-50 text-slate-800"
                  : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Checkbox checked={allFull} indeterminate={allPartial} />
              <span className="font-semibold tracking-wide">
                SEMUA REGIONAL
              </span>
            </div>
            <span className="text-xs">{`${topCount}/${totalAll}`}</span>
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              clearAll();
            }}
            className={`rounded-sm border px-3 py-2.5 text-sm font-semibold transition ${
              isNoneMode
                ? "cursor-default border-slate-200 bg-slate-100 text-slate-500"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            disabled={isNoneMode}
          >
            CLEAR
          </button>
        </div>

        <div className="space-y-3 px-2 pb-2 pt-2">
          {groups.map((group) => {
            const state = getGroupState(group);
            return (
              <div
                key={group.label}
                className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm"
              >
                <div
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleGroup(group);
                  }}
                  className={`flex cursor-pointer items-center justify-between px-3 py-2.5 ${
                    state.full
                      ? "bg-indigo-50 text-indigo-900"
                      : state.partial
                        ? "bg-slate-50 text-slate-800"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={state.full}
                      indeterminate={state.partial}
                    />
                    <span className="font-semibold">{group.label}</span>
                  </div>
                  <span className="text-xs">
                    {isNoneMode
                      ? `0/${state.total}`
                      : isAllMode
                        ? `${state.total}/${state.total}`
                        : `${state.selected}/${state.total}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5 p-2 sm:grid-cols-2">
                  {group.options.map((option) => {
                    const selected = selectedSet.has(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleItem(option);
                        }}
                        className={`flex items-center justify-between rounded-sm border px-2.5 py-2 text-sm transition ${
                          selected
                            ? "border-indigo-300 bg-white ring-1 ring-indigo-200"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                        title={option.label}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={selected} />
                          <span className="text-slate-900">{option.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </components.MenuList>
    );
  };

  const PlaceholderComp = () => null;
  const MultiValue = () => null;
  const regionValue = isSomeMode
    ? leaves.filter((item) => selectedSet.has(item.value))
    : [];

  return (
    <ReactSelect<RegionOption, true, GroupBase<RegionOption>>
      className={className}
      classNamePrefix="rs"
      styles={{
        ...(rsStyles as unknown as StylesConfig<
          RegionOption,
          true,
          GroupBase<RegionOption>
        >),
        control: (base, state) => ({
          ...base,
          minHeight: 38,
          height: 38,
          display: "flex",
          alignItems: "center",
          borderColor: state.isFocused ? BLUE : "#cbd5e1",
          boxShadow: state.isFocused ? `0 0 0 4px ${BLUE}22` : "none",
          "&:hover": { borderColor: state.isFocused ? BLUE : "#94a3b8" },
          borderRadius: 10,
          fontSize: 14,
          cursor: "pointer",
          backgroundColor: "white"
        }),
        option: (base, state) => ({
          ...base,
          fontSize: 14,
          backgroundColor: state.isFocused ? "#eef2ff" : "white",
          color: "#0f172a",
          cursor: "pointer"
        }),
        menuList: (base) => ({ ...base, maxHeight: 420, padding: 0 })
      }}
      isMulti
      isSearchable={false}
      openMenuOnClick
      openMenuOnFocus
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      isDisabled={isDisabled}
      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
      menuPosition="fixed"
      menuShouldBlockScroll
      options={[{ label: "root", value: "__root__" }]}
      isClearable={false}
      value={regionValue}
      onChange={() => {}}
      placeholder={placeholder}
      noOptionsMessage={() => "Tidak ada opsi"}
      components={{
        MenuList,
        ValueContainer,
        Placeholder: PlaceholderComp,
        MultiValue,
        IndicatorsContainer,
        ClearIndicator: () => null
      }}
    />
  );
}

type SelectSimpleProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectSimpleOption[];
  placeholder?: string;
  instanceId: string;
  isDisabled?: boolean;
};

function SelectSimpleRS({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  instanceId,
  isDisabled
}: SelectSimpleProps) {
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <ReactSelect<SelectSimpleOption, false>
      instanceId={instanceId}
      classNamePrefix="rs"
      styles={rsStyles}
      options={options}
      value={selected}
      isSearchable={false}
      onChange={(option: SingleValue<SelectSimpleOption>) =>
        onChange(option?.value ?? "")
      }
      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
      menuPosition="fixed"
      menuShouldBlockScroll
      closeMenuOnScroll={false}
      blurInputOnSelect={false}
      tabSelectsValue
      hideSelectedOptions={false}
      placeholder={placeholder}
      noOptionsMessage={() => "Tidak ada opsi"}
      isDisabled={isDisabled}
    />
  );
}

function SelectSimple(props: SelectSimpleProps) {
  return <SelectSimpleRS {...props} />;
}

function FilterSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3.5 w-64 max-w-full" />
      </div>
      <div className="space-y-3 px-4 py-4 sm:px-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={`filter-skeleton-${index}`}
              className="h-18 xl:col-span-3"
            />
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}

function toRegionSelectValue(
  selectedDirjen: string[],
  allRegionValues: string[]
) {
  if (selectedDirjen.length === 0) return null;
  if (allRegionValues.length === 0) return selectedDirjen;
  const selectedSet = new Set(selectedDirjen);
  const isAllSelected =
    selectedDirjen.length === allRegionValues.length &&
    allRegionValues.every((item) => selectedSet.has(item));
  return isAllSelected ? [] : selectedDirjen;
}

function areSourceBySectorEqual(
  left: DiplomasiSourceBySector,
  right: DiplomasiSourceBySector
) {
  return (
    left.perdagangan === right.perdagangan &&
    left.investasi === right.investasi &&
    left.pariwisata === right.pariwisata
  );
}

function buildFilterSummary(params: {
  yearStart: number | null;
  yearEnd: number | null;
  hs: string;
  selectedDirjen: string[];
  allRegionValues: string[];
  sourceBySector: DiplomasiSourceBySector;
}) {
  const {
    yearStart,
    yearEnd,
    hs,
    selectedDirjen,
    allRegionValues,
    sourceBySector
  } = params;

  const period =
    yearStart == null || yearEnd == null
      ? "Periode belum dipilih"
      : yearStart === yearEnd
        ? `Tahun ${yearStart}`
        : `${yearStart}-${yearEnd}`;

  const regionLabel =
    selectedDirjen.length === 0
      ? "Tanpa kawasan"
      : selectedDirjen.length === allRegionValues.length
        ? "Semua kawasan"
        : `${selectedDirjen.length} kawasan`;

  const sourceCount = Object.values(sourceBySector).filter(Boolean).length;

  return `${period} • HS ${hs} • ${regionLabel} • ${sourceCount} sumber aktif`;
}

const DIPLOMASI_SOURCE_SECTORS = [
  {
    key: "perdagangan",
    label: "PERDAGANGAN",
    color: { bg: "#FFF4CC", text: "#7A5C00", border: "#F7D46B" }
  },
  {
    key: "investasi",
    label: "INVESTASI",
    color: { bg: "#E7F0FF", text: "#1E3A8A", border: "#B9D2FF" }
  },
  {
    key: "pariwisata",
    label: "PARIWISATA",
    color: { bg: "#E9FBF5", text: "#0F766E", border: "#BCEFE0" }
  }
] as const;

const FILTER_SUMMARY_CHIP_STYLES = {
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  period: "bg-amber-50 text-amber-800 ring-amber-200",
  hs: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  region: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  source: "bg-emerald-50 text-emerald-700 ring-emerald-200"
} as const;

function getSelectedSourceSummary(
  sourceBySector: DiplomasiSourceBySector,
  sourceOptionsBySector: DiplomasiSourceOptionsBySector
) {
  return (
    Object.entries(sourceBySector) as Array<
      [keyof DiplomasiSourceBySector, string | null]
    >
  )
    .map(([sector, value]) => {
      if (!value) return null;
      const label =
        sourceOptionsBySector[sector].find((option) => option.value === value)
          ?.label ?? value;
      return `${sector.toUpperCase()}: ${label}`;
    })
    .filter((item): item is string => Boolean(item));
}

export function DiplomasiFiltersPanel({
  yearsDesc,
  yearStart,
  yearEnd,
  hs,
  wilayahOptions,
  selectedDirjen,
  sourceBySector,
  sourceOptionsBySector,
  onSetDirjen,
  onSetSourceBySector,
  onSubmit,
  onReset,
  loading,
  requestLoading
}: DiplomasiFiltersPanelProps) {
  const [draftYearStart, setDraftYearStart] = React.useState<number | null>(
    yearStart
  );
  const [draftYearEnd, setDraftYearEnd] = React.useState<number | null>(
    yearEnd
  );
  const [draftHs, setDraftHs] = React.useState(hs);
  const [draftDirjen, setDraftDirjen] =
    React.useState<string[]>(selectedDirjen);
  const [draftSourceBySector, setDraftSourceBySector] =
    React.useState<DiplomasiSourceBySector>(sourceBySector);

  const yearOptions = React.useMemo<SelectSimpleOption[]>(
    () =>
      yearsDesc.map((year) => ({ value: String(year), label: String(year) })),
    [yearsDesc]
  );

  const hsOptions = React.useMemo<SelectSimpleOption[]>(
    () =>
      DIPLOMASI_HS_LEVEL_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label
      })),
    []
  );

  const allRegionValues = React.useMemo(
    () =>
      wilayahOptions.flatMap((group) =>
        group.options.map((item) => item.value)
      ),
    [wilayahOptions]
  );

  React.useEffect(() => {
    setDraftYearStart(yearStart);
  }, [yearStart]);

  React.useEffect(() => {
    setDraftYearEnd(yearEnd);
  }, [yearEnd]);

  React.useEffect(() => {
    setDraftHs(hs);
  }, [hs]);

  React.useEffect(() => {
    setDraftDirjen(selectedDirjen);
  }, [selectedDirjen]);

  React.useEffect(() => {
    setDraftSourceBySector(sourceBySector);
  }, [sourceBySector]);

  const regionSelectValue = React.useMemo(
    () => toRegionSelectValue(draftDirjen, allRegionValues),
    [allRegionValues, draftDirjen]
  );

  const handleRegionChange = (next: string[] | null) => {
    if (next === null) {
      setDraftDirjen([]);
      return;
    }
    if (next.length === 0) {
      setDraftDirjen(allRegionValues);
      return;
    }
    setDraftDirjen(next);
  };

  const isDirty =
    draftYearStart !== yearStart ||
    draftYearEnd !== yearEnd ||
    draftHs !== hs ||
    draftDirjen.length !== selectedDirjen.length ||
    draftDirjen.some((item, index) => item !== selectedDirjen[index]) ||
    !areSourceBySectorEqual(draftSourceBySector, sourceBySector);

  const filterSummary = React.useMemo(
    () =>
      buildFilterSummary({
        yearStart: draftYearStart,
        yearEnd: draftYearEnd,
        hs: draftHs,
        selectedDirjen: draftDirjen,
        allRegionValues,
        sourceBySector: draftSourceBySector
      }),
    [
      allRegionValues,
      draftDirjen,
      draftHs,
      draftSourceBySector,
      draftYearEnd,
      draftYearStart
    ]
  );
  const sourceSummary = React.useMemo(
    () => getSelectedSourceSummary(draftSourceBySector, sourceOptionsBySector),
    [draftSourceBySector, sourceOptionsBySector]
  );
  const validationErrors = React.useMemo(
    () =>
      validateDiplomasiFilters(
        {
          yearStart: draftYearStart,
          yearEnd: draftYearEnd,
          hs: draftHs,
          dirjen: draftDirjen,
          sourceBySector: draftSourceBySector
        },
        sourceOptionsBySector
      ),
    [
      draftDirjen,
      draftHs,
      draftSourceBySector,
      draftYearEnd,
      draftYearStart,
      sourceOptionsBySector
    ]
  );
  const isValid = Object.keys(validationErrors).length === 0;
  const periodSummary =
    draftYearStart == null || draftYearEnd == null
      ? "Periode belum dipilih"
      : draftYearStart === draftYearEnd
        ? `Tahun ${draftYearStart}`
        : `${draftYearStart}-${draftYearEnd}`;
  const regionSummary =
    draftDirjen.length === 0
      ? "Tanpa kawasan"
      : draftDirjen.length === allRegionValues.length
        ? "Semua kawasan"
        : `${draftDirjen.length} kawasan`;

  const handleSubmit = () => {
    if (draftYearStart == null || draftYearEnd == null) return;

    const normalizedDirjen =
      draftDirjen.length === allRegionValues.length
        ? allRegionValues
        : draftDirjen;

    onSetDirjen(normalizedDirjen);
    onSetSourceBySector(draftSourceBySector);
    onSubmit({
      yearStart: draftYearStart,
      yearEnd: draftYearEnd,
      hs: draftHs,
      dirjen: normalizedDirjen,
      sourceBySector: draftSourceBySector
    });
  };

  if (loading) {
    return <FilterSkeleton />;
  }

  return (
    <Accordion
      title="Filter Diplomasi Ekonomi"
      description="Atur periode, level HS, kawasan, dan sumber data. Klik header untuk membuka atau menutup filter."
      badge={isDirty ? "Filter belum diterapkan" : "Filter Aktif"}
      summary={
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${FILTER_SUMMARY_CHIP_STYLES.info}`}
          >
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${FILTER_SUMMARY_CHIP_STYLES.period}`}
          >
            {periodSummary}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${FILTER_SUMMARY_CHIP_STYLES.hs}`}
          >
            HS {draftHs}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${FILTER_SUMMARY_CHIP_STYLES.region}`}
          >
            {regionSummary}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${FILTER_SUMMARY_CHIP_STYLES.source}`}
          >
            {(sourceSummary.length > 0
              ? sourceSummary
              : ["Sumber belum dipilih"]
            ).join(" / ")}
          </span>
        </div>
      }
    >
      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="rounded-sm bg-slate-50 px-3 py-2.5 xl:col-span-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Tahun
          </label>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <SelectSimple
                instanceId="tahun-awal"
                value={draftYearStart != null ? String(draftYearStart) : ""}
                onChange={(value) => {
                  const parsed = Number(value);
                  if (!Number.isFinite(parsed)) return;
                  setDraftYearStart(parsed);
                  if (draftYearEnd != null && parsed > draftYearEnd)
                    setDraftYearEnd(parsed);
                }}
                options={yearOptions}
                isDisabled={requestLoading || yearOptions.length === 0}
                placeholder="Pilih..."
              />
            </div>
            <span className="text-sm font-semibold text-slate-400">-</span>
            <div className="min-w-0 flex-1">
              <SelectSimple
                instanceId="tahun-akhir"
                value={draftYearEnd != null ? String(draftYearEnd) : ""}
                onChange={(value) => {
                  const parsed = Number(value);
                  if (!Number.isFinite(parsed)) return;
                  setDraftYearEnd(parsed);
                  if (draftYearStart != null && parsed < draftYearStart)
                    setDraftYearStart(parsed);
                }}
                options={yearOptions}
                isDisabled={requestLoading || yearOptions.length === 0}
                placeholder="Pilih..."
              />
            </div>
          </div>
          {validationErrors.yearRange ? (
            <p className="mt-2 text-xs text-amber-700">
              {validationErrors.yearRange}
            </p>
          ) : null}
        </div>

        <div className="rounded-sm bg-slate-50 px-3 py-2.5 xl:col-span-2">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Level HS
          </label>
          <SelectSimple
            instanceId="level-hs"
            value={draftHs}
            onChange={setDraftHs}
            options={hsOptions}
            isDisabled={requestLoading}
          />
          {validationErrors.hs ? (
            <p className="mt-2 text-xs text-amber-700">{validationErrors.hs}</p>
          ) : null}
        </div>

        <div className="rounded-sm bg-slate-50 px-3 py-2.5 xl:col-span-3">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Kawasan
          </label>
          <RegionSelect
            value={regionSelectValue}
            onChange={handleRegionChange}
            options={wilayahOptions}
            isDisabled={requestLoading || wilayahOptions.length === 0}
            placeholder="Pilih wilayah"
            className="w-full"
          />
          {validationErrors.dirjen ? (
            <p className="mt-2 text-xs text-amber-700">
              {validationErrors.dirjen}
            </p>
          ) : null}
        </div>

        <div className="rounded-sm bg-slate-50 px-3 py-2.5 xl:col-span-3">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Sumber Data
          </label>
          <GroupedSelect
            value={draftSourceBySector}
            onChange={(next) =>
              setDraftSourceBySector({
                perdagangan: next.perdagangan ?? null,
                investasi: next.investasi ?? null,
                pariwisata: next.pariwisata ?? null
              })
            }
            optionsBySector={sourceOptionsBySector}
            sectors={DIPLOMASI_SOURCE_SECTORS}
            isDisabled={requestLoading}
            placeholder="Pilih sumber data..."
          />
          {validationErrors.sumber ? (
            <p className="mt-2 text-xs text-amber-700">
              {validationErrors.sumber}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 gap-3 rounded-sm bg-slate-50 px-3 py-2.5">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800 ring-1 ring-amber-200">
              <FunnelIcon className="h-3.5 w-3.5" />
              Filter aktif
            </span>
            <span>{filterSummary}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onReset}
              disabled={requestLoading}
              className="inline-flex items-center gap-1.5 rounded-sm bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={requestLoading || !isValid}
              className="inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              <MagnifyingGlassIcon className="h-3.5 w-3.5" />
              Cari Data
            </Button>
          </div>
        </div>
        <p className="text-[11px] font-medium text-slate-500">
          Perubahan filter akan diterapkan saat Anda menekan{" "}
          <span className="font-semibold text-slate-700">Cari Data</span>.
        </p>
      </div>
    </Accordion>
  );
}
