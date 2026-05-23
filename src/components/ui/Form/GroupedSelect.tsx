import React from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import ReactSelect, {
  components,
  type GroupBase,
  type MultiValue,
  type OptionProps,
  type StylesConfig,
  type ValueContainerProps
} from "react-select";
import type { SelectOption } from "@/type/indonesiaDiplomasi";

type SourceValueRecord = Record<string, string | null>;
type SourceOptionsRecord = Record<string, SelectOption[]>;

type GroupedSourceSector = {
  key: string;
  label: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
};

type GroupedSourceOption = {
  value: string;
  label: string;
  sektor: string;
  sumber: string;
};

type GroupedSourceSelectProps = {
  value: SourceValueRecord;
  onChange: (next: SourceValueRecord) => void;
  optionsBySector: SourceOptionsRecord;
  sectors: readonly GroupedSourceSector[];
  isDisabled?: boolean;
  placeholder?: string;
};

const rsStyles: StylesConfig<GroupedSourceOption, true> = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    borderColor: state.isFocused ? "#FFB900" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(255, 185, 0, 0.2)" : "none",
    "&:hover": { borderColor: state.isFocused ? "#FFB900" : "#94a3b8" },
    borderRadius: 6,
    fontSize: 14,
    cursor: "pointer",
    backgroundColor: "white"
  }),
  indicatorsContainer: (base) => ({ ...base, paddingRight: 6 }),
  indicatorSeparator: () => ({ display: "none" }),
  menuPortal: (base) => ({ ...base, zIndex: 2147483647 }),
  menu: (base) => ({ ...base, zIndex: 2147483647, marginTop: 4 }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    backgroundColor: state.isFocused ? "#f1f5f9" : "white",
    color: "#0f172a",
    cursor: "pointer"
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
    minHeight: 38,
    flexWrap: "nowrap",
    alignItems: "center",
    display: "flex"
  })
};

export function GroupedSelect({
  value,
  onChange,
  optionsBySector,
  sectors,
  isDisabled,
  placeholder = "Pilih sumber data..."
}: GroupedSourceSelectProps) {
  const groupedOptions = React.useMemo(
    () =>
      sectors.map((sector) => ({
        label: sector.label,
        options: (optionsBySector[sector.key] ?? []).map((option) => ({
          value: `${sector.key}:${option.value}`,
          label: option.label,
          sektor: sector.key,
          sumber: option.value
        }))
      })),
    [optionsBySector, sectors]
  );

  const selected = React.useMemo(() => {
    const result: GroupedSourceOption[] = [];
    sectors.forEach((sector) => {
      const current = value[sector.key];
      if (!current) return;
      const match = (optionsBySector[sector.key] ?? []).find(
        (option) => option.value === current
      );
      if (!match) return;
      result.push({
        value: `${sector.key}:${match.value}`,
        label: match.label,
        sektor: sector.key,
        sumber: match.value
      });
    });
    return result;
  }, [optionsBySector, sectors, value]);

  const handleChange = React.useCallback(
    (selectedOptions: MultiValue<GroupedSourceOption>) => {
      const next: SourceValueRecord = { ...value };
      sectors.forEach((sector) => {
        next[sector.key] = null;
      });

      for (let index = selectedOptions.length - 1; index >= 0; index -= 1) {
        const option = selectedOptions[index];
        if (!next[option.sektor]) next[option.sektor] = option.sumber;
      }

      onChange(next);
    },
    [onChange, sectors, value]
  );

  const ValueContainer = React.useCallback(
    (
      props: ValueContainerProps<
        GroupedSourceOption,
        true,
        GroupBase<GroupedSourceOption>
      >
    ) => {
      const shown = selected.slice(0, 4);
      const rest = selected.length - shown.length;

      return (
        <components.ValueContainer {...props}>
          {selected.length === 0 ? (
            <span className="flex h-full items-center pl-1 leading-none text-slate-400">
              {placeholder}
            </span>
          ) : (
            <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
              {shown.map((item) => {
                const tone = sectors.find(
                  (sector) => sector.key === item.sektor
                )?.color;
                return (
                  <span
                    key={item.value}
                    className="inline-flex max-w-35 items-center gap-1 truncate rounded-sm border px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      background: tone?.bg,
                      color: tone?.text,
                      borderColor: tone?.border
                    }}
                    title={`${item.sektor}: ${item.label}`}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-sm"
                      style={{ background: tone?.text }}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                );
              })}
              {rest > 0 ? (
                <span className="inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  +{rest}
                </span>
              ) : null}
            </div>
          )}
          {props.children}
        </components.ValueContainer>
      );
    },
    [placeholder, sectors, selected]
  );

  const Option = React.useCallback(
    (
      props: OptionProps<
        GroupedSourceOption,
        true,
        GroupBase<GroupedSourceOption>
      >
    ) => (
      <components.Option {...props}>
        <div className="flex items-center justify-between">
          <span>{props.label}</span>
          {props.isSelected ? (
            <CheckIcon className="h-4 w-4 text-slate-700" />
          ) : null}
        </div>
      </components.Option>
    ),
    []
  );

  return (
    <ReactSelect<GroupedSourceOption, true, GroupBase<GroupedSourceOption>>
      classNamePrefix="rs"
      styles={rsStyles}
      isMulti
      options={groupedOptions}
      value={selected}
      isSearchable={false}
      onChange={handleChange}
      menuPortalTarget={typeof window !== "undefined" ? document.body : null}
      menuPosition="fixed"
      menuShouldBlockScroll
      closeMenuOnSelect={false}
      backspaceRemovesValue={false}
      isClearable={selected.length > 0}
      hideSelectedOptions={false}
      placeholder={placeholder}
      noOptionsMessage={() => "Tidak ada opsi"}
      isDisabled={isDisabled}
      components={{
        ValueContainer,
        Option,
        MultiValue: () => null
      }}
    />
  );
}
