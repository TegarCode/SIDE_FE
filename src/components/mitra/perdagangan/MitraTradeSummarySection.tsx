import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import type { DiplomasiSummaryCardView } from "@/type/indonesiaDiplomasi";
import type { MitraTradeOverviewData } from "@/type/mitra";

type MitraTradeSummarySectionProps = {
  data: MitraTradeOverviewData | null | undefined;
  loading: boolean;
};

function resolveCountryNames(codes: string[], names: Record<string, string>) {
  return codes.map((code) => names[code] ?? code).filter(Boolean);
}

function formatCountryList(names: string[]) {
  if (names.length <= 3) return names.join(", ");
  const visible = names.slice(0, 3).join(", ");
  return `${visible} +${names.length - 3} lainnya`;
}

function CountryListTooltip({
  label,
  countries
}: {
  label: string;
  countries: string[];
}) {
  if (countries.length === 0) {
    return <span className="font-medium text-slate-700">{label}</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-medium text-slate-700">
        {formatCountryList(countries)}
      </span>
      <HoverInfoTooltip
        className="inline-flex"
        openOnClick
        content={null}
        renderContent={(close) => (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {label}
              </p>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-4 w-4 items-center justify-center text-slate-400 transition hover:text-slate-700"
                aria-label="Tutup tooltip"
              >
                <span className="text-xs leading-none">x</span>
              </button>
            </div>
            <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {countries.map((country) => (
                <div
                  key={country}
                  className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-700"
                >
                  {country}
                </div>
              ))}
            </div>
          </div>
        )}
      >
        <button
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center text-slate-400 transition hover:text-slate-700"
          aria-label={`Lihat daftar ${label.toLowerCase()}`}
        >
          <InformationCircleIcon className="h-3.5 w-3.5" />
        </button>
      </HoverInfoTooltip>
    </span>
  );
}

function buildSummaryCards(
  data: MitraTradeOverviewData | null | undefined
): DiplomasiSummaryCardView[] {
  const year = data?.year != null ? String(data.year) : null;
  const prevYear = data?.year != null ? String(data.year - 1) : null;
  const yearSuffix = year ? ` (${year})` : "";
  const unit = data?.unit ?? "";
  const sourceName = data?.sourceName ?? null;

  return [
    {
      id: "mitra-perdagangan-export",
      title: `Nilai Ekspor${yearSuffix}`,
      tone: "emerald",
      unit,
      value: data?.export.valueNow ?? null,
      prevValue: data?.export.valuePrev ?? null,
      year,
      prevYear,
      note: "",
      highlight: null,
      prevHighlight: null,
      highlightType: "none",
      sourceName
    },
    {
      id: "mitra-perdagangan-import",
      title: `Nilai Impor${yearSuffix}`,
      tone: "rose",
      unit,
      value: data?.import.valueNow ?? null,
      prevValue: data?.import.valuePrev ?? null,
      year,
      prevYear,
      note: "",
      highlight: null,
      prevHighlight: null,
      highlightType: "none",
      sourceName
    },
    {
      id: "mitra-perdagangan-total",
      title: `Total Perdagangan${yearSuffix}`,
      tone: "orange",
      unit,
      value: data?.total.valueNow ?? null,
      prevValue: data?.total.valuePrev ?? null,
      year,
      prevYear,
      note: "",
      highlight: null,
      prevHighlight: null,
      highlightType: "none",
      sourceName
    },
    {
      id: "mitra-perdagangan-balance",
      title: `Neraca Perdagangan${yearSuffix}`,
      tone: "purple",
      unit,
      value: data?.balance.valueNow ?? null,
      prevValue: data?.balance.valuePrev ?? null,
      year,
      prevYear,
      note: "",
      highlight: null,
      prevHighlight: null,
      highlightType: "none",
      sourceName
    }
  ];
}

export function MitraTradeSummarySection({
  data,
  loading
}: MitraTradeSummarySectionProps) {
  const cards = React.useMemo(() => buildSummaryCards(data), [data]);
  const origins = React.useMemo(
    () => (data ? resolveCountryNames(data.origin, data.originNames) : []),
    [data]
  );
  const destinations = React.useMemo(
    () =>
      data ? resolveCountryNames(data.destination, data.destinationNames) : [],
    [data]
  );

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Ringkasan Nilai Perdagangan
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan nilai ekspor, impor, total, dan neraca perdagangan pada
          tahun terakhir yang tersedia.
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="text-slate-500">Dari</span>
          <CountryListTooltip label="Negara Asal" countries={origins} />
          <span className="text-slate-500">ke</span>
          <CountryListTooltip label="Negara Tujuan" countries={destinations} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SummaryCard key={card.id} card={card} loading={loading} />
        ))}
      </div>
    </section>
  );
}
