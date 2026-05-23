import React from "react";
import ReactECharts from "echarts-for-react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Button } from "@/components/ui/Button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import { downloadComposedPng } from "@/utils/downloadComposedPng";
import type {
  AnalisisGeopolitikCountryMeta,
  AnalisisGeopolitikProductItem
} from "@/type/analisis";
import { buildCompareBarOption } from "./helpers";

type AnalisisGeopolitikComparisonSectionProps = {
  exportRows: AnalisisGeopolitikProductItem[];
  importRows: AnalisisGeopolitikProductItem[];
  geoCountries: AnalisisGeopolitikCountryMeta[];
  year: number | null;
  previousYear: number | null;
  unitLabel: string;
  sourceName: string | null;
  loading?: boolean;
};

function CompareChartCard({
  title,
  rows,
  geoCountries,
  year,
  previousYear,
  unitLabel,
  sourceName,
  loading
}: {
  title: string;
  rows: AnalisisGeopolitikProductItem[];
  geoCountries: AnalisisGeopolitikCountryMeta[];
  year: number | null;
  previousYear: number | null;
  unitLabel: string;
  sourceName: string | null;
  loading?: boolean;
}) {
  const chartRef = React.useRef<ReactECharts | null>(null);
  const subtitle = loading
    ? "Sedang mengambil komparasi produk geopolitik..."
    : `Top 5 produk | Tahun ${previousYear ?? "-"}-${year ?? "-"} | Unit: ${unitLabel}`;

  const handleDownload = React.useCallback(async () => {
    const instance = chartRef.current?.getEchartsInstance();
    if (!instance) return;
    const imageUrl = instance.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#ffffff"
    });
    await downloadComposedPng({
      imageUrl,
      filename: title.replace(/\s+/g, "_"),
      title,
      subtitle,
      footer: sourceName ?? "-"
    });
  }, [sourceName, subtitle, title]);

  const content = loading ? (
    <ChartSkeleton className="h-full" />
  ) : (
    <ReactECharts
      ref={chartRef}
      option={buildCompareBarOption(rows, geoCountries, {
        year,
        previousYear,
        unitLabel
      })}
      style={{ width: "100%", height: 360 }}
      notMerge
      lazyUpdate
    />
  );

  return (
    <ExpandableCard
      title={title}
      subtitle={subtitle}
      className="min-w-0"
      contentClassName="min-w-0"
      actions={
        <IconTooltip label="Unduh chart">
          <span>
            <Button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white p-0 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || !rows.length}
              onClick={() => void handleDownload()}
              aria-label="Unduh chart"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
          </span>
        </IconTooltip>
      }
      expandedContent={<div className="min-w-0">{content}</div>}
      modalSize="full"
    >
      {content}
    </ExpandableCard>
  );
}

export function AnalisisGeopolitikComparisonSection({
  exportRows,
  importRows,
  geoCountries,
  year,
  previousYear,
  unitLabel,
  sourceName,
  loading = false
}: AnalisisGeopolitikComparisonSectionProps) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <CompareChartCard
        title={`Komparasi Ekspor ${year ?? "-"}: Indonesia, Dunia, dan Negara Geopolitik`}
        rows={exportRows}
        geoCountries={geoCountries}
        year={year}
        previousYear={previousYear}
        unitLabel={unitLabel}
        sourceName={sourceName}
        loading={loading}
      />
      <CompareChartCard
        title={`Komparasi Impor ${year ?? "-"}: Indonesia, Dunia, dan Negara Geopolitik`}
        rows={importRows}
        geoCountries={geoCountries}
        year={year}
        previousYear={previousYear}
        unitLabel={unitLabel}
        sourceName={sourceName}
        loading={loading}
      />
    </section>
  );
}
