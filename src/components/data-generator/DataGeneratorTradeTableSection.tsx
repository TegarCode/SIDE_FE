import React from "react";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { DataLimitSelect } from "@/components/ui/Form/DataLimitSelect";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { Pagination } from "@/components/ui/Pagination";
import { DataGeneratorTradeDetailModal } from "@/components/data-generator/DataGeneratorTradeDetailModal";
import { downloadTableAsExcel } from "@/utils/downloadAsExcel";

type TradeCellDetail = {
  asal?: string;
  tujuan?: string;
  total?: string;
};

type TradeProductEntry = {
  hscode: string;
  product: string;
  total: string;
  [year: string]: unknown;
};

type TradeSection = {
  per_product?: TradeProductEntry[];
};

type TradeResponse = {
  data?: {
    Export_asal_ke_tujuan?: TradeSection;
    Import_asal_ke_tujuan?: TradeSection;
    Neraca_asal_ke_tujuan?: TradeSection;
    Total_asal_ke_tujuan?: TradeSection;
    Export_asal_ke_dunia?: TradeSection;
    Import_asal_ke_dunia?: TradeSection;
    Neraca_asal_ke_dunia?: TradeSection;
    Total_asal_ke_dunia?: TradeSection;
    Export_dunia_ke_tujuan?: TradeSection;
    Import_dunia_ke_tujuan?: TradeSection;
    Neraca_dunia_ke_tujuan?: TradeSection;
    Total_dunia_ke_tujuan?: TradeSection;
  };
  meta?: {
    years?: string[];
    tradeType?: string;
    origins?: string[];
    originGroups?: string[];
    destinations?: string[];
    destinationGroups?: string[];
    source?: string;
    pagination?: {
      total?: number;
      per_page?: number;
      current_page?: number;
      last_page?: number;
    };
  };
};

type DataGeneratorTradeTableSectionProps = {
  data: TradeResponse | null;
  loading: boolean;
  mode: "table" | "chart";
  page: number;
  perPage: string;
  onPageChange: (page: number) => void;
  onPerPageChange: (value: string) => void;
};

type MergedRow = {
  hscode: string;
  productLabel: string;
  A: TradeProductEntry | null;
  B: TradeProductEntry | null;
  C: TradeProductEntry | null;
};

type TradeScrollableTableProps = {
  mergedRows: MergedRow[];
  yearsA: string[];
  yearsB: string[];
  yearsC: string[];
  tradeTypeText: string;
  originCompactLabel: string;
  destinationCompactLabel: string;
  expanded: {
    hscode: string | null;
    year: string | null;
    segment: "A" | "B" | "C" | null;
  };
  setExpanded: React.Dispatch<
    React.SetStateAction<{
      hscode: string | null;
      year: string | null;
      segment: "A" | "B" | "C" | null;
    }>
  >;
  originCompactOrFullLabel: string;
  destinationCompactOrFullLabel: string;
  stickyTopClassName?: string;
  rowNumberStart?: number;
};

function TradeTableColGroup({
  yearsA,
  yearsB,
  yearsC
}: {
  yearsA: string[];
  yearsB: string[];
  yearsC: string[];
}) {
  return (
    <colgroup>
      <col style={{ width: "56px", minWidth: "56px" }} />
      <col style={{ width: "88px", minWidth: "88px" }} />
      <col style={{ width: "520px", minWidth: "520px" }} />
      {yearsA.map((year) => (
        <col
          key={`col-a-${year}`}
          style={{ width: "180px", minWidth: "180px" }}
        />
      ))}
      {yearsB.map((year) => (
        <col
          key={`col-b-${year}`}
          style={{ width: "180px", minWidth: "180px" }}
        />
      ))}
      {yearsC.map((year, index) => (
        <col
          key={`col-c-${year}-${index}`}
          style={{ width: "180px", minWidth: "180px" }}
        />
      ))}
    </colgroup>
  );
}

function formatFullPartyLabel(countries: string[] = [], groups: string[] = []) {
  if (groups.length > 0) return groups.join(", ");
  if (countries.length === 0) return "-";
  return countries.join(", ");
}

function formatCompactPartyLabel(
  countries: string[] = [],
  groups: string[] = []
) {
  if (groups.length > 0) {
    if (groups.length <= 2) return groups.join(", ");
    return `${groups[0]}, +${groups.length - 1} grup`;
  }
  if (countries.length === 0) return "-";
  if (countries.length <= 2) return countries.join(", ");
  return `${countries[0]}, +${countries.length - 1} negara`;
}

function buildPartyTooltipContent(
  title: string,
  countries: string[] = [],
  groups: string[] = []
) {
  const entries = groups.length > 0 ? groups : countries;
  if (entries.length <= 2) return null;

  return (
    <div className="space-y-2">
      <div className="border-b border-slate-200 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </p>
      </div>
      <div className="max-h-44 space-y-1 overflow-y-auto pr-1 text-xs text-slate-600">
        {entries.map((entry) => (
          <div key={entry}>{entry}</div>
        ))}
      </div>
    </div>
  );
}

function tradeTypeLabel(value: string) {
  switch (value) {
    case "Export":
      return "Ekspor";
    case "Import":
      return "Impor";
    case "Total":
      return "Total Perdagangan";
    case "Neraca":
      return "Neraca Perdagangan";
    default:
      return value;
  }
}

function extractYears(entry?: TradeProductEntry | null) {
  if (!entry) return [];
  return Object.keys(entry)
    .filter((key) => /^\d{4}$/.test(key))
    .sort((left, right) => Number(left) - Number(right));
}

function TradeScrollableTable({
  mergedRows,
  yearsA,
  yearsB,
  yearsC,
  tradeTypeText,
  originCompactLabel,
  destinationCompactLabel,
  setExpanded,
  stickyTopClassName = "top-[72px]",
  rowNumberStart = 1
}: TradeScrollableTableProps) {
  const headerScrollRef = React.useRef<HTMLDivElement | null>(null);
  const bottomScrollRef = React.useRef<HTMLDivElement | null>(null);
  const syncingRef = React.useRef<"header" | "bottom" | null>(null);
  const tableWidth = React.useMemo(() => {
    const baseWidth = 56 + 88 + 520;
    const yearlyColumns = yearsA.length + yearsB.length + yearsC.length;
    return `${baseWidth + yearlyColumns * 180}px`;
  }, [yearsA.length, yearsB.length, yearsC.length]);

  React.useEffect(() => {
    const header = headerScrollRef.current;
    const bottom = bottomScrollRef.current;
    if (!header || !bottom) return;

    const handleHeaderScroll = () => {
      if (syncingRef.current === "bottom") return;
      syncingRef.current = "header";
      bottom.scrollLeft = header.scrollLeft;
      syncingRef.current = null;
    };

    const handleBottomScroll = () => {
      if (syncingRef.current === "header") return;
      syncingRef.current = "bottom";
      header.scrollLeft = bottom.scrollLeft;
      syncingRef.current = null;
    };

    header.addEventListener("scroll", handleHeaderScroll);
    bottom.addEventListener("scroll", handleBottomScroll);

    return () => {
      header.removeEventListener("scroll", handleHeaderScroll);
      bottom.removeEventListener("scroll", handleBottomScroll);
    };
  }, [mergedRows.length, yearsA.length, yearsB.length, yearsC.length]);

  return (
    <div className="space-y-0">
      <div className={`sticky z-20 ${stickyTopClassName}`}>
        <div className="border border-slate-300 border-b-0 bg-[#1d4ed8]">
          <div
            ref={headerScrollRef}
            className="overflow-x-scroll overflow-y-hidden pb-1 [scrollbar-color:#ffffff_#93c5fd] [scrollbar-width:auto] [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-white/80 [&::-webkit-scrollbar-thumb]:bg-white [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-blue-300/95"
          >
            <div style={{ width: tableWidth }}>
              <table
                className="border-separate border-spacing-0 text-sm text-white"
                style={{ width: tableWidth, minWidth: tableWidth }}
              >
                <TradeTableColGroup
                  yearsA={yearsA}
                  yearsB={yearsB}
                  yearsC={yearsC}
                />
                <thead className="bg-[#1d4ed8] text-white">
                  <tr>
                    <th
                      rowSpan={2}
                      className="sticky left-0 z-30 border-b border-r border-blue-400 bg-[#1d4ed8] px-3 py-2 text-center"
                    >
                      No
                    </th>
                    <th
                      rowSpan={2}
                      className="sticky left-14 z-30 border-b border-r border-blue-400 bg-[#1d4ed8] px-3 py-2 text-center"
                    >
                      HS Code
                    </th>
                    <th
                      rowSpan={2}
                      className="sticky left-36 z-30 border-b border-r border-blue-400 bg-[#1d4ed8] px-4 py-2 text-left"
                    >
                      Produk
                    </th>
                    {yearsA.length > 0 ? (
                      <th
                        colSpan={yearsA.length}
                        className="border-b border-r border-blue-400 bg-[#1d4ed8] px-4 py-2 text-center"
                      >
                        {tradeTypeText} {originCompactLabel} ke{" "}
                        {destinationCompactLabel}
                      </th>
                    ) : null}
                    {yearsB.length > 0 ? (
                      <th
                        colSpan={yearsB.length}
                        className="border-b border-r border-blue-400 bg-[#1d4ed8] px-4 py-2 text-center"
                      >
                        {tradeTypeText} {originCompactLabel} ke Dunia
                      </th>
                    ) : null}
                    {yearsC.length > 0 ? (
                      <th
                        colSpan={yearsC.length}
                        className="border-b border-blue-400 bg-[#1d4ed8] px-4 py-2 text-center"
                      >
                        {tradeTypeText} Dunia ke {destinationCompactLabel}
                      </th>
                    ) : null}
                  </tr>
                  <tr className="bg-blue-700 text-[12px]">
                    {yearsA.map((year) => (
                      <th
                        key={`sticky-A-${year}`}
                        className="border-r border-blue-400 bg-blue-700 px-4 py-2 text-center font-semibold"
                      >
                        {year}
                      </th>
                    ))}
                    {yearsB.map((year) => (
                      <th
                        key={`sticky-B-${year}`}
                        className="border-r border-blue-400 bg-blue-700 px-4 py-2 text-center font-semibold"
                      >
                        {year}
                      </th>
                    ))}
                    {yearsC.map((year, index) => (
                      <th
                        key={`sticky-C-${year}-${index}`}
                        className="border-r border-blue-400 bg-blue-700 px-4 py-2 text-center font-semibold last:border-r-0"
                      >
                        {year}
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={bottomScrollRef}
        className="overflow-x-auto mx-px border border-slate-300 bg-white shadow-xs"
      >
        <table
          className="border-separate border-spacing-0 text-sm text-slate-700"
          style={{ width: tableWidth, minWidth: tableWidth }}
        >
          <TradeTableColGroup yearsA={yearsA} yearsB={yearsB} yearsC={yearsC} />
          <thead className="sr-only">
            <tr>
              <th rowSpan={2}>No</th>
              <th rowSpan={2}>HS Code</th>
              <th rowSpan={2}>Produk</th>
              {yearsA.length > 0 ? (
                <th colSpan={yearsA.length}>
                  {tradeTypeText} {originCompactLabel} ke{" "}
                  {destinationCompactLabel}
                </th>
              ) : null}
              {yearsB.length > 0 ? (
                <th colSpan={yearsB.length}>
                  {tradeTypeText} {originCompactLabel} ke Dunia
                </th>
              ) : null}
              {yearsC.length > 0 ? (
                <th colSpan={yearsC.length}>
                  {tradeTypeText} Dunia ke {destinationCompactLabel}
                </th>
              ) : null}
            </tr>
            <tr>
              {yearsA.map((year) => (
                <th key={`body-A-${year}`}>{year}</th>
              ))}
              {yearsB.map((year) => (
                <th key={`body-B-${year}`}>{year}</th>
              ))}
              {yearsC.map((year, index) => (
                <th key={`body-C-${year}-${index}`}>{year}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mergedRows.map((row, index) => (
              <React.Fragment key={row.hscode}>
                <tr className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="sticky left-0 z-10 border-r border-t border-slate-300 bg-inherit px-3 py-2 text-center font-semibold">
                    {rowNumberStart + index}
                  </td>
                  <td className="sticky left-14 z-10 border-r border-t border-slate-300 bg-inherit px-3 py-2 text-center font-semibold">
                    {row.hscode}
                  </td>
                  <td className="sticky left-36 z-10 border-r border-t border-slate-300 bg-inherit px-4 py-2">
                    <div
                      className="line-clamp-3 wrap-break-word"
                      title={row.productLabel}
                    >
                      {row.productLabel}
                    </div>
                  </td>
                  {(
                    [
                      ["A", yearsA, row.A],
                      ["B", yearsB, row.B],
                      ["C", yearsC, row.C]
                    ] as const
                  ).flatMap(([segment, segmentYears, entry]) =>
                    segmentYears.map((year) => {
                      const valueForYear =
                        (entry?.[year] as
                          | { total?: string; per_negara?: TradeCellDetail[] }
                          | undefined) ?? {};
                      return (
                        <td
                          key={`${segment}-${row.hscode}-${year}`}
                          className="border-r border-t border-slate-300 px-4 py-2 text-right text-blue-700 last:border-r-0"
                        >
                          <button
                            type="button"
                            className="inline-flex items-center justify-end gap-1 font-medium hover:underline"
                            onClick={() =>
                              setExpanded({ hscode: row.hscode, year, segment })
                            }
                          >
                            <ChevronDownIcon className="h-4 w-4" />
                            <span>{String(valueForYear.total ?? "0")}</span>
                          </button>
                        </td>
                      );
                    })
                  )}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DataGeneratorTradeTableSection({
  data,
  loading,
  mode,
  page,
  perPage,
  onPageChange,
  onPerPageChange
}: DataGeneratorTradeTableSectionProps) {
  const [expanded, setExpanded] = React.useState<{
    hscode: string | null;
    year: string | null;
    segment: "A" | "B" | "C" | null;
  }>({
    hscode: null,
    year: null,
    segment: null
  });

  const meta = data?.meta ?? {};
  const root = data?.data ?? {};
  const years = React.useMemo(
    () => Array.from(new Set(meta.years ?? [])).filter(Boolean),
    [meta.years]
  );
  const tradeType = meta.tradeType ?? "-";
  const tradeTypeText = tradeTypeLabel(tradeType);
  const unitLabel = "Ribu US$";
  const originFullLabel = formatFullPartyLabel(
    meta.origins ?? [],
    meta.originGroups ?? []
  );
  const destinationFullLabel = formatFullPartyLabel(
    meta.destinations ?? [],
    meta.destinationGroups ?? []
  );
  const originCompactLabel = formatCompactPartyLabel(
    meta.origins ?? [],
    meta.originGroups ?? []
  );
  const destinationCompactLabel = formatCompactPartyLabel(
    meta.destinations ?? [],
    meta.destinationGroups ?? []
  );
  const originTooltipContent = React.useMemo(
    () =>
      buildPartyTooltipContent(
        "Asal",
        meta.origins ?? [],
        meta.originGroups ?? []
      ),
    [meta.originGroups, meta.origins]
  );
  const destinationTooltipContent = React.useMemo(
    () =>
      buildPartyTooltipContent(
        "Tujuan",
        meta.destinations ?? [],
        meta.destinationGroups ?? []
      ),
    [meta.destinationGroups, meta.destinations]
  );

  const segA = React.useMemo(
    () =>
      root.Total_asal_ke_tujuan?.per_product ??
      root.Export_asal_ke_tujuan?.per_product ??
      root.Import_asal_ke_tujuan?.per_product ??
      root.Neraca_asal_ke_tujuan?.per_product ??
      [],
    [
      root.Export_asal_ke_tujuan?.per_product,
      root.Import_asal_ke_tujuan?.per_product,
      root.Neraca_asal_ke_tujuan?.per_product,
      root.Total_asal_ke_tujuan?.per_product
    ]
  );
  const segB = React.useMemo(
    () =>
      root.Total_asal_ke_dunia?.per_product ??
      root.Export_asal_ke_dunia?.per_product ??
      root.Import_asal_ke_dunia?.per_product ??
      root.Neraca_asal_ke_dunia?.per_product ??
      [],
    [
      root.Export_asal_ke_dunia?.per_product,
      root.Import_asal_ke_dunia?.per_product,
      root.Neraca_asal_ke_dunia?.per_product,
      root.Total_asal_ke_dunia?.per_product
    ]
  );
  const segC = React.useMemo(
    () =>
      root.Total_dunia_ke_tujuan?.per_product ??
      root.Export_dunia_ke_tujuan?.per_product ??
      root.Import_dunia_ke_tujuan?.per_product ??
      root.Neraca_dunia_ke_tujuan?.per_product ??
      [],
    [
      root.Export_dunia_ke_tujuan?.per_product,
      root.Import_dunia_ke_tujuan?.per_product,
      root.Neraca_dunia_ke_tujuan?.per_product,
      root.Total_dunia_ke_tujuan?.per_product
    ]
  );

  const mergedRows = React.useMemo<MergedRow[]>(() => {
    const map = new Map<string, MergedRow>();
    const mergeSegment = (
      segment: "A" | "B" | "C",
      rows: TradeProductEntry[]
    ) => {
      rows.forEach((item) => {
        if (!map.has(item.hscode)) {
          map.set(item.hscode, {
            hscode: item.hscode,
            productLabel: item.product,
            A: null,
            B: null,
            C: null
          });
        }
        const current = map.get(item.hscode);
        if (!current) return;
        current[segment] = item;
      });
    };

    mergeSegment("A", segA);
    mergeSegment("B", segB);
    mergeSegment("C", segC);

    return Array.from(map.values());
  }, [segA, segB, segC]);

  const yearsA = React.useMemo(() => extractYears(segA[0]), [segA]);
  const yearsB = React.useMemo(() => extractYears(segB[0]), [segB]);
  const yearsC = React.useMemo(() => extractYears(segC[0]), [segC]);
  const latestYearA = yearsA[yearsA.length - 1] ?? null;
  const sortedMergedRows = React.useMemo(() => {
    if (!latestYearA) {
      return [...mergedRows].sort((left, right) =>
        left.hscode.localeCompare(right.hscode)
      );
    }

    return [...mergedRows].sort((left, right) => {
      const leftRaw =
        (left.A?.[latestYearA] as { total?: string } | undefined)?.total ?? "0";
      const rightRaw =
        (right.A?.[latestYearA] as { total?: string } | undefined)?.total ??
        "0";
      const leftValue = Number(
        String(leftRaw).replace(/\./g, "").replace(/,/g, ".")
      );
      const rightValue = Number(
        String(rightRaw).replace(/\./g, "").replace(/,/g, ".")
      );
      if (
        Number.isFinite(leftValue) &&
        Number.isFinite(rightValue) &&
        leftValue !== rightValue
      ) {
        return rightValue - leftValue;
      }
      return left.hscode.localeCompare(right.hscode);
    });
  }, [latestYearA, mergedRows]);

  const subtitleText = React.useMemo(() => {
    const source = meta.source ? ` | Sumber: ${meta.source}` : "";
    const yearLabel =
      years.length > 0
        ? `Tahun ${years[0]}-${years[years.length - 1]}`
        : "Tahun -";
    return `${yearLabel} | Unit: ${unitLabel} | Asal: ${originFullLabel} | Tujuan: ${destinationFullLabel}${source}`;
  }, [destinationFullLabel, meta.source, originFullLabel, unitLabel, years]);

  const subtitle = React.useMemo(() => {
    const yearLabel =
      years.length > 0
        ? `Tahun ${years[0]}-${years[years.length - 1]}`
        : "Tahun -";

    return (
      <>
        <span>{yearLabel}</span>
        <span> | Asal: </span>
        {originTooltipContent ? (
          <HoverInfoTooltip content={originTooltipContent} openOnClick>
            <span className="cursor-help underline decoration-dotted underline-offset-3">
              {originCompactLabel}
            </span>
          </HoverInfoTooltip>
        ) : (
          <span>{originCompactLabel}</span>
        )}
        <span> | Tujuan: </span>
        {destinationTooltipContent ? (
          <HoverInfoTooltip content={destinationTooltipContent} openOnClick>
            <span className="cursor-help underline decoration-dotted underline-offset-3">
              {destinationCompactLabel}
            </span>
          </HoverInfoTooltip>
        ) : (
          <span>{destinationCompactLabel}</span>
        )}
        <span>{` | Unit: ${unitLabel}`}</span>
        {meta.source ? <span>{` | Sumber: ${meta.source}`}</span> : null}
      </>
    );
  }, [
    destinationCompactLabel,
    destinationTooltipContent,
    meta.source,
    originCompactLabel,
    originTooltipContent,
    unitLabel,
    years
  ]);

  const handleDownload = React.useCallback(() => {
    const rows = sortedMergedRows.map((row) => {
      const output: Record<string, string | number> = {
        "HS Code": row.hscode,
        Produk: row.productLabel
      };

      yearsA.forEach((year) => {
        output[
          `${tradeTypeText} ${originFullLabel} ke ${destinationFullLabel} ${year} (${unitLabel})`
        ] = String(
          (row.A?.[year] as { total?: string } | undefined)?.total ?? "0"
        );
      });
      yearsB.forEach((year) => {
        output[
          `${tradeTypeText} ${originFullLabel} ke Dunia ${year} (${unitLabel})`
        ] = String(
          (row.B?.[year] as { total?: string } | undefined)?.total ?? "0"
        );
      });
      yearsC.forEach((year) => {
        output[
          `${tradeTypeText} Dunia ke ${destinationFullLabel} ${year} (${unitLabel})`
        ] = String(
          (row.C?.[year] as { total?: string } | undefined)?.total ?? "0"
        );
      });

      return output;
    });

    const columns = Object.keys(rows[0] ?? {}).map((key) => ({
      key,
      label: key,
      selector: (row: Record<string, string | number>) => row[key]
    }));

    downloadTableAsExcel({
      title: `Data ${tradeTypeText} Perdagangan`,
      subtitle: subtitleText,
      source: meta.source ?? "-",
      filename: `Data_Generator_Perdagangan_${tradeTypeText}_${originCompactLabel}_${destinationCompactLabel}`,
      columns,
      rows
    });
  }, [
    destinationCompactLabel,
    destinationFullLabel,
    meta.source,
    originCompactLabel,
    originFullLabel,
    sortedMergedRows,
    subtitleText,
    tradeTypeText,
    unitLabel,
    yearsA,
    yearsB,
    yearsC
  ]);

  const rowNumberStart = React.useMemo(() => {
    const currentPage = Number(page) || 1;
    const pageSize = Number(perPage) || mergedRows.length || 1;
    return (currentPage - 1) * pageSize + 1;
  }, [mergedRows.length, page, perPage]);
  const activeDetailRow = React.useMemo(
    () =>
      sortedMergedRows.find((row) => row.hscode === expanded.hscode) ?? null,
    [expanded.hscode, sortedMergedRows]
  );
  const activeDetailEntry = React.useMemo(() => {
    if (!activeDetailRow || !expanded.segment) return null;
    return expanded.segment === "A"
      ? activeDetailRow.A
      : expanded.segment === "B"
        ? activeDetailRow.B
        : activeDetailRow.C;
  }, [activeDetailRow, expanded.segment]);
  const activeDetailRows = React.useMemo(
    () =>
      (
        activeDetailEntry?.[expanded.year ?? ""] as
          | { per_negara?: TradeCellDetail[] }
          | undefined
      )?.per_negara ?? [],
    [activeDetailEntry, expanded.year]
  );
  const activeDetailTitle = React.useMemo(() => {
    if (!expanded.segment) return "";
    return `${tradeTypeText} ${
      expanded.segment === "A"
        ? `${originCompactLabel} ke ${destinationCompactLabel}`
        : expanded.segment === "B"
          ? `${originCompactLabel} ke Dunia`
          : `Dunia ke ${destinationCompactLabel}`
    }`;
  }, [
    destinationCompactLabel,
    expanded.segment,
    originCompactLabel,
    tradeTypeText
  ]);
  const handleCloseDetail = React.useCallback(() => {
    setExpanded({ hscode: null, year: null, segment: null });
  }, []);

  if (mode === "chart") {
    return (
      <EmptyStatePanel
        title="Tampilan visualisasi belum disambungkan"
        description="Filter trade sudah mendukung mode visualisasi, tetapi chart generator perdagangan belum dipasang pada iterasi ini."
      />
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-52 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 h-96 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!data || mergedRows.length === 0) {
    return (
      <EmptyStatePanel
        title="Data perdagangan belum tersedia"
        description="Atur filter perdagangan lalu tekan Tampilan Tabel untuk memuat data."
      />
    );
  }

  const totalPages = meta.pagination?.last_page ?? 1;
  const totalRows = meta.pagination?.total ?? mergedRows.length;

  return (
    <>
      <ExpandableCard
        title={`Data ${tradeTypeText} Perdagangan`}
        subtitle={subtitle}
        className="shadow-sm"
        modalSize="full"
        modalBodyClassName="bg-slate-50 p-0"
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-xs text-slate-500">Tampilkan</span>
              <DataLimitSelect
                value={perPage}
                onChange={onPerPageChange}
                options={["10", "20", "50", "100"]}
                itemLabel="baris"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg p-2 text-slate-600"
              onClick={handleDownload}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </div>
        }
        expandedContent={
          <div className="space-y-4">
            <TradeScrollableTable
              mergedRows={sortedMergedRows}
              yearsA={yearsA}
              yearsB={yearsB}
              yearsC={yearsC}
              tradeTypeText={tradeTypeText}
              originCompactLabel={originCompactLabel}
              destinationCompactLabel={destinationCompactLabel}
              expanded={expanded}
              setExpanded={setExpanded}
              originCompactOrFullLabel={originCompactLabel}
              destinationCompactOrFullLabel={destinationCompactLabel}
              stickyTopClassName="-top-px"
              rowNumberStart={rowNumberStart}
            />
            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <TradeScrollableTable
            mergedRows={sortedMergedRows}
            yearsA={yearsA}
            yearsB={yearsB}
            yearsC={yearsC}
            tradeTypeText={tradeTypeText}
            originCompactLabel={originCompactLabel}
            destinationCompactLabel={destinationCompactLabel}
            expanded={expanded}
            setExpanded={setExpanded}
            originCompactOrFullLabel={originCompactLabel}
            destinationCompactOrFullLabel={destinationCompactLabel}
            stickyTopClassName="top-[72px]"
            rowNumberStart={rowNumberStart}
          />
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Menampilkan halaman {page} dari {totalPages} • Total {totalRows}{" "}
              baris
            </p>
            <div className="flex items-center gap-2 md:hidden">
              <span className="text-xs text-slate-500">Tampilkan</span>
              <DataLimitSelect
                value={perPage}
                onChange={onPerPageChange}
                options={["10", "20", "50", "100"]}
                itemLabel="baris"
              />
            </div>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </ExpandableCard>
      <DataGeneratorTradeDetailModal
        open={Boolean(activeDetailRow && expanded.segment && expanded.year)}
        onClose={handleCloseDetail}
        title={activeDetailTitle}
        subtitle={
          activeDetailRow && expanded.year
            ? `Tahun ${expanded.year} | HS ${activeDetailRow.hscode} | ${activeDetailRow.productLabel}`
            : undefined
        }
        rows={activeDetailRows}
        showOrigin={expanded.segment !== "C"}
        showDestination={expanded.segment !== "B"}
        source={meta.source ?? "-"}
        exportFilename={
          activeDetailRow && expanded.year
            ? `Detail_${activeDetailTitle}_${expanded.year}_${activeDetailRow.hscode}`
            : "Detail_Data_Generator_Perdagangan"
        }
      />
    </>
  );
}
