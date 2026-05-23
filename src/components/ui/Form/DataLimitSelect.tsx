import React from "react";
import ReactSelect, { type SingleValue, type StylesConfig } from "react-select";

type LimitOption = {
  value: string;
  label: string;
};

type DataLimitSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  className?: string;
  itemLabel?: string;
};

const selectStyles: StylesConfig<LimitOption, false> = {
  control: (base) => ({
    ...base,
    minHeight: 32,
    height: 32,
    borderRadius: 5,
    borderColor: "#cbd5e1",
    boxShadow: "none",
    fontSize: 12
  }),
  valueContainer: (base) => ({ ...base, padding: "0 8px" }),
  indicatorsContainer: (base) => ({ ...base, height: 32 }),
  dropdownIndicator: (base) => ({ ...base, padding: 4 }),
  clearIndicator: (base) => ({ ...base, padding: 4 }),
  menu: (base) => ({ ...base, zIndex: 40 })
};

export function DataLimitSelect({
  value,
  onChange,
  options = ["10", "15", "20", "50", "100", "ALL"],
  className,
  itemLabel = "negara"
}: DataLimitSelectProps) {
  const selectOptions = React.useMemo<LimitOption[]>(
    () =>
      options.map((item) => ({
        value: item,
        label: item === "ALL" ? "Semua" : `${item} ${itemLabel}`
      })),
    [itemLabel, options]
  );

  return (
    <div className={className}>
      <ReactSelect<LimitOption, false>
        options={selectOptions}
        value={
          selectOptions.find((item) => item.value === value) ??
          selectOptions[0] ??
          null
        }
        onChange={(next: SingleValue<LimitOption>) =>
          onChange(next?.value ?? "10")
        }
        isSearchable={false}
        styles={selectStyles}
        aria-label={`Tampilkan data ${itemLabel}`}
      />
    </div>
  );
}
