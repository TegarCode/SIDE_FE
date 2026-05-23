import React from "react";
import { APP_NAME } from "@/constants/app";
import { DataGeneratorTradeTableSection } from "@/components/data-generator/DataGeneratorTradeTableSection";
import { DataGeneratorTradeVisualizationSection } from "@/components/data-generator/DataGeneratorTradeVisualizationSection";
import { DataGeneratorInfoBanner } from "@/components/data-generator/DataGeneratorInfoBanner";
import {
  DataGeneratorTradeFiltersPanel,
  type DataGeneratorTradeFilterValue
} from "@/components/filters/DataGeneratorTradeFiltersPanel";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { useDataGeneratorTradeTableQuery } from "@/hooks/data-generator/useDataGeneratorTradeTableQuery";
import { useDataGeneratorTradeVisualizationQuery } from "@/hooks/data-generator/useDataGeneratorTradeVisualizationQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isUnauthorizedApiError } from "@/utils/apiError";

const TRADE_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-generator-trade-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini dipakai untuk membangun hasil data perdagangan dalam format tabel atau grafik."
  },
  {
    selector: '[data-generator-trade-tour="info-banner"]',
    title: "Informasi generator",
    description:
      "Banner ini menjelaskan cakupan data perdagangan yang dapat dieksplorasi sebelum filter diterapkan."
  },
  {
    selector: '[data-generator-trade-tour="filters-panel"]',
    title: "Panel filter",
    description:
      "Pilih negara, grup, tipe perdagangan, HS code, rentang tahun, sumber data, dan tipe output, lalu terapkan filter untuk memuat hasil."
  },
  {
    selector: '[data-generator-trade-tour="result-section"]',
    title: "Hasil generator",
    description:
      "Bagian ini menampilkan tabel atau visualisasi perdagangan sesuai filter yang sudah diterapkan."
  }
];

const DEFAULT_FILTER_VALUE: DataGeneratorTradeFilterValue = {
  origins: [],
  originGroup: null,
  destinations: [],
  destinationGroup: null,
  yearFrom: null,
  yearTo: null,
  tradeType: "Export",
  hsLevel: "4",
  hsCodes: [],
  source: null,
  outputType: "table"
};

export function DataGeneratorTradePage() {
  useDocumentTitle(`Data Generator Perdagangan | ${APP_NAME}`);
  const { toast, dismiss } = useToast();

  const [filters, setFilters] =
    React.useState<DataGeneratorTradeFilterValue>(DEFAULT_FILTER_VALUE);
  const [appliedFilters, setAppliedFilters] =
    React.useState<DataGeneratorTradeFilterValue | null>(null);
  const [hasFilterUnauthorizedError, setHasFilterUnauthorizedError] =
    React.useState(false);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState("50");
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
      tradeType: appliedFilters.tradeType ?? "Export",
      hsLevel: Number(appliedFilters.hsLevel ?? "4"),
      product: appliedFilters.hsCodes.includes("ALL")
        ? ["all"]
        : appliedFilters.hsCodes,
      yearFrom: appliedFilters.yearFrom ?? "",
      yearTo: appliedFilters.yearTo ?? "",
      source: appliedFilters.source ?? "",
      viewType: "table" as const,
      page,
      perPage: Number(perPage)
    };
  }, [appliedFilters, page, perPage]);

  const tableQuery = useDataGeneratorTradeTableQuery(
    tableParams,
    Boolean(tableParams)
  );
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
      tradeType: appliedFilters.tradeType ?? "Export",
      hsLevel: Number(appliedFilters.hsLevel ?? "4"),
      product: appliedFilters.hsCodes.includes("ALL")
        ? ["all"]
        : appliedFilters.hsCodes,
      yearFrom: appliedFilters.yearFrom ?? "",
      yearTo: appliedFilters.yearTo ?? "",
      source: appliedFilters.source ?? "",
      viewType: "chart" as const
    };
  }, [appliedFilters]);

  const visualizationQuery = useDataGeneratorTradeVisualizationQuery(
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
        title: "Memuat data perdagangan",
        description:
          appliedFilters?.outputType === "chart"
            ? "Visualisasi perdagangan sedang diambil."
            : "Data generator perdagangan sedang diambil.",
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
        : "Permintaan data perdagangan gagal diproses.";
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
      title: "Memuat data perdagangan gagal",
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
        "Data generator perdagangan tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-900 lg:px-8">
      <div className="space-y-6">
        <div data-generator-trade-tour="page-title">
          <PageTitle
            title="Data Generator Perdagangan"
            description="Bangun kombinasi filter perdagangan lintas negara, grup, tipe perdagangan, HS code, dan sumber data sebelum hasil tabel atau grafik disambungkan ke endpoint."
          />
        </div>

        <div data-generator-trade-tour="info-banner">
          <DataGeneratorInfoBanner
            sectorLabel="perdagangan"
            description="Generator ini disiapkan untuk eksplorasi data perdagangan lintas negara, grup, tipe perdagangan, HS code, dan sumber data dalam format tabel maupun grafik."
          />
        </div>

        <div data-generator-trade-tour="filters-panel">
          <DataGeneratorTradeFiltersPanel
            value={filters}
            onChange={setFilters}
            onUnauthorizedChange={setHasFilterUnauthorizedError}
            badge={filterBadge}
            isSubmitting={activeQuery.isFetching}
            onApply={(next) => {
              setAppliedFilters(next);
              setPage(1);
            }}
          />
        </div>
        {hasFilterUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Filter data generator perdagangan memerlukan sesi login yang aktif"
            body="Sebagian data referensi filter menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk memilih negara, grup, HS code, dan sumber data."
          />
        ) : null}

        <div data-generator-trade-tour="result-section">
          {!hasFilterUnauthorizedError && hasUnauthorizedError ? (
            <UnauthorizedAccessNotice
              title="Data generator perdagangan memerlukan sesi login yang aktif"
              body="Permintaan ke layanan data generator perdagangan menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat tabel atau visualisasinya."
            />
          ) : (appliedFilters?.outputType ?? filters.outputType) === "chart" ? (
            <DataGeneratorTradeVisualizationSection
              data={visualizationQuery.data ?? null}
              loading={
                visualizationQuery.isLoading || visualizationQuery.isFetching
              }
              yearFrom={appliedFilters?.yearFrom ?? filters.yearFrom}
              yearTo={appliedFilters?.yearTo ?? filters.yearTo}
            />
          ) : (
            <DataGeneratorTradeTableSection
              data={tableQuery.data ?? null}
              loading={tableQuery.isLoading || tableQuery.isFetching}
              mode={appliedFilters?.outputType ?? filters.outputType}
              page={page}
              perPage={perPage}
              onPageChange={setPage}
              onPerPageChange={(next) => {
                setPerPage(next);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>
      <GuidedTour
        steps={TRADE_TOUR_STEPS}
        storageKey="side-data-generator-trade-tour-completed"
      />
    </div>
  );
}
