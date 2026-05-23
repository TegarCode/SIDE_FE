import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Button } from "@/components/ui/Button";
import { EmptyStatePanel } from "@/components/ui/EmptyStatePanel";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { MapHeatLayer } from "@/components/ui/MapHeatLayer";
import { useToast } from "@/components/ui/Toast";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import { MapSkeleton } from "@/components/ui/skeletons/MapSkeleton";
import type { AnalisisOperationalRiskResult } from "@/type/analisis";
import { downloadComposedPng } from "@/utils/downloadComposedPng";

type Props = {
  data: AnalisisOperationalRiskResult | null;
  loading: boolean;
};

function formatNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(value);
}

type ExportLegendItem = {
  color: string;
  label: string;
};

async function waitForLeafletMapReady(
  container: HTMLDivElement,
  attempts = 16,
  delayMs = 250
) {
  for (let index = 0; index < attempts; index += 1) {
    const mapPane = container.querySelector(".leaflet-map-pane");
    const overlay = container.querySelector(".leaflet-overlay-pane svg");
    if (mapPane && overlay) return;
    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
  }
  throw new Error("Peta belum siap untuk diunduh.");
}

function extractLegendItems(container: HTMLDivElement) {
  const legendRows = Array.from(
    container.querySelectorAll("[data-map-legend-item='true']")
  );
  return legendRows
    .map((row) => {
      const swatch = row.querySelector(
        "[data-map-legend-swatch='true']"
      ) as HTMLElement | null;
      const label =
        row
          .querySelector("[data-map-legend-label='true']")
          ?.textContent?.trim() ?? "";
      const color = swatch
        ? window.getComputedStyle(swatch).backgroundColor
        : "";
      if (!label || !color) return null;
      return { color, label } satisfies ExportLegendItem;
    })
    .filter((item): item is ExportLegendItem => item !== null);
}

async function buildLeafletMapImage(container: HTMLDivElement) {
  await waitForLeafletMapReady(container);

  const mapRect = container.getBoundingClientRect();
  const overlay = container.querySelector(
    ".leaflet-overlay-pane svg"
  ) as SVGSVGElement | null;
  if (!overlay) throw new Error("Layer peta belum selesai dimuat.");

  const overlayRect = overlay.getBoundingClientRect();
  const legendItems = extractLegendItems(container);
  const width = Math.max(1, Math.round(mapRect.width));
  const legendRows =
    legendItems.length > 4 ? 2 : legendItems.length > 0 ? 1 : 0;
  const legendHeight = legendRows > 0 ? 72 + (legendRows - 1) * 28 : 0;
  const height = Math.max(1, Math.round(mapRect.height));
  const totalHeight = height + legendHeight;
  const offsetX = overlayRect.left - mapRect.left;
  const offsetY = overlayRect.top - mapRect.top;
  const overlayMarkup = new XMLSerializer().serializeToString(overlay);
  const legendMarkup =
    legendItems.length > 0
      ? legendItems
          .map((item, index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;
            const baseX = 24 + col * ((width - 48) / 4);
            const baseY = height + 26 + row * 28;
            return `
              <g transform="translate(${baseX}, ${baseY})">
                <rect width="14" height="14" rx="3" fill="${item.color}" stroke="none" />
                <text x="22" y="11" font-size="12" font-family="Arial, sans-serif" fill="#334155">${item.label}</text>
              </g>
            `;
          })
          .join("")
      : "";
  const composedSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}">
      <rect width="${width}" height="${totalHeight}" fill="#f8fafc" />
      <g transform="translate(${offsetX}, ${offsetY})">
        ${overlayMarkup}
      </g>
      ${legendMarkup}
    </svg>
  `;

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(composedSvg)}`;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Gagal memuat layer peta."));
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = totalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas context tidak tersedia.");
  context.fillStyle = "#f8fafc";
  context.fillRect(0, 0, width, totalHeight);
  context.drawImage(image, 0, 0, width, totalHeight);
  return canvas.toDataURL("image/png");
}

export function AnalisisOperationalRiskOverviewSection({
  data,
  loading
}: Props) {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const radarContainerRef = React.useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const latestYear = data?.meta.latestYear ?? null;
  const previousYears =
    latestYear != null
      ? (data?.meta.years ?? []).filter((year) => year < latestYear)
      : [];
  const previousYear =
    latestYear != null
      ? (previousYears[previousYears.length - 1] ?? latestYear)
      : null;
  const sourceName = data?.meta.sourceName ?? "-";
  const selectedCountryName = data?.meta.selectedCountry.name ?? "-";
  const mapTitle = `Peta Skor Risiko Operasional Per Negara/Entitas Tahun ${latestYear ?? "-"}`;
  const mapSubtitle =
    previousYear != null && latestYear != null && previousYear !== latestYear
      ? `Tahun ${previousYear}-${latestYear} | Unit: Skor`
      : `Tahun ${latestYear ?? "-"} | Unit: Skor`;
  const radarTitle = `Risiko Operasional ${selectedCountryName} Tahun ${latestYear ?? "-"}`;
  const radarSubtitle =
    previousYear != null && latestYear != null && previousYear !== latestYear
      ? `Tahun ${previousYear}-${latestYear} | Unit: Skor | Breakdown skor risiko operasional per indikator.`
      : `Tahun ${latestYear ?? "-"} | Unit: Skor | Breakdown skor risiko operasional per indikator.`;

  const mapData = React.useMemo(
    () =>
      (data?.totalRows ?? []).map((item) => ({
        kode_alpha2: item.codeAlpha2,
        kode_alpha3: item.codeAlpha3,
        negara: item.name,
        nilai_perdagangan: item.scores
      })),
    [data?.totalRows]
  );

  const radarData = React.useMemo(
    () =>
      (data?.breakdownRows ?? []).map((item) => ({
        indicator: item.indicator,
        score: latestYear != null ? (item.scores[latestYear] ?? 0) : 0
      })),
    [data?.breakdownRows, latestYear]
  );

  const riskBuckets = React.useMemo(() => {
    if (latestYear == null) return null;
    const values = (data?.totalRows ?? [])
      .map((item) => item.scores[latestYear])
      .filter((value): value is number => Number.isFinite(value) && value > 0)
      .sort((left, right) => left - right);

    if (!values.length) return null;

    const min = values[0];
    const max = values[values.length - 1];
    const bucketCount = 6;
    const step = Math.max((max - min) / bucketCount, 1);
    const colors = [
      "#10b981",
      "#22c55e",
      "#84cc16",
      "#eab308",
      "#f59e0b",
      "#d97706"
    ];

    return Array.from({ length: bucketCount }).map((_, index) => {
      const bucketMin = index === 0 ? min : min + step * index;
      const bucketMax =
        index === bucketCount - 1 ? undefined : min + step * (index + 1);
      const from = Math.round(bucketMin);
      const to = bucketMax == null ? undefined : Math.round(bucketMax);

      return {
        min: bucketMin,
        max: bucketMax,
        color: colors[index],
        label: to == null ? `>= ${from}` : `${from} - ${to}`
      };
    });
  }, [data?.totalRows, latestYear]);

  const radarChart = (
    <div
      ref={radarContainerRef}
      className="rounded-xl border border-slate-200 bg-white p-3"
    >
      <div className="h-119">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="68%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="indicator"
              tick={{ fill: "#475569", fontSize: 11 }}
              tickFormatter={(value: string) =>
                value.replace(/\s+Risk Score$/i, "")
              }
            />
            <PolarRadiusAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <Radar
              name="Skor"
              dataKey="score"
              stroke="#384AA0"
              fill="#384AA0"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip
              formatter={(value) => [
                formatNumber(typeof value === "number" ? value : Number(value)),
                "Skor"
              ]}
              labelFormatter={(label) => String(label ?? "")}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-right text-[11px] italic text-slate-500">
        Sumber: {sourceName}
      </p>
    </div>
  );

  async function handleDownloadMap() {
    try {
      if (!mapContainerRef.current) return;
      const imageUrl = await buildLeafletMapImage(mapContainerRef.current);
      await downloadComposedPng({
        imageUrl,
        filename: `Peta_Risiko_Operasional_${latestYear ?? "latest"}`,
        title: mapTitle,
        subtitle: mapSubtitle,
        footer: sourceName
      });
    } catch (error) {
      toast({
        title: "Unduh peta gagal",
        description:
          error instanceof Error
            ? error.message
            : "Peta belum siap untuk diunduh.",
        tone: "error"
      });
    }
  }

  const mapExpandActions = (
    <IconTooltip label="Unduh PNG">
      <span>
        <Button
          type="button"
          className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          aria-label={`Unduh ${mapTitle}`}
          onClick={() => {
            void handleDownloadMap();
          }}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </Button>
      </span>
    </IconTooltip>
  );

  async function handleDownloadRadar() {
    try {
      if (!radarContainerRef.current) return;
      const svg = radarContainerRef.current.querySelector(
        ".recharts-surface"
      ) as SVGSVGElement | null;
      if (!svg) throw new Error("Grafik belum siap untuk diunduh.");

      const svgMarkup = new XMLSerializer().serializeToString(svg);
      const width = Math.max(1, Math.round(svg.clientWidth || 900));
      const height = Math.max(1, Math.round(svg.clientHeight || 520));
      const composedSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <rect width="${width}" height="${height}" fill="#ffffff" />
          ${svgMarkup}
        </svg>
      `;

      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(composedSvg)}`;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("Gagal memuat grafik untuk unduhan."));
      });

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas context tidak tersedia.");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      await downloadComposedPng({
        imageUrl: canvas.toDataURL("image/png"),
        filename: `Radar_Risiko_Operasional_${selectedCountryName.replace(/[^\w]+/g, "_")}_${latestYear ?? "latest"}`,
        title: radarTitle,
        subtitle: radarSubtitle,
        footer: sourceName
      });
    } catch (error) {
      toast({
        title: "Unduh grafik gagal",
        description:
          error instanceof Error
            ? error.message
            : "Grafik belum siap untuk diunduh.",
        tone: "error"
      });
    }
  }

  const radarExpandActions = (
    <IconTooltip label="Unduh PNG">
      <span>
        <Button
          type="button"
          className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          aria-label={`Unduh ${radarTitle}`}
          onClick={() => {
            void handleDownloadRadar();
          }}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </Button>
      </span>
    </IconTooltip>
  );

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-7">
        <ExpandableCard
          title={mapTitle}
          subtitle={mapSubtitle}
          modalSize="full"
          expandActions={mapExpandActions}
          expandedContent={
            <MapHeatLayer
              data={mapData}
              className="h-[68vh] w-full"
              colorMetric="value"
              headerMetric="value"
              currencyPrefix="Skor"
              footerText={<span className="italic">Sumber: {sourceName}</span>}
              legendColumns={2}
              customBuckets={riskBuckets}
              showProportionInTooltip={false}
            />
          }
        >
          <div className="mt-1">
            {loading && !data ? (
              <MapSkeleton />
            ) : (
              <div ref={mapContainerRef}>
                <MapHeatLayer
                  data={mapData}
                  className="h-115 w-full"
                  colorMetric="value"
                  headerMetric="value"
                  currencyPrefix="Skor"
                  footerText={
                    <span className="italic">Sumber: {sourceName}</span>
                  }
                  legendColumns={4}
                  customBuckets={riskBuckets}
                  showProportionInTooltip={false}
                />
              </div>
            )}
          </div>
        </ExpandableCard>
      </div>

      <div className="xl:col-span-5">
        <ExpandableCard
          title={radarTitle}
          subtitle={radarSubtitle}
          modalSize="xl"
          expandActions={radarExpandActions}
          expandedContent={radarChart}
        >
          <div className="mt-1">
            {loading && !data ? (
              <ChartSkeleton />
            ) : radarData.length === 0 ? (
              <EmptyStatePanel
                title="Data breakdown belum tersedia"
                description="Belum ada data breakdown operational risk untuk negara yang dipilih."
                className="min-h-130"
              />
            ) : (
              radarChart
            )}
          </div>
        </ExpandableCard>
      </div>
    </section>
  );
}
