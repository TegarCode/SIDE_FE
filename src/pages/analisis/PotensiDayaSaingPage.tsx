import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { APP_NAME } from "@/constants/app";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { AnalisisPotensiRcaCmsaCalcSection } from "@/components/analisis/potensi-daya-saing/AnalisisPotensiRcaCmsaCalcSection";
import { AnalisisPotensiRcaCmsaOverviewSection } from "@/components/analisis/potensi-daya-saing/AnalisisPotensiRcaCmsaOverviewSection";
import { OriginSingleDestinationSingleFiltersPanel } from "@/components/filters/OriginSingleDestinationSingleFiltersPanel";
import { Button } from "@/components/ui/Button";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { useAnalisisPotensiDayaSaingQuery } from "@/hooks/analisis/useAnalisisPotensiDayaSaingQuery";
import { useAnalisisRcaEpdXModelOptionsQuery } from "@/hooks/analisis/useAnalisisRcaEpdXModelOptionsQuery";
import AnalisisPotensiRCAEPDComparisonSection from "@/components/analisis/potensi-daya-saing/AnalisisPotensiRCAEPDComparisonSection";
import AnalisisPotensiRSCATBIComparisonSection from "@/components/analisis/potensi-daya-saing/AnalisisPotensiRSCATBIComparisonSection";
import RcaEpdSection from "@/components/analisis/potensi-daya-saing/RcaEpdSection";
import RscaTbiSection from "@/components/analisis/potensi-daya-saing/RscaTbiSection";
import {
  useCommonCountriesQuery,
  useCommonCountriesRcaCmsaQuery
} from "@/hooks/indonesia/useCountryGeoQueries";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  fetchMitraWilayah,
  normalizeCountriesFromCommon
} from "@/service/mitra/master";
import { useQuery } from "@tanstack/react-query";
import type {
  AnalisisRcaEpdCalculationResult,
  AnalisisRcaEpdComparisonResult,
  AnalisisRcaEpdResult,
  AnalisisPotensiDayaSaingCalculationResult,
  AnalisisPotensiDayaSaingOverviewResult,
  AnalisisRscaTbiCalculationResult,
  AnalisisRscaTbiComparisonResult,
  AnalisisRscaTbiResult
} from "@/type/analisis";
import { isUnauthorizedApiError } from "@/utils/apiError";
import type { OriginSingleDestinationSingleFilterValue } from "@/validators/originSingleDestinationSingleFilters";

const POTENSI_DAYA_SAING_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-analisis-potensi-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini menampilkan analisis potensi dan daya saing Indonesia terhadap negara tujuan terpilih."
  },
  {
    selector: '[data-analisis-potensi-tour="guide-button"]',
    title: "Pedoman RCA-CMSA",
    description:
      "Gunakan tombol ini untuk membuka pedoman RCA-CMSA sebagai referensi metodologi analisis."
  },
  {
    selector: '[data-analisis-potensi-tour="filters-panel"]',
    title: "Filter negara asal dan tujuan",
    description:
      "Pilih negara tujuan untuk memperbarui hasil analisis RCA dan CMSA. Negara asal dikunci ke Indonesia."
  },
  {
    selector: '[data-analisis-potensi-tour="tabs-section"]',
    title: "Tab analisis",
    description:
      "Pindah tab untuk melihat overview RCA-CMSA atau rincian perhitungan RCA-CMSA."
  },
  {
    selector: '[data-analisis-potensi-tour="result-section"]',
    title: "Hasil analisis",
    description:
      "Bagian ini menampilkan hasil sesuai tab aktif dan filter negara yang sedang dipilih."
  }
];

const RSCA_HS_LEVEL_OPTIONS = [4, 6] as const;
const RCA_EPD_HS_LEVEL_OPTIONS = RSCA_HS_LEVEL_OPTIONS;
type RscaHsLevel = (typeof RSCA_HS_LEVEL_OPTIONS)[number];
type RcaEpdHsLevel = RscaHsLevel;
type AnalysisType = "rca" | "rsca" | "rca_epd";

function buildDefaultFilters(
  originCountryOptions: Array<{
    value: string;
    label?: string;
  }>,
  destinationCountryOptions: Array<{
    value: string;
    label?: string;
  }>
): OriginSingleDestinationSingleFilterValue {
  const origin =
    originCountryOptions.find((item) => item.value === "IDN") ??
    originCountryOptions.find((item) =>
      item.label?.toUpperCase().includes("INDONESIA")
    ) ??
    null;
  const destination =
    destinationCountryOptions.find((item) => item.value === "CHN") ??
    destinationCountryOptions.find((item) => {
      const label = item.label?.toUpperCase() ?? "";
      return label.includes("TIONGKOK") || label.includes("CHINA");
    }) ??
    null;

  return {
    origin: {
      region: null,
      subregion: null,
      country: origin?.value ?? "IDN"
    },
    destination: {
      region: null,
      subregion: null,
      country: destination?.value ?? "CHN"
    }
  };
}

const getTabs = (type: AnalysisType) => {
  if (type === "rca") {
    return [
      { key: "overview", label: "RCA CMSA" },
      { key: "calculation", label: "View RCA CMSA Calculations" }
    ] as const;
  }

  return [
    { key: "overview", label: "Country Trade Analysis" },
    { key: "comparison", label: "Country Comparison" }
  ] as const;
};

function isOverviewResult(
  value: unknown
): value is AnalisisPotensiDayaSaingOverviewResult {
  return typeof value === "object" && value !== null && "buckets" in value;
}

function isCalculationResult(
  value: unknown
): value is AnalisisPotensiDayaSaingCalculationResult {
  return typeof value === "object" && value !== null && "rows" in value;
}

function isRscaTbiResult(value: unknown): value is AnalisisRscaTbiResult {
  return typeof value === "object" && value !== null && "rows" in value;
}

function isRscaTbiCalculationResult(
  value: unknown
): value is AnalisisRscaTbiCalculationResult {
  return typeof value === "object" && value !== null && "rows" in value;
}

function isRscaTbiComparisonResult(
  value: unknown
): value is AnalisisRscaTbiComparisonResult {
  return typeof value === "object" && value !== null && "rows" in value;
}

function isRcaEpdResult(value: unknown): value is AnalisisRcaEpdResult {
  return typeof value === "object" && value !== null && "rows" in value;
}

function isRcaEpdCalculationResult(
  value: unknown
): value is AnalisisRcaEpdCalculationResult {
  return typeof value === "object" && value !== null && "rows" in value;
}

function isRcaEpdComparisonResult(
  value: unknown
): value is AnalisisRcaEpdComparisonResult {
  return typeof value === "object" && value !== null && "rows" in value;
}

function getRequestCopy(tab: string) {
  if (tab === "rca_cmsa") {
    return {
      loadingTitle: "Memuat RCA & CMSA",
      loadingDescription: "Data potensi dan daya saing sedang diambil.",
      successTitle: "RCA & CMSA siap",
      successDescription: "Data potensi dan daya saing berhasil dimuat.",
      errorTitle: "RCA & CMSA gagal dimuat"
    };
  }

  if (tab === "rca_cmsa_calculation") {
    return {
      loadingTitle: "Memuat perhitungan RCA & CMSA",
      loadingDescription: "Data perhitungan RCA & CMSA sedang diambil.",
      successTitle: "Perhitungan RCA & CMSA siap",
      successDescription: "Data perhitungan RCA & CMSA berhasil dimuat.",
      errorTitle: "Perhitungan RCA & CMSA gagal dimuat"
    };
  }

  if (tab === "rsca_tbi") {
    return {
      loadingTitle: "Memuat RSCA & TBI",
      loadingDescription: "Data analisis RSCA & TBI sedang diambil.",
      successTitle: "RSCA & TBI siap",
      successDescription: "Data analisis RSCA & TBI berhasil dimuat.",
      errorTitle: "RSCA & TBI gagal dimuat"
    };
  }

  if (tab === "rsca_tbi_comparison") {
    return {
      loadingTitle: "Memuat Country Comparison",
      loadingDescription: "Data Country Comparison RSCA & TBI sedang diambil.",
      successTitle: "Country Comparison siap",
      successDescription: "Data Country Comparison RSCA & TBI berhasil dimuat.",
      errorTitle: "Country Comparison gagal dimuat"
    };
  }

  if (tab === "rca_epd") {
    return {
      loadingTitle: "Memuat RCA & EPD",
      loadingDescription: "Data analisis RCA & EPD sedang diambil.",
      successTitle: "RCA & EPD siap",
      successDescription: "Data analisis RCA & EPD berhasil dimuat.",
      errorTitle: "RCA & EPD gagal dimuat"
    };
  }

  if (tab === "rca_epd_calculation") {
    return {
      loadingTitle: "Memuat perhitungan RCA & EPD",
      loadingDescription: "Data perhitungan RCA & EPD sedang diambil.",
      successTitle: "Perhitungan RCA & EPD siap",
      successDescription: "Data perhitungan RCA & EPD berhasil dimuat.",
      errorTitle: "Perhitungan RCA & EPD gagal dimuat"
    };
  }

  if (tab === "rca_epd_comparison") {
    return {
      loadingTitle: "Memuat Country Comparison",
      loadingDescription: "Data Country Comparison RCA & EPD sedang diambil.",
      successTitle: "Country Comparison siap",
      successDescription: "Data Country Comparison RCA & EPD berhasil dimuat.",
      errorTitle: "Country Comparison gagal dimuat"
    };
  }

  return {
    loadingTitle: "Memuat perhitungan RSCA & TBI",
    loadingDescription: "Data perhitungan RSCA & TBI sedang diambil.",
    successTitle: "Perhitungan RSCA & TBI siap",
    successDescription: "Data perhitungan RSCA & TBI berhasil dimuat.",
    errorTitle: "Perhitungan RSCA & TBI gagal dimuat"
  };
}

export function AnalisisPotensiDayaSaingPage() {
  useDocumentTitle(`Potensi & Daya Saing | ${APP_NAME}`);
  const [analysisType, setAnalysisType] = React.useState<AnalysisType>("rca");
  const { toast, dismiss } = useToast();
  const wilayahQuery = useQuery({
    queryKey: ["analisis", "potensi-daya-saing", "wilayah"],
    queryFn: fetchMitraWilayah,
    staleTime: 1000 * 60 * 10,
    retry: false
  });
  const tabs = getTabs(analysisType);
  const countriesQuery = useCommonCountriesQuery();
  const destinationCountriesQuery = useCommonCountriesRcaCmsaQuery();
  const masterQuery = React.useMemo(
    () => ({
      data:
        wilayahQuery.data &&
        countriesQuery.data &&
        destinationCountriesQuery.data
          ? {
              regionOptions: wilayahQuery.data.regionOptions,
              subregionOptions: wilayahQuery.data.subregionOptions,
              countryOptions: normalizeCountriesFromCommon(countriesQuery.data),
              destinationCountryOptions: normalizeCountriesFromCommon(
                destinationCountriesQuery.data
              )
            }
          : undefined,
      isLoading:
        wilayahQuery.isLoading ||
        countriesQuery.isLoading ||
        destinationCountriesQuery.isLoading,
      isFetching:
        wilayahQuery.isFetching ||
        countriesQuery.isFetching ||
        destinationCountriesQuery.isFetching,
      error:
        wilayahQuery.error ??
        countriesQuery.error ??
        destinationCountriesQuery.error
    }),
    [
      countriesQuery.data,
      countriesQuery.error,
      countriesQuery.isFetching,
      countriesQuery.isLoading,
      destinationCountriesQuery.data,
      destinationCountriesQuery.error,
      destinationCountriesQuery.isFetching,
      destinationCountriesQuery.isLoading,
      wilayahQuery.data,
      wilayahQuery.error,
      wilayahQuery.isFetching,
      wilayahQuery.isLoading
    ]
  );
  const [filters, setFilters] =
    React.useState<OriginSingleDestinationSingleFilterValue>({
      origin: {
        region: null,
        subregion: null,
        country: "IDN"
      },
      destination: {
        region: null,
        subregion: null,
        country: "CHN"
      }
    });
  const [activeTab, setActiveTab] = React.useState("overview");
  const [rscaTableMode, setRscaTableMode] = React.useState<
    "country" | "country_detail"
  >("country");
  const [rscaHsLevel, setRscaHsLevel] = React.useState<RscaHsLevel>(6);
  const [rcaEpdTableMode, setRcaEpdTableMode] = React.useState<
    "country" | "country_detail"
  >("country");
  const [rcaEpdHsLevel, setRcaEpdHsLevel] = React.useState<RcaEpdHsLevel>(6);
  const [rcaEpdXModel, setRcaEpdXModel] = React.useState<string | null>(null);
  const rcaEpdXModelOptionsQuery = useAnalisisRcaEpdXModelOptionsQuery({
    origin: filters.origin.country,
    dest: filters.destination.country,
    level: rcaEpdHsLevel,
    enabled:
      analysisType === "rca_epd" &&
      Boolean(filters.origin.country && filters.destination.country)
  });
  const rcaEpdXModelOptions = React.useMemo(
    () => rcaEpdXModelOptionsQuery.data?.options ?? [],
    [rcaEpdXModelOptionsQuery.data?.options]
  );

  React.useEffect(() => {
    setActiveTab("overview");
    setRscaTableMode("country");
    setRcaEpdTableMode("country");
  }, [analysisType]);

  React.useEffect(() => {
    if (!rcaEpdXModel) return;
    if (rcaEpdXModelOptions.includes(rcaEpdXModel)) return;

    setRcaEpdXModel(null);
  }, [rcaEpdXModel, rcaEpdXModelOptions]);

  React.useEffect(() => {
    const originCountryOptions = masterQuery.data?.countryOptions;
    const destinationCountryOptions =
      masterQuery.data?.destinationCountryOptions;
    if (!originCountryOptions?.length || !destinationCountryOptions?.length)
      return;

    setFilters((current) => {
      const defaults = buildDefaultFilters(
        originCountryOptions,
        destinationCountryOptions
      );
      const hasCurrentDestination = destinationCountryOptions.some(
        (item) => item.value === current.destination.country
      );
      return {
        origin: {
          region: null,
          subregion: null,
          country: defaults.origin.country
        },
        destination: {
          region: current.destination.region ?? defaults.destination.region,
          subregion:
            current.destination.subregion ?? defaults.destination.subregion,
          country: hasCurrentDestination
            ? current.destination.country
            : defaults.destination.country
        }
      };
    });
  }, [
    masterQuery.data?.countryOptions,
    masterQuery.data?.destinationCountryOptions
  ]);

  const handleReset = React.useCallback(() => {
    setFilters(
      buildDefaultFilters(
        masterQuery.data?.countryOptions ?? [],
        masterQuery.data?.destinationCountryOptions ?? []
      )
    );
  }, [
    masterQuery.data?.countryOptions,
    masterQuery.data?.destinationCountryOptions
  ]);

  const apiTab = React.useMemo(() => {
    if (analysisType === "rca") {
      return activeTab === "overview" ? "rca_cmsa" : "rca_cmsa_calculation";
    }

    if (analysisType === "rsca") {
      if (activeTab === "comparison") return "rsca_tbi_comparison";

      return rscaTableMode === "country" ? "rsca_tbi" : "rsca_tbi_calculation";
    }

    if (activeTab === "comparison") return "rca_epd_comparison";

    return rcaEpdTableMode === "country" ? "rca_epd" : "rca_epd_calculation";
  }, [activeTab, analysisType, rcaEpdTableMode, rscaTableMode]);

  const shouldFetchResult =
    Boolean(filters.origin.country && filters.destination.country) &&
    (analysisType === "rca" ||
      analysisType === "rsca" ||
      analysisType === "rca_epd");

  const activeHsLevel =
    analysisType === "rsca"
      ? rscaHsLevel
      : analysisType === "rca_epd"
        ? rcaEpdHsLevel
        : undefined;

  const activeXModel =
    analysisType === "rca_epd" && activeTab === "overview"
      ? rcaEpdXModel
      : null;

  const query = useAnalisisPotensiDayaSaingQuery({
    tab: apiTab,
    origin: filters.origin.country,
    dest: filters.destination.country,
    level: activeHsLevel,
    x_model: activeXModel,
    enabled: shouldFetchResult
  });
  const activeQueryError = shouldFetchResult ? query.error : null;
  const hasUnauthorizedError =
    isUnauthorizedApiError(masterQuery.error) ||
    isUnauthorizedApiError(activeQueryError);

  const requestToastKey = React.useMemo(
    () =>
      `analisis-potensi-${apiTab}-${filters.origin.country ?? "none"}-${filters.destination.country ?? "none"}-${activeHsLevel ?? "default"}-${activeXModel ?? "all"}`,
    [
      activeHsLevel,
      activeXModel,
      apiTab,
      filters.destination.country,
      filters.origin.country
    ]
  );
  const requestCopy = React.useMemo(() => getRequestCopy(apiTab), [apiTab]);
  const loadingToastIdRef = React.useRef<string | null>(null);
  const lastSuccessKeyRef = React.useRef("");
  const lastErrorKeyRef = React.useRef("");

  React.useEffect(() => {
    if (!shouldFetchResult) {
      if (loadingToastIdRef.current) {
        dismiss(loadingToastIdRef.current);
        loadingToastIdRef.current = null;
      }
      return;
    }

    if (query.isFetching) {
      if (loadingToastIdRef.current) return;
      loadingToastIdRef.current = toast({
        title: requestCopy.loadingTitle,
        description: requestCopy.loadingDescription,
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [dismiss, query.isFetching, requestCopy, shouldFetchResult, toast]);

  React.useEffect(() => {
    if (!shouldFetchResult) return;
    if (query.isFetching || !query.isSuccess || !query.data) return;
    if (lastSuccessKeyRef.current === requestToastKey) return;

    lastSuccessKeyRef.current = requestToastKey;
    lastErrorKeyRef.current = "";
    toast({
      title: requestCopy.successTitle,
      description: requestCopy.successDescription,
      tone: "success",
      durationMs: 2200
    });
  }, [
    activeTab,
    query.data,
    query.isFetching,
    query.isSuccess,
    requestCopy,
    requestToastKey,
    shouldFetchResult,
    toast
  ]);

  React.useEffect(() => {
    const errorMessage =
      activeQueryError instanceof Error
        ? activeQueryError.message
        : activeQueryError
          ? "Terjadi kesalahan saat memuat data potensi dan daya saing."
          : "";
    const errorKey = `${requestToastKey}:${errorMessage}`;
    if (!errorMessage || lastErrorKeyRef.current === errorKey) return;

    lastErrorKeyRef.current = errorKey;
    toast({
      title: requestCopy.errorTitle,
      description: errorMessage,
      tone: "error"
    });
  }, [activeQueryError, requestCopy, requestToastKey, toast]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data potensi dan daya saing tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-analisis-potensi-tour="page-title">
          <PageTitle
            title="Analisis Potensi dan Daya Saing"
            description="Hasil analisis potensi dan daya saing dengan negara mitra/kawasan yang dipilih dalam bentuk tabel data."
            actions={
              <div data-analisis-potensi-tour="guide-button">
                <Button
                  type="button"
                  variant="primary"
                  className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-white transition"
                  onClick={() =>
                    window.open(
                      "/files/pedoman-rca-cmsa.pdf",
                      "_blank",
                      "noopener"
                    )
                  }
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Pedoman RCA-CMSA
                </Button>
              </div>
            }
          />
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
            Jenis analisis
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setAnalysisType("rca")}
              aria-pressed={analysisType === "rca"}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                analysisType === "rca"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              RCA & CMSA
            </button>

            <button
              type="button"
              onClick={() => setAnalysisType("rsca")}
              aria-pressed={analysisType === "rsca"}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                analysisType === "rsca"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              RSCA & TBI
            </button>

            <button
              type="button"
              onClick={() => setAnalysisType("rca_epd")}
              aria-pressed={analysisType === "rca_epd"}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                analysisType === "rca_epd"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              RCA & EPD
            </button>
          </div>
        </div>

        <div data-analisis-potensi-tour="filters-panel">
          <OriginSingleDestinationSingleFiltersPanel
            regionOptions={masterQuery.data?.regionOptions ?? []}
            subregionOptions={masterQuery.data?.subregionOptions ?? []}
            countryOptions={masterQuery.data?.countryOptions ?? []}
            originCountryOptions={masterQuery.data?.countryOptions ?? []}
            destinationCountryOptions={
              masterQuery.data?.destinationCountryOptions ?? []
            }
            value={filters}
            loading={masterQuery.isLoading}
            requestLoading={masterQuery.isFetching}
            onSubmit={setFilters}
            onReset={handleReset}
            title="Filter Negara Asal dan Tujuan"
            description="Pilih negara asal dan tujuan untuk menampilkan analisis daya saing dan perhitungan detailnya."
            originDefaultCountry="IDN"
            destinationDefaultCountry="CHN"
            originDisabled
          />
        </div>

        {analysisType === "rsca" ? (
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
              Level HS
            </div>
            <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-700">
              {RSCA_HS_LEVEL_OPTIONS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setRscaHsLevel(level)}
                  aria-pressed={rscaHsLevel === level}
                  className={`rounded px-3 py-1.5 transition-colors ${
                    rscaHsLevel === level
                      ? "bg-white text-[#384AA0] shadow-sm"
                      : "hover:bg-white/80 hover:text-slate-950"
                  }`}
                >
                  HS {level}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {analysisType === "rca_epd" ? (
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[auto_minmax(240px,360px)]">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Level HS
              </div>
              <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-700">
                {RCA_EPD_HS_LEVEL_OPTIONS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setRcaEpdHsLevel(level)}
                    aria-pressed={rcaEpdHsLevel === level}
                    className={`rounded px-3 py-1.5 transition-colors ${
                      rcaEpdHsLevel === level
                        ? "bg-white text-[#384AA0] shadow-sm"
                        : "hover:bg-white/80 hover:text-slate-950"
                    }`}
                  >
                    HS {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Jenis Pasar
              </div>
              <select
                value={rcaEpdXModel ?? ""}
                onChange={(event) =>
                  setRcaEpdXModel(event.target.value || null)
                }
                disabled={rcaEpdXModelOptionsQuery.isLoading}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-[#384AA0] focus:bg-white focus:ring-1 focus:ring-[#384AA0]"
              >
                <option value="">Semua jenis pasar</option>
                {rcaEpdXModelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {rcaEpdXModelOptionsQuery.isFetching ? (
                <div className="mt-1 text-xs text-slate-500">
                  Memuat opsi jenis pasar...
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <section
          className="overflow-x-auto"
          data-analisis-potensi-tour="tabs-section"
        >
          <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
            Modul analisis
          </div>
          <div className="flex min-w-full items-center gap-2">
            {tabs.map((tab) => {
              const active = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-pressed={active}
                  className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-[#384AA0] bg-indigo-50 text-[#384AA0]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        <div data-analisis-potensi-tour="result-section">
          {hasUnauthorizedError ? (
            <UnauthorizedAccessNotice
              title="Data potensi dan daya saing memerlukan sesi login yang aktif"
              body="Permintaan ke layanan analisis menerima respons 401. Masuk kembali lalu muat ulang halaman ini."
            />
          ) : analysisType === "rca" ? (
            activeTab === "overview" ? (
              <AnalisisPotensiRcaCmsaOverviewSection
                data={isOverviewResult(query.data) ? query.data : null}
                loading={query.isLoading || query.isFetching}
                errorMessage={
                  activeQueryError instanceof Error
                    ? activeQueryError.message
                    : activeQueryError
                      ? "Terjadi kesalahan saat memuat data potensi dan daya saing."
                      : null
                }
              />
            ) : (
              <AnalisisPotensiRcaCmsaCalcSection
                data={isCalculationResult(query.data) ? query.data : null}
                loading={query.isLoading || query.isFetching}
                errorMessage={
                  activeQueryError instanceof Error
                    ? activeQueryError.message
                    : activeQueryError
                      ? "Terjadi kesalahan saat memuat perhitungan RCA & CMSA."
                      : null
                }
              />
            )
          ) : analysisType === "rsca" ? (
            activeTab === "overview" ? (
              <RscaTbiSection
                filters={filters}
                tableMode={rscaTableMode}
                onTableModeChange={setRscaTableMode}
                data={
                  rscaTableMode === "country" && isRscaTbiResult(query.data)
                    ? query.data
                    : null
                }
                detailData={
                  rscaTableMode === "country_detail" &&
                  isRscaTbiCalculationResult(query.data)
                    ? query.data
                    : null
                }
                loading={query.isLoading || query.isFetching}
                errorMessage={
                  activeQueryError instanceof Error
                    ? activeQueryError.message
                    : activeQueryError
                      ? "Terjadi kesalahan saat memuat RSCA & TBI."
                      : null
                }
              />
            ) : (
              <AnalisisPotensiRSCATBIComparisonSection
                data={isRscaTbiComparisonResult(query.data) ? query.data : null}
                loading={query.isLoading || query.isFetching}
                errorMessage={
                  activeQueryError instanceof Error
                    ? activeQueryError.message
                    : activeQueryError
                      ? "Terjadi kesalahan saat memuat Country Comparison RSCA & TBI."
                      : null
                }
              />
            )
          ) : activeTab === "overview" ? (
            <RcaEpdSection
              filters={filters}
              tableMode={rcaEpdTableMode}
              onTableModeChange={setRcaEpdTableMode}
              data={
                rcaEpdTableMode === "country" && isRcaEpdResult(query.data)
                  ? query.data
                  : null
              }
              detailData={
                rcaEpdTableMode === "country_detail" &&
                isRcaEpdCalculationResult(query.data)
                  ? query.data
                  : null
              }
              loading={query.isLoading || query.isFetching}
              errorMessage={
                activeQueryError instanceof Error
                  ? activeQueryError.message
                  : activeQueryError
                    ? "Terjadi kesalahan saat memuat RCA & EPD."
                    : null
              }
            />
          ) : (
            <AnalisisPotensiRCAEPDComparisonSection
              data={isRcaEpdComparisonResult(query.data) ? query.data : null}
              loading={query.isLoading || query.isFetching}
              errorMessage={
                activeQueryError instanceof Error
                  ? activeQueryError.message
                  : activeQueryError
                    ? "Terjadi kesalahan saat memuat Country Comparison RCA & EPD."
                    : null
              }
            />
          )}
        </div>
      </div>
      <GuidedTour
        steps={POTENSI_DAYA_SAING_TOUR_STEPS}
        storageKey="side-analisis-potensi-daya-saing-tour-completed"
      />
    </div>
  );
}
