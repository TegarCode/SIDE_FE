import React from "react";
import { APP_NAME } from "@/constants/app";
import { DataGeneratorInfoBanner } from "@/components/data-generator/DataGeneratorInfoBanner";
import { DataGeneratorServiceTableSection } from "@/components/data-generator/DataGeneratorServiceTableSection";
import { DataGeneratorServiceVisualizationSection } from "@/components/data-generator/DataGeneratorServiceVisualizationSection";
import {
  DataGeneratorServiceFiltersPanel,
  type DataGeneratorServiceFilterValue
} from "@/components/filters/DataGeneratorServiceFiltersPanel";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { useDataGeneratorServiceCountriesByGroupQuery } from "@/hooks/data-generator/useDataGeneratorServiceMasterQuery";
import { useDataGeneratorServiceTableQuery } from "@/hooks/data-generator/useDataGeneratorServiceTableQuery";
import { useDataGeneratorServiceVisualizationQuery } from "@/hooks/data-generator/useDataGeneratorServiceVisualizationQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isUnauthorizedApiError } from "@/utils/apiError";

const SERVICE_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-generator-service-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini dipakai untuk membangun hasil data jasa dalam format tabel atau grafik."
  },
  {
    selector: '[data-generator-service-tour="info-banner"]',
    title: "Informasi generator",
    description:
      "Banner ini menjelaskan cakupan data jasa yang dapat dieksplorasi sebelum filter diterapkan."
  },
  {
    selector: '[data-generator-service-tour="filters-panel"]',
    title: "Panel filter",
    description:
      "Pilih negara, grup, jenis kelamin, profesi, rentang tahun, sumber data, dan tipe output, lalu terapkan filter untuk memuat hasil."
  },
  {
    selector: '[data-generator-service-tour="result-section"]',
    title: "Hasil generator",
    description:
      "Bagian ini menampilkan tabel atau visualisasi jasa sesuai filter yang sudah diterapkan."
  }
];

const DEFAULT_FILTER_VALUE: DataGeneratorServiceFilterValue = {
  origins: [],
  originGroup: null,
  destinations: [],
  destinationGroup: null,
  yearFrom: null,
  yearTo: null,
  gender: "all",
  professions: ["all"],
  source: null,
  outputType: "table"
};

function normalizeProfessionValues(values: string[]) {
  if (values.length === 0) return ["all"];
  return values.map((value) =>
    String(value).toLowerCase() === "all" ? "all" : value
  );
}

export function DataGeneratorServicePage() {
  useDocumentTitle(`Data Generator Jasa | ${APP_NAME}`);
  const { toast, dismiss } = useToast();
  const [filters, setFilters] =
    React.useState<DataGeneratorServiceFilterValue>(DEFAULT_FILTER_VALUE);
  const [appliedFilters, setAppliedFilters] =
    React.useState<DataGeneratorServiceFilterValue | null>(null);
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
      sourceCode: Number(appliedFilters.source ?? 0),
      idProfesi: normalizeProfessionValues(appliedFilters.professions),
      gender: appliedFilters.gender ?? "all",
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
      sourceCode: Number(appliedFilters.source ?? 0),
      idProfesi: normalizeProfessionValues(appliedFilters.professions),
      gender: appliedFilters.gender ?? "all",
      yearFrom: Number(appliedFilters.yearFrom ?? 0),
      yearTo: Number(appliedFilters.yearTo ?? 0),
      viewType: "chart" as const
    };
  }, [appliedFilters]);

  const tableQuery = useDataGeneratorServiceTableQuery(
    tableParams,
    Boolean(tableParams)
  );
  const visualizationQuery = useDataGeneratorServiceVisualizationQuery(
    visualizationParams,
    Boolean(visualizationParams)
  );
  const originGroupCountriesQuery =
    useDataGeneratorServiceCountriesByGroupQuery(
      appliedFilters?.originGroup ?? null
    );
  const destinationGroupCountriesQuery =
    useDataGeneratorServiceCountriesByGroupQuery(
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
        title: "Memuat data jasa",
        description:
          appliedFilters?.outputType === "chart"
            ? "Visualisasi jasa sedang diambil."
            : "Data generator jasa sedang diambil.",
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
        : "Permintaan data jasa gagal diproses.";
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
      title: "Memuat data jasa gagal",
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
        "Data generator jasa tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-900 lg:px-8">
      <div className="space-y-6">
        <div data-generator-service-tour="page-title">
          <PageTitle
            title="Data Generator Jasa"
            description="Bangun kombinasi filter jasa lintas negara, grup, rentang tahun, jenis kelamin, profesi, dan sumber data sebelum hasil tabel atau visualisasi dimuat."
          />
        </div>
        <div data-generator-service-tour="info-banner">
          <DataGeneratorInfoBanner
            sectorLabel="jasa"
            description="Generator ini disiapkan untuk eksplorasi data jasa berdasarkan negara, grup, jenis kelamin, profesi, dan sumber data dalam format tabel maupun grafik."
          />
        </div>
        <div data-generator-service-tour="filters-panel">
          <DataGeneratorServiceFiltersPanel
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
            title="Filter data generator jasa memerlukan sesi login yang aktif"
            body="Sebagian data referensi filter menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk memilih negara, grup, profesi, tahun, dan sumber data."
          />
        ) : null}
        <div data-generator-service-tour="result-section">
          {!hasFilterUnauthorizedError && hasUnauthorizedError ? (
            <UnauthorizedAccessNotice
              title="Data generator jasa memerlukan sesi login yang aktif"
              body="Permintaan ke layanan data generator jasa menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat tabel atau visualisasinya."
            />
          ) : (appliedFilters?.outputType ?? filters.outputType) === "chart" ? (
            <DataGeneratorServiceVisualizationSection
              data={visualizationQuery.data ?? null}
              loading={
                visualizationQuery.isLoading || visualizationQuery.isFetching
              }
            />
          ) : (
            <DataGeneratorServiceTableSection
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
        steps={SERVICE_TOUR_STEPS}
        storageKey="side-data-generator-service-tour-completed"
      />
    </div>
  );
}
