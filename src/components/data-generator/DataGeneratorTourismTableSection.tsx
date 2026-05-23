import React from "react";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { DataGeneratorTourismDetailModal } from "@/components/data-generator/DataGeneratorTourismDetailModal";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";

type TourismCellDetail = {
  asal?: string;
  tujuan?: string;
  total?: string;
};

type TourismMetaCountry = {
  code?: string;
  name?: string;
};

type TourismMetaGroup = {
  id?: string;
  name?: string;
};

type TourismMetaGroups = {
  organisasi?: TourismMetaGroup[];
  benua?: TourismMetaGroup[];
};

type TourismResponse = {
  data?: {
    pariwisata_asal_ke_tujuan?: Record<
      string,
      { total?: string; per_negara?: TourismCellDetail[] }
    >;
    pariwisata_asal_ke_dunia?: Record<
      string,
      { total?: string; per_negara?: TourismCellDetail[] }
    >;
    pariwisata_dunia_ke_tujuan?: Record<
      string,
      { total?: string; per_negara?: TourismCellDetail[] }
    >;
  };
  meta?: {
    years?: number[];
    sourceName?: string;
    typeData?: string;
    originCountries?: TourismMetaCountry[];
    destinationCountries?: TourismMetaCountry[];
    originGroups?: TourismMetaGroups;
    destinationGroups?: TourismMetaGroups;
  };
};

type Props = {
  data: TourismResponse | null;
  loading: boolean;
  originTooltipItems?: string[];
  destinationTooltipItems?: string[];
};

function SubtitleTooltipTrigger({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline cursor-help appearance-none border-0 bg-transparent p-0 text-inherit"
    >
      <span className="underline decoration-dotted underline-offset-3">
        {label}
      </span>
    </button>
  );
}

function toEntryArray(value: unknown): TourismCellDetail[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value as TourismCellDetail];
  return [];
}

function asNumber(value: unknown) {
  const normalized = String(value ?? "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: unknown) {
  const numeric = asNumber(value);
  if (numeric === 0) return "N/A";
  return numeric.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

function formatCompact(items: string[] = []) {
  if (items.length === 0) return "-";
  if (items.length <= 2) return items.join(", ");
  return `${items[0]}, +${items.length - 1} negara`;
}

function normalizeTypeDataLabel(value: string | undefined) {
  if (value === "Jumlah_Wisatawan") return "Jumlah Wisatawan";
  return value?.replace(/_/g, " ") ?? "Jumlah Wisatawan";
}

function getCountryNames(items: TourismMetaCountry[] | undefined) {
  return (items ?? [])
    .map((item) => item.name ?? item.code ?? "")
    .filter(Boolean);
}

function getGroupNames(groups: TourismMetaGroups | undefined) {
  return [...(groups?.organisasi ?? []), ...(groups?.benua ?? [])]
    .map((item) => item.name ?? item.id ?? "")
    .filter(Boolean);
}

function resolveParty(
  countryItems: TourismMetaCountry[] | undefined,
  groupItems: TourismMetaGroups | undefined
) {
  const groups = getGroupNames(groupItems);
  if (groups.length > 0) return groups;
  return getCountryNames(countryItems);
}

function tooltipContent(title: string, items: string[] = []) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="border-b border-slate-200 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>
      </div>
      <div className="max-h-44 space-y-1 overflow-y-auto pr-1 text-xs text-slate-600">
        {items.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </div>
    </div>
  );
}

export function DataGeneratorTourismTableSection({
  data,
  loading,
  originTooltipItems,
  destinationTooltipItems
}: Props) {
  const [detailState, setDetailState] = React.useState<{
    open: boolean;
    segment: "asal_ke_tujuan" | "asal_ke_dunia" | "dunia_ke_tujuan" | null;
    year: number | null;
  }>({
    open: false,
    segment: null,
    year: null
  });

  const meta = data?.meta ?? {};
  const years = React.useMemo(
    () =>
      [...(meta.years ?? [])]
        .map(Number)
        .filter(Number.isFinite)
        .sort((a, b) => a - b),
    [meta.years]
  );
  const rows = React.useMemo(
    () =>
      years.map((year) => ({
        year,
        asalKeTujuan: asNumber(
          data?.data?.pariwisata_asal_ke_tujuan?.[String(year)]?.total
        ),
        asalKeDunia: asNumber(
          data?.data?.pariwisata_asal_ke_dunia?.[String(year)]?.total
        ),
        duniaKeTujuan: asNumber(
          data?.data?.pariwisata_dunia_ke_tujuan?.[String(year)]?.total
        )
      })),
    [
      data?.data?.pariwisata_asal_ke_dunia,
      data?.data?.pariwisata_asal_ke_tujuan,
      data?.data?.pariwisata_dunia_ke_tujuan,
      years
    ]
  );

  const source = meta.sourceName ?? "-";
  const typeDataText = normalizeTypeDataLabel(meta.typeData);
  const originValues = React.useMemo(
    () => resolveParty(meta.originCountries, meta.originGroups),
    [meta.originCountries, meta.originGroups]
  );
  const destinationValues = React.useMemo(
    () => resolveParty(meta.destinationCountries, meta.destinationGroups),
    [meta.destinationCountries, meta.destinationGroups]
  );
  const originCompactLabel = React.useMemo(
    () => formatCompact(originValues),
    [originValues]
  );
  const destinationCompactLabel = React.useMemo(
    () => formatCompact(destinationValues),
    [destinationValues]
  );
  const originFullLabel = React.useMemo(
    () => (originValues.length ? originValues.join(", ") : "-"),
    [originValues]
  );
  const destinationFullLabel = React.useMemo(
    () => (destinationValues.length ? destinationValues.join(", ") : "-"),
    [destinationValues]
  );
  const exportSubtitle = `Tahun ${years[0] ?? "-"}-${years[years.length - 1] ?? "-"} | Jenis Data: ${typeDataText} | Asal: ${originFullLabel} | Tujuan: ${destinationFullLabel} | Sumber: ${source}`;
  const resolvedOriginTooltipItems = React.useMemo(
    () =>
      originTooltipItems && originTooltipItems.length > 0
        ? originTooltipItems
        : originValues,
    [originTooltipItems, originValues]
  );
  const resolvedDestinationTooltipItems = React.useMemo(
    () =>
      destinationTooltipItems && destinationTooltipItems.length > 0
        ? destinationTooltipItems
        : destinationValues,
    [destinationTooltipItems, destinationValues]
  );
  const originTooltipContent = React.useMemo(
    () => tooltipContent("Asal", resolvedOriginTooltipItems),
    [resolvedOriginTooltipItems]
  );
  const destinationTooltipContent = React.useMemo(
    () => tooltipContent("Tujuan", resolvedDestinationTooltipItems),
    [resolvedDestinationTooltipItems]
  );
  const subtitle = React.useMemo(
    () => (
      <>
        <span>{`Tahun ${years[0] ?? "-"}-${years[years.length - 1] ?? "-"}`}</span>
        <span> | Asal: </span>
        {originTooltipContent ? (
          <HoverInfoTooltip content={originTooltipContent} openOnClick>
            <SubtitleTooltipTrigger label={originCompactLabel} />
          </HoverInfoTooltip>
        ) : (
          <span>{originCompactLabel}</span>
        )}
        <span> | Tujuan: </span>
        {destinationTooltipContent ? (
          <HoverInfoTooltip content={destinationTooltipContent} openOnClick>
            <SubtitleTooltipTrigger label={destinationCompactLabel} />
          </HoverInfoTooltip>
        ) : (
          <span>{destinationCompactLabel}</span>
        )}
        <span>{` | Jenis Data: ${typeDataText}`}</span>
        <span>{` | Sumber: ${source}`}</span>
      </>
    ),
    [
      destinationCompactLabel,
      destinationTooltipContent,
      originCompactLabel,
      originTooltipContent,
      source,
      typeDataText,
      years
    ]
  );

  const detailRows = React.useMemo(() => {
    if (!detailState.segment || detailState.year == null) return [];
    if (detailState.segment === "asal_ke_tujuan") {
      return toEntryArray(
        data?.data?.pariwisata_asal_ke_tujuan?.[String(detailState.year)]
          ?.per_negara
      );
    }
    if (detailState.segment === "asal_ke_dunia") {
      return toEntryArray(
        data?.data?.pariwisata_asal_ke_dunia?.[String(detailState.year)]
          ?.per_negara
      );
    }
    return toEntryArray(
      data?.data?.pariwisata_dunia_ke_tujuan?.[String(detailState.year)]
        ?.per_negara
    );
  }, [
    data?.data?.pariwisata_asal_ke_dunia,
    data?.data?.pariwisata_asal_ke_tujuan,
    data?.data?.pariwisata_dunia_ke_tujuan,
    detailState.segment,
    detailState.year
  ]);

  const detailTitle = React.useMemo(() => {
    if (!detailState.segment || detailState.year == null) return "";
    if (detailState.segment === "asal_ke_tujuan") {
      return `${typeDataText} ${formatCompact(originValues)} ke ${formatCompact(destinationValues)}`;
    }
    if (detailState.segment === "asal_ke_dunia") {
      return `${typeDataText} ${formatCompact(originValues)} ke Dunia`;
    }
    return `${typeDataText} Dunia ke ${formatCompact(destinationValues)}`;
  }, [
    destinationValues,
    detailState.segment,
    detailState.year,
    originValues,
    typeDataText
  ]);

  const detailSubtitle = React.useMemo(() => {
    if (detailState.year == null) return undefined;
    return `Tahun ${detailState.year} | Jenis Data: ${typeDataText}`;
  }, [detailState.year, typeDataText]);

  const detailShowOrigin = detailState.segment !== "dunia_ke_tujuan";
  const detailShowDestination = detailState.segment !== "asal_ke_dunia";

  const handleDownload = React.useCallback(() => {
    void downloadTableAsExcel({
      filename: `data_generator_pariwisata_${typeDataText.toLowerCase().replace(/\s+/g, "_")}_table`,
      title: `Data ${typeDataText} Pariwisata`,
      subtitle: exportSubtitle,
      source: `Sumber: ${source}`,
      columns: [
        { key: "tahun", label: "Tahun" },
        {
          key: "asal_ke_tujuan",
          label: `${typeDataText} ${formatCompact(originValues)} ke ${formatCompact(destinationValues)}`
        },
        {
          key: "asal_ke_dunia",
          label: `${typeDataText} ${formatCompact(originValues)} ke Dunia`
        },
        {
          key: "dunia_ke_tujuan",
          label: `${typeDataText} Dunia ke ${formatCompact(destinationValues)}`
        }
      ],
      rows: rows.map((row) => ({
        tahun: String(row.year),
        asal_ke_tujuan: formatNumber(row.asalKeTujuan),
        asal_ke_dunia: formatNumber(row.asalKeDunia),
        dunia_ke_tujuan: formatNumber(row.duniaKeTujuan)
      }))
    });
  }, [
    destinationValues,
    exportSubtitle,
    originValues,
    rows,
    source,
    typeDataText
  ]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 h-72 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!data || rows.length === 0) {
    return (
      <EmptyStatePanel
        title="Data pariwisata belum tersedia"
        description="Atur filter pariwisata lalu pilih Tampilan Tabel untuk memuat hasil generator."
      />
    );
  }

  const content = (
    <div className="space-y-3">
      <div className="overflow-hidden border border-slate-300 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm text-slate-700">
            <thead className="bg-[#1d4ed8] text-white">
              <tr>
                <th className="border-b border-r border-blue-400 px-4 py-3 text-center font-semibold">
                  Tahun
                </th>
                <th className="border-b border-r border-blue-400 px-4 py-3 text-center font-semibold">
                  {typeDataText} {formatCompact(originValues)} ke{" "}
                  {formatCompact(destinationValues)}
                </th>
                <th className="border-b border-r border-blue-400 px-4 py-3 text-center font-semibold">
                  {typeDataText} {formatCompact(originValues)} ke Dunia
                </th>
                <th className="border-b border-blue-400 px-4 py-3 text-center font-semibold">
                  {typeDataText} Dunia ke {formatCompact(destinationValues)}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {rows.map((row, index) => (
                <tr
                  key={`tourism-row-${row.year}`}
                  className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                >
                  <td className="border-b border-r border-slate-200 px-4 py-3 text-center font-medium text-slate-800">
                    {row.year}
                  </td>
                  <td className="border-b border-r border-slate-200 px-4 py-3 text-right tabular-nums">
                    <button
                      type="button"
                      className="inline-flex items-center justify-end gap-1 font-medium text-[#1d4ed8] transition hover:underline"
                      onClick={() =>
                        setDetailState({
                          open: true,
                          segment: "asal_ke_tujuan",
                          year: row.year
                        })
                      }
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                      {formatNumber(row.asalKeTujuan)}
                    </button>
                  </td>
                  <td className="border-b border-r border-slate-200 px-4 py-3 text-right tabular-nums">
                    <button
                      type="button"
                      className="inline-flex items-center justify-end gap-1 font-medium text-[#1d4ed8] transition hover:underline"
                      onClick={() =>
                        setDetailState({
                          open: true,
                          segment: "asal_ke_dunia",
                          year: row.year
                        })
                      }
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                      {formatNumber(row.asalKeDunia)}
                    </button>
                  </td>
                  <td className="border-b border-slate-200 px-4 py-3 text-right tabular-nums">
                    <button
                      type="button"
                      className="inline-flex items-center justify-end gap-1 font-medium text-[#1d4ed8] transition hover:underline"
                      onClick={() =>
                        setDetailState({
                          open: true,
                          segment: "dunia_ke_tujuan",
                          year: row.year
                        })
                      }
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                      {formatNumber(row.duniaKeTujuan)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <ExpandableCard
      title={`Data ${typeDataText}`}
      subtitle={subtitle}
      className="shadow-sm"
      modalSize="full"
      actions={
        <Button
          type="button"
          variant="outline"
          className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          onClick={handleDownload}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </Button>
      }
      expandedContent={content}
    >
      <>
        {content}
        <DataGeneratorTourismDetailModal
          open={detailState.open}
          onClose={() =>
            setDetailState({ open: false, segment: null, year: null })
          }
          title={detailTitle}
          subtitle={detailSubtitle}
          rows={detailRows}
          showOrigin={detailShowOrigin}
          showDestination={detailShowDestination}
          source={`Sumber: ${source}`}
          exportFilename={`data_generator_tourism_detail_${detailState.segment ?? "detail"}`}
        />
      </>
    </ExpandableCard>
  );
}
