import React from "react";
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { CountryGeoFilter } from "@/components/ui/Form/CountryGeoFilter";
import { FilterMultiSelect } from "@/components/ui/Form/FilterMultiSelect";
import { GroupedSelect } from "@/components/ui/Form/GroupedSelect";
import type { SelectOption } from "@/type/indonesiaDiplomasi";
import type {
  BilateralFilterState,
  BilateralSourceBySector,
  BilateralSourceOptionsBySector,
  BilateralTabSlug
} from "@/type/indonesiaKerjasamaBilateral";
import { validateKerjasamaBilateralFilters } from "@/validators/kerjasamaBilateralFilters";

type KerjasamaBilateralFiltersPanelProps = {
  tab: BilateralTabSlug;
  hsOptions: SelectOption[];
  selectedPartners: string[];
  selectedHsCodes: string[];
  sourceBySector: BilateralSourceBySector;
  sourceOptionsBySector: BilateralSourceOptionsBySector;
  loading: boolean;
  requestLoading: boolean;
  onSubmit: (next: BilateralFilterState) => void;
  onReset: () => void;
};

const SOURCE_SECTORS = [
  {
    key: "perdagangan",
    label: "PERDAGANGAN",
    color: { bg: "#FFF4CC", text: "#7A5C00", border: "#F7D46B" }
  },
  {
    key: "investasi",
    label: "INVESTASI",
    color: { bg: "#E7F0FF", text: "#1E3A8A", border: "#B9D2FF" }
  },
  {
    key: "pariwisata",
    label: "PARIWISATA",
    color: { bg: "#E9FBF5", text: "#0F766E", border: "#BCEFE0" }
  },
  {
    key: "jasa",
    label: "JASA",
    color: { bg: "#F5EFFF", text: "#6D28D9", border: "#D8B4FE" }
  }
] as const;

const SUMMARY_CHIP_STYLES = {
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  partner: "bg-amber-50 text-amber-800 ring-amber-200",
  hs: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  source: "bg-emerald-50 text-emerald-700 ring-emerald-200"
} as const;

function areSourcesEqual(
  left: BilateralSourceBySector,
  right: BilateralSourceBySector
) {
  return (
    left.perdagangan === right.perdagangan &&
    left.pariwisata === right.pariwisata &&
    left.investasi === right.investasi &&
    left.jasa === right.jasa
  );
}

function getActiveSourceValue(
  tab: BilateralTabSlug,
  sourceBySector: BilateralSourceBySector
) {
  if (tab === "kerjasama_pembangunan") return null;
  return sourceBySector[tab];
}

function getSelectedSourceLabels(
  sourceBySector: BilateralSourceBySector,
  sourceOptionsBySector: BilateralSourceOptionsBySector
) {
  return (
    Object.entries(sourceBySector) as Array<
      [keyof BilateralSourceBySector, string | null]
    >
  )
    .map(([sector, value]) => {
      if (!value) return null;
      const label =
        sourceOptionsBySector[sector].find((option) => option.value === value)
          ?.label ?? value;
      return { sector, label };
    })
    .filter(
      (
        item
      ): item is { sector: keyof BilateralSourceBySector; label: string } =>
        Boolean(item)
    );
}

export function KerjasamaBilateralFiltersPanel({
  tab,
  hsOptions,
  selectedPartners,
  selectedHsCodes,
  sourceBySector,
  sourceOptionsBySector,
  loading,
  requestLoading,
  onSubmit,
  onReset
}: KerjasamaBilateralFiltersPanelProps) {
  const [draftPartners, setDraftPartners] = React.useState(selectedPartners);
  const [draftHsCodes, setDraftHsCodes] = React.useState(
    selectedHsCodes.length > 0 ? selectedHsCodes : ["ALL"]
  );
  const [draftSources, setDraftSources] = React.useState(sourceBySector);

  React.useEffect(() => setDraftPartners(selectedPartners), [selectedPartners]);
  React.useEffect(
    () =>
      setDraftHsCodes(selectedHsCodes.length > 0 ? selectedHsCodes : ["ALL"]),
    [selectedHsCodes]
  );
  React.useEffect(() => setDraftSources(sourceBySector), [sourceBySector]);

  const isDirty =
    draftPartners.length !== selectedPartners.length ||
    draftPartners.some((item, index) => item !== selectedPartners[index]) ||
    draftHsCodes.length !== selectedHsCodes.length ||
    draftHsCodes.some((item, index) => item !== selectedHsCodes[index]) ||
    !areSourcesEqual(draftSources, sourceBySector);

  const activeSourceCount = Object.values(draftSources).filter(Boolean).length;
  const allHsValues = React.useMemo(
    () =>
      hsOptions
        .filter((option) => option.value !== "ALL")
        .map((option) => option.value),
    [hsOptions]
  );
  const activeSourceLabel =
    tab === "kerjasama_pembangunan"
      ? "Tab bantuan tidak mewajibkan sumber sektor aktif"
      : `Sumber aktif: ${getActiveSourceValue(tab, draftSources) || "-"}`;
  const selectedSourceLabels = React.useMemo(
    () => getSelectedSourceLabels(draftSources, sourceOptionsBySector),
    [draftSources, sourceOptionsBySector]
  );
  const summaryItems = React.useMemo(() => {
    const hsSummary =
      tab !== "perdagangan"
        ? null
        : allHsValues.length > 0 &&
            (draftHsCodes.includes("ALL") ||
              (draftHsCodes.length === allHsValues.length &&
                allHsValues.every((value) => draftHsCodes.includes(value))))
          ? "Semua HS Code"
          : `${draftHsCodes.length} HS Code`;

    return {
      partner: `${draftPartners.length} negara mitra`,
      hs: hsSummary,
      sources:
        selectedSourceLabels.length > 0
          ? selectedSourceLabels.map(
              (item) => `${item.sector.toUpperCase()}: ${item.label}`
            )
          : ["Sumber belum dipilih"]
    };
  }, [
    allHsValues,
    draftHsCodes,
    draftPartners.length,
    selectedSourceLabels,
    tab
  ]);
  const validationErrors = React.useMemo(
    () =>
      validateKerjasamaBilateralFilters(
        tab,
        {
          partners: draftPartners,
          hsCodes: draftHsCodes,
          sourceBySector: draftSources
        },
        sourceOptionsBySector
      ),
    [draftHsCodes, draftPartners, draftSources, sourceOptionsBySector, tab]
  );
  const isValid = Object.keys(validationErrors).length === 0;

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-2.5 grid gap-2.5 xl:grid-cols-12">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`bilateral-filter-skeleton-${index}`}
              className="h-16 animate-pulse rounded-md bg-slate-100 xl:col-span-3"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Accordion
      title="Filter Kerjasama Bilateral"
      description="Pilih negara mitra, HS Code, dan sumber data yang relevan. Klik header untuk membuka atau menutup filter."
      badge={isDirty ? "Filter belum diterapkan" : "Filter Aktif"}
      summary={
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${SUMMARY_CHIP_STYLES.info}`}
          >
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${SUMMARY_CHIP_STYLES.partner}`}
          >
            {summaryItems.partner}
          </span>
          {summaryItems.hs ? (
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${SUMMARY_CHIP_STYLES.hs}`}
            >
              {summaryItems.hs}
            </span>
          ) : null}
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${SUMMARY_CHIP_STYLES.source}`}
          >
            {summaryItems.sources.join(" / ")}
          </span>
        </div>
      }
    >
      <div className="rounded-md bg-slate-50 px-2.5 py-1.5">
        <p className="text-[11px] font-medium text-slate-500">
          {draftPartners.length} negara mitra |{" "}
          {tab === "perdagangan"
            ? `${draftHsCodes.length} HS Code`
            : "Tanpa filter HS"}{" "}
          | {activeSourceCount} sumber dipilih | {activeSourceLabel}
        </p>
      </div>

      <div className="mt-2.5 space-y-2.5">
        <div className="rounded-md bg-slate-50 px-2.5 py-2">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Negara Mitra
          </label>
          <CountryGeoFilter
            value={draftPartners}
            onChange={setDraftPartners}
            loading={loading}
            disabled={requestLoading}
          />
          {validationErrors.partners ? (
            <p className="mt-2 text-xs text-amber-700">
              {validationErrors.partners}
            </p>
          ) : null}
        </div>

        {tab === "perdagangan" ? (
          <div className="rounded-md bg-slate-50 px-2.5 py-2">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              HS Code
            </label>
            <FilterMultiSelect
              value={draftHsCodes}
              options={hsOptions}
              onChange={(values) => {
                if (values.includes("ALL")) {
                  setDraftHsCodes(["ALL"]);
                  return;
                }
                setDraftHsCodes(values.filter((entry) => entry !== "ALL"));
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
            {validationErrors.hsCodes ? (
              <p className="mt-2 text-xs text-amber-700">
                {validationErrors.hsCodes}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-md bg-slate-50 px-2.5 py-2">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Sumber Data
          </label>
          <GroupedSelect
            value={draftSources}
            onChange={(next) =>
              setDraftSources({
                perdagangan: next.perdagangan ?? null,
                investasi: next.investasi ?? null,
                pariwisata: next.pariwisata ?? null,
                jasa: next.jasa ?? null
              })
            }
            optionsBySector={sourceOptionsBySector}
            sectors={SOURCE_SECTORS}
            isDisabled={requestLoading}
            placeholder="Pilih sumber data..."
          />
          {validationErrors.sumber ? (
            <p className="mt-2 text-xs text-amber-700">
              {validationErrors.sumber}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-2">
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
                partners: draftPartners,
                hsCodes:
                  tab === "perdagangan" &&
                  allHsValues.length > 0 &&
                  draftHsCodes.length === allHsValues.length &&
                  allHsValues.every((value) => draftHsCodes.includes(value))
                    ? ["ALL"]
                    : draftHsCodes,
                sourceBySector: draftSources
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
