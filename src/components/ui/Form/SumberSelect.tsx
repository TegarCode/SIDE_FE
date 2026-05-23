import React from "react";
import ReactSelect, {
  components,
  type GroupBase,
  type MultiValue,
  type OptionProps,
  type StylesConfig,
  type ValueContainerProps
} from "react-select";
import type {
  DiplomasiSectorKey,
  DiplomasiSourceBySector,
  DiplomasiSourceOptionsBySector
} from "@/type/indonesiaDiplomasi";

type SumberOption = {
  value: string;
  label: string;
  sektor: DiplomasiSectorKey;
  sumber: string;
};

type SumberSelectProps = {
  value: DiplomasiSourceBySector;
  onChange: (next: DiplomasiSourceBySector) => void;
  optionsBySector: DiplomasiSourceOptionsBySector;
  isDisabled?: boolean;
  placeholder?: string;
};

const rsStyles: StylesConfig<SumberOption, true> = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    height: 38,
    display: "flex",
    alignItems: "center",
    borderColor: state.isFocused ? "#FFB900" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(255, 185, 0, 0.2)" : "none",
    "&:hover": { borderColor: state.isFocused ? "#FFB900" : "#94a3b8" },
    borderRadius: 10,
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
    height: 38,
    flexWrap: "nowrap",
    alignItems: "center",
    display: "flex"
  })
};

export function SumberSelect({
  value,
  onChange,
  optionsBySector,
  isDisabled,
  placeholder = "Pilih sumber per sektor..."
}: SumberSelectProps) {
  const SECTOR_TONE: Record<
    DiplomasiSectorKey,
    { bg: string; text: string; border: string }
  > = {
    perdagangan: { bg: "#FFF4CC", text: "#7A5C00", border: "#F7D46B" },
    investasi: { bg: "#E7F0FF", text: "#1E3A8A", border: "#B9D2FF" },
    pariwisata: { bg: "#E9FBF5", text: "#0F766E", border: "#BCEFE0" }
  };

  const sectorDefs = React.useMemo(
    () => [
      { key: "perdagangan" as const, label: "Perdagangan" },
      { key: "investasi" as const, label: "Investasi" },
      { key: "pariwisata" as const, label: "Pariwisata" }
    ],
    []
  );

  const groupedOptions = React.useMemo(
    () =>
      sectorDefs.map((sector) => ({
        label: sector.label,
        options: optionsBySector[sector.key].map((option) => ({
          value: `${sector.key}:${option.value}`,
          label: option.label,
          sektor: sector.key,
          sumber: option.value
        }))
      })),
    [optionsBySector, sectorDefs]
  );

  const selected = React.useMemo(() => {
    const result: SumberOption[] = [];
    sectorDefs.forEach((sector) => {
      const current = value[sector.key];
      if (!current) return;
      const match = optionsBySector[sector.key].find(
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
  }, [optionsBySector, sectorDefs, value]);

  const handleChange = (selectedOptions: MultiValue<SumberOption>) => {
    const picked: Partial<Record<DiplomasiSectorKey, string>> = {};
    for (let index = selectedOptions.length - 1; index >= 0; index -= 1) {
      const option = selectedOptions[index];
      if (!(option.sektor in picked)) {
        picked[option.sektor] = option.sumber;
      }
    }

    onChange({
      perdagangan: picked.perdagangan ?? value.perdagangan ?? null,
      investasi: picked.investasi ?? value.investasi ?? null,
      pariwisata: picked.pariwisata ?? value.pariwisata ?? null
    });
  };

  const ValueContainer = (
    props: ValueContainerProps<SumberOption, true, GroupBase<SumberOption>>
  ) => {
    const count = selected.length;
    const shown = selected.slice(0, 3);
    const rest = count - shown.length;

    return (
      <components.ValueContainer {...props}>
        {count === 0 ? (
          <span className="flex h-full items-center pl-1 leading-none text-slate-400">
            {placeholder}
          </span>
        ) : (
          <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
            {shown.map((item) => {
              const tone = SECTOR_TONE[item.sektor];
              return (
                <span
                  key={item.value}
                  className="inline-flex max-w-35 items-center gap-1 truncate rounded-sm border px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    background: tone.bg,
                    color: tone.text,
                    borderColor: tone.border
                  }}
                  title={`${item.sektor}: ${item.label}`}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-sm"
                    style={{ background: tone.text }}
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
  };

  const Option = (
    props: OptionProps<SumberOption, true, GroupBase<SumberOption>>
  ) => (
    <components.Option {...props}>
      <div className="flex items-center justify-between">
        <span>{props.label}</span>
        {props.isSelected ? <span>✓</span> : null}
      </div>
    </components.Option>
  );

  return (
    <ReactSelect<SumberOption, true, GroupBase<SumberOption>>
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
      isClearable={false}
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
