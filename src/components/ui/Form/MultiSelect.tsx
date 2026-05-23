import React from "react";
import ReactSelect, { type MultiValue, type StylesConfig } from "react-select";
import type { SelectOption } from "@/type/indonesiaDiplomasi";

type MultiSelectProps = {
  value: string[];
  options: SelectOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  noOptionsMessage?: string;
  isSearchable?: boolean;
  closeMenuOnSelect?: boolean;
};

const multiSelectStyles: StylesConfig<SelectOption, true> = {
  control: (base) => ({
    ...base,
    minHeight: 40,
    borderRadius: 8,
    borderColor: "#cbd5e1",
    boxShadow: "none",
    backgroundColor: "#fff",
    "&:hover": { borderColor: "#94a3b8" }
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 10px" }),
  indicatorsContainer: (base) => ({ ...base, minHeight: 38 }),
  dropdownIndicator: (base) => ({ ...base, padding: 6 }),
  clearIndicator: (base) => ({ ...base, padding: 6 }),
  menuPortal: (base) => ({ ...base, zIndex: 2147483647 }),
  menu: (base) => ({ ...base, zIndex: 50 }),
  option: (base, state) => ({
    ...base,
    fontSize: 12,
    backgroundColor: state.isFocused ? "#f8fafc" : "#fff",
    color: "#0f172a"
  }),
  multiValue: (base) => ({
    ...base,
    borderRadius: 999,
    backgroundColor: "#eef2ff"
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#1e3a8a",
    fontSize: 11,
    fontWeight: 600
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#1e3a8a",
    ":hover": {
      backgroundColor: "#dbeafe",
      color: "#1d4ed8"
    }
  })
};

export function MultiSelect({
  value,
  options,
  onChange,
  placeholder = "Pilih data...",
  isLoading = false,
  className,
  noOptionsMessage = "Data tidak ditemukan",
  isSearchable = true,
  closeMenuOnSelect = false
}: MultiSelectProps) {
  const selectedOptions = React.useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value]
  );

  return (
    <div className={className}>
      <ReactSelect<SelectOption, true>
        isMulti
        options={options}
        value={selectedOptions}
        onChange={(selected: MultiValue<SelectOption>) => {
          onChange(selected.map((item) => item.value));
        }}
        styles={multiSelectStyles}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isLoading={isLoading}
        closeMenuOnSelect={closeMenuOnSelect}
        noOptionsMessage={() => noOptionsMessage}
        menuPortalTarget={typeof window !== "undefined" ? document.body : null}
        menuPosition="fixed"
        menuShouldBlockScroll
      />
    </div>
  );
}
