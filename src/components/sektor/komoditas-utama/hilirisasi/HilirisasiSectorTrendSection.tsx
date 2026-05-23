import React from "react";
import {
  ArrowDownTrayIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { HoverInfoTooltip } from "@/components/ui/HoverInfoTooltip";
import { TradeAnnualAreaChart } from "@/components/ui/charts/TradeAnnualAreaChart";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import type { HilirisasiTradeProductsResult } from "@/type/komoditasUtama";
import type { HilirisasiMetricMode } from "./HilirisasiTradeHeroSection";

type HilirisasiSectorTrendSectionProps = {
  data: HilirisasiTradeProductsResult | null | undefined;
  loading: boolean;
  metricMode: HilirisasiMetricMode;
};

type SectorTrendCardProps = {
  title: string;
  subtitle: string;
  sectorName: string;
  sourceName: string;
  unit: string;
  color: string;
  filename: string;
  hsItems: Array<{
    kodeHS: string;
    namaHS: string;
  }>;
  chartData: Array<{
    year: number;
    primary: number | null;
    secondary: number | null;
  }>;
  loading: boolean;
};

const SECTOR_COLORS = [
  "#2563eb",
  "#f97316",
  "#10b981",
  "#7c3aed",
  "#ef4444",
  "#0891b2"
];

function getMetricLabel(metricMode: HilirisasiMetricMode) {
  if (metricMode === "total_export") return "Total Ekspor";
  if (metricMode === "total_import") return "Total Impor";
  return "Total Perdagangan";
}

function getMetricKey(metricMode: HilirisasiMetricMode) {
  return metricMode === "total_export"
    ? "ekspor"
    : metricMode === "total_import"
      ? "impor"
      : "total";
}

function formatCountryList(names: string[]) {
  if (names.length === 0) return "-";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} +${names.length - 3} lainnya`;
}

function buildSectorSeries(
  data: HilirisasiTradeProductsResult | null | undefined,
  metricMode: HilirisasiMetricMode
) {
  const key = getMetricKey(metricMode);
  const groups = new Map<
    string,
    NonNullable<HilirisasiTradeProductsResult["products"]>
  >();

  for (const product of data?.products ?? []) {
    const sectorName = product.sektor?.trim() || "Lainnya";
    const bucket = groups.get(sectorName) ?? [];
    bucket.push(product);
    groups.set(sectorName, bucket);
  }

  return Array.from(groups.entries()).map(([sectorName, products]) => ({
    sectorName,
    hsItems: products.map((item) => ({
      kodeHS: item.kodeHS,
      namaHS: item.namaHS
    })),
    chartData: (data?.years ?? []).map((year) => ({
      year,
      primary: products.reduce((sum, item) => sum + (item[key][year] ?? 0), 0),
      secondary: null
    }))
  }));
}

function SectorTrendCard({
  title,
  subtitle,
  sectorName,
  sourceName,
  unit,
  color,
  filename,
  hsItems,
  chartData,
  loading
}: SectorTrendCardProps) {
  const [downloadHandler, setDownloadHandler] = React.useState<
    (() => void) | null
  >(null);
  const registerDownloadHandler = React.useCallback(
    (handler: (() => void) | null) => {
      setDownloadHandler(() => handler);
    },
    []
  );

  const expandActions = (
    <IconTooltip label="Unduh Tren">
      <span>
        <Button
          type="button"
          className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          aria-label={`Unduh ${title}`}
          onClick={() => downloadHandler?.()}
          disabled={!downloadHandler}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </Button>
      </span>
    </IconTooltip>
  );

  const chart = (
    <TradeAnnualAreaChart
      data={chartData}
      primaryLabel={title}
      secondaryLabel=""
      unit={unit}
      height={280}
      primaryColor={color}
      hideLegend
      filename={filename}
      onRegisterDownload={registerDownloadHandler}
      exportTitle={title}
      exportSubtitle={subtitle}
      exportFooter={sourceName}
    />
  );

  const expandedChart = (
    <TradeAnnualAreaChart
      data={chartData}
      primaryLabel={title}
      secondaryLabel=""
      unit={unit}
      height={430}
      primaryColor={color}
      hideLegend
      filename={filename}
      onRegisterDownload={registerDownloadHandler}
      exportTitle={title}
      exportSubtitle={subtitle}
      exportFooter={sourceName}
    />
  );

  const titleNode = (
    <span className="inline-flex items-center gap-1.5">
      <span>{title}</span>
      <HoverInfoTooltip
        openOnClick
        content={null}
        renderContent={() => (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              HS Code Sektor {sectorName}
            </p>
            <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
              {hsItems.length > 0 ? (
                hsItems.map((item) => (
                  <div
                    key={`${item.kodeHS}-${item.namaHS}`}
                    className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-700"
                  >
                    <span className="font-semibold text-slate-800">
                      {item.kodeHS}
                    </span>
                    <span className="mx-1 text-slate-400">|</span>
                    <span>{item.namaHS}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">
                  Tidak ada HS Code pada sektor ini.
                </div>
              )}
            </div>
          </div>
        )}
      >
        <span className="inline-flex">
          <InformationCircleIcon className="h-4 w-4 text-slate-400" />
        </span>
      </HoverInfoTooltip>
    </span>
  );

  return (
    <ExpandableCard
      title={titleNode}
      subtitle={subtitle}
      expandActions={expandActions}
      className="h-full"
      contentClassName="space-y-2"
      expandedContent={
        loading ? (
          <ChartSkeleton className="border-0 bg-transparent p-0 shadow-none" />
        ) : (
          <div className="space-y-3">
            {expandedChart}
            <div className="text-right text-xs italic text-slate-500">
              {sourceName}
            </div>
          </div>
        )
      }
    >
      {loading ? (
        <ChartSkeleton className="border-0 bg-transparent p-0 shadow-none" />
      ) : (
        <div className="space-y-2">
          {chart}
          <div className="text-right text-[11px] italic text-slate-500">
            {sourceName}
          </div>
        </div>
      )}
    </ExpandableCard>
  );
}

export function HilirisasiSectorTrendSection({
  data,
  loading,
  metricMode
}: HilirisasiSectorTrendSectionProps) {
  const metricLabel = getMetricLabel(metricMode);
  const sectorSeries = React.useMemo(
    () => buildSectorSeries(data, metricMode),
    [data, metricMode]
  );
  const reporters = React.useMemo(
    () => (data?.reporters ?? []).map((item) => item.nama),
    [data]
  );
  const partners = React.useMemo(
    () => (data?.partners ?? []).map((item) => item.nama),
    [data]
  );
  const latestYear = data?.latestYear ?? null;
  const earliestYear = React.useMemo(() => {
    const years = (data?.years ?? []).filter((year) => Number.isFinite(year));
    if (!years.length) return null;
    return [...years].sort((left, right) => left - right)[0] ?? null;
  }, [data]);
  const sectionSubtitle =
    latestYear != null && earliestYear != null && latestYear !== earliestYear
      ? `Tahun ${earliestYear}-${latestYear} | Unit: ${data?.unit ?? "US$"} | Asal: ${formatCountryList(reporters)} | Tujuan: ${formatCountryList(partners)}`
      : `Tahun ${latestYear ?? "-"} | Unit: ${data?.unit ?? "US$"} | Asal: ${formatCountryList(reporters)} | Tujuan: ${formatCountryList(partners)}`;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Tren Per Sektor
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Perbandingan tren tahunan per kategori sektor hilirisasi berdasarkan
          filter asal, tujuan, dan HS Code yang aktif.
        </p>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <ChartSkeleton
              key={`hilirisasi-sector-trend-skeleton-${index}`}
              className="border-0 bg-white p-4 shadow-sm"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {sectorSeries.map((sector, index) => {
            const title = `Tren ${metricLabel} Sektor ${sector.sectorName}`;
            const filename =
              `Tren_Sektor_Hilirisasi_${sector.sectorName}_${metricLabel}`.replace(
                /[^\w]+/g,
                "_"
              );
            return (
              <SectorTrendCard
                key={sector.sectorName}
                title={title}
                subtitle={sectionSubtitle}
                sectorName={sector.sectorName}
                sourceName={data?.sourceName ?? "-"}
                unit={data?.unit ?? "US$"}
                color={SECTOR_COLORS[index % SECTOR_COLORS.length] ?? "#2563eb"}
                filename={filename}
                hsItems={sector.hsItems}
                chartData={sector.chartData}
                loading={false}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
