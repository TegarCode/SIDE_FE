import React from "react";
import ReactSelect, { type SingleValue, type StylesConfig } from "react-select";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import { cn } from "@/utils/cn";

type SelectProps = {
  value: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  noOptionsMessage?: string;
  isSearchable?: boolean;
  isDisabled?: boolean;
  size?: "default" | "sm";
  formatOptionLabel?: (option: SelectOption) => React.ReactNode;
  error?: string;
};

function buildSelectStyles(
  size: "default" | "sm",
  hasError: boolean
): StylesConfig<SelectOption, false> {
  const isSmall = size === "sm";

  return {
    control: (base, state) => ({
      ...base,
      minHeight: isSmall ? 32 : 40,
      borderRadius: 5,
      borderColor: hasError
        ? "#fda4af"
        : state.isFocused
          ? "#94a3b8"
          : "#cbd5e1",
      boxShadow: "none",
      backgroundColor: "#fff",
      "&:hover": { borderColor: hasError ? "#fb7185" : "#94a3b8" }
    }),
    valueContainer: (base) => ({
      ...base,
      padding: isSmall ? "0 10px" : "0 12px"
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: isSmall ? 30 : 38
    }),
    dropdownIndicator: (base) => ({ ...base, padding: isSmall ? 4 : 6 }),
    clearIndicator: (base) => ({ ...base, padding: isSmall ? 4 : 6 }),
    input: (base) => ({
      ...base,
      margin: 0,
      paddingTop: 0,
      paddingBottom: 0
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: isSmall ? 12 : 14
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: isSmall ? 12 : 14
    }),
    menuPortal: (base) => ({ ...base, zIndex: 2147483647 }),
    menu: (base) => ({ ...base, zIndex: 2147483647, marginTop: 4 }),
    option: (base, state) => ({
      ...base,
      fontSize: 12,
      backgroundColor: state.isFocused ? "#f8fafc" : "#fff",
      color: "#0f172a"
    })
  };
}

export function Select({
  value,
  options,
  onChange,
  placeholder = "Pilih data...",
  isLoading = false,
  className,
  noOptionsMessage = "Data tidak ditemukan",
  isSearchable = true,
  isDisabled = false,
  size = "default",
  formatOptionLabel,
  error
}: SelectProps) {
  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  return (
    <div className={className}>
      <ReactSelect<SelectOption, false>
        options={options}
        value={selectedOption}
        onChange={(option: SingleValue<SelectOption>) => {
          if (option?.value) onChange(option.value);
        }}
        styles={buildSelectStyles(size, Boolean(error))}
        formatOptionLabel={formatOptionLabel}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isLoading={isLoading}
        isDisabled={isDisabled}
        noOptionsMessage={() => noOptionsMessage}
        menuPortalTarget={typeof window !== "undefined" ? document.body : null}
        menuPosition="fixed"
        menuShouldBlockScroll
        aria-invalid={Boolean(error)}
      />
      {error ? (
        <p
          className={cn(
            "mt-1.5 text-[11px] text-rose-700",
            isDisabled && "opacity-70"
          )}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
