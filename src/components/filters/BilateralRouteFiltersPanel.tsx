import React from "react";
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { CountryGeoFilter } from "@/components/ui/Form/CountryGeoFilter";
import { validateBilateralRouteFilters } from "@/validators/bilateralRouteFilters";

export type MitraInvestmentRouteFilterState = {
  origins: string[];
  destinations: string[];
};

type BilateralRouteFiltersPanelProps = {
  value: MitraInvestmentRouteFilterState;
  loading: boolean;
  requestLoading?: boolean;
  title?: string;
  description?: string;
  onSubmit: (value: MitraInvestmentRouteFilterState) => void;
  onReset: () => void;
};

const DEFAULT_ORIGIN = "CHN";
const DEFAULT_DESTINATION = "IDN";

export function BilateralRouteFiltersPanel({
  value,
  loading,
  requestLoading = false,
  title = "Filter Rute Investasi",
  description = "Pilih asal dan tujuan untuk menampilkan grafik tren tahunan investasi. Klik header untuk membuka atau menutup filter.",
  onSubmit,
  onReset
}: BilateralRouteFiltersPanelProps) {
  const [draftOrigins, setDraftOrigins] = React.useState<string[]>(
    value.origins
  );
  const [draftDestinations, setDraftDestinations] = React.useState<string[]>(
    value.destinations
  );

  React.useEffect(() => setDraftOrigins(value.origins), [value.origins]);
  React.useEffect(
    () => setDraftDestinations(value.destinations),
    [value.destinations]
  );

  const isDirty = React.useMemo(
    () =>
      draftOrigins.join("|") !== value.origins.join("|") ||
      draftDestinations.join("|") !== value.destinations.join("|"),
    [draftDestinations, draftOrigins, value.destinations, value.origins]
  );
  const validationErrors = React.useMemo(
    () =>
      validateBilateralRouteFilters({
        origins: draftOrigins,
        destinations: draftDestinations
      }),
    [draftDestinations, draftOrigins]
  );
  const isValid = Object.keys(validationErrors).length === 0;

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="h-4 w-52 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          <div className="h-36 animate-pulse rounded-md bg-slate-100" />
          <div className="h-36 animate-pulse rounded-md bg-slate-100" />
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
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
            Asal: {draftOrigins.length} negara/entitas
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
            Tujuan: {draftDestinations.length} negara/entitas
          </span>
        </div>
      }
    >
      <div className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-md bg-slate-50 px-2.5 py-2">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Asal
          </label>
          <CountryGeoFilter
            value={draftOrigins}
            onChange={setDraftOrigins}
            loading={loading}
            disabled={requestLoading}
            defaultValues={[DEFAULT_ORIGIN]}
            countryLabel="Negara / Entitas Asal"
          />
          {validationErrors.origins ? (
            <p className="mt-2 text-xs text-amber-700">
              {validationErrors.origins}
            </p>
          ) : null}
        </div>

        <div className="rounded-md bg-slate-50 px-2.5 py-2">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Tujuan
          </label>
          <CountryGeoFilter
            value={draftDestinations}
            onChange={setDraftDestinations}
            loading={loading}
            disabled={requestLoading}
            defaultValues={[DEFAULT_DESTINATION]}
            countryLabel="Negara / Entitas Tujuan"
          />
          {validationErrors.destinations ? (
            <p className="mt-2 text-xs text-amber-700">
              {validationErrors.destinations}
            </p>
          ) : null}
        </div>
      </div>

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
                destinations: draftDestinations
              })
            }
            disabled={requestLoading || !isValid}
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

export { BilateralRouteFiltersPanel as MitraInvestmentRouteFiltersPanel };
