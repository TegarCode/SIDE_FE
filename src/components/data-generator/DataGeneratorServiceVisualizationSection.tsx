import React from "react";
import {
  ArrowDownTrayIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { CountryGroupedBarChart } from "@/components/ui/charts/CountryGroupedBarChart";
import { EntityTreemapChart } from "@/components/ui/charts/EntityTreemapChart";
import { PairLineChart } from "@/components/ui/charts/PairLineChart";
import { PairStackedBarChart } from "@/components/ui/charts/PairStackedBarChart";

type PairCountryEntry = {
  asal?: string;
  tujuan?: string;
  total?: string;
};

type ServiceResponse = {
  data?: {
    asal_ke_tujuan?: Record<
      string,
      { total?: string; per_negara?: PairCountryEntry[] | string }
    >;
    asal_ke_dunia?: Record<
      string,
      { total?: string; per_negara?: PairCountryEntry[] | string }
    >;
    dunia_ke_tujuan?: Record<
      string,
      { total?: string; per_negara?: PairCountryEntry[] | string }
    >;
  };
  meta?: {
    years?: number[];
    sourceName?: string;
    origins?: string[];
    destinations?: string[];
    originGroups?: string[];
    destinationGroups?: string[];
    gender?: string;
    profesi?: string[];
  };
};

type Props = {
  data: ServiceResponse | null;
  loading: boolean;
};

type PairSeries = {
  key: string;
  fullLabel: string;
  shortLabel: string;
  values: number[];
};

type DestinationSeries = {
  key: string;
  label: string;
  values: number[];
};

const STACKED_COUNTRY_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#14b8a6",
  "#f97316",
  "#84cc16",
  "#ec4899"
];

function toEntryArray(value: unknown): PairCountryEntry[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value as PairCountryEntry];
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

function lightenHex(hex: string, amount = 0.28) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  const numeric = Number.parseInt(value, 16);
  const red = (numeric >> 16) & 255;
  const green = (numeric >> 8) & 255;
  const blue = numeric & 255;
  const next = (channel: number) =>
    Math.round(channel + (255 - channel) * amount);
  return `#${[next(red), next(green), next(blue)].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function formatCompact(items: string[] = []) {
  if (items.length === 0) return "-";
  if (items.length <= 2) return items.join(", ");
  return `${items[0]}, dan ${items.length - 2} lainnya`;
}

function resolveParty(items: string[] = [], groups: string[] = []) {
  return groups.length > 0 ? groups : items;
}

function formatYearRange(start: number | null, end: number | null) {
  if (end == null) return "-";
  if (start == null || start === end) return String(end);
  return `${start}-${end}`;
}

function genderLabel(value: string | undefined) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "l") return "Laki-laki";
  if (normalized === "p") return "Perempuan";
  return "Semua";
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
  if (summary.hidden.length === 0) return <>{summary.label}</>;
  return (
    <span className="inline-flex items-center gap-1">
      <span>{summary.label}</span>
      <HoverInfoTooltip
        openOnClick
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

function truncateLabel(value: string, max = 30) {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

function buildPairLabel(item: PairCountryEntry) {
  return `${item.asal ?? "-"} ke ${item.tujuan ?? "-"}`;
}

function VisualizationCard({
  title,
  subtitle,
  source,
  downloaderRef,
  children,
  expandedContent
}: {
  title: string;
  subtitle: React.ReactNode;
  source: string;
  downloaderRef: React.MutableRefObject<(() => void) | null>;
  children: React.ReactNode;
  expandedContent: React.ReactNode;
}) {
  return (
    <ExpandableCard
      title={title}
      subtitle={subtitle}
      className="shadow-sm"
      modalSize="full"
      actions={
        <Button
          type="button"
          variant="outline"
          className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          onClick={() => downloaderRef.current?.()}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </Button>
      }
      expandedContent={
        <div className="space-y-3">
          {expandedContent}
          <p className="text-right text-[11px] text-slate-500">
            Sumber: {source}
          </p>
        </div>
      }
    >
      <div className="space-y-3">
        {children}
        <p className="text-right text-[11px] text-slate-500">
          Sumber: {source}
        </p>
      </div>
    </ExpandableCard>
  );
}

export function DataGeneratorServiceVisualizationSection({
  data,
  loading
}: Props) {
  const meta = data?.meta ?? {};
  const years = React.useMemo(
    () =>
      [...(meta.years ?? [])]
        .map(Number)
        .filter(Number.isFinite)
        .sort((a, b) => a - b),
    [meta.years]
  );
  const source = meta.sourceName ?? "-";
  const genderText = genderLabel(meta.gender);
  const professionValues = meta.profesi ?? ["Semua Profesi"];
  const professionText = professionValues.join(", ");
  const originItems = React.useMemo(
    () => resolveParty(meta.origins ?? [], meta.originGroups ?? []),
    [meta.originGroups, meta.origins]
  );
  const destinationItems = React.useMemo(
    () => resolveParty(meta.destinations ?? [], meta.destinationGroups ?? []),
    [meta.destinationGroups, meta.destinations]
  );

  const topPairs = React.useMemo(() => {
    const latestYear = years[years.length - 1];
    const pairMap = new Map<string, PairSeries>();
    years.forEach((year, yearIndex) => {
      toEntryArray(
        data?.data?.asal_ke_tujuan?.[String(year)]?.per_negara
      ).forEach((item) => {
        const key = buildPairLabel(item);
        const current = pairMap.get(key) ?? {
          key,
          fullLabel: key,
          shortLabel: truncateLabel(key),
          values: Array.from({ length: years.length }, () => 0)
        };
        current.values[yearIndex] += asNumber(item.total);
        pairMap.set(key, current);
      });
    });
    return [...pairMap.values()]
      .sort((left, right) => {
        const leftLatest =
          latestYear != null
            ? (left.values[years.indexOf(latestYear)] ?? 0)
            : 0;
        const rightLatest =
          latestYear != null
            ? (right.values[years.indexOf(latestYear)] ?? 0)
            : 0;
        return rightLatest - leftLatest;
      })
      .slice(0, 5);
  }, [data?.data?.asal_ke_tujuan, years]);

  const topDestinations = React.useMemo(() => {
    const latestYear = years[years.length - 1];
    const destinationMap = new Map<string, DestinationSeries>();
    years.forEach((year, yearIndex) => {
      toEntryArray(
        data?.data?.asal_ke_tujuan?.[String(year)]?.per_negara
      ).forEach((item) => {
        const key = item.tujuan ?? "-";
        const current = destinationMap.get(key) ?? {
          key,
          label: truncateLabel(key),
          values: Array.from({ length: years.length }, () => 0)
        };
        current.values[yearIndex] += asNumber(item.total);
        destinationMap.set(key, current);
      });
    });
    return [...destinationMap.values()]
      .sort((left, right) => {
        const leftLatest =
          latestYear != null
            ? (left.values[years.indexOf(latestYear)] ?? 0)
            : 0;
        const rightLatest =
          latestYear != null
            ? (right.values[years.indexOf(latestYear)] ?? 0)
            : 0;
        return rightLatest - leftLatest;
      })
      .slice(0, 5);
  }, [data?.data?.asal_ke_tujuan, years]);

  const latestAvailableTreemapYear = React.useMemo(() => {
    const availableYears = [...years].sort((a, b) => b - a);
    return (
      availableYears.find((year) => {
        const bucket = data?.data?.asal_ke_tujuan?.[String(year)];
        const total = asNumber(bucket?.total);
        const entries = toEntryArray(bucket?.per_negara);
        return total > 0 || entries.some((item) => asNumber(item.total) > 0);
      }) ?? null
    );
  }, [data?.data?.asal_ke_tujuan, years]);

  const previousAvailableTreemapYear = React.useMemo(() => {
    if (latestAvailableTreemapYear == null) return null;
    const availableYears = [...years]
      .filter((year) => year < latestAvailableTreemapYear)
      .sort((a, b) => b - a);
    return (
      availableYears.find((year) => {
        const bucket = data?.data?.asal_ke_tujuan?.[String(year)];
        const total = asNumber(bucket?.total);
        const entries = toEntryArray(bucket?.per_negara);
        return total > 0 || entries.some((item) => asNumber(item.total) > 0);
      }) ?? null
    );
  }, [data?.data?.asal_ke_tujuan, latestAvailableTreemapYear, years]);

  const latestYear = years.length > 0 ? years[years.length - 1] : null;
  const treemapTotalLatest = React.useMemo(
    () =>
      latestAvailableTreemapYear != null
        ? asNumber(
            data?.data?.asal_ke_tujuan?.[String(latestAvailableTreemapYear)]
              ?.total
          )
        : 0,
    [data?.data?.asal_ke_tujuan, latestAvailableTreemapYear]
  );

  const subtitle = (
    <>
      {`Tahun ${years[0] ?? "-"}-${latestYear ?? "-"} | Gender: ${genderText} | Profesi: ${professionText} | Asal: `}
      <PartySummary label="Asal" items={originItems} />
      {" | Tujuan: "}
      <PartySummary label="Tujuan" items={destinationItems} />
    </>
  );
  const treemapSubtitle = (
    <>
      {`Tahun ${formatYearRange(previousAvailableTreemapYear, latestAvailableTreemapYear)} | Gender: ${genderText} | Profesi: ${professionText} | Asal: `}
      <PartySummary label="Asal" items={originItems} />
      {" | Tujuan: "}
      <PartySummary label="Tujuan" items={destinationItems} />
    </>
  );

  const exportSubtitle = `Tahun ${years[0] ?? "-"}-${latestYear ?? "-"} | Gender: ${genderText} | Profesi: ${professionText} | Asal: ${originItems.length ? originItems.join(", ") : "-"} | Tujuan: ${destinationItems.length ? destinationItems.join(", ") : "-"}`;
  const exportTreemapSubtitle = `Tahun ${formatYearRange(previousAvailableTreemapYear, latestAvailableTreemapYear)} | Gender: ${genderText} | Profesi: ${professionText} | Asal: ${originItems.length ? originItems.join(", ") : "-"} | Tujuan: ${destinationItems.length ? destinationItems.join(", ") : "-"}`;
  const barChartTitle = "Bar Chart Top 5 Negara Tujuan Jasa";
  const lineChartTitle = "Line Chart Tren Top 5 Pasangan Negara/Entitas Jasa";
  const stackedChartTitle =
    "Stacked Bar Chart Perbandingan Jasa dari Negara Asal ke Tujuan dan ke Dunia";
  const treemapChartTitle = "Treemap Pangsa Top 5 Negara Asal Jasa";

  const barDownloadRef = React.useRef<(() => void) | null>(null);
  const lineDownloadRef = React.useRef<(() => void) | null>(null);
  const stackedDownloadRef = React.useRef<(() => void) | null>(null);
  const treemapDownloadRef = React.useRef<(() => void) | null>(null);

  const barSeries = React.useMemo(
    () =>
      topDestinations.map((item) => ({
        label: item.label,
        values: item.values
      })),
    [topDestinations]
  );
  const lineSeries = React.useMemo(
    () =>
      topPairs.map((item) => ({
        label: item.shortLabel,
        fullLabel: item.fullLabel,
        values: item.values
      })),
    [topPairs]
  );

  const stackedSeries = React.useMemo(() => {
    if (!years.length)
      return {
        categories: [] as string[],
        tooltipCategories: [] as string[],
        series: [] as Array<{
          label: string;
          fullLabel: string;
          values: number[];
        }>
      };
    const categoryRows = years.flatMap((year) => {
      const tujuanMap = new Map<string, number>();
      const duniaMap = new Map<string, number>();
      toEntryArray(
        data?.data?.asal_ke_tujuan?.[String(year)]?.per_negara
      ).forEach((item) => {
        const origin = item.asal ?? "-";
        tujuanMap.set(
          origin,
          (tujuanMap.get(origin) ?? 0) + asNumber(item.total)
        );
      });
      toEntryArray(
        data?.data?.asal_ke_dunia?.[String(year)]?.per_negara
      ).forEach((item) => {
        const origin = item.asal ?? "-";
        duniaMap.set(
          origin,
          (duniaMap.get(origin) ?? 0) + asNumber(item.total)
        );
      });
      return [...tujuanMap.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 3)
        .map(([origin, tujuanValue]) => ({
          category: `${year}\n${origin}`,
          tooltipCategory: `${origin} | ${year}`,
          tujuanValue,
          duniaValue: duniaMap.get(origin) ?? 0
        }));
    });
    return {
      categories: categoryRows.map((item) => item.category),
      tooltipCategories: categoryRows.map((item) => item.tooltipCategory),
      series: [
        {
          label: "Asal ke Tujuan",
          fullLabel: `${formatCompact(originItems)} ke ${formatCompact(destinationItems)}`,
          values: categoryRows.map((item) => item.tujuanValue)
        },
        {
          label: "Asal ke Dunia",
          fullLabel: `${formatCompact(originItems)} ke Dunia`,
          values: categoryRows.map((item) => item.duniaValue)
        }
      ]
    };
  }, [
    data?.data?.asal_ke_dunia,
    data?.data?.asal_ke_tujuan,
    destinationItems,
    originItems,
    years
  ]);

  const stackedCountryLabels = React.useMemo(
    () =>
      stackedSeries.tooltipCategories.map(
        (item) => item.split(" | ")[0] ?? item
      ),
    [stackedSeries.tooltipCategories]
  );
  const stackedColorMap = React.useMemo(
    () =>
      new Map(
        Array.from(new Set(stackedCountryLabels)).map((origin, index) => [
          origin,
          STACKED_COUNTRY_COLORS[index % STACKED_COUNTRY_COLORS.length]
        ])
      ),
    [stackedCountryLabels]
  );
  const stackedLegendItems = React.useMemo(
    () =>
      Array.from(stackedColorMap.entries()).map(([label, color]) => ({
        label,
        color
      })),
    [stackedColorMap]
  );
  const stackedItemColorFormatter = React.useCallback(
    ({ seriesName, dataIndex }: { seriesName: string; dataIndex: number }) => {
      const origin = stackedCountryLabels[dataIndex] ?? "";
      const baseColor =
        stackedColorMap.get(origin) ?? STACKED_COUNTRY_COLORS[0];
      return seriesName === "Asal ke Dunia"
        ? lightenHex(baseColor, 0.35)
        : baseColor;
    },
    [stackedColorMap, stackedCountryLabels]
  );
  const stackedPreviousValueResolver = React.useCallback(
    ({
      seriesName,
      currentLabel
    }: {
      seriesName: string;
      currentLabel: string;
    }) => {
      const [originRaw, yearRaw] = currentLabel.split(" | ");
      const origin = originRaw?.trim() ?? "";
      const year = Number(yearRaw);
      if (!origin || !Number.isFinite(year)) return null;
      const currentYearIndex = years.indexOf(year);
      if (currentYearIndex <= 0) return null;
      const previousYear = years[currentYearIndex - 1];
      if (seriesName === "Asal ke Dunia") {
        const previousEntries = toEntryArray(
          data?.data?.asal_ke_dunia?.[String(previousYear)]?.per_negara
        );
        const match = previousEntries.find(
          (item) => (item.asal ?? "-") === origin
        );
        return {
          label: String(previousYear),
          value: match ? asNumber(match.total) : 0
        };
      }
      const previousEntries = toEntryArray(
        data?.data?.asal_ke_tujuan?.[String(previousYear)]?.per_negara
      );
      const total = previousEntries
        .filter((item) => (item.asal ?? "-") === origin)
        .reduce((sum, item) => sum + asNumber(item.total), 0);
      return { label: String(previousYear), value: total };
    },
    [data?.data?.asal_ke_dunia, data?.data?.asal_ke_tujuan, years]
  );

  const treemapRows = React.useMemo(() => {
    if (latestAvailableTreemapYear == null) return [];
    const latestEntries = toEntryArray(
      data?.data?.asal_ke_tujuan?.[String(latestAvailableTreemapYear)]
        ?.per_negara
    );
    const previousEntries =
      previousAvailableTreemapYear != null
        ? toEntryArray(
            data?.data?.asal_ke_tujuan?.[String(previousAvailableTreemapYear)]
              ?.per_negara
          )
        : [];
    const aggregateByOrigin = (entries: PairCountryEntry[]) => {
      const totals = new Map<string, number>();
      entries.forEach((item) => {
        const origin = item.asal ?? "-";
        totals.set(origin, (totals.get(origin) ?? 0) + asNumber(item.total));
      });
      return totals;
    };
    const latestMap = aggregateByOrigin(latestEntries);
    const previousMap = aggregateByOrigin(previousEntries);
    return [...latestMap.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([origin, currentValue], index) => ({
        code: String(index + 1),
        label: origin,
        valueOd: currentValue,
        valuePrev: previousMap.get(origin) ?? 0,
        valueReverse: 0,
        shareValue:
          treemapTotalLatest > 0 ? (currentValue / treemapTotalLatest) * 100 : 0
      }));
  }, [
    data?.data?.asal_ke_tujuan,
    latestAvailableTreemapYear,
    previousAvailableTreemapYear,
    treemapTotalLatest
  ]);

  if (loading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="h-5 w-56 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-100" />
            <div className="mt-5 h-80 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || years.length === 0 || topPairs.length === 0) {
    return (
      <EmptyStatePanel
        title="Visualisasi jasa belum tersedia"
        description="Atur filter jasa lalu pilih Tampilan Visualisasi untuk memuat chart."
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <VisualizationCard
        title={barChartTitle}
        subtitle={subtitle}
        source={source}
        downloaderRef={barDownloadRef}
        expandedContent={
          <CountryGroupedBarChart
            years={years}
            series={barSeries}
            height={560}
            unit="Orang"
            filename="data_generator_service_bar_pairs"
            exportTitle={barChartTitle}
            exportSubtitle={exportSubtitle}
            exportFooter={`Sumber: ${source}`}
          />
        }
      >
        <CountryGroupedBarChart
          years={years}
          series={barSeries}
          height={360}
          unit="Orang"
          filename="data_generator_service_bar_pairs"
          onRegisterDownload={(handler) => {
            barDownloadRef.current = handler;
          }}
          exportTitle={barChartTitle}
          exportSubtitle={exportSubtitle}
          exportFooter={`Sumber: ${source}`}
        />
      </VisualizationCard>
      <VisualizationCard
        title={lineChartTitle}
        subtitle={subtitle}
        source={source}
        downloaderRef={lineDownloadRef}
        expandedContent={
          <PairLineChart
            years={years}
            series={lineSeries}
            height={560}
            unit="Orang"
            filename="data_generator_service_line_pairs"
            exportTitle={lineChartTitle}
            exportSubtitle={exportSubtitle}
            exportFooter={`Sumber: ${source}`}
          />
        }
      >
        <PairLineChart
          years={years}
          series={lineSeries}
          height={360}
          unit="Orang"
          filename="data_generator_service_line_pairs"
          onRegisterDownload={(handler) => {
            lineDownloadRef.current = handler;
          }}
          exportTitle={lineChartTitle}
          exportSubtitle={exportSubtitle}
          exportFooter={`Sumber: ${source}`}
        />
      </VisualizationCard>
      <VisualizationCard
        title={stackedChartTitle}
        subtitle={subtitle}
        source={source}
        downloaderRef={stackedDownloadRef}
        expandedContent={
          <PairStackedBarChart
            years={years}
            categories={stackedSeries.categories}
            tooltipCategories={stackedSeries.tooltipCategories}
            customLegendItems={stackedLegendItems}
            previousValueResolver={stackedPreviousValueResolver}
            itemColorFormatter={stackedItemColorFormatter}
            tooltipTitleFormatter={({ seriesName, currentLabel }) => {
              const origin = currentLabel.split(" | ")[0] ?? currentLabel;
              return seriesName === "Asal ke Dunia"
                ? `${origin} ke Dunia`
                : `${origin} ke ${formatCompact(destinationItems)}`;
            }}
            series={stackedSeries.series}
            height={560}
            unit="Orang"
            filename="data_generator_service_stacked_pairs"
            exportTitle={stackedChartTitle}
            exportSubtitle={exportSubtitle}
            exportFooter={`Sumber: ${source}`}
          />
        }
      >
        <PairStackedBarChart
          years={years}
          categories={stackedSeries.categories}
          tooltipCategories={stackedSeries.tooltipCategories}
          customLegendItems={stackedLegendItems}
          previousValueResolver={stackedPreviousValueResolver}
          itemColorFormatter={stackedItemColorFormatter}
          tooltipTitleFormatter={({ seriesName, currentLabel }) => {
            const origin = currentLabel.split(" | ")[0] ?? currentLabel;
            return seriesName === "Asal ke Dunia"
              ? `${origin} ke Dunia`
              : `${origin} ke ${formatCompact(destinationItems)}`;
          }}
          series={stackedSeries.series}
          height={360}
          unit="Orang"
          filename="data_generator_service_stacked_pairs"
          onRegisterDownload={(handler) => {
            stackedDownloadRef.current = handler;
          }}
          exportTitle={stackedChartTitle}
          exportSubtitle={exportSubtitle}
          exportFooter={`Sumber: ${source}`}
        />
      </VisualizationCard>
      <VisualizationCard
        title={treemapChartTitle}
        subtitle={treemapSubtitle}
        source={source}
        downloaderRef={treemapDownloadRef}
        expandedContent={
          <EntityTreemapChart
            rows={treemapRows.map((row) => ({
              name: row.label,
              value: Number(row.valueOd ?? 0),
              previousValue: row.valuePrev ?? null,
              share: row.shareValue ?? null
            }))}
            year={latestAvailableTreemapYear}
            previousYear={previousAvailableTreemapYear}
            unitLabel="Orang"
            height={560}
            filename="data_generator_service_treemap_pairs"
            exportTitle={treemapChartTitle}
            exportSubtitle={exportTreemapSubtitle}
            exportFooter={`Sumber: ${source}`}
          />
        }
      >
        <EntityTreemapChart
          rows={treemapRows.map((row) => ({
            name: row.label,
            value: Number(row.valueOd ?? 0),
            previousValue: row.valuePrev ?? null,
            share: row.shareValue ?? null
          }))}
          year={latestAvailableTreemapYear}
          previousYear={previousAvailableTreemapYear}
          unitLabel="Orang"
          height={400}
          filename="data_generator_service_treemap_pairs"
          onRegisterDownload={(handler) => {
            treemapDownloadRef.current = handler;
          }}
          exportTitle={treemapChartTitle}
          exportSubtitle={exportTreemapSubtitle}
          exportFooter={`Sumber: ${source}`}
        />
      </VisualizationCard>
    </div>
  );
}
