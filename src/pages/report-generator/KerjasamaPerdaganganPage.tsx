import React from "react";
import { saveAs } from "file-saver";
import { APP_NAME } from "@/constants/app";
import {
  KerjasamaPerdaganganFiltersPanel,
  type KerjasamaPerdaganganFilterValue
} from "@/components/report-generator/KerjasamaPerdaganganFiltersPanel";
import { ReportGeneratorInfoBanner } from "@/components/report-generator/ReportGeneratorInfoBanner";
import { KerjasamaPerdaganganTableCard } from "@/components/report-generator/KerjasamaPerdaganganTableCard";
import { GuidedTour, type GuidedTourStep } from "@/components/ui/GuidedTour";
import { PageTitle } from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { UnauthorizedAccessNotice } from "@/components/ui/UnauthorizedAccessNotice";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  useDataGeneratorTradeCountriesQuery,
  useDataGeneratorTradeSourcesQuery,
  useDataGeneratorTradeYearsQuery
} from "@/hooks/data-generator/useDataGeneratorTradeMasterQuery";
import { useKerjasamaPerdaganganReportQuery } from "@/hooks/report-generator/useKerjasamaPerdaganganReportQuery";
import {
  downloadKerjasamaPerdaganganSnapshotPdf,
  downloadKerjasamaPerdaganganSnapshotWord
} from "@/service/report-generator/kerjasamaPerdagangan";
import { isUnauthorizedApiError } from "@/utils/apiError";

const KERJASAMA_PERDAGANGAN_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-report-generator-kerjasama-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini dipakai untuk menyusun laporan kerjasama perdagangan berdasarkan pasangan negara, sumber data, dan rentang tahun."
  },
  {
    selector: '[data-report-generator-kerjasama-tour="info-banner"]',
    title: "Informasi generator",
    description:
      "Banner ini menjelaskan cakupan laporan yang akan dihasilkan sebelum Anda menerapkan filter."
  },
  {
    selector: '[data-report-generator-kerjasama-tour="filters-panel"]',
    title: "Panel filter",
    description:
      "Pilih negara asal, negara tujuan, sumber data, dan rentang tahun, lalu terapkan filter untuk memuat laporan."
  },
  {
    selector: '[data-report-generator-kerjasama-tour="result-card"]',
    title: "Hasil laporan",
    description:
      "Bagian ini menampilkan hasil laporan kerjasama perdagangan dan menyediakan aksi unduh snapshot Word atau PDF sesuai filter yang aktif."
  }
];

const DEFAULT_FILTERS: KerjasamaPerdaganganFilterValue = {
  origin: "IDN",
  destinations: [],
  sumber: null,
  year_start: null,
  year_end: null
};

export function ReportGeneratorKerjasamaPerdaganganPage() {
  useDocumentTitle(`Report Generator Kerjasama Perdagangan | ${APP_NAME}`);

  const { toast, dismiss } = useToast();
  const countriesQuery = useDataGeneratorTradeCountriesQuery();
  const sourcesQuery = useDataGeneratorTradeSourcesQuery();
  const yearsQuery = useDataGeneratorTradeYearsQuery();

  const [filters, setFilters] =
    React.useState<KerjasamaPerdaganganFilterValue>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    React.useState<KerjasamaPerdaganganFilterValue | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [downloadLoadingKey, setDownloadLoadingKey] = React.useState<
    "snapshot-word" | "snapshot-pdf" | null
  >(null);
  const loadingToastIdRef = React.useRef<string | null>(null);

  const countryOptions = React.useMemo(
    () => countriesQuery.data ?? [],
    [countriesQuery.data]
  );
  const originOptions = React.useMemo(
    () =>
      countryOptions.map((item) => ({ value: item.value, label: item.label })),
    [countryOptions]
  );
  const destinationOptions = React.useMemo(
    () =>
      countryOptions
        .filter((item) => item.value !== filters.origin)
        .map((item) => ({
          value: item.value,
          label: item.label,
          alpha2: item.alpha2
        })),
    [countryOptions, filters.origin]
  );
  const sourceOptions = React.useMemo(
    () =>
      (sourcesQuery.data ?? [])
        .map((item) => ({ value: item.value, label: item.label }))
        .sort((left, right) => {
          const leftNumber = Number(left.value);
          const rightNumber = Number(right.value);
          if (
            Number.isFinite(leftNumber) &&
            Number.isFinite(rightNumber) &&
            leftNumber !== rightNumber
          ) {
            return leftNumber - rightNumber;
          }
          return left.label.localeCompare(right.label, "id");
        }),
    [sourcesQuery.data]
  );
  const yearOptions = React.useMemo(
    () =>
      [...(yearsQuery.data ?? [])]
        .sort((left, right) => Number(left.value) - Number(right.value))
        .map((item) => ({ value: item.value, label: item.label })),
    [yearsQuery.data]
  );

  React.useEffect(() => {
    if (originOptions.length === 0) return;
    if (filters.origin) return;

    const indonesiaOption =
      originOptions.find((option) => option.value.toUpperCase() === "IDN") ??
      originOptions.find(
        (option) => option.label.toLowerCase() === "indonesia"
      ) ??
      null;

    if (!indonesiaOption) return;
    setFilters((current) => ({ ...current, origin: indonesiaOption.value }));
  }, [filters.origin, originOptions]);

  React.useEffect(() => {
    if (sourceOptions.length === 0) return;
    if (filters.sumber) return;

    const defaultSource = sourceOptions[0] ?? null;
    if (!defaultSource) return;

    setFilters((current) => ({ ...current, sumber: defaultSource.value }));
  }, [filters.sumber, sourceOptions]);

  React.useEffect(() => {
    if (yearOptions.length === 0) return;
    if (filters.year_start && filters.year_end) return;

    const latestYear = yearOptions[yearOptions.length - 1]?.value ?? null;
    const previousYear =
      yearOptions[yearOptions.length - 2]?.value ?? latestYear;

    setFilters((current) => ({
      ...current,
      year_start: current.year_start ?? previousYear,
      year_end: current.year_end ?? latestYear
    }));
  }, [filters.year_end, filters.year_start, yearOptions]);

  React.useEffect(() => {
    const start = Number(filters.year_start);
    const end = Number(filters.year_end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start <= end)
      return;
    setFilters((current) => ({ ...current, year_end: current.year_start }));
  }, [filters.year_end, filters.year_start]);

  const filterBadge = React.useMemo(() => {
    if (!appliedFilters) return "Filter belum diterapkan";
    return JSON.stringify(filters) === JSON.stringify(appliedFilters)
      ? "Filter Aktif"
      : "Filter belum diterapkan";
  }, [appliedFilters, filters]);

  const reportParams = React.useMemo(() => {
    if (
      !appliedFilters?.origin ||
      appliedFilters.destinations.length === 0 ||
      !appliedFilters.sumber ||
      !appliedFilters.year_start ||
      !appliedFilters.year_end
    ) {
      return null;
    }

    return {
      origin: appliedFilters.origin,
      destinations: appliedFilters.destinations,
      sumber: appliedFilters.sumber,
      year_start: Number(appliedFilters.year_start),
      year_end: Number(appliedFilters.year_end)
    };
  }, [appliedFilters]);

  const reportQuery = useKerjasamaPerdaganganReportQuery(reportParams);
  const hasUnauthorizedError = React.useMemo(
    () =>
      [
        countriesQuery.error,
        sourcesQuery.error,
        yearsQuery.error,
        reportQuery.error
      ].some((error) => isUnauthorizedApiError(error)),
    [
      countriesQuery.error,
      reportQuery.error,
      sourcesQuery.error,
      yearsQuery.error
    ]
  );

  const originLabel = React.useMemo(
    () =>
      originOptions.find(
        (option) => option.value === (appliedFilters?.origin ?? filters.origin)
      )?.label ?? "Indonesia",
    [appliedFilters?.origin, filters.origin, originOptions]
  );
  const destinationSummary = React.useMemo(() => {
    const targetDestinations =
      appliedFilters?.destinations ?? filters.destinations;
    if (targetDestinations.length === 0) return "Negara/Entitas Tujuan";
    if (targetDestinations.length === 1) {
      return (
        destinationOptions.find(
          (option) => option.value === targetDestinations[0]
        )?.label ?? "1 negara"
      );
    }
    const firstLabel =
      destinationOptions.find(
        (option) => option.value === targetDestinations[0]
      )?.label ?? targetDestinations[0];
    return `${firstLabel}, +${targetDestinations.length - 1} negara`;
  }, [appliedFilters?.destinations, destinationOptions, filters.destinations]);
  const sourceLabel = React.useMemo(
    () =>
      sourceOptions.find(
        (option) =>
          option.value === (appliedFilters?.sumber ?? filters.sumber ?? "")
      )?.label ?? "-",
    [appliedFilters?.sumber, filters.sumber, sourceOptions]
  );
  const originItems = React.useMemo(() => {
    const targetOrigin = appliedFilters?.origin ?? filters.origin;
    const label = originOptions.find(
      (option) => option.value === targetOrigin
    )?.label;
    return label ? [label] : [];
  }, [appliedFilters?.origin, filters.origin, originOptions]);
  const destinationItems = React.useMemo(() => {
    const targetDestinations =
      appliedFilters?.destinations ?? filters.destinations;
    return targetDestinations
      .map(
        (value) =>
          destinationOptions.find((option) => option.value === value)?.label ??
          value
      )
      .filter(Boolean);
  }, [appliedFilters?.destinations, destinationOptions, filters.destinations]);
  const yearStartLabel =
    appliedFilters?.year_start ?? filters.year_start ?? "-";
  const yearEndLabel = appliedFilters?.year_end ?? filters.year_end ?? "-";

  React.useEffect(() => {
    if (reportQuery.isFetching && reportParams) {
      if (!loadingToastIdRef.current) {
        loadingToastIdRef.current = toast({
          title: "Memuat laporan Kerjasama Perdagangan",
          description: `Mengambil data untuk ${originLabel} -> ${destinationSummary}.`,
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
    destinationSummary,
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
      description:
        "Data kerjasama perdagangan memerlukan sesi login yang aktif.",
      tone: "warning"
    });
  }, [hasUnauthorizedError, toast]);

  React.useEffect(() => {
    if (!reportQuery.isError || hasUnauthorizedError) return;

    toast({
      title: "Gagal memuat laporan Kerjasama Perdagangan",
      description:
        reportQuery.error instanceof Error
          ? reportQuery.error.message
          : "Terjadi kesalahan saat mengambil data kerjasama perdagangan.",
      tone: "error"
    });
  }, [hasUnauthorizedError, reportQuery.error, reportQuery.isError, toast]);

  const getCountryAlpha2 = React.useCallback(
    (option: { value: string }) =>
      countryOptions.find((item) => item.value === option.value)?.alpha2 ??
      null,
    [countryOptions]
  );

  const handleDownload = React.useCallback(
    async (type: "snapshot-word" | "snapshot-pdf") => {
      if (!reportParams) return;

      const filenameBase =
        type === "snapshot-word"
          ? `Snapshot_Kerjasama_Perdagangan_${reportParams.origin}.docx`
          : `Snapshot_Kerjasama_Perdagangan_${reportParams.origin}.pdf`;

      const loadingId = toast({
        title:
          type === "snapshot-word"
            ? "Menyiapkan snapshot Word"
            : "Menyiapkan snapshot PDF",
        description: `Laporan kerjasama perdagangan untuk ${originLabel} sedang diproses...`,
        tone: "loading",
        durationMs: null
      });

      setDownloadLoadingKey(type);

      try {
        const result =
          type === "snapshot-word"
            ? await downloadKerjasamaPerdaganganSnapshotWord(
                reportParams,
                filenameBase
              )
            : await downloadKerjasamaPerdaganganSnapshotPdf(
                reportParams,
                filenameBase
              );

        const fallbackExtension = type === "snapshot-word" ? ".docx" : ".pdf";

        saveAs(
          result.blob,
          result.filename.toLowerCase().endsWith(fallbackExtension)
            ? result.filename
            : `${result.filename}${fallbackExtension}`
        );

        dismiss(loadingId);
        toast({
          title:
            type === "snapshot-word"
              ? "Snapshot Word berhasil diunduh"
              : "Snapshot PDF berhasil diunduh",
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
    [dismiss, originLabel, reportParams, toast]
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-report-generator-kerjasama-tour="page-title">
          <PageTitle
            title="Report Generator Kerjasama Perdagangan"
            description="Ringkas arus perdagangan per pasangan negara, rentang tahun, dan metrik ekspor-impor dalam satu alur generator laporan yang lebih terstruktur."
          />
        </div>
        <div data-report-generator-kerjasama-tour="info-banner">
          <ReportGeneratorInfoBanner
            sectorLabel="kerjasama perdagangan"
            description="Generator ini disiapkan untuk merangkum dinamika kerjasama perdagangan, tren per tahun, dan snapshot metrik utama dalam format laporan yang lebih terarah."
          />
        </div>
        <div data-report-generator-kerjasama-tour="filters-panel">
          <KerjasamaPerdaganganFiltersPanel
            value={filters}
            onChange={setFilters}
            onSubmit={(next) => {
              setSubmitted(true);
              if (
                !next.origin ||
                next.destinations.length === 0 ||
                !next.sumber ||
                !next.year_start ||
                !next.year_end
              )
                return;
              setAppliedFilters(next);
            }}
            onReset={() => {
              setFilters({
                ...DEFAULT_FILTERS,
                origin: filters.origin || "IDN",
                sumber: sourceOptions[0]?.value ?? null,
                year_start:
                  yearOptions[yearOptions.length - 2]?.value ??
                  yearOptions[yearOptions.length - 1]?.value ??
                  null,
                year_end: yearOptions[yearOptions.length - 1]?.value ?? null
              });
              setAppliedFilters(null);
              setSubmitted(false);
            }}
            originOptions={originOptions}
            destinationOptions={destinationOptions}
            sourceOptions={sourceOptions}
            yearStartOptions={yearOptions.filter(
              (option) =>
                !filters.year_end ||
                Number(option.value) <= Number(filters.year_end)
            )}
            yearEndOptions={yearOptions.filter(
              (option) =>
                !filters.year_start ||
                Number(option.value) >= Number(filters.year_start)
            )}
            badge={filterBadge}
            loading={reportQuery.isLoading || reportQuery.isFetching}
            submitted={submitted}
            getCountryAlpha2={getCountryAlpha2}
          />
        </div>
        <div data-report-generator-kerjasama-tour="result-card">
          {hasUnauthorizedError ? (
            <UnauthorizedAccessNotice
              title="Laporan kerjasama perdagangan memerlukan sesi login yang aktif"
              body="Masuk ke sistem untuk melihat data laporan, menyusun pasangan negara, dan mengunduh snapshot."
            />
          ) : (
            <KerjasamaPerdaganganTableCard
              data={reportQuery.data?.data ?? []}
              loading={reportQuery.isLoading || reportQuery.isFetching}
              originLabel={originLabel}
              originItems={originItems}
              destinationSummary={destinationSummary}
              destinationItems={destinationItems}
              sourceLabel={sourceLabel}
              yearStartLabel={yearStartLabel}
              yearEndLabel={yearEndLabel}
              onDownloadSnapshotWord={
                reportParams
                  ? () => void handleDownload("snapshot-word")
                  : undefined
              }
              onDownloadSnapshotPdf={
                reportParams
                  ? () => void handleDownload("snapshot-pdf")
                  : undefined
              }
              downloadLoadingKey={downloadLoadingKey}
            />
          )}
        </div>
      </div>
      <GuidedTour
        steps={KERJASAMA_PERDAGANGAN_TOUR_STEPS}
        storageKey="side-report-generator-kerjasama-perdagangan-tour-completed"
      />
    </div>
  );
}
