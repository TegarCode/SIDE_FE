import React from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import ReactSelect, {
  components,
  type ActionMeta,
  type GroupBase,
  type MenuListProps,
  type MultiValue,
  type OptionProps,
  type StylesConfig,
  type ValueContainerProps
} from "react-select";
import { CountryFlag } from "@/components/ui/CountryFlag";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import { cn } from "@/utils/cn";

type FilterMultiSelectProps = {
  options: SelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  noOptionsMessage?: string;
  countLabel?: (count: number, allSelected: boolean) => string;
  className?: string;
  showSelectedList?: boolean;
  defaultSelectedListVisible?: boolean;
  footerNote?: string;
  emptySelectedLabel?: string;
  getOptionAlpha2?: (option: SelectOption) => string | null;
  size?: "default" | "sm";
  allowSelectAllToken?: boolean;
  error?: string;
};

function buildSelectStyles(
  size: "default" | "sm",
  hasError: boolean
): StylesConfig<SelectOption, true> {
  const isSmall = size === "sm";

  return {
    control: (base, state) => ({
      ...base,
      minHeight: isSmall ? 30 : 40,
      borderRadius: 4,
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
      padding: isSmall ? "0 7px" : "2px 10px",
      flexWrap: "nowrap",
      overflow: "hidden"
    }),
    indicatorsContainer: (base) => ({ ...base, minHeight: isSmall ? 28 : 38 }),
    dropdownIndicator: (base) => ({ ...base, padding: isSmall ? 3 : 6 }),
    clearIndicator: (base) => ({ ...base, padding: isSmall ? 3 : 6 }),
    menuPortal: (base) => ({ ...base, zIndex: 2147483647 }),
    menu: (base) => ({ ...base, zIndex: 50 }),
    option: (base, state) => ({
      ...base,
      fontSize: isSmall ? 11 : 13,
      backgroundColor: state.isFocused ? "#f8fafc" : "#fff",
      color: "#0f172a",
      ":active": { ...base[":active"], backgroundColor: "#e2e8f0" }
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: isSmall ? 11 : 13
    }),
    input: (base) => ({
      ...base,
      fontSize: isSmall ? 11 : 13,
      margin: 0,
      paddingTop: 0,
      paddingBottom: 0
    }),
    multiValue: () => ({ display: "none" })
  };
}

const ALL_OPTION: SelectOption = { value: "ALL", label: "Pilih Semua" };
const MIN_SELECTED_PANEL_HEIGHT = 64;
const MAX_SELECTED_PANEL_HEIGHT = 240;

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase("id");
}

function VirtualizedMenuList({
  itemHeight,
  ...props
}: MenuListProps<SelectOption, true, GroupBase<SelectOption>> & {
  itemHeight: number;
}) {
  const childrenArray = React.Children.toArray(props.children);
  const maxHeight = props.maxHeight;
  const overscan = 4;
  const [scrollTop, setScrollTop] = React.useState(0);

  const totalHeight = childrenArray.length * itemHeight;
  const visibleCount = Math.max(1, Math.ceil(maxHeight / itemHeight));
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    childrenArray.length,
    startIndex + visibleCount + overscan * 2
  );
  const offsetTop = startIndex * itemHeight;
  const visibleChildren = childrenArray.slice(startIndex, endIndex);

  return (
    <components.MenuList
      {...props}
      innerProps={{
        ...props.innerProps,
        onScroll: (event) => {
          props.innerProps.onScroll?.(event);
          setScrollTop((event.currentTarget as HTMLDivElement).scrollTop);
        },
        style: {
          ...(props.innerProps.style ?? {}),
          maxHeight,
          overflowY: "auto"
        }
      }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetTop}px)` }}>
          {visibleChildren}
        </div>
      </div>
    </components.MenuList>
  );
}

export function FilterMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih data...",
  isLoading = false,
  isDisabled = false,
  noOptionsMessage = "Data tidak ditemukan",
  countLabel,
  className,
  showSelectedList = false,
  defaultSelectedListVisible = false,
  footerNote,
  emptySelectedLabel = "(Belum ada data dipilih)",
  getOptionAlpha2,
  size = "default",
  allowSelectAllToken = false,
  error
}: FilterMultiSelectProps) {
  const [selectedListVisible, setSelectedListVisible] = React.useState(
    defaultSelectedListVisible
  );
  const [selectedListHeight, setSelectedListHeight] = React.useState(
    MIN_SELECTED_PANEL_HEIGHT
  );
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedInputValue, setDebouncedInputValue] = React.useState("");
  const dragStateRef = React.useRef<{
    startY: number;
    startHeight: number;
  } | null>(null);
  const menuItemHeight = size === "sm" ? 32 : 38;

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [inputValue]);

  const filteredBaseOptions = React.useMemo(() => {
    const search = normalizeSearch(debouncedInputValue);
    if (!search) return options;

    return options.filter((option) => {
      const haystack = `${option.label} ${option.value}`;
      return normalizeSearch(haystack).includes(search);
    });
  }, [debouncedInputValue, options]);

  const selectedOptionMap = React.useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options]
  );

  const optionsWithAll = React.useMemo(() => {
    const filtered = filteredBaseOptions.filter(
      (option) => option.value !== ALL_OPTION.value
    );
    const isAllValueSelected = value.includes(ALL_OPTION.value);
    const selectedSet = new Set(
      isAllValueSelected ? filtered.map((option) => option.value) : value
    );
    const selectedOptionsOutsideSearch = value
      .filter((entry) => entry !== ALL_OPTION.value)
      .map((entry) => selectedOptionMap.get(entry))
      .filter((option): option is SelectOption => Boolean(option))
      .filter(
        (option) =>
          !filtered.some(
            (filteredOption) => filteredOption.value === option.value
          )
      );
    const mergedOptions = [...filtered, ...selectedOptionsOutsideSearch];
    const sorted = [...mergedOptions].sort((left, right) => {
      const leftSelected = selectedSet.has(left.value) ? 0 : 1;
      const rightSelected = selectedSet.has(right.value) ? 0 : 1;
      if (leftSelected !== rightSelected) return leftSelected - rightSelected;
      return left.label.localeCompare(right.label, "id");
    });
    return [ALL_OPTION, ...sorted];
  }, [filteredBaseOptions, selectedOptionMap, value]);

  const selectedOptions = React.useMemo(() => {
    if (allowSelectAllToken && value.includes(ALL_OPTION.value)) {
      return [ALL_OPTION];
    }

    const selectedSet = new Set(
      value.includes(ALL_OPTION.value)
        ? optionsWithAll
            .filter((option) => option.value !== ALL_OPTION.value)
            .map((option) => option.value)
        : value
    );
    return optionsWithAll.filter(
      (option) =>
        selectedSet.has(option.value) && option.value !== ALL_OPTION.value
    );
  }, [allowSelectAllToken, optionsWithAll, value]);
  const selectAllActive =
    allowSelectAllToken && value.includes(ALL_OPTION.value);

  const handleChange = React.useCallback(
    (items: MultiValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
      const values = items.map((item) => item.value);
      if (values.includes(ALL_OPTION.value)) {
        if (allowSelectAllToken) {
          if (
            value.includes(ALL_OPTION.value) &&
            actionMeta.action === "select-option" &&
            actionMeta.option?.value &&
            actionMeta.option.value !== ALL_OPTION.value
          ) {
            onChange([actionMeta.option.value]);
            return;
          }

          if (
            actionMeta.action === "select-option" &&
            actionMeta.option?.value === ALL_OPTION.value
          ) {
            onChange([ALL_OPTION.value]);
            return;
          }

          const hadSelectAll = value.includes(ALL_OPTION.value);
          const regularValues = values.filter(
            (entry) => entry !== ALL_OPTION.value
          );
          if (hadSelectAll && regularValues.length > 0) {
            onChange(regularValues);
            return;
          }
          onChange([ALL_OPTION.value]);
          return;
        }
        const baseValues = optionsWithAll
          .filter((option) => option.value !== ALL_OPTION.value)
          .map((option) => option.value);
        const allAlreadySelected =
          value.length === baseValues.length &&
          baseValues.every((entry) => value.includes(entry));
        onChange(allAlreadySelected ? [] : baseValues);
        return;
      }
      onChange(values.filter((entry) => entry !== ALL_OPTION.value));
    },
    [allowSelectAllToken, onChange, optionsWithAll, value]
  );

  const handleRemove = React.useCallback(
    (entryValue: string) => {
      if (allowSelectAllToken && entryValue === ALL_OPTION.value) {
        onChange([]);
        return;
      }
      onChange(value.filter((item) => item !== entryValue));
    },
    [allowSelectAllToken, onChange, value]
  );

  const LocalOption = React.useCallback(
    (props: OptionProps<SelectOption, true, GroupBase<SelectOption>>) => {
      const selectedValues = new Set(
        (props.selectProps.value as SelectOption[]).map((item) => item.value)
      );
      const isAll = props.data.value === ALL_OPTION.value;
      const allRegularOptions = (props.options as SelectOption[]).filter(
        (option) => option.value !== ALL_OPTION.value
      );
      const allSelected =
        allRegularOptions.length > 0 &&
        allRegularOptions.every((option) => selectedValues.has(option.value));
      const selectAllActive =
        allowSelectAllToken && selectedValues.has(ALL_OPTION.value);
      const checked = isAll
        ? selectAllActive || allSelected
        : selectAllActive
          ? false
          : props.isSelected;
      const alpha2 = getOptionAlpha2?.(props.data);

      return (
        <components.Option {...props}>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`flex items-center gap-2 leading-none ${isAll ? "font-semibold text-slate-800" : ""}`}
            >
              {!isAll && alpha2 ? (
                <CountryFlag
                  alpha2={alpha2}
                  countryName={props.data.label}
                  className="h-5 w-5 rounded-none bg-transparent! text-[15px]"
                />
              ) : null}
              <span
                className={`${size === "sm" ? "text-[11px]" : "text-[13px]"} leading-none`}
              >
                {props.data.label}
              </span>
            </span>
            {checked ? (
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center text-[10px] leading-none text-slate-500">
                x
              </span>
            ) : null}
          </div>
        </components.Option>
      );
    },
    [allowSelectAllToken, getOptionAlpha2, size]
  );

  const LocalValueContainer = React.useCallback(
    (
      props: ValueContainerProps<SelectOption, true, GroupBase<SelectOption>>
    ) => {
      const selected = props.getValue();
      const regularSelected = selected.filter(
        (item) => item.value !== ALL_OPTION.value
      );
      const allOptions = (props.selectProps.options as SelectOption[]).filter(
        (item) => item.value !== ALL_OPTION.value
      );
      const allSelected =
        allOptions.length > 0 && regularSelected.length === allOptions.length;

      return (
        <components.ValueContainer {...props}>
          {regularSelected.length > 0 ? (
            <span className="truncate pl-1 text-xs font-medium text-slate-700">
              {countLabel
                ? countLabel(regularSelected.length, allSelected)
                : allSelected
                  ? "Semua dipilih"
                  : `Terpilih ${regularSelected.length}`}
            </span>
          ) : allowSelectAllToken &&
            selected.some((item) => item.value === ALL_OPTION.value) ? (
            <span className="truncate pl-1 text-xs font-medium text-slate-700">
              {countLabel
                ? countLabel(allOptions.length, true)
                : "Semua dipilih"}
            </span>
          ) : null}
          {props.children}
        </components.ValueContainer>
      );
    },
    [allowSelectAllToken, countLabel]
  );

  const LocalMenuList = React.useCallback(
    (props: MenuListProps<SelectOption, true, GroupBase<SelectOption>>) => (
      <VirtualizedMenuList {...props} itemHeight={menuItemHeight} />
    ),
    [menuItemHeight]
  );

  React.useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!dragStateRef.current) return;
      const delta = event.clientY - dragStateRef.current.startY;
      const nextHeight = Math.min(
        MAX_SELECTED_PANEL_HEIGHT,
        Math.max(
          MIN_SELECTED_PANEL_HEIGHT,
          dragStateRef.current.startHeight + delta
        )
      );
      setSelectedListHeight(nextHeight);
    }

    function handlePointerUp() {
      dragStateRef.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const handleResizeStart = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      dragStateRef.current = {
        startY: event.clientY,
        startHeight: selectedListHeight
      };
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ns-resize";
    },
    [selectedListHeight]
  );

  return (
    <div className={className}>
      <div
        className={cn(
          "overflow-hidden rounded-md border bg-white",
          error ? "border-rose-300" : "border-slate-200"
        )}
      >
        <div
          className={showSelectedList ? "border-b border-slate-200 p-2" : "p-0"}
        >
          <ReactSelect<SelectOption, true, GroupBase<SelectOption>>
            isMulti
            options={optionsWithAll}
            value={selectedOptions}
            onChange={handleChange}
            styles={buildSelectStyles(size, Boolean(error))}
            placeholder={placeholder}
            isSearchable
            isLoading={isLoading}
            isDisabled={isDisabled}
            isClearable={value.length > 0}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            menuPortalTarget={
              typeof window !== "undefined" ? document.body : null
            }
            menuPosition="fixed"
            menuShouldBlockScroll
            inputValue={inputValue}
            onInputChange={(nextValue, meta) => {
              if (meta.action === "input-change") {
                setInputValue(nextValue);
              }
              if (meta.action === "menu-close") {
                setInputValue("");
              }
              return nextValue;
            }}
            filterOption={() => true}
            noOptionsMessage={() => noOptionsMessage}
            aria-invalid={Boolean(error)}
            components={{
              Option: LocalOption,
              ValueContainer: LocalValueContainer,
              MenuList: LocalMenuList
            }}
          />
        </div>

        {showSelectedList ? (
          <>
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <span>
                  {selectAllActive
                    ? "Pilih Semua aktif"
                    : `${selectedOptions.length} dipilih`}
                </span>
                {footerNote ? <span>{footerNote}</span> : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedListVisible((current) => !current)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition hover:bg-slate-100"
                >
                  {selectedListVisible ? "Sembunyikan" : "Tampilkan"}
                  {selectedListVisible ? (
                    <ChevronUpIcon className="h-3 w-3" />
                  ) : (
                    <ChevronDownIcon className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
            {selectedListVisible ? (
              <>
                <div
                  className="overflow-y-auto px-3 py-2"
                  style={{ height: selectedListHeight }}
                >
                  <div className="flex flex-wrap gap-2">
                    {selectedOptions.length > 0 ? (
                      selectedOptions.map((option) => {
                        const alpha2 = getOptionAlpha2?.(option);
                        return (
                          <span
                            key={option.value}
                            className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-2 py-1 text-[12px] font-medium leading-none text-slate-700"
                            title={option.label}
                          >
                            {alpha2 ? (
                              <CountryFlag
                                alpha2={alpha2}
                                countryName={option.label}
                                className="h-5 w-5 rounded-none bg-transparent! text-[15px]"
                              />
                            ) : null}
                            <span className="max-w-52 truncate text-[12px] leading-none">
                              {option.label}
                            </span>
                            <button
                              type="button"
                              className="inline-flex h-3.5 w-3.5 items-center justify-center text-[10px] leading-none text-slate-500 transition hover:text-slate-800"
                              onClick={() => handleRemove(option.value)}
                              aria-label={`Hapus ${option.label}`}
                            >
                              x
                            </button>
                          </span>
                        );
                      })
                    ) : (
                      <span className="py-1 text-xs text-slate-400">
                        {emptySelectedLabel}
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-t border-slate-200 px-3 py-1">
                  <button
                    type="button"
                    onPointerDown={handleResizeStart}
                    className="flex w-full cursor-ns-resize items-center justify-center"
                    aria-label="Ubah tinggi panel pilihan"
                  >
                    <span className="h-1.5 w-12 rounded-full bg-slate-300 transition hover:bg-slate-400" />
                  </button>
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </div>
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
