import React from "react";
import { IndikatorEkonomiFiltersPanel } from "@/components/filters/IndikatorEkonomiFiltersPanel";
import { IndikatorEkonomiOverview } from "@/components/indonesia/indikator-ekonomi/IndikatorEkonomiOverview";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { APP_NAME } from "@/constants/app";
import { useIndikatorEkonomiMasterQuery } from "@/hooks/indonesia/useIndikatorEkonomiMasterQuery";
import { useIndikatorEkonomiOverviewQuery } from "@/hooks/indonesia/useIndikatorEkonomiOverviewQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  EconomicIndicatorFilterState,
  EconomicIndicatorOverviewParams
} from "@/type/indonesiaIndikatorEkonomi";
import { isUnauthorizedApiError } from "@/utils/apiError";

const INDIKATOR_EKONOMI_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: "[data-indikator-tour='page-title']",
    title: "Pahami konteks indikator",
    description:
      "Mulai dari judul dan deskripsi ini untuk memahami bahwa halaman ini berfokus pada indikator makroekonomi dan daya saing."
  },
  {
    selector: "[data-indikator-tour='filters-panel']",
    title: "Pilih indikator dan tahun",
    description:
      "Tentukan indikator serta tahun yang ingin dianalisis. Filter ini mengendalikan seluruh isi visualisasi di bawahnya."
  },
  {
    selector: "[data-indikator-tour='overview-panel']",
    title: "Baca overview dan visualisasi",
    description:
      "Bagian ini menampilkan gambaran posisi Indonesia, tren, dan perbandingan antarnegara untuk indikator yang dipilih."
  }
];

export function IndonesiaIndikatorEkonomiPage() {
  useDocumentTitle(`Indikator Ekonomi | ${APP_NAME}`);

  const { toast, dismiss } = useToast();
  const masterQuery = useIndikatorEkonomiMasterQuery();
  const [filters, setFilters] = React.useState<EconomicIndicatorFilterState>({
    year: null,
    indicatorId: null
  });
  const hasInitializedFiltersRef = React.useRef(false);
  const lastLoadedToastRef = React.useRef("");
  const loadingToastIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!masterQuery.data || hasInitializedFiltersRef.current) return;
    const nextYear = masterQuery.data.yearOptions[0]?.value ?? null;
    const nextIndicatorId = masterQuery.data.indicatorOptions[0]?.value ?? null;

    hasInitializedFiltersRef.current = true;
    setFilters((current) => {
      if (current.year === nextYear && current.indicatorId === nextIndicatorId)
        return current;
      return {
        year: nextYear,
        indicatorId: nextIndicatorId
      };
    });
  }, [masterQuery.data]);

  const overviewParams =
    React.useMemo<EconomicIndicatorOverviewParams | null>(() => {
      if (!filters.year || !filters.indicatorId) return null;
      const numericYear = Number(filters.year);
      if (!Number.isFinite(numericYear)) return null;
      return {
        indicator_id: filters.indicatorId,
        year: numericYear
      };
    }, [filters.indicatorId, filters.year]);
  const overviewQuery = useIndikatorEkonomiOverviewQuery(
    overviewParams,
    Boolean(overviewParams)
  );
  const hasUnauthorizedError =
    isUnauthorizedApiError(masterQuery.error) ||
    isUnauthorizedApiError(overviewQuery.error);
  const requestLoading = masterQuery.isFetching || overviewQuery.isFetching;
  const selectedIndicatorLabel = React.useMemo(
    () =>
      masterQuery.data?.indicatorOptions.find(
        (item) => item.value === filters.indicatorId
      )?.label ?? "indikator ekonomi",
    [filters.indicatorId, masterQuery.data?.indicatorOptions]
  );
  const toastLoadKey = React.useMemo(() => {
    if (!overviewParams) return "";
    return `${overviewParams.indicator_id}-${overviewParams.year}`;
  }, [overviewParams]);

  React.useEffect(() => {
    if (!toastLoadKey) return;

    if (requestLoading) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Memuat data indikator ekonomi",
        description: `${selectedIndicatorLabel} sedang diproses...`,
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [dismiss, requestLoading, selectedIndicatorLabel, toast, toastLoadKey]);

  React.useEffect(() => {
    if (!toastLoadKey) return;
    if (!masterQuery.isSuccess || !overviewQuery.isSuccess) return;
    if (overviewQuery.isFetching) return;
    if (lastLoadedToastRef.current === toastLoadKey) return;

    lastLoadedToastRef.current = toastLoadKey;
    toast({
      title: "Data indikator ekonomi siap",
      description: `${selectedIndicatorLabel} selesai dimuat.`,
      tone: "success",
      durationMs: 2200
    });
  }, [
    masterQuery.isSuccess,
    overviewQuery.isFetching,
    overviewQuery.isSuccess,
    selectedIndicatorLabel,
    toast,
    toastLoadKey
  ]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data indikator ekonomi tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-indikator-tour="page-title">
          <PageTitle
            title="Indikator Ekonomi dan Daya Saing"
            description="Data Makroekonomi dan Daya Saing utama dalam diplomasi ekonomi. Pilih indikator & tahun untuk melihat 5 tahun terakhir (rata-rata per tahun) per negara dan posisi Indonesia."
          />
        </div>

        <div data-indikator-tour="filters-panel">
          <IndikatorEkonomiFiltersPanel
            yearOptions={masterQuery.data?.yearOptions ?? []}
            indicatorOptions={masterQuery.data?.indicatorOptions ?? []}
            value={filters}
            loading={masterQuery.isLoading}
            requestLoading={masterQuery.isFetching}
            onSubmit={setFilters}
            onReset={() =>
              setFilters({
                year: masterQuery.data?.yearOptions[0]?.value ?? null,
                indicatorId:
                  masterQuery.data?.indicatorOptions[0]?.value ?? null
              })
            }
          />
        </div>

        {hasUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Data indikator ekonomi memerlukan sesi login yang aktif"
            body="Permintaan ke layanan indikator ekonomi menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat data dan visualisasinya."
          />
        ) : masterQuery.error instanceof Error ? (
          <FilterFallbackCard
            title="Master indikator ekonomi gagal dimuat"
            body={masterQuery.error.message}
          />
        ) : (
          <div data-indikator-tour="overview-panel">
            <IndikatorEkonomiOverview
              overview={overviewQuery.data ?? null}
              loading={requestLoading}
              error={
                overviewQuery.error instanceof Error
                  ? overviewQuery.error.message
                  : null
              }
            />
          </div>
        )}
      </div>

      <GuidedTour
        steps={INDIKATOR_EKONOMI_TOUR_STEPS}
        storageKey="side-indikator-ekonomi-tour-completed"
        launcherLabel="Tur Halaman"
        coachmarkLabel="Panduan halaman"
        spotlightZIndex={1600}
        coachmarkZIndex={1700}
      />
    </div>
  );
}
