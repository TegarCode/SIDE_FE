import React from "react";
import { InfrastrukturFiltersPanel } from "@/components/filters/InfrastrukturFiltersPanel";
import { InfrastrukturOverview } from "@/components/indonesia/infrastruktur/InfrastrukturOverview";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { APP_NAME } from "@/constants/app";
import { useInfrastrukturMasterQuery } from "@/hooks/indonesia/useInfrastrukturMasterQuery";
import { useInfrastrukturPameranIndonesiaQuery } from "@/hooks/indonesia/useInfrastrukturPameranIndonesiaQuery";
import { useInfrastrukturPameranPerwakilanQuery } from "@/hooks/indonesia/useInfrastrukturPameranPerwakilanQuery";
import { useInfrastrukturPerjanjianAntarNegaraQuery } from "@/hooks/indonesia/useInfrastrukturPerjanjianAntarNegaraQuery";
import { useInfrastrukturPerwakilanAsingQuery } from "@/hooks/indonesia/useInfrastrukturPerwakilanAsingQuery";
import { useInfrastrukturPerwakilanQuery } from "@/hooks/indonesia/useInfrastrukturPerwakilanQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type {
  InfrastrukturFilterState,
  InfrastrukturPameranIndonesiaParams,
  InfrastrukturPameranPerwakilanParams,
  InfrastrukturPerjanjianAntarNegaraParams,
  InfrastrukturPerwakilanAsingParams,
  InfrastrukturPerwakilanParams,
  InfrastrukturTabSlug
} from "@/type/indonesiaInfrastruktur";
import { isUnauthorizedApiError } from "@/utils/apiError";

const INFRASTRUKTUR_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: "[data-infrastruktur-tour='page-title']",
    title: "Pahami konteks halaman",
    description:
      "Mulai dari judul dan deskripsi ini untuk memahami bahwa halaman ini berisi peta dan direktori infrastruktur diplomasi ekonomi."
  },
  {
    selector: "[data-infrastruktur-tour='filters-panel']",
    title: "Atur wilayah dan kategori",
    description:
      "Pilih region, subregion, dan kategori data agar tampilan peta serta daftar infrastruktur sesuai fokus analisis."
  },
  {
    selector: "[data-infrastruktur-tour='summary-cards']",
    title: "Lihat kartu ringkasan",
    description:
      "Bagian ini menampilkan jumlah infrastruktur per kategori agar user cepat menangkap distribusi utamanya."
  },
  {
    selector: "[data-infrastruktur-tour='map-panel']",
    title: "Baca peta persebaran",
    description:
      "Peta ini membantu melihat lokasi persebaran perwakilan dan infrastruktur diplomasi secara spasial."
  },
  {
    selector: "[data-infrastruktur-tour='tabs-section']",
    title: "Pilih tab infrastruktur",
    description:
      "Gunakan tab untuk berpindah antara perwakilan, pameran, dan perjanjian antar negara sesuai kebutuhan."
  },
  {
    selector: "[data-infrastruktur-tour='tab-content']",
    title: "Telusuri isi tab",
    description:
      "Di bagian ini user bisa membaca detail tabel, kartu, dan informasi lanjutan dari tab yang sedang aktif."
  }
];

export function IndonesiaInfrastrukturPage() {
  useDocumentTitle(`Infrastruktur Diplomasi | ${APP_NAME}`);

  const { toast, dismiss } = useToast();
  const masterQuery = useInfrastrukturMasterQuery();
  const [activeTab, setActiveTab] = React.useState<InfrastrukturTabSlug>(
    "perwakilan_indonesia"
  );
  const [filters, setFilters] = React.useState<InfrastrukturFilterState>({
    region: null,
    subregion: null,
    categories: []
  });
  const hasInitializedFiltersRef = React.useRef(false);
  const lastLoadedToastRef = React.useRef("");
  const loadingToastIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!masterQuery.data || hasInitializedFiltersRef.current) return;
    hasInitializedFiltersRef.current = true;
    setFilters((current) => ({
      region: current.region,
      subregion: current.subregion,
      categories:
        current.categories.length > 0
          ? current.categories
          : masterQuery.data.categoryOptions.map((item) => item.value)
    }));
  }, [masterQuery.data]);

  const handleReset = React.useCallback(() => {
    setFilters({
      region: null,
      subregion: null,
      categories:
        masterQuery.data?.categoryOptions.map((item) => item.value) ?? []
    });
  }, [masterQuery.data?.categoryOptions]);

  const wilayahParams = React.useMemo(() => {
    const allSubregions = masterQuery.data?.subregionOptions ?? [];
    if (filters.subregion) return [filters.subregion];
    if (filters.region) {
      return allSubregions
        .filter((item) => item.regionValue === filters.region)
        .map((item) => item.value);
    }
    return allSubregions.map((item) => item.value);
  }, [filters.region, filters.subregion, masterQuery.data?.subregionOptions]);

  const overviewParams =
    React.useMemo<InfrastrukturPerwakilanParams | null>(() => {
      if (!wilayahParams.length || !filters.categories.length) return null;
      return {
        wilayah: wilayahParams,
        categories: filters.categories
      };
    }, [filters.categories, wilayahParams]);

  const overviewQuery = useInfrastrukturPerwakilanQuery(
    overviewParams,
    Boolean(overviewParams)
  );
  const foreignOverviewParams =
    React.useMemo<InfrastrukturPerwakilanAsingParams | null>(() => {
      if (!wilayahParams.length) return null;
      return { wilayah: wilayahParams };
    }, [wilayahParams]);
  const foreignOverviewQuery = useInfrastrukturPerwakilanAsingQuery(
    foreignOverviewParams,
    activeTab === "perwakilan_asing_di_indonesia" &&
      Boolean(foreignOverviewParams)
  );
  const expoOverviewParams =
    React.useMemo<InfrastrukturPameranIndonesiaParams | null>(() => {
      if (!wilayahParams.length) return null;
      return { wilayah: wilayahParams };
    }, [wilayahParams]);
  const expoOverviewQuery = useInfrastrukturPameranIndonesiaQuery(
    expoOverviewParams,
    activeTab === "pameran_di_indonesia" && Boolean(expoOverviewParams)
  );
  const repExpoOverviewParams =
    React.useMemo<InfrastrukturPameranPerwakilanParams | null>(() => {
      if (!wilayahParams.length) return null;
      return { wilayah: wilayahParams };
    }, [wilayahParams]);
  const repExpoOverviewQuery = useInfrastrukturPameranPerwakilanQuery(
    repExpoOverviewParams,
    activeTab === "pameran_di_perwakilan" && Boolean(repExpoOverviewParams)
  );
  const agreementOverviewParams =
    React.useMemo<InfrastrukturPerjanjianAntarNegaraParams | null>(() => {
      if (!wilayahParams.length) return null;
      return { wilayah: wilayahParams };
    }, [wilayahParams]);
  const agreementOverviewQuery = useInfrastrukturPerjanjianAntarNegaraQuery(
    agreementOverviewParams,
    activeTab === "perjanjian_antar_negara" && Boolean(agreementOverviewParams)
  );
  const hasUnauthorizedError =
    isUnauthorizedApiError(masterQuery.error) ||
    isUnauthorizedApiError(overviewQuery.error) ||
    isUnauthorizedApiError(foreignOverviewQuery.error) ||
    isUnauthorizedApiError(expoOverviewQuery.error) ||
    isUnauthorizedApiError(repExpoOverviewQuery.error) ||
    isUnauthorizedApiError(agreementOverviewQuery.error);
  const activeTabLabel = React.useMemo(() => {
    switch (activeTab) {
      case "perwakilan_indonesia":
        return "Perwakilan Indonesia";
      case "perwakilan_asing_di_indonesia":
        return "Perwakilan Asing di Indonesia";
      case "pameran_di_indonesia":
        return "Pameran di Indonesia";
      case "pameran_di_perwakilan":
        return "Pameran di Perwakilan";
      case "perjanjian_antar_negara":
        return "Perjanjian Antar Negara";
      default:
        return "Infrastruktur Diplomasi";
    }
  }, [activeTab]);
  const activeRequestState = React.useMemo(() => {
    if (activeTab === "perwakilan_indonesia") {
      return {
        isFetching: overviewQuery.isFetching,
        isSuccess: overviewQuery.isSuccess
      };
    }
    if (activeTab === "perwakilan_asing_di_indonesia") {
      return {
        isFetching: foreignOverviewQuery.isFetching,
        isSuccess: foreignOverviewQuery.isSuccess
      };
    }
    if (activeTab === "pameran_di_indonesia") {
      return {
        isFetching: expoOverviewQuery.isFetching,
        isSuccess: expoOverviewQuery.isSuccess
      };
    }
    if (activeTab === "pameran_di_perwakilan") {
      return {
        isFetching: repExpoOverviewQuery.isFetching,
        isSuccess: repExpoOverviewQuery.isSuccess
      };
    }
    return {
      isFetching: agreementOverviewQuery.isFetching,
      isSuccess: agreementOverviewQuery.isSuccess
    };
  }, [
    activeTab,
    agreementOverviewQuery.isFetching,
    agreementOverviewQuery.isSuccess,
    expoOverviewQuery.isFetching,
    expoOverviewQuery.isSuccess,
    foreignOverviewQuery.isFetching,
    foreignOverviewQuery.isSuccess,
    overviewQuery.isFetching,
    overviewQuery.isSuccess,
    repExpoOverviewQuery.isFetching,
    repExpoOverviewQuery.isSuccess
  ]);
  const toastLoadKey = React.useMemo(() => {
    if (!wilayahParams.length) return "";
    const wilayahKey = [...wilayahParams].sort().join("|");
    const categoryKey = [...filters.categories].sort().join("|");
    return `${activeTab}-${wilayahKey}-${categoryKey}`;
  }, [activeTab, filters.categories, wilayahParams]);

  React.useEffect(() => {
    if (!toastLoadKey) return;

    if (masterQuery.isFetching || activeRequestState.isFetching) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: "Memuat data infrastruktur",
        description: `Tab ${activeTabLabel} sedang diproses...`,
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [
    activeRequestState.isFetching,
    activeTabLabel,
    dismiss,
    masterQuery.isFetching,
    toast,
    toastLoadKey
  ]);

  React.useEffect(() => {
    if (!toastLoadKey) return;
    if (!masterQuery.isSuccess || !activeRequestState.isSuccess) return;
    if (masterQuery.isFetching || activeRequestState.isFetching) return;
    if (lastLoadedToastRef.current === toastLoadKey) return;

    lastLoadedToastRef.current = toastLoadKey;
    toast({
      title: "Data infrastruktur siap",
      description: `Tab ${activeTabLabel} selesai dimuat.`,
      tone: "success",
      durationMs: 2200
    });
  }, [
    activeRequestState.isFetching,
    activeRequestState.isSuccess,
    activeTabLabel,
    masterQuery.isFetching,
    masterQuery.isSuccess,
    toast,
    toastLoadKey
  ]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data infrastruktur diplomasi tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-infrastruktur-tour="page-title">
          <PageTitle
            title="Infrastruktur Diplomasi Ekonomi"
            description="Peta & direktori perwakilan, promosi dagang/investasi, serta entitas BUMN Indonesia di luar negeri."
          />
        </div>

        <div data-infrastruktur-tour="filters-panel">
          <InfrastrukturFiltersPanel
            regionOptions={masterQuery.data?.regionOptions ?? []}
            subregionOptions={masterQuery.data?.subregionOptions ?? []}
            categoryOptions={masterQuery.data?.categoryOptions ?? []}
            value={filters}
            loading={masterQuery.isLoading}
            requestLoading={masterQuery.isFetching}
            onSubmit={setFilters}
            onReset={handleReset}
          />
        </div>

        {hasUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Data infrastruktur diplomasi memerlukan sesi login yang aktif"
            body="Salah satu permintaan layanan infrastruktur menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat peta, tab, dan data pendukungnya."
          />
        ) : masterQuery.error instanceof Error ? (
          <FilterFallbackCard
            title="Master infrastruktur gagal dimuat"
            body={masterQuery.error.message}
          />
        ) : (
          <div data-infrastruktur-tour="overview-panel">
            <InfrastrukturOverview
              overview={overviewQuery.data ?? null}
              foreignOverview={foreignOverviewQuery.data ?? null}
              expoOverview={expoOverviewQuery.data ?? null}
              repExpoOverview={repExpoOverviewQuery.data ?? null}
              agreementOverview={agreementOverviewQuery.data ?? null}
              loading={overviewQuery.isLoading || overviewQuery.isFetching}
              foreignLoading={
                foreignOverviewQuery.isLoading ||
                foreignOverviewQuery.isFetching
              }
              expoLoading={
                expoOverviewQuery.isLoading || expoOverviewQuery.isFetching
              }
              repExpoLoading={
                repExpoOverviewQuery.isLoading ||
                repExpoOverviewQuery.isFetching
              }
              agreementLoading={
                agreementOverviewQuery.isLoading ||
                agreementOverviewQuery.isFetching
              }
              error={
                overviewQuery.error instanceof Error
                  ? overviewQuery.error.message
                  : null
              }
              foreignError={
                foreignOverviewQuery.error instanceof Error
                  ? foreignOverviewQuery.error.message
                  : null
              }
              expoError={
                expoOverviewQuery.error instanceof Error
                  ? expoOverviewQuery.error.message
                  : null
              }
              repExpoError={
                repExpoOverviewQuery.error instanceof Error
                  ? repExpoOverviewQuery.error.message
                  : null
              }
              agreementError={
                agreementOverviewQuery.error instanceof Error
                  ? agreementOverviewQuery.error.message
                  : null
              }
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        )}
      </div>

      <GuidedTour
        steps={INFRASTRUKTUR_TOUR_STEPS}
        storageKey="side-infrastruktur-tour-completed"
        launcherLabel="Tur Halaman"
        coachmarkLabel="Panduan halaman"
        spotlightZIndex={1600}
        coachmarkZIndex={1700}
      />
    </div>
  );
}
