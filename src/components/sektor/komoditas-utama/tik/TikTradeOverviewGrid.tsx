import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { MapHeatLayer } from "@/components/ui/MapHeatLayer";
import { TopMitraTable } from "@/components/ui/TopMitraTable";
import { useToast } from "@/components/ui/Toast";
import { MapSkeleton } from "@/components/ui/skeletons/MapSkeleton";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import type { DiplomasiSummaryCardView } from "@/type/indonesiaDiplomasi";
import type { TikTradeFlowResult } from "@/type/komoditasUtama";
import { downloadComposedPng } from "@/utils/downloadComposedPng";
import type { TikMetricMode } from "./TikTradeHeroSection";

type TikTradeOverviewGridProps = {
  metricMode: TikMetricMode;
  data: TikTradeFlowResult | null | undefined;
  loading?: boolean;
};

type ExportLegendItem = {
  color: string;
  label: string;
};

function getMetricLabel(metricMode: TikMetricMode) {
  if (metricMode === "total_import") return "Total Impor";
  if (metricMode === "total_trade") return "Total Perdagangan";
  return "Total Ekspor";
}

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

export function TikTradeOverviewGrid({
  metricMode,
  data,
  loading = false
}: TikTradeOverviewGridProps) {
  const mapPanelHeightClass = "xl:h-[560px]";
  const tablePanelHeightClass = "xl:h-[735px]";
  const mapBodyHeightClass = "h-[260px] sm:h-[320px] lg:h-[370px]";
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const tableDownloadHandlerRef = React.useRef<(() => void) | null>(null);
  const { toast } = useToast();
  const metricLabel = getMetricLabel(metricMode);
  const latestYear = data?.years[data.years.length - 1] ?? 2024;
  const previousYear = data?.years[data.years.length - 2] ?? latestYear - 1;
  const [tableSortColumn, setTableSortColumn] = React.useState(
    String(latestYear)
  );
  const [hasTableDownload, setHasTableDownload] = React.useState(false);
  const totalTradeNow = data?.totalWorldPerYear[latestYear] ?? 0;
  const totalTradePrev = data?.totalWorldPerYear[previousYear] ?? 0;
  const balanceNow = (data?.items ?? []).reduce(
    (sum, item) => sum + (item.neraca[latestYear] ?? 0),
    0
  );
  const balancePrev = (data?.items ?? []).reduce(
    (sum, item) => sum + (item.neraca[previousYear] ?? 0),
    0
  );
  const totalExportNow = (totalTradeNow + balanceNow) / 2;
  const totalExportPrev = (totalTradePrev + balancePrev) / 2;
  const totalImportNow = (totalTradeNow - balanceNow) / 2;
  const totalImportPrev = (totalTradePrev - balancePrev) / 2;
  const totalMetricByYear = React.useMemo(() => {
    const output: Record<number, number> = {};
    for (const year of data?.years ?? []) {
      const tradeValue = data?.totalWorldPerYear[year] ?? 0;
      const balanceValue = (data?.items ?? []).reduce(
        (sum, item) => sum + (item.neraca[year] ?? 0),
        0
      );
      output[year] =
        metricMode === "total_import"
          ? (tradeValue - balanceValue) / 2
          : metricMode === "total_trade"
            ? tradeValue
            : (tradeValue + balanceValue) / 2;
    }
    return output;
  }, [data?.items, data?.totalWorldPerYear, data?.years, metricMode]);
  const summaryCards: DiplomasiSummaryCardView[] = [
    {
      id: "tik-total-export",
      title: `Total Ekspor Indonesia ke Dunia Tahun ${latestYear}`,
      tone: "emerald",
      unit: data?.unit ?? "US$",
      value: totalExportNow,
      prevValue: totalExportPrev,
      year: String(latestYear),
      prevYear: String(previousYear),
      note: `Ringkasan ekspor sektor TIK Tahun ${latestYear} dibandingkan Tahun ${previousYear}.`,
      highlight: null,
      prevHighlight: null,
      highlightType: "none",
      sourceName: data?.sourceName ?? "-"
    },
    {
      id: "tik-total-import",
      title: `Total Impor Indonesia dari Dunia Tahun ${latestYear}`,
      tone: "amber",
      unit: data?.unit ?? "US$",
      value: totalImportNow,
      prevValue: totalImportPrev,
      year: String(latestYear),
      prevYear: String(previousYear),
      note: `Ringkasan impor sektor TIK Tahun ${latestYear} dibandingkan Tahun ${previousYear}.`,
      highlight: null,
      prevHighlight: null,
      highlightType: "none",
      sourceName: data?.sourceName ?? "-"
    },
    {
      id: "tik-total-trade",
      title: `Total Perdagangan Indonesia ke Dunia Tahun ${latestYear}`,
      tone: "sky",
      unit: data?.unit ?? "US$",
      value: totalTradeNow,
      prevValue: totalTradePrev,
      year: String(latestYear),
      prevYear: String(previousYear),
      note: `Ringkasan total perdagangan sektor TIK Tahun ${latestYear} dibandingkan Tahun ${previousYear}.`,
      highlight: null,
      prevHighlight: null,
      highlightType: "none",
      sourceName: data?.sourceName ?? "-"
    }
  ];
  const transformedItems = (data?.items ?? []).map((item) => {
    const transformedValues = Object.fromEntries(
      Object.keys(item.nilai_perdagangan).map((yearKey) => {
        const year = Number(yearKey);
        const tradeValue = item.nilai_perdagangan[year] ?? 0;
        const balanceValue = item.neraca[year] ?? 0;
        const nextValue =
          metricMode === "total_import"
            ? (tradeValue - balanceValue) / 2
            : metricMode === "total_trade"
              ? tradeValue
              : (tradeValue + balanceValue) / 2;
        return [year, nextValue];
      })
    );
    const transformedProportions = Object.fromEntries(
      Object.keys(transformedValues).map((yearKey) => {
        const year = Number(yearKey);
        const metricValue = transformedValues[year] ?? 0;
        const totalValue = totalMetricByYear[year] ?? 0;
        const nextShare =
          metricMode === "total_trade"
            ? (item.proporsi[year] ?? 0)
            : totalValue > 0
              ? (metricValue / totalValue) * 100
              : 0;
        return [year, nextShare];
      })
    );

    return {
      negara: item.negara,
      kode_alpha2: item.kode_alpha2,
      kode_alpha3: item.kode_alpha3,
      nilai_perdagangan: transformedValues,
      neraca: item.neraca,
      proporsi: transformedProportions
    };
  });
  const mapTitle = `Peta Sebaran Sektor TIK ${metricLabel}`;
  const sourceName = data?.sourceName ?? "-";
  const tableTitle = `Top Mitra ${metricLabel} Sektor TIK`;
  const comparisonYearsLabel =
    previousYear !== latestYear
      ? `${previousYear}-${latestYear}`
      : String(latestYear);
  const mapSubtitle = loading
    ? "Sedang mengambil data peta sektor TIK..."
    : `Tahun ${comparisonYearsLabel} | Unit: ${data?.unit ?? "US$"}`;
  const tableSubtitle = loading
    ? "Sedang mengambil data top mitra sektor TIK..."
    : `Tahun ${comparisonYearsLabel} | Unit: ${data?.unit ?? "US$"} | Nomor mengikuti urutan sorting pada kolom ${tableSortColumn}`;
  React.useEffect(() => {
    setTableSortColumn(String(latestYear));
  }, [latestYear]);
  async function handleDownloadMap() {
    try {
      if (!mapContainerRef.current) return;
      const imageUrl = await buildLeafletMapImage(mapContainerRef.current);
      await downloadComposedPng({
        imageUrl,
        filename: `Peta_Sebaran_Sektor_TIK_${metricLabel.replace(/[^\w]+/g, "_")}`,
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
    <IconTooltip label="Unduh Peta">
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
  const tableExpandActions = (
    <IconTooltip label="Unduh Tabel">
      <span>
        <Button
          type="button"
          className="shrink-0 rounded-md border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
          aria-label={`Unduh ${tableTitle}`}
          onClick={() => {
            tableDownloadHandlerRef.current?.();
          }}
          disabled={!hasTableDownload}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </Button>
      </span>
    </IconTooltip>
  );
  const registerTableDownload = React.useCallback(
    (handler: (() => void) | null) => {
      tableDownloadHandlerRef.current = handler;
      setHasTableDownload(Boolean(handler));
    },
    []
  );
  const handleSortColumnChange = React.useCallback((columnLabel: string) => {
    setTableSortColumn(columnLabel);
  }, []);
  const tableContent = (
    <TopMitraTable
      raw={{ items: transformedItems }}
      unitLabel={data?.unit ?? "US$"}
      emptyMessage={`Data ${metricLabel.toLowerCase()} sektor TIK belum tersedia untuk filter aktif.`}
      onRegisterDownload={registerTableDownload}
      onSortColumnChange={handleSortColumnChange}
      downloadTitle={tableTitle}
      downloadFilename={`Top_Mitra_Sektor_TIK_${metricLabel.replace(/[^\w]+/g, "_")}`}
      downloadSource={sourceName}
      downloadNotes={tableSubtitle}
      expanded={false}
      defaultLimit="15"
      fitHeightToContainer
    />
  );
  const expandedTableContent = (
    <TopMitraTable
      raw={{ items: transformedItems }}
      unitLabel={data?.unit ?? "US$"}
      emptyMessage={`Data ${metricLabel.toLowerCase()} sektor TIK belum tersedia untuk filter aktif.`}
      onRegisterDownload={registerTableDownload}
      onSortColumnChange={handleSortColumnChange}
      downloadTitle={tableTitle}
      downloadFilename={`Top_Mitra_Sektor_TIK_${metricLabel.replace(/[^\w]+/g, "_")}`}
      downloadSource={sourceName}
      downloadNotes={tableSubtitle}
      expanded
      defaultLimit="15"
      fitHeightToContainer
    />
  );

  return (
    <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-12 mb-15">
      <section className="flex min-w-0 flex-col gap-4 xl:col-span-8">
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <SummaryCard key={card.id} card={card} loading />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <SummaryCard key={card.id} card={card} />
            ))}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <ExpandableCard
            className={mapPanelHeightClass}
            title={mapTitle}
            subtitle={mapSubtitle}
            expandLabel="Perbesar peta"
            modalSize="full"
            expandActions={mapExpandActions}
            expandedContent={
              <MapHeatLayer
                className="h-[60vh] min-h-80 w-full sm:h-[70vh]"
                data={transformedItems}
                colorMetric="value"
                headerMetric="value"
                currencyPrefix={data?.unit ?? "Ribu US$"}
                footerText={sourceName}
                legendColumns={2}
              />
            }
          >
            {loading ? (
              <MapSkeleton className="border-0 shadow-none" />
            ) : (
              <div ref={mapContainerRef} className="w-full">
                <MapHeatLayer
                  className={`${mapBodyHeightClass} w-full`}
                  data={transformedItems}
                  colorMetric="value"
                  headerMetric="value"
                  currencyPrefix={data?.unit ?? "Ribu US$"}
                  footerText={sourceName}
                />
              </div>
            )}
          </ExpandableCard>
        </div>
      </section>

      <section className="flex min-h-0 min-w-0 xl:col-span-4">
        <div className="min-w-0 w-full">
          <ExpandableCard
            className={`min-w-0 w-full ${tablePanelHeightClass}`}
            contentClassName="flex min-h-0 flex-1 flex-col"
            title={tableTitle}
            subtitle={tableSubtitle}
            expandLabel="Perbesar tabel"
            modalSize="full"
            expandActions={tableExpandActions}
            expandedContent={
              loading ? (
                <div className="h-full overflow-hidden">
                  <TableSkeleton
                    className="h-full border-0 p-0 shadow-none"
                    rows={8}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {expandedTableContent}
                  <div className="text-right text-xs italic text-slate-500">
                    {sourceName}
                  </div>
                </div>
              )
            }
          >
            {loading ? (
              <div className="h-full overflow-hidden">
                <TableSkeleton className="border-0 p-0 shadow-none" rows={5} />
              </div>
            ) : (
              <div className="flex h-full min-h-0 flex-1 flex-col gap-3">
                <div className="min-h-0 min-w-0 flex-1">{tableContent}</div>
                <div className="text-right text-xs italic text-slate-500">
                  {sourceName}
                </div>
              </div>
            )}
          </ExpandableCard>
        </div>
      </section>
    </div>
  );
}
