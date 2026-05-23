import React from "react";
import { APP_NAME } from "@/constants/app";
import { DataGeneratorInfoBanner } from "@/components/data-generator/DataGeneratorInfoBanner";
import { DataGeneratorTourismTableSection } from "@/components/data-generator/DataGeneratorTourismTableSection";
import { DataGeneratorTourismVisualizationSection } from "@/components/data-generator/DataGeneratorTourismVisualizationSection";
import {
  DataGeneratorTourismFiltersPanel,
  type DataGeneratorTourismFilterValue
} from "@/components/filters/DataGeneratorTourismFiltersPanel";
import { useDataGeneratorTourismCountriesByGroupQuery } from "@/hooks/data-generator/useDataGeneratorTourismMasterQuery";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { useDataGeneratorTourismTableQuery } from "@/hooks/data-generator/useDataGeneratorTourismTableQuery";
import { useDataGeneratorTourismVisualizationQuery } from "@/hooks/data-generator/useDataGeneratorTourismVisualizationQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isUnauthorizedApiError } from "@/utils/apiError";

const TOURISM_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-generator-tourism-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini dipakai untuk membangun hasil data pariwisata dalam format tabel atau grafik."
  },
  {
    selector: '[data-generator-tourism-tour="info-banner"]',
    title: "Informasi generator",
    description:
      "Banner ini menjelaskan cakupan data pariwisata yang dapat dieksplorasi sebelum filter diterapkan."
  },
  {
    selector: '[data-generator-tourism-tour="filters-panel"]',
    title: "Panel filter",
    description:
      "Pilih negara, grup, jenis data, rentang tahun, sumber data, dan tipe output, lalu terapkan filter untuk memuat hasil."
  },
  {
    selector: '[data-generator-tourism-tour="result-section"]',
    title: "Hasil generator",
    description:
      "Bagian ini menampilkan tabel atau visualisasi pariwisata sesuai filter yang sudah diterapkan."
  }
];

const DEFAULT_FILTER_VALUE: DataGeneratorTourismFilterValue = {
  origins: [],
  originGroup: null,
  destinations: [],
  destinationGroup: null,
  yearFrom: null,
  yearTo: null,
  typeData: "Jumlah_Wisatawan",
  source: null,
  outputType: "table"
};

export function DataGeneratorTourismPage() {
  useDocumentTitle(`Data Generator Pariwisata | ${APP_NAME}`);
  const { toast, dismiss } = useToast();
  const [filters, setFilters] =
    React.useState<DataGeneratorTourismFilterValue>(DEFAULT_FILTER_VALUE);
  const [appliedFilters, setAppliedFilters] =
    React.useState<DataGeneratorTourismFilterValue | null>(null);
  const [hasFilterUnauthorizedError, setHasFilterUnauthorizedError] =
    React.useState(false);
  const filterBadge = React.useMemo(() => {
    if (!appliedFilters) return "Filter belum diterapkan";
    return JSON.stringify(filters) === JSON.stringify(appliedFilters)
      ? "Filter Aktif"
      : "Filter belum diterapkan";
  }, [appliedFilters, filters]);

  const tableParams = React.useMemo(() => {
    if (!appliedFilters || appliedFilters.outputType !== "table") return null;
    return {
      origins: appliedFilters.origins,
      destinations: appliedFilters.destinations,
      originGroups: appliedFilters.originGroup
        ? [appliedFilters.originGroup]
        : [],
      destinationGroups: appliedFilters.destinationGroup
        ? [appliedFilters.destinationGroup]
        : [],
      typeData: appliedFilters.typeData ?? "Jumlah_Wisatawan",
      sourceCode: Number(appliedFilters.source ?? 0),
      yearFrom: Number(appliedFilters.yearFrom ?? 0),
      yearTo: Number(appliedFilters.yearTo ?? 0),
      viewType: "table" as const
    };
  }, [appliedFilters]);

  const visualizationParams = React.useMemo(() => {
    if (!appliedFilters || appliedFilters.outputType !== "chart") return null;
    return {
      origins: appliedFilters.origins,
      destinations: appliedFilters.destinations,
      originGroups: appliedFilters.originGroup
        ? [appliedFilters.originGroup]
        : [],
      destinationGroups: appliedFilters.destinationGroup
        ? [appliedFilters.destinationGroup]
        : [],
      typeData: appliedFilters.typeData ?? "Jumlah_Wisatawan",
      sourceCode: Number(appliedFilters.source ?? 0),
      yearFrom: Number(appliedFilters.yearFrom ?? 0),
      yearTo: Number(appliedFilters.yearTo ?? 0),
      viewType: "chart" as const
    };
  }, [appliedFilters]);

  const tableQuery = useDataGeneratorTourismTableQuery(
    tableParams,
    Boolean(tableParams)
  );
  const visualizationQuery = useDataGeneratorTourismVisualizationQuery(
    visualizationParams,
    Boolean(visualizationParams)
  );
  const originGroupCountriesQuery =
    useDataGeneratorTourismCountriesByGroupQuery(
      appliedFilters?.originGroup ?? null
    );
  const destinationGroupCountriesQuery =
    useDataGeneratorTourismCountriesByGroupQuery(
      appliedFilters?.destinationGroup ?? null
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
        title: "Memuat data pariwisata",
        description:
          appliedFilters?.outputType === "chart"
            ? "Visualisasi pariwisata sedang diambil."
            : "Data generator pariwisata sedang diambil.",
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
        : "Permintaan data pariwisata gagal diproses.";
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
      title: "Memuat data pariwisata gagal",
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
        "Data generator pariwisata tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-900 lg:px-8">
      <div className="space-y-6">
        <div data-generator-tourism-tour="page-title">
          <PageTitle
            title="Data Generator Pariwisata"
            description="Bangun kombinasi filter pariwisata lintas negara, grup, jenis data, rentang tahun, dan sumber data sebelum hasil tabel atau visualisasi dimuat."
          />
        </div>

        <div data-generator-tourism-tour="info-banner">
          <DataGeneratorInfoBanner
            sectorLabel="pariwisata"
            description="Generator ini disiapkan untuk eksplorasi data pariwisata berdasarkan negara, grup, jenis data, dan sumber data dalam format tabel maupun grafik."
          />
        </div>
        <div data-generator-tourism-tour="filters-panel">
          <DataGeneratorTourismFiltersPanel
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
            title="Filter data generator pariwisata memerlukan sesi login yang aktif"
            body="Sebagian data referensi filter menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk memilih negara, grup, tahun, dan sumber data."
          />
        ) : null}
        <div data-generator-tourism-tour="result-section">
          {!hasFilterUnauthorizedError && hasUnauthorizedError ? (
            <UnauthorizedAccessNotice
              title="Data generator pariwisata memerlukan sesi login yang aktif"
              body="Permintaan ke layanan data generator pariwisata menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat tabel atau visualisasinya."
            />
          ) : (appliedFilters?.outputType ?? filters.outputType) === "chart" ? (
            <DataGeneratorTourismVisualizationSection
              data={visualizationQuery.data ?? null}
              loading={
                visualizationQuery.isLoading || visualizationQuery.isFetching
              }
            />
          ) : (
            <DataGeneratorTourismTableSection
              data={tableQuery.data ?? null}
              loading={tableQuery.isLoading || tableQuery.isFetching}
              originTooltipItems={originGroupCountriesQuery.data ?? undefined}
              destinationTooltipItems={
                destinationGroupCountriesQuery.data ?? undefined
              }
            />
          )}
        </div>
      </div>
      <GuidedTour
        steps={TOURISM_TOUR_STEPS}
        storageKey="side-data-generator-tourism-tour-completed"
      />
    </div>
  );
}
