import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { saveAs } from "file-saver";
import { DiplomasiFiltersPanel } from "@/components/filters/DiplomasiFiltersPanel";
import { DiplomasiLegendTooltip } from "@/components/ui/DiplomasiLegendTooltip";
import { DiplomasiTabPanels } from "@/components/indonesia/diplomasi/DiplomasiTabPanels";
import { DiplomasiSummarySection } from "@/components/indonesia/diplomasi/DiplomasiSummarySection";
import { Button } from "@/components/ui/Button";
import { FilterFallbackCard } from "@/components/ui/FilterFallbackCard";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { APP_NAME } from "@/constants/app";
import { DIPLOMASI_TABS } from "@/constants/indonesiaDiplomasi";
import { useDiplomasiMasterQuery } from "@/hooks/indonesia/useDiplomasiMasterQuery";
import { useDiplomasiOverviewQuery } from "@/hooks/indonesia/useDiplomasiOverviewQuery";
import { useDiplomasiStatsQuery } from "@/hooks/indonesia/useDiplomasiStatsQuery";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  buildDiplomasiSummaryCards,
  downloadDiplomasiSummaryPdf
} from "@/service/indonesia/diplomasi-ekonomi";
import type {
  DiplomasiFilterState,
  DiplomasiSectorKey,
  DiplomasiSourceBySector,
  DiplomasiSourceOptionsBySector
} from "@/type/indonesiaDiplomasi";
import { isUnauthorizedApiError } from "@/utils/apiError";
import {
  toDiplomasiApiParams,
  validateDiplomasiFilters
} from "@/validators/diplomasiEkonomiFilters";

const EMPTY_SOURCE_OPTIONS: DiplomasiSourceOptionsBySector = {
  perdagangan: [],
  investasi: [],
  pariwisata: []
};

const TABS_WITH_EXPORT = new Set([
  "nilai_perdagangan",
  "total_ekspor",
  "total_impor",
  "neraca_perdagangan",
  "investasi_masuk",
  "turis_masuk"
]);

const DIPLOMASI_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: "[data-diplomasi-tour='page-title']",
    title: "Baca konteks halaman",
    description:
      "Mulai dari judul dan deskripsi ini dulu untuk memahami bahwa halaman ini fokus pada kinerja diplomasi ekonomi Indonesia."
  },
  {
    selector: "[data-diplomasi-tour='filters-panel']",
    title: "Atur filter analisis",
    description:
      "Pilih tahun, level HS, kawasan, dan sumber data. Ini langkah utama sebelum membaca grafik dan tabel."
  },
  {
    selector: "[data-diplomasi-tour='summary-section']",
    title: "Lihat ringkasan utama",
    description:
      "Bagian ini menampilkan kartu ringkasan agar user cepat menangkap kondisi umum sebelum masuk ke detail tab."
  },
  {
    selector: "[data-diplomasi-tour='tabs-section']",
    title: "Pilih tab indikator",
    description:
      "Gunakan tab untuk berpindah antar indikator seperti perdagangan, investasi, dan pariwisata sesuai kebutuhan analisis."
  },
  {
    selector: "[data-diplomasi-tour='download-button']",
    title: "Unduh ringkasan PDF",
    description:
      "Jika tersedia pada tab aktif, tombol ini akan mengunduh ringkasan PDF sesuai filter yang dipilih dan data yang sedang ditampilkan."
  },
  {
    selector: "[data-diplomasi-tour='analysis-panel']",
    title: "Telusuri analisis detail",
    description:
      "Area ini menampilkan peta, tabel, dan visualisasi dari tab aktif berdasarkan filter yang sudah dipilih."
  }
];

export function IndonesiaDiplomasiEkonomiPage() {
  useDocumentTitle(`Diplomasi Ekonomi Indonesia | ${APP_NAME}`);

  const { toast, dismiss } = useToast();
  const masterQuery = useDiplomasiMasterQuery();

  const [activeTab, setActiveTab] = React.useState(DIPLOMASI_TABS[0].slug);
  const [page, setPage] = React.useState(0);
  const [hs, setHs] = React.useState("4");
  const [yearStartOverride, setYearStartOverride] = React.useState<
    number | null
  >(null);
  const [yearEndOverride, setYearEndOverride] = React.useState<number | null>(
    null
  );
  const [dirjenOverride, setDirjenOverride] = React.useState<string[] | null>(
    null
  );
  const [sourceOverride, setSourceOverride] = React.useState<
    Partial<Record<DiplomasiSectorKey, string | null>>
  >({});
  const [summaryPdfLoading, setSummaryPdfLoading] = React.useState(false);

  const yearsDesc = masterQuery.data?.tradeYearsDesc.length
    ? masterQuery.data.tradeYearsDesc
    : (masterQuery.data?.yearsDesc ?? []);
  const defaultYearEnd = yearsDesc[0] ?? null;
  const defaultYearStart = yearsDesc[1] ?? yearsDesc[0] ?? null;

  const yearStart = yearStartOverride ?? defaultYearStart;
  const yearEnd = yearEndOverride ?? defaultYearEnd;

  const sourceOptionsBySector =
    masterQuery.data?.sourceOptionsBySector ?? EMPTY_SOURCE_OPTIONS;
  const defaultSourceBySector = React.useMemo<DiplomasiSourceBySector>(
    () => ({
      perdagangan: sourceOptionsBySector.perdagangan[0]?.value ?? null,
      investasi: sourceOptionsBySector.investasi[0]?.value ?? null,
      pariwisata: sourceOptionsBySector.pariwisata[0]?.value ?? null
    }),
    [sourceOptionsBySector]
  );

  const resolveSourceValue = React.useCallback(
    (sector: DiplomasiSectorKey): string | null => {
      const hasOverride = Object.prototype.hasOwnProperty.call(
        sourceOverride,
        sector
      );
      const overrideValue = sourceOverride[sector] ?? null;
      const defaultValue = defaultSourceBySector[sector];
      const options = sourceOptionsBySector[sector];

      if (!hasOverride) return defaultValue;
      if (!overrideValue) return defaultValue;
      const isValidOption = options.some(
        (option) => option.value === overrideValue
      );
      return isValidOption ? overrideValue : defaultValue;
    },
    [defaultSourceBySector, sourceOptionsBySector, sourceOverride]
  );

  const sourceBySector = React.useMemo<DiplomasiSourceBySector>(
    () => ({
      perdagangan: resolveSourceValue("perdagangan"),
      investasi: resolveSourceValue("investasi"),
      pariwisata: resolveSourceValue("pariwisata")
    }),
    [resolveSourceValue]
  );

  const allDirjenValues = React.useMemo(
    () =>
      masterQuery.data?.wilayahOptions.flatMap((group) =>
        group.options.map((item) => item.value)
      ) ?? [],
    [masterQuery.data?.wilayahOptions]
  );
  const selectedDirjen = dirjenOverride ?? allDirjenValues;

  const filterState = React.useMemo<DiplomasiFilterState>(
    () => ({
      yearStart,
      yearEnd,
      hs,
      dirjen: selectedDirjen,
      sourceBySector
    }),
    [hs, selectedDirjen, sourceBySector, yearEnd, yearStart]
  );

  const filterErrors = React.useMemo(
    () => validateDiplomasiFilters(filterState, sourceOptionsBySector),
    [filterState, sourceOptionsBySector]
  );
  const hasFilterErrors = Object.keys(filterErrors).length > 0;
  const apiParams = React.useMemo(
    () => toDiplomasiApiParams(filterState, sourceOptionsBySector),
    [filterState, sourceOptionsBySector]
  );
  const filtersReady = Boolean(apiParams);
  const noRegionSelected = selectedDirjen.length === 0;

  const statsQuery = useDiplomasiStatsQuery(apiParams, filtersReady);
  const overviewQuery = useDiplomasiOverviewQuery(
    activeTab,
    apiParams,
    filtersReady && statsQuery.isSuccess
  );
  const hasUnauthorizedError =
    isUnauthorizedApiError(masterQuery.error) ||
    isUnauthorizedApiError(statsQuery.error) ||
    isUnauthorizedApiError(overviewQuery.error);
  const summaryCards = React.useMemo(
    () => buildDiplomasiSummaryCards(statsQuery.data, apiParams),
    [statsQuery.data, apiParams]
  );

  const requestLoading =
    masterQuery.isFetching || statsQuery.isFetching || overviewQuery.isFetching;
  const activeTabLabel =
    DIPLOMASI_TABS.find((tab) => tab.slug === activeTab)?.label ?? "-";
  const canDownloadSummary = TABS_WITH_EXPORT.has(activeTab);

  const statsToastKey = React.useMemo(() => {
    if (!apiParams) return "";

    const sumberKey = apiParams.sumber
      .map((item) => `${item.sektor}:${item.sumber}`)
      .sort()
      .join("|");
    const dirjenKey = [...apiParams.dirjen].sort().join("|");
    return `stats-${apiParams.year_start}-${apiParams.year_end}-${apiParams.hs}-${dirjenKey}-${sumberKey}`;
  }, [apiParams]);
  const overviewToastKey = React.useMemo(() => {
    if (!apiParams) return "";

    const sumberKey = apiParams.sumber
      .map((item) => `${item.sektor}:${item.sumber}`)
      .sort()
      .join("|");
    const dirjenKey = [...apiParams.dirjen].sort().join("|");
    return `overview-${activeTab}-${apiParams.year_start}-${apiParams.year_end}-${apiParams.hs}-${dirjenKey}-${sumberKey}`;
  }, [activeTab, apiParams]);
  const lastLoadedStatsToastRef = React.useRef<string>("");
  const lastLoadedOverviewToastRef = React.useRef<string>("");
  const statsLoadingToastIdRef = React.useRef<string | null>(null);
  const overviewLoadingToastIdRef = React.useRef<string | null>(null);
  const lastStatsErrorRef = React.useRef<string>("");
  const lastOverviewErrorRef = React.useRef<string>("");

  React.useEffect(() => {
    if (!statsToastKey || !filtersReady) return;

    if (statsQuery.isFetching) {
      if (statsLoadingToastIdRef.current) return;
      statsLoadingToastIdRef.current = toast({
        title: "Memuat ringkasan diplomasi ekonomi",
        description: "Ringkasan statistik diplomasi ekonomi sedang diproses...",
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (statsLoadingToastIdRef.current) {
      dismiss(statsLoadingToastIdRef.current);
      statsLoadingToastIdRef.current = null;
    }
  }, [dismiss, filtersReady, statsQuery.isFetching, statsToastKey, toast]);

  React.useEffect(() => {
    if (!statsToastKey || statsQuery.isFetching || !statsQuery.isSuccess)
      return;
    if (lastLoadedStatsToastRef.current === statsToastKey) return;

    lastLoadedStatsToastRef.current = statsToastKey;
    toast({
      title: "Ringkasan diplomasi ekonomi siap",
      description: "Data ringkasan statistik berhasil dimuat.",
      tone: "success",
      durationMs: 2200
    });
  }, [statsQuery.isFetching, statsQuery.isSuccess, statsToastKey, toast]);

  React.useEffect(() => {
    const errorMessage =
      statsQuery.error instanceof Error ? statsQuery.error.message : "";
    if (
      !errorMessage ||
      lastStatsErrorRef.current === `${statsToastKey}:${errorMessage}`
    )
      return;

    lastStatsErrorRef.current = `${statsToastKey}:${errorMessage}`;
    toast({
      title: "Ringkasan diplomasi ekonomi gagal dimuat",
      description: errorMessage,
      tone: "error"
    });
  }, [statsQuery.error, statsToastKey, toast]);

  React.useEffect(() => {
    if (!overviewToastKey || !filtersReady) return;

    if (overviewQuery.isFetching) {
      if (overviewLoadingToastIdRef.current) return;
      overviewLoadingToastIdRef.current = toast({
        title: "Memuat analisis diplomasi ekonomi",
        description: `Tab ${activeTabLabel} sedang diproses...`,
        tone: "loading",
        durationMs: null
      });
      return;
    }

    if (overviewLoadingToastIdRef.current) {
      dismiss(overviewLoadingToastIdRef.current);
      overviewLoadingToastIdRef.current = null;
    }
  }, [
    activeTabLabel,
    dismiss,
    filtersReady,
    overviewQuery.isFetching,
    overviewToastKey,
    toast
  ]);

  React.useEffect(() => {
    if (
      !overviewToastKey ||
      overviewQuery.isFetching ||
      !overviewQuery.isSuccess
    )
      return;
    if (lastLoadedOverviewToastRef.current === overviewToastKey) return;

    lastLoadedOverviewToastRef.current = overviewToastKey;
    toast({
      title: "Analisis diplomasi ekonomi siap",
      description: `Tab ${activeTabLabel} berhasil dimuat.`,
      tone: "success",
      durationMs: 2200
    });
  }, [
    activeTabLabel,
    overviewQuery.isFetching,
    overviewQuery.isSuccess,
    overviewToastKey,
    toast
  ]);

  React.useEffect(() => {
    const errorMessage =
      overviewQuery.error instanceof Error ? overviewQuery.error.message : "";
    if (
      !errorMessage ||
      lastOverviewErrorRef.current === `${overviewToastKey}:${errorMessage}`
    )
      return;

    lastOverviewErrorRef.current = `${overviewToastKey}:${errorMessage}`;
    toast({
      title: "Analisis diplomasi ekonomi gagal dimuat",
      description: errorMessage,
      tone: "error"
    });
  }, [overviewQuery.error, overviewToastKey, toast]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;
    toast({
      title: "Sesi login diperlukan",
      description:
        "Data diplomasi ekonomi tidak dapat dimuat karena akses Anda belum valid.",
      tone: "warning",
      durationMs: 3200
    });
  }, [hasUnauthorizedError, toast]);

  const handleSetSourceBySector = React.useCallback(
    (next: DiplomasiSourceBySector) => {
      setSourceOverride(next);
    },
    []
  );

  const handleResetFilters = () => {
    setHs("4");
    setYearStartOverride(defaultYearStart);
    setYearEndOverride(defaultYearEnd);
    setDirjenOverride(allDirjenValues);
    setSourceOverride({});
    setPage(0);
    setActiveTab(DIPLOMASI_TABS[0].slug);
  };

  const handleSubmitFilters = React.useCallback(
    (next: DiplomasiFilterState) => {
      setHs(next.hs);
      setYearStartOverride(next.yearStart);
      setYearEndOverride(next.yearEnd);
      setDirjenOverride(next.dirjen);
      setSourceOverride(next.sourceBySector);
      setPage(0);
    },
    []
  );

  const tabItems = React.useMemo(
    () => DIPLOMASI_TABS.map((tab) => ({ value: tab.slug, label: tab.label })),
    []
  );
  const periodLabel = React.useMemo(() => {
    if (yearStart == null || yearEnd == null) return "-";
    if (yearStart === yearEnd) return String(yearStart);
    return `${yearStart}-${yearEnd}`;
  }, [yearEnd, yearStart]);
  const showSummaryFallback =
    noRegionSelected || hasFilterErrors || !filtersReady;
  const showTabFallback = noRegionSelected || hasFilterErrors || !filtersReady;
  const summaryFallback = React.useMemo(
    () => buildDiplomasiFallbackContent(filterErrors, "summary"),
    [filterErrors]
  );
  const tabFallback = React.useMemo(
    () => buildDiplomasiFallbackContent(filterErrors, "tab"),
    [filterErrors]
  );

  const handleDownloadSummaryPdf = React.useCallback(async () => {
    if (!apiParams) return;

    const loadingId = toast({
      title: "Menyiapkan ringkasan PDF",
      description: `Ringkasan ${activeTabLabel} sedang diproses...`,
      tone: "loading",
      durationMs: null
    });

    setSummaryPdfLoading(true);

    try {
      const filenameBase = `Ringkasan_${activeTabLabel.replace(/\s+/g, "_")}_${periodLabel.replace(/\s+/g, "_")}.pdf`;
      const result = await downloadDiplomasiSummaryPdf(
        activeTab,
        apiParams,
        filenameBase
      );
      saveAs(
        result.blob,
        result.filename.endsWith(".pdf")
          ? result.filename
          : `${result.filename}.pdf`
      );

      dismiss(loadingId);
      toast({
        title: "Ringkasan PDF berhasil diunduh",
        description: `File ${activeTabLabel} siap digunakan.`,
        tone: "success",
        durationMs: 2200
      });
    } catch (error) {
      dismiss(loadingId);
      toast({
        title: "Unduh ringkasan gagal",
        description:
          error instanceof Error
            ? error.message
            : "PDF ringkasan belum dapat diunduh.",
        tone: "error",
        durationMs: 3200
      });
    } finally {
      setSummaryPdfLoading(false);
    }
  }, [activeTab, activeTabLabel, apiParams, dismiss, periodLabel, toast]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-diplomasi-tour="page-title">
          <PageTitle
            title="Kinerja Diplomasi Ekonomi Indonesia"
            description="Data diplomasi ekonomi Indonesia meliputi aspek perdagangan, investasi, pariwisata dan potensi ekonomi lainnya."
          />
        </div>

        <div data-diplomasi-tour="filters-panel">
          <DiplomasiFiltersPanel
            yearsDesc={yearsDesc}
            yearStart={yearStart}
            yearEnd={yearEnd}
            hs={hs}
            wilayahOptions={masterQuery.data?.wilayahOptions ?? []}
            selectedDirjen={selectedDirjen}
            sourceBySector={sourceBySector}
            sourceOptionsBySector={sourceOptionsBySector}
            onSetDirjen={(value) => setDirjenOverride(value)}
            onSetSourceBySector={handleSetSourceBySector}
            onSubmit={handleSubmitFilters}
            onReset={handleResetFilters}
            loading={masterQuery.isLoading}
            requestLoading={requestLoading}
          />
        </div>

        <DiplomasiLegendTooltip />

        {hasUnauthorizedError ? (
          <UnauthorizedAccessNotice
            title="Data diplomasi ekonomi memerlukan sesi login yang aktif"
            body="Permintaan ke layanan diplomasi ekonomi menerima respons 401. Masuk kembali lalu muat ulang halaman ini untuk melihat ringkasan, tab analisis, dan ekspor datanya."
          />
        ) : showSummaryFallback ? (
          <FilterFallbackCard
            title={summaryFallback.title}
            body={summaryFallback.body}
          />
        ) : null}

        {!hasUnauthorizedError && !showSummaryFallback ? (
          <div data-diplomasi-tour="summary-section">
            <DiplomasiSummarySection
              cards={summaryCards}
              page={page}
              onChangePage={setPage}
              loading={
                filtersReady && (statsQuery.isLoading || statsQuery.isFetching)
              }
              error={
                statsQuery.error instanceof Error
                  ? statsQuery.error.message
                  : null
              }
            />
          </div>
        ) : null}

        <section className="overflow-x-auto" data-diplomasi-tour="tabs-section">
          <div className="flex min-w-max items-center justify-between gap-3">
            <Tabs items={tabItems} value={activeTab} onChange={setActiveTab} />
            {canDownloadSummary ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleDownloadSummaryPdf}
                disabled={!apiParams || summaryPdfLoading}
                data-diplomasi-tour="download-button"
                className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-white transition"
              >
                <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                {summaryPdfLoading
                  ? "Menyiapkan PDF..."
                  : "Unduh Ringkasan (PDF)"}
              </Button>
            ) : null}
          </div>
        </section>

        {hasUnauthorizedError ? null : showTabFallback ? (
          <FilterFallbackCard
            title={tabFallback.title}
            body={tabFallback.body}
          />
        ) : null}

        {!hasUnauthorizedError && !showTabFallback ? (
          <div data-diplomasi-tour="analysis-panel">
            <DiplomasiTabPanels
              tab={activeTab}
              overview={overviewQuery.data ?? null}
              loading={
                filtersReady &&
                (overviewQuery.isLoading || overviewQuery.isFetching)
              }
              error={
                overviewQuery.error instanceof Error
                  ? overviewQuery.error.message
                  : null
              }
              periodLabel={periodLabel}
            />
          </div>
        ) : null}
      </div>

      <GuidedTour
        steps={DIPLOMASI_TOUR_STEPS}
        storageKey="side-diplomasi-tour-completed"
        launcherLabel="Tur Halaman"
        coachmarkLabel="Panduan halaman"
        spotlightZIndex={1600}
        coachmarkZIndex={1700}
      />
    </div>
  );
}

function buildDiplomasiFallbackContent(
  errors: Partial<Record<"yearRange" | "hs" | "dirjen" | "sumber", string>>,
  scope: "summary" | "tab"
) {
  const title =
    scope === "summary"
      ? "Ringkasan belum tersedia"
      : "Analisis belum tersedia";
  const notes: string[] = [];

  if (errors.yearRange) notes.push("Pilih rentang tahun yang valid.");
  if (errors.hs) notes.push("Pilih level HS.");
  if (errors.dirjen) notes.push("Pilih minimal satu Kawasan.");
  if (errors.sumber)
    notes.push("Lengkapi sumber data setiap sektor yang tersedia.");

  if (notes.length === 0) {
    return {
      title,
      body:
        scope === "summary"
          ? "Lengkapi filter untuk menampilkan ringkasan kinerja diplomasi ekonomi."
          : "Lengkapi filter untuk menampilkan peta, tabel, dan metrik pada tab aktif."
    };
  }

  return {
    title,
    body: notes.join(" ")
  };
}
