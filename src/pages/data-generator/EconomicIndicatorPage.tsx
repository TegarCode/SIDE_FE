import React from "react";
import { APP_NAME } from "@/constants/app";
import { DataGeneratorEconomicIndicatorTableSection } from "@/components/data-generator/DataGeneratorEconomicIndicatorTableSection";
import { DataGeneratorEconomicIndicatorVisualizationSection } from "@/components/data-generator/DataGeneratorEconomicIndicatorVisualizationSection";
import { DataGeneratorInfoBanner } from "@/components/data-generator/DataGeneratorInfoBanner";
import {
  DataGeneratorEconomicIndicatorFiltersPanel,
  type DataGeneratorEconomicIndicatorFilterValue
} from "@/components/filters/DataGeneratorEconomicIndicatorFiltersPanel";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { useDataGeneratorEconomicIndicatorTableQuery } from "@/hooks/data-generator/useDataGeneratorEconomicIndicatorTableQuery";
import { useDataGeneratorEconomicIndicatorVisualizationQuery } from "@/hooks/data-generator/useDataGeneratorEconomicIndicatorVisualizationQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isUnauthorizedApiError } from "@/utils/apiError";

const ECONOMIC_INDICATOR_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-generator-economic-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini dipakai untuk membangun hasil data indikator ekonomi dan daya saing dalam format tabel atau grafik."
  },
  {
    selector: '[data-generator-economic-tour="info-banner"]',
    title: "Informasi generator",
    description:
      "Banner ini menjelaskan cakupan data yang bisa dieksplorasi sebelum Anda menerapkan filter."
  },
  {
    selector: '[data-generator-economic-tour="filters-panel"]',
    title: "Panel filter",
    description:
      "Pilih indikator, rentang tahun, dan tipe output, lalu terapkan filter untuk memuat hasil generator."
  },
  {
    selector: '[data-generator-economic-tour="result-section"]',
    title: "Hasil generator",
    description:
      "Bagian ini menampilkan tabel atau visualisasi sesuai filter yang sudah diterapkan."
  }
];

const DEFAULT_FILTER_VALUE: DataGeneratorEconomicIndicatorFilterValue = {
  indicatorId: null,
  yearFrom: null,
  yearTo: null,
  outputType: "table"
};

export function DataGeneratorEconomicIndicatorPage() {
  useDocumentTitle(
    `Data Generator Indikator Ekonomi & Daya Saing | ${APP_NAME}`
  );
  const { toast, dismiss } = useToast();
  const [filters, setFilters] =
    React.useState<DataGeneratorEconomicIndicatorFilterValue>(
      DEFAULT_FILTER_VALUE
    );
  const [appliedFilters, setAppliedFilters] =
    React.useState<DataGeneratorEconomicIndicatorFilterValue | null>(null);
  const [hasFilterUnauthorizedError, setHasFilterUnauthorizedError] =
    React.useState(false);
  const filterBadge = React.useMemo(() => {
    if (!appliedFilters) return "Filter belum diterapkan";
    return JSON.stringify(filters) === JSON.stringify(appliedFilters)
      ? "Filter Aktif"
      : "Filter belum diterapkan";
  }, [appliedFilters, filters]);

  const tableParams = React.useMemo(() => {
    if (
      !appliedFilters ||
      appliedFilters.outputType !== "table" ||
      !appliedFilters.indicatorId
    )
      return null;
    return {
      indicator_id: Number(appliedFilters.indicatorId),
      yearFrom: Number(appliedFilters.yearFrom ?? 0),
      yearTo: Number(appliedFilters.yearTo ?? 0),
      viewType: "table" as const
    };
  }, [appliedFilters]);

  const visualizationParams = React.useMemo(() => {
    if (
      !appliedFilters ||
      appliedFilters.outputType !== "chart" ||
      !appliedFilters.indicatorId
    )
      return null;
    return {
      indicator_id: Number(appliedFilters.indicatorId),
      yearFrom: Number(appliedFilters.yearFrom ?? 0),
      yearTo: Number(appliedFilters.yearTo ?? 0),
      viewType: "chart" as const
    };
  }, [appliedFilters]);

  const tableQuery = useDataGeneratorEconomicIndicatorTableQuery(
    tableParams,
    Boolean(tableParams)
  );
  const visualizationQuery =
    useDataGeneratorEconomicIndicatorVisualizationQuery(
      visualizationParams,
      Boolean(visualizationParams)
    );
  const activeQuery =
    appliedFilters?.outputType === "chart" ? visualizationQuery : tableQuery;
  const hasUnauthorizedError =
    hasFilterUnauthorizedError || isUnauthorizedApiError(activeQuery.error);
  const loadingToastIdRef = React.useRef<string | null>(null);
  const lastErrorKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (activeQuery.isFetching) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Memuat data indikator ekonomi",
        description:
          appliedFilters?.outputType === "chart"
            ? "Visualisasi indikator ekonomi sedang diambil."
            : "Data generator indikator ekonomi sedang diambil.",
        tone: "loading",
        durationMs: null
      });
      return;
    }
    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [activeQuery.isFetching, appliedFilters?.outputType, dismiss, toast]);

  React.useEffect(() => {
    if (!activeQuery.isError || hasUnauthorizedError) return;
    const errorMessage =
      activeQuery.error instanceof Error
        ? activeQuery.error.message
        : "Permintaan data indikator ekonomi gagal diproses.";
    const errorKey = JSON.stringify({
      params:
        appliedFilters?.outputType === "chart"
          ? visualizationParams
          : tableParams,
      message: errorMessage
    });
    if (lastErrorKeyRef.current === errorKey) return;
    lastErrorKeyRef.current = errorKey;
    toast({
      title: "Memuat data indikator ekonomi gagal",
      description: errorMessage,
      tone: "error"
    });
  }, [
    activeQuery.error,
    activeQuery.isError,
    appliedFilters?.outputType,
    hasUnauthorizedError,
    tableParams,
    toast,
    visualizationParams
  ]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data generator indikator ekonomi tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-900 lg:px-8">
      <div className="space-y-6">
        <div data-generator-economic-tour="page-title">
          <PageTitle
            title="Data Generator Indikator Ekonomi & Daya Saing"
            description="Bangun kombinasi indikator dan rentang tahun sebelum hasil tabel atau visualisasi dimuat."
          />
        </div>
        <div data-generator-economic-tour="info-banner">
          <DataGeneratorInfoBanner
            sectorLabel="indikator ekonomi dan daya saing"
            description="Generator ini disiapkan untuk eksplorasi indikator ekonomi dan indeks daya saing dalam tampilan tabel maupun grafik dengan kombinasi parameter yang fleksibel."
          />
        </div>
        <div data-generator-economic-tour="filters-panel">
          <DataGeneratorEconomicIndicatorFiltersPanel
            value={filters}
            onChange={setFilters}
            onUnauthorizedChange={setHasFilterUnauthorizedError}
            badge={filterBadge}
            isSubmitting={activeQuery.isFetching}
            onApply={(next) => {
              setAppliedFilters(next);
            }}
          />
        </div>
        {hasFilterUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Filter data generator indikator ekonomi memerlukan sesi login yang aktif"
            body="Sebagian data referensi filter menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk memilih indikator dan rentang tahun."
          />
        ) : null}
        <div data-generator-economic-tour="result-section">
          {!hasFilterUnauthorizedError && hasUnauthorizedError ? (
            <UnauthorizedAccessNotice
              title="Data generator indikator ekonomi memerlukan sesi login yang aktif"
              body="Permintaan ke layanan data generator indikator ekonomi menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat tabel atau visualisasinya."
            />
          ) : (appliedFilters?.outputType ?? filters.outputType) === "chart" ? (
            <DataGeneratorEconomicIndicatorVisualizationSection
              data={visualizationQuery.data ?? null}
              loading={
                visualizationQuery.isLoading || visualizationQuery.isFetching
              }
            />
          ) : (
            <DataGeneratorEconomicIndicatorTableSection
              data={tableQuery.data ?? null}
              loading={tableQuery.isLoading || tableQuery.isFetching}
            />
          )}
        </div>
      </div>
      <GuidedTour
        steps={ECONOMIC_INDICATOR_TOUR_STEPS}
        storageKey="side-data-generator-economic-indicator-tour-completed"
      />
    </div>
  );
}
