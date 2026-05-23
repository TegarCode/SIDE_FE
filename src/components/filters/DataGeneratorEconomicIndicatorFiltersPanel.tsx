import React from "react";
import {
  ChevronUpDownIcon,
  FunnelIcon,
  PresentationChartLineIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Form/Select";
import { useToast } from "@/components/ui/Toast";
import {
  useDataGeneratorEconomicIndicatorOptionsQuery,
  useDataGeneratorEconomicIndicatorYearsQuery
} from "@/hooks/data-generator/useDataGeneratorEconomicIndicatorMasterQuery";
import { isUnauthorizedApiError } from "@/utils/apiError";
import { validateDataGeneratorEconomicIndicatorFilters } from "@/validators/dataGeneratorEconomicIndicatorFilters";

export type DataGeneratorEconomicIndicatorFilterValue = {
  indicatorId: string | null;
  yearFrom: string | null;
  yearTo: string | null;
  outputType: "table" | "chart";
};

type Props = {
  value: DataGeneratorEconomicIndicatorFilterValue;
  onChange: (next: DataGeneratorEconomicIndicatorFilterValue) => void;
  onApply?: (next: DataGeneratorEconomicIndicatorFilterValue) => void;
  onUnauthorizedChange?: (hasUnauthorizedError: boolean) => void;
  badge?: string;
  isSubmitting?: boolean;
};

function getSelectedLabel(
  value: string | null,
  options: { value: string; label: string }[],
  fallback: string
) {
  if (!value) return fallback;
  return options.find((option) => option.value === value)?.label ?? fallback;
}

export function DataGeneratorEconomicIndicatorFiltersPanel({
  value,
  onChange,
  onApply,
  onUnauthorizedChange,
  badge,
  isSubmitting = false
}: Props) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const indicatorsQuery = useDataGeneratorEconomicIndicatorOptionsQuery();
  const yearsQuery = useDataGeneratorEconomicIndicatorYearsQuery();

  const indicatorOptions = React.useMemo(
    () => indicatorsQuery.data ?? [],
    [indicatorsQuery.data]
  );
  const yearOptions = React.useMemo(
    () => yearsQuery.data ?? [],
    [yearsQuery.data]
  );
  const sortedYearNumbers = React.useMemo(
    () =>
      [...yearOptions]
        .map((option) => Number(option.value))
        .filter((year) => Number.isFinite(year))
        .sort((left, right) => right - left),
    [yearOptions]
  );
  const validationErrors = React.useMemo(
    () => validateDataGeneratorEconomicIndicatorFilters(value),
    [value]
  );
  const fieldErrors = submitted ? validationErrors : {};
  const hasUnauthorizedError = React.useMemo(
    () =>
      [indicatorsQuery.error, yearsQuery.error].some((error) =>
        isUnauthorizedApiError(error)
      ),
    [indicatorsQuery.error, yearsQuery.error]
  );

  React.useEffect(() => {
    onUnauthorizedChange?.(hasUnauthorizedError);
  }, [hasUnauthorizedError, onUnauthorizedChange]);

  const updateValue = React.useCallback(
    (patch: Partial<DataGeneratorEconomicIndicatorFilterValue>) => {
      onChange({ ...value, ...patch });
    },
    [onChange, value]
  );

  React.useEffect(() => {
    if (!value.indicatorId && indicatorOptions[0]?.value) {
      updateValue({ indicatorId: indicatorOptions[0].value });
    }
  }, [indicatorOptions, updateValue, value.indicatorId]);

  React.useEffect(() => {
    if (sortedYearNumbers.length === 0) return;
    const latest = sortedYearNumbers[0];
    const previous = sortedYearNumbers[1] ?? latest;
    const patch: Partial<DataGeneratorEconomicIndicatorFilterValue> = {};
    if (!value.yearTo) patch.yearTo = String(latest);
    if (!value.yearFrom) patch.yearFrom = String(previous);
    if (Object.keys(patch).length > 0) updateValue(patch);
  }, [sortedYearNumbers, updateValue, value.yearFrom, value.yearTo]);

  React.useEffect(() => {
    const start = Number(value.yearFrom);
    const end = Number(value.yearTo);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start <= end)
      return;
    updateValue({ yearTo: value.yearFrom });
  }, [updateValue, value.yearFrom, value.yearTo]);

  const yearFromOptions = React.useMemo(() => {
    const selectedYearTo = Number(value.yearTo);
    if (!Number.isFinite(selectedYearTo)) return yearOptions;
    return yearOptions.filter(
      (option) => Number(option.value) <= selectedYearTo
    );
  }, [value.yearTo, yearOptions]);
  const yearToOptions = React.useMemo(() => {
    const selectedYearFrom = Number(value.yearFrom);
    if (!Number.isFinite(selectedYearFrom)) return yearOptions;
    return yearOptions.filter(
      (option) => Number(option.value) >= selectedYearFrom
    );
  }, [value.yearFrom, yearOptions]);

  const handleReset = React.useCallback(() => {
    setSubmitted(false);
    onChange({
      indicatorId: indicatorOptions[0]?.value ?? null,
      yearFrom: null,
      yearTo: null,
      outputType: "table"
    });
  }, [indicatorOptions, onChange]);

  const submitWithMode = React.useCallback(
    (outputType: "table" | "chart") => {
      setSubmitted(true);
      const nextValue = { ...value, outputType };
      const errors = validateDataGeneratorEconomicIndicatorFilters(nextValue);
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast({
          title: "Filter indikator ekonomi belum lengkap",
          description: "Periksa field yang ditandai lalu coba lagi.",
          tone: "error"
        });
        return;
      }
      onChange(nextValue);
      onApply?.(nextValue);
    },
    [onApply, onChange, toast, value]
  );

  return (
    <Accordion
      title="Filter Data Generator Indikator Ekonomi & Daya Saing"
      description="Susun indikator dan rentang tahun untuk menyiapkan tampilan tabel maupun visualisasi."
      badge={badge}
      summary={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
            <FunnelIcon className="h-3 w-3" />
            Klik untuk memfilter
          </span>
          {value.indicatorId && (
            <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-200">
              Indikator:{" "}
              {getSelectedLabel(
                value.indicatorId,
                indicatorOptions,
                value.indicatorId
              )}
            </span>
          )}
          {(value.yearFrom || value.yearTo) && (
            <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-violet-200">
              Tahun: {value.yearFrom ?? "-"}-{value.yearTo ?? "-"}
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1 md:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Indikator
            </p>
            <Select
              value={value.indicatorId ?? ""}
              options={indicatorOptions}
              onChange={(next) => updateValue({ indicatorId: next || null })}
              placeholder="Pilih indikator"
              size="sm"
              error={fieldErrors.indicatorId}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tahun Awal
            </p>
            <Select
              value={value.yearFrom ?? ""}
              options={yearFromOptions}
              onChange={(next) =>
                updateValue({
                  yearFrom: next,
                  yearTo:
                    Number(value.yearTo) < Number(next) && next
                      ? next
                      : value.yearTo
                })
              }
              placeholder="Pilih tahun awal"
              size="sm"
              error={fieldErrors.yearFrom}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tahun Akhir
            </p>
            <Select
              value={value.yearTo ?? ""}
              options={yearToOptions}
              onChange={(next) =>
                updateValue({
                  yearFrom:
                    Number(value.yearFrom) > Number(next) && next
                      ? next
                      : value.yearFrom,
                  yearTo: next
                })
              }
              placeholder="Pilih tahun akhir"
              size="sm"
              error={fieldErrors.yearTo}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5 rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Output Generator
            </p>
            <p className="text-xs text-slate-500">
              Pilih apakah hasil generator difokuskan untuk tampilan tabel atau
              visualisasi.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={value.outputType === "table" ? "primary" : "outline"}
              disabled={isSubmitting}
              onClick={() => submitWithMode("table")}
              className={
                value.outputType === "table"
                  ? "inline-flex h-9 items-center gap-2 rounded-sm px-3.5 text-sm font-semibold shadow-sm"
                  : "inline-flex h-9 items-center gap-2 rounded-sm border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              }
            >
              <TableCellsIcon className="h-4 w-4" />
              Tampilan Tabel
            </Button>
            <Button
              type="button"
              variant={value.outputType === "chart" ? "success" : "outline"}
              disabled={isSubmitting}
              onClick={() => submitWithMode("chart")}
              className={
                value.outputType === "chart"
                  ? "inline-flex h-9 items-center gap-2 rounded-sm px-3.5 text-sm font-semibold shadow-sm"
                  : "inline-flex h-9 items-center gap-2 rounded-sm border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              }
            >
              <PresentationChartLineIcon className="h-4 w-4" />
              Tampilan Visualisasi
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              className="inline-flex h-9 items-center gap-2 rounded-sm px-3.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              onClick={handleReset}
            >
              <ChevronUpDownIcon className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Accordion>
  );
}
