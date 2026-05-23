import React from "react";
import { APP_NAME } from "@/constants/app";
import { DataGeneratorInfoBanner } from "@/components/data-generator/DataGeneratorInfoBanner";
import { DataGeneratorInvestmentTableSection } from "@/components/data-generator/DataGeneratorInvestmentTableSection";
import { DataGeneratorInvestmentVisualizationSection } from "@/components/data-generator/DataGeneratorInvestmentVisualizationSection";
import {
  DataGeneratorInvestmentFiltersPanel,
  type DataGeneratorInvestmentFilterValue
} from "@/components/filters/DataGeneratorInvestmentFiltersPanel";
import { useDataGeneratorInvestmentCountriesByGroupQuery } from "@/hooks/data-generator/useDataGeneratorInvestmentMasterQuery";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { useDataGeneratorInvestmentTableQuery } from "@/hooks/data-generator/useDataGeneratorInvestmentTableQuery";
import { useDataGeneratorInvestmentVisualizationQuery } from "@/hooks/data-generator/useDataGeneratorInvestmentVisualizationQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isUnauthorizedApiError } from "@/utils/apiError";

const INVESTMENT_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-generator-investment-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini dipakai untuk membangun hasil data investasi dalam format tabel atau grafik."
  },
  {
    selector: '[data-generator-investment-tour="info-banner"]',
    title: "Informasi generator",
    description:
      "Banner ini menjelaskan cakupan data investasi yang dapat dieksplorasi sebelum filter diterapkan."
  },
  {
    selector: '[data-generator-investment-tour="filters-panel"]',
    title: "Panel filter",
    description:
      "Pilih negara, grup, tipe investasi, rentang tahun, sumber data, dan tipe output, lalu terapkan filter untuk memuat hasil."
  },
  {
    selector: '[data-generator-investment-tour="result-section"]',
    title: "Hasil generator",
    description:
      "Bagian ini menampilkan tabel atau visualisasi investasi sesuai filter yang sudah diterapkan."
  }
];

const DEFAULT_FILTER_VALUE: DataGeneratorInvestmentFilterValue = {
  origins: [],
  originGroup: null,
  destinations: [],
  destinationGroup: null,
  yearFrom: null,
  yearTo: null,
  investmentType: "Inbound",
  source: null,
  outputType: "table"
};

export function DataGeneratorInvestmentPage() {
  useDocumentTitle(`Data Generator Investasi | ${APP_NAME}`);
  const { toast, dismiss } = useToast();
  const [filters, setFilters] =
    React.useState<DataGeneratorInvestmentFilterValue>(DEFAULT_FILTER_VALUE);
  const [appliedFilters, setAppliedFilters] =
    React.useState<DataGeneratorInvestmentFilterValue | null>(null);
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
      investmentType: appliedFilters.investmentType ?? "Inbound",
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
      investmentType: appliedFilters.investmentType ?? "Inbound",
      sourceCode: Number(appliedFilters.source ?? 0),
      yearFrom: Number(appliedFilters.yearFrom ?? 0),
      yearTo: Number(appliedFilters.yearTo ?? 0),
      viewType: "chart" as const
    };
  }, [appliedFilters]);
  const tableQuery = useDataGeneratorInvestmentTableQuery(
    tableParams,
    Boolean(tableParams)
  );
  const visualizationQuery = useDataGeneratorInvestmentVisualizationQuery(
    visualizationParams,
    Boolean(visualizationParams)
  );
  const originGroupCountriesQuery =
    useDataGeneratorInvestmentCountriesByGroupQuery(
      appliedFilters?.originGroup ?? null
    );
  const destinationGroupCountriesQuery =
    useDataGeneratorInvestmentCountriesByGroupQuery(
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
        title: "Memuat data investasi",
        description:
          appliedFilters?.outputType === "chart"
            ? "Visualisasi investasi sedang diambil."
            : "Data generator investasi sedang diambil.",
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
        : "Permintaan data investasi gagal diproses.";
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
      title: "Memuat data investasi gagal",
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
        "Data generator investasi tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-900 lg:px-8">
      <div className="space-y-6">
        <div data-generator-investment-tour="page-title">
          <PageTitle
            title="Data Generator Investasi"
            description="Bangun kombinasi filter investasi lintas negara, grup, tipe investasi, rentang tahun, dan sumber data sebelum hasil tabel atau visualisasi dimuat."
          />
        </div>

        <div data-generator-investment-tour="info-banner">
          <DataGeneratorInfoBanner
            sectorLabel="investasi"
            description="Generator ini disiapkan untuk eksplorasi data investasi berdasarkan negara, grup, tipe investasi, dan sumber data dalam format tabel maupun grafik."
          />
        </div>
        <div data-generator-investment-tour="filters-panel">
          <DataGeneratorInvestmentFiltersPanel
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
            title="Filter data generator investasi memerlukan sesi login yang aktif"
            body="Sebagian data referensi filter menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk memilih negara, grup, tahun, dan sumber data."
          />
        ) : null}
        <div data-generator-investment-tour="result-section">
          {!hasFilterUnauthorizedError && hasUnauthorizedError ? (
            <UnauthorizedAccessNotice
              title="Data generator investasi memerlukan sesi login yang aktif"
              body="Permintaan ke layanan data generator investasi menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat tabel atau visualisasinya."
            />
          ) : (appliedFilters?.outputType ?? filters.outputType) === "chart" ? (
            <DataGeneratorInvestmentVisualizationSection
              data={visualizationQuery.data ?? null}
              loading={
                visualizationQuery.isLoading || visualizationQuery.isFetching
              }
            />
          ) : (
            <DataGeneratorInvestmentTableSection
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
        steps={INVESTMENT_TOUR_STEPS}
        storageKey="side-data-generator-investment-tour-completed"
      />
    </div>
  );
}
