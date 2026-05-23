import React from "react";
import { saveAs } from "file-saver";
import { APP_NAME } from "@/constants/app";
import {
  RcaCmsaFiltersPanel,
  RCA_CMSA_STRATEGY_OPTIONS,
  type RcaCmsaFilterValue
} from "@/components/report-generator/RcaCmsaFiltersPanel";
import { ReportGeneratorInfoBanner } from "@/components/report-generator/ReportGeneratorInfoBanner";
import { RcaCmsaTableCard } from "@/components/report-generator/RcaCmsaTableCard";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import {
  useCommonCountriesQuery,
  useCommonCountriesRcaCmsaQuery
} from "@/hooks/indonesia/useCountryGeoQueries";
import { useRcaCmsaReportQuery } from "@/hooks/report-generator/useRcaCmsaReportQuery";
import {
  downloadRcaCmsaSnapshotPdf,
  downloadRcaCmsaSnapshotWord,
  downloadRcaCmsaSummaryPdf,
  downloadRcaCmsaSummaryWord
} from "@/service/report-generator/rcaCmsa";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isUnauthorizedApiError } from "@/utils/apiError";

const RCA_CMSA_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-report-generator-rca-cmsa-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini dipakai untuk menyusun laporan RCA dan CMSA berdasarkan negara tujuan dan strategi analisis."
  },
  {
    selector: '[data-report-generator-rca-cmsa-tour="info-banner"]',
    title: "Informasi generator",
    description:
      "Banner ini menjelaskan cakupan laporan RCA-CMSA sebelum Anda menerapkan filter."
  },
  {
    selector: '[data-report-generator-rca-cmsa-tour="filters-panel"]',
    title: "Panel filter",
    description:
      "Pilih negara tujuan dan strategi analisis, lalu terapkan filter untuk memuat laporan RCA-CMSA."
  },
  {
    selector: '[data-report-generator-rca-cmsa-tour="result-card"]',
    title: "Hasil laporan",
    description:
      "Bagian ini menampilkan hasil laporan RCA-CMSA dan menyediakan aksi unduh snapshot maupun summary dalam format Word atau PDF."
  }
];

const DEFAULT_FILTERS: RcaCmsaFilterValue = {
  origin: "IDN",
  destination: null,
  strategy1: RCA_CMSA_STRATEGY_OPTIONS[0]?.value ?? "ALL"
};

export function ReportGeneratorRcaCmsaPage() {
  useDocumentTitle(`Report Generator RCA & CMSA | ${APP_NAME}`);
  const { toast, dismiss } = useToast();
  const countriesQuery = useCommonCountriesQuery();
  const destinationCountriesQuery = useCommonCountriesRcaCmsaQuery();
  const [filters, setFilters] =
    React.useState<RcaCmsaFilterValue>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    React.useState<RcaCmsaFilterValue | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [downloadLoadingKey, setDownloadLoadingKey] = React.useState<
    "snapshot-word" | "snapshot-pdf" | "summary-word" | "summary-pdf" | null
  >(null);
  const loadingToastIdRef = React.useRef<string | null>(null);

  const originOptions = React.useMemo(
    () =>
      (countriesQuery.data ?? [])
        .map((item) => ({ value: item.id, label: item.nama }))
        .sort((left, right) => left.label.localeCompare(right.label, "id")),
    [countriesQuery.data]
  );
  const destinationOptions = React.useMemo(
    () =>
      (destinationCountriesQuery.data ?? [])
        .map((item) => ({ value: item.id, label: item.nama }))
        .sort((left, right) => left.label.localeCompare(right.label, "id")),
    [destinationCountriesQuery.data]
  );

  React.useEffect(() => {
    if (originOptions.length === 0) return;

    const indonesiaOption =
      originOptions.find((option) => option.value.toUpperCase() === "IDN") ??
      originOptions.find(
        (option) => option.label.toLowerCase() === "indonesia"
      ) ??
      null;

    if (!indonesiaOption) return;
    if (filters.origin === indonesiaOption.value) return;

    setFilters((current) => ({ ...current, origin: indonesiaOption.value }));
  }, [filters.origin, originOptions]);

  const filterBadge = React.useMemo(() => {
    if (!appliedFilters) return "Filter belum diterapkan";
    return JSON.stringify(filters) === JSON.stringify(appliedFilters)
      ? "Filter Aktif"
      : "Filter belum diterapkan";
  }, [appliedFilters, filters]);

  const reportParams = React.useMemo(() => {
    if (!appliedFilters?.destination) return null;
    return {
      origin: appliedFilters.origin,
      destination: appliedFilters.destination,
      strategy1: appliedFilters.strategy1
    };
  }, [appliedFilters]);

  const reportQuery = useRcaCmsaReportQuery(reportParams);
  const hasUnauthorizedError = React.useMemo(
    () =>
      [
        countriesQuery.error,
        destinationCountriesQuery.error,
        reportQuery.error
      ].some((error) => isUnauthorizedApiError(error)),
    [countriesQuery.error, destinationCountriesQuery.error, reportQuery.error]
  );
  const originLabel = React.useMemo(
    () =>
      originOptions.find(
        (option) => option.value === (appliedFilters?.origin ?? filters.origin)
      )?.label ?? "Indonesia",
    [appliedFilters?.origin, filters.origin, originOptions]
  );
  const destinationLabel = React.useMemo(
    () =>
      destinationOptions.find(
        (option) =>
          option.value ===
          (appliedFilters?.destination ?? filters.destination ?? "")
      )?.label ?? "Negara/Entitas Tujuan",
    [appliedFilters?.destination, destinationOptions, filters.destination]
  );
  const strategyLabel = React.useMemo(
    () =>
      RCA_CMSA_STRATEGY_OPTIONS.find(
        (option) =>
          option.value === (appliedFilters?.strategy1 ?? filters.strategy1)
      )?.label ?? "Semua",
    [appliedFilters?.strategy1, filters.strategy1]
  );

  React.useEffect(() => {
    if (reportQuery.isFetching && reportParams) {
      if (!loadingToastIdRef.current) {
        loadingToastIdRef.current = toast({
          title: "Memuat laporan RCA-CMSA",
          description: `Mengambil data untuk ${originLabel} -> ${destinationLabel}.`,
          tone: "info"
        });
      }
      return;
    }

    if (loadingToastIdRef.current) {
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [
    destinationLabel,
    dismiss,
    originLabel,
    reportParams,
    reportQuery.isFetching,
    toast
  ]);

  React.useEffect(() => {
    return () => {
      if (!loadingToastIdRef.current) return;
      dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    };
  }, [dismiss]);

  React.useEffect(() => {
    if (!hasUnauthorizedError) return;

    toast({
      title: "Akses login dibutuhkan",
      description: "Data RCA-CMSA memerlukan sesi login yang aktif.",
      tone: "warning"
    });
  }, [hasUnauthorizedError, toast]);

  React.useEffect(() => {
    if (!reportQuery.isError || hasUnauthorizedError) return;

    toast({
      title: "Gagal memuat laporan RCA-CMSA",
      description:
        reportQuery.error instanceof Error
          ? reportQuery.error.message
          : "Terjadi kesalahan saat mengambil data RCA-CMSA.",
      tone: "error"
    });
  }, [hasUnauthorizedError, reportQuery.error, reportQuery.isError, toast]);

  const handleDownload = React.useCallback(
    async (
      type: "snapshot-word" | "snapshot-pdf" | "summary-word" | "summary-pdf"
    ) => {
      if (!appliedFilters?.destination) return;

      const downloadParams = {
        origin: appliedFilters.origin,
        destination: appliedFilters.destination
      };
      const destinationCode = appliedFilters.destination;
      const filenameBaseMap = {
        "snapshot-word": `Snapshot_RCA_CMSA_${appliedFilters.origin}_${destinationCode}.docx`,
        "snapshot-pdf": `Snapshot_RCA_CMSA_${appliedFilters.origin}_${destinationCode}.pdf`,
        "summary-word": `Summary_RCA_CMSA_${appliedFilters.origin}_${destinationCode}.docx`,
        "summary-pdf": `Summary_RCA_CMSA_${appliedFilters.origin}_${destinationCode}.pdf`
      } as const;
      const loadingMessageMap = {
        "snapshot-word": "Menyiapkan snapshot Word",
        "snapshot-pdf": "Menyiapkan snapshot PDF",
        "summary-word": "Menyiapkan summary Word",
        "summary-pdf": "Menyiapkan summary PDF"
      } as const;
      const successMessageMap = {
        "snapshot-word": "Snapshot Word berhasil diunduh",
        "snapshot-pdf": "Snapshot PDF berhasil diunduh",
        "summary-word": "Summary Word berhasil diunduh",
        "summary-pdf": "Summary PDF berhasil diunduh"
      } as const;

      const loadingId = toast({
        title: loadingMessageMap[type],
        description: `Laporan RCA-CMSA untuk ${originLabel} -> ${destinationLabel} sedang diproses...`,
        tone: "loading",
        durationMs: null
      });

      setDownloadLoadingKey(type);

      try {
        const result =
          type === "snapshot-word"
            ? await downloadRcaCmsaSnapshotWord(
                downloadParams,
                filenameBaseMap[type]
              )
            : type === "snapshot-pdf"
              ? await downloadRcaCmsaSnapshotPdf(
                  downloadParams,
                  filenameBaseMap[type]
                )
              : type === "summary-word"
                ? await downloadRcaCmsaSummaryWord(
                    downloadParams,
                    filenameBaseMap[type]
                  )
                : await downloadRcaCmsaSummaryPdf(
                    downloadParams,
                    filenameBaseMap[type]
                  );

        const fallbackExtension =
          type === "snapshot-word" || type === "summary-word"
            ? ".docx"
            : ".pdf";

        saveAs(
          result.blob,
          result.filename.toLowerCase().endsWith(fallbackExtension)
            ? result.filename
            : `${result.filename}${fallbackExtension}`
        );

        dismiss(loadingId);
        toast({
          title: successMessageMap[type],
          description: "File laporan siap digunakan.",
          tone: "success",
          durationMs: 2200
        });
      } catch (error) {
        dismiss(loadingId);
        toast({
          title: "Unduh laporan gagal",
          description:
            error instanceof Error
              ? error.message
              : "File laporan belum dapat diunduh.",
          tone: "error",
          durationMs: 3200
        });
      } finally {
        setDownloadLoadingKey(null);
      }
    },
    [appliedFilters, destinationLabel, dismiss, originLabel, toast]
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-report-generator-rca-cmsa-tour="page-title">
          <PageTitle
            title="Report Generator RCA & CMSA"
            description="Buat laporan daya saing produk dan spesialisasi pasar dalam format yang lebih terstruktur untuk kebutuhan analisis."
          />
        </div>
        <div data-report-generator-rca-cmsa-tour="info-banner">
          <ReportGeneratorInfoBanner
            sectorLabel="RCA & CMSA"
            description="Generator ini disiapkan untuk menyusun laporan RCA dan CMSA secara lebih sistematis sebelum masuk ke tahap rangkuman, visualisasi, atau ekspor dokumen."
          />
        </div>
        <div data-report-generator-rca-cmsa-tour="filters-panel">
          <RcaCmsaFiltersPanel
            value={filters}
            onChange={(next) => setFilters(next)}
            onSubmit={(next) => {
              setSubmitted(true);
              if (!next.destination) return;
              setAppliedFilters(next);
            }}
            onReset={() => {
              setFilters(DEFAULT_FILTERS);
              setAppliedFilters(null);
              setSubmitted(false);
            }}
            originOptions={originOptions}
            destinationOptions={destinationOptions}
            badge={filterBadge}
            loading={reportQuery.isLoading || reportQuery.isFetching}
            submitted={submitted}
          />
        </div>
        <div data-report-generator-rca-cmsa-tour="result-card">
          {hasUnauthorizedError ? (
            <UnauthorizedAccessNotice
              title="Laporan RCA-CMSA memerlukan sesi login yang aktif"
              body="Masuk ke sistem untuk melihat data laporan, menyaring hasil, dan mengunduh dokumen."
            />
          ) : (
            <RcaCmsaTableCard
              data={reportQuery.data?.data ?? []}
              loading={reportQuery.isLoading || reportQuery.isFetching}
              originLabel={originLabel}
              destinationLabel={destinationLabel}
              strategyLabel={strategyLabel}
              onDownloadSnapshotWord={
                appliedFilters?.destination
                  ? () => void handleDownload("snapshot-word")
                  : undefined
              }
              onDownloadSnapshotPdf={
                appliedFilters?.destination
                  ? () => void handleDownload("snapshot-pdf")
                  : undefined
              }
              onDownloadSummaryWord={
                appliedFilters?.destination
                  ? () => void handleDownload("summary-word")
                  : undefined
              }
              onDownloadSummaryPdf={
                appliedFilters?.destination
                  ? () => void handleDownload("summary-pdf")
                  : undefined
              }
              downloadLoadingKey={downloadLoadingKey}
            />
          )}
        </div>
      </div>
      <GuidedTour
        steps={RCA_CMSA_TOUR_STEPS}
        storageKey="side-report-generator-rca-cmsa-tour-completed"
      />
    </div>
  );
}
