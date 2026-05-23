import React from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import ReactSelect, {
  components,
  type GroupProps,
  type GroupBase,
  type MultiValue,
  type OptionProps,
  type StylesConfig,
  type ValueContainerProps
} from "react-select";
import type {
  GroupedFilterOption,
  GroupedFilterOptionGroup
} from "@/type/komoditasUtama";

type GroupedFilterMultiSelectProps = {
  groups: GroupedFilterOptionGroup[];
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
  helperText?: string;
  availableLabel?: string;
  selectAllLabel?: string;
  clearAllLabel?: string;
  groupMetaLabel?: string;
};

const MIN_SELECTED_PANEL_HEIGHT = 64;
const MAX_SELECTED_PANEL_HEIGHT = 240;

const selectStyles: StylesConfig<
  GroupedFilterOption,
  true,
  GroupBase<GroupedFilterOption>
> = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderRadius: 6,
    borderColor: state.isFocused ? "#94a3b8" : "#cbd5e1",
    boxShadow: "none",
    backgroundColor: "#fff",
    "&:hover": { borderColor: "#94a3b8" }
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 10px",
    flexWrap: "nowrap",
    overflow: "hidden"
  }),
  indicatorsContainer: (base) => ({ ...base, minHeight: 38 }),
  dropdownIndicator: (base) => ({ ...base, padding: 6 }),
  clearIndicator: (base) => ({ ...base, padding: 6 }),
  menuPortal: (base) => ({ ...base, zIndex: 2147483647 }),
  menu: (base) => ({ ...base, zIndex: 50 }),
  menuList: (base) => ({
    ...base,
    paddingTop: 6,
    paddingBottom: 8
  }),
  group: (base) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: 10
  }),
  groupHeading: (base) => ({
    ...base,
    marginBottom: 0,
    paddingTop: 10,
    paddingBottom: 6,
    color: "#334155",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "none",
    letterSpacing: "0.01em"
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 13,
    backgroundColor: state.isFocused ? "#f8fafc" : "#fff",
    color: "#0f172a",
    paddingTop: 10,
    paddingBottom: 10,
    ":active": { ...base[":active"], backgroundColor: "#e2e8f0" }
  }),
  multiValue: () => ({ display: "none" })
};

function flattenGroups(groups: GroupedFilterOptionGroup[]) {
  return groups.flatMap((group) => group.options);
}

export function GroupedFilterMultiSelect({
  groups,
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
  helperText,
  availableLabel = "item tersedia",
  selectAllLabel = "Pilih Semua",
  clearAllLabel = "Kosongkan",
  groupMetaLabel = "Grouping"
}: GroupedFilterMultiSelectProps) {
  const [selectedListVisible, setSelectedListVisible] = React.useState(
    defaultSelectedListVisible
  );
  const [selectedListHeight, setSelectedListHeight] = React.useState(
    MIN_SELECTED_PANEL_HEIGHT
  );
  const [collapsedGroups, setCollapsedGroups] = React.useState<
    Record<string, boolean>
  >({});
  const dragStateRef = React.useRef<{
    startY: number;
    startHeight: number;
  } | null>(null);

  const allOptions = React.useMemo(() => flattenGroups(groups), [groups]);
  const selectedSet = React.useMemo(() => new Set(value), [value]);
  const allSelected =
    allOptions.length > 0 &&
    allOptions.every((option) => selectedSet.has(option.value));

  const groupedOptions = React.useMemo(
    () =>
      groups.map((group) => {
        const sortedOptions = [...group.options].sort((left, right) => {
          const leftSelected = selectedSet.has(left.value) ? 0 : 1;
          const rightSelected = selectedSet.has(right.value) ? 0 : 1;
          if (leftSelected !== rightSelected)
            return leftSelected - rightSelected;
          return left.code.localeCompare(right.code, "id");
        });

        return {
          label: `${group.label} (${group.optionCount})`,
          options: sortedOptions
        };
      }),
    [groups, selectedSet]
  );

  const selectedOptions = React.useMemo(
    () => allOptions.filter((option) => selectedSet.has(option.value)),
    [allOptions, selectedSet]
  );

  const handleChange = React.useCallback(
    (items: MultiValue<GroupedFilterOption>) => {
      onChange(items.map((item) => item.value));
    },
    [onChange]
  );

  const handleToggleAll = React.useCallback(() => {
    onChange(allSelected ? [] : allOptions.map((option) => option.value));
  }, [allOptions, allSelected, onChange]);

  const handleRemove = React.useCallback(
    (entryValue: string) => {
      onChange(value.filter((item) => item !== entryValue));
    },
    [onChange, value]
  );

  const LocalOption = React.useCallback(
    (
      props: OptionProps<
        GroupedFilterOption,
        true,
        GroupBase<GroupedFilterOption>
      >
    ) => (
      <components.Option {...props}>
        <div className="ml-2.5 flex items-center justify-between gap-2 rounded-r-lg border-l-3 border-slate-200 bg-slate-50/65 px-2 py-1.5 transition group-hover:border-sky-300">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-white">
              {props.data.code}
            </span>
            <p className="truncate text-[12px] leading-none text-slate-600">
              {props.data.description || props.data.label}
            </p>
          </div>
          {props.isSelected ? (
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700">
              Terpilih
            </span>
          ) : null}
        </div>
      </components.Option>
    ),
    []
  );

  const LocalGroup = React.useCallback(
    (
      props: GroupProps<
        GroupedFilterOption,
        true,
        GroupBase<GroupedFilterOption>
      >
    ) => {
      const groupName = String(props.data.label ?? "");
      const match = groupName.match(/^(.*)\s\((\d+)\)$/);
      const label = match ? match[1] : groupName;
      const count = match ? match[2] : String(props.data.options.length);
      const groupKey = groupName;
      const isCollapsed = collapsedGroups[groupKey] ?? true;
      const groupValues = props.data.options.map((option) => option.value);
      const selectedCount = groupValues.filter((entry) =>
        selectedSet.has(entry)
      ).length;
      const isGroupSelected =
        groupValues.length > 0 && selectedCount === groupValues.length;
      const isGroupPartiallySelected = selectedCount > 0 && !isGroupSelected;
      const children = React.Children.toArray(props.children);
      const items = children.filter(
        (child) =>
          React.isValidElement(child) && child.type !== components.GroupHeading
      );

      const toggleCollapse = () => {
        setCollapsedGroups((current) => ({
          ...current,
          [groupKey]: !isCollapsed
        }));
      };

      const handleToggleGroup = (
        event: React.MouseEvent<HTMLButtonElement>
      ) => {
        event.preventDefault();
        event.stopPropagation();

        if (isGroupSelected) {
          onChange(value.filter((entry) => !groupValues.includes(entry)));
          return;
        }

        const nextValues = new Set(value);
        groupValues.forEach((entry) => nextValues.add(entry));
        onChange(Array.from(nextValues));
      };

      return (
        <div className="rounded-xl border border-slate-200 bg-white/90 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
          <div
            className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-300 bg-linear-to-r from-slate-100 to-white px-3 py-2"
            onClick={toggleCollapse}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleCollapse();
              }
            }}
            role="button"
            tabIndex={0}
            aria-expanded={!isCollapsed}
          >
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-slate-800">
                {label}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                {groupMetaLabel}
                {selectedCount > 0 ? ` | ${selectedCount} dipilih` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                {count} item
              </span>
              <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                {isCollapsed ? "Buka" : "Tutup"}
              </span>
              <button
                type="button"
                onClick={handleToggleGroup}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 transition ${
                  isGroupSelected
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
                    : isGroupPartiallySelected
                      ? "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100"
                      : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                }`}
                aria-label={
                  isGroupSelected
                    ? `Kosongkan grup ${label}`
                    : `Pilih grup ${label}`
                }
              >
                {isGroupSelected ? "Kosongkan Grup" : "Pilih Grup"}
              </button>
            </div>
          </div>
          {!isCollapsed ? items : null}
        </div>
      );
    },
    [collapsedGroups, groupMetaLabel, onChange, selectedSet, value]
  );

  const LocalValueContainer = React.useCallback(
    (
      props: ValueContainerProps<
        GroupedFilterOption,
        true,
        GroupBase<GroupedFilterOption>
      >
    ) => {
      const selected = props.getValue();

      return (
        <components.ValueContainer {...props}>
          {selected.length > 0 ? (
            <span className="truncate pl-1 text-xs font-medium text-slate-700">
              {countLabel
                ? countLabel(selected.length, allSelected)
                : allSelected
                  ? "Semua dipilih"
                  : `Terpilih ${selected.length}`}
            </span>
          ) : null}
          {props.children}
        </components.ValueContainer>
      );
    },
    [allSelected, countLabel]
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
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span>
                {allOptions.length} {availableLabel}
              </span>
              {helperText ? <span>{helperText}</span> : null}
            </div>
            <button
              type="button"
              onClick={handleToggleAll}
              disabled={isDisabled || allOptions.length === 0}
              className="rounded-md border border-slate-200 px-2 py-1 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {allSelected ? clearAllLabel : selectAllLabel}
            </button>
          </div>
        </div>

        <div
          className={showSelectedList ? "border-b border-slate-200 p-2" : "p-2"}
        >
          <ReactSelect<
            GroupedFilterOption,
            true,
            GroupBase<GroupedFilterOption>
          >
            isMulti
            options={groupedOptions}
            value={selectedOptions}
            onChange={handleChange}
            styles={selectStyles}
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
            noOptionsMessage={() => noOptionsMessage}
            components={{
              Group: LocalGroup,
              Option: LocalOption,
              ValueContainer: LocalValueContainer
            }}
            filterOption={(candidate, inputValue) => {
              const keyword = inputValue.trim().toLowerCase();
              if (!keyword) return true;

              return [
                candidate.data.code,
                candidate.data.description,
                candidate.data.groupLabel,
                candidate.data.label
              ]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(keyword));
            }}
          />
        </div>

        {showSelectedList ? (
          <>
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <span>{selectedOptions.length} dipilih</span>
                {footerNote ? <span>{footerNote}</span> : null}
              </div>
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
            {selectedListVisible ? (
              <>
                <div
                  className="overflow-y-auto px-3 py-2"
                  style={{ height: selectedListHeight }}
                >
                  <div className="flex flex-wrap gap-2">
                    {selectedOptions.length > 0 ? (
                      selectedOptions.map((option) => (
                        <span
                          key={option.value}
                          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-2 py-1 text-[12px] font-medium leading-none text-slate-700"
                          title={option.label}
                        >
                          <span className="rounded bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
                            {option.code}
                          </span>
                          <span className="max-w-64 truncate text-[12px] leading-none">
                            {option.description || option.label}
                          </span>
                          <button
                            type="button"
                            className="inline-flex h-3.5 w-3.5 items-center justify-center text-[10px] leading-none text-slate-500 transition hover:text-slate-800"
                            onClick={() => handleRemove(option.value)}
                            aria-label={`Hapus ${option.code}`}
                          >
                            x
                          </button>
                        </span>
                      ))
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
    </div>
  );
}
