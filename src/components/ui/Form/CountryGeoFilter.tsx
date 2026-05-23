import React from "react";
import {
  Squares2X2Icon,
  GlobeAsiaAustraliaIcon
} from "@heroicons/react/24/outline";
import {
  useCommonCountriesQuery,
  useCountriesByGroupQuery,
  useCountryGroupsQuery
} from "@/hooks/indonesia/useCountryGeoQueries";
import type { CommonCountryItem } from "@/service/commonGeoService";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import { Button } from "@/components/ui/Button";
import { FilterMultiSelect } from "@/components/ui/Form/FilterMultiSelect";
import { Select } from "@/components/ui/Form/Select";

type CountryGeoFilterProps = {
  value: string[];
  onChange: (values: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
  defaultValues?: string[];
  countryLabel?: string;
};

type CountryMode = "geo" | "group";

type CountryGroupOption = SelectOption & {
  tipe?: string | null;
};

type CountryOption = SelectOption & {
  alpha2?: string | null;
};

function normalizeValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function sortByLabel<T extends { label: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    left.label.localeCompare(right.label, "id")
  );
}

function sameValues(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  return left.every((item, index) => item === right[index]);
}

export function CountryGeoFilter({
  value,
  onChange,
  loading = false,
  disabled = false,
  defaultValues,
  countryLabel = "Negara Mitra"
}: CountryGeoFilterProps) {
  const [mode, setMode] = React.useState<CountryMode>("geo");
  const [region, setRegion] = React.useState<string | null>(null);
  const [subregion, setSubregion] = React.useState<string | null>(null);
  const [groupId, setGroupId] = React.useState<string | null>(null);
  const hasInitializedDefaultRef = React.useRef(false);
  const commonCountriesQuery = useCommonCountriesQuery();
  const countryGroupsQuery = useCountryGroupsQuery();
  const groupCountriesQuery = useCountriesByGroupQuery(
    groupId,
    mode === "group"
  );

  const countries = React.useMemo<CommonCountryItem[]>(
    () => commonCountriesQuery.data ?? [],
    [commonCountriesQuery.data]
  );
  const groupOptions = React.useMemo<CountryGroupOption[]>(
    () => sortByLabel(countryGroupsQuery.data ?? []),
    [countryGroupsQuery.data]
  );
  const groupCountries = React.useMemo<CountryOption[]>(
    () =>
      sortByLabel(
        (groupCountriesQuery.data ?? []).map((item) => ({
          ...item,
          alpha2: item.kode_alpha2 ?? null
        }))
      ),
    [groupCountriesQuery.data]
  );

  const regionOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const item of countries) {
      if (item.dirjenId && item.dirjenNama)
        map.set(item.dirjenId, item.dirjenNama);
    }
    return [
      { value: "__ALL__", label: "Semua Region" },
      ...sortByLabel(
        Array.from(map.entries()).map(([entryValue, label]) => ({
          value: entryValue,
          label
        }))
      )
    ];
  }, [countries]);

  const subregionOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    const filtered = region
      ? countries.filter((item) => item.dirjenId === region)
      : countries;
    for (const item of filtered) {
      if (item.wilayahId && item.wilayahNama)
        map.set(item.wilayahId, item.wilayahNama);
    }
    return [
      { value: "__ALL__", label: "Semua Subregion" },
      ...sortByLabel(
        Array.from(map.entries()).map(([entryValue, label]) => ({
          value: entryValue,
          label
        }))
      )
    ];
  }, [countries, region]);

  const geoOptions = React.useMemo(() => {
    const filtered = countries.filter((item) => {
      if (region && item.dirjenId !== region) return false;
      if (subregion && item.wilayahId !== subregion) return false;
      return true;
    });

    return sortByLabel<CountryOption>(
      filtered.map((item) => ({
        value: item.id,
        label: item.nama,
        alpha2: item.kode_alpha2
      }))
    );
  }, [countries, region, subregion]);

  const activeOptions = mode === "group" ? groupCountries : geoOptions;
  const activeLoading =
    loading ||
    commonCountriesQuery.isLoading ||
    countryGroupsQuery.isLoading ||
    groupCountriesQuery.isLoading;
  const defaultPartnerValues = React.useMemo(() => {
    if (defaultValues && defaultValues.length > 0) {
      const validDefaults = defaultValues.filter((entry) =>
        countries.some((item) => item.id === entry)
      );
      if (validDefaults.length > 0) return validDefaults;
    }
    return [];
  }, [countries, defaultValues]);

  React.useEffect(() => {
    setSubregion((current) => {
      if (!current) return current;
      return subregionOptions.some((item) => item.value === current)
        ? current
        : null;
    });
  }, [subregionOptions]);

  React.useEffect(() => {
    if (mode !== "group" || !groupId) return;
    const nextValues = normalizeValues(
      groupCountries.map((item) => item.value)
    );
    if (nextValues.length === 0) return;
    const currentValues = normalizeValues(value);
    const sameLength = currentValues.length === nextValues.length;
    const sameValues =
      sameLength && currentValues.every((item) => nextValues.includes(item));
    if (!sameValues) onChange(nextValues);
  }, [groupCountries, groupId, mode, onChange, value]);

  React.useEffect(() => {
    if (defaultPartnerValues.length === 0) return;
    if (hasInitializedDefaultRef.current) return;
    if (value.length > 0) {
      hasInitializedDefaultRef.current = true;
      return;
    }
    hasInitializedDefaultRef.current = true;
    onChange(defaultPartnerValues);
  }, [defaultPartnerValues, onChange, value.length]);

  const resetToDefaultPartners = React.useCallback(() => {
    setRegion(null);
    setSubregion(null);
    setGroupId(null);
    if (!sameValues(value, defaultPartnerValues))
      onChange(defaultPartnerValues);
  }, [defaultPartnerValues, onChange, value]);

  const applyGeoSelection = React.useCallback(
    (nextRegion: string | null, nextSubregion: string | null) => {
      const nextValues = normalizeValues(
        countries
          .filter((item) => {
            if (nextRegion && item.dirjenId !== nextRegion) return false;
            if (nextSubregion && item.wilayahId !== nextSubregion) return false;
            return true;
          })
          .map((item) => item.id)
      );

      if (nextValues.length === 0) {
        onChange(defaultPartnerValues);
        return;
      }

      onChange(nextValues);
    },
    [countries, defaultPartnerValues, onChange]
  );

  const summary = `${value.length} negara dipilih`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Mode Pilihan Negara
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={mode === "geo" ? "primary" : "outline"}
            rounded="full"
            onClick={() => {
              if (mode !== "geo") {
                setMode("geo");
                resetToDefaultPartners();
              }
            }}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
          >
            <GlobeAsiaAustraliaIcon className="h-3.5 w-3.5" />
            Unit Regional
          </Button>
          <Button
            type="button"
            variant={mode === "group" ? "primary" : "outline"}
            rounded="full"
            onClick={() => {
              if (mode !== "group") {
                setMode("group");
                resetToDefaultPartners();
              }
            }}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
          >
            <Squares2X2Icon className="h-3.5 w-3.5" />
            Kawasan/Organisasi
          </Button>
        </div>
      </div>

      {mode === "geo" ? (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Region
            </label>
            <Select
              value={region ?? "__ALL__"}
              options={regionOptions}
              onChange={(next) => {
                const normalized = next === "__ALL__" ? null : next;
                setRegion(normalized);
                setSubregion(null);
                applyGeoSelection(normalized, null);
              }}
              isLoading={loading || commonCountriesQuery.isLoading}
              placeholder="Semua region"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Subregion
            </label>
            <Select
              value={subregion ?? "__ALL__"}
              options={subregionOptions}
              onChange={(next) => {
                const normalized = next === "__ALL__" ? null : next;
                setSubregion(normalized);
                applyGeoSelection(region, normalized);
              }}
              isLoading={loading || commonCountriesQuery.isLoading}
              placeholder="Semua subregion"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Kawasan/Organisasi
          </label>
          <Select
            value={groupId ?? "__ALL__"}
            options={[
              { value: "__ALL__", label: "Semua Kawasan/Organisasi" },
              ...groupOptions
            ]}
            onChange={(next) => {
              const normalized = next === "__ALL__" ? null : next;
              setGroupId(normalized);
              if (!normalized) onChange(defaultPartnerValues);
            }}
            isLoading={loading || countryGroupsQuery.isLoading}
            placeholder="Pilih kawasan/organisasi"
          />
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {countryLabel}
        </label>
        <FilterMultiSelect
          value={value}
          options={activeOptions}
          onChange={onChange}
          isLoading={activeLoading}
          isDisabled={disabled || (mode === "group" && !groupId)}
          placeholder={
            mode === "group" && !groupId
              ? "Pilih kawasan/organisasi terlebih dahulu..."
              : "Cari / pilih negara..."
          }
          countLabel={(count, allSelected) =>
            allSelected ? "Semua negara terpilih" : `Terpilih ${count} negara`
          }
          showSelectedList
          defaultSelectedListVisible
          emptySelectedLabel="(Belum ada negara dipilih)"
          getOptionAlpha2={(option) =>
            "alpha2" in option && typeof option.alpha2 === "string"
              ? option.alpha2
              : null
          }
        />
      </div>

      <p className="text-[11px] font-medium text-slate-500">{summary}</p>
    </div>
  );
}
