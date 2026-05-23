import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { CountryGroupedBarChart } from "@/components/ui/charts/CountryGroupedBarChart";
import { HsLineChart } from "@/components/ui/charts/HsLineChart";
import { HsStackedBarChart } from "@/components/ui/charts/HsStackedBarChart";
import { TradeProductsTreemapChart } from "@/components/ui/charts/TradeProductsTreemapChart";

type TradePerCountry = {
  asal?: string;
  tujuan?: string;
  total?: string;
};

type TradeProductEntry = {
  hscode: string;
  product: string;
  total?: string;
  [year: string]: unknown;
};

type TradeSection = {
  products?: TradeProductEntry[];
  total_all_hs?: TradeProductEntry[];
};

type VisualizationResponse = {
  data?: Record<string, TradeSection | undefined>;
  meta?: {
    years?: number[];
    origins?: string[];
    destinations?: string[];
    tradeType?: string;
    source?: string;
  };
};

type Props = {
  data: VisualizationResponse | null;
  loading: boolean;
  yearFrom?: string | null;
  yearTo?: string | null;
};

function asNumber(value: unknown) {
  const normalized = String(value ?? "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function tradeTypeLabel(value: string) {
  switch (value) {
    case "Export":
      return "Ekspor";
    case "Import":
      return "Impor";
    case "Neraca":
      return "Neraca Perdagangan";
    case "Total":
      return "Total Perdagangan";
    default:
      return value;
  }
}

function buildSectionKey(tradeType: string) {
  return `${tradeType || "Total"}_asal_ke_tujuan`;
}

function truncateLabel(code: string, product: string, max = 26) {
  const trimmed =
    product.length > max ? `${product.slice(0, max - 3)}...` : product;
  return `${code} | ${trimmed}`;
}

function buildYearRange(startRaw?: string | null, endRaw?: string | null) {
  const start = Number(startRaw);
  const end = Number(endRaw);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}

function summarizeParty(items: string[] = []) {
  if (items.length === 0) return { label: "-", hidden: [] as string[] };
  if (items.length <= 2)
    return { label: items.join(", "), hidden: [] as string[] };
  return {
    label: `${items.slice(0, 2).join(", ")}, dan ${items.length - 2} lainnya`,
    hidden: items
  };
}

function PartySummary({ label, items }: { label: string; items: string[] }) {
  const summary = summarizeParty(items);

  if (summary.hidden.length === 0) {
    return <>{summary.label}</>;
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span>{summary.label}</span>
      <HoverInfoTooltip
        openOnClick={true}
        content={
          <div className="space-y-2">
            <p className="border-b border-slate-200 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {label}
            </p>
            <div className="max-h-44 space-y-1 overflow-y-auto pr-1 text-xs text-slate-600">
              {summary.hidden.map((item) => (
                <div key={`${label}-${item}`}>{item}</div>
              ))}
            </div>
          </div>
        }
      >
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-slate-600">
          <InformationCircleIcon className="h-4 w-4" />
        </span>
      </HoverInfoTooltip>
    </span>
  );
}

export function DataGeneratorTradeVisualizationSection({
  data,
  loading,
  yearFrom,
  yearTo
}: Props) {
  const downloadersRef = React.useRef<Record<string, (() => void) | null>>({});
  const registerBarDownload = React.useCallback(
    (handler: (() => void) | null) => {
      downloadersRef.current.bar = handler;
    },
    []
  );
  const registerLineDownload = React.useCallback(
    (handler: (() => void) | null) => {
      downloadersRef.current.line = handler;
    },
    []
  );
  const registerStackedDownload = React.useCallback(
    (handler: (() => void) | null) => {
      downloadersRef.current.stacked = handler;
    },
    []
  );
  const registerTreemapDownload = React.useCallback(
    (handler: (() => void) | null) => {
      downloadersRef.current.treemap = handler;
    },
    []
  );
  const meta = data?.meta ?? {};
  const years = React.useMemo(() => {
    const requestedYears = buildYearRange(yearFrom, yearTo);
    if (requestedYears.length > 0) return requestedYears;
    return [...(meta.years ?? [])]
      .map(Number)
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
  }, [meta.years, yearFrom, yearTo]);

  const latestYear = years.length > 0 ? years[years.length - 1] : null;
  const prevYear = years.length > 1 ? years[years.length - 2] : latestYear;
  const tradeTypeText = tradeTypeLabel(meta.tradeType ?? "Total");
  const source = meta.source ?? "-";
  const originItems = meta.origins ?? [];
  const destinationItems = meta.destinations ?? [];
  const sectionKey = buildSectionKey(meta.tradeType ?? "Total");
  const section = (data?.data?.[sectionKey] as TradeSection | undefined) ?? {};
  const entries = React.useMemo(
    () => section.products ?? [],
    [section.products]
  );
  const totalAllHsEntry = React.useMemo(
    () => (section.total_all_hs ?? [])[0] ?? null,
    [section.total_all_hs]
  );

  const topProducts = React.useMemo(
    () =>
      [...entries]
        .sort((left, right) => {
          const rightValue =
            latestYear != null
              ? asNumber(
                  (right[String(latestYear)] as { total?: string } | undefined)
                    ?.total
                )
              : 0;
          const leftValue =
            latestYear != null
              ? asNumber(
                  (left[String(latestYear)] as { total?: string } | undefined)
                    ?.total
                )
              : 0;
          return rightValue - leftValue;
        })
        .slice(0, 5),
    [entries, latestYear]
  );

  const countrySeries = React.useMemo(() => {
    const totalsByCountry = new Map<string, number[]>();

    years.forEach((year, yearIndex) => {
      const perCountry =
        (
          totalAllHsEntry?.[String(year)] as
            | { per_negara?: TradePerCountry[] }
            | undefined
        )?.per_negara ?? [];
      perCountry.forEach((item) => {
        const label = item.tujuan ?? item.asal ?? "-";
        const values =
          totalsByCountry.get(label) ??
          Array.from({ length: years.length }, () => 0);
        values[yearIndex] += asNumber(item.total);
        totalsByCountry.set(label, values);
      });
    });

    return [...totalsByCountry.entries()]
      .map(([label, values]) => ({ label, values }))
      .sort(
        (left, right) =>
          (right.values[right.values.length - 1] ?? 0) -
          (left.values[left.values.length - 1] ?? 0)
      )
      .slice(0, 8);
  }, [totalAllHsEntry, years]);

  const lineSeries = React.useMemo(
    () =>
      topProducts.map((item) => ({
        code: item.hscode,
        shortLabel: truncateLabel(item.hscode, item.product),
        fullLabel: item.product,
        values: years.map((year) =>
          asNumber(
            (item[String(year)] as { total?: string } | undefined)?.total
          )
        )
      })),
    [topProducts, years]
  );

  const stackedSeries = React.useMemo(
    () =>
      topProducts.map((item) => ({
        code: item.hscode,
        shortLabel: truncateLabel(item.hscode, item.product),
        fullLabel: item.product,
        values: years.map((year) =>
          asNumber(
            (item[String(year)] as { total?: string } | undefined)?.total
          )
        )
      })),
    [topProducts, years]
  );

  const rawTreemapRows = React.useMemo(
    () =>
      topProducts.map((item) => ({
        code: item.hscode,
        label: item.product,
        valueOd:
          latestYear != null
            ? asNumber(
                (item[String(latestYear)] as { total?: string } | undefined)
                  ?.total
              )
            : 0,
        valuePrev:
          prevYear != null
            ? asNumber(
                (item[String(prevYear)] as { total?: string } | undefined)
                  ?.total
              )
            : 0,
        valueReverse: 0,
        shareValue: 0
      })),
    [latestYear, prevYear, topProducts]
  );

  const totalAllHsLatestValue = React.useMemo(
    () =>
      latestYear != null
        ? asNumber(
            (
              totalAllHsEntry?.[String(latestYear)] as
                | { total?: string }
                | undefined
            )?.total
          )
        : 0,
    [latestYear, totalAllHsEntry]
  );
  const treemapRows = React.useMemo(
    () =>
      rawTreemapRows.map((item) => ({
        ...item,
        shareValue:
          totalAllHsLatestValue > 0
            ? (Number(item.valueOd ?? 0) / totalAllHsLatestValue) * 100
            : 0
      })),
    [rawTreemapRows, totalAllHsLatestValue]
  );

  const subtitleBase = (
    <>
      {`Tahun ${years[0] ?? "-"}-${latestYear ?? "-"} | Unit: Ribu US$ | Asal: `}
      <PartySummary label="Asal" items={originItems} />
      {" | Tujuan: "}
      <PartySummary label="Tujuan" items={destinationItems} />
    </>
  );
  const treemapSubtitle = (
    <>
      {`Tahun ${prevYear ?? "-"}-${latestYear ?? "-"} | Unit: Ribu US$ | Asal: `}
      <PartySummary label="Asal" items={originItems} />
      {" | Tujuan: "}
      <PartySummary label="Tujuan" items={destinationItems} />
    </>
  );
  const exportSubtitleBase = `Tahun ${years[0] ?? "-"}-${latestYear ?? "-"} | Unit: Ribu US$ | Asal: ${
    originItems.length ? originItems.join(", ") : "-"
  } | Tujuan: ${destinationItems.length ? destinationItems.join(", ") : "-"}`;
  const exportTreemapSubtitle = `Tahun ${prevYear ?? "-"}-${latestYear ?? "-"} | Unit: Ribu US$ | Asal: ${
    originItems.length ? originItems.join(", ") : "-"
  } | Tujuan: ${destinationItems.length ? destinationItems.join(", ") : "-"}`;
  if (loading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="h-5 w-56 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-100" />
            <div className="mt-5 h-80 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || entries.length === 0) {
    return (
      <EmptyStatePanel
        title="Visualisasi perdagangan belum tersedia"
        description="Atur filter perdagangan lalu pilih Tampilan Visualisasi untuk memuat chart."
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ExpandableCard
        title={`Bar Chart ${tradeTypeText} per Negara/Entitas`}
        subtitle={subtitleBase}
        className="shadow-sm"
        modalSize="full"
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            onClick={() => downloadersRef.current.bar?.()}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </Button>
        }
        expandedContent={
          <div className="space-y-3">
            <CountryGroupedBarChart
              years={years}
              series={countrySeries}
              height={560}
              unit="Ribu US$"
              filename="data_generator_trade_bar_country"
              exportTitle={`Bar Chart ${tradeTypeText} per Negara/Entitas`}
              exportSubtitle={exportSubtitleBase}
              exportFooter={source}
            />
            <p className="mt-auto text-right text-[11px] text-slate-500">
              Sumber: {source}
            </p>
          </div>
        }
      >
        <div className="space-y-3">
          <CountryGroupedBarChart
            years={years}
            series={countrySeries}
            height={360}
            unit="Ribu US$"
            filename="data_generator_trade_bar_country"
            onRegisterDownload={registerBarDownload}
            exportTitle={`Bar Chart ${tradeTypeText} per Negara/Entitas`}
            exportSubtitle={exportSubtitleBase}
            exportFooter={source}
          />
          <p className="mt-auto text-right text-[11px] text-slate-500">
            Sumber: {source}
          </p>
        </div>
      </ExpandableCard>

      <ExpandableCard
        title={`Line Chart ${tradeTypeText} Top 5 HS Code`}
        subtitle={subtitleBase}
        className="shadow-sm"
        modalSize="full"
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            onClick={() => downloadersRef.current.line?.()}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </Button>
        }
        expandedContent={
          <div className="space-y-3">
            <HsLineChart
              years={years}
              series={lineSeries}
              unit="Ribu US$"
              height={560}
              filename="data_generator_trade_line_hs"
              exportTitle={`Line Chart ${tradeTypeText} Top 5 HS Code`}
              exportSubtitle={exportSubtitleBase}
              exportFooter={source}
            />
            <p className="mt-auto text-right text-[11px] text-slate-500">
              Sumber: {source}
            </p>
          </div>
        }
      >
        <div className="space-y-3">
          <HsLineChart
            years={years}
            series={lineSeries}
            unit="Ribu US$"
            height={360}
            filename="data_generator_trade_line_hs"
            onRegisterDownload={registerLineDownload}
            exportTitle={`Line Chart ${tradeTypeText} Top 5 HS Code`}
            exportSubtitle={exportSubtitleBase}
            exportFooter={source}
          />
          <p className="mt-auto text-right text-[11px] text-slate-500">
            Sumber: {source}
          </p>
        </div>
      </ExpandableCard>

      <ExpandableCard
        title={`Stacked Chart ${tradeTypeText} Top 5 HS Code`}
        subtitle={subtitleBase}
        className="shadow-sm"
        modalSize="full"
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            onClick={() => downloadersRef.current.stacked?.()}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </Button>
        }
        expandedContent={
          <div className="space-y-3">
            <HsStackedBarChart
              years={years}
              series={stackedSeries}
              height={560}
              unit="Ribu US$"
              filename="data_generator_trade_stacked_hs"
              exportTitle={`Stacked Chart ${tradeTypeText} Top 5 HS Code`}
              exportSubtitle={exportSubtitleBase}
              exportFooter={source}
            />
            <p className="mt-auto text-right text-[11px] text-slate-500">
              Sumber: {source}
            </p>
          </div>
        }
      >
        <div className="space-y-3">
          <HsStackedBarChart
            years={years}
            series={stackedSeries}
            height={360}
            unit="Ribu US$"
            filename="data_generator_trade_stacked_hs"
            onRegisterDownload={registerStackedDownload}
            exportTitle={`Stacked Chart ${tradeTypeText} Top 5 HS Code`}
            exportSubtitle={exportSubtitleBase}
            exportFooter={source}
          />
          <p className="mt-auto text-right text-[11px] text-slate-500">
            Sumber: {source}
          </p>
        </div>
      </ExpandableCard>

      <ExpandableCard
        title={`Treemap ${tradeTypeText} Top 5 HS Code`}
        subtitle={treemapSubtitle}
        className="shadow-sm"
        modalSize="full"
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            onClick={() => downloadersRef.current.treemap?.()}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </Button>
        }
        expandedContent={
          <div className="space-y-3">
            <TradeProductsTreemapChart
              rows={treemapRows}
              mode={meta.tradeType === "Import" ? "impor" : "ekspor"}
              year={latestYear}
              previousYear={prevYear}
              unitLabel="Ribu US$"
              height={560}
              filename="data_generator_trade_treemap_hs"
              exportTitle={`Treemap ${tradeTypeText} Top 5 HS Code`}
              exportSubtitle={exportTreemapSubtitle}
              exportFooter={source}
            />
            <p className="mt-auto text-right text-[11px] text-slate-500">
              Sumber: {source}
            </p>
          </div>
        }
      >
        <div className="space-y-3">
          <TradeProductsTreemapChart
            rows={treemapRows}
            mode={meta.tradeType === "Import" ? "impor" : "ekspor"}
            year={latestYear}
            previousYear={prevYear}
            unitLabel="Ribu US$"
            height={400}
            filename="data_generator_trade_treemap_hs"
            onRegisterDownload={registerTreemapDownload}
            exportTitle={`Treemap ${tradeTypeText} Top 5 HS Code`}
            exportSubtitle={exportTreemapSubtitle}
            exportFooter={source}
          />
          <p className="mt-auto text-right text-[11px] text-slate-500">
            Sumber: {source}
          </p>
        </div>
      </ExpandableCard>
    </div>
  );
}
