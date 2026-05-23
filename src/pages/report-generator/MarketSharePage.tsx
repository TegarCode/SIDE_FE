import React from "react";
import { saveAs } from "file-saver";
import { APP_NAME } from "@/constants/app";
import {
  MarketShareFiltersPanel,
  MARKET_SHARE_STRATEGY_OPTIONS,
  type MarketShareFilterValue
} from "@/components/report-generator/MarketShareFiltersPanel";
import { ReportGeneratorInfoBanner } from "@/components/report-generator/ReportGeneratorInfoBanner";
import { MarketShareTableCard } from "@/components/report-generator/MarketShareTableCard";
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
import { useCountryGroupsQuery } from "@/hooks/indonesia/useCountryGeoQueries";
import { useMarketShareReportQuery } from "@/hooks/report-generator/useMarketShareReportQuery";
import {
  downloadMarketShareSnapshotPdf,
  downloadMarketShareSnapshotWord
} from "@/service/report-generator/marketShare";
import { isUnauthorizedApiError } from "@/utils/apiError";

const MARKET_SHARE_TOUR_STEPS: GuidedTourStep[] = [
  {
    selector: '[data-report-generator-market-share-tour="page-title"]',
    title: "Judul halaman",
    description:
      "Halaman ini dipakai untuk menyusun laporan market share berdasarkan tujuan, strategi perdagangan, top produk, sumber, dan tahun."
  },
  {
    selector: '[data-report-generator-market-share-tour="info-banner"]',
    title: "Informasi generator",
    description:
      "Banner ini menjelaskan cakupan laporan market share sebelum Anda menerapkan filter."
  },
  {
    selector: '[data-report-generator-market-share-tour="filters-panel"]',
    title: "Panel filter",
    description:
      "Pilih tujuan, strategi, jumlah top produk, sumber data, dan tahun, lalu terapkan filter untuk memuat laporan."
  },
  {
    selector: '[data-report-generator-market-share-tour="result-card"]',
    title: "Hasil laporan",
    description:
      "Bagian ini menampilkan hasil laporan market share dan menyediakan aksi unduh snapshot Word atau PDF sesuai filter yang aktif."
  }
];

const DEFAULT_FILTERS: MarketShareFilterValue = {
  origin: "IDN",
  destination: null,
  strategy1: null,
  top_n: null,
  sumber: null,
  year: null
};

export function ReportGeneratorMarketSharePage() {
  useDocumentTitle(`Report Generator Market Share | ${APP_NAME}`);

  const { toast, dismiss } = useToast();
  const countriesQuery = useDataGeneratorTradeCountriesQuery();
  const groupsQuery = useCountryGroupsQuery();
  const sourcesQuery = useDataGeneratorTradeSourcesQuery();
  const yearsQuery = useDataGeneratorTradeYearsQuery();

  const [filters, setFilters] =
    React.useState<MarketShareFilterValue>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    React.useState<MarketShareFilterValue | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [downloadLoadingKey, setDownloadLoadingKey] = React.useState<
    "snapshot-word" | "snapshot-pdf" | null
  >(null);
  const loadingToastIdRef = React.useRef<string | null>(null);

  const originOptions = React.useMemo(
    () =>
      (countriesQuery.data ?? [])
        .map((item) => ({ value: item.value, label: item.label }))
        .sort((left, right) => left.label.localeCompare(right.label, "id")),
    [countriesQuery.data]
  );

  const destinationOptions = React.useMemo(() => {
    const groups = (groupsQuery.data ?? []).map((item) => ({
      value: item.value,
      label: item.label,
      tipe: item.tipe?.toLowerCase() ?? ""
    }));

    const sortedGroups = groups.sort((left, right) => {
      const leftPriority = left.tipe.includes("benua") ? 0 : 1;
      const rightPriority = right.tipe.includes("benua") ? 0 : 1;

      if (leftPriority !== rightPriority) return leftPriority - rightPriority;
      return left.label.localeCompare(right.label, "id");
    });

    return [
      { value: "ALL", label: "Dunia (Semua Negara/Entitas)" },
      ...sortedGroups.map((item) => ({ value: item.value, label: item.label }))
    ];
  }, [groupsQuery.data]);

  const sourceOptions = React.useMemo(
    () =>
      (sourcesQuery.data ?? [])
        .map((item) => ({ value: item.value, label: item.label }))
        .sort((left, right) => left.label.localeCompare(right.label, "id")),
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
    if (yearOptions.length === 0) return;
    if (filters.year) return;
    setFilters((current) => ({
      ...current,
      year: yearOptions[yearOptions.length - 1]?.value ?? null
    }));
  }, [filters.year, yearOptions]);

  const filterBadge = React.useMemo(() => {
    if (!appliedFilters) return "Filter belum diterapkan";
    return JSON.stringify(filters) === JSON.stringify(appliedFilters)
      ? "Filter Aktif"
      : "Filter belum diterapkan";
  }, [appliedFilters, filters]);

  const reportParams = React.useMemo(() => {
    if (
      !appliedFilters?.destination ||
      !appliedFilters.strategy1 ||
      !appliedFilters.top_n ||
      !appliedFilters.sumber ||
      !appliedFilters.year
    ) {
      return null;
    }

    return {
      origin: appliedFilters.origin,
      destination: appliedFilters.destination,
      strategy1: appliedFilters.strategy1,
      top_n: appliedFilters.top_n,
      sumber: appliedFilters.sumber,
      year: appliedFilters.year
    };
  }, [appliedFilters]);

  const reportQuery = useMarketShareReportQuery(reportParams);
  const hasUnauthorizedError = React.useMemo(
    () =>
      [
        countriesQuery.error,
        groupsQuery.error,
        sourcesQuery.error,
        yearsQuery.error,
        reportQuery.error
      ].some((error) => isUnauthorizedApiError(error)),
    [
      countriesQuery.error,
      groupsQuery.error,
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
  const destinationLabel = React.useMemo(
    () =>
      destinationOptions.find(
        (option) =>
          option.value ===
          (appliedFilters?.destination ?? filters.destination ?? "")
      )?.label ?? "Group Tujuan",
    [appliedFilters?.destination, destinationOptions, filters.destination]
  );
  const tradeTypeLabel = React.useMemo(
    () =>
      MARKET_SHARE_STRATEGY_OPTIONS.find(
        (option) =>
          option.value === (appliedFilters?.strategy1 ?? filters.strategy1)
      )?.label ?? "Tipe Perdagangan",
    [appliedFilters?.strategy1, filters.strategy1]
  );
  const topProductLabel = React.useMemo(() => {
    const value = appliedFilters?.top_n ?? filters.top_n;
    if (!value) return "Top Produk";
    return `Top ${value} Produk`;
  }, [appliedFilters?.top_n, filters.top_n]);
  const yearLabel = React.useMemo(
    () =>
      yearOptions.find(
        (option) =>
          option.value === (appliedFilters?.year ?? filters.year ?? "")
      )?.label ?? "Tahun Perdagangan",
    [appliedFilters?.year, filters.year, yearOptions]
  );
  const sourceLabel = React.useMemo(() => {
    const fromMeta = reportQuery.data?.meta?.sumber;
    if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta;
    return (
      sourceOptions.find(
        (option) =>
          option.value === (appliedFilters?.sumber ?? filters.sumber ?? "")
      )?.label ?? "-"
    );
  }, [
    appliedFilters?.sumber,
    filters.sumber,
    reportQuery.data?.meta,
    sourceOptions
  ]);

  React.useEffect(() => {
    if (reportQuery.isFetching && reportParams) {
      if (!loadingToastIdRef.current) {
        loadingToastIdRef.current = toast({
          title: "Memuat laporan Market Share",
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
      description: "Data market share memerlukan sesi login yang aktif.",
      tone: "warning"
    });
  }, [hasUnauthorizedError, toast]);

  React.useEffect(() => {
    if (!reportQuery.isError || hasUnauthorizedError) return;

    toast({
      title: "Gagal memuat laporan Market Share",
      description:
        reportQuery.error instanceof Error
          ? reportQuery.error.message
          : "Terjadi kesalahan saat mengambil data market share.",
      tone: "error"
    });
  }, [hasUnauthorizedError, reportQuery.error, reportQuery.isError, toast]);

  const handleDownload = React.useCallback(
    async (type: "snapshot-word" | "snapshot-pdf") => {
      if (!reportParams) return;

      const filenameBase =
        type === "snapshot-word"
          ? `Snapshot_Market_Share_${reportParams.origin}_${reportParams.destination}.docx`
          : `Snapshot_Market_Share_${reportParams.origin}_${reportParams.destination}.pdf`;

      const loadingId = toast({
        title:
          type === "snapshot-word"
            ? "Menyiapkan snapshot Word"
            : "Menyiapkan snapshot PDF",
        description: `Laporan market share untuk ${originLabel} -> ${destinationLabel} sedang diproses...`,
        tone: "loading",
        durationMs: null
      });

      setDownloadLoadingKey(type);

      try {
        const result =
          type === "snapshot-word"
            ? await downloadMarketShareSnapshotWord(reportParams, filenameBase)
            : await downloadMarketShareSnapshotPdf(reportParams, filenameBase);

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
    [destinationLabel, dismiss, originLabel, reportParams, toast]
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="space-y-6 px-4 py-6 lg:px-8">
        <div data-report-generator-market-share-tour="page-title">
          <PageTitle
            title="Report Generator Market Share"
            description="Susun laporan pangsa pasar produk atau group tujuan lengkap dengan pembacaan tren, posisi perdagangan, dan komposisi produk utama."
          />
        </div>
        <div data-report-generator-market-share-tour="info-banner">
          <ReportGeneratorInfoBanner
            sectorLabel="market share"
            description="Generator ini membantu menyiapkan laporan market share secara lebih sistematis sebelum masuk ke tahap rangkuman, visualisasi, atau ekspor dokumen."
          />
        </div>
        <div data-report-generator-market-share-tour="filters-panel">
          <MarketShareFiltersPanel
            value={filters}
            onChange={setFilters}
            onSubmit={(next) => {
              setSubmitted(true);
              if (
                !next.destination ||
                !next.strategy1 ||
                !next.top_n ||
                !next.sumber ||
                !next.year
              )
                return;
              setAppliedFilters(next);
            }}
            onReset={() => {
              setFilters({
                ...DEFAULT_FILTERS,
                origin: filters.origin,
                year: yearOptions[yearOptions.length - 1]?.value ?? null
              });
              setAppliedFilters(null);
              setSubmitted(false);
            }}
            originOptions={originOptions}
            destinationOptions={destinationOptions}
            sourceOptions={sourceOptions}
            yearOptions={yearOptions}
            badge={filterBadge}
            loading={reportQuery.isLoading || reportQuery.isFetching}
            submitted={submitted}
          />
        </div>
        <div data-report-generator-market-share-tour="result-card">
          {hasUnauthorizedError ? (
            <UnauthorizedAccessNotice
              title="Laporan market share memerlukan sesi login yang aktif"
              body="Masuk ke sistem untuk melihat data laporan, memproses filter, dan mengunduh snapshot."
            />
          ) : (
            <MarketShareTableCard
              data={reportQuery.data?.data ?? []}
              loading={reportQuery.isLoading || reportQuery.isFetching}
              originLabel={originLabel}
              destinationLabel={destinationLabel}
              tradeTypeLabel={tradeTypeLabel}
              topProductLabel={topProductLabel}
              yearLabel={yearLabel}
              sourceLabel={sourceLabel}
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
        steps={MARKET_SHARE_TOUR_STEPS}
        storageKey="side-report-generator-market-share-tour-completed"
      />
    </div>
  );
}
