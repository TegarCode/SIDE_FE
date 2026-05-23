import React from "react";
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import * as yup from "yup";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { CountryGeoFilter } from "@/components/ui/Form/CountryGeoFilter";
import { FilterMultiSelect } from "@/components/ui/Form/FilterMultiSelect";
import { GroupedFilterMultiSelect } from "@/components/ui/Form/GroupedFilterMultiSelect";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import type { SektorHsCodeGroupResult } from "@/type/komoditasUtama";
import { bilateralHsCodeRouteSchema } from "@/validators/komoditasUtamaFilters";

export type MitraTradeFilterState = {
  origins: string[];
  destinations: string[];
  hsCodes: string[];
};

type MitraPerdaganganFiltersPanelProps = {
  value: MitraTradeFilterState;
  hsOptions?: SelectOption[];
  hsGroupedData?: SektorHsCodeGroupResult | null;
  loading: boolean;
  requestLoading?: boolean;
  title?: string;
  description?: string;
  originDefaultValues?: string[];
  destinationDefaultValues?: string[];
  onSubmit: (value: MitraTradeFilterState) => void;
  onReset: () => void;
};

const DEFAULT_COUNTRY_REPORTER = "CHN";
const DEFAULT_COUNTRY_PARTNER = "IDN";
const ALL_HS_VALUE = "ALL";

export function BilateralHsCodeRouteFiltersPanel({
  value,
  hsOptions = [],
  hsGroupedData = null,
  loading,
  requestLoading = false,
  title = "Filter Sektor Perdagangan",
  description = "Pilih asal, tujuan, dan HS Code. Klik header untuk membuka atau menutup filter.",
  originDefaultValues = [DEFAULT_COUNTRY_REPORTER],
  destinationDefaultValues = [DEFAULT_COUNTRY_PARTNER],
  onSubmit,
  onReset
}: MitraPerdaganganFiltersPanelProps) {
  const [draftOrigins, setDraftOrigins] = React.useState<string[]>(
    value.origins
  );
  const [draftDestinations, setDraftDestinations] = React.useState<string[]>(
    value.destinations
  );
  const [draftHsCodes, setDraftHsCodes] = React.useState<string[]>(
    value.hsCodes.length > 0 ? value.hsCodes : [ALL_HS_VALUE]
  );

  React.useEffect(() => setDraftOrigins(value.origins), [value.origins]);
  React.useEffect(
    () => setDraftDestinations(value.destinations),
    [value.destinations]
  );
  React.useEffect(
    () =>
      setDraftHsCodes(
        value.hsCodes.length > 0 ? value.hsCodes : [ALL_HS_VALUE]
      ),
    [value.hsCodes]
  );

  const isDirty = React.useMemo(
    () =>
      draftOrigins.join("|") !== value.origins.join("|") ||
      draftDestinations.join("|") !== value.destinations.join("|") ||
      draftHsCodes.join("|") !== value.hsCodes.join("|"),
    [
      draftDestinations,
      draftHsCodes,
      draftOrigins,
      value.destinations,
      value.hsCodes,
      value.origins
    ]
  );
  const isDraftAllSelected =
    hsGroupedData != null
      ? draftHsCodes.length > 0 &&
        hsGroupedData.totalCount === draftHsCodes.length
      : draftHsCodes.includes(ALL_HS_VALUE);
  const validation = React.useMemo(() => {
    try {
      bilateralHsCodeRouteSchema.validateSync(
        {
          origins: draftOrigins,
          destinations: draftDestinations,
          hsCodes: draftHsCodes
        },
        { abortEarly: false }
      );

      return {
        valid: true,
        originMessage: null,
        destinationMessage: null,
        hsCodeMessage: null,
        message: null
      };
    } catch (error) {
      const next = {
        valid: false,
        originMessage: null as string | null,
        destinationMessage: null as string | null,
        hsCodeMessage: null as string | null,
        message:
          "Lengkapi filter asal, tujuan, dan HS Code sebelum mencari data."
      };

      if (error instanceof yup.ValidationError) {
        for (const issue of error.inner) {
          if (issue.path === "origins" && !next.originMessage)
            next.originMessage = issue.message;
          if (issue.path === "destinations" && !next.destinationMessage)
            next.destinationMessage = issue.message;
          if (issue.path === "hsCodes" && !next.hsCodeMessage)
            next.hsCodeMessage = issue.message;
        }
      }

      return next;
    }
  }, [draftDestinations, draftHsCodes, draftOrigins]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="h-36 animate-pulse rounded-md bg-slate-100 xl:col-span-6" />
          <div className="h-36 animate-pulse rounded-md bg-slate-100 xl:col-span-6" />
          <div className="h-20 animate-pulse rounded-md bg-slate-100 xl:col-span-12" />
        </div>
      </div>
    );
  }

  return (
    <Accordion
      title={title}
      description={description}
      badge={isDirty ? "Filter belum diterapkan" : "Filter Aktif"}
      summary={
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200">
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
            Asal: {draftOrigins.length} negara/entitas
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
            Tujuan: {draftDestinations.length} negara/entitas
          </span>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-200">
            HS Code:{" "}
            {isDraftAllSelected
              ? "Semua HS Code"
              : `${draftHsCodes.length} dipilih`}
          </span>
        </div>
      }
    >
      <div className="grid gap-3 xl:grid-cols-12">
        <div className="rounded-md bg-slate-50 px-2.5 py-2 xl:col-span-6">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Asal
          </label>
          <CountryGeoFilter
            value={draftOrigins}
            onChange={setDraftOrigins}
            loading={loading}
            disabled={requestLoading}
            defaultValues={originDefaultValues}
            countryLabel="Negara / Entitas Asal"
          />
          {validation.originMessage ? (
            <p className="mt-2 text-xs text-amber-700">
              {validation.originMessage}
            </p>
          ) : null}
        </div>

        <div className="rounded-md bg-slate-50 px-2.5 py-2 xl:col-span-6">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Tujuan
          </label>
          <CountryGeoFilter
            value={draftDestinations}
            onChange={setDraftDestinations}
            loading={loading}
            disabled={requestLoading}
            defaultValues={destinationDefaultValues}
            countryLabel="Negara / Entitas Tujuan"
          />
          {validation.destinationMessage ? (
            <p className="mt-2 text-xs text-amber-700">
              {validation.destinationMessage}
            </p>
          ) : null}
        </div>

        <div className="rounded-md bg-slate-50 px-2.5 py-2 xl:col-span-12">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            HS Code
          </label>
          {hsGroupedData ? (
            <GroupedFilterMultiSelect
              groups={hsGroupedData.groups}
              value={draftHsCodes}
              onChange={setDraftHsCodes}
              isLoading={loading}
              isDisabled={requestLoading}
              placeholder="Pilih HS Code..."
              countLabel={(count, allSelected) =>
                allSelected ? "Semua HS Code" : `Terpilih ${count} HS Code`
              }
              showSelectedList
              defaultSelectedListVisible
              helperText={
                hsGroupedData.sektor
                  ? `Sektor: ${hsGroupedData.sektor}`
                  : undefined
              }
              footerNote={`dari ${hsGroupedData.totalCount} HS Code`}
              emptySelectedLabel="(Belum ada HS Code dipilih)"
              noOptionsMessage={
                loading ? "Memuat HS Code..." : "HS Code tidak ditemukan"
              }
            />
          ) : (
            <FilterMultiSelect
              value={draftHsCodes}
              options={hsOptions}
              onChange={(values) => {
                if (values.includes(ALL_HS_VALUE)) {
                  setDraftHsCodes([ALL_HS_VALUE]);
                  return;
                }
                setDraftHsCodes(values);
              }}
              isLoading={loading}
              isDisabled={requestLoading}
              placeholder="Pilih HS Code..."
              countLabel={(count, allSelected) =>
                allSelected ? "Semua HS Code" : `Terpilih ${count} HS Code`
              }
              showSelectedList
              emptySelectedLabel="(Belum ada HS Code dipilih)"
            />
          )}
          {validation.hsCodeMessage ? (
            <p className="mt-2 text-xs text-amber-700">
              {validation.hsCodeMessage}
            </p>
          ) : null}
        </div>
      </div>

      {!validation.valid ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {validation.message}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2.5">
        <p className="text-[10px] font-medium text-slate-500">
          Perubahan filter akan diterapkan saat Anda menekan{" "}
          <span className="font-semibold text-slate-700">Cari Data</span>.
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={onReset}
            disabled={requestLoading}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-1.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          >
            <ArrowPathIcon className="h-3 w-3" />
            Reset
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() =>
              onSubmit({
                origins: draftOrigins,
                destinations: draftDestinations,
                hsCodes: draftHsCodes
              })
            }
            disabled={requestLoading || !validation.valid}
            className="inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-[13px] font-semibold shadow-sm"
          >
            <MagnifyingGlassIcon className="h-3 w-3" />
            Cari Data
          </Button>
        </div>
      </div>
    </Accordion>
  );
}
