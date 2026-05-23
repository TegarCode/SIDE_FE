import React from "react";
import {
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import * as yup from "yup";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { GroupedFilterMultiSelect } from "@/components/ui/Form/GroupedFilterMultiSelect";
import type { SektorHsCodeGroupResult } from "@/type/komoditasUtama";
import { hsCodeFilterSchema } from "@/validators/komoditasUtamaFilters";

type TikHsCodeFiltersPanelProps = {
  data: SektorHsCodeGroupResult | null | undefined;
  selectedHsCodes: string[];
  draftHsCodes: string[];
  loading: boolean;
  sectorLabel?: string;
  onDraftChange: (values: string[]) => void;
  onReset: () => void;
  onSubmit: () => void;
};

function isDirtyValue(left: string[], right: string[]) {
  return (
    left.length !== right.length || left.some((item) => !right.includes(item))
  );
}

export function HsCodeFiltersPanel({
  data,
  selectedHsCodes,
  draftHsCodes,
  loading,
  sectorLabel,
  onDraftChange,
  onReset,
  onSubmit
}: TikHsCodeFiltersPanelProps) {
  const resolvedSectorLabel = sectorLabel?.trim() || data?.sektor || "Sektor";
  const sectorLabelUpper = resolvedSectorLabel.toUpperCase();
  const isDraftAllSelected =
    draftHsCodes.length > 0 && data?.totalCount === draftHsCodes.length;
  const isDirty = isDirtyValue(draftHsCodes, selectedHsCodes);
  const filterBadge = loading
    ? "Memuat"
    : isDirty
      ? "Filter belum diterapkan"
      : "Filter Aktif";
  const validationMessage = React.useMemo(() => {
    try {
      hsCodeFilterSchema.validateSync(draftHsCodes);
      return null;
    } catch (error) {
      return error instanceof yup.ValidationError
        ? error.message
        : "Filter HS Code belum valid.";
    }
  }, [draftHsCodes]);
  const isValid = validationMessage == null;

  return (
    <Accordion
      title={`Filter HS Code ${resolvedSectorLabel}`}
      description="Pilih HS Code berdasarkan grouping kategori. Klik header untuk membuka atau menutup filter."
      badge={filterBadge}
      summary={
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200">
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-200">
            HS Code:{" "}
            {isDraftAllSelected
              ? "Semua HS Code"
              : `${draftHsCodes.length} dipilih`}
          </span>
          {data?.sektor ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
              {resolvedSectorLabel}
            </span>
          ) : null}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-md bg-slate-50 px-2.5 py-1.5">
          <p className="text-[11px] font-medium text-slate-500">
            {data?.totalCount ?? 0} HS Code tersedia | {selectedHsCodes.length}{" "}
            HS Code aktif
          </p>
        </div>

        {data?.sourceDescription ? (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
              Sumber Data
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {data.sourceDescription}
            </p>
          </div>
        ) : null}

        <GroupedFilterMultiSelect
          groups={data?.groups ?? []}
          value={draftHsCodes}
          onChange={onDraftChange}
          isLoading={loading}
          isDisabled={loading}
          placeholder={`Pilih HS Code ${resolvedSectorLabel}...`}
          countLabel={(count, allSelected) =>
            allSelected
              ? `Semua HS Code ${sectorLabelUpper}`
              : `Terpilih ${count} HS Code ${sectorLabelUpper}`
          }
          showSelectedList
          defaultSelectedListVisible
          helperText={`Sektor: ${resolvedSectorLabel}`}
          footerNote={data ? `dari ${data.totalCount} HS Code` : undefined}
          emptySelectedLabel={`(Belum ada HS Code ${sectorLabelUpper} dipilih)`}
          noOptionsMessage={
            loading
              ? `Memuat HS Code ${sectorLabelUpper}...`
              : `HS Code ${sectorLabelUpper} tidak ditemukan`
          }
        />

        {!isValid ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {validationMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 rounded-md bg-slate-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-medium text-slate-500 sm:max-w-[60%]">
            Perubahan filter akan diterapkan saat Anda menekan{" "}
            <span className="font-semibold text-slate-700">Cari Data</span>.
          </p>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <Button
              type="button"
              onClick={onReset}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-white px-4 py-1.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 sm:w-auto"
            >
              <ArrowPathIcon className="h-3 w-3" />
              Reset
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={onSubmit}
              disabled={loading || !isDirty || !isValid}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md px-4 py-1.5 text-[13px] font-semibold shadow-sm sm:w-auto"
            >
              <MagnifyingGlassIcon className="h-3 w-3" />
              Cari Data
            </Button>
          </div>
        </div>
      </div>
    </Accordion>
  );
}
